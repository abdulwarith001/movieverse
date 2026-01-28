"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Play,
  Star,
  Calendar,
  Clock,
  User,
  Loader2,
  Sparkles,
} from "lucide-react";
import { getMovieDetailsAction } from "@/app/actions/movies";

interface MovieDetailModalProps {
  movieId: number;
  mediaType: "movie" | "tv";
  onClose: () => void;
  matchReason?: string;
  vibeScore?: number;
}

export function MovieDetailModal({
  movieId,
  mediaType,
  onClose,
  matchReason,
  vibeScore,
}: MovieDetailModalProps) {
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetails() {
      setLoading(true);
      try {
        const data = await getMovieDetailsAction(movieId, mediaType);
        setDetails(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();

    // Lock scroll
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [movieId, mediaType]);

  const trailer = details?.videos?.results?.find(
    (v: any) => v.type === "Trailer" && v.site === "YouTube",
  );

  const netflixSearchUrl = `https://www.netflix.com/search?q=${encodeURIComponent(details?.title || details?.name || "")}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-5xl overflow-hidden rounded-3xl bg-zinc-900 shadow-2xl border border-white/10 max-h-[90vh] flex flex-col"
        >
          {loading ? (
            <LoadingState />
          ) : (
            <>
              <button
                onClick={onClose}
                className="absolute right-6 top-6 z-10 rounded-full bg-black/50 p-2 text-white/70 hover:bg-black hover:text-white transition-all shadow-lg"
              >
                <X size={24} />
              </button>

              <div className="overflow-y-auto custom-scrollbar">
                {/* Hero / Trailer Section */}
                <div className="relative aspect-video w-full bg-zinc-800">
                  {trailer ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailer.key}`}
                      title="Movie Trailer"
                      className="h-full w-full pointer-events-none"
                      allow="autoplay"
                    />
                  ) : (
                    <img
                      src={`https://image.tmdb.org/t/p/original${details?.backdrop_path || details?.poster_path}`}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />

                  <div className="absolute bottom-8 left-8 right-8">
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter">
                      {details?.title || details?.name}
                    </h2>
                    {matchReason && (
                      <div className="mb-6 p-4 rounded-xl bg-primary/20 border border-primary/30 backdrop-blur-md inline-block max-w-2xl">
                        <div className="flex gap-3">
                          <Sparkles
                            className="text-primary shrink-0"
                            size={20}
                          />
                          <p className="text-white font-medium italic leading-relaxed">
                            "{matchReason}"
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-4 items-center">
                      <a
                        href={netflixSearchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-md bg-white px-8 py-3 font-black text-black hover:bg-zinc-200 transition-all active:scale-95"
                      >
                        <Play fill="black" size={20} /> Play on Netflix
                      </a>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 p-8 md:p-12">
                  <div className="lg:col-span-2">
                    <div className="flex flex-wrap items-center gap-6 mb-8 text-sm font-bold text-zinc-400">
                      <span className="flex items-center gap-1.5 text-green-500">
                        <Star size={18} fill="currentColor" />
                        {typeof details?.vote_average === "number"
                          ? details.vote_average.toFixed(1)
                          : "0.0"}{" "}
                        Rating
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar size={18} />
                        {details?.release_date?.split("-")[0] ||
                          details?.first_air_date?.split("-")[0]}
                      </span>
                      {details?.runtime && (
                        <span className="flex items-center gap-1.5">
                          <Clock size={18} />
                          {details.runtime} min
                        </span>
                      )}
                    </div>

                    <p className="text-xl text-zinc-300 leading-relaxed mb-10">
                      {details?.overview}
                    </p>

                    <div>
                      <h4 className="text-zinc-500 font-black uppercase tracking-widest text-xs mb-6">
                        Cast
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                        {details?.credits?.cast
                          ?.slice(0, 4)
                          .map((person: any) => (
                            <div
                              key={person.id}
                              className="flex flex-col gap-2"
                            >
                              {person.profile_path ? (
                                <img
                                  src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                                  alt={person.name}
                                  className="aspect-square rounded-full object-cover border-2 border-white/5"
                                />
                              ) : (
                                <div className="aspect-square rounded-full bg-zinc-800 flex items-center justify-center text-zinc-600">
                                  <User size={32} />
                                </div>
                              )}
                              <div className="text-center">
                                <div className="text-sm font-bold text-white leading-tight">
                                  {person.name}
                                </div>
                                <div className="text-xs text-zinc-500 line-clamp-1">
                                  {person.character}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <h4 className="text-zinc-500 font-black uppercase tracking-widest text-xs mb-4">
                        Genres
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {details?.genres?.map((g: any) => (
                          <span
                            key={g.id}
                            className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-sm font-medium"
                          >
                            {g.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {details?.production_companies?.length > 0 && (
                      <div>
                        <h4 className="text-zinc-500 font-black uppercase tracking-widest text-xs mb-4">
                          Production
                        </h4>
                        <p className="text-zinc-400 font-medium">
                          {details.production_companies[0].name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function LoadingState() {
  return (
    <div className="h-full min-h-[400px] w-full flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={48} />
    </div>
  );
}
