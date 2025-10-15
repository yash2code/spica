<div align="center">

# Spica

### Generate Infinite Length Sora 2 Videos With Continuity

[![License](https://img.shields.io/badge/License-Apache%202.0-b41914.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15.0-b41914.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-b41914.svg)](https://www.typescriptlang.org/)

<img width="1024" height="585" alt="image" src="https://github.com/user-attachments/assets/eff6015c-099f-463a-b2cf-b5d0758d789d" />

---

**[Use Spica Live Here and skip all the Yap](https://spica.kuber.studio)**

</div>

---

## About

Spica is a web application that extends OpenAI's Sora 2 video generation capabilities by using AI to plan multiple scene prompts with maximum continuity. Instead of generating a single short video, Spica intelligently breaks down your concept into multiple segments that seamlessly connect through frame-by-frame continuity.

Using GPT-4 (or similiar models) for intelligent prompt planning and Sora 2's `input_reference` feature, each segment begins exactly where the previous one ended, creating longer, more coherent video sequences that maintain consistent style, lighting, and subject identity throughout.

---

## Features

- **AI-Planned Prompts** - GPT-4 intelligently creates scene prompts with maximum continuity
- **Frame-by-Frame Continuity** - Each segment starts from the final frame of the previous one
- **First Frame Reference** - Upload a custom starting image for your first segment
- **AMOLED Dark Theme** - Beautiful true black interface with monospace typography
- **Real-time Progress** - Track generation progress for each segment
- **Instant Download** - Download your generated videos as soon as they're ready
- **Fully Configurable** - Control models, resolution, duration, and segment count

---

## Quick Start

**Visit [spica.kuber.studio](https://spica.kuber.studio) to use Spica instantly in your browser!**

No installation required. Just enter your OpenAI API key and start creating.

---

## Local Installation

### Prerequisites

- **Node.js**: 18+ 
- **OpenAI API Key**: With GPT-4 and Sora 2 access

### Setup

1. Clone the repository:
```bash
git clone https://github.com/Kuberwastaken/spica
cd spica
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Create a `.env.local` file:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your OpenAI API key, or enter it in the UI.

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## How to Use

### Web Interface

1. **Enter your OpenAI API key** - Your key stays in your browser, never stored on servers
2. **Write your base prompt** - Describe your video concept (e.g., "A car driving through a futuristic city")
3. **(Optional) Upload a first frame** - Start from a specific image
4. **Configure generation settings**:
   - **Planner Model**: GPT-4o (recommended) or GPT-4o Mini
   - **Sora Model**: Sora 2 or Sora 2 Pro
   - **Resolution**: 1280x720, 1920x1080, or 720x1280 (portrait)
   - **Seconds per Segment**: 4, 8, or 12 seconds
   - **Number of Segments**: 1-20 segments
5. **Generate** - Watch real-time progress for each segment
6. **Download** - Get your final video instantly

---

## How It Works

### The Pipeline

```
Base Prompt → AI Planning → Segment Prompts → Sora Generation → Frame Extraction → Continuity Chain
```

1. **Planning Phase**  
   GPT-4 analyzes your base prompt and creates N scene prompts with detailed context for continuity

2. **Generation Phase**  
   Each segment is generated with Sora 2, using the final frame of the previous segment as `input_reference`

3. **Frame Extraction**  
   The last frame of each video is extracted and used as the starting point for the next segment

4. **Continuity Chain**  
   This creates a seamless flow where each segment naturally continues from the previous one

---

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5.7
- **UI Components**: Shadcn/UI
- **Styling**: Tailwind CSS with AMOLED theme
- **Font**: JetBrains Mono
- **API Integration**: OpenAI SDK (GPT-4 + Sora 2)

---

## Configuration Options

| Setting | Options | Notes |
|---------|---------|-------|
| **Planner Model** | GPT-4o, GPT-4o Mini, GPT-4 Turbo | GPT-4o recommended for best results |
| **Sora Model** | Sora 2, Sora 2 Pro | Pro version for higher quality |
| **Resolution** | 1280x720, 1920x1080, 720x1280 | HD/Full HD landscape or portrait |
| **Duration** | 4s, 8s, 12s per segment | 8 seconds recommended |
| **Segments** | 1-20 | Total duration = segments × duration |

---

## Example Prompts

**Cinematic Journey**
```
A cinematic journey through a neon-lit cyberpunk city at night, 
showcasing futuristic architecture and flying vehicles
```

**Nature Transitions**
```
A serene forest path transitioning through the four seasons, 
from spring blossoms to winter snow
```

**Product Showcase**
```
Professional product showcase of a sleek smartphone, highlighting 
its design features and elegant materials
```

**Abstract Art**
```
Abstract geometric shapes morphing and flowing in a minimalist 
space with dramatic lighting
```

---

## License

This project is licensed under the **Apache License 2.0** - see the [LICENSE](LICENSE) file for details.

### Credits

Inspired by [Sora Extend](https://github.com/mshumer/sora-extend) by Matt Shumer.

Built with Next.js, Shadcn/UI, and OpenAI's Sora 2.

---

<div align="center">

Made by [Kuber Mehta](https://kuber.studio/)

**⭐ Star this repo if you found it useful! ⭐**

[Twitter](https://x.com/Kuberwastaken) • [LinkedIn](https://www.linkedin.com/in/kubermehta/) • [Portfolio](https://kuber.studio/)

</div>