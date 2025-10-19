"use client";

import React, { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { Upload, CheckCircle2, AlertCircle } from "lucide-react";

export default function VideoUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const router = useRouter();
  const uploadVideo = useAction(api.media.uploadVideo);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit (Convex Node action limit)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) return;

    const selectedFile = file;

    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage(
        `File size too large. Please select a video under ${MAX_FILE_SIZE / (1024 * 1024)} MB.`,
      );
      setUploadStatus("error");
      return;
    }

    setIsUploading(true);
    setUploadStatus("idle");
    setErrorMessage("");

    try {
      // Convert file to base64
      const reader = new FileReader();

      reader.onerror = () => {
        setErrorMessage("Failed to read file. Please try again.");
        setUploadStatus("error");
        setIsUploading(false);
      };

      reader.onload = async () => {
        try {
          const base64File = reader.result as string;

          // Add timeout for large uploads
          const uploadPromise = uploadVideo({
            base64File,
            fileName: selectedFile.name,
            title,
            description,
            originalSize: file.size,
          });

          // Set a 2-minute timeout
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(
              () =>
                reject(
                  new Error(
                    "Upload timeout - file may be too large or connection is slow",
                  ),
                ),
              120000,
            ),
          );

          await Promise.race([uploadPromise, timeoutPromise]);

          setUploadStatus("success");

          // Redirect after a short delay to show success state
          setTimeout(() => {
            router.push("/home");
          }, 1000);
        } catch (error) {
          console.error("Upload error:", error);
          const errorMsg =
            error instanceof Error
              ? error.message
              : "Failed to upload video. Please try again.";

          // Provide specific error messages based on error type
          if (errorMsg.includes("timeout")) {
            setErrorMessage(
              "Upload timed out. Please try a smaller file or check your internet connection.",
            );
          } else if (
            errorMsg.includes("too large") ||
            errorMsg.includes("5 MiB")
          ) {
            setErrorMessage(
              "File is too large for upload. Please compress your video to under 5 MB. See compression tips below.",
            );
          } else {
            setErrorMessage(errorMsg);
          }
          setUploadStatus("error");
          setIsUploading(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("Failed to process video. Please try again.");
      setUploadStatus("error");
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setUploadStatus("idle");
    setErrorMessage("");
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Upload Video</h1>

      <Card>
        <CardHeader>
          <CardTitle>Video Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter video title"
                required
                disabled={isUploading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter video description (optional)"
                rows={4}
                disabled={isUploading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="video-file">
                Video File (max {MAX_FILE_SIZE / (1024 * 1024)} MB)
              </Label>
              <Input
                id="video-file"
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="cursor-pointer"
                required
                disabled={isUploading}
              />
              {file && (
                <p className="text-sm text-muted-foreground">
                  Selected: {file.name} (
                  {(file.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              )}
            </div>

            {/* Error Message */}
            {uploadStatus === "error" && errorMessage && (
              <div className="flex items-start gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive">
                    Upload Failed
                  </p>
                  <p className="text-sm text-destructive/90 mt-1">
                    {errorMessage}
                  </p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {uploadStatus === "success" && (
              <div className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <p className="text-sm font-medium text-green-600">
                  Video uploaded successfully! Redirecting...
                </p>
              </div>
            )}

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center gap-3">
                  <Spinner size="md" />
                  <p className="text-sm font-medium">
                    Uploading video to Cloudinary...
                  </p>
                </div>
                <Progress value={100} className="w-full animate-pulse" />
                <p className="text-xs text-muted-foreground text-center">
                  This may take a moment depending on your file size
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isUploading || uploadStatus === "success"}
            >
              {isUploading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Uploading...
                </>
              ) : uploadStatus === "success" ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Uploaded!
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Video
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="mt-6 bg-muted/50">
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-2">Upload Tips</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Maximum file size: 5 MB (Convex limitation)</li>
            <li>• Supported formats: MP4, MOV, AVI, WebM</li>
            <li>• Videos are automatically optimized by Cloudinary</li>
          </ul>
        </CardContent>
      </Card>

      {/* Compression Guide Card */}
      <Card className="mt-6 border-orange-200 bg-orange-50/50 dark:bg-orange-950/20 dark:border-orange-900">
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-2 flex items-center gap-2 text-orange-900 dark:text-orange-100">
            <AlertCircle className="h-4 w-4" />
            Video Too Large? Compress It First
          </h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">
              Free Compression Tools:
            </p>
            <ul className="space-y-1 ml-4">
              <li>
                • <strong>HandBrake</strong> (Desktop):{" "}
                <a
                  href="https://handbrake.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  handbrake.fr
                </a>
              </li>
              <li>
                • <strong>Clipchamp</strong> (Online):{" "}
                <a
                  href="https://clipchamp.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  clipchamp.com
                </a>
              </li>
              <li>
                • <strong>VideoSmaller</strong> (Online):{" "}
                <a
                  href="https://www.videosmaller.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  videosmaller.com
                </a>
              </li>
            </ul>
            <p className="font-medium text-foreground mt-3">
              Recommended Settings:
            </p>
            <ul className="space-y-1 ml-4">
              <li>• Resolution: 720p (1280x720) or lower</li>
              <li>• Codec: H.264</li>
              <li>• Bitrate: 1-2 Mbps</li>
              <li>• CRF: 23-28 (higher = smaller file)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
