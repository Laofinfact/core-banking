import client from "@/api/client";

import type {
  Client,
  ClientListResponse,
  ClientListParams,
  ClientCreateRequest,
  ClientUpdateRequest,
  ClientTemplate,
  ClientActivateRequest,
  ClientRejectRequest,
  ClientWithdrawRequest,
  ClientCloseRequest,
  ClientReactivateRequest,
  ClientUndoRejectionRequest,
  ClientUndoWithdrawalRequest,
  ClientAssignStaffRequest,
  ClientUpdateSavingsAccountRequest,
  ClientProposeTransferRequest,
  ClientAcceptTransferRequest,
  ClientTransferActionRequest,
  ClientCommandResponse,
} from "../types/client";

// ─── List Clients ─────────────────────────────────────────────
export async function fetchClients(params: ClientListParams = {}): Promise<ClientListResponse> {
  const { data } = await client.get<ClientListResponse>("/clients", { params });
  return data;
}

// ─── Get Single Client ────────────────────────────────────────
export async function fetchClient(clientId: number | string): Promise<Client> {
  const { data } = await client.get<Client>(`/clients/${clientId}`);
  return data;
}

// ─── Create Client ────────────────────────────────────────────
export async function createClient(
  payload: ClientCreateRequest,
): Promise<{ clientId: number; resourceId: number; officeId: number }> {
  const { data } = await client.post<{ clientId: number; resourceId: number; officeId: number }>("/clients", payload);
  return data;
}

// ─── Update Client ────────────────────────────────────────────
export async function updateClient(
  clientId: number | string,
  payload: ClientUpdateRequest,
): Promise<{ clientId: number; resourceId: number; officeId: number }> {
  const { data } = await client.put<{ clientId: number; resourceId: number; officeId: number }>(
    `/clients/${clientId}`,
    payload,
  );
  return data;
}

// ─── Delete Client (only PENDING) ─────────────────────────────
export async function deleteClient(clientId: number | string): Promise<{ clientId: number; resourceId: number }> {
  const { data } = await client.delete<{ clientId: number; resourceId: number }>(`/clients/${clientId}`);
  return data;
}

// ─── Client Accounts Overview ──────────────────────────────────
export interface ClientLoanAccount {
  id: number;
  accountNo: string;
  productId: number;
  productName: string;
  status: {
    id: number;
    code: string;
    description: string;
    pendingApproval: boolean;
    waitingForDisbursal: boolean;
    active: boolean;
    closed: boolean;
    overpaid: boolean;
  };
  loanType?: { id: number; code: string; description: string };
  loanCycle: number;
  currency: { code: string; name: string; decimalPlaces: number; displaySymbol?: string };
  originalLoan?: number;
  loanBalance?: number;
  amountPaid?: number;
  amountOutstanding?: number;
  accountBalance?: number;
}

export interface ClientSavingsAccount {
  id: number;
  accountNo: string;
  productId: number;
  productName: string;
  status: {
    id: number;
    code: string;
    description: string;
    submittedAndPendingApproval: boolean;
    approved: boolean;
    active: boolean;
    closed: boolean;
    rejected: boolean;
  };
  currency: { code: string; name: string; decimalPlaces: number; displaySymbol?: string };
  accountBalance: number;
  totalDeposits?: number;
  totalWithdrawals?: number;
  totalInterestEarned?: number;
}

export interface ClientAccountsResponse {
  loanAccounts: ClientLoanAccount[];
  savingsAccounts: ClientSavingsAccount[];
}

export async function fetchClientAccounts(clientId: number | string): Promise<ClientAccountsResponse> {
  const { data } = await client.get<ClientAccountsResponse>(`/clients/${clientId}/accounts`);
  return data;
}

// ─── Client Template ──────────────────────────────────────────
/**
 * GET /clients/template
 * Supports commandParam: close, acceptTransfer, reject, withdraw
 */
