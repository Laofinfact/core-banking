import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchClientCollateralManagements,
  fetchClientCollateralManagement,
  fetchClientCollateralTemplate,
  createClientCollateralManagement,
  updateClientCollateralManagement,
  deleteClientCollateralManagement,
} from "../api/clientCollateral";
import type {
  ClientCollateralCreateRequest,
  ClientCollateralUpdateRequest,
} from "../types/clientCollateral";

export const clientCollateralManagementKeys = {
  all: (clientId: number | string) => ["client-collateral-management", clientId] as const,
  list: (clientId: number | string) => ["client-collateral-management", clientId, "list"] as const,
  detail: (clientId: number | string, id: number | string) =>
    ["client-collateral-management", clientId, "detail", id] as const,
  template: (clientId: number | string) =>
    ["client-collateral-management", clientId, "template"] as const,
};

export function useClientCollateralManagements(clientId: number | string | undefined, prodId?: number | string) {
  return useQuery({
    queryKey: [...clientCollateralManagementKeys.list(clientId!), prodId ? { prodId } : {}],
    queryFn: () => fetchClientCollateralManagements(clientId!, prodId),
    enabled: !!clientId,
  });
}

export function useClientCollateralManagement(
  clientId: number | string | undefined,
  collateralId: number | string | undefined,
) {
  return useQuery({
    queryKey: clientCollateralManagementKeys.detail(clientId!, collateralId!),
    queryFn: () => fetchClientCollateralManagement(clientId!, collateralId!),
    enabled: !!clientId && !!collateralId,
  });
}

export function useClientCollateralTemplate(clientId: number | string | undefined) {
  return useQuery({
    queryKey: clientCollateralManagementKeys.template(clientId!),
    queryFn: () => fetchClientCollateralTemplate(clientId!),
    enabled: !!clientId,
    staleTime: 5 * 60_000,
  });
}

export function useCreateClientCollateralManagement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      clientId,
      payload,
    }: {
      clientId: number | string;
      payload: ClientCollateralCreateRequest;
    }) => createClientCollateralManagement(clientId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: clientCollateralManagementKeys.all(variables.clientId),
      });
    },
  });
}

export function useUpdateClientCollateralManagement() {
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
    }) => updateClientCollateralManagement(clientId, collateralId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: clientCollateralManagementKeys.all(variables.clientId),
      });
      queryClient.invalidateQueries({
        queryKey: clientCollateralManagementKeys.detail(variables.clientId, variables.collateralId),
      });
    },
  });
}

export function useDeleteClientCollateralManagement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      clientId,
      collateralId,
    }: {
      clientId: number | string;
      collateralId: number | string;
    }) => deleteClientCollateralManagement(clientId, collateralId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: clientCollateralManagementKeys.all(variables.clientId),
      });
    },
  });
}
