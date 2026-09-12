import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchLoanCollateralManagements,
  fetchLoanCollateralManagement,
  deleteLoanCollateralManagement,
} from "../api/loanCollateralManagement";

export const loanCollateralManagementKeys = {
  all: ["loan-collateral-management"] as const,
  list: (loanId: number | string) => ["loan-collateral-management", loanId] as const,
  detail: (id: number | string) => ["loan-collateral-management", "detail", id] as const,
};

export function useLoanCollateralManagements(loanId: number | string | undefined) {
  return useQuery({
    queryKey: loanCollateralManagementKeys.list(loanId!),
    queryFn: () => fetchLoanCollateralManagements(loanId!),
    enabled: !!loanId,
  });
}

export function useLoanCollateralManagement(collateralId: number | string | undefined) {
  return useQuery({
    queryKey: loanCollateralManagementKeys.detail(collateralId!),
    queryFn: () => fetchLoanCollateralManagement(collateralId!),
    enabled: !!collateralId,
  });
}

export function useDeleteLoanCollateralManagement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      loanId,
      collateralId,
    }: {
      loanId: number | string;
      collateralId: number | string;
    }) => deleteLoanCollateralManagement(loanId, collateralId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: loanCollateralManagementKeys.list(variables.loanId),
      });
    },
  });
}
