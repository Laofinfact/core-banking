import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchClientCollaterals,
  fetchCollateralOptions,
  createClientCollateral,
  updateClientCollateral,
  deleteClientCollateral,
} from "../api/collaterals";
import type { ClientCollateralRequest, ClientCollateralUpdateRequest } from "../api/collaterals";
import { clientKeys } from "./useClients";

export const clientCollateralKeys = {
  all: (clientId: number | string) => [...clientKeys.detail(clientId), "collaterals"] as const,
  options: ["collaterals", "options"] as const,
};

export function useClientCollaterals(clientId: number | string | undefined) {
  return useQuery({
    queryKey: clientCollateralKeys.all(clientId!),
    queryFn: () => fetchClientCollaterals(clientId!),
    enabled: !!clientId,
  });
}

/**
 * Fetch available collateral products from /collateral-management (not client-specific).
 */
export function useCollateralOptions() {
  return useQuery({
    queryKey: clientCollateralKeys.options,
    queryFn: fetchCollateralOptions,
    staleTime: 5 * 60_000,
  });
}

export function useCreateClientCollateral() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clientId, payload }: { clientId: number | string; payload: ClientCollateralRequest }) =>
      createClientCollateral(clientId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: clientCollateralKeys.all(variables.clientId) });
    },
  });
}

export function useUpdateClientCollateral() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      clientId,
      collateralId,
      payload,
    }: {
      clientId: number | string;
      collateralId: number | string;
      payload: ClientCollateralUpdateRequest;
    }) => updateClientCollateral(clientId, collateralId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: clientCollateralKeys.all(variables.clientId) });
    },
  });
}

export function useDeleteClientCollateral() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clientId, collateralId }: { clientId: number | string; collateralId: number | string }) =>
      deleteClientCollateral(clientId, collateralId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: clientCollateralKeys.all(variables.clientId) });
    },
  });
}
