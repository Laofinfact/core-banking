import { z } from "zod";
import i18n from "@/i18n";

export const createSavingsAccountSchema = z.object({
  clientId: z.number({ message: i18n.t("Client is required") }).int(),
  productId: z.number({ message: i18n.t("Savings product is required") }).int(),
  submittedOnDate: z.string().min(1),
  externalId: z.string().max(100).optional(),
  fieldOfficerId: z.number().int().optional().nullable(),
  nominalAnnualInterestRate: z.number().min(0).optional(),
  minRequiredOpeningBalance: z.number().min(0).optional(),
  lockinPeriodFrequency: z.number().int().positive().optional(),
  lockinPeriodFrequencyType: z.number().int().optional(),
  withdrawalFeeForTransfers: z.boolean().optional(),
  allowOverdraft: z.boolean().optional(),
  overdraftLimit: z.number().optional(),
  enforceMinRequiredBalance: z.boolean().optional(),
  minRequiredBalance: z.number().optional(),
  locale: z.string().default("en"),
  dateFormat: z.string().default("yyyy-MM-dd"),
});

export type CreateSavingsAccountFormValues = z.infer<typeof createSavingsAccountSchema>;

/** Schema for deposit transaction */
export const depositTransactionSchema = z.object({
  transactionDate: z.string().min(1, i18n.t("Date is required")),
  transactionAmount: z.number({ message: i18n.t("Amount is required") }).positive(i18n.t("Amount must be positive")),
  paymentTypeId: z.number().int().optional(),
  receiptNumber: z.string().optional(),
  locale: z.string().default("en"),
  dateFormat: z.string().default("yyyy-MM-dd"),
});

export type DepositTransactionFormValues = z.infer<typeof depositTransactionSchema>;

/** GL account ID field for savings product accounting mappings */
const glAccountIdField = z.number().int().positive().optional().nullable();

