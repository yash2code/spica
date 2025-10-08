"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface OutputViewerProps {
  videoUrl: string | null;
  onDownload: () => void;
}

export function OutputViewer({ videoUrl, onDownload }: OutputViewerProps) {
  if (!videoUrl) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Output</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px] bg-muted rounded-lg">
            <p className="text-muted-foreground">No video generated yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Output</CardTitle>
        <Button onClick={onDownload} size="sm">
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg overflow-hidden bg-black">
          <video
            src={videoUrl}
            controls
            className="w-full h-auto"
            playsInline
          />
        </div>
      </CardContent>
    </Card>
  );
}

