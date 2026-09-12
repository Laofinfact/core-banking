import { type FC, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientSearch } from "@/components/shared/ClientSearch";
import { LoanProductSearch } from "@/components/shared/LoanProductSearch";
import { LoanOriginatorPicker } from "@/features/loan-originators";
import type { LoanOriginator } from "@/features/loan-originators";
import { createLoanSchema, type CreateLoanFormValues } from "../schemas/loan.schema";
import type { Loan, LoanTemplate, LoanCollateralCreateRequest } from "../types/loan";
import { useCollateralTemplate } from "../hooks/useLoanCollateral";
import { currentDate } from "@/lib/utils";

interface LoanFormProps {
  products: Array<{ id: number; name: string; multiDisburseLoan?: boolean }>;
  loan?: Loan;
  /** Loans template (doc §3/§4): carries product defaults + option sets. */
  template?: Partial<LoanTemplate>;
  /** Client-scoped template is being fetched (create mode). */
  templateLoading?: boolean;
  onSubmit: (values: CreateLoanFormValues) => Promise<void>;
  isSubmitting: boolean;
  error?: string | null;
  mode: "create" | "edit";
  clientId?: number;
  onClientChange?: (clientId: number) => void;
  onProductIdChange?: (productId: number) => void;
  strategyOptions?: Array<{ id: number; code: string; name: string }>;
  fundOptions?: Array<{ id: number; name: string }>;
  loanOfficerOptions?: Array<{ id: number; displayName?: string; name?: string }>;
  loanPurposeOptions?: Array<{ id: number; name: string }>;
  accountLinkingOptions?: Array<{ id: number; accountNo?: string; productName?: string }>;
  amortizationTypeOptions?: Array<{ id: number; code?: string; value?: string; name?: string }>;
  interestTypeOptions?: Array<{ id: number; code?: string; value?: string; name?: string }>;
  interestCalculationPeriodTypeOptions?: Array<{ id: number; code?: string; value?: string; name?: string }>;
  repaymentFrequencyTypeOptions?: Array<{ id: number; code?: string; value?: string; name?: string }>;
  interestRateFrequencyTypeOptions?: Array<{ id: number; code?: string; value?: string; name?: string }>;
  daysInYearTypeOptions?: Array<{ id: number; code?: string; value?: string; name?: string }>;
  daysInMonthTypeOptions?: Array<{ id: number; code?: string; value?: string; name?: string }>;
  chargeOptions?: Array<{ id: number; name: string; active?: boolean; penalty?: boolean; amount?: number }>;
  /** Preview the repayment schedule before submitting (POST /loans?command=calculateLoanSchedule) */
  onPreviewSchedule?: (values: FormFields) => void;
  previewLoading?: boolean;
}

/** Type override for fields not in the Zod schema yet */
export type FormFields = CreateLoanFormValues & {
  repaymentsStartingFromDate?: string;
  originators?: Array<{ id: number; name?: string | null }>;
  collateral?: LoanCollateralCreateRequest[];
};

const ChargeCheckbox: React.FC<{
  charge: { id: number; name: string; amount?: number; penalty?: boolean };
  checked: boolean;
  onToggle: (checked: boolean) => void;
  amount: number | undefined;
  onAmountChange: (amount: number) => void;
  disabled?: boolean;
}> = ({ charge, checked, onToggle, amount, onAmountChange, disabled }) => {
  const { t } = useTranslation();
  return (
    <div className="flex items-start gap-3 rounded-lg border p-3">
      <Checkbox
        id={`charge-${charge.id}`}
        checked={checked}
        onCheckedChange={(v) => onToggle(v === true)}
        disabled={disabled}
        className="mt-0.5"
      />
      <div className="flex-1 space-y-1">
        <label htmlFor={`charge-${charge.id}`} className="flex items-center gap-2 text-sm font-medium">
          {charge.name}
          {charge.penalty && <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] text-red-700">Penalty</span>}
        </label>
        {checked && (
          <Input
            type="number"
            step="0.01"
            value={amount ?? charge.amount ?? 0}
            onChange={(e) => onAmountChange(Number(e.target.value))}
            disabled={disabled}
            placeholder={t("Amount")}
            className="max-w-[180px]"
          />
        )}
      </div>
    </div>
  );
};

