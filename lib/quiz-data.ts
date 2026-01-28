import { QuizInteraction } from "@/types";

export const MOVIE_QUIZ: QuizInteraction[] = [
  {
    id: "seed",
    key: "seedMovieId",
    question: "Name a movie you loved recently.",
    options: [], // Special handle for search in Quiz component
  },
  {
    id: "vibe",
    key: "pacing",
    question: "What's the target vibe for today?",
    options: [
      { label: "Light & Easy", value: "light", nextStepId: "genres_light" },
      { label: "Dark & Intense", value: "intense", nextStepId: "genres_dark" },
      { label: "Something Epic", value: "epic", nextStepId: "genres_epic" },
      {
        label: "Surprise Me",
        value: "surprise",
        nextStepId: "genres_surprise",
      },
    ],
  },
  // Light Path
  {
    id: "genres_light",
    key: "genres",
    question: "Which light vibes suit you?",
    options: [
      { label: "Gut-Busting Comedy", value: 35, nextStepId: "mood_light" },
      { label: "Feel-Good Romance", value: 10749, nextStepId: "mood_light" },
      { label: "Wholesome Animation", value: 16, nextStepId: "mood_light" },
      { label: "Relaxing Docs", value: 99, nextStepId: "mood_light" },
    ],
  },
  {
    id: "mood_light",
    key: "mood",
    question: "How relaxed are we talking?",
    options: [
      {
        label: "I need a belly laugh",
        value: "light",
        nextStepId: "era_light",
      },
      { label: "Just pure chill", value: "relaxed", nextStepId: "era_light" },
      {
        label: "Sweet & Heartwarming",
        value: "emotional",
        nextStepId: "era_light",
      },
      { label: "Balanced Comfort", value: "balanced", nextStepId: "era_light" },
    ],
  },
  {
    id: "era_light",
    key: "era",
    question: "Choose your time capsule.",
    options: [
      { label: "Modern (2010+)", value: "modern", nextStepId: "runtime" },
      { label: "2000s Nostalgia", value: "2000s", nextStepId: "runtime" },
      { label: "90s Revolution", value: "90s", nextStepId: "runtime" },
      { label: "Cinematic Classics", value: "classic", nextStepId: "runtime" },
    ],
  },
  // Dark Path
  {
    id: "genres_dark",
    key: "genres",
    question: "Pick your poison.",
    options: [
      { label: "Nightmare Fuel (Horror)", value: 27, nextStepId: "mood_dark" },
      { label: "Dark Mysteries", value: 9648, nextStepId: "mood_dark" },
      { label: "Gritty Crime", value: 80, nextStepId: "mood_dark" },
      { label: "Psychological Thrillers", value: 53, nextStepId: "mood_dark" },
    ],
  },
  {
    id: "mood_dark",
    key: "mood",
    question: "How deep into the dark side?",
    options: [
      {
        label: "On the edge of my seat",
        value: "intense",
        nextStepId: "era_dark",
      },
      {
        label: "Emotional & Heavy",
        value: "emotional",
        nextStepId: "era_dark",
      },
      { label: "Cold & Calculated", value: "relaxed", nextStepId: "era_dark" },
      { label: "Gory & Chaotic", value: "light", nextStepId: "era_dark" },
    ],
  },
  {
    id: "era_dark",
    key: "era",
    question: "Choose your time capsule.",
    options: [
      { label: "Modern (2010+)", value: "modern", nextStepId: "runtime" },
      { label: "2000s Nostalgia", value: "2000s", nextStepId: "runtime" },
      { label: "90s Revolution", value: "90s", nextStepId: "runtime" },
      { label: "Cinematic Classics", value: "classic", nextStepId: "runtime" },
    ],
  },
  // Epic Path
  {
    id: "genres_epic",
    key: "genres",
    question: "What kind of journey?",
    options: [
      { label: "Adrenaline Action", value: 28, nextStepId: "mood_epic" },
      { label: "Grand Sci-Fi", value: 878, nextStepId: "mood_epic" },
      { label: "High Fantasy", value: 14, nextStepId: "mood_epic" },
      { label: "War & History", value: 10752, nextStepId: "mood_epic" },
    ],
  },
  {
    id: "mood_epic",
    key: "mood",
    question: "What's the emotional stakes?",
    options: [
      { label: "Heroic & Inspiring", value: "light", nextStepId: "era_epic" },
      {
        label: "Serious & High Stakes",
        value: "intense",
        nextStepId: "era_epic",
      },
      { label: "Grand & Majestic", value: "relaxed", nextStepId: "era_epic" },
      {
        label: "Tragic & Powerful",
        value: "emotional",
        nextStepId: "era_epic",
      },
    ],
  },
  {
    id: "era_epic",
    key: "era",
    question: "Choose your time capsule.",
    options: [
      { label: "Modern (2010+)", value: "modern", nextStepId: "runtime" },
      { label: "2000s Nostalgia", value: "2000s", nextStepId: "runtime" },
      { label: "90s Revolution", value: "90s", nextStepId: "runtime" },
      { label: "Cinematic Classics", value: "classic", nextStepId: "runtime" },
    ],
  },
  // Surprise Path
  {
    id: "genres_surprise",
    key: "genres",
    question: "Let's take a wild card.",
    options: [
      { label: "Indie Gems", value: 18, nextStepId: "runtime" },
      { label: "Western Grit", value: 37, nextStepId: "runtime" },
      { label: "Music & Dreams", value: 10402, nextStepId: "runtime" },
      { label: "Random Blockbuster", value: 28, nextStepId: "runtime" },
    ],
  },
  // Common final step
  {
    id: "runtime",
    key: "runtime",
    question: "How long is your journey?",
    options: [
      { label: "Under 100m (Quick)", value: "short" },
      { label: "Standard Length", value: "standard" },
      { label: "Over 150m (Epic)", value: "long" },
      { label: "Any duration", value: undefined },
    ],
  },
];
