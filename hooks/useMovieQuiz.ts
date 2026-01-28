"use client";

import { useState, useCallback } from "react";
import { QuizState, Movie } from "@/types";
import {
  getRecommendationsAction,
  searchMoviesAction,
} from "@/app/actions/movies";
import { MOVIE_QUIZ } from "@/lib/quiz-data";

export function useMovieQuiz() {
  const [history, setHistory] = useState<number[]>([0]);
  const [isComplete, setIsComplete] = useState(false);
  const [answers, setAnswers] = useState<Partial<QuizState>>({
    genres: [],
  });
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentStepIndex = history[history.length - 1];
  const currentQuestion = MOVIE_QUIZ[currentStepIndex];

  const fetchResultsWithData = async (lastAnswers: Partial<QuizState>) => {
    setLoading(true);
    setError(null);
    try {
      const results = await getRecommendationsAction(
        (lastAnswers.genres as number[]) || [],
        lastAnswers.era,
        lastAnswers.mood,
        lastAnswers.runtime as any,
        lastAnswers.seedMovieId,
      );
      setRecommendations(results);
    } catch (err: any) {
      setError(err.message || "Failed to fetch recommendations");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = useCallback(
    (customAnswer?: any) => {
      const option = currentQuestion.options.find(
        (opt) => opt.value === customAnswer,
      );
      const nextId = option?.nextStepId;

      const newAnswers = {
        ...answers,
        [currentQuestion.key]: customAnswer ?? answers[currentQuestion.key],
      };
      setAnswers(newAnswers);

      if (nextId) {
        const nextIndex = MOVIE_QUIZ.findIndex((q) => q.id === nextId);
        if (nextIndex !== -1) {
          setHistory((prev) => [...prev, nextIndex]);
          return;
        }
      }

      // If no explicit nextId or at the designated end (runtime step)
      if (currentQuestion.id === "runtime") {
        fetchResultsWithData(newAnswers);
        setIsComplete(true);
      } else if (currentStepIndex < MOVIE_QUIZ.length - 1) {
        setHistory((prev) => [...prev, currentStepIndex + 1]);
      } else {
        fetchResultsWithData(newAnswers);
        setIsComplete(true);
      }
    },
    [currentStepIndex, currentQuestion, answers],
  );

  const prevStep = useCallback(() => {
    if (history.length > 1) {
      setHistory((prev) => prev.slice(0, -1));
    }
  }, [history]);

  const toggleAnswer = (key: keyof QuizState, value: any) => {
    setAnswers((prev) => {
      const current = (prev[key] as any[]) || [];
      const next = current.includes(value)
        ? current.filter((v: any) => v !== value)
        : [...current, value];
      return { ...prev, [key]: next };
    });
  };

  const setSingleAnswer = (key: keyof QuizState, value: any) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const search = async (query: string) => {
    setLoading(true);
    setError(null);
    setIsComplete(true);
    try {
      const results = await searchMoviesAction(query);
      setRecommendations(results);
    } catch (err: any) {
      setError(err.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const magicSearch = async (prompt: string) => {
    setLoading(true);
    setError(null);
    setIsComplete(true);
    try {
      const { getRecommendationsFromPromptAction } =
        await import("@/app/actions/movies");
      const results = await getRecommendationsFromPromptAction(prompt);
      setRecommendations(results);
    } catch (err: any) {
      setError(err.message || "Magic search failed");
    } finally {
      setLoading(false);
    }
  };

  const resetQuiz = () => {
    setHistory([0]);
    setIsComplete(false);
    setAnswers({ genres: [] });
    setRecommendations([]);
  };

  return {
    step: currentStepIndex,
    history,
    answers,
    recommendations,
    loading,
    error,
    nextStep,
    prevStep,
    toggleAnswer,
    setSingleAnswer,
    search,
    magicSearch,
    resetQuiz,
    isComplete,
    currentQuestion,
  };
}
