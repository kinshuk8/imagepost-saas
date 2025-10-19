"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { v2 as cloudinary } from "cloudinary";

// This explicitly imports Buffer, required for Node.js actions
import { Buffer } from "buffer";

// IMPORTANT: Import the 'internal' object for calling internal functions
import { internal } from "./_generated/api";
// --- Cloudinary Configuration ---
// Ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
// are set in your Convex Dashboard Environment Variables.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

interface CloudinaryUploadResult {
  public_id: string;
  bytes?: number;
  duration?: number;
  secure_url: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

// Helper function to upload a buffer to Cloudinary using streams
async function uploadBufferToCloudinary(
  buffer: Buffer,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: any,
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error: Error | undefined, result) => {
        if (error) reject(error);
        else if (result) resolve(result as CloudinaryUploadResult);
        else reject(new Error("Cloudinary upload stream returned no result"));
      },
    );
    uploadStream.end(buffer);
  });
}

// --- Actions (for Cloudinary Uploads - run in Node.js environment) ---

/**
 * Uploads an image (as base64) to Cloudinary and triggers an internal mutation to save its details.
 */
export const uploadImage = action({
  args: {
    base64File: v.string(), // "data:image/jpeg;base64,..."
    fileName: v.string(),
  },
  handler: async (ctx, { base64File }) => {
    // 1. Authenticate User (in the action)
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: Must be logged in to upload image.");
    }

    // 2. Convert base64 string to buffer (Buffer is available in actions)
    const base64Data = base64File.split(",")[1];
    if (!base64Data) {
      throw new Error("Invalid base64 file data.");
    }
    const buffer = Buffer.from(base64Data, "base64");

    // 3. Prepare Cloudinary Upload Options
    const options = {
      folder: `user_uploads/${identity.subject}/images`, // Organize by user and type
      use_filename: true,
      unique_filename: true,
      overwrite: false,
    };

    // 4. Upload to Cloudinary
    let result: CloudinaryUploadResult;
    try {
      result = await uploadBufferToCloudinary(buffer, options);
      console.log("Cloudinary Upload Result (Image):", result);
    } catch (error: unknown) {
      console.error(
        "Convex Image Upload failed (Cloudinary step):",
        error instanceof Error ? error.message : error,
      );
      throw new Error(
        `Image upload failed: ${error instanceof Error ? error.message : error}`,
      );
    }

    // 5. Trigger an internal mutation to save details to the Convex database
    // Use 'internal.media' to call internal functions from an action
    await ctx.runMutation(internal.mutations.saveImageDetailsToDb, {
      clerkId: identity.subject,
      cloudinaryPublicId: result.public_id,
      url: result.secure_url,
    });

    return {
      publicId: result.public_id,
      url: result.secure_url,
    };
  },
});

/**
 * Uploads a video (as base64) to Cloudinary and triggers an internal mutation to save its details.
 */
