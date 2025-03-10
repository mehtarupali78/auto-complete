

import { Suggestion } from "../types";

export const fetchRealSuggestions = async (query: string): Promise<Suggestion[]> => {
    if (!query) return [];
    const response = await fetch(
      `https://api.datamuse.com/sug?s=${query}` 
    );
    const results = await response.json();
    return results.map((item: { word: string }, index: number) => ({
      id: index + 1,
      name: item.word,
    }));
  };