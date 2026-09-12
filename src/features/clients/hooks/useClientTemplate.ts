import { useQuery } from "@tanstack/react-query";
import { fetchClientTemplate } from "../api/client";
import type { ClientTemplate } from "../types/client";
import { clientKeys } from "./useClients";

/**
 * Query hook for fetching client template data (offices, staff, genders, etc.).
 * Used by Create/Edit Client forms for dropdowns.
 */
export function useClientTemplate(commandParam?: string) {
  return useQuery<ClientTemplate>({
    queryKey: [...clientKeys.template, commandParam] as const,
    queryFn: () => fetchClientTemplate(commandParam),
    staleTime: 5 * 60_000, // Template data changes rarely
  });
}
