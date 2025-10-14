"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { v2 as cloudinary } from 'cloudinary';

// This explicitly imports Buffer, required for Node.js actions
import { Buffer } from 'buffer';

// IMPORTANT: Import the 'internal' object for calling internal functions
import { internal } from "./_generated/api";
// --- Cloudinary Configuration ---
// Ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
// are set in your Convex Dashboard Environment Variables.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
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
      }
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
    const base64Data = base64File.split(',')[1];
    if (!base64Data) {
      throw new Error("Invalid base64 file data.");
    }
    const buffer = Buffer.from(base64Data, 'base64');

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
      console.error("Convex Image Upload failed (Cloudinary step):", error instanceof Error ? error.message : error);
      throw new Error(`Image upload failed: ${error instanceof Error ? error.message : error}`);
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
  handler: async (ctx, { base64File, title, description, originalSize }) => {
    // 1. Authenticate User (in the action)
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: Must be logged in to upload video.");
    }

    // 2. Convert base64 string to buffer
    const base64Data = base64File.split(',')[1];
    if (!base64Data) {
      throw new Error("Invalid base64 file data.");
    }
    const buffer = Buffer.from(base64Data, 'base64');

    // 3. Prepare Cloudinary Upload Options
    const options = {
      resource_type: "video",
      folder: `user_uploads/${identity.subject}/videos`, // Organize by user and type
      use_filename: true,
      unique_filename: true,
      overwrite: false,
      transformation: [
        {quality: "auto", fetch_format: "mp4"} // Your original transformation
      ]
    };

    // 4. Upload to Cloudinary
    let result: CloudinaryUploadResult;
    try {
      result = await uploadBufferToCloudinary(buffer, options);
      console.log("Cloudinary Upload Result (Video):", result);
    } catch (error: unknown) {
      console.error("Convex Video Upload failed (Cloudinary step):", error instanceof Error ? error.message : error);
      throw new Error(`Video upload failed: ${error instanceof Error ? error.message : error}`);
    }

    // 5. Trigger an internal mutation to save details to the Convex database
    // Use 'internal.media' to call internal functions from an action
    await ctx.runMutation(internal.mutations.saveVideoDetailsToDb, {
      clerkId: identity.subject,
      cloudinaryPublicId: result.public_id,
      url: result.secure_url,
      title,
      description,
      originalSize,
      duration: result.duration,
    });

    return {
      publicId: result.public_id,
      url: result.secure_url,
    };
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
      console.error("Cloudinary Get Asset Info Error in action:", error instanceof Error ? error.message : error);
      return null;
    }
  },
});
