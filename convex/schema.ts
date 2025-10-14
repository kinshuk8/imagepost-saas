import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        clerkId: v.string(),
        email: v.string(),
        name: v.string(),
        profileImage: v.optional(v.string())
    }).index("by_clerkId", ["clerkId"]),
    images: defineTable({
        userId: v.id("users"),
        clerkId: v.string(),
        cloudinaryPublicId: v.string(),
        url: v.string(),
        createdAt: v.number()
    }).index("by_userId", ["userId"]),
    videos: defineTable({
    userId: v.id("users"), // Link to Convex User ID
    clerkId: v.string(), // Clerk user ID
    cloudinaryPublicId: v.string(),
    url: v.string(), // Secure URL from Cloudinary
    title: v.string(),
    description: v.string(),
    originalSize: v.number(), // Store as number, not string
    duration: v.optional(v.number()), // Video duration from Cloudinary
    createdAt: v.number(),
    // Add any other video-specific metadata
  }).index("by_userId", ["userId"]),
});