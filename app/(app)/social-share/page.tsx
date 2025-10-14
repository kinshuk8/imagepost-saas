"use client";

import React, {useState, useEffect, useRef} from 'react'
import { CldImage } from "next-cloudinary";
import { useAction } from 'convex/react';
import { api } from '@convex/_generated/api';

const socialFormats = {
  "Instagram Square (1:1)": { width: 1080, height: 1080, aspectRatio: "1:1" },
  "Instagram Portrait (4:5)": {
    width: 1080, height: 1350, aspectRatio: "4:5" },
  "Twitter Post (16:9)": { width: 1200, height: 675, aspectRatio: "4:5"},
  "Twitter Header (3:1)": { width: 1500, height: 500, aspectRatio: "3:1" },
  "Facebook Cover (205:78)": { width: 820, height: 312, aspectRatio: "205L78" },
};

type SocialFormat = keyof typeof socialFormats;

export default function SocialShare() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<SocialFormat>("Instagram Square (1:1)");
  const [isUploading, setIsUploading] = useState(false);

  const [isTransforming, setIsTransforming] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB limit for images

  useEffect(() => {
    if (uploadedImage) {
      setIsTransforming(true);
    }
  }, [selectedFormat, uploadedImage]);

  const uploadImage = useAction(api.media.uploadImage);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      alert(`File size too large. Please select an image under ${MAX_FILE_SIZE / (1024 * 1024)} MB.`);
      return;
    }

    setIsUploading(true);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64File = reader.result as string;
          const result = await uploadImage({
            base64File,
            fileName: file.name,
          });
          setUploadedImage(result.publicId);
        } catch (error) {
          console.error("Error uploading image:", error);
          alert("Failed to upload image");
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error reading file:", error);
      alert("Failed to read file");
      setIsUploading(false);
    }
  }

  const handleDownload = () => {
    if (!imageRef.current) return;

    fetch(imageRef.current.src)
    .then((response) => response.blob())
    .then((blob) => {
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a");
      link.href = url;
      link.download = `${selectedFormat.replace(/\s+/g, "_")
      .toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    });
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Social Media Image Creator
      </h1>

      <div className="card">
        <div className="card-body">
          <h2 className="card-title mb-4">Upload an Image</h2>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Choose an image file (max 5 MB)</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="file-input file-input-bordered file-input-primary w-full"/>
          </div>

          {isUploading && (
            <div className="mt-4 flex flex-col items-center gap-2">
              <span className="loading loading-spinner loading-lg text-primary"></span>
              <p className="text-sm text-gray-600">Uploading image...</p>
              <progress className="progress progress-primary w-full"></progress>
            </div>
          )}

          {uploadedImage && (
            <div className="mt-6">
              <h2 className="card-title mb-4">Select Social Media Format</h2>
              <div className="form-control">
                <select
                  className="select select-bordered w-full"
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value as SocialFormat)}
                >
                  {Object.keys(socialFormats).map((format) => (
                    <option key={format} value={format}>
                      {format}
                    </option>
                  ))}
                </select>
              </div>
            <div className="mt-6 relative">
              <h3 className="text-lg font-semibold mb-2">Preview:</h3>
              <div className="flex justify-center">
                {isTransforming && (
                  <div className="absolute inset-0 flex items-center justify-center bg-base-100 bg-opacity-50 z-10">
                    <span className="loading loading-spinner loading-lg"></span>
                  </div>
                )}
              </div>
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
                onLoad={(()=> setIsTransforming(false))}
              />
                  
              <div className="card-actions justify-end mt-6">
                <button className="btn btn-primary" onClick={handleDownload}>
                  Download for {selectedFormat}
                </button>
              </div>
            </div>
          </div> 
          )}
        </div>
      </div>
    </div>
  )
}
