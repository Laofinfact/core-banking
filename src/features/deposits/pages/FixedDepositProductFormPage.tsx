import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, type UseFormWatch, type UseFormSetValue } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Save, Loader2, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  createFixedDepositProductSchema,
  type CreateFixedDepositProductFormValues,
  useFixedDepositProduct,
  useCreateFixedDepositProduct,
  useUpdateFixedDepositProduct,
  fetchFixedDepositProductTemplate,
} from "@/features/deposits";
import type { FixedDepositProductCreateRequest } from "@/features/deposits";
import type { GLOption, AccountingMappingOptions, FixedDepositProductTemplate } from "@/features/deposits";
import { CurrencySelect } from "@/components/shared/CurrencySelect";

type FormValues = CreateFixedDepositProductFormValues;

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

const FALLBACK_PERIOD_FREQUENCIES = [
  { id: 0, value: "Days" },
  { id: 1, value: "Weeks" },
  { id: 2, value: "Months" },
  { id: 3, value: "Years" },
];

const FALLBACK_CHART_PERIOD_TYPES = [
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

const FALLBACK_PRE_CLOSURE_PENALTY = [
  { id: 1, value: "Whole Term" },
  { id: 2, value: "Till Premature Withdrawal" },
];

interface Slab {
  periodType: number;
  fromPeriod: number;
  toPeriod?: number | null;
  annualInterestRate: number;
  description?: string;
  amountRangeFrom?: number | null;
  amountRangeTo?: number | null;
}

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

function enumId(v: unknown, fallback?: number): number | undefined {
  if (v == null) return fallback;
  if (typeof v === "object" && v !== null) return (v as any).id ?? fallback;
  return Number(v);
}

const FixedDepositProductFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const { data: existingProduct, isLoading: productLoading } = useFixedDepositProduct(id ? Number(id) : undefined);
  const createMutation = useCreateFixedDepositProduct();
  const updateMutation = useUpdateFixedDepositProduct();

  const { data: template } = useQuery<FixedDepositProductTemplate>({
    queryKey: ["fixeddepositproducts", "template"],
    queryFn: fetchFixedDepositProductTemplate,
    staleTime: 10 * 60_000,
  });

  const [slabs, setSlabs] = React.useState<Slab[]>([
    { periodType: 2, fromPeriod: 1, toPeriod: null, annualInterestRate: 5, description: "" },
  ]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createFixedDepositProductSchema) as any,
    defaultValues: {
      name: "",
      shortName: "",
      currencyCode: "USD",
      digitsAfterDecimal: 2,
      nominalAnnualInterestRate: 0,
      interestCompoundingPeriodType: 1,
      interestPostingPeriodType: 4,
      interestCalculationType: 1,
      interestCalculationDaysInYearType: 365,
      accountingRule: 1,
      depositAmount: 1000,
      minDepositAmount: undefined,
      maxDepositAmount: undefined,
      minDepositTerm: 1,
      minDepositTermTypeId: 2,
      maxDepositTerm: undefined,
      maxDepositTermTypeId: undefined,
      inMultiplesOfDepositTerm: undefined,
      inMultiplesOfDepositTermTypeId: undefined,
      lockinPeriodFrequency: undefined,
      lockinPeriodFrequencyType: undefined,
      preClosurePenalApplicable: false,
      preClosurePenalInterest: undefined,
      preClosurePenalInterestOnTypeId: undefined,
      withHoldTax: false,
      taxGroupId: undefined,
      locale: "en",
      dateFormat: "yyyy-MM-dd",
    },
  });

  const preClosurePenalApplicable = watch("preClosurePenalApplicable");
  const withHoldTax = watch("withHoldTax");
  const accountingRule = watch("accountingRule");
  const isCashOrAccrual = accountingRule === 2 || accountingRule === 3 || accountingRule === 4;
  const isAccrualPeriodic = accountingRule === 3;

  const tp = template as FixedDepositProductTemplate | undefined;
  const compoundingOptions = tp?.interestCompoundingPeriodTypeOptions ?? FALLBACK_COMPOUNDING;
  const postingOptions = tp?.interestPostingPeriodTypeOptions ?? FALLBACK_POSTING;
  const calculationOptions = tp?.interestCalculationTypeOptions ?? FALLBACK_CALCULATION;
  const daysInYearOptions = tp?.interestCalculationDaysInYearTypeOptions ?? FALLBACK_DAYS_IN_YEAR;
  const lockinTypeOptions = tp?.lockinPeriodFrequencyTypeOptions ?? FALLBACK_LOCKIN_TYPE;
  const accountingRuleOptions = tp?.accountingRuleOptions ?? FALLBACK_ACCOUNTING_RULES;
  const periodFreqOptions = tp?.periodFrequencyTypeOptions ?? FALLBACK_PERIOD_FREQUENCIES;
  const preClosurePenaltyOptions = tp?.preClosurePenalInterestOnTypeOptions ?? FALLBACK_PRE_CLOSURE_PENALTY;
  const chartPeriodTypes = tp?.chartTemplate?.periodTypes ?? FALLBACK_CHART_PERIOD_TYPES;
  const amOptions: AccountingMappingOptions | undefined = tp?.accountingMappingOptions;

  // Apply template defaults on create (not edit)
  useEffect(() => {
    if (!template || isEdit || existingProduct) return;
    const currencies = template.currencyOptions;
    if (currencies?.length === 1) {
      setValue("currencyCode", currencies[0].code);
    }
  }, [template, isEdit, existingProduct, setValue]);

  useEffect(() => {
    if (!existingProduct) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = existingProduct as any;
    const mappings = p.accountingMappings ?? {};
    reset({
      name: p.name ?? "",
      shortName: p.shortName ?? "",
      description: p.description ?? "",
      currencyCode: p.currency?.code ?? "USD",
      digitsAfterDecimal: p.currency?.decimalPlaces ?? 2,
      inMultiplesOf: p.currency?.inMultiplesOf ?? 0,
      nominalAnnualInterestRate: p.nominalAnnualInterestRate ?? 0,
      interestCompoundingPeriodType: enumId(p.interestCompoundingPeriodType, 1) ?? 1,
      interestPostingPeriodType: enumId(p.interestPostingPeriodType, 4) ?? 4,
      interestCalculationType: enumId(p.interestCalculationType, 1) ?? 1,
      interestCalculationDaysInYearType: enumId(p.interestCalculationDaysInYearType, 365) ?? 365,
      minBalanceForInterestCalculation: p.minBalanceForInterestCalculation ?? undefined,
      lockinPeriodFrequency: p.lockinPeriodFrequency ?? undefined,
      lockinPeriodFrequencyType: enumId(p.lockinPeriodFrequencyType, undefined),
      depositAmount: p.depositAmount ?? 1000,
      minDepositAmount: p.minDepositAmount ?? undefined,
      maxDepositAmount: p.maxDepositAmount ?? undefined,
      minDepositTerm: p.minDepositTerm ?? 1,
      minDepositTermTypeId: enumId(p.minDepositTermType, 2) ?? 2,
      maxDepositTerm: p.maxDepositTerm ?? undefined,
      maxDepositTermTypeId: enumId(p.maxDepositTermType, undefined),
      inMultiplesOfDepositTerm: p.inMultiplesOfDepositTerm ?? undefined,
      inMultiplesOfDepositTermTypeId: enumId(p.inMultiplesOfDepositTermType, undefined),
      preClosurePenalApplicable: !!p.preClosurePenalApplicable,
      preClosurePenalInterest: p.preClosurePenalInterest ?? undefined,
      preClosurePenalInterestOnTypeId: enumId(p.preClosurePenalInterestOnType, undefined),
      withHoldTax: !!p.withHoldTax,
      taxGroupId: p.taxGroupId ?? undefined,
      accountingRule: enumId(p.accountingRule, 1) ?? 1,
      locale: "en",
      dateFormat: "yyyy-MM-dd",
      savingsReferenceAccountId: mappings?.savingsReferenceAccount?.id ?? undefined,
      savingsControlAccountId: mappings?.savingsControlAccount?.id ?? undefined,
      transfersInSuspenseAccountId: mappings?.transfersInSuspenseAccount?.id ?? undefined,
      interestOnSavingsAccountId: mappings?.interestOnSavingsAccount?.id ?? undefined,
      incomeFromFeeAccountId: mappings?.incomeFromFeeAccount?.id ?? undefined,
      incomeFromPenaltyAccountId: mappings?.incomeFromPenaltyAccount?.id ?? undefined,
      feesReceivableAccountId: mappings?.feesReceivableAccount?.id ?? undefined,
      penaltiesReceivableAccountId: mappings?.penaltiesReceivableAccount?.id ?? undefined,
      interestPayableAccountId: mappings?.interestPayableAccount?.id ?? undefined,
    });
    if (p.activeChart?.chartSlabs?.length) {
      setSlabs(
        p.activeChart.chartSlabs.map((s: any) => ({
          periodType: enumId(s.periodType, 2) ?? 2,
          fromPeriod: s.fromPeriod ?? 0,
          toPeriod: s.toPeriod ?? null,
          annualInterestRate: s.annualInterestRate ?? 0,
          description: s.description ?? "",
          amountRangeFrom: s.amountRangeFrom ?? null,
          amountRangeTo: s.amountRangeTo ?? null,
        })),
      );
    }
  }, [existingProduct, reset]);

  const updateSlab = (i: number, field: keyof Slab, value: unknown) => {
    setSlabs((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  };

  const addSlab = () => {
    setSlabs((prev) => [...prev, { periodType: 2, fromPeriod: 1, toPeriod: null, annualInterestRate: 5, description: "" }]);
  };

  const removeSlab = (i: number) => {
    setSlabs((prev) => prev.filter((_, idx) => idx !== i));
  };

  const onSubmit = async (values: FormValues) => {
    const payload: FixedDepositProductCreateRequest = {
      name: values.name,
      shortName: values.shortName,
      description: values.description,
      currencyCode: values.currencyCode,
      digitsAfterDecimal: values.digitsAfterDecimal,
      inMultiplesOf: values.inMultiplesOf ?? undefined,
      locale: "en",
      nominalAnnualInterestRate: values.nominalAnnualInterestRate,
      interestCompoundingPeriodType: values.interestCompoundingPeriodType,
      interestPostingPeriodType: values.interestPostingPeriodType,
      interestCalculationType: values.interestCalculationType,
      interestCalculationDaysInYearType: values.interestCalculationDaysInYearType,
      minBalanceForInterestCalculation: values.minBalanceForInterestCalculation ?? undefined,
      accountingRule: values.accountingRule,
      minDepositTerm: values.minDepositTerm,
      minDepositTermTypeId: values.minDepositTermTypeId,
      maxDepositTerm: values.maxDepositTerm ?? undefined,
      maxDepositTermTypeId: values.maxDepositTermTypeId ?? undefined,
      inMultiplesOfDepositTerm: values.inMultiplesOfDepositTerm ?? undefined,
      inMultiplesOfDepositTermTypeId: values.inMultiplesOfDepositTermTypeId ?? undefined,
      depositAmount: values.depositAmount,
      minDepositAmount: values.minDepositAmount ?? undefined,
      maxDepositAmount: values.maxDepositAmount ?? undefined,
      lockinPeriodFrequency: values.lockinPeriodFrequency ?? undefined,
      lockinPeriodFrequencyType: values.lockinPeriodFrequencyType ?? undefined,
      preClosurePenalApplicable: !!values.preClosurePenalApplicable,
      preClosurePenalInterest: values.preClosurePenalInterest ?? undefined,
      preClosurePenalInterestOnTypeId: values.preClosurePenalInterestOnTypeId ?? undefined,
      withHoldTax: !!values.withHoldTax,
      taxGroupId: values.taxGroupId ?? undefined,
      savingsReferenceAccountId: values.savingsReferenceAccountId ?? undefined,
      savingsControlAccountId: values.savingsControlAccountId ?? undefined,
      transfersInSuspenseAccountId: values.transfersInSuspenseAccountId ?? undefined,
      interestOnSavingsAccountId: values.interestOnSavingsAccountId ?? undefined,
      incomeFromFeeAccountId: values.incomeFromFeeAccountId ?? undefined,
      incomeFromPenaltyAccountId: values.incomeFromPenaltyAccountId ?? undefined,
      feesReceivableAccountId: values.feesReceivableAccountId ?? undefined,
      penaltiesReceivableAccountId: values.penaltiesReceivableAccountId ?? undefined,
      interestPayableAccountId: values.interestPayableAccountId ?? undefined,
      charts: [
        {
          locale: "en",
          dateFormat: "yyyy-MM-dd",
          chartSlabs: slabs.map((s) => ({
            periodType: s.periodType,
            fromPeriod: s.fromPeriod,
            toPeriod: s.toPeriod ?? null,
            annualInterestRate: s.annualInterestRate,
            description: s.description || undefined,
            amountRangeFrom: s.amountRangeFrom ?? null,
            amountRangeTo: s.amountRangeTo ?? null,
          })),
        },
      ],
    };

    if (isEdit) {
      await updateMutation.mutateAsync({ productId: Number(id), payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    navigate("/deposits/fixed-products");
  };

  if (isEdit && productLoading) {
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
        title={isEdit ? t("Edit Fixed Deposit Product") : t("Create Fixed Deposit Product")}
        description={t("Configure fixed deposit product terms, interest rates, and chart slabs.")}
        actions={
          <Button variant="outline" onClick={() => navigate("/deposits/fixed-products")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> {t("Back")}
          </Button>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Product Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("Product Details")}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <label className="block text-sm font-medium">{t("Name")} *</label>
              <Input {...register("name")} error={errors.name?.message} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("Short Name")} *</label>
              <Input {...register("shortName")} error={errors.shortName?.message} maxLength={4} placeholder={t("No spaces")} />
            </div>
            <CurrencySelect
              value={watch("currencyCode")}
              onChange={(v) => setValue("currencyCode", v, { shouldValidate: true })}
              error={errors.currencyCode?.message}
            />
            <div className="col-span-2 space-y-1.5">
              <label className="block text-sm font-medium">{t("Description")}</label>
              <Textarea {...register("description")} rows={3} placeholder={t("Brief product description")} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("Decimal Places")} *</label>
              <Input type="number" {...register("digitsAfterDecimal", { valueAsNumber: true })} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("In Multiples Of")}</label>
              <Input type="number" {...register("inMultiplesOf", { valueAsNumber: true })} />
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
              <label className="block text-sm font-medium">{t("Min Balance for Interest Calculation")}</label>
              <Input type="number" step="0.01" {...register("minBalanceForInterestCalculation", { valueAsNumber: true })} />
            </div>
          </CardContent>
        </Card>

        {/* Deposit Amount */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("Deposit Amount")}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("Default Deposit Amount")} *</label>
              <Input
                type="number"
                step="0.01"
                {...register("depositAmount", { valueAsNumber: true })}
                error={errors.depositAmount?.message}
              />
            </div>
            <div />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("Min Deposit Amount")}</label>
              <Input type="number" step="0.01" {...register("minDepositAmount", { valueAsNumber: true })} />
              {errors.minDepositAmount && (
                <p className="text-sm text-red-500">{errors.minDepositAmount.message as string}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("Max Deposit Amount")}</label>
              <Input type="number" step="0.01" {...register("maxDepositAmount", { valueAsNumber: true })} />
              {errors.maxDepositAmount && (
                <p className="text-sm text-red-500">{errors.maxDepositAmount.message as string}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Deposit Terms */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("Deposit Terms")}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("Min Deposit Term")} *</label>
              <Input
                type="number"
                {...register("minDepositTerm", { valueAsNumber: true })}
                error={errors.minDepositTerm?.message}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("Min Term Type")} *</label>
              <EnumSelect
                value={watch("minDepositTermTypeId")}
                onChange={(v) => setValue("minDepositTermTypeId", v)}
                options={periodFreqOptions}
              />
              {errors.minDepositTermTypeId && (
                <p className="text-sm text-red-500">{errors.minDepositTermTypeId.message as string}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("Max Deposit Term")}</label>
              <Input type="number" {...register("maxDepositTerm", { valueAsNumber: true })} />
              {errors.maxDepositTerm && (
                <p className="text-sm text-red-500">{errors.maxDepositTerm.message as string}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("Max Term Type")}</label>
              <EnumSelect
                value={watch("maxDepositTermTypeId")}
                onChange={(v) => setValue("maxDepositTermTypeId", v)}
                options={periodFreqOptions}
                placeholder={t("Select")}
              />
              {errors.maxDepositTermTypeId && (
                <p className="text-sm text-red-500">{errors.maxDepositTermTypeId.message as string}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("In Multiples Of Term")}</label>
              <Input type="number" {...register("inMultiplesOfDepositTerm", { valueAsNumber: true })} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("In Multiples Of Term Type")}</label>
              <EnumSelect
                value={watch("inMultiplesOfDepositTermTypeId")}
                onChange={(v) => setValue("inMultiplesOfDepositTermTypeId", v)}
                options={periodFreqOptions}
                placeholder={t("Select")}
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

        {/* Pre-closure & Tax */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("Pre-closure & Tax")}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="col-span-2 flex items-center gap-2 pt-2">
              <Checkbox
                id="preClosurePenalApplicable"
                checked={!!preClosurePenalApplicable}
                onCheckedChange={(v) => setValue("preClosurePenalApplicable", v === true)}
              />
              <label htmlFor="preClosurePenalApplicable" className="text-sm font-medium">
                {t("Apply Pre-closure Penalty")}
              </label>
            </div>
            {preClosurePenalApplicable && (
              <>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium">{t("Penalty Interest (%)")} *</label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register("preClosurePenalInterest", { valueAsNumber: true })}
                    error={errors.preClosurePenalInterest?.message}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium">{t("Penalty Type")} *</label>
                  <EnumSelect
                    value={watch("preClosurePenalInterestOnTypeId")}
                    onChange={(v) => setValue("preClosurePenalInterestOnTypeId", v)}
                    options={preClosurePenaltyOptions}
                    placeholder={t("Select")}
                  />
                  {errors.preClosurePenalInterestOnTypeId && (
                    <p className="text-sm text-red-500">{errors.preClosurePenalInterestOnTypeId.message as string}</p>
                  )}
                </div>
              </>
            )}
            <div className="col-span-2 flex items-center gap-2 pt-2">
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
              <div className="col-span-2 space-y-1.5">
                <label className="block text-sm font-medium">{t("Tax Group")} *</label>
                <Select
                  value={watch("taxGroupId") ? String(watch("taxGroupId")) : ""}
                  onValueChange={(v) => setValue("taxGroupId", Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("Select tax group")} />
                  </SelectTrigger>
                  <SelectContent>
                    {(tp?.taxGroupOptions ?? []).map((o: any) => (
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
                <GLField label="Savings Reference" name="savingsReferenceAccountId" options={amOptions?.savingsReferenceAccountOptions ?? []} setValue={setValue} watch={watch} errors={errors} />
                <GLField label="Savings Control" name="savingsControlAccountId" options={amOptions?.savingsControlAccountOptions ?? []} setValue={setValue} watch={watch} errors={errors} />
                <GLField label="Interest on Savings" name="interestOnSavingsAccountId" options={amOptions?.interestOnSavingsAccountOptions ?? []} setValue={setValue} watch={watch} errors={errors} />
                <GLField label="Income from Fees" name="incomeFromFeeAccountId" options={amOptions?.incomeFromFeeAccountOptions ?? []} setValue={setValue} watch={watch} errors={errors} />
                <GLField label="Income from Penalties" name="incomeFromPenaltyAccountId" options={amOptions?.incomeFromPenaltyAccountOptions ?? []} setValue={setValue} watch={watch} errors={errors} />
                <GLField label="Transfers in Suspense" name="transfersInSuspenseAccountId" options={amOptions?.transfersInSuspenseAccountOptions ?? []} setValue={setValue} watch={watch} errors={errors} />
                {isAccrualPeriodic && (
                  <>
                    <GLField label="Fees Receivable" name="feesReceivableAccountId" options={amOptions?.feesReceivableAccountOptions ?? []} setValue={setValue} watch={watch} errors={errors} />
                    <GLField label="Penalties Receivable" name="penaltiesReceivableAccountId" options={amOptions?.penaltiesReceivableAccountOptions ?? []} setValue={setValue} watch={watch} errors={errors} />
                    <GLField label="Interest Payable" name="interestPayableAccountId" options={amOptions?.interestPayableAccountOptions ?? []} setValue={setValue} watch={watch} errors={errors} />
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Interest Rate Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{t("Interest Rate Chart (Slabs)")}</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addSlab}>
                <Plus className="mr-1 h-4 w-4" /> {t("Add Slab")}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {slabs.map((slab, i) => (
              <div key={i} className="rounded-lg border border-gray-200 p-4 space-y-3 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t("Slab")} #{i + 1}</span>
                  {slabs.length > 1 && (
                    <button type="button" onClick={() => removeSlab(i)} className="text-gray-400 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">{t("Period Type")}</label>
                    <Select
                      value={String(slab.periodType)}
                      onValueChange={(v) => updateSlab(i, "periodType", Number(v))}
                    >
                      <SelectTrigger className="mt-0.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {chartPeriodTypes.map((pt) => (
                          <SelectItem key={pt.id} value={String(pt.id)}>
                            {t(pt.value)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">{t("From Period")}</label>
                    <Input
                      type="number"
                      placeholder={t("e.g. 0")}
                      value={slab.fromPeriod ?? ""}
                      onChange={(e) => updateSlab(i, "fromPeriod", parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">{t("To Period")}</label>
                    <Input
                      type="number"
                      placeholder={t("e.g. 12")}
                      value={slab.toPeriod ?? ""}
                      onChange={(e) => updateSlab(i, "toPeriod", e.target.value ? parseInt(e.target.value) : null)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">{t("Annual Rate (%)")}</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder={t("e.g. 4.5")}
                      value={slab.annualInterestRate || ""}
                      onChange={(e) => updateSlab(i, "annualInterestRate", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">{t("Description")}</label>
                    <Input
                      type="text"
                      placeholder={t("e.g. 0-12 months")}
                      value={slab.description || ""}
                      onChange={(e) => updateSlab(i, "description", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => navigate("/deposits/fixed-products")}>
            {t("Cancel")}
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-[#D32F2F] hover:bg-red-700">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("Saving…")}
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

export default FixedDepositProductFormPage;
