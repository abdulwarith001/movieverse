"use client";

import { useState } from "react";
import { Search, Sparkles } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  loading?: boolean;
}

export function SearchBar({ onSearch, loading }: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-xl mx-auto">
      <div className="relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Try "movies related to startups" or "90s space adventure"'
          className="w-full bg-zinc-900/80 border-2 border-zinc-800 text-white rounded-full py-4 pl-14 pr-32 focus:outline-none focus:border-primary transition-all text-lg placeholder:text-zinc-500"
        />
        <Search
          className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500"
          size={24}
        />

        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="absolute right-2 top-2 bottom-2 bg-primary hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 rounded-full font-bold flex items-center gap-2 transition-all"
        >
          {loading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              <Sparkles size={18} /> Ask AI
            </>
          )}
        </button>
      </div>
    </form>
  );
}
