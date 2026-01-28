"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMovieQuiz } from "@/hooks/useMovieQuiz";
import { ResultsGallery } from "@/components/ResultsGallery";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Loader2,
  Search,
  Check,
} from "lucide-react";
import { searchMoviesAction } from "@/app/actions/movies";
import { Movie } from "@/types";

export function Quiz() {
  const {
    step,
    history,
    currentQuestion,
    nextStep,
    prevStep,
    toggleAnswer,
    answers,
    recommendations,
    loading,
    error,
    isComplete,
    resetQuiz,
    magicSearch,
  } = useMovieQuiz();

  const [seedSearch, setSeedSearch] = useState("");
  const [seedResults, setSeedResults] = useState<Movie[]>([]);
  const [searchingSeed, setSearchingSeed] = useState(false);
  const [selectedSeed, setSelectedSeed] = useState<Movie | null>(null);

  useEffect(() => {
    if (currentQuestion?.id === "seed" && seedSearch.length > 2) {
      const timer = setTimeout(async () => {
        setSearchingSeed(true);
        try {
          const results = await searchMoviesAction(seedSearch);
          setSeedResults(results.slice(0, 4));
        } catch (e) {
          console.error(e);
        } finally {
          setSearchingSeed(false);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [seedSearch, currentQuestion?.id]);

  if (isComplete) {
    if (loading) {
      return <QuizLoadingState />;
    }
    return (
      <ResultsGallery
        movies={recommendations}
        loading={loading}
        error={error}
        onReset={resetQuiz}
      />
    );
  }

  const isMultiSelect = currentQuestion.key === "genres";
  const currentAnswers = (answers[currentQuestion.key] as any[]) || [];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 pt-20 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="w-full max-w-4xl"
        >
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-primary text-xs font-black uppercase tracking-widest"
            >
              <Sparkles size={14} /> Step {history.length}
            </motion.div>
            <h2 className="text-3xl font-black text-white md:text-6xl tracking-tighter leading-[1.1]">
              {currentQuestion.question}
            </h2>
            {isMultiSelect && (
              <p className="mt-4 text-zinc-500 font-medium">
                Select all that apply
              </p>
            )}
          </div>

          {currentQuestion.id === "seed" ? (
            <div className="w-full max-w-2xl mx-auto">
              <div className="relative mb-8">
                <Search
                  className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-zinc-500"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Type a movie title..."
                  value={seedSearch}
                  onChange={(e) => {
                    setSeedSearch(e.target.value);
                    setSelectedSeed(null); // Reset selection on new search
                  }}
                  className="w-full bg-zinc-900 border-2 border-white/5 rounded-2xl py-4 md:py-6 pl-12 md:pl-16 pr-6 text-lg md:text-xl text-white focus:border-primary focus:outline-none transition-all placeholder:text-zinc-700"
                />
                {searchingSeed && (
                  <div className="absolute right-6 top-1/2 -translate-y-1/2">
                    <Loader2 className="animate-spin text-primary" size={24} />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {seedResults.map((movie) => (
                  <button
                    key={`${movie.media_type}-${movie.id}`}
                    onClick={() =>
                      nextStep(`${movie.media_type || "movie"}-${movie.id}`)
                    }
                    className={`flex items-center gap-4 border p-4 rounded-xl transition-all text-left group ${
                      selectedSeed?.id === movie.id
                        ? "bg-primary/20 border-primary shadow-[0_0_20px_rgba(229,9,20,0.2)]"
                        : "bg-zinc-900 border-white/5 hover:bg-zinc-800"
                    }`}
                  >
                    <div className="h-16 w-12 bg-zinc-800 rounded overflow-hidden flex-shrink-0">
                      {movie.poster_path && (
                        <img
                          src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div
                        className={`font-bold transition-colors ${selectedSeed?.id === movie.id ? "text-primary" : "text-white group-hover:text-primary"}`}
                      >
                        {movie.title}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {movie.release_date?.split("-")[0]}
                      </div>
                    </div>
                    {selectedSeed?.id === movie.id ? (
                      <Check className="text-primary" size={24} />
                    ) : (
                      <ChevronRight
                        className="text-zinc-600 group-hover:text-white"
                        size={20}
                      />
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-12 text-center">
                <button
                  onClick={() => nextStep(undefined)}
                  className="text-zinc-500 hover:text-white font-bold transition-all underline underline-offset-8"
                >
                  I'll skip this, just give me fresh vibes
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {currentQuestion.options.map((option) => {
                const isActive = Array.isArray(currentAnswers)
                  ? currentAnswers.includes(option.value)
                  : currentAnswers === option.value;

                return (
                  <button
                    key={option.label}
                    onClick={() =>
                      isMultiSelect
                        ? toggleAnswer(currentQuestion.key, option.value)
                        : nextStep(option.value)
                    }
                    className={`group relative aspect-square overflow-hidden rounded-2xl transition-all duration-300 ${
                      isActive
                        ? "ring-4 ring-primary ring-offset-4 ring-offset-background scale-95"
                        : "hover:scale-105 active:scale-95"
                    } bg-zinc-900 border border-white/5`}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-950 transition-opacity ${
                        isActive
                          ? "opacity-40"
                          : "opacity-100 group-hover:opacity-80"
                      }`}
                    />

                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                      <span
                        className={`text-lg font-bold uppercase tracking-tight transition-all ${
                          isActive
                            ? "text-primary scale-110"
                            : "text-zinc-300 group-hover:text-white"
                        }`}
                      >
                        {option.label}
                      </span>
                    </div>

                    {isActive && (
                      <div className="absolute top-4 right-4 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                        <ChevronRight size={14} className="text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-16 flex flex-col items-center gap-8">
            <div className="flex items-center gap-6">
              {history.length > 1 && (
                <button
                  onClick={prevStep}
                  className="flex items-center gap-2 text-zinc-500 hover:text-white font-bold transition-colors"
                >
                  <ChevronLeft size={20} /> Back
                </button>
              )}

              {isMultiSelect && (
                <button
                  onClick={() => nextStep()}
                  disabled={currentAnswers.length === 0}
                  className="flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-xl md:px-12 md:py-5 md:text-2xl font-black text-white transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(229,9,20,0.6)]"
                >
                  Continue
                  <ChevronRight size={24} className="md:w-7 md:h-7" />
                </button>
              )}
            </div>

            <div className="flex justify-center gap-3">
              {history.map((h, i) => (
                <div
                  key={i}
                  className="h-1.5 w-12 rounded-full transition-all duration-500 bg-primary"
                />
              ))}
              {!isComplete && (
                <div className="h-1.5 w-12 rounded-full bg-zinc-800 animate-pulse" />
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function QuizLoadingState() {
  const [messageIndex, setMessageIndex] = useState(0);
  const messages = [
    "Scanning the movie multiverse...",
    "Consulting with the cinephile AI...",
    "Analyzing your unique vibe...",
    "Filtering out the boring stuff...",
    "Applying groundbreaking heuristics...",
    "Synthesizing the perfect match...",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [messages.length]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="mb-8"
      >
        <Sparkles size={80} className="text-primary" />
      </motion.div>
      <h2 className="text-3xl md:text-5xl font-black text-white text-center tracking-tighter mb-4">
        Synthesizing your <span className="text-primary">perfect watch</span>...
      </h2>
      <AnimatePresence mode="wait">
        <motion.p
          key={messageIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-zinc-500 font-medium text-lg uppercase tracking-widest text-center"
        >
          {messages[messageIndex]}
        </motion.p>
      </AnimatePresence>

      <div className="mt-12 flex gap-4">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.2 }}
            className="w-3 h-3 rounded-full bg-primary"
          />
        ))}
      </div>
    </div>
  );
}
