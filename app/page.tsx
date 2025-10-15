"use client";

import { useState } from "react";
import { ConfigPanel, type Config } from "@/components/config-panel";
import { GenerationProgress, type SegmentProgress } from "@/components/generation-progress";
import { OutputViewer } from "@/components/output-viewer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2 } from "lucide-react";

export default function Home() {
  const { toast } = useToast();
  const [config, setConfig] = useState<Config>({
    apiKey: "",
    basePrompt: "Gameplay footage of a game releasing in 2027, a car driving through a futuristic city",
    plannerModel: "gpt-4o",
    soraModel: "sora-2",
    size: "1280x720",
    secondsPerSegment: 8,
    numGenerations: 2,
  });

  const [segments, setSegments] = useState<SegmentProgress[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideoIds, setGeneratedVideoIds] = useState<string[]>([]);

  const extractLastFrame = async (videoBlob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      video.src = URL.createObjectURL(videoBlob);
      video.crossOrigin = 'anonymous';
      
      video.addEventListener('loadedmetadata', () => {
        video.currentTime = video.duration - 0.1; // Last frame
      });
      
      video.addEventListener('seeked', () => {
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          } else {
            reject(new Error('Could not extract frame'));
          }
        }, 'image/jpeg');
      });
      
      video.addEventListener('error', () => {
        reject(new Error('Video load error'));
      });
    });
  };

  const pollVideo = async (videoId: string, segmentIndex: number) => {
    let video: any;
    let attempts = 0;
    const maxAttempts = 600; // 20 minutes max

    while (attempts < maxAttempts) {
      const response = await fetch('/api/poll-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: config.apiKey,
          videoId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to poll video');
      }

      video = await response.json();

      if (video.status === 'completed') {
        break;
      }

      if (video.status === 'failed') {
        throw new Error(video.error?.message || 'Video generation failed');
      }

      // Update progress
      const progress = video.progress || 0;
      setSegments((prev) =>
        prev.map((s, i) =>
          i === segmentIndex
            ? { ...s, status: 'generating', progress }
            : s
        )
      );

      await new Promise((resolve) => setTimeout(resolve, 2000));
      attempts++;
    }

    if (attempts >= maxAttempts) {
      throw new Error('Video generation timed out');
    }

    return video;
  };

  const downloadVideo = async (videoId: string): Promise<Blob> => {
    const response = await fetch('/api/download-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: config.apiKey,
        videoId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to download video');
    }

    return await response.blob();
  };

  const concatenateVideos = async (videoBlobs: Blob[]): Promise<string> => {
    // For client-side, we'll just use the last video
    // In a production app, you'd want to do server-side concatenation
    const blob = videoBlobs[videoBlobs.length - 1];
    return URL.createObjectURL(blob);
  };

  const handleGenerate = async () => {
    if (!config.apiKey) {
      toast({
        title: "Error",
        description: "Please enter your OpenAI API key",
        variant: "destructive",
      });
      return;
    }

    if (!config.basePrompt) {
      toast({
        title: "Error",
        description: "Please enter a base prompt",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setVideoUrl(null);
    setGeneratedVideoIds([]);

    try {
      // Step 1: Plan prompts
      toast({
        title: "Planning prompts",
        description: "Using AI to create scene prompts with continuity...",
      });

      const planResponse = await fetch('/api/plan-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: config.apiKey,
          basePrompt: config.basePrompt,
          secondsPerSegment: config.secondsPerSegment,
          numGenerations: config.numGenerations,
          plannerModel: config.plannerModel,
        }),
      });

      if (!planResponse.ok) {
        throw new Error('Failed to plan prompts');
      }

      const { segments: plannedSegments } = await planResponse.json();

      // Initialize progress tracking
      const initialProgress: SegmentProgress[] = plannedSegments.map((seg: any, i: number) => ({
        index: i,
        title: seg.title || `Segment ${i + 1}`,
        status: 'pending',
        progress: 0,
      }));

      setSegments(initialProgress);

      toast({
        title: "Prompts planned",
        description: `Created ${plannedSegments.length} scene prompts`,
      });

      // Step 2: Generate videos with continuity
      let inputReference: string | undefined = config.firstFrameReference; // Start with user's first frame if provided
      const videoBlobs: Blob[] = [];
      const videoIds: string[] = [];

      for (let i = 0; i < plannedSegments.length; i++) {
        const segment = plannedSegments[i];

        setSegments((prev) =>
          prev.map((s, idx) =>
            idx === i ? { ...s, status: 'generating', progress: 0 } : s
          )
        );

        toast({
          title: `Generating segment ${i + 1}/${plannedSegments.length}`,
          description: segment.title,
        });

        // Create video
        const createResponse = await fetch('/api/create-video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            apiKey: config.apiKey,
            prompt: segment.prompt,
            size: config.size,
            seconds: config.secondsPerSegment,
            model: config.soraModel,
            inputReference,
          }),
        });

        if (!createResponse.ok) {
          const errorData = await createResponse.json().catch(() => ({ error: 'Unknown error' }));
          const errorMessage = errorData.error || 'Unknown error';
          console.error(`Failed to create video for segment ${i + 1}:`, errorMessage);
          throw new Error(`Failed to create video for segment ${i + 1}: ${errorMessage}`);
        }

        const job = await createResponse.json();

        // Poll until complete
        const completedVideo = await pollVideo(job.id, i);

        // Download video
        const videoBlob = await downloadVideo(completedVideo.id);
        videoBlobs.push(videoBlob);
        videoIds.push(completedVideo.id);

        // Extract last frame for next segment
        if (i < plannedSegments.length - 1) {
          inputReference = await extractLastFrame(videoBlob);
        }

        setSegments((prev) =>
          prev.map((s, idx) =>
            idx === i ? { ...s, status: 'completed', progress: 100 } : s
          )
        );
      }

      setGeneratedVideoIds(videoIds);

      // Step 3: Concatenate (for now, just show the last one)
      toast({
        title: "Finalizing",
        description: "Preparing final video...",
      });

      const finalUrl = await concatenateVideos(videoBlobs);
      setVideoUrl(finalUrl);

      toast({
        title: "Success!",
        description: "Your video has been generated",
      });
    } catch (error: any) {
      console.error('Generation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate video",
        variant: "destructive",
      });

      // Mark current segment as failed
      setSegments((prev) =>
        prev.map((s) =>
          s.status === 'generating' ? { ...s, status: 'failed' } : s
        )
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (videoUrl) {
      const a = document.createElement('a');
      a.href = videoUrl;
      a.download = `spica-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Spica</h1>
          <p className="text-muted-foreground">
            Generate Infinite Length Sora 2 Videos With Continuity
          </p>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            <ConfigPanel config={config} onChange={setConfig} />
            
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Video
                </>
              )}
            </Button>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {segments.length > 0 && (
              <GenerationProgress segments={segments} />
            )}
            <OutputViewer videoUrl={videoUrl} onDownload={handleDownload} />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Another Dumb Project by <a href="https://twitter.com/kuberwastaken" className="text-blue-500">Kuber Mehta</a>
          </p>
        </div>
      </div>
    </main>
  );
}

