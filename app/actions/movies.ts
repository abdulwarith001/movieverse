"use server";

import { cache } from "react";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const NETFLIX_NETWORK_ID = 213;

const fetchTMDB = async (
  endpoint: string,
  params: Record<string, string | number | boolean> = {},
) => {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.append("api_key", TMDB_API_KEY || "");
  url.searchParams.append("language", "en-US");

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });

  const response = await fetch(url.toString(), {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("TMDB API Error:", response.status, errorData);
    throw new Error(`TMDB API Error: ${response.status}`);
  }
  return response.json();
};

const GROQ_API_KEY = process.env.GROQ_API_KEY;

export const getRecommendationsAction = async (
  genres: number[],
  era?: string,
  mood?: string,
  runtime?: "short" | "standard" | "long",
  seedId?: string,
) => {
  const strategies: Promise<any[]>[] = [];

  // 1. Seed Strategy
  if (seedId) {
    const [type, id] = seedId.split("-");
    const endpoint =
      type === "tv"
        ? `/tv/${id}/recommendations`
        : `/movie/${id}/recommendations`;
    strategies.push(
      fetchTMDB(endpoint).then((d) =>
        (d.results || []).map((i: any) => ({ ...i, strategy: "seed" })),
      ),
    );
  }

  // 2. Discover Strategy (Genre + Era + Mood)
  const discoverParams: Record<string, string | number | boolean> = {
    with_networks: NETFLIX_NETWORK_ID,
    sort_by: "popularity.desc",
    "vote_count.gte": 100,
  };
  if (genres.length > 0) discoverParams.with_genres = genres.join("|");

  const applyEra = (p: Record<string, string | number | boolean>) => {
    if (era === "classic") p["release_date.lte"] = "1989-12-31";
    else if (era === "90s") {
      p["release_date.gte"] = "1990-01-01";
      p["release_date.lte"] = "1999-12-31";
    } else if (era === "2000s") {
      p["release_date.gte"] = "2000-01-01";
      p["release_date.lte"] = "2009-12-31";
    } else if (era === "modern") p["release_date.gte"] = "2010-01-01";
  };

  const moodKeywords: Record<string, string> = {
    light: "6078,9717,35,10224,155030,10714,10183",
    intense: "9748,3007,9663,10349,15060,186253,10158",
    relaxed: "156470,9663,10183,10714,155030",
    emotional: "10683,180547,10534,10714,15060,10158",
  };

  applyEra(discoverParams);
  if (mood && moodKeywords[mood])
    discoverParams["with_keywords"] = moodKeywords[mood];

  strategies.push(
    fetchTMDB("/discover/movie", discoverParams).then((d) =>
      (d.results || []).map((i: any) => ({ ...i, strategy: "discover" })),
    ),
  );

  // 3. Underrated Gems Strategy
  strategies.push(
    fetchTMDB("/discover/movie", {
      ...discoverParams,
      "vote_average.gte": 7.5,
      "vote_count.lte": 1000,
      "vote_count.gte": 50,
      sort_by: "vote_average.desc",
    }).then((d) =>
      (d.results || []).map((i: any) => ({ ...i, strategy: "underrated" })),
    ),
  );

  // 4. Trending/Popular Strategy
  strategies.push(
    fetchTMDB("/trending/movie/week").then((d) =>
      (d.results || []).map((i: any) => ({ ...i, strategy: "trending" })),
    ),
  );

  const strategyResults = await Promise.all(strategies);
  let candidates = strategyResults.flat();

  // Deduplicate by ID
  const seen = new Set();
  candidates = candidates.filter((c) => {
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return true;
  });

  // Apply runtime filter manually to candidates to keep it flexible
  if (runtime) {
    const runtimeLimit =
      runtime === "short" ? 100 : runtime === "standard" ? 150 : 999;
    const runtimeMin = runtime === "long" ? 151 : 0;
    // Note: candidates from basic discover don't have runtime usually, so we might need to fetch details
    // For now, let's just score them higher if they match runtime in AI pass
  }

  // Scoring Logic (Heuristic for fallback or pre-AI ranking)
  const scored = candidates
    .map((item: any) => {
      let score = 0;
      const title = item.title || item.name;
      const releaseYear = (
        item.release_date ||
        item.first_air_date ||
        ""
      ).split("-")[0];

      if (genres.length > 0) {
        const itemGenres = item.genre_ids || [];
        const matchCount = genres.filter((g) => itemGenres.includes(g)).length;
        score += (matchCount / genres.length) * 30;
      }

      if (item.strategy === "seed") score += 40;
      if (item.strategy === "underrated") score += 20;

      const quality =
        (item.vote_average || 0) * 1.5 + (item.popularity || 0) / 1000;
      score += Math.min(quality, 20);

      return {
        ...item,
        title,
        release_date: item.release_date || item.first_air_date,
        matchScore: score,
        vibeScore: Math.round(Math.min(score + 40, 98)), // Initial guess
      };
    })
    .sort((a: any, b: any) => b.matchScore - a.matchScore)
    .slice(0, 15); // Top 15 for AI re-ranking

  // AI Re-ranking and Reasoning
  if (GROQ_API_KEY) {
    try {
      return await aiReRankAndReason(scored, {
        genres,
        era,
        mood,
        runtime,
        seedId,
      });
    } catch (e) {
      console.error("Groq AI ranking failed, returning heuristics", e);
    }
  }

  return scored;
};

