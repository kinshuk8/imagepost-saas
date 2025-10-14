import { WebhookEvent } from "@clerk/nextjs/server";
import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";

export async function POST(req: Request) {
    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response("Error occurred -- no svix headers", {
            status: 400,
        });
    }

    const payload = await req.json();
    const body = JSON.stringify(payload);

    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        console.error("CLERK_WEBHOOK_SECRET is not set.");
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
    } catch (error) {
        console.error("Error verifying webhook: ", error);
        return new Response("Error occured -- webhook could not be verified", {
            status: 400,
        });
    }

    const { id } = event.data;
    const eventType = event.type;

    console.log(`Clerk Webhook Received: ${eventType} for using user ID ${id}`);

    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

    if (eventType === "user.created" || eventType === "user.updated") {
        const { id, email_addresses, first_name, last_name, image_url } = event.data;
        const primaryEmail = email_addresses.find(email => email.id === event.data.primary_email_address_id)?.email_address || email_addresses[0]?.email_address;

        if (!primaryEmail) {
            console.warn(`User ${id} has no primary email address.`);
            return new Response("No primary email address found", { status: 400 });
        }

        await convex.mutation(api.users.createUser, {
            clerkId: id,
            email: primaryEmail,
            name: `${first_name || ""} ${last_name || ""}`.trim() || primaryEmail,
            profileImage: image_url,
        });

        console.log(`User ${id} (${primaryEmail}) upserted in Convex.`);
        return new Response("User processed", { status: 200 });
    }
    if (eventType === "user.deleted") {
        const { id } = event.data;
        if (id) {
            console.log(`User ${id} marked for deletion in Convex;.`);
        }
        return new NextResponse("User deletion event received", { status: 200});
    }
    console.log(`Webhook event type ${eventType} not explicitly handled.`);
    return new NextResponse("Webhook received but not handled", { status: 200 });
}
