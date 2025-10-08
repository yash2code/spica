import { NextRequest, NextResponse } from 'next/server';
import { SoraClient } from '@/lib/sora-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, videoId, variant } = body;

    if (!apiKey || !videoId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const client = new SoraClient(apiKey);
    const blob = await client.downloadVideoContent(videoId, variant || 'video');
    const buffer = await blob.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="video-${videoId}.mp4"`,
      },
    });
  } catch (error: any) {
    console.error('Download video error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to download video' },
      { status: 500 }
    );
  }
}