export const getRecommendationsFromPromptAction = async (prompt: string) => {
  if (!GROQ_API_KEY) throw new Error("Groq API key missing");

  const { Groq } = await import("groq-sdk");
  const groq = new Groq({ apiKey: GROQ_API_KEY });

  // 1. AI Intent Expansion: Extract filters AND specific representative titles
  const expansionCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are a master cinephile and industry expert. Your goal is to find movies and TV shows that specifically answer the user's question, even if the user doesn't know the titles. Return ONLY JSON.",
      },
      {
        role: "user",
        content: `Prompt: "${prompt}"
        
        Return JSON with:
        - representative_titles: string[] (5 specific movies/shows that BEST answer this exact prompt, e.g. ["The Social Network", "Silicon Valley", "Steve Jobs"])
        - search_queries: string[] (3 general search terms, e.g. ["startup marketing", "user growth movie"])
        - genre_names: string[]
        - era: "classic" | "90s" | "2000s" | "modern" | null
        - include_tv: boolean (true if series fit the prompt better)
        - keywords: string[] (thematic tags for scoring, e.g. ["entrepreneur", "growth", "marketing"])`,
      },
    ],
    model: "llama-3.3-70b-versatile",
    response_format: { type: "json_object" },
  });

  const intents = JSON.parse(
    expansionCompletion.choices[0]?.message?.content || "{}",
  );

  const fetchPromises: Promise<any[]>[] = [];

  // 2. Strategy A: Search for Representative Titles (Highest relevance)
  if (intents.representative_titles?.length > 0) {
    intents.representative_titles.forEach((title: string) => {
      fetchPromises.push(
        fetchTMDB("/search/multi", { query: title, include_adult: false }).then(
          (d) => (d.results || []).slice(0, 3), // Get top 3 for each title
        ),
      );
    });
  }

  // 3. Strategy B: Semantic Search Queries
  if (intents.search_queries?.length > 0) {
    intents.search_queries.forEach((query: string) => {
      fetchPromises.push(
        fetchTMDB("/search/multi", { query, include_adult: false }).then((d) =>
          (d.results || []).slice(0, 5),
        ),
      );
    });
  }

  // 4. Strategy C: Discovery Filters (Backup/Breadth)
  const discoverParams: Record<string, string | number | boolean> = {
    sort_by: "popularity.desc",
    "vote_count.gte": 20, // Lowered for niche startup documentaries
  };

  const genreMap: Record<string, number> = {
    action: 28,
    adventure: 12,
    animation: 16,
    comedy: 35,
    crime: 80,
    documentary: 99,
    drama: 18,
    family: 10751,
    fantasy: 14,
    history: 36,
    horror: 27,
    music: 10402,
    mystery: 9648,
    romance: 10749,
    science_fiction: 878,
    "sci-fi": 878,
    thriller: 53,
    war: 10752,
    western: 37,
  };

  const genreIds = (intents.genre_names || [])
    .map((g: string) => genreMap[g.toLowerCase().replace(/ /g, "_")])
    .filter(Boolean);

  if (genreIds.length > 0) discoverParams.with_genres = genreIds.join("|");

  const applyEra = (
    p: Record<string, string | number | boolean>,
    era: string | null,
  ) => {
    if (era === "classic") p["release_date.lte"] = "1989-12-31";
    else if (era === "90s") {
      p["release_date.gte"] = "1990-01-01";
      p["release_date.lte"] = "1999-12-31";
    } else if (era === "2000s") {
      p["release_date.gte"] = "2000-01-01";
      p["release_date.lte"] = "2009-12-31";
    } else if (era === "modern") p["release_date.gte"] = "2010-01-01";
  };
  applyEra(discoverParams, intents.era);

  fetchPromises.push(
    fetchTMDB("/discover/movie", discoverParams).then((d) => d.results || []),
  );
  if (intents.include_tv) {
    fetchPromises.push(
      fetchTMDB("/discover/tv", discoverParams).then((d) => d.results || []),
    );
  }

  // 5. Collect, Deduplicate and Thematic Clean
  const resultsSets = await Promise.all(fetchPromises);
  const rawFlattened = resultsSets.flat().map((item) => ({
    ...item,
    title: item.title || item.name,
    release_date: item.release_date || item.first_air_date,
    media_type: item.media_type || (item.first_air_date ? "tv" : "movie"),
  }));

  const thematicKeywords = (intents.keywords || []).map((k: string) =>
    k.toLowerCase(),
  );
  const seen = new Set();
  const candidates = rawFlattened
    .filter((c) => {
      if (!c.title || seen.has(c.id)) return false;
      seen.add(c.id);

      // Heuristic: If we have thematic keywords, boost/keep matches
      if (thematicKeywords.length > 0) {
        const textToSearch = `${c.title} ${c.overview}`.toLowerCase();
        const hasKeyword = thematicKeywords.some((k: string) =>
          textToSearch.includes(k),
        );
        // We keep it if it has a keyword OR it's from a title-specific search (those appear earlier in rawFlattened usually)
        // or it's popular enough.
        return hasKeyword || (c.vote_count || 0) > 200;
      }
      return true;
    })
    .slice(0, 50);

  // 6. Final AI Re-rank with high candidate count
  return aiReRankAndReason(candidates, { prompt, ...intents });
};

