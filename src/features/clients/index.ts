// ─── Clients Feature ──────────────────────────────────────────

// Types
export type {
  Client,
  ClientStatus,
  ClientListResponse,
  ClientListParams,
  ClientCreateRequest,
  ClientUpdateRequest,
  ClientTemplate,
  ClientActivateRequest,
  ClientTimeline,
  LegalForm,
  Gender,
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
  ClientNonPerson,
  ClientAddressInput,
  ClientFamilyMemberInput,
  ClientCommandResponse,
} from "./types/client";

// Constants
export {
  CLIENT_STATUS_LABELS,
  CLIENT_STATUS_CONFIG,
  STATUS_ID_MAP,
  CLIENTS_PAGE_SIZE,
  SEARCH_DEBOUNCE_MS,
} from "./constants/status";

// Schemas
export {
  createClientSchema,
  editClientSchema,
  activateClientSchema,
  closeClientSchema,
  rejectClientSchema,
  withdrawClientSchema,
  reactivateClientSchema,
  undoRejectionSchema,
  undoWithdrawalSchema,
  assignStaffSchema,
  updateSavingsAccountSchema,
  proposeTransferSchema,
  acceptTransferSchema,
  transferActionSchema,
} from "./schemas/client.schema";
export type {
  CreateClientFormValues,
  EditClientFormValues,
  ActivateClientFormValues,
  CloseClientFormValues,
  RejectClientFormValues,
  WithdrawClientFormValues,
  ReactivateClientFormValues,
  UndoRejectClientFormValues,
  UndoWithdrawClientFormValues,
  AssignStaffFormValues,
  UpdateSavingsAccountFormValues,
  ProposeTransferFormValues,
  AcceptTransferFormValues,
  TransferActionFormValues,
} from "./schemas/client.schema";

// Utils
export {
  getClientDisplayName,
  formatClientName,
  getClientStatus,
  formatClientDate,
  calculateAge,
} from "./utils/client";

// API — Client CRUD
export {
  fetchClients,
  fetchClient,
  createClient,
  updateClient,
  activateClient,
  deleteClient,
  fetchClientTemplate,
  fetchClientAccounts,
} from "./api/client";

// API — Client Identifiers
export {
  fetchClientIdentifiers,
  fetchClientIdentifier,
  fetchClientIdentifierTemplate,
  createClientIdentifier,
  updateClientIdentifier,
  deleteClientIdentifier,
} from "./api/identifiers";
export type {
  ClientIdentifier,
  ClientIdentifierRequest,
  ClientIdentifierTemplate,
  ClientIdentifierCommandResponse,
} from "./api/identifiers";

// API — Client Addresses
export {
  fetchClientAddresses,
  fetchClientAddressTemplate,
  createClientAddress,
  updateClientAddress,
  deleteClientAddress,
} from "./api/addresses";
export type {
  ClientAddress,
  ClientAddressRequest,
  ClientAddressTemplate,
  ClientAddressCommandResponse,
} from "./api/addresses";

// API — Client Family Members
export {
  fetchClientFamilyMembers,
  fetchClientFamilyMember,
  fetchClientFamilyMemberTemplate,
  createClientFamilyMember,
  updateClientFamilyMember,
  deleteClientFamilyMember,
} from "./api/family-members";
export type {
  ClientFamilyMember,
  ClientFamilyMemberRequest,
  ClientFamilyMemberTemplate,
  ClientFamilyMemberCommandResponse,
} from "./api/family-members";

// API — Client Charges
export {
  fetchClientCharges,
  fetchClientChargesTemplate,
  createClientCharge,
  waiveClientCharge,
  payClientCharge,
  deleteClientCharge,
} from "./api/charges";
export type {
  ClientCharge,
  ClientChargeListResponse,
  PostClientChargeRequest,
  ClientChargesTemplate,
  ClientChargeCommandResponse,
} from "./api/charges";

// API — Client Documents
export {
  fetchClientDocuments,
  fetchClientDocument,
  downloadClientDocument,
  createClientDocument,
  updateClientDocument,
  deleteClientDocument,
} from "./api/documents";
export type { ClientDocument, ClientDocumentRequest, ClientDocumentCommandResponse } from "./api/documents";

// API — Client Notes
export { fetchClientNotes, fetchClientNote, createClientNote, updateClientNote, deleteClientNote } from "./api/notes";
export type { ClientNote, ClientNoteRequest, ClientNoteCommandResponse } from "./api/notes";

// API — Client Collaterals
export {
  fetchClientCollaterals,
  fetchClientCollateral,
  fetchCollateralOptions,
  createClientCollateral,
  updateClientCollateral,
  deleteClientCollateral,
} from "./api/collaterals";
export type {
  ClientCollateral,
  ClientCollateralRequest,
  ClientCollateralUpdateRequest,
  CollateralOption,
  ClientCollateralCommandResponse,
} from "./api/collaterals";

// API — Client Transactions
export { fetchClientTransactions, undoClientTransaction } from "./api/transactions";
export type {
  ClientTransaction,
  ClientTransactionListResponse,
  ClientTransactionCommandResponse,
} from "./api/transactions";

// API — Client Images
export { fetchClientImage, uploadClientImage, deleteClientImage, uploadClientTemplate } from "./api/images";
export type { ClientImageParams, ClientImageCreateResponse, ClientUploadTemplateResponse } from "./api/images";

