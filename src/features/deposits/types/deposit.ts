// ─── Savings / Deposit Types ────────────────────

export type SavingsAccountStatus =
  | "Submitted and pending approval"
  | "Approved"
  | "Active"
  | "Closed"
  | "Rejected"
  | "Withdrawn by applicant"
  | "Matured"
  | "Premature Closed"
  | "Transfer in progress"
  | "Transfer on hold";

export type DepositAccountType = "savings" | "fixed_deposit" | "recurring_deposit";

export type AccountingRuleType = 1 | 2 | 3 | 4;

// ─── Savings Product ─────────────────────────────────────────────

export interface GLAccountMapping {
  id: number;
  name: string;
  glCode?: string;
}

export interface SavingsProductAccountingMappings {
  savingsReferenceAccount?: GLAccountMapping;
  savingsControlAccount?: GLAccountMapping;
  transfersInSuspenseAccount?: GLAccountMapping;
  interestOnSavingsAccount?: GLAccountMapping;
  incomeFromFeeAccount?: GLAccountMapping;
  incomeFromPenaltyAccount?: GLAccountMapping;
  overdraftPortfolioControl?: GLAccountMapping;
  incomeFromInterest?: GLAccountMapping;
  lossesWrittenOff?: GLAccountMapping;
  feesReceivableAccount?: GLAccountMapping;
  penaltiesReceivableAccount?: GLAccountMapping;
  interestPayableAccount?: GLAccountMapping;
  escheatLiabilityAccount?: GLAccountMapping;
}

export interface TaxGroup {
  id: number;
  name: string;
}

export interface PaymentChannelToFundSourceMapping {
  paymentType?: { id: number; name: string };
  fundSourceAccount?: GLAccountMapping;
}

export interface FeeToIncomeAccountMapping {
  charge?: { id: number; name: string };
  incomeAccount?: GLAccountMapping;
}

export interface PenaltyToIncomeAccountMapping {
  charge?: { id: number; name: string };
  incomeAccount?: GLAccountMapping;
}

export interface EnumOptionData {
  id: number;
  code: string;
  value: string;
}

export interface SavingsProduct {
  id: number;
  name: string;
  shortName?: string;
  description?: string;
  currency: {
    code: string;
    name: string;
    decimalPlaces: number;
    inMultiplesOf?: number;
    displaySymbol: string;
  };
  nominalAnnualInterestRate: number;
  minRequiredOpeningBalance: number;
  lockinPeriodFrequency?: number;
  lockinPeriodFrequencyType?: EnumOptionData;
  withdrawalFeeForTransfers?: boolean;
  withdrawalFeeAmount?: number;
  withdrawalFeeType?: EnumOptionData;
  feeAmount?: number;
  feeOnMonthDay?: string;
  allowOverdraft?: boolean;
  overdraftLimit?: number;
  nominalAnnualInterestRateOverdraft?: number;
  minOverdraftForInterestCalculation?: number;
  minBalanceForInterestCalculation?: number;
  minRequiredBalance?: number;
  enforceMinRequiredBalance?: boolean;
  lienAllowed?: boolean;
  maxAllowedLienLimit?: number;
  accountingRule?: AccountingRuleType;
  interestCompoundingPeriodType?: EnumOptionData;
  interestPostingPeriodType?: EnumOptionData;
  interestCalculationType?: EnumOptionData;
  interestCalculationDaysInYearType?: EnumOptionData;
  isDormancyTrackingActive?: boolean;
  daysToInactive?: number;
  daysToDormancy?: number;
  daysToEscheat?: number;
  withHoldTax?: boolean;
  taxGroup?: TaxGroup | null;
  taxGroupId?: number;
  charges: Array<{
    id: number;
    chargeId: number;
    name: string;
    amount: number;
    chargeTimeType: EnumOptionData;
    chargeCalculationType: EnumOptionData;
    isPenalty: boolean;
    isActive: boolean;
  }>;
  accountingMappings?: SavingsProductAccountingMappings;
  paymentChannelToFundSourceMappings?: PaymentChannelToFundSourceMapping[];
  feeToIncomeAccountMappings?: FeeToIncomeAccountMapping[];
  penaltyToIncomeAccountMappings?: PenaltyToIncomeAccountMapping[];
}