/** Schema for savings product creation — matches POST /savingsproducts */
export const createSavingsProductSchema = z
  .object({
    name: z.string().min(1, i18n.t("Name is required")).max(100),
    shortName: z
      .string()
      .min(1, i18n.t("Short name is required"))
      .max(4, i18n.t("Max 4 characters"))
      .regex(/^\S+$/, i18n.t("No spaces allowed")),
    description: z.string().max(500).optional(),
    currencyCode: z.string().min(1, i18n.t("Currency is required")),
    digitsAfterDecimal: z.number().int().min(0).max(6).default(2),
    inMultiplesOf: z.preprocess(
      (v) => (v === "" || v === null || v === undefined || Number.isNaN(v) ? undefined : v),
      z.number().int().min(0).optional(),
    ),
    nominalAnnualInterestRate: z.number({ message: i18n.t("Interest rate is required") }).min(0),
    interestCompoundingPeriodType: z.number({ message: i18n.t("Required") }).int().min(1).max(7),
    interestPostingPeriodType: z.number({ message: i18n.t("Required") }).int().min(1).max(11),
    interestCalculationType: z.number({ message: i18n.t("Required") }).int().min(1).max(2),
    interestCalculationDaysInYearType: z.number({ message: i18n.t("Required") }).int(),
    minRequiredOpeningBalance: z.preprocess(
      (v) => (v === "" || v === null || v === undefined || Number.isNaN(v) ? undefined : v),
      z.number().min(0).optional(),
    ),
    minBalanceForInterestCalculation: z.preprocess(
      (v) => (v === "" || v === null || v === undefined || Number.isNaN(v) ? undefined : v),
      z.number().min(0).optional(),
    ),
    lockinPeriodFrequency: z.preprocess(
      (v) => (v === "" || v === null || v === undefined || Number.isNaN(v) ? undefined : v),
      z.number().int().min(0).optional(),
    ),
    lockinPeriodFrequencyType: z.number().int().min(0).max(3).optional(),
    withdrawalFeeAmount: z.preprocess(
      (v) => (v === "" || v === null || v === undefined || Number.isNaN(v) ? undefined : v),
      z.number().min(0).optional(),
    ),
    withdrawalFeeType: z.number().int().min(1).max(2).optional(),
    withdrawalFeeForTransfers: z.boolean().optional(),
    feeAmount: z.preprocess(
      (v) => (v === "" || v === null || v === undefined || Number.isNaN(v) ? undefined : v),
      z.number().min(0).optional(),
    ),
    feeOnMonthDay: z
      .string()
      .regex(
        /^(0[1-9]|[12]\d|3[01]) (January|February|March|April|May|June|July|August|September|October|November|December)$/,
        i18n.t("Must be in 'dd MMMM' format, e.g. '01 January'"),
      )
      .optional(),
    allowOverdraft: z.boolean().optional(),
    overdraftLimit: z.preprocess(
      (v) => (v === "" || v === null || v === undefined || Number.isNaN(v) ? undefined : v),
      z.number().min(0).optional(),
    ),
    nominalAnnualInterestRateOverdraft: z.preprocess(
      (v) => (v === "" || v === null || v === undefined || Number.isNaN(v) ? undefined : v),
      z.number().min(0).optional(),
    ),
    minOverdraftForInterestCalculation: z.preprocess(
      (v) => (v === "" || v === null || v === undefined || Number.isNaN(v) ? undefined : v),
      z.number().min(0).optional(),
    ),
    minRequiredBalance: z.preprocess(
      (v) => (v === "" || v === null || v === undefined || Number.isNaN(v) ? undefined : v),
      z.number().min(0).optional(),
    ),
    enforceMinRequiredBalance: z.boolean().optional(),
    lienAllowed: z.boolean().optional(),
    maxAllowedLienLimit: z.preprocess(
      (v) => (v === "" || v === null || v === undefined || Number.isNaN(v) ? undefined : v),
      z.number().min(0).optional(),
    ),
    accountingRule: z.number().int().min(1).max(4).default(1),
    isDormancyTrackingActive: z.boolean().optional(),
    daysToInactive: z.preprocess(
      (v) => (v === "" || v === null || v === undefined || Number.isNaN(v) ? undefined : v),
      z.number().int().min(1).optional(),
    ),
    daysToDormancy: z.preprocess(
      (v) => (v === "" || v === null || v === undefined || Number.isNaN(v) ? undefined : v),
      z.number().int().min(1).optional(),
    ),
    daysToEscheat: z.preprocess(
      (v) => (v === "" || v === null || v === undefined || Number.isNaN(v) ? undefined : v),
      z.number().int().min(1).optional(),
    ),
    withHoldTax: z.boolean().optional(),
    taxGroupId: z.number().int().positive().optional(),
    locale: z.string().default("en"),
    dateFormat: z.string().default("yyyy-MM-dd"),
    monthDayFormat: z.string().default("dd MMMM"),
    savingsReferenceAccountId: glAccountIdField,
    savingsControlAccountId: glAccountIdField,
    transfersInSuspenseAccountId: glAccountIdField,
    interestOnSavingsAccountId: glAccountIdField,
    incomeFromFeeAccountId: glAccountIdField,
    incomeFromPenaltyAccountId: glAccountIdField,
    overdraftPortfolioControlId: glAccountIdField,
    incomeFromInterestId: glAccountIdField,
    lossesWrittenOffId: glAccountIdField,
    feesReceivableAccountId: glAccountIdField,
    penaltiesReceivableAccountId: glAccountIdField,
    interestPayableAccountId: glAccountIdField,
    escheatLiabilityAccountId: glAccountIdField,
  })
  .superRefine((data, ctx) => {
    // lockinPeriodFrequency + lockinPeriodFrequencyType pair
    if (data.lockinPeriodFrequency && data.lockinPeriodFrequency > 0 && !data.lockinPeriodFrequencyType) {
      ctx.addIssue({
        code: "custom",
        path: ["lockinPeriodFrequencyType"],
        message: i18n.t("Lock-in type is required when frequency is set"),
      });
    }
    if (
      data.lockinPeriodFrequencyType !== undefined &&
      data.lockinPeriodFrequencyType >= 0 &&
      !data.lockinPeriodFrequency
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["lockinPeriodFrequency"],
        message: i18n.t("Lock-in frequency is required when type is set"),
      });
    }
    // feeAmount + feeOnMonthDay pair
    if (data.feeAmount && data.feeAmount > 0 && !data.feeOnMonthDay) {
      ctx.addIssue({
        code: "custom",
        path: ["feeOnMonthDay"],
        message: i18n.t("Fee month/day is required when fee amount is set. Format: 'dd MMMM' e.g. '01 January'"),
      });
    }
    if (data.feeOnMonthDay && !data.feeAmount) {
      ctx.addIssue({
        code: "custom",
        path: ["feeAmount"],
        message: i18n.t("Fee amount is required when month/day is set"),
      });
    }
    // dormancy day ordering: inactive < dormancy < escheat
    if (data.isDormancyTrackingActive) {
      if (!data.daysToInactive) {
        ctx.addIssue({ code: "custom", path: ["daysToInactive"], message: i18n.t("Days to inactive is required") });
      }
      if (!data.daysToDormancy) {
        ctx.addIssue({ code: "custom", path: ["daysToDormancy"], message: i18n.t("Days to dormancy is required") });
      } else if (data.daysToInactive && data.daysToDormancy <= data.daysToInactive) {
        ctx.addIssue({
          code: "custom",
          path: ["daysToDormancy"],
          message: i18n.t("Must be greater than days to inactive"),
        });
      }
      if (!data.daysToEscheat) {
        ctx.addIssue({ code: "custom", path: ["daysToEscheat"], message: i18n.t("Days to escheat is required") });
      } else if (data.daysToDormancy && data.daysToEscheat <= data.daysToDormancy) {
        ctx.addIssue({
          code: "custom",
          path: ["daysToEscheat"],
          message: i18n.t("Must be greater than days to dormancy"),
        });
      }
    }
    // withHoldTax + taxGroupId
    if (data.withHoldTax && !data.taxGroupId) {
      ctx.addIssue({
        code: "custom",
        path: ["taxGroupId"],
        message: i18n.t("Tax group is required when withholding tax is enabled"),
      });
    }
    // lien + overdraft limit check
    if (
      data.lienAllowed &&
      data.allowOverdraft &&
      data.overdraftLimit &&
      data.maxAllowedLienLimit &&
      data.overdraftLimit > data.maxAllowedLienLimit
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["maxAllowedLienLimit"],
        message: i18n.t("Lien limit must be greater than or equal to overdraft limit"),
      });
    }
    // Accounting rule GL validations (rule 2 = Cash, rule 3 = Accrual Periodic, rule 4 = Accrual Upfront)
    const needsGLAccounts = data.accountingRule === 2 || data.accountingRule === 3 || data.accountingRule === 4;
    if (needsGLAccounts) {
      if (!data.savingsControlAccountId) {
        ctx.addIssue({
          code: "custom",
          path: ["savingsControlAccountId"],
          message: i18n.t("Savings Control account is required for cash/accrual accounting"),
        });
      }
      if (!data.savingsReferenceAccountId) {
        ctx.addIssue({
          code: "custom",
          path: ["savingsReferenceAccountId"],
          message: i18n.t("Savings Reference account is required for cash/accrual accounting"),
        });
      }
      if (!data.transfersInSuspenseAccountId) {
        ctx.addIssue({
          code: "custom",
          path: ["transfersInSuspenseAccountId"],
          message: i18n.t("Transfers in Suspense account is required for cash/accrual accounting"),
        });
      }
      if (!data.interestOnSavingsAccountId) {
        ctx.addIssue({
          code: "custom",
          path: ["interestOnSavingsAccountId"],
          message: i18n.t("Interest on Savings account is required for cash/accrual accounting"),
        });
      }
      if (!data.incomeFromFeeAccountId) {
        ctx.addIssue({
          code: "custom",
          path: ["incomeFromFeeAccountId"],
          message: i18n.t("Income from Fees account is required for cash/accrual accounting"),
        });
      }
      if (!data.incomeFromPenaltyAccountId) {
        ctx.addIssue({
          code: "custom",
          path: ["incomeFromPenaltyAccountId"],
          message: i18n.t("Income from Penalties account is required for cash/accrual accounting"),
        });
      }
      // Overdraft GL accounts required only if overdraft is enabled (for savings products)
      if (data.allowOverdraft) {
        if (!data.overdraftPortfolioControlId) {
          ctx.addIssue({
            code: "custom",
            path: ["overdraftPortfolioControlId"],
            message: i18n.t("Overdraft Portfolio Control account is required when overdraft is enabled"),
          });
        }
        if (!data.incomeFromInterestId) {
          ctx.addIssue({
            code: "custom",
            path: ["incomeFromInterestId"],
            message: i18n.t("Income from Interest account is required when overdraft is enabled"),
          });
        }
        if (!data.lossesWrittenOffId) {
          ctx.addIssue({
            code: "custom",
            path: ["lossesWrittenOffId"],
            message: i18n.t("Losses Written Off account is required when overdraft is enabled"),
          });
        }
      }
      // Dormancy tracking requires escheat liability
      if (data.isDormancyTrackingActive && !data.escheatLiabilityAccountId) {
        ctx.addIssue({
          code: "custom",
          path: ["escheatLiabilityAccountId"],
          message: i18n.t("Escheat Liability account is required when dormancy tracking is active"),
        });
      }
      // Accrual Periodic (rule 3) requires additional receivable/payable accounts
      if (data.accountingRule === 3) {
        if (!data.feesReceivableAccountId) {
          ctx.addIssue({
            code: "custom",
            path: ["feesReceivableAccountId"],
            message: i18n.t("Fees Receivable account is required for periodic accrual accounting"),
          });
        }
        if (!data.penaltiesReceivableAccountId) {
          ctx.addIssue({
            code: "custom",
            path: ["penaltiesReceivableAccountId"],
            message: i18n.t("Penalties Receivable account is required for periodic accrual accounting"),
          });
        }
        if (!data.interestPayableAccountId) {
          ctx.addIssue({
            code: "custom",
            path: ["interestPayableAccountId"],
            message: i18n.t("Interest Payable account is required for periodic accrual accounting"),
          });
        }
      }
    }
  });

