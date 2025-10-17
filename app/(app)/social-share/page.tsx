"use client";

import React, { useState, useEffect, useRef } from "react";
import { CldImage } from "next-cloudinary";
import { useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import {
  Upload,
  Download,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

const socialFormats = {
  "Instagram Square (1:1)": { width: 1080, height: 1080, aspectRatio: "1:1" },
  "Instagram Portrait (4:5)": {
    width: 1080,
    height: 1350,
    aspectRatio: "4:5",
  },
  "Twitter Post (16:9)": { width: 1200, height: 675, aspectRatio: "16:9" },
  "Twitter Header (3:1)": { width: 1500, height: 500, aspectRatio: "3:1" },
  "Facebook Cover (205:78)": {
    width: 820,
    height: 312,
    aspectRatio: "205:78",
  },
};

type SocialFormat = keyof typeof socialFormats;

export default function SocialShare() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<SocialFormat>(
    "Instagram Square (1:1)",
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const imageRef = useRef<HTMLImageElement>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB limit for images

  const uploadImage = useAction(api.media.uploadImage);

  useEffect(() => {
    if (uploadedImage) {
      setIsTransforming(true);
    }
  }, [selectedFormat, uploadedImage]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setUploadStatus("idle");
    setErrorMessage("");
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    if (selectedFile.size > MAX_FILE_SIZE) {
      setErrorMessage(
        `File size too large. Please select an image under ${MAX_FILE_SIZE / (1024 * 1024)} MB.`,
      );
      setUploadStatus("error");
      return;
    }

    setIsUploading(true);
    setUploadStatus("idle");
    setErrorMessage("");

    try {
      const reader = new FileReader();

      reader.onerror = () => {
        setErrorMessage("Failed to read file. Please try again.");
        setUploadStatus("error");
        setIsUploading(false);
      };

      reader.onload = async () => {
        try {
          const base64File = reader.result as string;
          const result = await uploadImage({
            base64File,
            fileName: selectedFile.name,
          });
          setUploadedImage(result.publicId);
          setUploadStatus("success");
        } catch (error) {
          console.error("Error uploading image:", error);
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Failed to upload image. Please try again.",
          );
          setUploadStatus("error");
        } finally {
          setIsUploading(false);
        }
      };

      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error("Error reading file:", error);
      setErrorMessage("Failed to process file. Please try again.");
      setUploadStatus("error");
      setIsUploading(false);
    }
  };

  const handleDownload = async () => {
    if (!imageRef.current) return;

    setIsDownloading(true);

    try {
      const response = await fetch(imageRef.current.src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${selectedFormat.replace(/\s+/g, "_").toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download error:", error);
      setErrorMessage("Failed to download image. Please try again.");
      setUploadStatus("error");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleReset = () => {
    setUploadedImage(null);
    setSelectedFile(null);
    setUploadStatus("idle");
    setErrorMessage("");
    setSelectedFormat("Instagram Square (1:1)");
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Social Media Image Creator</h1>
        <p className="text-muted-foreground">
          Upload an image and transform it for any social media platform
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Upload an Image
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Section */}
          {!uploadedImage && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image-upload">
                  Choose an image file (max 5 MB)
                </Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                  disabled={isUploading}
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {selectedFile.name} (
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
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

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-3">
                    <Spinner size="md" />
                    <p className="text-sm font-medium">
                      Uploading image to Cloudinary...
                    </p>
                  </div>
                  <Progress value={100} className="w-full animate-pulse" />
                </div>
              )}

              {/* Upload Button */}
              <Button
                onClick={handleFileUpload}
                disabled={!selectedFile || isUploading}
                size="lg"
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Image
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Success and Transformation Section */}
          {uploadedImage && (
            <div className="space-y-6">
              {/* Success Message */}
              {uploadStatus === "success" && !errorMessage && (
                <div className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <p className="text-sm font-medium text-green-600">
                    Image uploaded successfully! Now select a format.
                  </p>
                </div>
              )}

              {/* Format Selection */}
              <div>
                <CardTitle className="mb-4 flex items-center gap-2">
                  Select Social Media Format
                </CardTitle>
                <div className="space-y-2">
                  <Label htmlFor="format-select">Format</Label>
                  <Select
                    value={selectedFormat}
                    onValueChange={(value) =>
                      setSelectedFormat(value as SocialFormat)
                    }
                  >
                    <SelectTrigger id="format-select" className="w-full">
                      <SelectValue placeholder="Select a format" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(socialFormats).map((format) => (
                        <SelectItem key={format} value={format}>
                          {format}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Dimensions: {socialFormats[selectedFormat].width} x{" "}
                    {socialFormats[selectedFormat].height} px
                  </p>
                </div>
              </div>

              {/* Preview Section */}
              <div className="relative">
                <h3 className="text-lg font-semibold mb-4">Preview:</h3>
                <div className="flex justify-center relative bg-muted/30 rounded-lg p-4">
                  {isTransforming && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10 rounded-lg">
                      <div className="flex flex-col items-center gap-2">
                        <Spinner size="lg" />
                        <p className="text-sm text-muted-foreground">
                          Transforming image...
                        </p>
                      </div>
                    </div>
                  )}
                  <CldImage
                    width={socialFormats[selectedFormat].width}
                    height={socialFormats[selectedFormat].height}
                    src={uploadedImage}
                    sizes="100vw"
                    alt="transformed image"
                    crop="fill"
                    aspectRatio={socialFormats[selectedFormat].aspectRatio}
                    gravity="auto"
                    ref={imageRef}
                    onLoad={() => setIsTransforming(false)}
                    className="rounded-lg max-w-full h-auto"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={handleDownload}
                    size="lg"
                    className="flex-1"
                    disabled={isTransforming || isDownloading}
                  >
                    {isDownloading ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Download for {selectedFormat}
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleReset}
                    size="lg"
                    variant="outline"
                    disabled={isDownloading}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Upload New
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="mt-6 bg-muted/50">
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-2">Tips for Best Results</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Use high-resolution images for better quality</li>
            <li>• Maximum file size: 5 MB</li>
            <li>• Supported formats: JPG, PNG, WebP, GIF</li>
            <li>• Images are automatically optimized by Cloudinary</li>
            <li>• Preview updates instantly when changing formats</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