// ─── Savings Account ─────────────────────────────────────────────

export interface SavingsAccount {
  id: number;
  accountNo: string;
  externalId?: string;
  clientId: number;
  clientName?: string;
  savingsProductId: number;
  savingsProductName?: string;
  productId?: number;
  status: { id: number; code: string; value: string };
  subStatus?: {
    id: number;
    code: string;
    value: string;
    none?: boolean;
    inactive?: boolean;
    dormant?: boolean;
    escheat?: boolean;
    block?: boolean;
    blockCredit?: boolean;
    blockDebit?: boolean;
  };
  currency: { code: string; name: string; decimalPlaces: number; displaySymbol: string };
  accountBalance: number;
  totalDeposits?: number;
  totalWithdrawals?: number;
  totalInterestEarned?: number;
  totalFeesPaid?: number;
  totalPenaltyPaid?: number;
  availableBalance?: number;
  summary?: SavingsSummary;
  nominalAnnualInterestRate: number;
  minRequiredOpeningBalance?: number;
  lockinPeriodFrequency?: number;
  lockinPeriodFrequencyType?: { id: number; code: string; value: string };
  withdrawalFee?: boolean;
  allowOverdraft?: boolean;
  overdraftLimit?: number;
  enforceMinRequiredBalance?: boolean;
  minRequiredBalance?: number;
  onHoldFunds?: number;
  lastActiveTransactionDate?: string;
  statusBlock?: unknown;
  timeline: {
    submittedOnDate?: string;
    submittedByUsername?: string;
    approvedOnDate?: string;
    approvedByUsername?: string;
    activatedOnDate?: string;
    activatedByUsername?: string;
    closedOnDate?: string;
    closedByUsername?: string;
  };
  client?: { id: number; displayName: string };
  group?: { id: number; name: string };
  fieldOfficerId?: number;
  savingsOfficerName?: string;
  transactions?: SavingsTransaction[];
  charges?: unknown[];
  datatables?: unknown[];
}

export interface SavingsSummary {
  currency: { code: string; name: string; displaySymbol: string };
  totalDeposits: number;
  totalWithdrawals: number;
  totalInterestEarned: number;
  totalInterestPosted?: number;
  totalFeesPaid: number;
  totalPenaltyPaid: number;
  accountBalance: number;
  availableBalance: number;
  interestPostedTillDate?: string;
  lastInterestCalculationDate?: string;
}

export interface SavingsTransaction {
  id: number;
  transactionType: {
    id: number;
    code: string;
    value: string;
    deposit?: boolean;
    dividendPayout?: boolean;
    withdrawal?: boolean;
    interestPosting?: boolean;
    feeDeduction?: boolean;
    initiateTransfer?: boolean;
    approveTransfer?: boolean;
    withdrawTransfer?: boolean;
    rejectTransfer?: boolean;
    overdraftInterest?: boolean;
    writtenoff?: boolean;
    withholdTax?: boolean;
    escheat?: boolean;
    amountHold?: boolean;
    amountRelease?: boolean;
    transactionTypeEnum?: string;
    entryType?: "DEBIT" | "CREDIT";
  };
  entryType?: "DEBIT" | "CREDIT";
  accountId: number;
  accountNo?: string;
  externalId?: string;
  date: string;
  transactionDate?: string;
  currency: { code: string; name: string; displaySymbol: string; decimalPlaces?: number };
  amount: number;
  runningBalance: number;
  reversed: boolean;
  submittedOnDate: string;
  submittedByUsername?: string;
  note?: string;
  isManualTransaction?: boolean;
  isReversal?: boolean;
  originalTransactionId?: number;
  lienTransaction?: boolean;
  releaseTransactionId?: number;
  reasonForBlock?: string;
  paymentDetailData?: unknown;
}

// ─── Savings List ────────────────────────────────────────────────

export interface SavingsAccountListResponse {
  totalFilteredRecords: number;
  pageItems: SavingsAccount[];
}

export interface SavingsAccountListParams {
  offset?: number;
  limit?: number;
  orderBy?: string;
  sortOrder?: "ASC" | "DESC";
  clientId?: number;
  accountNo?: string;
  status?: number;
}