export const uploadVideo = action({
  args: {
    base64File: v.string(), // "data:video/mp4;base64,..."
    fileName: v.string(),
    title: v.string(),
    description: v.string(),
    originalSize: v.number(), // Ensure this is a number from client-side
  },
  handler: async (
    ctx,
    { base64File, title, description, originalSize, fileName },
  ) => {
    console.log(
      `[VIDEO UPLOAD START] File: ${fileName}, Size: ${originalSize} bytes, Title: ${title}`,
    );

    // 1. Authenticate User (in the action)
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      console.error("[VIDEO UPLOAD] Authentication failed");
      throw new Error("Unauthorized: Must be logged in to upload video.");
    }
    console.log(`[VIDEO UPLOAD] User authenticated: ${identity.subject}`);

    // 2. Convert base64 string to buffer
    const base64Data = base64File.split(",")[1];
    if (!base64Data) {
      console.error("[VIDEO UPLOAD] Invalid base64 data format");
      throw new Error("Invalid base64 file data.");
    }

    try {
      const buffer = Buffer.from(base64Data, "base64");
      console.log(
        `[VIDEO UPLOAD] Buffer created, size: ${buffer.length} bytes`,
      );

      // 3. Prepare Cloudinary Upload Options
      const options = {
        resource_type: "video" as const,
        folder: `user_uploads/${identity.subject}/videos`,
        use_filename: true,
        unique_filename: true,
        overwrite: false,
        timeout: 120000, // 2 minute timeout
        transformation: [{ quality: "auto", fetch_format: "mp4" }],
      };

      console.log(
        `[VIDEO UPLOAD] Starting Cloudinary upload to folder: ${options.folder}`,
      );

      // 4. Upload to Cloudinary
      let result: CloudinaryUploadResult;
      try {
        result = await uploadBufferToCloudinary(buffer, options);
        console.log(
          `[VIDEO UPLOAD] Cloudinary upload successful - Public ID: ${result.public_id}`,
        );
      } catch (error: unknown) {
        console.error("[VIDEO UPLOAD] Cloudinary upload failed:", error);
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        // Provide more specific error messages
        if (
          errorMessage.includes("timeout") ||
          errorMessage.includes("ETIMEDOUT")
        ) {
          throw new Error(
            "Upload timeout - file may be too large. Try a smaller video (under 20MB recommended).",
          );
        } else if (errorMessage.includes("api_key")) {
          throw new Error(
            "Cloudinary configuration error. Please contact support.",
          );
        } else if (errorMessage.includes("Invalid")) {
          throw new Error(
            "Invalid video file format. Please use MP4, MOV, or AVI.",
          );
        }

        throw new Error(`Video upload failed: ${errorMessage}`);
      }

      // 5. Trigger an internal mutation to save details to the Convex database
      console.log(`[VIDEO UPLOAD] Saving to database...`);
      try {
        await ctx.runMutation(internal.mutations.saveVideoDetailsToDb, {
          clerkId: identity.subject,
          cloudinaryPublicId: result.public_id,
          url: result.secure_url,
          title,
          description,
          originalSize,
          duration: result.duration,
        });
        console.log(`[VIDEO UPLOAD] Database save successful`);
      } catch (error) {
        console.error("[VIDEO UPLOAD] Database save failed:", error);
        throw new Error("Failed to save video metadata. Please try again.");
      }

      console.log(`[VIDEO UPLOAD COMPLETE] Success for ${fileName}`);
      return {
        publicId: result.public_id,
        url: result.secure_url,
      };
    } catch (error) {
      console.error("[VIDEO UPLOAD] Unexpected error:", error);
      throw error;
    }
  },
});

// Social image transformation action for server-side URL generation
export const transformSocialImage = action({
  args: {
    publicId: v.string(),
    width: v.number(),
    height: v.number(),
    cropMode: v.optional(v.string()), // "fill" | "pad"
    aiBackgroundFill: v.optional(v.boolean()),
    format: v.optional(v.string()),
    quality: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: Must be logged in to transform images.");
    }

    const crop = args.cropMode ?? (args.aiBackgroundFill ? "pad" : "fill");

    try {
      const url = cloudinary.url(args.publicId, {
        width: args.width,
        height: args.height,
        crop,
        gravity: "auto",
        background: args.aiBackgroundFill ? "auto:predominant" : undefined,
        fetch_format: args.format ?? "auto",
        quality: args.quality ?? "auto",
        secure: true,
      });

      return { url };
    } catch (error) {
      console.error("Cloudinary Transform Error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to generate transform URL",
      );
    }
  },
});

// Optional: If you need to expose Cloudinary asset info from an action
export const getCloudinaryAssetInfo = action({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, { publicId }) => {
    // This action is for fetching existing asset info from Cloudinary.
    // Cloudinary config is at the top of the file, so it's accessible here too.

    // Optional: add authentication if only certain users can view certain asset info
    // const identity = await ctx.auth.getUserIdentity();
    // if (!identity) { throw new Error("Not authenticated"); }

    const options = {
      colors: true, // Example: include color data
    };

    try {
      const result = await cloudinary.api.resource(publicId, options);
      console.log("Cloudinary Asset Info Action:", result);
      return result;
    } catch (error: unknown) {
      console.error(
        "Cloudinary Get Asset Info Error in action:",
        error instanceof Error ? error.message : error,
      );
      return null;
    }
  },
});
