import { NextRequest, NextResponse } from 'next/server';
import { SoraClient } from '@/lib/sora-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, videoId } = body;

    if (!apiKey || !videoId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const client = new SoraClient(apiKey);
    const video = await client.retrieveVideo(videoId);

    return NextResponse.json(video);
  } catch (error: any) {
    console.error('Poll video error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve video' },
      { status: 500 }
    );
  }
}