// ─── Savings Template ────────────────────────────────────────────

export interface SavingsAccountTemplate {
  clientId?: number;
  clientName?: string;
  productOptions: Array<{ id: number; name: string }>;
  clientOptions?: Array<{ id: number; displayName: string }>;
  groupId?: number;
  productId?: number;
  currency?: { code: string; name: string; decimalPlaces: number; displaySymbol: string };
  nominalAnnualInterestRate?: number;
  minRequiredOpeningBalance?: number;
  lockinPeriodFrequency?: number;
  lockinPeriodFrequencyType?: { id: number; code: string; value: string };
  withdrawalFeeForTransfers?: boolean;
  allowOverdraft?: boolean;
  overdraftLimit?: number;
  enforceMinRequiredBalance?: boolean;
  minRequiredBalance?: number;
  fieldOfficerOptions?: Array<{ id: number; displayName: string }>;
  chargeOptions?: unknown[];
  interestCompoundingPeriodType?: { id: number; code: string; value: string };
  interestPostingPeriodType?: { id: number; code: string; value: string };
  interestCalculationType?: { id: number; code: string; value: string };
  interestCalculationDaysInYearType?: { id: number; code: string; value: string };
}

// ─── Savings Create/Command ──────────────────────────────────────

export interface SavingsAccountCreateRequest {
  clientId: number;
  productId: number;
  submittedOnDate: string;
  locale?: string;
  dateFormat?: string;
  externalId?: string;
  fieldOfficerId?: number;
  nominalAnnualInterestRate?: number;
  minRequiredOpeningBalance?: number;
  lockinPeriodFrequency?: number;
  lockinPeriodFrequencyType?: number;
  withdrawalFeeForTransfers?: boolean;
  allowOverdraft?: boolean;
  overdraftLimit?: number;
  enforceMinRequiredBalance?: boolean;
  minRequiredBalance?: number;
  charges?: Array<{ chargeId: number; amount: number }>;
  datatables?: Array<{ data: unknown; registeredTableName: string }>;
}

export interface SavingsCommandResponse {
  officeId: number;
  clientId: number;
  groupId?: number;
  savingsId: number;
  resourceId?: number;
  changes?: Record<string, unknown>;
  transactionId?: string;
  commandId?: number;
  rollbackTransaction?: boolean;
}

// ─── Deposit/Withdrawal ──────────────────────────────────────────

export interface SavingsTransactionRequest {
  transactionDate: string;
  transactionAmount: number;
  paymentTypeId?: number;
  accountNumber?: string;
  checkNumber?: string;
  routingCode?: string;
  receiptNumber?: string;
  bankNumber?: string;
  note?: string;
  locale?: string;
  dateFormat?: string;
}

export interface SavingsTransactionTemplate {
  accountId: number;
  accountNo: string;
  currency: { code: string; name: string; displaySymbol: string };
  amount?: number;
  date?: string;
  paymentTypeOptions: Array<{ id: number; name: string; isCashPayment: boolean }>;
}

// ─── Fixed Deposit ───────────────────────────────────────────────

export interface FixedDepositAccount {
  id: number;
  accountNo: string;
  externalId?: string;
  clientId: number;
  clientName?: string;
  clientOfficeId?: number;
  depositProductId: number;
  depositProductName?: string;
  status: { id: number; code: string; value: string };
  currency: { code: string; name: string; displaySymbol: string };
  depositAmount: number;
  maturityAmount?: number;
  accountBalance: number;
  preClosurePenalApplicable: boolean;
  depositPeriod: number;
  depositPeriodFrequency?: { id: number; code: string; value: string };
  depositPeriodFrequencyType: { id: number; code: string; value: string };
  onAccountClosure?: { id: number; code: string; value: string };
  transferToSavingsId?: number;
  interestRate: number;
  interestCompoundingPeriodType: { id: number; code: string; value: string };
  interestPostingPeriodType: { id: number; code: string; value: string };
  interestCalculationType: { id: number; code: string; value: string };
  interestCalculationDaysInYearType: { id: number; code: string; value: string };
  timeline: {
    submittedOnDate?: string;
    approvedOnDate?: string;
    activatedOnDate?: string;
    maturedOnDate?: string;
    closedOnDate?: string;
  };
  maturityDate?: string;
  onHoldFunds?: number;
  prematureClosure?: boolean;
  withHoldTax?: boolean;
  transferInterestToSavings?: boolean;
  savingsAccountId?: number;
  nominalAnnualInterestRate?: number;
}

