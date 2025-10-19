import { internalMutation, mutation } from "./_generated/server";
import { v } from "convex/values";
import { MutationCtx } from "./_generated/server";

/**
 * Helper function to ensure user exists in database.
 * Creates user if not found.
 */
async function ensureUserExists(
  ctx: MutationCtx,
  clerkId: string,
  additionalData?: { email?: string; name?: string; profileImage?: string },
) {
  let user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
    .first();

  if (!user) {
    console.log(`User ${clerkId} not found, creating automatically...`);
    const userId = await ctx.db.insert("users", {
      clerkId,
      email: additionalData?.email || "unknown@example.com",
      name: additionalData?.name || "User",
      profileImage: additionalData?.profileImage,
    });

    user = await ctx.db.get(userId);
    console.log(`User ${clerkId} created automatically.`);
  }

  return user;
}

/**
 * Saves image details to the Convex database. Called by `uploadImage` action.
 */
export const saveImageDetailsToDb = internalMutation({
  args: {
    clerkId: v.string(),
    cloudinaryPublicId: v.string(),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    // Ensure user exists (create if not)
    const user = await ensureUserExists(ctx, args.clerkId);

    if (!user) {
      console.error(`Failed to create/find user: ${args.clerkId}`);
      return null;
    }

    const newImageId = await ctx.db.insert("images", {
      userId: user._id,
      clerkId: args.clerkId,
      cloudinaryPublicId: args.cloudinaryPublicId,
      url: args.url,
      createdAt: Date.now(),
    });

    console.log(`Image saved for user ${args.clerkId}`);
    return newImageId;
  },
});

/**
 * Saves video details to the Convex database. Called by `uploadVideo` action.
 */
export const saveVideoDetailsToDb = internalMutation({
  args: {
    clerkId: v.string(),
    cloudinaryPublicId: v.string(),
    url: v.string(),
    title: v.string(),
    description: v.string(),
    originalSize: v.number(),
    duration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Ensure user exists (create if not)
    const user = await ensureUserExists(ctx, args.clerkId);

    if (!user) {
      console.error(`Failed to create/find user: ${args.clerkId}`);
      return null;
    }

    const newVideoId = await ctx.db.insert("videos", {
      userId: user._id,
      clerkId: args.clerkId,
      cloudinaryPublicId: args.cloudinaryPublicId,
      url: args.url,
      title: args.title,
      description: args.description,
      originalSize: args.originalSize,
      duration: args.duration,
      createdAt: Date.now(),
    });

    console.log(`Video saved for user ${args.clerkId}`);
    return newVideoId;
  },
});

// Public mutation to save a transformed image variant for the current user
export const saveImageVariant = mutation({
  args: {
    cloudinaryPublicId: v.string(),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: Must be logged in to save variants.");
    }

    const user = await ensureUserExists(ctx, identity.subject);
    if (!user) return null;

    const newImageId = await ctx.db.insert("images", {
      userId: user._id,
      clerkId: identity.subject,
      cloudinaryPublicId: args.cloudinaryPublicId,
      url: args.url,
      createdAt: Date.now(),
    });

    return newImageId;
  },
});
