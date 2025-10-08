"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export interface SegmentProgress {
  index: number;
  title: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  progress: number;
}

interface GenerationProgressProps {
  segments: SegmentProgress[];
}

export function GenerationProgress({ segments }: GenerationProgressProps) {
  const completed = segments.filter(s => s.status === 'completed').length;
  const total = segments.length;
  const overallProgress = total > 0 ? (completed / total) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generation Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span className="text-muted-foreground">
              {completed}/{total} segments
            </span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        <div className="space-y-3">
          {segments.map((segment) => (
            <div key={segment.index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">
                  Segment {segment.index + 1}: {segment.title}
                </span>
                <span className={`text-xs ${
                  segment.status === 'completed' ? 'text-green-500' :
                  segment.status === 'generating' ? 'text-blue-500' :
                  segment.status === 'failed' ? 'text-red-500' :
                  'text-muted-foreground'
                }`}>
                  {segment.status === 'completed' ? '✓ Completed' :
                   segment.status === 'generating' ? `${Math.round(segment.progress)}%` :
                   segment.status === 'failed' ? '✗ Failed' :
                   'Pending'}
                </span>
              </div>
              {segment.status === 'generating' && (
                <Progress value={segment.progress} className="h-1" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

