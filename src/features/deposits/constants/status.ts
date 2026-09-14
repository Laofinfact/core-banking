import i18n from "@/i18n";
import type { SavingsAccountStatus } from "../types/deposit";

/**
 * Map numeric status IDs to status strings.
 * IDs follow the Fineract SavingsAccountStatusType enum:
 * SUBMITTED=100, APPROVED=200, ACTIVE=300, TRANSFER_IN_PROGRESS=303,
 * TRANSFER_ON_HOLD=304, WITHDRAWN_BY_APPLICANT=400, REJECTED=500,
 * CLOSED=600, PRE_MATURE_CLOSURE=700, MATURED=800.
 */
export const SAVINGS_STATUS_ID_MAP: Record<number, SavingsAccountStatus> = {
  100: "Submitted and pending approval",
  200: "Approved",
  300: "Active",
  303: "Transfer in progress",
  304: "Transfer on hold",
  400: "Withdrawn by applicant",
  500: "Rejected",
  600: "Closed",
  700: "Premature Closed",
  800: "Matured",
};

export const SAVINGS_STATUS_LABELS: Record<string, string> = {
  "Submitted and pending approval": i18n.t("Pending"),
  Approved: i18n.t("Approved"),
  Active: i18n.t("Active"),
  Closed: i18n.t("Closed"),
  Rejected: i18n.t("Rejected"),
  "Withdrawn by applicant": i18n.t("Withdrawn"),
  Matured: i18n.t("Matured"),
  "Premature Closed": i18n.t("Premature Closed"),
  "Transfer in progress": i18n.t("Transfer In Progress"),
  "Transfer on hold": i18n.t("Transfer On Hold"),
};

/**
 * Status config keyed by status ID (numeric string) for direct lookup.
 * Usage: SAVINGS_STATUS_CONFIG[String(account.status.id)]
 */
export const SAVINGS_STATUS_CONFIG: Record<
  string,
  {
    variant: "success" | "warning" | "error" | "info" | "default";
    label: string;
  }
> = {
  "100": { variant: "info", label: i18n.t("Pending") },
  "200": { variant: "success", label: i18n.t("Approved") },
  "300": { variant: "success", label: i18n.t("Active") },
  "303": { variant: "warning", label: i18n.t("Transfer In Progress") },
  "304": { variant: "warning", label: i18n.t("Transfer On Hold") },
  "400": { variant: "warning", label: i18n.t("Withdrawn") },
  "500": { variant: "error", label: i18n.t("Rejected") },
  "600": { variant: "default", label: i18n.t("Closed") },
  "700": { variant: "warning", label: i18n.t("Premature Closed") },
  "800": { variant: "info", label: i18n.t("Matured") },
};

export const DEPOSIT_ACCOUNTS_PAGE_SIZE = 15;
export const DEPOSIT_SEARCH_DEBOUNCE_MS = 400;

/** Section 11.6: Pre-Closure Penalty Interest On Types */
export const PRE_CLOSURE_PENALTY_TYPES = [
  { id: 1, label: i18n.t("Principal Amount") },
  { id: 2, label: i18n.t("Interest Amount") },
  { id: 3, label: i18n.t("Principal + Interest") },
];

/** Section 11.6: Chart Slab Period Types */
export const CHART_SLAB_PERIOD_TYPES = [
  { id: 0, label: i18n.t("Days") },
  { id: 2, label: i18n.t("Months") },
  { id: 3, label: i18n.t("Years") },
];

/**
 * Accounting rule types (Fineract AccountingRuleType enum):
 * 1 = None, 2 = Cash Based, 3 = Accrual (Periodic), 4 = Accrual (Upfront)
 */
export const ACCOUNTING_RULES = [
  { id: 1, label: i18n.t("None") },
  { id: 2, label: i18n.t("Cash Based") },
  { id: 3, label: i18n.t("Accrual (Periodic)") },
  { id: 4, label: i18n.t("Accrual (Upfront)") },
];

/** Withdrawal fee types (Fineract SavingsWithdrawalFeesType enum) */
export const WITHDRAWAL_FEE_TYPES = [
  { id: 1, label: i18n.t("Flat") },
  { id: 2, label: i18n.t("Percent of Amount") },
];

/** Deposit account type display labels */
export const DEPOSIT_TYPE_LABELS: Record<string, string> = {
  savings: i18n.t("Savings"),
  fixed_deposit: i18n.t("Fixed Deposit"),
  recurring_deposit: i18n.t("Recurring Deposit"),
};

/** Section 10.7: Deposit Period Frequencies */
export const DEPOSIT_PERIOD_FREQUENCIES = [
  { id: 0, label: i18n.t("Days"), code: "deposit.period.savingsPeriodFrequencyType.days" },
  { id: 1, label: i18n.t("Weeks"), code: "deposit.period.savingsPeriodFrequencyType.weeks" },
  { id: 2, label: i18n.t("Months"), code: "deposit.period.savingsPeriodFrequencyType.months" },
  { id: 3, label: i18n.t("Years"), code: "deposit.period.savingsPeriodFrequencyType.years" },
];

/**
 * Fixed deposit status config keyed by status ID (numeric string).
 * Usage: FIXED_DEPOSIT_STATUS_CONFIG[String(account.status.id)]
 */
export const FIXED_DEPOSIT_STATUS_CONFIG: Record<
  string,
  { variant: "success" | "warning" | "error" | "info" | "default"; label: string }
> = {
  "100": { variant: "info", label: i18n.t("Pending") },
  "200": { variant: "success", label: i18n.t("Approved") },
  "300": { variant: "success", label: i18n.t("Active") },
  "400": { variant: "warning", label: i18n.t("Withdrawn") },
  "500": { variant: "error", label: i18n.t("Rejected") },
  "600": { variant: "default", label: i18n.t("Closed") },
  "800": { variant: "info", label: i18n.t("Matured") },
};

/**
 * Recurring deposit status config keyed by status ID (numeric string).
 * Usage: RECURRING_DEPOSIT_STATUS_CONFIG[String(account.status.id)]
 */
export const RECURRING_DEPOSIT_STATUS_CONFIG: Record<
  string,
  { variant: "success" | "warning" | "error" | "info" | "default"; label: string }
> = {
  "100": { variant: "info", label: i18n.t("Pending") },
  "200": { variant: "success", label: i18n.t("Approved") },
  "300": { variant: "success", label: i18n.t("Active") },
  "400": { variant: "warning", label: i18n.t("Withdrawn") },
  "500": { variant: "error", label: i18n.t("Rejected") },
  "600": { variant: "default", label: i18n.t("Closed") },
  "700": { variant: "warning", label: i18n.t("Premature Closed") },
};
