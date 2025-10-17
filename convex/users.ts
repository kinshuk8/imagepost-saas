import { mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Creates or updates a user in the database.
 * Called by Clerk webhook when a user signs up or updates their profile.
 */
export const createUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    profileImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name,
        profileImage: args.profileImage,
      });
      console.log(`User ${args.clerkId} updated in Convex.`);
      return existingUser._id;
    } else {
      // Create new user
      const userId = await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email: args.email,
        name: args.name,
        profileImage: args.profileImage,
      });
      console.log(`User ${args.clerkId} created in Convex.`);
      return userId;
    }
  },
});

/**
 * Deletes a user by their Clerk ID.
 * Called by Clerk webhook when a user is deleted.
 */
export const deleteUserByClerkId = internalMutation({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      await ctx.db.delete(existingUser._id);
      console.log(`User ${args.clerkId} deleted from Convex.`);
      return { success: true };
    } else {
      console.warn(`User ${args.clerkId} not found for deletion.`);
      return { success: false };
    }
  },
});

/**
 * Gets a user by their Clerk ID.
 */
export const getUserByClerkId = mutation({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});