export interface FixedDepositListParams {
  offset?: number;
  limit?: number;
  orderBy?: string;
  sortOrder?: "ASC" | "DESC";
  clientId?: number;
  status?: number;
}

export interface FixedDepositAccountListResponse {
  totalFilteredRecords: number;
  pageItems: FixedDepositAccount[];
}

export interface FixedDepositAccountCreateRequest {
  clientId: number;
  productId: number;
  submittedOnDate: string;
  depositAmount: number;
  depositPeriod: number;
  depositPeriodFrequencyId: number;
  accountNo?: string;
  externalId?: string;
  fieldOfficerId?: number;
  linkAccountId?: number;
  transferInterestToSavings?: boolean;
  maturityInstructionId?: number;
  transferToSavingsId?: number;
  nominalAnnualInterestRate?: number;
  interestCompoundingPeriodType?: number;
  interestPostingPeriodType?: number;
  interestCalculationType?: number;
  interestCalculationDaysInYearType?: number;
  minRequiredOpeningBalance?: number;
  lockinPeriodFrequency?: number;
  lockinPeriodFrequencyType?: number;
  preClosurePenalApplicable?: boolean;
  preClosurePenalInterest?: number;
  preClosurePenalInterestOnTypeId?: number;
  minDepositTerm?: number;
  minDepositTermTypeId?: number;
  maxDepositTerm?: number;
  maxDepositTermTypeId?: number;
  inMultiplesOfDepositTerm?: number;
  inMultiplesOfDepositTermTypeId?: number;
  withHoldTax?: boolean;
  charges?: Array<{ chargeId: number; amount: number }>;
  locale?: string;
  dateFormat?: string;
}

// ─── Recurring Deposit ───────────────────────────────────────────

export interface RecurringDepositAccount {
  id: number;
  accountNo: string;
  externalId?: string;
  clientId: number;
  clientName?: string;
  productId: number;
  productName?: string;
  depositProductId?: number;
  depositProductName?: string;
  status: { id: number; code: string; value: string };
  currency: { code: string; name: string; decimalPlaces: number; displaySymbol: string };
  summary?: {
    totalDeposits?: number;
    totalWithdrawals?: number;
    totalInterestEarned?: number;
    accountBalance?: number;
  };
  depositAmount: number;
  maturityAmount?: number;
  maturityDate?: string | number[];
  accountBalance: number;
  totalDeposits?: number;
  totalInterestEarned?: number;
  mandatoryRecommendedDepositAmount?: number;
  recurringDepositFrequency?: number;
  recurringDepositFrequencyType?: { id: number; code: string; value: string };
  depositPeriod: number;
  depositPeriodFrequency?: { id: number; code: string; value: string };
  depositPeriodFrequencyType?: { id: number; code: string; value: string };
  interestRate?: number;
  nominalAnnualInterestRate?: number;
  interestCompoundingPeriodType?: { id: number; code: string; value: string };
  interestPostingPeriodType?: { id: number; code: string; value: string };
  interestCalculationType?: { id: number; code: string; value: string };
  interestCalculationDaysInYearType?: { id: number; code: string; value: string };
  expectedFirstDepositOnDate?: string | number[];
  recurringFrequency?: number;
  recurringFrequencyType?: { id: number; code: string; value: string };
  groupId?: number;
  onAccountClosureId?: number;
  onAccountClosure?: { id: number; code: string; value: string };
  officeId?: number;
  clientOfficeId?: number;
  submittedOnDate?: string | number[];
  approvedOnDate?: string | number[];
  activatedOnDate?: string | number[];
  timeline: {
    submittedOnDate?: string;
    approvedOnDate?: string;
    activatedOnDate?: string;
    closedOnDate?: string;
  };
  prematureClosure?: boolean;
  preClosurePenalApplicable?: boolean;
  preClosurePenalInterest?: number;
  preClosurePenalInterestOnType?: { id: number; code: string; value: string };
  withHoldTax?: boolean;
  taxGroup?: { id: number; name: string } | null;
  taxGroupId?: number;
  client?: { id: number; displayName: string };
  group?: { id: number; name: string };
  fieldOfficerId?: number;
  savingsOfficerName?: string;
  lockinPeriodFrequency?: number;
  lockinPeriodFrequencyType?: { id: number; code: string; value: string };
  isCalendarInherited?: boolean;
  isMandatoryDeposit?: boolean;
  allowWithdrawal?: boolean;
  adjustAdvanceTowardsFuturePayments?: boolean;
  maturityInstructionId?: number;
  transferToSavingsId?: number;
  transactions?: unknown[];
  charges?: unknown[];
  activeChart?: unknown;
  depositProduct?: { shortName?: string };
}

