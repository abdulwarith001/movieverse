export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  media_type?: "movie" | "tv";
  matchReason?: string;
  vibeScore?: number;
  matchScore?: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface QuizInteraction {
  id: string;
  question: string;
  options: {
    label: string;
    value: any;
    image?: string;
    nextStepId?: string; // Optional: specify the next question id
  }[];
  key: keyof QuizState;
}

export interface QuizState {
  genres: number[];
  era: string;
  mood: string;
  pacing: string;
  runtime?: "short" | "standard" | "long";
  seedMovieId?: string;
}
