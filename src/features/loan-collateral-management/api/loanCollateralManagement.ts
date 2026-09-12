import client from "@/api/client";
import type {
  LoanCollateralManagement,
  LoanCollateralDeleteResponse,
} from "../types/loanCollateralManagement";

export async function fetchLoanCollateralManagements(
  loanId: number | string,
): Promise<LoanCollateralManagement[]> {
  const { data } = await client.get<LoanCollateralManagement[]>(
    `/loan-collateral-management/${loanId}`,
  );
  return data;
}

export async function fetchLoanCollateralManagement(
  collateralId: number | string,
): Promise<LoanCollateralManagement> {
  const { data } = await client.get<LoanCollateralManagement>(
    `/loan-collateral-management/${collateralId}`,
  );
  return data;
}

export async function deleteLoanCollateralManagement(
  loanId: number | string,
  collateralId: number | string,
): Promise<LoanCollateralDeleteResponse> {
  const { data } = await client.delete<LoanCollateralDeleteResponse>(
    `/loan-collateral-management/${collateralId}`,
  );
  return data;
}
