import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    profileImage: v.optional(v.string()),
  }).index("by_clerkId", ["clerkId"]),
  images: defineTable({
    userId: v.id("users"),
    clerkId: v.string(),
    cloudinaryPublicId: v.string(),
    url: v.string(),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),
  videos: defineTable({
    userId: v.id("users"),
    clerkId: v.string(),
    cloudinaryPublicId: v.string(),
    url: v.string(),
    title: v.string(),
    description: v.string(),
    originalSize: v.number(),
    duration: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),
});
