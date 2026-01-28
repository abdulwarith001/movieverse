# 🍿 MovieVerse: AI-Powered Discovery

MovieVerse is a groundbreaking movie discovery system that moves beyond simple filters. It uses AI to understand your "vibe" and find the perfect film or TV show from the global library.

## ✨ Key Features

- **🪄 Magic Search**: Type natural language prompts (e.g., _"movies that teach me how to market a startup"_) and find exactly what you need.
- **🧠 AI Re-Ranking**: Powered by **Groq (Llama 3.3 70B)**, the engine re-ranks candidates based on nuanced thematic relevance.
- **📺 Hybrid Discovery**: Searches both Movies and TV shows simultaneously using a "Title-First" strategy.
- **💎 Premium UI**: A minimalist, high-end interface focusing on cinematic art and quiet AI insights.
- **📊 Vibe-O-Meter**: Real-time matching scores showing exactly how well a recommendation fits your mood.

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **AI Engine**: Groq SDK + Llama 3.3 70B
- **Data Source**: TMDB API
- **Styling**: Tailwind CSS + Framer Motion
- **Video**: YouTube Player API

## 🚀 Getting Started

### 1. Prerequisites

You will need API keys for the following:

- **TMDB API Key**: [The Movie Database](https://www.themoviedb.org/documentation/api)
- **Groq API Key**: [Groq Cloud Console](https://console.groq.com)

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_key_here
TMDB_API_KEY=your_tmdb_key_here
GROQ_API_KEY=your_groq_key_here
```

### 3. Installation

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start discovering.

## 🧠 How the Engine Works

1. **Expansion**: Your prompt is expanded by the AI into specific representative titles and thematic keywords.
2. **Hybrid Fetch**: We parallelize searches across Title Search, Keyword Search, and Category Discovery.
3. **Re-Ranking**: candidates are analyzed by the LLM for exact prompt adherence.
4. **Reasoning**: The AI generates a witty, personalized "Match Reason" for your top pick.