export interface RecurringDepositListParams {
  offset?: number;
  limit?: number;
  orderBy?: string;
  sortOrder?: "ASC" | "DESC";
  clientId?: number;
  status?: number;
  paged?: boolean;
}

export interface RecurringDepositAccountListResponse {
  totalFilteredRecords?: number;
  pageItems?: RecurringDepositAccount[];
}

// ─── Recurring Deposit Product ────────────────────────────────────

export interface RecurringDepositProduct {
  id: number;
  name: string;
  shortName?: string;
  description?: string;
  currency: { code: string; name: string; decimalPlaces: number; displaySymbol: string; inMultiplesOf?: number };
  nominalAnnualInterestRate: number;
  interestCompoundingPeriodType: EnumOptionData;
  interestPostingPeriodType: EnumOptionData;
  interestCalculationType: EnumOptionData;
  interestCalculationDaysInYearType: EnumOptionData;
  minBalanceForInterestCalculation?: number;
  lockinPeriodFrequency?: number;
  lockinPeriodFrequencyType?: EnumOptionData;
  // DepositProductTermAndPreClosure fields
  preClosurePenalApplicable: boolean;
  preClosurePenalInterest?: number;
  preClosurePenalInterestOnType?: EnumOptionData;
  // DepositTermDetail fields
  minDepositTerm: number;
  maxDepositTerm?: number;
  minDepositTermType: EnumOptionData;
  maxDepositTermType?: EnumOptionData;
  inMultiplesOfDepositTerm?: number;
  inMultiplesOfDepositTermType?: EnumOptionData;
  // DepositProductAmountDetails fields
  minDepositAmount?: number;
  depositAmount: number;
  maxDepositAmount?: number;
  // DepositRecurringDetail fields (recurring-specific)
  isMandatoryDeposit?: boolean;
  allowWithdrawal?: boolean;
  adjustAdvanceTowardsFuturePayments?: boolean;
  // Base savings product fields
  accountingRule?: AccountingRuleType;
  withHoldTax?: boolean;
  taxGroup?: TaxGroup | null;
  taxGroupId?: number;
  charges?: Array<{
    id: number;
    chargeId: number;
    name: string;
    amount: number;
    chargeTimeType: EnumOptionData;
    chargeCalculationType: EnumOptionData;
    isPenalty: boolean;
    isActive: boolean;
  }>;
  accountingMappings?: SavingsProductAccountingMappings;
  paymentChannelToFundSourceMappings?: PaymentChannelToFundSourceMapping[];
  feeToIncomeAccountMappings?: FeeToIncomeAccountMapping[];
  penaltyToIncomeAccountMappings?: PenaltyToIncomeAccountMapping[];
  // Interest rate charts
  activeChart?: {
    id: number;
    name?: string;
    description?: string;
    fromDate: string | number[];
    endDate?: string | number[] | null;
    isPrimaryGroupingByAmount?: boolean;
    chartSlabs: Array<{
      id: number;
      description: string;
      periodType: EnumOptionData;
      fromPeriod: number;
      toPeriod?: number | null;
      amountRangeFrom?: number | null;
      amountRangeTo?: number | null;
      annualInterestRate: number;
      incentives?: unknown[];
    }>;
  };
}

