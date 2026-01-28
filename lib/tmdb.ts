const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

// Netflix network ID on TMDB is 213
const NETFLIX_NETWORK_ID = 213;

export async function fetchTMDB(
  endpoint: string,
  params: Record<string, string | number> = {},
) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.append("api_key", TMDB_API_KEY || "");
  url.searchParams.append("language", "en-US");

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });

  const response = await fetch(url.toString(), {
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.statusText}`);
  }

  return response.json();
}

export async function getNetflixMovies(page = 1) {
  return fetchTMDB("/discover/movie", {
    with_networks: NETFLIX_NETWORK_ID,
    page,
    sort_by: "popularity.desc",
  });
}

export async function getGenres() {
  const data = await fetchTMDB("/genre/movie/list");
  return data.genres;
}

export async function getRecommendations(
  genres: number[],
  era?: string,
  mood?: string,
) {
  const baseParams: Record<string, string | number> = {
    with_networks: NETFLIX_NETWORK_ID,
    sort_by: "popularity.desc",
    with_genres: genres.join("|"),
    "vote_count.gte": 50, // Relaxed slightly from 100 for more results
  };

  const applyEra = (p: Record<string, string | number>) => {
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
    light: "6078,9717,156470", // feel-good, relaxed
    intense: "9748,3007", // suspense
    relaxed: "9663,156470", // slice of life
    emotional: "10683,180547", // tearjerker
  };

  // Try with all filters first
  let params = { ...baseParams };
  applyEra(params);
  if (mood && moodKeywords[mood]) params["with_keywords"] = moodKeywords[mood];

  let data = await fetchTMDB("/discover/movie", params);

  // Fallback 1: Remove mood keywords if no results
  if (data.results.length === 0 && mood) {
    params = { ...baseParams };
    applyEra(params);
    data = await fetchTMDB("/discover/movie", params);
  }

  // Fallback 2: Remove era filter if still no results
  if (data.results.length === 0) {
    data = await fetchTMDB("/discover/movie", baseParams);
  }

  return data;
}

export async function searchMovies(query: string) {
  // 1. Try to find if the query matches any TMDB keywords to use discovery (better results)
  // For queries like "startup", "space", "hacking", etc.
  const keywordData = await fetchTMDB("/search/keyword", { query });

  if (keywordData.results?.length > 0) {
    const keywordIds = keywordData.results
      .slice(0, 3)
      .map((k: any) => k.id)
      .join("|");
    const discoveryData = await fetchTMDB("/discover/movie", {
      with_networks: NETFLIX_NETWORK_ID,
      with_keywords: keywordIds,
      sort_by: "popularity.desc",
    });

    if (discoveryData.results?.length > 0) {
      return discoveryData;
    }
  }

  // 2. Fallback to standard text search
  const searchData = await fetchTMDB("/search/movie", {
    query,
    include_adult: "false",
  });

  // Since text search doesn't support 'with_networks', we can't strictly filter for Netflix here
  // without fetching network info for every movie (expensive).
  // We'll return the search results as a fallback.
  return searchData;
}
