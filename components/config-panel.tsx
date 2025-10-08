"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X } from "lucide-react";
import { useRef } from "react";

export interface Config {
  apiKey: string;
  basePrompt: string;
  plannerModel: string;
  soraModel: string;
  size: string;
  secondsPerSegment: number;
  numGenerations: number;
  firstFrameReference?: string; // base64 data URL
}

interface ConfigPanelProps {
  config: Config;
  onChange: (config: Config) => void;
}

export function ConfigPanel({ config, onChange }: ConfigPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateConfig = (key: keyof Config, value: any) => {
    onChange({ ...config, [key]: value });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      updateConfig('firstFrameReference', reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearFirstFrame = () => {
    updateConfig('firstFrameReference', undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuration</CardTitle>
        <CardDescription>Configure your Sora video generation pipeline</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="apiKey">OpenAI API Key</Label>
          <Input
            id="apiKey"
            type="password"
            placeholder="sk-..."
            value={config.apiKey}
            onChange={(e) => updateConfig("apiKey", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="basePrompt">Base Prompt</Label>
          <Textarea
            id="basePrompt"
            placeholder="Describe your video concept..."
            value={config.basePrompt}
            onChange={(e) => updateConfig("basePrompt", e.target.value)}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="firstFrame">First Frame Reference (Optional)</Label>
          <div className="flex gap-2">
            <Input
              id="firstFrame"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="flex-1"
            />
            {config.firstFrameReference && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={clearFirstFrame}
                title="Clear image"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {config.firstFrameReference && (
            <div className="mt-2 relative rounded-lg overflow-hidden border bg-muted p-2">
              <img
                src={config.firstFrameReference}
                alt="First frame reference"
                className="w-full h-auto max-h-48 object-contain rounded"
              />
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Upload an image to use as the starting frame for your first segment
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="plannerModel">Planner Model</Label>
            <Select
              value={config.plannerModel}
              onValueChange={(value) => updateConfig("plannerModel", value)}
            >
              <SelectTrigger id="plannerModel">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="soraModel">Sora Model</Label>
            <Select
              value={config.soraModel}
              onValueChange={(value) => updateConfig("soraModel", value)}
            >
              <SelectTrigger id="soraModel">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sora-2">Sora 2</SelectItem>
                <SelectItem value="sora-2-pro">Sora 2 Pro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="size">Resolution</Label>
            <Select
              value={config.size}
              onValueChange={(value) => updateConfig("size", value)}
            >
              <SelectTrigger id="size">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1280x720">1280x720 (HD)</SelectItem>
                <SelectItem value="1920x1080">1920x1080 (Full HD)</SelectItem>
                <SelectItem value="720x1280">720x1280 (Portrait)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondsPerSegment">Seconds per Segment</Label>
            <Select
              value={config.secondsPerSegment.toString()}
              onValueChange={(value) => updateConfig("secondsPerSegment", parseInt(value))}
            >
              <SelectTrigger id="secondsPerSegment">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4">4 seconds</SelectItem>
                <SelectItem value="8">8 seconds</SelectItem>
                <SelectItem value="12">12 seconds</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="numGenerations">Number of Segments</Label>
          <Input
            id="numGenerations"
            type="number"
            min="1"
            max="20"
            value={config.numGenerations}
            onChange={(e) => updateConfig("numGenerations", parseInt(e.target.value) || 1)}
          />
          <p className="text-xs text-muted-foreground">
            Total duration: ~{config.secondsPerSegment * config.numGenerations} seconds
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

