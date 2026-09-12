export interface LoanCollateralManagement {
  id: number;
  clientCollateralId: number;
  quantity: number;
  total: number;
  totalCollateral: number;
  loanId?: number;
  isReleased?: boolean;
  collateralName?: string;
  basePrice?: number;
  pctToBase?: number;
  unitType?: string;
}

export interface LoanCollateralDeleteResponse {
  resourceId: number;
  loanId: number;
}

export interface LoanCollateralManagementCreateRequest {
  clientCollateralId: number;
  quantity: number;
  locale?: string;
}