export async function fetchClientTemplate(commandParam?: string): Promise<ClientTemplate> {
  const params = commandParam ? { commandParam } : {};
  const { data } = await client.get<ClientTemplate>("/clients/template", { params });
  return data;
}

// ─── Activate Client ──────────────────────────────────────────
/**
 * POST /clients/{clientId}?command=activate
 * Body: { activationDate, dateFormat, locale }
 */
export async function activateClient(
  clientId: number | string,
  payload: ClientActivateRequest,
): Promise<{ officeId: number; clientId: number; resourceId: number }> {
  const { data } = await client.post<{ officeId: number; clientId: number; resourceId: number }>(
    `/clients/${clientId}`,
    payload,
    { params: { command: "activate" } },
  );
  return data;
}

// ─── Reject Client (PENDING → REJECTED) ──────────────────────
/**
 * POST /clients/{clientId}?command=reject
 * Body: { rejectionDate, rejectionReasonId, dateFormat, locale }
 */
export async function rejectClient(
  clientId: number | string,
  payload: ClientRejectRequest,
): Promise<{ officeId: number; clientId: number; resourceId: number }> {
  const { data } = await client.post<{ officeId: number; clientId: number; resourceId: number }>(
    `/clients/${clientId}`,
    payload,
    { params: { command: "reject" } },
  );
  return data;
}

// ─── Withdraw Client (PENDING → WITHDRAWN) ───────────────────
/**
 * POST /clients/{clientId}?command=withdraw
 * Body: { withdrawalDate, withdrawalReasonId, dateFormat, locale }
 */
export async function withdrawClient(
  clientId: number | string,
  payload: ClientWithdrawRequest,
): Promise<{ officeId: number; clientId: number; resourceId: number }> {
  const { data } = await client.post<{ officeId: number; clientId: number; resourceId: number }>(
    `/clients/${clientId}`,
    payload,
    { params: { command: "withdraw" } },
  );
  return data;
}

// ─── Close Client (ACTIVE → CLOSED) ──────────────────────────
/**
 * POST /clients/{clientId}?command=close
 * Body: { closureDate, closureReasonId, dateFormat, locale }
 */
export async function closeClient(
  clientId: number | string,
  payload: ClientCloseRequest,
): Promise<{ officeId: number; clientId: number; resourceId: number }> {
  const { data } = await client.post<{ officeId: number; clientId: number; resourceId: number }>(
    `/clients/${clientId}`,
    payload,
    { params: { command: "close" } },
  );
  return data;
}

// ─── Reactivate Client (CLOSED → PENDING) ────────────────────
/**
 * POST /clients/{clientId}?command=reactivate
 * Body: { reactivationDate, dateFormat, locale }
 */
export async function reactivateClient(
  clientId: number | string,
  payload: ClientReactivateRequest,
): Promise<{ officeId: number; clientId: number; resourceId: number }> {
  const { data } = await client.post<{ officeId: number; clientId: number; resourceId: number }>(
    `/clients/${clientId}`,
    payload,
    { params: { command: "reactivate" } },
  );
  return data;
}

// ─── Undo Rejection (REJECTED → PENDING) ─────────────────────
/**
 * POST /clients/{clientId}?command=undoRejection
 * Body: { reopenedDate, dateFormat, locale }
 */
export async function undoRejectClient(
  clientId: number | string,
  payload: ClientUndoRejectionRequest,
): Promise<{ officeId: number; clientId: number; resourceId: number }> {
  const { data } = await client.post<{ officeId: number; clientId: number; resourceId: number }>(
    `/clients/${clientId}`,
    payload,
    { params: { command: "undoRejection" } },
  );
  return data;
}

// ─── Undo Withdrawal (WITHDRAWN → PENDING) ───────────────────
/**
 * POST /clients/{clientId}?command=undoWithdrawal
 * Body: { reopenedDate, dateFormat, locale }
 */
