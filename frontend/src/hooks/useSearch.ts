import { useQuery } from "@tanstack/react-query";
import { searchService } from "../services/search.service";

export function useSearch(query: string, limit = 5) {
  return useQuery({
    queryKey: ["globalSearch", query, limit],
    queryFn: () => searchService.globalSearch(query, limit),
    enabled: query.length >= 2, // Only fetch if we have 2 or more characters
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}