async function aiReRankAndReason(candidates: any[], context: any) {
  const { Groq } = await import("groq-sdk");
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const contextStr = context.prompt
    ? `User Prompt: "${context.prompt}"`
    : `Genres: ${context.genres?.join(",")}
       Era: ${context.era || "Any"}
       Mood: ${context.mood || "Any"}
       Runtime: ${context.runtime || "Any"}`;

  const prompt = `You are a movie expert and cinephile. Re-rank these movies for a user based on this context:
  ${contextStr}

  CRITICAL: If a "User Prompt" is provided, prioritize movies that directly fulfill the goal of that prompt (e.g. teaching a specific skill, matching a very specific theme).

  Movies:
  ${candidates.map((c, i) => `${i + 1}. ${c.title} (ID: ${c.id}, Overview: ${c.overview})`).join("\n")}

  Return a JSON array of objects with these fields exactly:
  - id: (the original movie id)
  - matchScore: (0-100 based on preference match)
  - vibeScore: (0-100, specific to the mood/vibe)
  - matchReason: (A punchy, witty, 1-sentence reason why this movie fits their specific request. Be creative and personal!)

  Order the array from best match to worst. Return ONLY the JSON.`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
    response_format: { type: "json_object" },
  });

  const responseText = completion.choices[0]?.message?.content || "{}";
  const response = JSON.parse(responseText);
  const rankedData =
    response.movies ||
    response.results ||
    response.ranking ||
    response.items ||
    [];

  return candidates
    .map((c) => {
      const aiMatch = (
        Array.isArray(rankedData) ? rankedData : Object.values(rankedData)
      ).find((m: any) => m.id === c.id || String(m.id) === String(c.id));
      return {
        ...c,
        matchScore: aiMatch?.matchScore || 50,
        vibeScore: aiMatch?.vibeScore || 50,
        matchReason:
          aiMatch?.matchReason || "A solid choice based on your interests.",
      };
    })
    .sort((a: any, b: any) => b.matchScore - a.matchScore);
}

export const searchMoviesAction = async (query: string) => {
  // Use multi-search to find both movies and TV shows
  const data = await fetchTMDB("/search/multi", {
    query,
    include_adult: "false",
  });

  // Filter for movies and TV shows only, and standardize title field
  return (data.results || [])
    .filter(
      (item: any) => item.media_type === "movie" || item.media_type === "tv",
    )
    .map((item: any) => ({
      ...item,
      title: item.title || item.name, // TV shows use 'name'
      release_date: item.release_date || item.first_air_date, // TV shows use 'first_air_date'
    }));
};

export const getMovieDetailsAction = cache(
  async (id: number, type: "movie" | "tv" = "movie") => {
    return fetchTMDB(`/${type}/${id}`, {
      append_to_response: "videos,credits,recommendations",
    });
  },
);