export async function undoWithdrawClient(
  clientId: number | string,
  payload: ClientUndoWithdrawalRequest,
): Promise<{ officeId: number; clientId: number; resourceId: number }> {
  const { data } = await client.post<{ officeId: number; clientId: number; resourceId: number }>(
    `/clients/${clientId}`,
    payload,
    { params: { command: "undoWithdrawal" } },
  );
  return data;
}

// ─── Staff / Savings Account commands ────────────────────────

/**
 * POST /clients/{clientId}?command=assignStaff
 * Body: { staffId }
 */
export async function assignStaff(
  clientId: number | string,
  payload: ClientAssignStaffRequest,
): Promise<ClientCommandResponse> {
  const { data } = await client.post<ClientCommandResponse>(`/clients/${clientId}`, payload, {
    params: { command: "assignStaff" },
  });
  return data;
}

/**
 * POST /clients/{clientId}?command=unassignStaff
 * Body: { staffId }
 */
export async function unassignStaff(
  clientId: number | string,
  payload: { staffId: number },
): Promise<ClientCommandResponse> {
  const { data } = await client.post<ClientCommandResponse>(`/clients/${clientId}`, payload, {
    params: { command: "unassignStaff" },
  });
  return data;
}

/**
 * POST /clients/{clientId}?command=updateSavingsAccount
 * Body: { savingsAccountId }
 */
export async function updateSavingsAccount(
  clientId: number | string,
  payload: ClientUpdateSavingsAccountRequest,
): Promise<ClientCommandResponse> {
  const { data } = await client.post<ClientCommandResponse>(`/clients/${clientId}`, payload, {
    params: { command: "updateSavingsAccount" },
  });
  return data;
}

// ─── Client Transfer commands ─────────────────────────────────

/**
 * POST /clients/{clientId}?command=proposeTransfer
 * Body: { destinationOfficeId, transferDate?, dateFormat, locale, note? }
 */
export async function proposeClientTransfer(
  clientId: number | string,
  payload: ClientProposeTransferRequest,
): Promise<ClientCommandResponse> {
  const { data } = await client.post<ClientCommandResponse>(`/clients/${clientId}`, payload, {
    params: { command: "proposeTransfer" },
  });
  return data;
}

/**
 * POST /clients/{clientId}?command=acceptTransfer
 * Body: { transferDate?, dateFormat, locale, note? }
 */
export async function acceptClientTransfer(
  clientId: number | string,
  payload: ClientAcceptTransferRequest = {},
): Promise<ClientCommandResponse> {
  const { data } = await client.post<ClientCommandResponse>(`/clients/${clientId}`, payload, {
    params: { command: "acceptTransfer" },
  });
  return data;
}

/**
 * POST /clients/{clientId}?command=rejectTransfer
 * Body: { transferDate?, dateFormat, locale, note? }
 */
export async function rejectClientTransfer(
  clientId: number | string,
  payload: ClientTransferActionRequest = {},
): Promise<ClientCommandResponse> {
  const { data } = await client.post<ClientCommandResponse>(`/clients/${clientId}`, payload, {
    params: { command: "rejectTransfer" },
  });
  return data;
}

/**
 * POST /clients/{clientId}?command=withdrawTransfer
 * Body: { transferDate?, dateFormat, locale, note? }
 */
export async function withdrawClientTransfer(
  clientId: number | string,
  payload: ClientTransferActionRequest = {},
): Promise<ClientCommandResponse> {
  const { data } = await client.post<ClientCommandResponse>(`/clients/${clientId}`, payload, {
    params: { command: "withdrawTransfer" },
  });
  return data;
}

/**
 * POST /clients/{clientId}?command=proposeAndAcceptTransfer
 * Body: { destinationOfficeId, transferDate?, dateFormat, locale, note? }
 */
export async function proposeAndAcceptClientTransfer(
  clientId: number | string,
  payload: ClientProposeTransferRequest,
): Promise<ClientCommandResponse> {
  const { data } = await client.post<ClientCommandResponse>(`/clients/${clientId}`, payload, {
    params: { command: "proposeAndAcceptTransfer" },
  });
  return data;
}
