"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Quiz } from "@/components/Quiz";
import { Play, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMovieQuiz } from "@/hooks/useMovieQuiz";
import { ResultsGallery } from "@/components/ResultsGallery";

export default function Home() {
  const [showQuiz, setShowQuiz] = useState(false);
  const {
    recommendations,
    loading,
    error,
    isComplete,
    resetQuiz,
    magicSearch,
  } = useMovieQuiz();
  const [magicPrompt, setMagicPrompt] = useState("");

  const handleReset = () => {
    resetQuiz();
    setShowQuiz(false);
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <Navbar />

      <AnimatePresence mode="wait">
        {!showQuiz && !isComplete ? (
          <motion.div
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex min-h-screen flex-col items-center justify-center bg-[url('https://images.unsplash.com/photo-1574267432553-4b4628081c31?q=80&w=2073&auto=format&fit=crop')] bg-cover bg-center"
          >
            <div className="absolute inset-0 bg-black/70" />

            <div className="relative z-10 text-center px-4 w-full max-w-4xl">
              <h1 className="mb-4 text-4xl font-black uppercase tracking-tighter text-white md:text-7xl leading-[1.1]">
                Unlimited movies, <br /> tailored for{" "}
                <span className="text-primary">you.</span>
              </h1>
              <p className="mb-8 text-lg text-gray-200 md:text-2xl max-w-2xl mx-auto leading-relaxed">
                Find your next favorite Netflix movie in seconds. Take the
                immersive taste quiz and discover hidden gems.
              </p>

              <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary to-rose-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                  <div className="relative flex flex-col md:flex-row items-stretch md:items-center bg-zinc-900/90 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden shadow-2xl">
                    <div className="flex items-center flex-1">
                      <Sparkles
                        className="ml-5 text-primary shrink-0"
                        size={20}
                      />
                      <input
                        type="text"
                        placeholder="What's your vibe? (e.g. spooky 80s space horror)"
                        value={magicPrompt}
                        onChange={(e) => setMagicPrompt(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && magicPrompt.length > 3) {
                            magicSearch(magicPrompt);
                          }
                        }}
                        className="w-full bg-transparent py-5 pl-4 pr-4 text-base md:text-lg text-white focus:outline-none placeholder:text-zinc-500"
                      />
                    </div>
                    <button
                      onClick={() =>
                        magicPrompt.length > 3 && magicSearch(magicPrompt)
                      }
                      className="m-3 md:m-0 md:absolute md:right-3 px-6 py-4 md:py-2.5 bg-primary text-white text-sm font-black rounded-lg hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
                    >
                      AI SEARCH
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-px bg-white/10 flex-1" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                    OR
                  </span>
                  <div className="h-px bg-white/10 flex-1" />
                </div>

                <button
                  onClick={() => setShowQuiz(true)}
                  className="mx-auto flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-white/10 active:scale-95 md:px-10 md:py-4"
                >
                  <Play size={20} className="text-primary" /> Take the Taste
                  Quiz
                </button>
              </div>
            </div>

            <div className="absolute bottom-0 h-40 w-full netflix-gradient" />
          </motion.div>
        ) : isComplete ? (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-background min-h-screen"
          >
            <ResultsGallery
              movies={recommendations}
              loading={loading}
              error={error}
              onReset={handleReset}
            />
          </motion.div>
        ) : (
          <motion.div
            key="quiz"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-background min-h-screen"
          >
            <Quiz />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
