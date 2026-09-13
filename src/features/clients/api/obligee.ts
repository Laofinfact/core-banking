import client from "@/api/client";

export interface ClientObligeeDetails {
  id: number;
  clientId: number;
  loanId: number;
  loanAccountNumber: string;
  displayName: string;
  actualAmount: number;
  pendingAmount: number;
  disbursedAmount: number;
  totalAmount: number;
}

export interface ClientObligeeDetailsResponse {
  obligeeDetails: ClientObligeeDetails[];
}

/**
 * GET /clients/{clientId}/obligeedetails
 * Get obligee details for a client (escrow/third-party management).
 */
export async function fetchClientObligeeDetails(clientId: number | string): Promise<ClientObligeeDetailsResponse> {
  const { data } = await client.get<ClientObligeeDetailsResponse>(`/clients/${clientId}/obligeedetails`);
  return data;
}
