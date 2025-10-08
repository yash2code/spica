import { NextRequest, NextResponse } from 'next/server';
import { SoraClient } from '@/lib/sora-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, basePrompt, secondsPerSegment, numGenerations, plannerModel } = body;

    if (!apiKey || !basePrompt || !secondsPerSegment || !numGenerations) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const client = new SoraClient(apiKey);
    const segments = await client.planPrompts(
      basePrompt,
      secondsPerSegment,
      numGenerations,
      plannerModel || 'gpt-4o'
    );

    return NextResponse.json({ segments });
  } catch (error: any) {
    console.error('Plan prompts error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to plan prompts' },
      { status: 500 }
    );
  }
}

