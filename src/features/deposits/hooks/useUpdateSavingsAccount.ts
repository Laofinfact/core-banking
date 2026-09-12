import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSavingsAccount } from "../api/deposit";
import type { SavingsAccountCreateRequest } from "../types/deposit";
import { depositKeys } from "./useSavingsAccounts";

export function useUpdateSavingsAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ accountId, payload }: { accountId: number; payload: Partial<SavingsAccountCreateRequest> }) =>
      updateSavingsAccount(accountId, payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: depositKeys.all });
      qc.invalidateQueries({ queryKey: depositKeys.savingsDetail(variables.accountId) });
    },
  });
}
