export interface CollateralProduct {
  id: number;
  name: string;
  quality: string;
  basePrice: number;
  pctToBase: number;
  unitType: string;
  currency: string;
}

export interface CollateralProductCurrency {
  code: string;
  name: string;
  decimalPlaces: number;
  inMultiplesOf?: number;
  displaySymbol?: string;
  nameCode?: string;
  displayLabel?: string;
}

export interface CollateralProductCreateRequest {
  name: string;
  quality: string;
  basePrice: number;
  pctToBase: number;
  unitType: string;
  currency: string;
  locale: string;
}

export interface CollateralProductUpdateRequest {
  name?: string;
  quality?: string;
  basePrice?: number;
  pctToBase?: number;
  unitType?: string;
  currency?: string;
  locale?: string;
}

export interface CollateralProductUpdateResponse {
  resourceId: number;
  changes?: {
    name?: string;
    quality?: string;
    basePrice?: number;
    pctToBase?: number;
    unitType?: string;
    currency?: string;
    locale?: string;
  };
}

export interface CollateralProductCommandResponse {
  resourceId: number;
  changes?: Record<string, unknown>;
}

export interface CollateralProductTemplate {
  currencies: CollateralProductCurrency[];
}
