import client from "@/api/client";
import type {
  ClientCollateralManagement,
  ClientCollateralCreateRequest,
  ClientCollateralUpdateRequest,
  ClientCollateralCommandResponse,
  LoanCollateralTemplate,
} from "../types/clientCollateral";

export async function fetchClientCollateralManagements(
  clientId: number | string,
  prodId?: number | string,
): Promise<ClientCollateralManagement[]> {
  const { data } = await client.get<ClientCollateralManagement[]>(
    `/clients/${clientId}/collaterals`,
    prodId ? { params: { prodId } } : undefined,
  );
  return data;
}

export async function fetchClientCollateralManagement(
  clientId: number | string,
  collateralId: number | string,
): Promise<ClientCollateralManagement> {
  const { data } = await client.get<ClientCollateralManagement>(
    `/clients/${clientId}/collaterals/${collateralId}`,
  );
  return data;
}

export async function fetchClientCollateralTemplate(
  clientId: number | string,
): Promise<LoanCollateralTemplate[]> {
  const { data } = await client.get<LoanCollateralTemplate[]>(
    `/clients/${clientId}/collaterals/template`,
  );
  return data;
}

export async function createClientCollateralManagement(
  clientId: number | string,
  payload: ClientCollateralCreateRequest,
): Promise<ClientCollateralCommandResponse> {
  const { data } = await client.post<ClientCollateralCommandResponse>(
    `/clients/${clientId}/collaterals`,
    payload,
  );
  return data;
}

export async function updateClientCollateralManagement(
  clientId: number | string,
  collateralId: number | string,
  payload: ClientCollateralUpdateRequest,
): Promise<ClientCollateralCommandResponse> {
  const { data } = await client.put<ClientCollateralCommandResponse>(
    `/clients/${clientId}/collaterals/${collateralId}`,
    payload,
  );
  return data;
}

export async function deleteClientCollateralManagement(
  clientId: number | string,
  collateralId: number | string,
): Promise<ClientCollateralCommandResponse> {
  const { data } = await client.delete<ClientCollateralCommandResponse>(
    `/clients/${clientId}/collaterals/${collateralId}`,
  );
  return data;
}
