import { query } from "./_generated/server";

/**
 * Fetches all images for the currently authenticated user.
 */
export const getImagesForUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return []; // Return empty array if not authenticated
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return []; // Return empty array if user not found in Convex DB
    }

    return await ctx.db
      .query("images")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
  },
});

/**
 * Fetches all videos for the currently authenticated user.
 */
export const getVideosForUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return []; // Return empty array if not authenticated
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return []; // Return empty array if user not found in Convex DB
    }

    return await ctx.db
      .query("videos")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
  },
});
