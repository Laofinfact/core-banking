export type {
  ClientCollateralManagement,
  LoanTransactionData,
  ClientCollateralCreateRequest,
  ClientCollateralUpdateRequest,
  ClientCollateralCommandResponse,
  LoanCollateralTemplate,
} from "./types/clientCollateral";

export {
  fetchClientCollateralManagements,
  fetchClientCollateralManagement,
  fetchClientCollateralTemplate,
  createClientCollateralManagement,
  updateClientCollateralManagement,
  deleteClientCollateralManagement,
} from "./api/clientCollateral";

export {
  useClientCollateralManagements,
  useClientCollateralManagement,
  useClientCollateralTemplate,
  useCreateClientCollateralManagement,
  useUpdateClientCollateralManagement,
  useDeleteClientCollateralManagement,
  clientCollateralManagementKeys,
} from "./hooks/useClientCollateralManagement";

export {
  createClientCollateralManagementSchema,
  updateClientCollateralManagementSchema,
} from "./schemas/clientCollateral.schema";
export type {
  CreateClientCollateralManagementFormValues,
  UpdateClientCollateralManagementFormValues,
} from "./schemas/clientCollateral.schema";

export { default as ClientCollateralManagementList } from "./components/ClientCollateralManagementList";
export { default as ClientCollateralManagementDetail } from "./components/ClientCollateralManagementDetail";
export { default as LoanCollateralSelector } from "./components/LoanCollateralSelector";
export { default as ClientCollateralManagementDetailWrapper } from "./components/ClientCollateralManagementDetailWrapper";
