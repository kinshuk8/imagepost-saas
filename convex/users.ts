import { mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const createUser = mutation({
    args: {
        clerkId: v.string(),
        email: v.string(),
        name: v.string(),
        profileImage: v.optional(v.string()),
    },
    handler: async(ctx, args) => {
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
            .first();
        
        if (existingUser) {
            await ctx.db.patch(existingUser._id, {
                email: args.email,
                name: args.name,
                profileImage: args.profileImage,
            });
            return existingUser._id;
        } else {
            const userId = await ctx.db.insert("users", {
                clerkId: args.clerkId,
                email: args.email,
                name: args.name,
                profileImage: args.profileImage,
            });
            return userId;
        }
    },
});

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
        }
    },
});
