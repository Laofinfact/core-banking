import { useQuery } from "@tanstack/react-query";
import { fetchClientObligeeDetails } from "../api/obligee";

export const clientObligeeKeys = {
  all: ["clients", "obligee"] as const,
  detail: (clientId: number | string) => ["clients", "obligee", clientId] as const,
};

export function useClientObligeeDetails(clientId: number | string | undefined) {
  return useQuery({
    queryKey: clientObligeeKeys.detail(clientId!),
    queryFn: () => fetchClientObligeeDetails(clientId!),
    enabled: !!clientId,
    staleTime: 60_000,
  });
}
