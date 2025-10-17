"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { VideoCard } from "@/components/VideoCard";
import { Spinner } from "@/components/ui/spinner";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  const videos = useQuery(api.queries.getVideosForUser);

  const handleDownload = (url: string, title: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title}.mp4`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (videos === undefined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Spinner size="lg" />
        <p className="text-muted-foreground">Loading your videos...</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="rounded-full bg-muted p-6">
            <Upload className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold">No videos yet</h2>
          <p className="text-muted-foreground max-w-sm">
            Get started by uploading your first video. We&apos;ll optimize and
            process it for you.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/video-upload">
            <Upload className="mr-2 h-4 w-4" />
            Upload Your First Video
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Videos</h1>
          <p className="text-muted-foreground mt-1">
            Manage and download your uploaded videos
          </p>
        </div>
        <Button asChild>
          <Link href="/video-upload">
            <Upload className="mr-2 h-4 w-4" />
            Upload New Video
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <VideoCard
            key={video._id}
            video={video}
            onDownload={handleDownload}
          />
        ))}
      </div>

      <div className="text-center text-sm text-muted-foreground pt-4">
        Total videos: {videos.length}
      </div>
    </div>
  );
}
