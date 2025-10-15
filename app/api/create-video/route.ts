import { NextRequest, NextResponse } from 'next/server';
import { SoraClient } from '@/lib/sora-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, prompt, size, seconds, model, inputReference } = body;

    if (!apiKey || !prompt || !size || !seconds || !model) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    console.log('Creating video with:', {
      model,
      size,
      seconds,
      promptLength: prompt.length,
      hasInputReference: !!inputReference,
    });

    const client = new SoraClient(apiKey);
    const job = await client.createVideo(prompt, size, seconds, model, inputReference);

    console.log('Video job created:', job.id);
    return NextResponse.json(job);
  } catch (error: any) {
    console.error('Create video error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: error.message || 'Failed to create video' },
      { status: 500 }
    );
  }
}