export type CreateSavingsProductFormValues = z.infer<typeof createSavingsProductSchema>;

/** Schema for recurring deposit account creation — matches POST /recurringdepositaccounts */
export const createRecurringDepositAccountSchema = z.object({
  clientId: z.string().min(1, i18n.t("Client is required")),
  productId: z.string().min(1, i18n.t("Product is required")),
  externalId: z.string().optional(),
  mandatoryRecommendedDepositAmount: z.string().min(1, i18n.t("Recurring amount is required")),
  depositPeriod: z.string().min(1, i18n.t("Period is required")),
  depositPeriodFrequencyId: z.string(),
  submittedOnDate: z.string().min(1, i18n.t("Date is required")),
  recurringFrequency: z.string().optional(),
  recurringFrequencyType: z.string().optional(),
});

export type CreateRecurringDepositAccountFormValues = z.infer<typeof createRecurringDepositAccountSchema>;

const glAccountIdFieldRd = z.number().int().positive().optional().nullable();

/** Schema for recurring deposit product creation — matches POST /recurringdepositproducts */
export const createRecurringDepositProductSchema = z
  .object({
    name: z.string().min(1, i18n.t("Name is required")).max(100),
    shortName: z
      .string()
      .min(1, i18n.t("Short name is required"))
      .max(4, i18n.t("Max 4 characters"))
      .regex(/^\S+$/, i18n.t("No spaces allowed")),
    description: z.string().max(500).optional(),
    currencyCode: z.string().min(1, i18n.t("Currency is required")),
    digitsAfterDecimal: z.number().int().min(0).max(6).default(2),
    inMultiplesOf: z.preprocess(
      (v) => (v === "" || v === null || v === undefined || Number.isNaN(v) ? undefined : v),
      z.number().int().min(0).optional(),
    ),
    nominalAnnualInterestRate: z.number({ message: i18n.t("Interest rate is required") }).min(0),
    interestCompoundingPeriodType: z.number({ message: i18n.t("Required") }).int().min(1).max(7),
    interestPostingPeriodType: z.number({ message: i18n.t("Required") }).int().min(1).max(11),
    interestCalculationType: z.number({ message: i18n.t("Required") }).int().min(1).max(2),
    interestCalculationDaysInYearType: z.number({ message: i18n.t("Required") }).int(),
    minBalanceForInterestCalculation: z.preprocess(
      (v) => (v === "" || v === null || v === undefined || Number.isNaN(v) ? undefined : v),
      z.number().min(0).optional(),
    ),
    lockinPeriodFrequency: z.preprocess(
      (v) => (v === "" || v === null || v === undefined || Number.isNaN(v) ? undefined : v),
      z.number().int().min(0).optional(),
    ),
    lockinPeriodFrequencyType: z.number().int().min(0).max(3).optional(),
    // Deposit term details
    minDepositTerm: z.number({ message: i18n.t("Min term is required") }).int().positive(i18n.t("Min term must be > 0")),
    minDepositTermTypeId: z.number({ message: i18n.t("Required") }).int(),
    maxDepositTerm: z.preprocess(
      (v) => (v === "" || v === null || v === undefined || Number.isNaN(v) ? undefined : v),
      z.number().int().positive().optional(),
    ),
    maxDepositTermTypeId: z.number().int().optional(),
    inMultiplesOfDepositTerm: z.preprocess(
      (v) => (v === "" || v === null || v === undefined || Number.isNaN(v) ? undefined : v),
      z.number().int().positive().optional(),
    ),
    inMultiplesOfDepositTermTypeId: z.number().int().optional(),
    // Deposit amount details
    depositAmount: z.number({ message: i18n.t("Deposit amount is required") }).positive(i18n.t("Deposit amount must be > 0")),
    minDepositAmount: z.preprocess(
      (v) => (v === "" || v === null || v === undefined || Number.isNaN(v) ? undefined : v),
      z.number().min(0).optional(),
    ),
    maxDepositAmount: z.preprocess(
      (v) => (v === "" || v === null || v === undefined || Number.isNaN(v) ? undefined : v),
      z.number().min(0).optional(),
    ),
    // Recurring-specific
    isMandatoryDeposit: z.boolean().optional(),
    allowWithdrawal: z.boolean().optional(),
    adjustAdvanceTowardsFuturePayments: z.boolean().optional(),
    // Pre-closure
    preClosurePenalApplicable: z.boolean().optional(),
    preClosurePenalInterest: z.preprocess(
      (v) => (v === "" || v === null || v === undefined || Number.isNaN(v) ? undefined : v),
      z.number().min(0).optional(),
    ),
    preClosurePenalInterestOnTypeId: z.number().int().optional(),
    // Tax
    withHoldTax: z.boolean().optional(),
    taxGroupId: z.number().int().positive().optional(),
    accountingRule: z.number().int().min(1).max(4).default(1),
    locale: z.string().default("en"),
    dateFormat: z.string().default("yyyy-MM-dd"),
    // GL account mappings
    savingsReferenceAccountId: glAccountIdFieldRd,
    savingsControlAccountId: glAccountIdFieldRd,
    transfersInSuspenseAccountId: glAccountIdFieldRd,
    interestOnSavingsAccountId: glAccountIdFieldRd,
    incomeFromFeeAccountId: glAccountIdFieldRd,
    incomeFromPenaltyAccountId: glAccountIdFieldRd,
    feesReceivableAccountId: glAccountIdFieldRd,
    penaltiesReceivableAccountId: glAccountIdFieldRd,
    interestPayableAccountId: glAccountIdFieldRd,
  })
  .superRefine((data, ctx) => {
    // lockinPeriodFrequency + lockinPeriodFrequencyType pair
    if (data.lockinPeriodFrequency && data.lockinPeriodFrequency > 0 && !data.lockinPeriodFrequencyType) {
      ctx.addIssue({
        code: "custom",
        path: ["lockinPeriodFrequencyType"],
        message: i18n.t("Lock-in type is required when frequency is set"),
      });
    }
    if (
      data.lockinPeriodFrequencyType !== undefined &&
      data.lockinPeriodFrequencyType >= 0 &&
      !data.lockinPeriodFrequency
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["lockinPeriodFrequency"],
        message: i18n.t("Lock-in frequency is required when type is set"),
      });
    }
    // Deposit term: min <= max
    if (data.maxDepositTerm && data.maxDepositTerm > 0 && data.minDepositTerm > data.maxDepositTerm) {
      ctx.addIssue({
        code: "custom",
        path: ["maxDepositTerm"],
        message: i18n.t("Max term must be >= min term"),
      });
    }
    // Deposit amount: min <= deposit <= max
    if (data.minDepositAmount && data.minDepositAmount > data.depositAmount) {
      ctx.addIssue({
        code: "custom",
        path: ["minDepositAmount"],
        message: i18n.t("Min deposit amount must be <= deposit amount"),
      });
    }
    if (data.maxDepositAmount && data.maxDepositAmount < data.depositAmount) {
      ctx.addIssue({
        code: "custom",
        path: ["maxDepositAmount"],
        message: i18n.t("Max deposit amount must be >= deposit amount"),
      });
    }
    // Pre-closure penalty
    if (data.preClosurePenalApplicable) {
      if (!data.preClosurePenalInterest && data.preClosurePenalInterest !== 0) {
        ctx.addIssue({
          code: "custom",
          path: ["preClosurePenalInterest"],
          message: i18n.t("Penalty interest is required when pre-closure penalty is applicable"),
        });
      }
      if (!data.preClosurePenalInterestOnTypeId) {
        ctx.addIssue({
          code: "custom",
          path: ["preClosurePenalInterestOnTypeId"],
          message: i18n.t("Penalty type is required when pre-closure penalty is applicable"),
        });
      }
    }
    // withHoldTax + taxGroupId
    if (data.withHoldTax && !data.taxGroupId) {
      ctx.addIssue({
        code: "custom",
        path: ["taxGroupId"],
        message: i18n.t("Tax group is required when withholding tax is enabled"),
      });
    }
    // Accounting rule GL validations
    const needsGLAccounts = data.accountingRule === 2 || data.accountingRule === 3 || data.accountingRule === 4;
    if (needsGLAccounts) {
      if (!data.savingsControlAccountId) {
        ctx.addIssue({
          code: "custom",
          path: ["savingsControlAccountId"],
          message: i18n.t("Savings Control account is required for cash/accrual accounting"),
        });
      }
      if (!data.savingsReferenceAccountId) {
        ctx.addIssue({
          code: "custom",
          path: ["savingsReferenceAccountId"],
          message: i18n.t("Savings Reference account is required for cash/accrual accounting"),
        });
      }
      if (!data.transfersInSuspenseAccountId) {
        ctx.addIssue({
          code: "custom",
          path: ["transfersInSuspenseAccountId"],
          message: i18n.t("Transfers in Suspense account is required for cash/accrual accounting"),
        });
      }
      if (!data.interestOnSavingsAccountId) {
        ctx.addIssue({
          code: "custom",
          path: ["interestOnSavingsAccountId"],
          message: i18n.t("Interest on Savings account is required for cash/accrual accounting"),
        });
      }
      if (!data.incomeFromFeeAccountId) {
        ctx.addIssue({
          code: "custom",
          path: ["incomeFromFeeAccountId"],
          message: i18n.t("Income from Fees account is required for cash/accrual accounting"),
        });
      }
      if (!data.incomeFromPenaltyAccountId) {
        ctx.addIssue({
          code: "custom",
          path: ["incomeFromPenaltyAccountId"],
          message: i18n.t("Income from Penalties account is required for cash/accrual accounting"),
        });
      }
      // Accrual Periodic (rule 3) requires additional receivable/payable accounts
      if (data.accountingRule === 3) {
        if (!data.feesReceivableAccountId) {
          ctx.addIssue({
            code: "custom",
            path: ["feesReceivableAccountId"],
            message: i18n.t("Fees Receivable account is required for periodic accrual accounting"),
          });
        }
        if (!data.penaltiesReceivableAccountId) {
          ctx.addIssue({
            code: "custom",
            path: ["penaltiesReceivableAccountId"],
            message: i18n.t("Penalties Receivable account is required for periodic accrual accounting"),
          });
        }
        if (!data.interestPayableAccountId) {
          ctx.addIssue({
            code: "custom",
            path: ["interestPayableAccountId"],
            message: i18n.t("Interest Payable account is required for periodic accrual accounting"),
          });
        }
      }
    }
  });

