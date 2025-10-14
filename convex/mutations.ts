import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

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
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      console.warn(`Attempted to save image for non-existent user: ${args.clerkId}`);
      return null;
    }

    const newImageId = await ctx.db.insert("images", {
      userId: user._id,
      clerkId: args.clerkId,
      cloudinaryPublicId: args.cloudinaryPublicId,
      url: args.url,
      createdAt: Date.now(),
    });
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
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      console.warn(`Attempted to save video for non-existent user: ${args.clerkId}`);
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
    return newVideoId;
  },
});
