"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { v2 as cloudinary } from "cloudinary";
import { buildSocialShareTransforms, SOCIAL_PRESETS, type SocialPreset } from "./lib/cloudinaryTransforms";

// Configure Cloudinary via Convex environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const generateSocialShareTransforms = action({
  args: {
    publicId: v.string(),
    preset: v.optional(v.string()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    aspectRatio: v.optional(v.string()),
    baseWidth: v.optional(v.number()),
    aiBackgroundFill: v.optional(v.boolean()),
    format: v.optional(v.string()),
    quality: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    // Basic auth is not strictly required for URL generation, but you can add it as needed.
    // Validation: make sure only one of preset | (width & height) | aspectRatio is provided
    try {
      const { publicId } = args;
      if (!publicId) throw new Error("Missing required 'publicId'.");

      const provided = [
        args.preset ? 1 : 0,
        typeof args.width === "number" && typeof args.height === "number" ? 1 : 0,
        args.aspectRatio ? 1 : 0,
      ].reduce((a, b) => a + b, 0);

      if (provided === 0) {
        throw new Error("Provide either 'preset', 'width & height', or 'aspectRatio'.");
      }
      if (provided > 1) {
        throw new Error("Provide only one of 'preset', 'width & height', or 'aspectRatio' (not multiple at once).");
      }

      // If preset provided, confirm it is known to the helper
      if (args.preset && !(args.preset in SOCIAL_PRESETS)) {
        const keys = Object.keys(SOCIAL_PRESETS).join(", ");
        throw new Error(`Unknown preset '${args.preset}'. Valid presets: ${keys}`);
      }

      const transforms = buildSocialShareTransforms({
        preset: args.preset as SocialPreset | undefined,
        width: args.width,
        height: args.height,
        aspectRatio: args.aspectRatio,
        baseWidth: args.baseWidth,
        aiBackgroundFill: args.aiBackgroundFill ?? false,
        format: args.format ?? "auto",
        quality: args.quality ?? "auto",
      });

      const previewUrl = cloudinary.url(args.publicId, {
        transformation: transforms.preview,
        secure: true,
        sign_url: false, // use unsigned transformation signature
      });

      const exportUrl = cloudinary.url(args.publicId, {
        transformation: transforms.export,
        secure: true,
        sign_url: false, // use unsigned transformation signature
      });

      return {
        previewUrl,
        exportUrl,
        width: transforms.width,
        height: transforms.height,
        aspectRatio: transforms.aspectRatio,
      };
    } catch (error) {
      console.error("[generateSocialShareTransforms] Error:", error);
      const msg = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to generate social-share transforms: ${msg}`);
    }
  },
});