// API — Client Obligee Details
export { fetchClientObligeeDetails } from "./api/obligee";
export type { ClientObligeeDetailsResponse } from "./api/obligee";

// Hooks — Permissions
export { useClientPermissions, CLIENT_ACTION_PERMISSIONS } from "./hooks/useClientPermissions";
export type { ClientAction } from "./hooks/useClientPermissions";

// Hooks
export { useClients, useClientPages, clientKeys } from "./hooks/useClients";
export { useClient } from "./hooks/useClient";
export { useCreateClient } from "./hooks/useCreateClient";
export { useUpdateClient } from "./hooks/useUpdateClient";
export { useActivateClient } from "./hooks/useActivateClient";
export { useDeleteClient } from "./hooks/useDeleteClient";
export { useClientTemplate } from "./hooks/useClientTemplate";
export { useClientAccounts } from "./hooks/useClientAccounts";

// Hooks — Sub-entities
export {
  useClientIdentifiers,
  useClientIdentifierTemplate,
  useCreateClientIdentifier,
  useUpdateClientIdentifier,
  useDeleteClientIdentifier,
  clientIdentifierKeys,
} from "./hooks/useClientIdentifiers";
export {
  useClientAddresses,
  useClientAddressTemplate,
  useCreateClientAddress,
  useUpdateClientAddress,
  useDeleteClientAddress,
  clientAddressKeys,
} from "./hooks/useClientAddresses";
export {
  useClientFamilyMembers,
  useClientFamilyMemberTemplate,
  useCreateClientFamilyMember,
  useUpdateClientFamilyMember,
  useDeleteClientFamilyMember,
  clientFamilyMemberKeys,
} from "./hooks/useClientFamilyMembers";
export {
  useClientCharges,
  useClientChargesTemplate,
  useCreateClientCharge,
  usePayClientCharge,
  useWaiveClientCharge,
  useDeleteClientCharge,
  clientChargeKeys,
} from "./hooks/useClientCharges";
export {
  useClientDocuments,
  useClientDocument,
  useCreateClientDocument,
  useUpdateClientDocument,
  useDeleteClientDocument,
  clientDocumentKeys,
} from "./hooks/useClientDocuments";
export {
  useClientNotes,
  useCreateClientNote,
  useUpdateClientNote,
  useDeleteClientNote,
  clientNoteKeys,
} from "./hooks/useClientNotes";
export {
  useClientCollaterals,
  useCollateralOptions,
  useCreateClientCollateral,
  useUpdateClientCollateral,
  useDeleteClientCollateral,
  clientCollateralKeys,
} from "./hooks/useClientCollaterals";
export { useClientTransactions, useUndoClientTransaction, clientTransactionKeys } from "./hooks/useClientTransactions";
export {
  useClientImage,
  useUploadClientImage,
  useDeleteClientImage,
  useUploadClientTemplate,
  clientImageKeys,
} from "./hooks/useClientImages";
export { useClientObligeeDetails, clientObligeeKeys } from "./hooks/useClientObligee";

// Hooks — Client Commands
export {
  useRejectClient,
  useWithdrawClient,
  useCloseClient,
  useReactivateClient,
  useUndoRejectClient,
  useUndoWithdrawClient,
} from "./hooks/useClientCommands";

// Hooks — Staff & Savings
export { useAssignStaff } from "./hooks/useAssignStaff";
export { useUnassignStaff } from "./hooks/useUnassignStaff";
export { useUpdateSavingsAccount } from "./hooks/useUpdateSavingsAccount";

// Hooks — Transfer
export {
  useProposeClientTransfer,
  useAcceptClientTransfer,
  useRejectClientTransfer,
  useWithdrawClientTransfer,
  useProposeAndAcceptClientTransfer,
} from "./hooks/useClientTransfer";

// Components
export { default as ClientTable } from "./components/ClientTable";
export { default as ClientFilters } from "./components/ClientFilters";
export { default as ClientForm } from "./components/ClientForm";
export { default as ClientDetails } from "./components/ClientDetails";
export { default as ClientStatusBadge } from "./components/ClientStatusBadge";
export { default as ClientIdentifiers } from "./components/ClientIdentifiers";
export { default as ClientAddresses } from "./components/ClientAddresses";
export { default as ClientFamilyMembers } from "./components/ClientFamilyMembers";
export { default as ClientCharges } from "./components/ClientCharges";
export { default as ClientDocuments } from "./components/ClientDocuments";
export { default as ClientNotes } from "./components/ClientNotes";
export { default as ClientCollaterals } from "./components/ClientCollaterals";
export { default as ClientTransactions } from "./components/ClientTransactions";
export { default as ClientCommands } from "./components/ClientCommands";
export { default as ClientImage } from "./components/ClientImage";
export { default as ClientBulkImport } from "./components/ClientBulkImport";
export { default as ClientObligeeDetails } from "./components/ClientObligeeDetails";

// Pages
export { default as ClientListPage } from "./pages/ClientListPage";
export { default as CreateClientPage } from "./pages/CreateClientPage";
export { default as ClientDetailPage } from "./pages/ClientDetailPage";
export { default as EditClientPage } from "./pages/EditClientPage";