// ─── Loan Form Component ─────────────────────────────────────────
const LoanForm: FC<LoanFormProps> = ({
  products,
  loan,
  template,
  templateLoading,
  onSubmit,
  isSubmitting,
  error,
  mode,
  clientId,
  onClientChange,
  onProductIdChange,
  strategyOptions,
  fundOptions,
  loanOfficerOptions,
  loanPurposeOptions,
  accountLinkingOptions,
  amortizationTypeOptions,
  interestTypeOptions,
  interestCalculationPeriodTypeOptions,
  repaymentFrequencyTypeOptions,
  interestRateFrequencyTypeOptions,
  daysInYearTypeOptions,
  daysInMonthTypeOptions,
  chargeOptions,
  onPreviewSchedule,
  previewLoading,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useForm<FormFields>({
    resolver: zodResolver(createLoanSchema) as Resolver<FormFields>,
    defaultValues: {
      clientId: loan?.clientId ?? clientId ?? undefined,
      productId: loan?.loanProductId ?? undefined,
      principal: loan?.principal ?? undefined,
      loanTermFrequency: loan?.termFrequency ?? undefined,
      loanTermFrequencyType: loan?.termPeriodFrequencyType?.id ?? 0,
      numberOfRepayments: loan?.numberOfRepayments ?? undefined,
      repaymentEvery: loan?.repaymentEvery ?? undefined,
      repaymentFrequencyType: loan?.repaymentFrequencyType?.id ?? 0,
      interestRatePerPeriod: loan?.interestRatePerPeriod ?? undefined,
      interestRateFrequencyType: loan?.interestRateFrequencyType?.id ?? undefined,
      interestType: loan?.interestType?.id ?? undefined,
      amortizationType: loan?.amortizationType?.id ?? undefined,
      interestCalculationPeriodType: loan?.interestCalculationPeriodType?.id ?? undefined,
      expectedDisbursementDate:
        currentDate(Array.isArray(loan?.expectedDisbursementDate) ? undefined : loan?.expectedDisbursementDate) ||
        currentDate(),
      submittedOnDate:
        currentDate(Array.isArray(loan?.submittedOnDate) ? undefined : loan?.submittedOnDate) || currentDate(),
      transactionProcessingStrategyCode: loan?.transactionProcessingStrategyCode ?? "mifos-standard-strategy",
      loanPurposeId: undefined,
      loanOfficerId: undefined,
      fundId: undefined,
      linkAccountId: undefined,
      externalId: loan?.externalId ?? "",
      graceOnPrincipalPayment: undefined,
      graceOnInterestPayment: undefined,
      graceOnInterestCharged: undefined,
      graceOnArrearsAgeing: undefined,
      inArrearsTolerance: undefined,
      maxOutstandingLoanBalance: undefined,
      fixedLength: undefined,
      recurringMoratoriumOnPrincipalPeriods: undefined,
      interestChargedFromDate: undefined,
      daysInYearType: undefined,
      daysInMonthType: undefined,
      allowPartialPeriodInterestCalculation: undefined,
      syncExpectedWithDisbursementDate: undefined,
      disallowExpectedDisbursements: undefined,
      repaymentsStartingFromDate: "",
      dateFormat: "yyyy-MM-dd",
      locale: "en",
    },
  });

  const { t } = useTranslation();
  const productIdVal = watch("productId");
  const clientIdVal = watch("clientId");
  const [selectedOriginators, setSelectedOriginators] = useState<LoanOriginator[]>([]);
  const [collateralItems, setCollateralItems] = useState<LoanCollateralCreateRequest[]>([]);
  const { data: collateralTemplate } = useCollateralTemplate();

  // Per-field read-only matrix (doc §22 / §16.1):
  //   clientId & loanProductId  → locked after submission
  //   principal, numberOfRepayments, interestRatePerPeriod → locked after approval
  //   approvedPrincipal        → locked after disbursement
  const statusId = loan?.status?.id;
  const afterApproval = statusId != null && statusId >= 200;

  // Report client/product changes so the page can (re)load the template (doc §3).
  useEffect(() => {
    if (mode === "create") onClientChange?.(clientIdVal);
  }, [clientIdVal, onClientChange, mode]);

  useEffect(() => {
    if (mode === "create") onProductIdChange?.(productIdVal);
  }, [productIdVal, onProductIdChange, mode]);

  // ── Prefill product defaults from the product-scoped template (doc §3/§7) ─────
  const prefillFromTemplate = useCallback(
    (tpl: Partial<LoanTemplate>) => {
      if (tpl.principal != null) setValue("principal", tpl.principal);
      if (tpl.termFrequency != null) setValue("loanTermFrequency", tpl.termFrequency);
      if (tpl.termPeriodFrequencyType?.id != null) setValue("loanTermFrequencyType", tpl.termPeriodFrequencyType.id);
      if (tpl.numberOfRepayments != null) setValue("numberOfRepayments", tpl.numberOfRepayments);
      if (tpl.repaymentEvery != null) setValue("repaymentEvery", tpl.repaymentEvery);
      if (tpl.repaymentFrequencyType?.id != null) setValue("repaymentFrequencyType", tpl.repaymentFrequencyType.id);
      if (tpl.interestRatePerPeriod != null) setValue("interestRatePerPeriod", tpl.interestRatePerPeriod);
      if (tpl.interestRateFrequencyType?.id != null)
        setValue("interestRateFrequencyType", tpl.interestRateFrequencyType.id);
      if (tpl.interestType?.id != null) setValue("interestType", tpl.interestType.id);
      if (tpl.amortizationType?.id != null) setValue("amortizationType", tpl.amortizationType.id);
      if (tpl.interestCalculationPeriodType?.id != null)
        setValue("interestCalculationPeriodType", tpl.interestCalculationPeriodType.id);
      if (tpl.transactionProcessingStrategyCode)
        setValue("transactionProcessingStrategyCode", tpl.transactionProcessingStrategyCode);
      if (tpl.graceOnPrincipalPayment != null) setValue("graceOnPrincipalPayment", tpl.graceOnPrincipalPayment);
      if (tpl.graceOnInterestPayment != null) setValue("graceOnInterestPayment", tpl.graceOnInterestPayment);
      if (tpl.graceOnInterestCharged != null) setValue("graceOnInterestCharged", tpl.graceOnInterestCharged);
      if (tpl.graceOnArrearsAgeing != null) setValue("graceOnArrearsAgeing", tpl.graceOnArrearsAgeing);
      if (tpl.inArrearsTolerance != null) setValue("inArrearsTolerance", tpl.inArrearsTolerance);
      if (tpl.maxOutstandingLoanBalance != null) setValue("maxOutstandingLoanBalance", tpl.maxOutstandingLoanBalance);
      if (tpl.expectedDisbursementDate) setValue("expectedDisbursementDate", currentDate(tpl.expectedDisbursementDate));
    },
    [setValue],
  );

  // Apply the template's business-day default for the disbursement date (doc §5).
  useEffect(() => {
    if (template?.expectedDisbursementDate) {
      setValue("expectedDisbursementDate", currentDate(template.expectedDisbursementDate));
    }
  }, [template?.expectedDisbursementDate, setValue]);

  useEffect(() => {
    if (!template) return;
    // Only apply product defaults once a product is selected and the template
    // actually corresponds to the current selection.
    if (template.loanProductId == null && template.principal == null) return;
    if (template.loanProductId != null && template.loanProductId !== productIdVal) return;
    prefillFromTemplate(template);
  }, [template, prefillFromTemplate, productIdVal]);

  // ── Product select handler ───────────────────────────────────────
  const handleProductSelect = (id: number) => {
    if (id === 0) {
      setValue("productId", 0, { shouldValidate: true });
      return;
    }
    setValue("productId", id, { shouldValidate: true });
  };

  // ── Client change handler ────────────────────────────────────────
  const handleClientChange = useCallback(
    (id: number) => {
      setValue("clientId", id, { shouldValidate: true });
      if (mode === "create") {
        setValue("productId", 0, { shouldValidate: true });
      }
    },
    [setValue, mode],
  );

  // ── Sync term frequency type with repayment frequency type (doc §8/§11) ──
  const syncFrequencyType = (v: number) => {
    setValue("loanTermFrequencyType", v, { shouldValidate: true });
    setValue("repaymentFrequencyType", v, { shouldValidate: true });
  };

  const handleAddCollateral = useCallback(() => {
    setCollateralItems((prev) => [...prev, { collateralTypeId: 0, value: 0, description: "" }]);
  }, []);

  const handleRemoveCollateral = useCallback((index: number) => {
    setCollateralItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleCollateralChange = useCallback(
    (index: number, field: keyof LoanCollateralCreateRequest, value: number | string) => {
      setCollateralItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
    },
    [],
  );

  const collateralTypeOptions = collateralTemplate?.loanCollateralOptions ?? [];

  return (
    <form
      onSubmit={handleSubmit((values) => {
        const payload = { ...values } as FormFields & { collateral?: LoanCollateralCreateRequest[] };
        if (collateralItems.length > 0 && collateralItems.every((c) => c.collateralTypeId > 0 && c.value > 0)) {
          payload.collateral = collateralItems.filter((c) => c.collateralTypeId > 0 && c.value > 0);
        }
        onSubmit(payload);
      })}
      className="space-y-6"
    >
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Row 1 (full width) — Client Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("Client & Product")}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-2">
          <div className="col-span-1">
            <ClientSearch
              value={clientIdVal}
              onChange={handleClientChange}
              disabled={isSubmitting || mode === "edit"}
              error={t(errors.clientId?.message ?? "")}
            />
          </div>

          {/* Row 2 (full width) — Product select + create button */}
          <div className="col-span-1">
            <LoanProductSearch
              products={products}
              value={productIdVal}
              onChange={handleProductSelect}
              loading={templateLoading}
              disabled={isSubmitting || mode === "edit" || (mode === "create" && !clientIdVal)}
              error={t(errors.productId?.message ?? "")}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Loan Terms ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("Loan Terms")}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-x-6 gap-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">{t("Principal")} *</label>
            <Input
              type="number"
              step="0.01"
              {...register("principal", { valueAsNumber: true })}
              disabled={isSubmitting || afterApproval}
              error={t(errors.principal?.message ?? "")}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">{t("Loan Term Frequency")} *</label>
            <Input
              type="number"
              {...register("loanTermFrequency", { valueAsNumber: true })}
              disabled={isSubmitting}
              error={t(errors.loanTermFrequency?.message ?? "")}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">{t("Loan Term Frequency Type")} *</label>
            <Select
              value={String(watch("loanTermFrequencyType") ?? 2)}
              onValueChange={(v) => syncFrequencyType(Number(v))}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(template?.termFrequencyTypeOptions ?? []).length > 0
                  ? (template?.termFrequencyTypeOptions ?? []).map((o) => (
                      <SelectItem key={o.id} value={String(o.id)}>
                        {o.value ?? o.name ?? ""}
                      </SelectItem>
                    ))
                  : [0, 1, 2, 3].map((id) => (
                      <SelectItem key={id} value={String(id)}>
                        {["Days", "Weeks", "Months", "Years"][id]}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
            {errors.loanTermFrequencyType && (
              <p className="text-xs text-red-500">{t(errors.loanTermFrequencyType.message ?? "")}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">{t("Number of Repayments")} *</label>
            <Input
              type="number"
              {...register("numberOfRepayments", { valueAsNumber: true })}
              disabled={isSubmitting || afterApproval}
              error={t(errors.numberOfRepayments?.message ?? "")}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Repayment Schedule ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("Repayment Schedule")}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-x-6 gap-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">{t("Repayment Every")} *</label>
            <Input
              type="number"
              {...register("repaymentEvery", { valueAsNumber: true })}
              disabled={isSubmitting}
              error={t(errors.repaymentEvery?.message ?? "")}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">{t("Repayment Frequency Type")} *</label>
            <Select
              value={String(watch("repaymentFrequencyType"))}
              onValueChange={(v) => syncFrequencyType(Number(v))}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(repaymentFrequencyTypeOptions ?? []).length > 0
                  ? (repaymentFrequencyTypeOptions ?? []).map((o) => (
                      <SelectItem key={o.id} value={String(o.id)}>
                        {o.value ?? o.name ?? ""}
                      </SelectItem>
                    ))
                  : [0, 1, 2, 3].map((id) => (
                      <SelectItem key={id} value={String(id)}>
                        {["Days", "Weeks", "Months", "Years"][id]}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
            {errors.repaymentFrequencyType && (
              <p className="text-xs text-red-500">{t(errors.repaymentFrequencyType.message ?? "")}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Interest ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("Interest")}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-x-6 gap-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">{t("Interest Type")} *</label>
            <Select
              value={String(watch("interestType") ?? 0)}
              onValueChange={(v) => setValue("interestType", Number(v))}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(interestTypeOptions ?? []).length > 0 ? (
                  (interestTypeOptions ?? []).map((o) => (
                    <SelectItem key={o.id} value={String(o.id)}>
                      {o.value ?? o.name ?? ""}
                    </SelectItem>
                  ))
                ) : (
                  <>
                    <SelectItem value="0">{t("Declining Balance")}</SelectItem>
                    <SelectItem value="1">{t("Flat")}</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">{t("Interest Rate Frequency")}</label>
            <Select
              value={String(watch("interestRateFrequencyType") ?? 3)}
              onValueChange={(v) => setValue("interestRateFrequencyType", Number(v))}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(interestRateFrequencyTypeOptions ?? []).length > 0 ? (
                  (interestRateFrequencyTypeOptions ?? []).map((o) => (
                    <SelectItem key={o.id} value={String(o.id)}>
                      {o.value ?? o.name ?? ""}
                    </SelectItem>
                  ))
                ) : (
                  <>
                    <SelectItem value="2">{t("Per Month")}</SelectItem>
                    <SelectItem value="3">{t("Per Year")}</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">{t("Interest Calculation Period Type")} *</label>
            <Select
              value={String(watch("interestCalculationPeriodType") ?? 0)}
              onValueChange={(v) => setValue("interestCalculationPeriodType", Number(v))}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(interestCalculationPeriodTypeOptions ?? []).length > 0 ? (
                  (interestCalculationPeriodTypeOptions ?? []).map((o) => (
                    <SelectItem key={o.id} value={String(o.id)}>
                      {o.value ?? o.name ?? ""}
                    </SelectItem>
                  ))
                ) : (
                  <>
                    <SelectItem value="0">{t("Daily")}</SelectItem>
                    <SelectItem value="1">{t("Same as Repayment")}</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">{t("Amortization Type")}</label>
            <Select
              value={String(watch("amortizationType") ?? 1)}
              onValueChange={(v) => setValue("amortizationType", Number(v))}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(amortizationTypeOptions ?? []).length > 0 ? (
                  (amortizationTypeOptions ?? []).map((o) => (
                    <SelectItem key={o.id} value={String(o.id)}>
                      {o.value ?? o.name ?? ""}
                    </SelectItem>
                  ))
                ) : (
                  <>
                    <SelectItem value="0">{t("Equal Principal")}</SelectItem>
                    <SelectItem value="1">{t("Equal Installments")}</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* ── Grace Periods ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("Grace Periods")}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-x-6 gap-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">{t("Grace on Principal Payment")}</label>
            <Input
              type="number"
              {...register("graceOnPrincipalPayment", { valueAsNumber: true })}
              disabled={isSubmitting}
              error={t(errors.graceOnPrincipalPayment?.message ?? "")}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">{t("Grace on Interest Payment")}</label>
            <Input
              type="number"
              {...register("graceOnInterestPayment", { valueAsNumber: true })}
              disabled={isSubmitting}
              error={t(errors.graceOnInterestPayment?.message ?? "")}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">{t("Grace on Interest Charged")}</label>
            <Input
              type="number"
              {...register("graceOnInterestCharged", { valueAsNumber: true })}
              disabled={isSubmitting}
              error={t(errors.graceOnInterestCharged?.message ?? "")}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">{t("Grace on Arrears Ageing")}</label>
            <Input
              type="number"
              {...register("graceOnArrearsAgeing", { valueAsNumber: true })}
              disabled={isSubmitting}
              error={t(errors.graceOnArrearsAgeing?.message ?? "")}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Limits & Tolerance ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("Limits & Tolerance")}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-x-6 gap-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">{t("In Arrears Tolerance")}</label>
            <Input
              type="number"
              step="0.01"
              {...register("inArrearsTolerance", { valueAsNumber: true })}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">{t("Max Outstanding Loan Balance")}</label>
            <Input
              type="number"
              step="0.01"
              {...register("maxOutstandingLoanBalance", { valueAsNumber: true })}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">{t("Fixed Length")}</label>
            <Input
              type="number"
              {...register("fixedLength", { valueAsNumber: true })}
              disabled={isSubmitting}
              placeholder={t("Fixed length in months")}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">{t("Recurring Moratorium on Principal")}</label>
            <Input
              type="number"
              {...register("recurringMoratoriumOnPrincipalPeriods", { valueAsNumber: true })}
              disabled={isSubmitting}
              placeholder={t("Moratorium every N periods")}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Dates ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("Dates")}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-x-6 gap-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">{t("Submitted On Date")} *</label>
            <Input
              type="date"
              {...register("submittedOnDate")}
              disabled={isSubmitting}
              error={t(errors.submittedOnDate?.message ?? "")}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">{t("Expected Disbursement Date")} *</label>
            <Input
              type="date"
              {...register("expectedDisbursementDate")}
              disabled={isSubmitting}
              error={t(errors.expectedDisbursementDate?.message ?? "")}
            />
          </div>
          <div className="space-y-1.5 col-span-2">
            <label className="block text-sm font-medium">{t("Repayments Starting From Date")}</label>
            <Input type="date" {...register("repaymentsStartingFromDate")} disabled={isSubmitting} />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">{t("Interest Charged From Date")}</label>
            <Input type="date" {...register("interestChargedFromDate")} disabled={isSubmitting} />
          </div>
        </CardContent>
      </Card>

      {/* ── Processing ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("Processing")}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-x-6 gap-y-4">
          <div className="space-y-1.5 col-span-2">
            <label className="block text-sm font-medium">{t("Transaction Processing Strategy")}</label>
            <Select
              value={watch("transactionProcessingStrategyCode") ?? "mifos-standard-strategy"}
              onValueChange={(v) => setValue("transactionProcessingStrategyCode", v)}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(strategyOptions ?? []).length > 0 ? (
                  (strategyOptions ?? []).map((o) => (
                    <SelectItem key={o.code} value={o.code}>
                      {o.name}
                    </SelectItem>
                  ))
                ) : (
                  <>
                    <SelectItem value="mifos-standard-strategy">{t("Mifos Standard Strategy")}</SelectItem>
                    <SelectItem value="heavensfamily-strategy">{t("Heavensfamily Strategy")}</SelectItem>
                    <SelectItem value="early-repayment-strategy">{t("Early Repayment Strategy")}</SelectItem>
                    <SelectItem value="advance-payment-allocation-strategy">
                      {t("Advance Payment Allocation Strategy")}
                    </SelectItem>
                    <SelectItem value="principal-interest-penalty-fees-order-strategy">
                      {t("P-I-Penalty-Fees Order")}
                    </SelectItem>
                    <SelectItem value="interest-principal-penalty-fees-order-strategy">
                      {t("I-P-Penalty-Fees Order")}
                    </SelectItem>
                    <SelectItem value="penalties-fees-interest-principal-order-strategy">
                      {t("Penalties-Fees-I-P Order")}
                    </SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">{t("Days in Year Type")}</label>
            <Select
              value={watch("daysInYearType") ? String(watch("daysInYearType")) : ""}
              onValueChange={(v) => setValue("daysInYearType", Number(v))}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("Select")} />
              </SelectTrigger>
              <SelectContent>
                {(daysInYearTypeOptions ?? []).length > 0 ? (
                  (daysInYearTypeOptions ?? []).map((o) => (
                    <SelectItem key={o.id} value={String(o.id)}>
                      {o.value ?? o.name ?? ""}
                    </SelectItem>
                  ))
                ) : (
                  <>
                    <SelectItem value="1">{t("Actual")}</SelectItem>
                    <SelectItem value="360">{t("360 Days")}</SelectItem>
                    <SelectItem value="364">{t("364 Days")}</SelectItem>
                    <SelectItem value="365">{t("365 Days")}</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">{t("Days in Month Type")}</label>
            <Select
              value={watch("daysInMonthType") ? String(watch("daysInMonthType")) : ""}
              onValueChange={(v) => setValue("daysInMonthType", Number(v))}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("Select")} />
              </SelectTrigger>
              <SelectContent>
                {(daysInMonthTypeOptions ?? []).length > 0 ? (
                  (daysInMonthTypeOptions ?? []).map((o) => (
                    <SelectItem key={o.id} value={String(o.id)}>
                      {o.value ?? o.name ?? ""}
                    </SelectItem>
                  ))
                ) : (
                  <>
                    <SelectItem value="1">{t("Actual")}</SelectItem>
                    <SelectItem value="30">{t("30 Days")}</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
          <div
            className="col-span-2 flex items-center gap-2 pt-2 cursor-pointer"
            onClick={() =>
              setValue("allowPartialPeriodInterestCalculation", !watch("allowPartialPeriodInterestCalculation"))
            }
          >
            <Checkbox
              id="allowPartialPeriodInterestCalculation"
              checked={!!watch("allowPartialPeriodInterestCalculation")}
              onCheckedChange={(v) => setValue("allowPartialPeriodInterestCalculation", v === true)}
            />
            <label htmlFor="allowPartialPeriodInterestCalculation" className="block text-sm font-medium cursor-pointer">
              {t("Allow Partial Period Interest Calculation")}
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Additional Options Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("Additional Options")}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">{t("Fund")}</label>
            <Select
              value={watch("fundId") ? String(watch("fundId")) : "0"}
              onValueChange={(v) => setValue("fundId", v === "0" ? undefined : Number(v))}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("Select fund")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">{t("None")}</SelectItem>
                {(fundOptions ?? []).map((o) => (
                  <SelectItem key={o.id} value={String(o.id)}>
                    {o.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">{t("Loan Officer")}</label>
            <Select
              value={watch("loanOfficerId") ? String(watch("loanOfficerId")) : "0"}
              onValueChange={(v) => setValue("loanOfficerId", v === "0" ? undefined : Number(v))}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("Select loan officer")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">{t("None")}</SelectItem>
                {(loanOfficerOptions ?? []).map((o) => (
                  <SelectItem key={o.id} value={String(o.id)}>
                    {o.displayName ?? o.name ?? `Officer #${o.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">{t("Loan Purpose")}</label>
            <Select
              value={watch("loanPurposeId") ? String(watch("loanPurposeId")) : "0"}
              onValueChange={(v) => setValue("loanPurposeId", v === "0" ? undefined : Number(v))}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("Select loan purpose")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">{t("None")}</SelectItem>
                {(loanPurposeOptions ?? []).map((o) => (
                  <SelectItem key={o.id} value={String(o.id)}>
                    {o.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">{t("Link Account")}</label>
            <Select
              value={watch("linkAccountId") ? String(watch("linkAccountId")) : "0"}
              onValueChange={(v) => setValue("linkAccountId", v === "0" ? undefined : Number(v))}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("Select linked savings account")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">{t("None")}</SelectItem>
                {(accountLinkingOptions ?? []).map((o) => (
                  <SelectItem key={o.id} value={String(o.id)}>
                    {o.accountNo ?? o.productName ?? `Account #${o.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 space-y-1.5">
            <label className="block text-sm font-medium">{t("External ID")}</label>
            <Input
              {...register("externalId")}
              disabled={isSubmitting}
              placeholder={t("External reference")}
              className="max-w-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Charges */}
      {mode === "create" && (chargeOptions ?? []).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("Charges")}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-x-6 gap-y-4">
            {chargeOptions?.map((charge) => {
              const chargesArray = watch("charges") as Array<{ chargeId: number; amount: number }> | undefined;
              const existing = chargesArray?.find((c) => c.chargeId === charge.id);
              return (
                <ChargeCheckbox
                  key={charge.id}
                  charge={charge}
                  checked={!!existing}
                  onToggle={(checked) => {
                    const current = [...(chargesArray ?? [])];
                    if (checked) {
                      current.push({ chargeId: charge.id, amount: charge.amount ?? 0 });
                    } else {
                      const idx = current.findIndex((c) => c.chargeId === charge.id);
                      if (idx >= 0) current.splice(idx, 1);
                    }
                    setValue("charges", current, { shouldValidate: true });
                  }}
                  amount={existing?.amount}
                  onAmountChange={(amount) => {
                    const current = [...(chargesArray ?? [])];
                    const idx = current.findIndex((c) => c.chargeId === charge.id);
                    if (idx >= 0) {
                      current[idx] = { ...current[idx], amount };
                      setValue("charges", current, { shouldValidate: true });
                    }
                  }}
                  disabled={isSubmitting}
                />
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Topup Loan Configuration */}
      {mode === "create" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("Topup Loan")}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div className="col-span-2 flex items-center gap-2 pt-2 cursor-pointer">
              <Checkbox
                id="isTopup"
                checked={!!watch("isTopup")}
                onCheckedChange={(v) => setValue("isTopup", v === true)}
                disabled={isSubmitting}
              />
              <label htmlFor="isTopup" className="block text-sm font-medium">
                {t("Is Topup Loan")}
              </label>
            </div>
            {watch("isTopup") && (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium">{t("Loan to Close")} *</label>
                <Input
                  type="number"
                  {...register("loanIdToClose", { valueAsNumber: true })}
                  disabled={isSubmitting}
                  error={t(errors.loanIdToClose?.message ?? "")}
                  placeholder={t("Enter loan ID to close")}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Multi-Disbursement Configuration */}
      {mode === "create" && products.find((p) => p.id === productIdVal)?.multiDisburseLoan && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("Multi-Disbursement")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500">
              {t(
                "Configure tranche details for multi-disbursement loans. Each tranche represents a separate disbursement.",
              )}
            </p>
            <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-400 text-center">
              {t("Tranche configuration editor — Custom child component (not yet implemented)")}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Standing Instructions */}
      {mode === "create" && watch("linkAccountId") && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("Standing Instructions")}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div className="col-span-2 flex items-center gap-2 pt-2 cursor-pointer">
              <Checkbox
                id="createStandingInstructionAtDisbursement"
                checked={!!watch("createStandingInstructionAtDisbursement")}
                onCheckedChange={(v) => setValue("createStandingInstructionAtDisbursement", v === true)}
                disabled={isSubmitting}
              />
              <label htmlFor="createStandingInstructionAtDisbursement" className="block text-sm font-medium">
                {t("Create Standing Instruction at Disbursement")}
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Originators (create only) — attached at application time */}
      {mode === "create" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("Originators")}</CardTitle>
          </CardHeader>
          <CardContent>
            <LoanOriginatorPicker
              value={selectedOriginators}
              onChange={setSelectedOriginators}
              disabled={isSubmitting}
            />
            <p className="mt-2 text-xs text-gray-500">
              {t("Link the external party (merchant, broker, affiliate, platform) that sourced this application.")}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Collateral (create only) */}
      {mode === "create" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{t("Collateral")}</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={handleAddCollateral} disabled={isSubmitting}>
              <Plus className="mr-1 h-4 w-4" />
              {t("Add Collateral")}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {collateralItems.length === 0 ? (
              <p className="text-center text-sm text-gray-400">
                {t("No collateral items. Collateral is optional and can be added later.")}
              </p>
            ) : (
              collateralItems.map((item, index) => (
                <div key={index} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {t("Collateral Item")} #{index + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveCollateral(index)}
                      disabled={isSubmitting}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium">{t("Collateral Type")} *</label>
                      <Select
                        value={item.collateralTypeId ? String(item.collateralTypeId) : ""}
                        onValueChange={(v) => handleCollateralChange(index, "collateralTypeId", Number(v))}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t("Select type")} />
                        </SelectTrigger>
                        <SelectContent>
                          {collateralTypeOptions.map((opt) => (
                            <SelectItem key={opt.id} value={String(opt.id)}>
                              {opt.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {item.collateralTypeId === 0 && (
                        <p className="text-xs text-red-500">{t("Collateral type is required")}</p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium">{t("Value")} *</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.value || ""}
                        onChange={(e) => handleCollateralChange(index, "value", Number(e.target.value))}
                        disabled={isSubmitting}
                        placeholder={t("Collateral value")}
                      />
                      {item.value <= 0 && <p className="text-xs text-red-500">{t("Value must be greater than 0")}</p>}
                    </div>
                    <div className="col-span-2 space-y-1.5">
                      <label className="block text-sm font-medium">{t("Description")}</label>
                      <Input
                        value={item.description || ""}
                        onChange={(e) => handleCollateralChange(index, "description", e.target.value)}
                        disabled={isSubmitting}
                        placeholder={t("Brief description (optional, max 500 chars)")}
                        maxLength={500}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button type="submit" disabled={isSubmitting} className="bg-[#D32F2F] hover:bg-red-700">
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {mode === "create" ? t("Creating...") : t("Saving...")}
            </span>
          ) : mode === "create" ? (
            t("Create Loan")
          ) : (
            t("Save Changes")
          )}
        </Button>
        {onPreviewSchedule && (
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting || previewLoading}
            onClick={() => onPreviewSchedule(getValues())}
          >
            {previewLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("Calculating...")}
              </span>
            ) : (
              t("Preview Schedule")
            )}
          </Button>
        )}
        <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => window.history.back()}>
          {t("Cancel")}
        </Button>
      </div>
    </form>
  );
};

export default LoanForm;
export type { LoanFormProps };
