"use client";

import { useState } from "react";
import { Movie } from "@/types";
import Image from "next/image";
import { Star, RotateCcw, Play, Info, Sparkles, Activity } from "lucide-react";
import { MovieDetailModal } from "./MovieDetailModal";
import { motion } from "framer-motion";

interface ResultsGalleryProps {
  movies: Movie[];
  loading: boolean;
  error: string | null;
  onReset: () => void;
}

export function ResultsGallery({
  movies,
  loading,
  error,
  onReset,
}: ResultsGalleryProps) {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center px-4">
        <h2 className="text-2xl font-bold text-red-500">
          Oops! Something went wrong.
        </h2>
        <p className="text-gray-400">{error}</p>
        <button
          onClick={onReset}
          className="flex items-center gap-2 rounded-full bg-primary px-8 py-3 font-bold text-white transition-opacity hover:opacity-90"
        >
          <RotateCcw size={20} /> Try Again
        </button>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center px-4">
        <h2 className="text-2xl font-bold text-white">
          No matches found for your criteria.
        </h2>
        <p className="text-gray-400">
          Try adjusting your quiz answers for better results.
        </p>
        <button
          onClick={onReset}
          className="flex items-center gap-2 rounded-full bg-primary px-8 py-3 font-bold text-white transition-opacity hover:opacity-90"
        >
          <RotateCcw size={20} /> Retake Quiz
        </button>
      </div>
    );
  }

  const bestMatch = movies[0];
  const others = movies.slice(1, 11); // Show up to 10 other suggestions

  const getNetflixUrl = (title: string) =>
    `https://www.netflix.com/search?q=${encodeURIComponent(title)}`;

  return (
    <div className="min-h-screen px-4 md:px-8 pt-24 md:pt-32 pb-20 max-w-7xl mx-auto">
      <div className="mb-12 flex items-end justify-between">
        <div className="flex-1">
          <h2 className="text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-primary mb-2">
            Your Perfect Match
          </h2>
          <h3 className="text-3xl md:text-5xl font-black text-white">
            We think you'll love this!
          </h3>
        </div>
        <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
          <button
            onClick={onReset}
            className="flex items-center gap-2 rounded-full border border-zinc-700 px-4 md:px-6 py-2 text-xs md:text-sm font-medium text-gray-300 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <RotateCcw size={14} className="md:w-4 md:h-4" /> Reset
          </button>
        </div>
      </div>

      {/* Featured Best Match */}
      <div className="mb-12 md:mb-20 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center bg-zinc-900/50 p-4 md:p-8 rounded-2xl border border-white/5">
        <div
          className="relative aspect-[16/9] overflow-hidden rounded-xl shadow-2xl cursor-pointer group"
          onClick={() => setSelectedMovie(bestMatch)}
        >
          <Image
            src={`https://image.tmdb.org/t/p/original${bestMatch.backdrop_path || bestMatch.poster_path}`}
            alt={bestMatch.title}
            fill
            className="object-cover transition-transform group-hover:scale-110 duration-700"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
            <Info
              className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
              size={48}
            />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-primary text-white text-xs font-black px-2 py-1 rounded">
              MATCH
            </span>
            <div className="flex items-center gap-1 text-green-500 font-bold">
              <Star size={18} fill="currentColor" />
              {typeof bestMatch.vote_average === "number"
                ? bestMatch.vote_average.toFixed(1)
                : "0.0"}{" "}
              Rating
            </div>
            <span className="text-gray-500">•</span>
            <span className="text-gray-400 font-medium">
              {bestMatch.release_date
                ? bestMatch.release_date.split("-")[0]
                : "N/A"}
            </span>
          </div>
          {bestMatch.matchReason && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-primary text-sm md:text-base font-medium italic mb-2 tracking-tight"
            >
              "{bestMatch.matchReason}"
            </motion.p>
          )}
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 md:mb-8 leading-[1.1] tracking-tighter">
            {bestMatch.title}
          </h2>

          <div className="mb-8 flex items-center gap-8 py-4 border-y border-white/5">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                <Activity size={10} /> Vibe
              </span>
              <span className="text-lg font-black text-primary">
                {bestMatch.vibeScore || 95}%
              </span>
            </div>
            <div className="h-8 w-px bg-zinc-800" />
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                Match
              </span>
              <span className="text-lg font-black text-white">
                {Math.round(bestMatch.matchScore || 0)}
              </span>
            </div>
            <div className="h-8 w-px bg-zinc-800" />
            <div className="flex-1" />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={getNetflixUrl(bestMatch.title)}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-black px-6 md:px-12 py-3.5 md:py-4 rounded-md font-black text-sm md:text-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 flex-1 md:flex-none whitespace-nowrap"
            >
              <Play fill="black" size={18} className="md:w-5 md:h-5" /> WATCH ON
              NETFLIX
            </a>
            <button
              onClick={() => setSelectedMovie(bestMatch)}
              className="px-6 md:px-8 py-3.5 md:py-4 rounded-md font-black text-sm md:text-lg border-2 border-white/20 text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2 flex-1 md:flex-none whitespace-nowrap"
            >
              <Info size={18} className="md:w-5 md:h-5" /> MORE INFO
            </button>
          </div>
        </div>
      </div>

      {/* Other recommendations */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-white mb-8 flex items-center gap-4">
          Wait, there are more!
          <div className="h-px bg-zinc-800 flex-1" />
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {others.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onDetails={() => setSelectedMovie(movie)}
              onNetflix={() =>
                window.open(getNetflixUrl(movie.title), "_blank")
              }
            />
          ))}
        </div>
      </div>

      {selectedMovie && (
        <MovieDetailModal
          movieId={selectedMovie.id}
          mediaType={selectedMovie.media_type || "movie"}
          matchReason={selectedMovie.matchReason}
          vibeScore={selectedMovie.vibeScore}
          onClose={() => setSelectedMovie(null)}
        />
      )}
    </div>
  );
}

function MovieCard({
  movie,
  onDetails,
  onNetflix,
}: {
  movie: Movie;
  onDetails: () => void;
  onNetflix: () => void;
}) {
  const imageUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "/placeholder-movie.jpg";

  return (
    <div
      className="group relative aspect-[2/3] overflow-hidden rounded-md bg-zinc-900 card-hover cursor-pointer"
      onClick={onDetails}
    >
      <Image
        src={imageUrl}
        alt={movie.title}
        fill
        className="object-cover transition-opacity group-hover:opacity-40"
      />

      <div className="absolute inset-0 flex flex-col justify-end p-6 opacity-0 transition-opacity group-hover:opacity-100">
        <h3 className="mb-2 text-lg font-black text-white leading-tight line-clamp-2">
          {movie.title}
        </h3>
        <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
          <span className="flex items-center gap-1 text-green-500">
            <Star size={10} fill="currentColor" />
            {typeof movie.vote_average === "number"
              ? movie.vote_average.toFixed(1)
              : "0.0"}
          </span>
          <span className="text-zinc-700">•</span>
          <span>{movie.vibeScore}% Vibe Match</span>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNetflix();
            }}
            className="w-full rounded bg-white py-2.5 text-xs font-black text-black transition-colors hover:bg-gray-200 whitespace-nowrap"
          >
            Play on Netflix
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDetails();
            }}
            className="w-full rounded border border-white/40 py-2.5 text-xs font-black text-white transition-colors hover:bg-white/10 whitespace-nowrap"
          >
            More Info
          </button>
        </div>
      </div>
    </div>
  );
}