export type CreateRecurringDepositProductFormValues = z.infer<typeof createRecurringDepositProductSchema>;

export const holdAmountSchema = z.object({
  transactionDate: z.string().min(1, i18n.t("Date is required")),
  transactionAmount: z.number({ message: i18n.t("Amount is required") }).positive(i18n.t("Amount must be positive")),
  reasonForBlock: z.string().min(1, i18n.t("Reason is required")).max(100, i18n.t("Max 100 characters")),
  lienAllowed: z.boolean(),
  externalId: z.string().max(100, i18n.t("Max 100 characters")).optional(),
  locale: z.string(),
  dateFormat: z.string(),
});

export type HoldAmountFormValues = z.infer<typeof holdAmountSchema>;

/** Schema for fixed deposit product creation — matches POST /fixeddepositproducts */
const glAccountIdFieldFd = z.number().int().positive().optional().nullable();

export const createFixedDepositProductSchema = z
  .object({
    name: z.string().min(1, i18n.t("Name is required")).max(100),
    shortName: z
      .string()
      .min(1, i18n.t("Short name is required"))
      .max(4, i18n.t("Max 4 characters"))
      .regex(/^\S+$/, i18n.t("No spaces allowed")),
    description: z.string().max(500).optional(),
    currencyCode: z.string().min(1, i18n.t("Currency is required")),
    digitsAfterDecimal: z.number().int().min(0).max(6).default(2),
    inMultiplesOf: z.preprocess(
      (v) => (v === "" || v === null || v === undefined || Number.isNaN(v) ? undefined : v),
      z.number().int().min(0).optional(),
    ),
    nominalAnnualInterestRate: z.number({ message: i18n.t("Interest rate is required") }).min(0),
    interestCompoundingPeriodType: z.number({ message: i18n.t("Required") }).int().min(1).max(7),
    interestPostingPeriodType: z.number({ message: i18n.t("Required") }).int().min(1).max(11),
    interestCalculationType: z.number({ message: i18n.t("Required") }).int().min(1).max(2),
    interestCalculationDaysInYearType: z.number({ message: i18n.t("Required") }).int(),
    minBalanceForInterestCalculation: z.preprocess(
      (v) => (v === "" || v === null || v === undefined || Number.isNaN(v) ? undefined : v),
      z.number().min(0).optional(),
    ),
    lockinPeriodFrequency: z.preprocess(
      (v) => (v === "" || v === null || v === undefined || Number.isNaN(v) ? undefined : v),
      z.number().int().min(0).optional(),
    ),
    lockinPeriodFrequencyType: z.number().int().min(0).max(3).optional(),
    // Deposit term details
    minDepositTerm: z.number({ message: i18n.t("Min term is required") }).int().positive(i18n.t("Min term must be > 0")),
    minDepositTermTypeId: z.number({ message: i18n.t("Required") }).int(),
    maxDepositTerm: z.preprocess(
      (v) => (v === "" || v === null || v === undefined || Number.isNaN(v) ? undefined : v),
      z.number().int().positive().optional(),
    ),
    maxDepositTermTypeId: z.number().int().optional(),
    inMultiplesOfDepositTerm: z.preprocess(
      (v) => (v === "" || v === null || v === undefined || Number.isNaN(v) ? undefined : v),
      z.number().int().positive().optional(),
    ),
    inMultiplesOfDepositTermTypeId: z.number().int().optional(),
    // Deposit amount details
    depositAmount: z.number({ message: i18n.t("Deposit amount is required") }).positive(i18n.t("Deposit amount must be > 0")),
    minDepositAmount: z.preprocess(
      (v) => (v === "" || v === null || v === undefined || Number.isNaN(v) ? undefined : v),
      z.number().min(0).optional(),
    ),
    maxDepositAmount: z.preprocess(
      (v) => (v === "" || v === null || v === undefined || Number.isNaN(v) ? undefined : v),
      z.number().min(0).optional(),
    ),
    // Pre-closure
    preClosurePenalApplicable: z.boolean().optional(),
    preClosurePenalInterest: z.preprocess(
      (v) => (v === "" || v === null || v === undefined || Number.isNaN(v) ? undefined : v),
      z.number().min(0).optional(),
    ),
    preClosurePenalInterestOnTypeId: z.number().int().optional(),
    // Tax
    withHoldTax: z.boolean().optional(),
    taxGroupId: z.number().int().positive().optional(),
    accountingRule: z.number().int().min(1).max(4).default(1),
    locale: z.string().default("en"),
    dateFormat: z.string().default("yyyy-MM-dd"),
    // GL account mappings
    savingsReferenceAccountId: glAccountIdFieldFd,
    savingsControlAccountId: glAccountIdFieldFd,
    transfersInSuspenseAccountId: glAccountIdFieldFd,
    interestOnSavingsAccountId: glAccountIdFieldFd,
    incomeFromFeeAccountId: glAccountIdFieldFd,
    incomeFromPenaltyAccountId: glAccountIdFieldFd,
    feesReceivableAccountId: glAccountIdFieldFd,
    penaltiesReceivableAccountId: glAccountIdFieldFd,
    interestPayableAccountId: glAccountIdFieldFd,
  })
  .superRefine((data, ctx) => {
    // lockinPeriodFrequency + lockinPeriodFrequencyType pair
    if (data.lockinPeriodFrequency && data.lockinPeriodFrequency > 0 && !data.lockinPeriodFrequencyType) {
      ctx.addIssue({
        code: "custom",
        path: ["lockinPeriodFrequencyType"],
        message: i18n.t("Lock-in type is required when frequency is set"),
      });
    }
    if (
      data.lockinPeriodFrequencyType !== undefined &&
      data.lockinPeriodFrequencyType >= 0 &&
      !data.lockinPeriodFrequency
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["lockinPeriodFrequency"],
        message: i18n.t("Lock-in frequency is required when type is set"),
      });
    }
    // Deposit term: min <= max
    if (
      data.maxDepositTerm &&
      data.maxDepositTerm > 0 &&
      data.minDepositTerm > data.maxDepositTerm
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["maxDepositTerm"],
        message: i18n.t("Max term must be greater than or equal to min term"),
      });
    }
    // Deposit amount: min <= deposit <= max
    if (data.minDepositAmount && data.minDepositAmount > data.depositAmount) {
      ctx.addIssue({
        code: "custom",
        path: ["minDepositAmount"],
        message: i18n.t("Min deposit amount must be <= deposit amount"),
      });
    }
    if (data.maxDepositAmount && data.maxDepositAmount < data.depositAmount) {
      ctx.addIssue({
        code: "custom",
        path: ["maxDepositAmount"],
        message: i18n.t("Max deposit amount must be >= deposit amount"),
      });
    }
    // Pre-closure penalty
    if (data.preClosurePenalApplicable) {
      if (!data.preClosurePenalInterest && data.preClosurePenalInterest !== 0) {
        ctx.addIssue({
          code: "custom",
          path: ["preClosurePenalInterest"],
          message: i18n.t("Penalty interest is required when pre-closure penalty is applicable"),
        });
      }
      if (!data.preClosurePenalInterestOnTypeId) {
        ctx.addIssue({
          code: "custom",
          path: ["preClosurePenalInterestOnTypeId"],
          message: i18n.t("Penalty type is required when pre-closure penalty is applicable"),
        });
      }
    }
    // withHoldTax + taxGroupId
    if (data.withHoldTax && !data.taxGroupId) {
      ctx.addIssue({
        code: "custom",
        path: ["taxGroupId"],
        message: i18n.t("Tax group is required when withholding tax is enabled"),
      });
    }
    // Accounting rule GL validations
    const needsGLAccounts = data.accountingRule === 2 || data.accountingRule === 3 || data.accountingRule === 4;
    if (needsGLAccounts) {
      if (!data.savingsControlAccountId) {
        ctx.addIssue({
          code: "custom",
          path: ["savingsControlAccountId"],
          message: i18n.t("Savings Control account is required for cash/accrual accounting"),
        });
      }
      if (!data.savingsReferenceAccountId) {
        ctx.addIssue({
          code: "custom",
          path: ["savingsReferenceAccountId"],
          message: i18n.t("Savings Reference account is required for cash/accrual accounting"),
        });
      }
      if (!data.transfersInSuspenseAccountId) {
        ctx.addIssue({
          code: "custom",
          path: ["transfersInSuspenseAccountId"],
          message: i18n.t("Transfers in Suspense account is required for cash/accrual accounting"),
        });
      }
      if (!data.interestOnSavingsAccountId) {
        ctx.addIssue({
          code: "custom",
          path: ["interestOnSavingsAccountId"],
          message: i18n.t("Interest on Savings account is required for cash/accrual accounting"),
        });
      }
      if (!data.incomeFromFeeAccountId) {
        ctx.addIssue({
          code: "custom",
          path: ["incomeFromFeeAccountId"],
          message: i18n.t("Income from Fees account is required for cash/accrual accounting"),
        });
      }
      if (!data.incomeFromPenaltyAccountId) {
        ctx.addIssue({
          code: "custom",
          path: ["incomeFromPenaltyAccountId"],
          message: i18n.t("Income from Penalties account is required for cash/accrual accounting"),
        });
      }
      // Accrual Periodic (rule 3) requires additional receivable/payable accounts
      if (data.accountingRule === 3) {
        if (!data.feesReceivableAccountId) {
          ctx.addIssue({
            code: "custom",
            path: ["feesReceivableAccountId"],
            message: i18n.t("Fees Receivable account is required for periodic accrual accounting"),
          });
        }
        if (!data.penaltiesReceivableAccountId) {
          ctx.addIssue({
            code: "custom",
            path: ["penaltiesReceivableAccountId"],
            message: i18n.t("Penalties Receivable account is required for periodic accrual accounting"),
          });
        }
        if (!data.interestPayableAccountId) {
          ctx.addIssue({
            code: "custom",
            path: ["interestPayableAccountId"],
            message: i18n.t("Interest Payable account is required for periodic accrual accounting"),
          });
        }
      }
    }
  });

export type CreateFixedDepositProductFormValues = z.infer<typeof createFixedDepositProductSchema>;