export interface RecurringDepositProductCreateRequest {
  name: string;
  shortName: string;
  description?: string;
  currencyCode: string;
  digitsAfterDecimal: number;
  inMultiplesOf?: number;
  locale: string;
  dateFormat?: string;
  nominalAnnualInterestRate?: number;
  interestCompoundingPeriodType: number;
  interestPostingPeriodType: number;
  interestCalculationType: number;
  interestCalculationDaysInYearType: number;
  minBalanceForInterestCalculation?: number;
  accountingRule: number;
  // DepositTermDetail fields
  minDepositTerm: number;
  minDepositTermTypeId: number;
  maxDepositTerm?: number;
  maxDepositTermTypeId?: number;
  inMultiplesOfDepositTerm?: number;
  inMultiplesOfDepositTermTypeId?: number;
  // DepositProductAmountDetails fields
  depositAmount: number;
  minDepositAmount?: number;
  maxDepositAmount?: number;
  // Lock-in period
  lockinPeriodFrequency?: number;
  lockinPeriodFrequencyType?: number;
  // Pre-closure
  preClosurePenalApplicable?: boolean;
  preClosurePenalInterest?: number;
  preClosurePenalInterestOnTypeId?: number;
  // Recurring-specific
  isMandatoryDeposit?: boolean;
  allowWithdrawal?: boolean;
  adjustAdvanceTowardsFuturePayments?: boolean;
  // Tax
  withHoldTax?: boolean;
  taxGroupId?: number;
  // GL account mappings
  savingsReferenceAccountId?: number;
  savingsControlAccountId?: number;
  transfersInSuspenseAccountId?: number;
  interestOnSavingsAccountId?: number;
  incomeFromFeeAccountId?: number;
  incomeFromPenaltyAccountId?: number;
  feesReceivableAccountId?: number;
  penaltiesReceivableAccountId?: number;
  interestPayableAccountId?: number;
  // Interest rate charts
  charts?: Array<{
    name?: string;
    description?: string;
    fromDate?: string;
    endDate?: string;
    isPrimaryGroupingByAmount?: boolean;
    locale?: string;
    dateFormat?: string;
    chartSlabs: Array<{
      periodType: number;
      fromPeriod: number;
      toPeriod?: number | null;
      amountRangeFrom?: number | null;
      amountRangeTo?: number | null;
      annualInterestRate: number;
      description?: string;
      incentives?: unknown[];
    }>;
  }>;
  charges?: Array<{ id: number }>;
  // Payment/fee/penalty mappings
  paymentChannelToFundSourceMappings?: Array<{ paymentTypeId: number; fundSourceAccountId: number }>;
  feeToIncomeAccountMappings?: Array<{ chargeId: number; incomeAccountId: number }>;
  penaltyToIncomeAccountMappings?: Array<{ chargeId: number; incomeAccountId: number }>;
}

// ─── Recurring Deposit Account Create ────────────────────────────

export interface RecurringDepositAccountCreateRequest {
  clientId?: number;
  groupId?: number;
  productId: number;
  submittedOnDate: string;
  mandatoryRecommendedDepositAmount: number;
  depositPeriod: number;
  depositPeriodFrequencyId: number;
  isCalendarInherited?: boolean;
  expectedFirstDepositOnDate?: string;
  recurringFrequency?: number;
  recurringFrequencyType?: number;
  accountNo?: string;
  externalId?: string;
  fieldOfficerId?: number;
  nominalAnnualInterestRate?: number;
  interestCompoundingPeriodType?: number;
  interestPostingPeriodType?: number;
  interestCalculationType?: number;
  interestCalculationDaysInYearType?: number;
  lockinPeriodFrequency?: number;
  lockinPeriodFrequencyType?: number;
  isMandatoryDeposit?: boolean;
  allowWithdrawal?: boolean;
  adjustAdvanceTowardsFuturePayments?: boolean;
  maturityInstructionId?: number;
  transferToSavingsId?: number;
  preClosurePenalApplicable?: boolean;
  preClosurePenalInterest?: number;
  preClosurePenalInterestOnTypeId?: number;
  minDepositTerm?: number;
  minDepositTermTypeId?: number;
  maxDepositTerm?: number;
  maxDepositTermTypeId?: number;
  inMultiplesOfDepositTerm?: number;
  inMultiplesOfDepositTermTypeId?: number;
  withHoldTax?: boolean;
  charges?: Array<{
    chargeId: number;
    amount: number;
    dueDate?: string;
    feeOnMonthDay?: string;
    feeInterval?: number;
  }>;
  monthDayFormat?: string;
  locale?: string;
  dateFormat?: string;
}

