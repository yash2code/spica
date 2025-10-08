<div align="center">

# Spica Setup Guide

**Prefer the web version? Visit [spica.kuber.studio](https://spica.kuber.studio)**

</div>

---

## Quick Start (Local Development)

### 1. Install Dependencies

Open PowerShell in the project directory and run:

```powershell
npm install
```

### 2. Configure Environment (Optional)

You can either:
- Enter your OpenAI API key directly in the UI, or
- Create a `.env.local` file in the root directory:

```
OPENAI_API_KEY=sk-your-actual-api-key-here
```

### 3. Run Development Server

```powershell
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

### 4. Build for Production (Optional)

```powershell
npm run build
npm start
```

---

## Using Spica

### Web App (Recommended)

Simply visit **[spica.kuber.studio](https://spica.kuber.studio)** - no installation needed!

### Local Installation

1. **Open the app** at http://localhost:3000
2. **Enter your OpenAI API key** in the configuration panel (if not set in .env.local)
3. **Configure your video**:
   - Write your base prompt (e.g., "A car driving through a futuristic city")
   - (Optional) Upload a first frame reference image to start from
   - Choose planner model (GPT-4o recommended)
   - Select Sora model (Sora 2 or Sora 2 Pro)
   - Set resolution (1280x720, 1920x1080, or 720x1280)
   - Choose seconds per segment (4, 8, or 12)
   - Set number of segments (total duration = seconds × segments)
4. **Click "Generate Video"** and watch the progress
5. **Download your video** when complete

## Features

**AI-Planned Scene Prompts** - GPT-4 intelligently creates prompts with continuity
**Frame Continuity** - Each segment starts from the previous segment's final frame
**First Frame Reference** - Upload a custom starting image for your first segment
**AMOLED Dark Theme** - Beautiful true black interface
**Real-time Progress** - Track each segment's generation progress
**Instant Download** - Download videos as soon as they're ready
**Fully Configurable** - Control every aspect of generation

## Troubleshooting

### "Module not found" errors
Run `npm install` again to ensure all dependencies are installed.

### API Key Issues
- Make sure your OpenAI API key is valid
- Ensure you have access to Sora API (currently in limited beta)
- Check that GPT-4 access is enabled on your account

### Video Generation Fails
- Check your API key has sufficient credits
- Verify your prompt doesn't violate content policies
- Try reducing the number of segments for testing

### Port Already in Use
If port 3000 is already in use, you can specify a different port:
```powershell
$env:PORT=3001; npm run dev
```

## Project Structure

```
spica/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── plan-prompts/  # AI prompt planning
│   │   ├── create-video/  # Video creation
│   │   ├── poll-video/    # Status polling
│   │   └── download-video/# Video download
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Shadcn UI components
│   ├── config-panel.tsx  # Configuration UI
│   ├── generation-progress.tsx
│   └── output-viewer.tsx
├── lib/                   # Utilities
│   ├── sora-client.ts    # Sora API client
│   └── utils.ts          # Helper functions
├── hooks/                # Custom React hooks
│   └── use-toast.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Shadcn/UI** - Beautiful component library
- **OpenAI SDK** - GPT-4 and Sora 2 integration

## API Requirements

You need access to:
- ✅ OpenAI API with credits
- ✅ GPT-4 API access (for prompt planning)
- ✅ Sora 2 API access (currently in limited beta)

## Support

For issues or questions:
1. Check the README.md for general information
2. Review this SETUP.md for configuration help
3. Check the console for detailed error messages
4. Verify your API key and permissions

## Tips for Best Results

1. **Be specific in your base prompt** - Detail the style, mood, and key elements
2. **Start with fewer segments** - Test with 2-3 segments before scaling up
3. **Use consistent themes** - The AI works best with coherent visual concepts
4. **Choose appropriate duration** - 8 seconds per segment is a good balance
5. **Monitor your API usage** - Video generation can consume credits quickly

## Example Prompts

**Cinematic**:
```
A cinematic journey through a neon-lit cyberpunk city at night, 
showcasing futuristic architecture and flying vehicles
```

**Nature**:
```
A serene forest path transitioning through the four seasons, 
from spring blossoms to winter snow
```

**Product Demo**:
```
Professional product showcase of a sleek smartphone, highlighting 
its design features and elegant materials
```

**Abstract**:
```
Abstract geometric shapes morphing and flowing in a minimalist 
space with dramatic lighting
```

Enjoy creating with Spica!

---

<div align="center">

Made by [Kuber Mehta](https://kuber.studio/)

[Twitter](https://x.com/Kuberwastaken) • [LinkedIn](https://www.linkedin.com/in/kubermehta/)

</div>

