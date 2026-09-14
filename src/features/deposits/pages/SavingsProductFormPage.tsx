import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm, type UseFormWatch, type UseFormSetValue } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  createSavingsProductSchema,
  type CreateSavingsProductFormValues,
  useSavingsProduct,
  useSavingsProductTemplate,
  createSavingsProduct,
  updateSavingsProduct,
} from "@/features/deposits";
import type { SavingsProductCreateRequest, GLOption } from "@/features/deposits";
import type { AccountingMappingOptions, SavingsProductTemplate } from "../api/deposit";
import { CurrencySelect } from "@/components/shared/CurrencySelect";

type FormValues = CreateSavingsProductFormValues;

function EnumSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: number | undefined;
  onChange: (v: number) => void;
  options: Array<{ id: number; value: string }> | undefined;
  placeholder?: string;
}) {
  const { t } = useTranslation();
  return (
    <Select value={value !== undefined ? String(value) : ""} onValueChange={(v) => onChange(Number(v))}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder ?? t("Select")} />
      </SelectTrigger>
      <SelectContent>
        {(options ?? []).map((o) => (
          <SelectItem key={o.id} value={String(o.id)}>
            {t(o.value)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

const FALLBACK_COMPOUNDING = [
  { id: 1, value: "Daily" },
  { id: 4, value: "Monthly" },
  { id: 5, value: "Quarterly" },
  { id: 6, value: "Semi-Annual" },
  { id: 7, value: "Annual" },
];

const FALLBACK_POSTING = [
  { id: 1, value: "Daily" },
  { id: 4, value: "Monthly" },
  { id: 5, value: "Quarterly" },
  { id: 6, value: "Semi-Annual" },
  { id: 7, value: "Annual" },
  { id: 8, value: "Anniversary Monthly" },
  { id: 9, value: "Anniversary Quarterly" },
  { id: 10, value: "Anniversary Bi-Annual" },
  { id: 11, value: "Anniversary Annual" },
];

const FALLBACK_CALCULATION = [
  { id: 1, value: "Daily Balance" },
  { id: 2, value: "Average Daily Balance" },
];

const FALLBACK_DAYS_IN_YEAR = [
  { id: 360, value: "360 Days" },
  { id: 365, value: "365 Days" },
];

const FALLBACK_LOCKIN_TYPE = [
  { id: 0, value: "Days" },
  { id: 1, value: "Weeks" },
  { id: 2, value: "Months" },
  { id: 3, value: "Years" },
];

const FALLBACK_ACCOUNTING_RULES = [
  { id: 1, value: "None" },
  { id: 2, value: "Cash Based" },
  { id: 3, value: "Accrual (Periodic)" },
  { id: 4, value: "Accrual (Upfront)" },
];

const FALLBACK_WITHDRAWAL_FEE_TYPES = [
  { id: 1, value: "Flat" },
  { id: 2, value: "Percent of Amount" },
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));

function MonthDayPicker({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: string }) {
  const { t } = useTranslation();
  const parts = value ? value.split(" ") : [];
  const day = parts[0] ?? "";
  const month = parts[1] ?? "";

  return (
    <div className="col-span-2 grid grid-cols-2 gap-4">
      <div className="space-y-1.5">
        <label className="block text-sm font-medium">{t("Day")} *</label>
        <Select value={day} onValueChange={(d) => onChange(`${d} ${month}`)}>
          <SelectTrigger>
            <SelectValue placeholder={t("Day")} />
          </SelectTrigger>
          <SelectContent>
            {DAYS.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <label className="block text-sm font-medium">{t("Month")} *</label>
        <Select value={month} onValueChange={(m) => onChange(`${day} ${m}`)}>
          <SelectTrigger>
            <SelectValue placeholder={t("Month")} />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {error && (
        <div className="col-span-2">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}
      <p className="col-span-2 text-xs text-gray-500">{t("Select the day and month when the annual fee is charged.")}</p>
    </div>
  );
}

const SavingsProductFormPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const { data: existingProduct, isLoading: productLoading } = useSavingsProduct(id ? Number(id) : undefined);
  const { data: template, isLoading: templateLoading } = useSavingsProductTemplate();

  const loading = (isEdit && productLoading) || templateLoading;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createSavingsProductSchema) as any,
    defaultValues: {
      name: "",
      shortName: "",
      currencyCode: "",
      digitsAfterDecimal: 2,
      nominalAnnualInterestRate: 0,
      interestCompoundingPeriodType: 1,
      interestPostingPeriodType: 4,
      interestCalculationType: 1,
      interestCalculationDaysInYearType: 365,
      accountingRule: 1,
      inMultiplesOf: 0,
      allowOverdraft: false,
      isDormancyTrackingActive: false,
      withHoldTax: false,
      withdrawalFeeForTransfers: false,
      enforceMinRequiredBalance: false,
      lienAllowed: false,
      locale: "en",
      dateFormat: "yyyy-MM-dd",
      monthDayFormat: "dd MMMM",
    },
  });

  const allowOverdraft = watch("allowOverdraft");
  const isDormancyTrackingActive = watch("isDormancyTrackingActive");
  const withHoldTax = watch("withHoldTax");
  const lienAllowed = watch("lienAllowed");
  const accountingRule = watch("accountingRule");
  const isCashOrAccrual = accountingRule === 2 || accountingRule === 3 || accountingRule === 4;
  const isAccrualPeriodic = accountingRule === 3;
  const feeAmount = watch("feeAmount");

  const tp = template as SavingsProductTemplate | undefined;

  const compoundingOptions = tp?.interestCompoundingPeriodTypeOptions ?? FALLBACK_COMPOUNDING;
  const postingOptions = tp?.interestPostingPeriodTypeOptions ?? FALLBACK_POSTING;
  const calculationOptions = tp?.interestCalculationTypeOptions ?? FALLBACK_CALCULATION;
  const daysInYearOptions = tp?.interestCalculationDaysInYearTypeOptions ?? FALLBACK_DAYS_IN_YEAR;
  const lockinTypeOptions = tp?.lockinPeriodFrequencyTypeOptions ?? FALLBACK_LOCKIN_TYPE;
  const accountingRuleOptions = tp?.accountingRuleOptions ?? FALLBACK_ACCOUNTING_RULES;
  const withdrawalFeeTypeOptions = tp?.withdrawalFeeTypeOptions ?? FALLBACK_WITHDRAWAL_FEE_TYPES;
  const amOptions: AccountingMappingOptions | undefined = tp?.accountingMappingOptions;

  useEffect(() => {
    if (!existingProduct) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = existingProduct as any;
    const mappings = p.accountingMappings ?? {};
    reset({
      name: p.name ?? "",
      shortName: p.shortName ?? "",
      description: p.description ?? "",
      currencyCode: p.currency?.code ?? "",
      digitsAfterDecimal: p.currency?.decimalPlaces ?? 2,
      inMultiplesOf: p.currency?.inMultiplesOf ?? 0,
      nominalAnnualInterestRate: p.nominalAnnualInterestRate ?? 0,
      interestCompoundingPeriodType: p.interestCompoundingPeriodType?.id ?? 1,
      interestPostingPeriodType: p.interestPostingPeriodType?.id ?? 4,
      interestCalculationType: p.interestCalculationType?.id ?? 1,
      interestCalculationDaysInYearType: p.interestCalculationDaysInYearType?.id ?? 365,
      minRequiredOpeningBalance: p.minRequiredOpeningBalance ?? undefined,
      minBalanceForInterestCalculation: p.minBalanceForInterestCalculation ?? undefined,
      lockinPeriodFrequency: p.lockinPeriodFrequency ?? undefined,
      lockinPeriodFrequencyType: p.lockinPeriodFrequencyType?.id ?? undefined,
      withdrawalFeeAmount: p.withdrawalFeeAmount ?? undefined,
      withdrawalFeeType: p.withdrawalFeeType?.id ?? undefined,
      withdrawalFeeForTransfers: !!p.withdrawalFeeForTransfers,
      feeAmount: p.feeAmount ?? undefined,
      feeOnMonthDay: p.feeOnMonthDay ?? undefined,
      allowOverdraft: !!p.allowOverdraft,
      overdraftLimit: p.overdraftLimit ?? undefined,
      nominalAnnualInterestRateOverdraft: p.nominalAnnualInterestRateOverdraft ?? undefined,
      minOverdraftForInterestCalculation: p.minOverdraftForInterestCalculation ?? undefined,
      minRequiredBalance: p.minRequiredBalance ?? undefined,
      enforceMinRequiredBalance: !!p.enforceMinRequiredBalance,
      lienAllowed: !!p.lienAllowed,
      maxAllowedLienLimit: p.maxAllowedLienLimit ?? undefined,
      accountingRule: p.accountingRule ?? p.accountingType ?? 1,
      isDormancyTrackingActive: !!p.isDormancyTrackingActive,
      daysToInactive: p.daysToInactive ?? undefined,
      daysToDormancy: p.daysToDormancy ?? undefined,
      daysToEscheat: p.daysToEscheat ?? undefined,
      withHoldTax: !!p.withHoldTax,
      taxGroupId: p.taxGroupId ?? undefined,
      locale: "en",
      dateFormat: "yyyy-MM-dd",
      monthDayFormat: "dd MMMM",
      savingsReferenceAccountId: p.savingsReferenceAccountId ?? mappings?.savingsReferenceAccount?.id ?? undefined,
      savingsControlAccountId: p.savingsControlAccountId ?? mappings?.savingsControlAccount?.id ?? undefined,
      transfersInSuspenseAccountId: p.transfersInSuspenseAccountId ?? mappings?.transfersInSuspenseAccount?.id ?? undefined,
      interestOnSavingsAccountId: p.interestOnSavingsAccountId ?? mappings?.interestOnSavingsAccount?.id ?? undefined,
      incomeFromFeeAccountId: p.incomeFromFeeAccountId ?? mappings?.incomeFromFeeAccount?.id ?? undefined,
      incomeFromPenaltyAccountId: p.incomeFromPenaltyAccountId ?? mappings?.incomeFromPenaltyAccount?.id ?? undefined,
      overdraftPortfolioControlId: p.overdraftPortfolioControlId ?? mappings?.overdraftPortfolioControl?.id ?? undefined,
      incomeFromInterestId: p.incomeFromInterestId ?? mappings?.incomeFromInterest?.id ?? undefined,
      lossesWrittenOffId: p.lossesWrittenOffId ?? mappings?.lossesWrittenOff?.id ?? undefined,
      feesReceivableAccountId: p.feesReceivableAccountId ?? mappings?.feesReceivableAccount?.id ?? undefined,
      penaltiesReceivableAccountId: p.penaltiesReceivableAccountId ?? mappings?.penaltiesReceivableAccount?.id ?? undefined,
      interestPayableAccountId: p.interestPayableAccountId ?? mappings?.interestPayableAccount?.id ?? undefined,
      escheatLiabilityAccountId: p.escheatLiabilityAccountId ?? mappings?.escheatLiabilityAccount?.id ?? undefined,
    });
  }, [existingProduct, reset]);

  const handleSave = async (values: FormValues) => {
    const payload: SavingsProductCreateRequest = {
      name: values.name,
      shortName: values.shortName,
      description: values.description || undefined,
      currencyCode: values.currencyCode,
      digitsAfterDecimal: values.digitsAfterDecimal,
      inMultiplesOf: values.inMultiplesOf ?? undefined,
      locale: "en",
      nominalAnnualInterestRate: values.nominalAnnualInterestRate,
      interestCompoundingPeriodType: values.interestCompoundingPeriodType,
      interestPostingPeriodType: values.interestPostingPeriodType,
      interestCalculationType: values.interestCalculationType,
      interestCalculationDaysInYearType: values.interestCalculationDaysInYearType,
      minRequiredOpeningBalance: values.minRequiredOpeningBalance || undefined,
      minBalanceForInterestCalculation: values.minBalanceForInterestCalculation || undefined,
      lockinPeriodFrequency: values.lockinPeriodFrequency || undefined,
      lockinPeriodFrequencyType: values.lockinPeriodFrequencyType ?? undefined,
      withdrawalFeeAmount: values.withdrawalFeeAmount || undefined,
      withdrawalFeeType: values.withdrawalFeeType ?? undefined,
      withdrawalFeeForTransfers: values.withdrawalFeeForTransfers || undefined,
      feeAmount: values.feeAmount || undefined,
      feeOnMonthDay: values.feeOnMonthDay || undefined,
      monthDayFormat: values.monthDayFormat,
      allowOverdraft: values.allowOverdraft || undefined,
      overdraftLimit: values.overdraftLimit || undefined,
      nominalAnnualInterestRateOverdraft: values.nominalAnnualInterestRateOverdraft || undefined,
      minOverdraftForInterestCalculation: values.minOverdraftForInterestCalculation || undefined,
      minRequiredBalance: values.minRequiredBalance || undefined,
      enforceMinRequiredBalance: values.enforceMinRequiredBalance || undefined,
      lienAllowed: values.lienAllowed || undefined,
      maxAllowedLienLimit: values.maxAllowedLienLimit || undefined,
      accountingRule: values.accountingRule ?? 1,
      isDormancyTrackingActive: values.isDormancyTrackingActive || undefined,
      daysToInactive: values.daysToInactive || undefined,
      daysToDormancy: values.daysToDormancy || undefined,
      daysToEscheat: values.daysToEscheat || undefined,
      withHoldTax: values.withHoldTax || undefined,
      taxGroupId: values.taxGroupId ?? undefined,
      savingsReferenceAccountId: values.savingsReferenceAccountId ?? undefined,
      savingsControlAccountId: values.savingsControlAccountId ?? undefined,
      transfersInSuspenseAccountId: values.transfersInSuspenseAccountId ?? undefined,
      interestOnSavingsAccountId: values.interestOnSavingsAccountId ?? undefined,
      incomeFromFeeAccountId: values.incomeFromFeeAccountId ?? undefined,
      incomeFromPenaltyAccountId: values.incomeFromPenaltyAccountId ?? undefined,
      overdraftPortfolioControlId: values.overdraftPortfolioControlId ?? undefined,
      incomeFromInterestId: values.incomeFromInterestId ?? undefined,
      lossesWrittenOffId: values.lossesWrittenOffId ?? undefined,
      feesReceivableAccountId: values.feesReceivableAccountId ?? undefined,
      penaltiesReceivableAccountId: values.penaltiesReceivableAccountId ?? undefined,
      interestPayableAccountId: values.interestPayableAccountId ?? undefined,
      escheatLiabilityAccountId: values.escheatLiabilityAccountId ?? undefined,
    };

    if (isEdit) {
      await updateSavingsProduct(Number(id), payload);
    } else {
      await createSavingsProduct(payload);
    }
    navigate("/deposits/products");
  };

  if (loading) {
    return (
      <div className="max-w-6xl m-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl m-auto space-y-6">
      <PageHeader
        title={isEdit ? t("Edit Savings Product") : t("Create Savings Product")}
        description={t("Fields marked with * are required.")}
        actions={
          <Button variant="outline" onClick={() => navigate("/deposits/products")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> {t("Back")}
          </Button>
        }
      />
      <form onSubmit={handleSubmit(handleSave)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("Basic Information")}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <label className="block text-sm font-medium">{t("Product Name")} *</label>
              <Input {...register("name")} error={errors.name?.message} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("Short Name")} *</label>
              <Input
                {...register("shortName")}
                error={errors.shortName?.message}
                maxLength={4}
                placeholder={t("e.g. REG")}
              />
            </div>
            <CurrencySelect
              value={watch("currencyCode")}
              onChange={(v) => setValue("currencyCode", v, { shouldValidate: true })}
              error={errors.currencyCode?.message}
            />
            <div className="col-span-2 space-y-1.5">
              <label className="block text-sm font-medium">{t("Description")}</label>
              <Textarea {...register("description")} placeholder={t("Brief product description")} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("Decimal Places")} *</label>
              <Input
                type="number"
                {...register("digitsAfterDecimal", { valueAsNumber: true })}
                error={errors.digitsAfterDecimal?.message}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("In Multiples Of")}</label>
              <Input
                type="number"
                {...register("inMultiplesOf", { valueAsNumber: true })}
                error={errors.inMultiplesOf?.message}
              />
            </div>
          </CardContent>
        </Card>

        {/* Interest Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("Interest Settings")}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("Nominal Annual Rate (%)")} *</label>
              <Input
                type="number"
                step="0.01"
                {...register("nominalAnnualInterestRate", { valueAsNumber: true })}
                error={errors.nominalAnnualInterestRate?.message}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("Compounding Period")} *</label>
              <EnumSelect
                value={watch("interestCompoundingPeriodType")}
                onChange={(v) => setValue("interestCompoundingPeriodType", v)}
                options={compoundingOptions}
              />
              {errors.interestCompoundingPeriodType && (
                <p className="text-sm text-red-500">{errors.interestCompoundingPeriodType.message as string}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("Posting Period")} *</label>
              <EnumSelect
                value={watch("interestPostingPeriodType")}
                onChange={(v) => setValue("interestPostingPeriodType", v)}
                options={postingOptions}
              />
              {errors.interestPostingPeriodType && (
                <p className="text-sm text-red-500">{errors.interestPostingPeriodType.message as string}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("Calculation Type")} *</label>
              <EnumSelect
                value={watch("interestCalculationType")}
                onChange={(v) => setValue("interestCalculationType", v)}
                options={calculationOptions}
              />
              {errors.interestCalculationType && (
                <p className="text-sm text-red-500">{errors.interestCalculationType.message as string}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("Days In Year")} *</label>
              <EnumSelect
                value={watch("interestCalculationDaysInYearType")}
                onChange={(v) => setValue("interestCalculationDaysInYearType", v)}
                options={daysInYearOptions}
              />
              {errors.interestCalculationDaysInYearType && (
                <p className="text-sm text-red-500">{errors.interestCalculationDaysInYearType.message as string}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("Min Required Opening Balance")}</label>
              <Input type="number" step="0.01" {...register("minRequiredOpeningBalance", { valueAsNumber: true })} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("Min Balance for Interest Calculation")}</label>
              <Input
                type="number"
                step="0.01"
                {...register("minBalanceForInterestCalculation", { valueAsNumber: true })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Lock-in Period */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("Lock-in Period")}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("Lock-in Frequency")}</label>
              <Input type="number" {...register("lockinPeriodFrequency", { valueAsNumber: true })} />
              {errors.lockinPeriodFrequency && (
                <p className="text-sm text-red-500">{errors.lockinPeriodFrequency.message as string}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("Lock-in Type")}</label>
              <EnumSelect
                value={watch("lockinPeriodFrequencyType")}
                onChange={(v) => setValue("lockinPeriodFrequencyType", v)}
                options={lockinTypeOptions}
                placeholder={t("Select")}
              />
              {errors.lockinPeriodFrequencyType && (
                <p className="text-sm text-red-500">{errors.lockinPeriodFrequencyType.message as string}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Withdrawal Fees */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("Withdrawal Fees")}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("Withdrawal Fee Amount")}</label>
              <Input type="number" step="0.01" {...register("withdrawalFeeAmount", { valueAsNumber: true })} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("Withdrawal Fee Type")}</label>
              <EnumSelect
                value={watch("withdrawalFeeType")}
                onChange={(v) => setValue("withdrawalFeeType", v)}
                options={withdrawalFeeTypeOptions}
                placeholder={t("Select")}
              />
              {errors.withdrawalFeeType && (
                <p className="text-sm text-red-500">{errors.withdrawalFeeType.message as string}</p>
              )}
            </div>
            <div className="col-span-2 flex items-center gap-2 pt-2">
              <Checkbox
                id="withdrawalFeeForTransfers"
                checked={!!watch("withdrawalFeeForTransfers")}
                onCheckedChange={(v) => setValue("withdrawalFeeForTransfers", v === true)}
              />
              <label htmlFor="withdrawalFeeForTransfers" className="text-sm font-medium">
                {t("Withdrawal Fee for Transfers")}
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Annual Fee */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("Annual Fee")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("Fee Amount")}</label>
              <Input type="number" step="0.01" {...register("feeAmount", { valueAsNumber: true })} />
              {errors.feeAmount && <p className="text-sm text-red-500">{errors.feeAmount.message as string}</p>}
            </div>
            {feeAmount !== undefined && feeAmount > 0 && (
              <MonthDayPicker
                value={watch("feeOnMonthDay") ?? ""}
                onChange={(v) => setValue("feeOnMonthDay", v, { shouldValidate: true })}
                error={errors.feeOnMonthDay?.message as string}
              />
            )}
          </CardContent>
        </Card>

        {/* Overdraft */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("Overdraft")}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="col-span-2 flex items-center gap-2">
              <Checkbox
                id="allowOverdraft"
                checked={!!allowOverdraft}
                onCheckedChange={(v) => setValue("allowOverdraft", v === true)}
              />
              <label htmlFor="allowOverdraft" className="text-sm font-medium">
                {t("Allow Overdraft")}
              </label>
            </div>
            {allowOverdraft && (
              <>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium">{t("Overdraft Limit")}</label>
                  <Input type="number" step="0.01" {...register("overdraftLimit", { valueAsNumber: true })} />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium">{t("Nominal Annual Rate Overdraft (%)")}</label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register("nominalAnnualInterestRateOverdraft", { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium">{t("Min Overdraft for Interest Calculation")}</label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register("minOverdraftForInterestCalculation", { valueAsNumber: true })}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Dormancy Tracking */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("Dormancy Tracking")}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="col-span-2 flex items-center gap-2">
              <Checkbox
                id="isDormancyTrackingActive"
                checked={!!isDormancyTrackingActive}
                onCheckedChange={(v) => setValue("isDormancyTrackingActive", v === true)}
              />
              <label htmlFor="isDormancyTrackingActive" className="text-sm font-medium">
                {t("Enable Dormancy Tracking")}
              </label>
            </div>
            {isDormancyTrackingActive && (
              <>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium">{t("Days to Inactive")} *</label>
                  <Input type="number" {...register("daysToInactive", { valueAsNumber: true })} />
                  {errors.daysToInactive && (
                    <p className="text-sm text-red-500">{errors.daysToInactive.message as string}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium">{t("Days to Dormancy")} *</label>
                  <Input type="number" {...register("daysToDormancy", { valueAsNumber: true })} />
                  {errors.daysToDormancy && (
                    <p className="text-sm text-red-500">{errors.daysToDormancy.message as string}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium">{t("Days to Escheat")} *</label>
                  <Input type="number" {...register("daysToEscheat", { valueAsNumber: true })} />
                  {errors.daysToEscheat && (
                    <p className="text-sm text-red-500">{errors.daysToEscheat.message as string}</p>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Lien */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("Lien")}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="col-span-2 flex items-center gap-2">
              <Checkbox
                id="lienAllowed"
                checked={!!lienAllowed}
                onCheckedChange={(v) => setValue("lienAllowed", v === true)}
              />
              <label htmlFor="lienAllowed" className="text-sm font-medium">
                {t("Allow Lien")}
              </label>
            </div>
            {lienAllowed && (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium">{t("Max Allowed Lien Limit")}</label>
                <Input type="number" step="0.01" {...register("maxAllowedLienLimit", { valueAsNumber: true })} />
                {errors.maxAllowedLienLimit && (
                  <p className="text-sm text-red-500">{errors.maxAllowedLienLimit.message as string}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tax Withholding */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("Tax Withholding")}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="col-span-2 flex items-center gap-2">
              <Checkbox
                id="withHoldTax"
                checked={!!withHoldTax}
                onCheckedChange={(v) => setValue("withHoldTax", v === true)}
              />
              <label htmlFor="withHoldTax" className="text-sm font-medium">
                {t("Withhold Tax")}
              </label>
            </div>
            {withHoldTax && (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium">{t("Tax Group")} *</label>
                <Select
                  value={watch("taxGroupId") ? String(watch("taxGroupId")) : ""}
                  onValueChange={(v) => setValue("taxGroupId", Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("Select tax group")} />
                  </SelectTrigger>
                  <SelectContent>
                    {(tp?.taxGroupOptions ?? []).map((o) => (
                      <SelectItem key={o.id} value={String(o.id)}>
                        {o.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.taxGroupId && <p className="text-sm text-red-500">{errors.taxGroupId.message as string}</p>}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Accounting */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("Accounting")}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <label className="block text-sm font-medium">{t("Accounting Rule")} *</label>
              <EnumSelect
                value={accountingRule}
                onChange={(v) => setValue("accountingRule", v)}
                options={accountingRuleOptions}
              />
              {errors.accountingRule && (
                <p className="text-sm text-red-500">{errors.accountingRule.message as string}</p>
              )}
            </div>
            {isCashOrAccrual && (
              <>
                <div className="col-span-2 border-t pt-4 mb-2">
                  <p className="text-sm font-semibold text-gray-600">{t("GL Account Mappings")}</p>
                </div>
                <GLField
                  label="Savings Reference"
                  name="savingsReferenceAccountId"
                  options={amOptions?.savingsReferenceAccountOptions ?? []}
                  setValue={setValue}
                  watch={watch}
                  errors={errors}
                />
                <GLField
                  label="Savings Control"
                  name="savingsControlAccountId"
                  options={amOptions?.savingsControlAccountOptions ?? []}
                  setValue={setValue}
                  watch={watch}
                  errors={errors}
                />
                <GLField
                  label="Interest on Savings"
                  name="interestOnSavingsAccountId"
                  options={amOptions?.interestOnSavingsAccountOptions ?? []}
                  setValue={setValue}
                  watch={watch}
                  errors={errors}
                />
                <GLField
                  label="Income from Fees"
                  name="incomeFromFeeAccountId"
                  options={amOptions?.incomeFromFeeAccountOptions ?? []}
                  setValue={setValue}
                  watch={watch}
                  errors={errors}
                />
                <GLField
                  label="Income from Penalties"
                  name="incomeFromPenaltyAccountId"
                  options={amOptions?.incomeFromPenaltyAccountOptions ?? []}
                  setValue={setValue}
                  watch={watch}
                  errors={errors}
                />
                <GLField
                  label="Transfers in Suspense"
                  name="transfersInSuspenseAccountId"
                  options={amOptions?.transfersInSuspenseAccountOptions ?? []}
                  setValue={setValue}
                  watch={watch}
                  errors={errors}
                />
                {isAccrualPeriodic && (
                  <>
                    <GLField
                      label="Fees Receivable"
                      name="feesReceivableAccountId"
                      options={amOptions?.feesReceivableAccountOptions ?? []}
                      setValue={setValue}
                      watch={watch}
                      errors={errors}
                    />
                    <GLField
                      label="Penalties Receivable"
                      name="penaltiesReceivableAccountId"
                      options={amOptions?.penaltiesReceivableAccountOptions ?? []}
                      setValue={setValue}
                      watch={watch}
                      errors={errors}
                    />
                    <GLField
                      label="Interest Payable"
                      name="interestPayableAccountId"
                      options={amOptions?.interestPayableAccountOptions ?? []}
                      setValue={setValue}
                      watch={watch}
                      errors={errors}
                    />
                  </>
                )}
                {allowOverdraft && (
                  <>
                    <GLField
                      label="Overdraft Portfolio Control"
                      name="overdraftPortfolioControlId"
                      options={amOptions?.overdraftPortfolioControlOptions ?? []}
                      setValue={setValue}
                      watch={watch}
                      errors={errors}
                    />
                    <GLField
                      label="Losses Written Off"
                      name="lossesWrittenOffId"
                      options={amOptions?.lossesWrittenOffOptions ?? []}
                      setValue={setValue}
                      watch={watch}
                      errors={errors}
                    />
                    <GLField
                      label="Income from Interest (Overdraft)"
                      name="incomeFromInterestId"
                      options={amOptions?.incomeFromInterestOptions ?? []}
                      setValue={setValue}
                      watch={watch}
                      errors={errors}
                    />
                  </>
                )}
                {isDormancyTrackingActive && (
                  <GLField
                    label="Escheat Liability"
                    name="escheatLiabilityAccountId"
                    options={amOptions?.escheatLiabilityOptions ?? []}
                    setValue={setValue}
                    watch={watch}
                    errors={errors}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Min Required Balance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("Minimum Balance")}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="col-span-2 flex items-center gap-2">
              <Checkbox
                id="enforceMinRequiredBalance"
                checked={!!watch("enforceMinRequiredBalance")}
                onCheckedChange={(v) => setValue("enforceMinRequiredBalance", v === true)}
              />
              <label htmlFor="enforceMinRequiredBalance" className="text-sm font-medium">
                {t("Enforce Min Required Balance")}
              </label>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("Min Required Balance")}</label>
              <Input type="number" step="0.01" {...register("minRequiredBalance", { valueAsNumber: true })} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => navigate("/deposits/products")}>
            {t("Cancel")}
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-[#D32F2F] hover:bg-red-700">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("Saving...")}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> {isEdit ? t("Save Changes") : t("Create Product")}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

function GLField({
  label,
  name,
  options,
  watch,
  setValue,
  errors,
}: {
  label: string;
  name: string;
  options: GLOption[];
  watch: UseFormWatch<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  errors: Partial<Record<keyof FormValues, { message?: string } | undefined>>;
}) {
  const { t } = useTranslation();
  const value = watch(name as keyof FormValues);

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium">{t(label)}</label>
      <Select
        value={value ? String(value) : ""}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onValueChange={(v) => setValue(name as keyof FormValues, v ? (Number(v) as any) : undefined)}
      >
        <SelectTrigger>
          <SelectValue placeholder={t("Select GL account")} />
        </SelectTrigger>
        <SelectContent>
          {options.map((a) => (
            <SelectItem key={a.id} value={String(a.id)}>
              {a.name} ({a.glCode})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {errors[name as keyof FormValues] && (
        <p className="text-sm text-red-500">{errors[name as keyof FormValues]?.message}</p>
      )}
    </div>
  );
}

export default SavingsProductFormPage;