// ─── Savings Product Create ──────────────────────────────────────

export interface SavingsProductCreateRequest {
  name: string;
  shortName: string;
  description?: string;
  currencyCode: string;
  digitsAfterDecimal: number;
  inMultiplesOf?: number;
  locale: string;
  dateFormat?: string;
  nominalAnnualInterestRate: number;
  interestCompoundingPeriodType: number;
  interestPostingPeriodType: number;
  interestCalculationType: number;
  interestCalculationDaysInYearType: number;
  minRequiredOpeningBalance?: number;
  lockinPeriodFrequency?: number;
  lockinPeriodFrequencyType?: number;
  withdrawalFeeAmount?: number;
  withdrawalFeeType?: number;
  withdrawalFeeForTransfers?: boolean;
  feeAmount?: number;
  feeOnMonthDay?: string;
  allowOverdraft?: boolean;
  overdraftLimit?: number;
  nominalAnnualInterestRateOverdraft?: number;
  minOverdraftForInterestCalculation?: number;
  minBalanceForInterestCalculation?: number;
  minRequiredBalance?: number;
  enforceMinRequiredBalance?: boolean;
  lienAllowed?: boolean;
  maxAllowedLienLimit?: number;
  accountingRule: number;
  charges?: number[];
  isDormancyTrackingActive?: boolean;
  daysToInactive?: number;
  daysToDormancy?: number;
  daysToEscheat?: number;
  withHoldTax?: boolean;
  taxGroupId?: number;
  monthDayFormat?: string;
  savingsReferenceAccountId?: number;
  savingsControlAccountId?: number;
  transfersInSuspenseAccountId?: number;
  interestOnSavingsAccountId?: number;
  incomeFromFeeAccountId?: number;
  incomeFromPenaltyAccountId?: number;
  overdraftPortfolioControlId?: number;
  incomeFromInterestId?: number;
  lossesWrittenOffId?: number;
  feesReceivableAccountId?: number;
  penaltiesReceivableAccountId?: number;
  interestPayableAccountId?: number;
  escheatLiabilityAccountId?: number;
  paymentChannelToFundSourceMappings?: Array<{
    paymentTypeId: number;
    fundSourceAccountId: number;
  }>;
  feeToIncomeAccountMappings?: Array<{
    chargeId: number;
    incomeAccountId: number;
  }>;
  penaltyToIncomeAccountMappings?: Array<{
    chargeId: number;
    incomeAccountId: number;
  }>;
}

// ─── Fixed Deposit Product (Section 11) ───────────────────────

