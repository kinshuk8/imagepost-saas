import React, { useState } from "react";
import { getCldImageUrl, getCldVideoUrl } from "next-cloudinary";
import { Download, FileVideo, Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { filesize } from "filesize";

dayjs.extend(relativeTime);

interface Video {
  _id: string;
  _creationTime: number;
  userId: string;
  clerkId: string;
  cloudinaryPublicId: string;
  url: string;
  title: string;
  description: string;
  originalSize: number;
  duration?: number;
  createdAt: number;
}

interface VideoCardProps {
  video: Video;
  onDownload: (url: string, title: string) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, onDownload }) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const getThumbnailUrl = (publicId: string) => {
    return getCldImageUrl({
      src: publicId,
      width: 640,
      height: 360,
      crop: "fill",
      gravity: "auto",
      format: "jpg",
      quality: "auto",
      assetType: "video",
    });
  };

  const getPreviewVideoUrl = (publicId: string) => {
    return getCldVideoUrl({
      src: publicId,
      width: 640,
      height: 360,
      quality: "auto",
    });
  };

  const getFullVideoUrl = (publicId: string) => {
    return getCldVideoUrl({
      src: publicId,
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-shadow group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail / Video Preview */}
      <div className="relative aspect-video bg-muted">
        {/* Thumbnail - always render as base layer */}
        {!imageError && (
          <Image
            src={getThumbnailUrl(video.cloudinaryPublicId)}
            alt={video.title}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}

        {/* Fallback if thumbnail fails */}
        {imageError && !isHovered && (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <FileVideo className="h-16 w-16 text-muted-foreground" />
          </div>
        )}

        {/* Video preview on hover */}
        {isHovered && !videoError && (
          <video
            src={getPreviewVideoUrl(video.cloudinaryPublicId)}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-10"
            onError={() => setVideoError(true)}
          />
        )}

        {/* Play icon overlay (shown when not hovering) */}
        {!isHovered && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-white/90 rounded-full p-3">
              <Play className="h-6 w-6 text-black fill-black" />
            </div>
          </div>
        )}

        {/* Duration Badge */}
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs font-medium z-20">
            {formatDuration(video.duration)}
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-4">
        {/* Title and Description */}
        <div>
          <h3 className="font-semibold text-base line-clamp-2 mb-1">
            {video.title}
          </h3>
          {video.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {video.description}
            </p>
          )}
        </div>

        {/* File Size and Date */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <FileVideo className="h-4 w-4" />
            <span className="font-medium">{filesize(video.originalSize)}</span>
          </div>
          <span className="text-xs">
            {dayjs(video._creationTime).fromNow()}
          </span>
        </div>

        {/* Download Button */}
        <Button
          onClick={() =>
            onDownload(getFullVideoUrl(video.cloudinaryPublicId), video.title)
          }
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          size="default"
        >
          <Download className="h-4 w-4 mr-2" />
          Download Video
        </Button>
      </CardContent>
    </Card>
  );
};
