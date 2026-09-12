import { type FC, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm, type UseFormRegister } from "react-hook-form";
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
import { ErrorState } from "@/components/shared/ErrorState";
import { useToast } from "@/components/ui/toast";
import { createWCLoanProductSchema, type CreateWCLoanProductFormValues } from "../schemas/workingCapitalLoan.schema";
import {
  useCreateWCLoanProduct,
  useUpdateWCLoanProduct,
  useWCLoanProduct,
  useWCLoanProductTemplate,
} from "../hooks/useWCLoanQueries";
import { createWCLoanProduct } from "../api/workingCapitalLoan";

const DEFAULT_PAYMENT_ALLOCATION = [
  { paymentAllocationRule: "DUE_PENALTY", order: 1 },
  { paymentAllocationRule: "DUE_FEE", order: 2 },
  { paymentAllocationRule: "DUE_PRINCIPAL", order: 3 },
  { paymentAllocationRule: "IN_ADVANCE_PENALTY", order: 4 },
  { paymentAllocationRule: "IN_ADVANCE_FEE", order: 5 },
  { paymentAllocationRule: "IN_ADVANCE_PRINCIPAL", order: 6 },
];

type GLAccountOption = { id: number; name: string; glCode: string; disabled?: boolean };

const GLAccountSelect: React.FC<{
  label: string;
  accounts: GLAccountOption[];
  value: number | undefined;
  onChange: (v: number) => void;
  error?: string;
  registerName: keyof CreateWCLoanProductFormValues;
  register: UseFormRegister<CreateWCLoanProductFormValues>;
}> = ({ label, accounts, value, onChange, error, registerName, register }) => {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium">{label}{error ? " *" : ""}</label>
      <Select
        value={value ? String(value) : ""}
        onValueChange={(v) => onChange(Number(v))}
      >
        <SelectTrigger>
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          {accounts.map((a) => (
            <SelectItem key={a.id} value={String(a.id)} disabled={a.disabled}>
              {a.glCode ? `${a.glCode} - ` : ""}{a.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <input type="hidden" {...register(registerName)} />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

const WCLoanProductFormPage: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: routeId } = useParams<{ id?: string }>();
  const editProductId = routeId ? Number(routeId) : undefined;
  const isEditMode = !!editProductId;
  const { success: toastSuccess, error: toastError } = useToast();
  const { data: template, isLoading: templateLoading } = useWCLoanProductTemplate();
  const createMutation = useCreateWCLoanProduct();
  const updateMutation = useUpdateWCLoanProduct();
  const mutation = isEditMode ? updateMutation : createMutation;
  const { data: editProduct, isLoading: productLoading } = useWCLoanProduct(editProductId);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    reset,
    formState: { errors },
  } = useForm<CreateWCLoanProductFormValues>({
    resolver: zodResolver(createWCLoanProductSchema) as never,
    mode: "onChange",
    defaultValues: {
      name: "",
      shortName: "",
      description: "",
      externalId: "",
      currencyCode: "USD",
      digitsAfterDecimal: 2,
      inMultiplesOf: 1,
      amortizationType: "EIR",
      npvDayCount: 360,
      principal: undefined,
      minPrincipal: undefined,
      maxPrincipal: undefined,
      periodPaymentRate: undefined,
      minPeriodPaymentRate: undefined,
      maxPeriodPaymentRate: undefined,
      discount: undefined,
      repaymentEvery: 1,
      repaymentFrequencyType: "MONTHS",
      delinquencyBucketId: undefined,
      breachId: undefined,
      nearBreachId: undefined,
      delinquencyGraceDays: 0,
      delinquencyStartType: "DISBURSEMENT",
      breachGraceDays: undefined,
      breachStartType: "DISBURSEMENT",
      accountingRule: "NONE",
      locale: "en",
      dateFormat: "yyyy-MM-dd",
    },
  });

  const accountingRule = watch("accountingRule");
  const isAccrualAccounting = accountingRule === "ACC_DEF_REV_AM";
  const selectedBreachId = watch("breachId");

  const onSubmit = async (values: CreateWCLoanProductFormValues) => {
    try {
      const minMaxFields: Array<keyof CreateWCLoanProductFormValues> = [
        "minPrincipal",
        "maxPrincipal",
        "minPeriodPaymentRate",
        "maxPeriodPaymentRate",
        "discount",
        "breachGraceDays",
      ];
      const payload: Record<string, unknown> = { ...values };
      for (const field of minMaxFields) {
        const v = payload[field];
        if (v == null || v === "" || (typeof v === "number" && v <= 0)) {
          delete payload[field];
        }
      }
      Object.keys(payload).forEach((k) => {
        if (payload[k] === undefined || payload[k] === "") delete payload[k];
      });
      if (!payload.paymentAllocation) {
        payload.paymentAllocation = [
          {
            transactionType: "DEFAULT",
            paymentAllocationOrder: DEFAULT_PAYMENT_ALLOCATION,
          },
        ];
      }
      if (isEditMode && editProductId) {
        await updateMutation.mutateAsync({ productId: editProductId, payload });
        toastSuccess(t("Product updated successfully"));
        navigate(`/working-capital-loans/products/view/${editProductId}`);
        return;
      }
      await createMutation.mutateAsync(payload as unknown as Parameters<typeof createWCLoanProduct>[0]);
      toastSuccess(t("Product created successfully"));
      navigate("/working-capital-loans/products");
    } catch (e) {
      toastError(e instanceof Error ? e.message : t("An unexpected error occurred."));
    }
  };

  const [prefillDone, setPrefillDone] = useState(false);
  useEffect(() => {
    if (!isEditMode || !editProduct || prefillDone) return;
    setPrefillDone(true);
    reset({
      name: editProduct.name ?? "",
      shortName: editProduct.shortName ?? "",
      description: editProduct.description ?? "",
      externalId: (editProduct as { externalId?: string }).externalId ?? "",
      currencyCode: editProduct.currency?.code ?? "USD",
      digitsAfterDecimal: editProduct.currency?.decimalPlaces ?? 2,
      inMultiplesOf: editProduct.currency?.inMultiplesOf ?? 1,
      amortizationType: "EIR",
      npvDayCount: editProduct.npvDayCount ?? 360,
      principal: editProduct.principal,
      minPrincipal: editProduct.minPrincipal,
      maxPrincipal: editProduct.maxPrincipal,
      periodPaymentRate: editProduct.periodPaymentRate,
      minPeriodPaymentRate: editProduct.minPeriodPaymentRate,
      maxPeriodPaymentRate: editProduct.maxPeriodPaymentRate,
      discount: (editProduct as { discount?: number }).discount,
      repaymentEvery: editProduct.repaymentEvery ?? 30,
      repaymentFrequencyType:
        typeof editProduct.repaymentFrequencyType === "string"
          ? editProduct.repaymentFrequencyType
          : (editProduct.repaymentFrequencyType?.code ?? "DAYS"),
      delinquencyBucketId: editProduct.delinquencyBucketId,
      delinquencyGraceDays: editProduct.delinquencyGraceDays ?? 0,
      delinquencyStartType:
        typeof editProduct.delinquencyStartType === "string"
          ? editProduct.delinquencyStartType
          : (editProduct.delinquencyStartType?.code ?? "DISBURSEMENT"),
      accountingRule:
        typeof editProduct.accountingRule === "string" ? editProduct.accountingRule : "NONE",
      locale: "en",
      dateFormat: "yyyy-MM-dd",
    } as CreateWCLoanProductFormValues);
  }, [isEditMode, editProduct, prefillDone, reset]);

  if (templateLoading || (isEditMode && productLoading)) {
    return (
      <div className="max-w-6xl m-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  const currencyOptions = template?.currencyOptions ?? [];
  const fundOptions = template?.fundOptions ?? [];
  const freqOptions = template?.repaymentFrequencyTypeOptions ?? [];
  const bucketOptions = template?.delinquencyBucketOptions ?? [];
  const breachOptions = template?.breachOptions ?? [];
  const nearBreachOptions = template?.nearBreachOptions ?? [];
  const delinquencyStartTypeOptions = template?.delinquencyStartTypeOptions ?? [];
  const breachStartTypeOptions = template?.breachStartTypeOptions ?? [];
  const accountingRuleOptions = template?.accountingRuleOptions ?? [
    { id: 0, code: "NONE", value: "No accounting" },
    { id: 1, code: "ACC_DEF_REV_AM", value: "Accrual with deferred revenue amortization" },
  ];
  const accountingMappingOptions = template?.accountingMappingOptions;

  return (
    <div className="max-w-6xl m-auto space-y-6">
      <PageHeader
        title={isEditMode ? t("Edit Working Capital Loan Product") : t("Create Working Capital Loan Product")}
        description={t("Configure working capital revolving credit product terms, breach settings, and accounting.")}
        actions={
          <Button
            variant="outline"
            onClick={() =>
              navigate(
                isEditMode
                  ? `/working-capital-loans/products/view/${editProductId}`
                  : "/working-capital-loans/products",
              )
            }
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> {t("Back")}
          </Button>
        }
      />

      {mutation.isError && (
        <ErrorState
          title={isEditMode ? t("Failed to update product") : t("Failed to create product")}
          message={mutation.error?.message ?? t("An unexpected error occurred.")}
          onRetry={() => mutation.reset()}
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* ── Product Details ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("Product Details")}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("Name")} *</label>
              <Input {...register("name")} error={errors.name?.message} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("Short Name")} *</label>
              <Input {...register("shortName")} error={errors.shortName?.message} />
            </div>
            <div className="space-y-1.5 col-span-2">
              <label className="block text-sm font-medium">{t("Description")}</label>
              <Textarea {...register("description")} rows={3} error={errors.description?.message} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("External ID")}</label>
              <Input {...register("externalId")} error={errors.externalId?.message} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("Fund")}</label>
              <Select
                value={watch("fundId") ? String(watch("fundId")) : ""}
                onValueChange={(v) => setValue("fundId", Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("Select fund")} />
                </SelectTrigger>
                <SelectContent>
                  {fundOptions.map((f) => (
                    <SelectItem key={f.id} value={String(f.id)}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("Currency")} *</label>
              <Select
                value={watch("currencyCode")}
                onValueChange={(v) => setValue("currencyCode", v, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("Select currency")} />
                </SelectTrigger>
                <SelectContent>
                  {currencyOptions.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.code} ({c.name})
                    </SelectItem>
                  ))}
                  {currencyOptions.length === 0 && <SelectItem value="USD">USD</SelectItem>}
                </SelectContent>
              </Select>
              {errors.currencyCode && <p className="text-sm text-red-500">{errors.currencyCode.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("Decimal Places")} *</label>
              <Input
                type="number"
                {...register("digitsAfterDecimal")}
                error={errors.digitsAfterDecimal?.message}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("In Multiples Of")}</label>
              <Input
                type="number"
                {...register("inMultiplesOf")}
                error={errors.inMultiplesOf?.message}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("Start Date")}</label>
              <Input type="date" {...register("startDate")} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("Close Date")}</label>
              <Input type="date" {...register("closeDate")} error={errors.closeDate?.message} />
            </div>
          </CardContent>
        </Card>

        {/* ── EIR & Amortization ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("EIR & Amortization")}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("Amortization Type")} *</label>
              <Input value="EIR (Effective Interest Rate)" disabled />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("NPV Day Count")} *</label>
              <Input
                type="number"
                {...register("npvDayCount")}
                error={errors.npvDayCount?.message}
              />
            </div>
            <div className="space-y-1.5 col-span-2">
              <label className="block text-sm font-medium">{t("Period Payment Rate (%)")} *</label>
              <Input
                type="number"
                step="0.01"
                {...register("periodPaymentRate", {
                  onChange: () => {
                    trigger("minPeriodPaymentRate");
                    trigger("maxPeriodPaymentRate");
                  },
                })}
                error={errors.periodPaymentRate?.message}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("Min Rate (%)")}</label>
              <Input
                type="number"
                step="0.01"
                {...register("minPeriodPaymentRate", {
                  onChange: () => {
                    trigger("periodPaymentRate");
                    trigger("maxPeriodPaymentRate");
                  },
                })}
                error={errors.minPeriodPaymentRate?.message}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("Max Rate (%)")}</label>
              <Input
                type="number"
                step="0.01"
                {...register("maxPeriodPaymentRate", {
                  onChange: () => {
                    trigger("periodPaymentRate");
                    trigger("minPeriodPaymentRate");
                  },
                })}
                error={errors.maxPeriodPaymentRate?.message}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("Discount (%)")}</label>
              <Input
                type="number"
                step="0.01"
                {...register("discount")}
                error={errors.discount?.message}
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Principal & Repayment ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("Principal & Repayment")}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div className="space-y-1.5 col-span-2">
              <label className="block text-sm font-medium">{t("Principal")} *</label>
              <Input
                type="number"
                step="0.01"
                {...register("principal", {
                  onChange: () => {
                    trigger("minPrincipal");
                    trigger("maxPrincipal");
                  },
                })}
                error={errors.principal?.message}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("Min Principal")}</label>
              <Input
                type="number"
                step="0.01"
                {...register("minPrincipal", {
                  onChange: () => {
                    trigger("principal");
                    trigger("maxPrincipal");
                  },
                })}
                error={errors.minPrincipal?.message}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("Max Principal")}</label>
              <Input
                type="number"
                step="0.01"
                {...register("maxPrincipal", {
                  onChange: () => {
                    trigger("principal");
                    trigger("minPrincipal");
                  },
                })}
                error={errors.maxPrincipal?.message}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("Repayment Every")} *</label>
              <Input
                type="number"
                {...register("repaymentEvery")}
                error={errors.repaymentEvery?.message}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("Repayment Frequency")} *</label>
              <Select
                value={watch("repaymentFrequencyType")}
                onValueChange={(v) => setValue("repaymentFrequencyType", v, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {freqOptions.map((o) => (
                    <SelectItem key={o.id} value={o.code}>
                      {o.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* ── Delinquency Settings ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("Delinquency Settings")}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("Delinquency Bucket")} *</label>
              <Select
                value={watch("delinquencyBucketId") ? String(watch("delinquencyBucketId")) : ""}
                onValueChange={(v) => setValue("delinquencyBucketId", Number(v), { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("Select bucket")} />
                </SelectTrigger>
                <SelectContent>
                  {bucketOptions.map((b) => (
                    <SelectItem key={b.id} value={String(b.id)}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.delinquencyBucketId && (
                <p className="text-sm text-red-500">{errors.delinquencyBucketId.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("Grace Days")}</label>
              <Input
                type="number"
                {...register("delinquencyGraceDays")}
                error={errors.delinquencyGraceDays?.message}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("Delinquency Start Type")}</label>
              <Select
                value={watch("delinquencyStartType") ?? "DISBURSEMENT"}
                onValueChange={(v) => setValue("delinquencyStartType", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {delinquencyStartTypeOptions.map((o) => (
                    <SelectItem key={o.code} value={o.code}>
                      {o.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* ── Breach Configuration ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("Breach Configuration")}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("Breach Configuration")}</label>
              <Select
                value={watch("breachId") ? String(watch("breachId")) : ""}
                onValueChange={(v) => setValue("breachId", Number(v), { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("Select breach config")} />
                </SelectTrigger>
                <SelectContent>
                  {breachOptions.map((b) => (
                    <SelectItem key={b.id} value={String(b.id)}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.breachId && <p className="text-sm text-red-500">{errors.breachId.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("Near Breach Configuration")}</label>
              <Select
                value={watch("nearBreachId") ? String(watch("nearBreachId")) : ""}
                onValueChange={(v) => setValue("nearBreachId", Number(v), { shouldValidate: true })}
                disabled={!selectedBreachId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("Select near breach config")} />
                </SelectTrigger>
                <SelectContent>
                  {nearBreachOptions.map((n) => (
                    <SelectItem key={n.id} value={String(n.id)}>
                      {n.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.nearBreachId && <p className="text-sm text-red-500">{errors.nearBreachId.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("Breach Grace Days")}</label>
              <Input
                type="number"
                {...register("breachGraceDays")}
                error={errors.breachGraceDays?.message}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("Breach Start Type")}</label>
              <Select
                value={watch("breachStartType") ?? "DISBURSEMENT"}
                onValueChange={(v) => setValue("breachStartType", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {breachStartTypeOptions.map((o) => (
                    <SelectItem key={o.code} value={o.code}>
                      {o.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* ── Configurable Attributes ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("Configurable Attributes")}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div
              className="col-span-2 flex items-center gap-2 pt-2 cursor-pointer"
              onClick={() =>
                setValue(
                  "allowAttributeOverrides.delinquencyBucketClassification",
                  !watch("allowAttributeOverrides.delinquencyBucketClassification"),
                )
              }
            >
              <Checkbox
                id="attr_delinquencyBucket"
                checked={!!watch("allowAttributeOverrides.delinquencyBucketClassification")}
                onCheckedChange={(v) =>
                  setValue("allowAttributeOverrides.delinquencyBucketClassification", v === true)
                }
              />
              <label htmlFor="attr_delinquencyBucket" className="block text-sm font-medium">
                {t("Allow Delinquency Bucket Override")}
              </label>
            </div>
            <div
              className="col-span-2 flex items-center gap-2 pt-2 cursor-pointer"
              onClick={() =>
                setValue("allowAttributeOverrides.breach", !watch("allowAttributeOverrides.breach"))
              }
            >
              <Checkbox
                id="attr_breach"
                checked={!!watch("allowAttributeOverrides.breach")}
                onCheckedChange={(v) => setValue("allowAttributeOverrides.breach", v === true)}
              />
              <label htmlFor="attr_breach" className="block text-sm font-medium">
                {t("Allow Breach Override")}
              </label>
            </div>
            <div
              className="col-span-2 flex items-center gap-2 pt-2 cursor-pointer"
              onClick={() =>
                setValue("allowAttributeOverrides.discountDefault", !watch("allowAttributeOverrides.discountDefault"))
              }
            >
              <Checkbox
                id="attr_discount"
                checked={!!watch("allowAttributeOverrides.discountDefault")}
                onCheckedChange={(v) => setValue("allowAttributeOverrides.discountDefault", v === true)}
              />
              <label htmlFor="attr_discount" className="block text-sm font-medium">
                {t("Allow Discount Override")}
              </label>
            </div>
            <div
              className="col-span-2 flex items-center gap-2 pt-2 cursor-pointer"
              onClick={() =>
                setValue(
                  "allowAttributeOverrides.periodPaymentFrequency",
                  !watch("allowAttributeOverrides.periodPaymentFrequency"),
                )
              }
            >
              <Checkbox
                id="attr_paymentFreq"
                checked={!!watch("allowAttributeOverrides.periodPaymentFrequency")}
                onCheckedChange={(v) => setValue("allowAttributeOverrides.periodPaymentFrequency", v === true)}
              />
              <label htmlFor="attr_paymentFreq" className="block text-sm font-medium">
                {t("Allow Payment Frequency Override")}
              </label>
            </div>
            <div
              className="col-span-2 flex items-center gap-2 pt-2 cursor-pointer"
              onClick={() =>
                setValue(
                  "allowAttributeOverrides.periodPaymentFrequencyType",
                  !watch("allowAttributeOverrides.periodPaymentFrequencyType"),
                )
              }
            >
              <Checkbox
                id="attr_paymentFreqType"
                checked={!!watch("allowAttributeOverrides.periodPaymentFrequencyType")}
                onCheckedChange={(v) =>
                  setValue("allowAttributeOverrides.periodPaymentFrequencyType", v === true)
                }
              />
              <label htmlFor="attr_paymentFreqType" className="block text-sm font-medium">
                {t("Allow Payment Frequency Type Override")}
              </label>
            </div>
          </CardContent>
        </Card>

        {/* ── Accounting ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("Accounting")}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div className="space-y-1.5 col-span-2">
              <label className="block text-sm font-medium">{t("Accounting Rule")} *</label>
              <Select
                value={watch("accountingRule") ?? "NONE"}
                onValueChange={(v) => setValue("accountingRule", v, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {accountingRuleOptions.map((o) => (
                    <SelectItem key={o.id} value={o.code}>
                      {o.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.accountingRule && <p className="text-sm text-red-500">{errors.accountingRule.message}</p>}
            </div>

            {isAccrualAccounting && (
              <>
                <div className="col-span-2 mt-4 mb-2">
                  <h4 className="text-sm font-semibold text-gray-700">{t("Asset Accounts")}</h4>
                </div>
                <GLAccountSelect
                  label={t("Fund Source")}
                  accounts={accountingMappingOptions?.assetAccountOptions ?? []}
                  value={watch("fundSourceAccountId")}
                  onChange={(v) => setValue("fundSourceAccountId", v, { shouldValidate: true })}
                  error={errors.fundSourceAccountId?.message}
                  registerName="fundSourceAccountId" register={register}
                />
                <GLAccountSelect
                  label={t("Loan Portfolio")}
                  accounts={accountingMappingOptions?.assetAccountOptions ?? []}
                  value={watch("loanPortfolioAccountId")}
                  onChange={(v) => setValue("loanPortfolioAccountId", v, { shouldValidate: true })}
                  error={errors.loanPortfolioAccountId?.message}
                  registerName="loanPortfolioAccountId" register={register}
                />
                <GLAccountSelect
                  label={t("Transfers in Suspense")}
                  accounts={accountingMappingOptions?.assetAccountOptions ?? []}
                  value={watch("transfersInSuspenseAccountId")}
                  onChange={(v) => setValue("transfersInSuspenseAccountId", v, { shouldValidate: true })}
                  error={errors.transfersInSuspenseAccountId?.message}
                  registerName="transfersInSuspenseAccountId" register={register}
                />

                <div className="col-span-2 mt-4 mb-2">
                  <h4 className="text-sm font-semibold text-gray-700">{t("Liability Accounts")}</h4>
                </div>
                <GLAccountSelect
                  label={t("Deferred Income Liability")}
                  accounts={accountingMappingOptions?.liabilityAccountOptions ?? []}
                  value={watch("deferredIncomeLiabilityAccountId")}
                  onChange={(v) => setValue("deferredIncomeLiabilityAccountId", v, { shouldValidate: true })}
                  error={errors.deferredIncomeLiabilityAccountId?.message}
                  registerName="deferredIncomeLiabilityAccountId" register={register}
                />
                <GLAccountSelect
                  label={t("Overpayment Liability")}
                  accounts={accountingMappingOptions?.liabilityAccountOptions ?? []}
                  value={watch("overpaymentLiabilityAccountId")}
                  onChange={(v) => setValue("overpaymentLiabilityAccountId", v, { shouldValidate: true })}
                  error={errors.overpaymentLiabilityAccountId?.message}
                  registerName="overpaymentLiabilityAccountId" register={register}
                />

                <div className="col-span-2 mt-4 mb-2">
                  <h4 className="text-sm font-semibold text-gray-700">{t("Receivable Accounts")}</h4>
                </div>
                <GLAccountSelect
                  label={t("Receivable Fees")}
                  accounts={accountingMappingOptions?.assetAccountOptions ?? []}
                  value={watch("receivableFeeAccountId")}
                  onChange={(v) => setValue("receivableFeeAccountId", v, { shouldValidate: true })}
                  error={errors.receivableFeeAccountId?.message}
                  registerName="receivableFeeAccountId" register={register}
                />
                <GLAccountSelect
                  label={t("Receivable Penalties")}
                  accounts={accountingMappingOptions?.assetAccountOptions ?? []}
                  value={watch("receivablePenaltyAccountId")}
                  onChange={(v) => setValue("receivablePenaltyAccountId", v, { shouldValidate: true })}
                  error={errors.receivablePenaltyAccountId?.message}
                  registerName="receivablePenaltyAccountId" register={register}
                />

                <div className="col-span-2 mt-4 mb-2">
                  <h4 className="text-sm font-semibold text-gray-700">{t("Income Accounts")}</h4>
                </div>
                <GLAccountSelect
                  label={t("Income from Discount Fee")}
                  accounts={accountingMappingOptions?.incomeAccountOptions ?? []}
                  value={watch("incomeFromDiscountFeeAccountId")}
                  onChange={(v) => setValue("incomeFromDiscountFeeAccountId", v, { shouldValidate: true })}
                  error={errors.incomeFromDiscountFeeAccountId?.message}
                  registerName="incomeFromDiscountFeeAccountId" register={register}
                />
                <GLAccountSelect
                  label={t("Income from Fees")}
                  accounts={accountingMappingOptions?.incomeAccountOptions ?? []}
                  value={watch("incomeFromFeeAccountId")}
                  onChange={(v) => setValue("incomeFromFeeAccountId", v, { shouldValidate: true })}
                  error={errors.incomeFromFeeAccountId?.message}
                  registerName="incomeFromFeeAccountId" register={register}
                />
                <GLAccountSelect
                  label={t("Income from Penalties")}
                  accounts={accountingMappingOptions?.incomeAccountOptions ?? []}
                  value={watch("incomeFromPenaltyAccountId")}
                  onChange={(v) => setValue("incomeFromPenaltyAccountId", v, { shouldValidate: true })}
                  error={errors.incomeFromPenaltyAccountId?.message}
                  registerName="incomeFromPenaltyAccountId" register={register}
                />
                <GLAccountSelect
                  label={t("Income from Recovery")}
                  accounts={accountingMappingOptions?.incomeAccountOptions ?? []}
                  value={watch("incomeFromRecoveryAccountId")}
                  onChange={(v) => setValue("incomeFromRecoveryAccountId", v, { shouldValidate: true })}
                  error={errors.incomeFromRecoveryAccountId?.message}
                  registerName="incomeFromRecoveryAccountId" register={register}
                />

                <div className="col-span-2 mt-4 mb-2">
                  <h4 className="text-sm font-semibold text-gray-700">{t("Expense Accounts")}</h4>
                </div>
                <GLAccountSelect
                  label={t("Write-off")}
                  accounts={accountingMappingOptions?.expenseAccountOptions ?? []}
                  value={watch("writeOffAccountId")}
                  onChange={(v) => setValue("writeOffAccountId", v, { shouldValidate: true })}
                  error={errors.writeOffAccountId?.message}
                  registerName="writeOffAccountId" register={register}
                />
                <GLAccountSelect
                  label={t("Charge-off Expense")}
                  accounts={accountingMappingOptions?.expenseAccountOptions ?? []}
                  value={watch("chargeOffExpenseAccountId")}
                  onChange={(v) => setValue("chargeOffExpenseAccountId", v)}
                  registerName="chargeOffExpenseAccountId" register={register}
                />
                <GLAccountSelect
                  label={t("Charge-off Fraud Expense")}
                  accounts={accountingMappingOptions?.expenseAccountOptions ?? []}
                  value={watch("chargeOffFraudExpenseAccountId")}
                  onChange={(v) => setValue("chargeOffFraudExpenseAccountId", v)}
                  registerName="chargeOffFraudExpenseAccountId" register={register}
                />
                <GLAccountSelect
                  label={t("Goodwill Credit")}
                  accounts={accountingMappingOptions?.liabilityAccountOptions ?? []}
                  value={watch("goodwillCreditAccountId")}
                  onChange={(v) => setValue("goodwillCreditAccountId", v)}
                  registerName="goodwillCreditAccountId" register={register}
                />
                <GLAccountSelect
                  label={t("Income from Charge-off Fees")}
                  accounts={accountingMappingOptions?.incomeAccountOptions ?? []}
                  value={watch("incomeFromChargeOffFeesAccountId")}
                  onChange={(v) => setValue("incomeFromChargeOffFeesAccountId", v)}
                  registerName="incomeFromChargeOffFeesAccountId" register={register}
                />
                <GLAccountSelect
                  label={t("Income from Charge-off Penalty")}
                  accounts={accountingMappingOptions?.incomeAccountOptions ?? []}
                  value={watch("incomeFromChargeOffPenaltyAccountId")}
                  onChange={(v) => setValue("incomeFromChargeOffPenaltyAccountId", v)}
                  registerName="incomeFromChargeOffPenaltyAccountId" register={register}
                />
                <GLAccountSelect
                  label={t("Income from Goodwill Credit Fees")}
                  accounts={accountingMappingOptions?.incomeAccountOptions ?? []}
                  value={watch("incomeFromGoodwillCreditFeesAccountId")}
                  onChange={(v) => setValue("incomeFromGoodwillCreditFeesAccountId", v)}
                  registerName="incomeFromGoodwillCreditFeesAccountId" register={register}
                />
                <GLAccountSelect
                  label={t("Income from Goodwill Credit Penalty")}
                  accounts={accountingMappingOptions?.incomeAccountOptions ?? []}
                  value={watch("incomeFromGoodwillCreditPenaltyAccountId")}
                  onChange={(v) => setValue("incomeFromGoodwillCreditPenaltyAccountId", v)}
                  registerName="incomeFromGoodwillCreditPenaltyAccountId" register={register}
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* ── Payment Allocation ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("Payment Allocation")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-gray-200 divide-y">
              <div className="grid grid-cols-3 px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
                <span>{t("Order")}</span>
                <span>{t("Allocation Rule")}</span>
                <span>{t("Timing")}</span>
              </div>
              {DEFAULT_PAYMENT_ALLOCATION.map((rule) => {
                const [timing, type] = rule.paymentAllocationRule.split("_");
                return (
                  <div key={rule.paymentAllocationRule} className="grid grid-cols-3 px-4 py-2 text-sm">
                    <span>{rule.order}</span>
                    <span>{type}</span>
                    <span>{timing === "DUE" ? t("Due") : t("In Advance")}</span>
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {t("Payment allocation defines the order in which payments are applied to penalty, fee, and principal.")}
            </p>
          </CardContent>
        </Card>

        {/* ── Submit ── */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              navigate(
                isEditMode
                  ? `/working-capital-loans/products/view/${editProductId}`
                  : "/working-capital-loans/products",
              )
            }
          >
            {t("Cancel")}
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            {isEditMode ? t("Save Changes") : t("Create Product")}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default WCLoanProductFormPage;
