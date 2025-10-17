import { WebhookEvent } from "@clerk/nextjs/server";
import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";

export async function POST(req: Request) {
  console.log("[WEBHOOK] Clerk webhook received");

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("[WEBHOOK] Missing svix headers");
    return new Response("Error occurred -- no svix headers", {
      status: 400,
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error(
      "[WEBHOOK] CLERK_WEBHOOK_SECRET is not set in environment variables",
    );
    return new NextResponse("Missing CLERK_WEBHOOK_SECRET", { status: 500 });
  }

  const webhook = new Webhook(WEBHOOK_SECRET);
  let event: WebhookEvent;

  try {
    event = webhook.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
    console.log("[WEBHOOK] Webhook verified successfully");
  } catch (error) {
    console.error("[WEBHOOK] Error verifying webhook:", error);
    return new Response("Error occurred -- webhook could not be verified", {
      status: 400,
    });
  }

  const { id } = event.data;
  const eventType = event.type;

  console.log(`[WEBHOOK] Processing event: ${eventType} for user ID: ${id}`);

  const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!CONVEX_URL) {
    console.error("[WEBHOOK] NEXT_PUBLIC_CONVEX_URL is not set");
    return new NextResponse("Missing NEXT_PUBLIC_CONVEX_URL", { status: 500 });
  }

  const convex = new ConvexHttpClient(CONVEX_URL);

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } =
      event.data;

    console.log(
      `[WEBHOOK] User data - ID: ${id}, First: ${first_name}, Last: ${last_name}`,
    );

    const primaryEmail =
      email_addresses.find(
        (email) => email.id === event.data.primary_email_address_id,
      )?.email_address || email_addresses[0]?.email_address;

    if (!primaryEmail) {
      console.error(`[WEBHOOK] User ${id} has no primary email address`);
      return new Response("No primary email address found", { status: 400 });
    }

    console.log(`[WEBHOOK] Primary email: ${primaryEmail}`);

    try {
      const result = await convex.mutation(api.users.createUser, {
        clerkId: id,
        email: primaryEmail,
        name: `${first_name || ""} ${last_name || ""}`.trim() || primaryEmail,
        profileImage: image_url,
      });

      console.log(
        `[WEBHOOK] ✅ User ${id} (${primaryEmail}) successfully upserted in Convex. Result:`,
        result,
      );
      return new Response("User processed successfully", { status: 200 });
    } catch (error) {
      console.error(`[WEBHOOK] ❌ Error saving user to Convex:`, error);
      return new Response("Error saving user to Convex", { status: 500 });
    }
  }

  if (eventType === "user.deleted") {
    const { id } = event.data;
    console.log(`[WEBHOOK] User ${id} marked for deletion`);
    // Note: Not calling deleteUserByClerkId because it's an internal mutation
    return new NextResponse("User deletion event received", { status: 200 });
  }

  console.log(`[WEBHOOK] Event type ${eventType} not explicitly handled`);
  return new NextResponse("Webhook received but not handled", { status: 200 });
}
