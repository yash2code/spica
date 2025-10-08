import OpenAI from 'openai';

export interface VideoSegment {
  title: string;
  seconds: number;
  prompt: string;
}

export interface GenerationStatus {
  id: string;
  status: 'queued' | 'in_progress' | 'completed' | 'failed';
  progress?: number;
  error?: { message: string };
}

export class SoraClient {
  private client: OpenAI;
  private apiBase = 'https://api.openai.com/v1';

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async planPrompts(
    basePrompt: string,
    secondsPerSegment: number,
    numGenerations: number,
    plannerModel: string = 'gpt-4o'
  ): Promise<VideoSegment[]> {
    const systemInstructions = `
You are a senior prompt director for Sora 2. Your job is to transform:
- a Base prompt (broad idea),
- a fixed generation length per segment (seconds),
- and a total number of generations (N),

into **N crystal-clear shot prompts** with **maximum continuity** across segments.

Rules:
1) Return **valid JSON** only. Structure:
   {
     "segments": [
       {
         "title": "Generation 1",
         "seconds": 6,
         "prompt": "<prompt block to send into Sora>"
       },
       ...
     ]
   }
   - \`seconds\` MUST equal the given generation length for ALL segments.
   - \`prompt\` should include a **Context** section for model guidance AND a **Prompt** line for the shot itself,
     exactly like in the example below.
2) Continuity:
   - Segment 1 starts fresh from the BASE PROMPT.
   - Segment k (k>1) must **begin exactly at the final frame** of segment k-1.
   - Maintain consistent visual style, tone, lighting, and subject identity unless explicitly told to change.
3) Safety & platform constraints:
   - Do not depict real people (including public figures) or copyrighted characters.
   - Avoid copyrighted music and avoid exact trademark/logos if policy disallows them; use brand-safe wording.
   - Keep content suitable for general audiences.
4) Output only JSON (no Markdown, no backticks).
5) Keep the **Context** lines inside the prompt text (they're for the AI, not visible).
6) Make the writing specific and cinematic; describe camera, lighting, motion, and subject focus succinctly.

Below is an **EXAMPLE (verbatim)** of exactly how to structure prompts with context and continuity:

Example:
Base prompt: "Intro video for the iPhone 19"
Generation length: 6 seconds each
Total generations: 3

Clearly defined prompts with maximum continuity and context:

### Generation 1:

<prompt>
First shot introducing the new iPhone 19. Initially, the screen is completely dark. The phone, positioned vertically and facing directly forward, emerges slowly and dramatically out of darkness, gradually illuminated from the center of the screen outward, showcasing a vibrant, colorful, dynamic wallpaper on its edge-to-edge glass display. The style is futuristic, sleek, and premium, appropriate for an official Apple product reveal.
<prompt>

---

### Generation 2:

<prompt>
Context (not visible in video, only for AI guidance):

* You are creating the second part of an official intro video for Apple's new iPhone 19.
* The previous 6-second scene ended with the phone facing directly forward, clearly displaying its vibrant front screen and colorful wallpaper.

Prompt: Second shot begins exactly from the final frame of the previous scene, showing the front of the iPhone 19 with its vibrant, colorful display clearly visible. Now, smoothly rotate the phone horizontally, turning it from the front to reveal the back side. Focus specifically on the advanced triple-lens camera module, clearly highlighting its premium materials, reflective metallic surfaces, and detailed lenses. Maintain consistent dramatic lighting, sleek visual style, and luxurious feel matching the official Apple product introduction theme.
</prompt>

---

### Generation 3:

<prompt>
Context (not visible in video, only for AI guidance):

* You are creating the third and final part of an official intro video for Apple's new iPhone 19.
* The previous 6-second scene ended clearly showing the back of the iPhone 19, focusing specifically on its advanced triple-lens camera module.

Prompt: Final shot begins exactly from the final frame of the previous scene, clearly displaying the back side of the iPhone 19, with special emphasis on the triple-lens camera module. Now, have a user's hand gently pick up the phone, naturally rotating it from the back to the front and bringing it upward toward their face. Clearly show the phone smoothly and quickly unlocking via Face ID recognition, transitioning immediately to a vibrant home screen filled with updated app icons. Finish the scene by subtly fading the home screen into the iconic Apple logo. Keep the visual style consistent, premium, and elegant, suitable for an official Apple product launch.
</prompt>

--

Notice how we broke up the initial prompt into multiple prompts that provide context and continuity so this all works seamlessly.
`.trim();

    const userInput = `
BASE PROMPT: ${basePrompt}

GENERATION LENGTH (seconds): ${secondsPerSegment}
TOTAL GENERATIONS: ${numGenerations}

Return exactly ${numGenerations} segments.
`.trim();

    const response = await this.client.chat.completions.create({
      model: plannerModel,
      messages: [
        { role: 'system', content: systemInstructions },
        { role: 'user', content: userInput },
      ],
      response_format: { type: 'json_object' },
    });

    const text = response.choices[0]?.message?.content || '';
    
    // Extract the first JSON object found in the response text (matching notebook approach)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Planner did not return JSON. Inspect response and adjust instructions.');
    }
    
