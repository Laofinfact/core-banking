export interface ClientCollateralManagement {
  id: number;
  name: string;
  quantity: number;
  total: number;
  totalCollateral: number;
  clientId: number;
  collateralId: number;
  basePrice: number;
  pctToBase: number;
  unitType: string;
  currency: string;
  loanTransactionData?: LoanTransactionData[];
}

export interface LoanTransactionData {
  loanId?: number;
  date?: string | number[];
  outstandingLoanBalance?: number;
  principalPortion?: number;
}

export interface ClientCollateralCreateRequest {
  collateralId: number;
  quantity: number;
  locale: string;
}

export interface ClientCollateralUpdateRequest {
  quantity: number;
  locale: string;
}

export interface ClientCollateralCommandResponse {
  resourceId: number;
  clientId: number;
  changes?: {
    quantity: number;
    locale: string;
  };
}

export interface LoanCollateralTemplate {
  collateralId: number;
  basePrice: number;
  pctToBase: number;
  quantity: number;
  name: string;
}

export interface ClientCollateralTemplateResponse {
  currencies: Array<{
    code: string;
    name: string;
    decimalPlaces?: number;
    inMultiplesOf?: number;
    displaySymbol?: string;
    nameCode?: string;
  }>;
}