export interface FixedDepositProduct {
  id: number;
  name: string;
  shortName?: string;
  description?: string;
  currency: { code: string; name: string; decimalPlaces: number; displaySymbol: string; inMultiplesOf?: number };
  nominalAnnualInterestRate: number;
  interestCompoundingPeriodType: EnumOptionData;
  interestPostingPeriodType: EnumOptionData;
  interestCalculationType: EnumOptionData;
  interestCalculationDaysInYearType: EnumOptionData;
  minBalanceForInterestCalculation?: number;
  lockinPeriodFrequency?: number;
  lockinPeriodFrequencyType?: EnumOptionData;
  // DepositProductTermAndPreClosure fields
  preClosurePenalApplicable: boolean;
  preClosurePenalInterest?: number;
  preClosurePenalInterestOnType?: EnumOptionData;
  // DepositTermDetail fields
  minDepositTerm: number;
  maxDepositTerm?: number;
  minDepositTermType: EnumOptionData;
  maxDepositTermType?: EnumOptionData;
  inMultiplesOfDepositTerm?: number;
  inMultiplesOfDepositTermType?: EnumOptionData;
  // DepositProductAmountDetails fields
  minDepositAmount?: number;
  depositAmount: number;
  maxDepositAmount?: number;
  // Base savings product fields
  accountingRule?: AccountingRuleType;
  withHoldTax?: boolean;
  taxGroup?: TaxGroup | null;
  taxGroupId?: number;
  charges?: Array<{
    id: number;
    chargeId: number;
    name: string;
    amount: number;
    chargeTimeType: EnumOptionData;
    chargeCalculationType: EnumOptionData;
    isPenalty: boolean;
    isActive: boolean;
  }>;
  accountingMappings?: SavingsProductAccountingMappings;
  paymentChannelToFundSourceMappings?: PaymentChannelToFundSourceMapping[];
  feeToIncomeAccountMappings?: FeeToIncomeAccountMapping[];
  penaltyToIncomeAccountMappings?: PenaltyToIncomeAccountMapping[];
  // Interest rate charts
  activeChart?: {
    id: number;
    name?: string;
    description?: string;
    fromDate: string;
    endDate?: string;
    isPrimaryGroupingByAmount?: boolean;
    chartSlabs: Array<{
      id: number;
      description: string;
      periodType: EnumOptionData;
      fromPeriod: number;
      toPeriod?: number | null;
      amountRangeFrom?: number | null;
      amountRangeTo?: number | null;
      annualInterestRate: number;
      incentives?: unknown[];
    }>;
  };
}

export interface FixedDepositProductCreateRequest {
  name: string;
  shortName: string;
  description?: string;
  currencyCode: string;
  digitsAfterDecimal: number;
  inMultiplesOf?: number;
  locale: string;
  dateFormat?: string;
  nominalAnnualInterestRate?: number;
  interestCompoundingPeriodType: number;
  interestPostingPeriodType: number;
  interestCalculationType: number;
  interestCalculationDaysInYearType: number;
  minBalanceForInterestCalculation?: number;
  accountingRule: number;
  // DepositTermDetail fields
  minDepositTerm: number;
  minDepositTermTypeId: number;
  maxDepositTerm?: number;
  maxDepositTermTypeId?: number;
  inMultiplesOfDepositTerm?: number;
  inMultiplesOfDepositTermTypeId?: number;
  // DepositProductAmountDetails fields
  depositAmount: number;
  minDepositAmount?: number;
  maxDepositAmount?: number;
  // Lock-in period
  lockinPeriodFrequency?: number;
  lockinPeriodFrequencyType?: number;
  // Pre-closure
  preClosurePenalApplicable?: boolean;
  preClosurePenalInterest?: number;
  preClosurePenalInterestOnTypeId?: number;
  // Tax
  withHoldTax?: boolean;
  taxGroupId?: number;
  // GL account mappings
  savingsReferenceAccountId?: number;
  savingsControlAccountId?: number;
  transfersInSuspenseAccountId?: number;
  interestOnSavingsAccountId?: number;
  incomeFromFeeAccountId?: number;
  incomeFromPenaltyAccountId?: number;
  feesReceivableAccountId?: number;
  penaltiesReceivableAccountId?: number;
  interestPayableAccountId?: number;
  // Interest rate charts
  charts?: Array<{
    name?: string;
    description?: string;
    fromDate?: string;
    endDate?: string;
    isPrimaryGroupingByAmount?: boolean;
    locale?: string;
    dateFormat?: string;
    chartSlabs: Array<{
      periodType: number;
      fromPeriod: number;
      toPeriod?: number | null;
      amountRangeFrom?: number | null;
      amountRangeTo?: number | null;
      annualInterestRate: number;
      description?: string;
      incentives?: unknown[];
    }>;
  }>;
  // Payment/fee/penalty mappings
  paymentChannelToFundSourceMappings?: Array<{
    paymentTypeId: number;
    fundSourceAccountId: number;
  }>;
  feeToIncomeAccountMappings?: Array<{
    chargeId: number;
    incomeAccountId: number;
  }>;
  penaltyToIncomeAccountMappings?: Array<{
    chargeId: number;
    incomeAccountId: number;
  }>;
}