    const data = JSON.parse(jsonMatch[0]);
    const segments = data.segments || [];
    
    // Basic validation and enforcement (matching notebook)
    if (segments.length !== numGenerations) {
      // Clamp to requested number
      segments.splice(numGenerations);
    }

    // Force durations
    segments.forEach((seg: VideoSegment) => {
      seg.seconds = secondsPerSegment;
    });

    return segments.slice(0, numGenerations);
  }

  async createVideo(
    prompt: string,
    size: string,
    seconds: number,
    model: string,
    inputReference?: string
  ): Promise<GenerationStatus> {
    // Always send multipart/form-data (matching notebook approach)
    const formData = new FormData();
    formData.append('model', model);
    formData.append('prompt', prompt);
    formData.append('seconds', seconds.toString());
    
    if (size) {
      formData.append('size', size);
    }

    if (inputReference) {
      // Convert base64 data URL or regular URL to blob
      const response = await fetch(inputReference);
      const blob = await response.blob();
      // Determine filename based on blob type
      const extension = blob.type.includes('png') ? 'png' : 'jpg';
      formData.append('input_reference', blob, `reference.${extension}`);
    }

    const apiKey = this.client.apiKey;
    const videoResponse = await fetch(`${this.apiBase}/videos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        // Don't set Content-Type - let browser set it with boundary for multipart/form-data
      },
      body: formData,
    });

    if (!videoResponse.ok) {
      const errorText = await videoResponse.text();
      throw new Error(`Create video failed: HTTP ${videoResponse.status}\n${errorText}`);
    }

    return await videoResponse.json();
  }

  async retrieveVideo(videoId: string): Promise<GenerationStatus> {
    const response = await fetch(`${this.apiBase}/videos/${videoId}`, {
      headers: {
        'Authorization': `Bearer ${this.client.apiKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Retrieve video failed: HTTP ${response.status}\n${errorText}`);
    }

    return await response.json();
  }

  async downloadVideoContent(videoId: string, variant: string = 'video'): Promise<Blob> {
    const response = await fetch(
      `${this.apiBase}/videos/${videoId}/content?variant=${variant}`,
      {
        headers: {
          'Authorization': `Bearer ${this.client.apiKey}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Download failed: HTTP ${response.status}\n${errorText}`);
    }

    return await response.blob();
  }

  async pollUntilComplete(
    job: GenerationStatus,
    onProgress?: (progress: number) => void,
    pollInterval: number = 2000
  ): Promise<GenerationStatus> {
    let video = job;

    // Poll while queued or in_progress (matching notebook logic)
    while (video.status === 'queued' || video.status === 'in_progress') {
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
      video = await this.retrieveVideo(video.id);
      
      if (onProgress && video.progress !== undefined) {
        onProgress(video.progress);
      }
    }

    // Check final status (matching notebook)
    if (video.status !== 'completed') {
      const errorMsg = video.error?.message || `Job ${video.id} failed`;
      throw new Error(errorMsg);
    }

    return video;
  }
}

