import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Pencil,
  Landmark,
  DollarSign,
  Percent,
  CalendarClock,
  Repeat,
  FileText,
  Shield,
  Clock,
  AlertTriangle,
  PiggyBank,
  Link,
  BookOpen,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useSavingsProduct } from "@/features/deposits";

function enumVal(v: unknown, fallback = ""): string {
  if (v == null) return fallback;
  if (typeof v === "object" && v !== null) {
    const obj = v as Record<string, unknown>;
    return (obj.value ?? obj.code ?? obj.description ?? String(obj.id)) as string ?? fallback;
  }
  return String(v);
}

const PERIOD_TYPE_LABELS: Record<number, string> = { 0: "Days", 1: "Weeks", 2: "Months", 3: "Years" };
const COMPOUNDING_LABELS: Record<number, string> = {
  1: "Daily",
  4: "Monthly",
  5: "Quarterly",
  6: "Semi-Annual",
  7: "Annual",
};
const POSTING_LABELS: Record<number, string> = {
  1: "Daily",
  4: "Monthly",
  5: "Quarterly",
  6: "Semi-Annual",
  7: "Annual",
  8: "Anniversary Monthly",
  9: "Anniversary Quarterly",
  10: "Anniversary Bi-Annual",
  11: "Anniversary Annual",
};
const CALCULATION_LABELS: Record<number, string> = { 1: "Daily Balance", 2: "Average Daily Balance" };
const DAYS_IN_YEAR_LABELS: Record<number, string> = { 360: "360 Days", 364: "364 Days", 365: "365 Days", 1: "Actual" };
const ACCOUNTING_RULE_LABELS: Record<number, string> = {
  1: "None",
  2: "Cash Based",
  3: "Accrual (Periodic)",
  4: "Accrual (Upfront)",
};

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({
  icon,
  label,
  value,
}) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0 dark:border-gray-800">
    <div className="mt-0.5 shrink-0 text-gray-400">{icon}</div>
    <div className="min-w-0 flex-1">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
      <div className="mt-0.5 text-sm font-medium text-gray-900 dark:text-gray-100">{value ?? "—"}</div>
    </div>
  </div>
);

const SavingsProductDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, isError, error, refetch } = useSavingsProduct(id ? Number(id) : undefined);

  if (isLoading) {
    return (
      <div className="max-w-5xl m-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3].map((j) => (
                  <Skeleton key={j} className="h-12 w-full" />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6  m-auto">
        <PageHeader
          title={t("Error loading product")}
          description={error?.message ?? t("An unexpected error occurred.")}
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate("/deposits/products")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> {t("Back")}
              </Button>
              <Button variant="outline" onClick={() => refetch()}>
                {t("Retry")}
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6  m-auto">
        <PageHeader
          title={t("Product Not Found")}
          description={t("The requested savings product does not exist.")}
          actions={
            <Button variant="outline" onClick={() => navigate("/deposits/products")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> {t("Back")}
            </Button>
          }
        />
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = product as any;
  const mappings = p.accountingMappings ?? {};
  const accountingRuleId = p.accountingRule ?? p.accountingType ?? 1;

  return (
    <div className="p-6 max-w-5xl m-auto space-y-6">
      <PageHeader
        title={p.name}
        description={p.description ?? p.shortName ?? ""}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate("/deposits/products")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> {t("Back")}
            </Button>
            <Button onClick={() => navigate(`/deposits/products/edit/${id}`)} className="bg-[#D32F2F] hover:bg-red-700">
              <Pencil className="mr-2 h-4 w-4" /> {t("Edit")}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Landmark className="h-5 w-5 text-[#D32F2F]" />
              {t("Basic Info")}
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-gray-100 dark:divide-gray-800">
            <InfoRow icon={<FileText className="h-4 w-4" />} label={t("Product Name")} value={p.name} />
            <InfoRow icon={<FileText className="h-4 w-4" />} label={t("Short Name")} value={p.shortName ?? "—"} />
            <InfoRow icon={<FileText className="h-4 w-4" />} label={t("Description")} value={p.description ?? "—"} />
            <InfoRow
              icon={<DollarSign className="h-4 w-4" />}
              label={t("Currency")}
              value={`${p.currency?.code ?? "—"} (${p.currency?.displaySymbol ?? ""})`}
            />
            <InfoRow
              icon={<Percent className="h-4 w-4 text-emerald-500" />}
              label={t("Nominal Annual Interest Rate")}
              value={`${p.nominalAnnualInterestRate}%`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Percent className="h-5 w-5 text-[#D32F2F]" />
              {t("Interest Settings")}
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-gray-100 dark:divide-gray-800">
            <InfoRow
              icon={<Repeat className="h-4 w-4" />}
              label={t("Compounding Period")}
              value={
                COMPOUNDING_LABELS[p.interestCompoundingPeriodType?.id ?? p.interestCompoundingPeriodType] ??
                enumVal(p.interestCompoundingPeriodType, "—")
              }
            />
            <InfoRow
              icon={<CalendarClock className="h-4 w-4" />}
              label={t("Posting Period")}
              value={
                POSTING_LABELS[p.interestPostingPeriodType?.id ?? p.interestPostingPeriodType] ??
                enumVal(p.interestPostingPeriodType, "—")
              }
            />
            <InfoRow
              icon={<CalendarClock className="h-4 w-4" />}
              label={t("Calculation Method")}
              value={
                CALCULATION_LABELS[p.interestCalculationType?.id ?? p.interestCalculationType] ??
                enumVal(p.interestCalculationType, "—")
              }
            />
            <InfoRow
              icon={<CalendarClock className="h-4 w-4" />}
              label={t("Days in Year")}
              value={
                DAYS_IN_YEAR_LABELS[p.interestCalculationDaysInYearType?.id ?? p.interestCalculationDaysInYearType] ??
                enumVal(p.interestCalculationDaysInYearType, "—")
              }
            />
            <InfoRow
              icon={<DollarSign className="h-4 w-4" />}
              label={t("Min Balance for Interest Calc")}
              value={p.minBalanceForInterestCalculation?.toLocaleString() ?? "—"}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <PiggyBank className="h-5 w-5 text-[#D32F2F]" />
              {t("Balance & Access")}
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-gray-100 dark:divide-gray-800">
            <InfoRow
              icon={<DollarSign className="h-4 w-4" />}
              label={t("Min Opening Balance")}
              value={p.minRequiredOpeningBalance?.toLocaleString() ?? "—"}
            />
            <InfoRow
              icon={<Clock className="h-4 w-4" />}
              label={t("Lock-in Period")}
              value={
                p.lockinPeriodFrequency != null
                  ? `${p.lockinPeriodFrequency} ${PERIOD_TYPE_LABELS[p.lockinPeriodFrequencyType?.id] ?? enumVal(p.lockinPeriodFrequencyType, "")}`
                  : t("None")
              }
            />
            <InfoRow
              icon={<DollarSign className="h-4 w-4" />}
              label={t("Min Required Balance")}
              value={p.minRequiredBalance?.toLocaleString() ?? "—"}
            />
            <InfoRow
              icon={<Shield className="h-4 w-4" />}
              label={t("Enforce Min Balance")}
              value={p.enforceMinRequiredBalance ? t("Yes") : t("No")}
            />
            <InfoRow
              icon={<DollarSign className="h-4 w-4" />}
              label={t("Withdrawal Fee for Transfers")}
              value={p.withdrawalFeeForTransfers ? t("Yes") : t("No")}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-5 w-5 text-[#D32F2F]" />
              {t("Overdraft Settings")}
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-gray-100 dark:divide-gray-800">
            <InfoRow
              icon={<Shield className="h-4 w-4" />}
              label={t("Allow Overdraft")}
              value={p.allowOverdraft ? t("Yes") : t("No")}
            />
            {p.allowOverdraft && (
              <>
                <InfoRow
                  icon={<DollarSign className="h-4 w-4" />}
                  label={t("Overdraft Limit")}
                  value={p.overdraftLimit?.toLocaleString() ?? "—"}
                />
                <InfoRow
                  icon={<Percent className="h-4 w-4" />}
                  label={t("Overdraft Interest Rate (%)")}
                  value={p.nominalAnnualInterestRateOverdraft != null ? `${p.nominalAnnualInterestRateOverdraft}%` : "—"}
                />
                <InfoRow
                  icon={<DollarSign className="h-4 w-4" />}
                  label={t("Min Overdraft for Interest Calc")}
                  value={p.minOverdraftForInterestCalculation?.toLocaleString() ?? "—"}
                />
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Link className="h-5 w-5 text-[#D32F2F]" />
              {t("Lien")}
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-gray-100 dark:divide-gray-800">
            <InfoRow
              icon={<Link className="h-4 w-4" />}
              label={t("Lien Allowed")}
              value={p.lienAllowed ? t("Yes") : t("No")}
            />
            {p.lienAllowed && (
              <InfoRow
                icon={<DollarSign className="h-4 w-4" />}
                label={t("Max Lien Limit")}
                value={p.maxAllowedLienLimit?.toLocaleString() ?? "—"}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-5 w-5 text-[#D32F2F]" />
              {t("Dormancy Tracking")}
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-gray-100 dark:divide-gray-800">
            <InfoRow
              icon={<AlertTriangle className="h-4 w-4" />}
              label={t("Dormancy Tracking")}
              value={p.isDormancyTrackingActive ? t("Active") : t("Inactive")}
            />
            {p.isDormancyTrackingActive && (
              <>
                <InfoRow
                  icon={<Clock className="h-4 w-4" />}
                  label={t("Days to Inactive")}
                  value={p.daysToInactive ?? "—"}
                />
                <InfoRow
                  icon={<Clock className="h-4 w-4" />}
                  label={t("Days to Dormancy")}
                  value={p.daysToDormancy ?? "—"}
                />
                <InfoRow icon={<Clock className="h-4 w-4" />} label={t("Days to Escheat")} value={p.daysToEscheat ?? "—"} />
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-5 w-5 text-[#D32F2F]" />
              {t("Tax")}
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-gray-100 dark:divide-gray-800">
            <InfoRow
              icon={<FileText className="h-4 w-4" />}
              label={t("Withhold Tax")}
              value={p.withHoldTax ? t("Yes") : t("No")}
            />
            {p.withHoldTax && (
              <InfoRow
                icon={<FileText className="h-4 w-4" />}
                label={t("Tax Group")}
                value={p.taxGroup?.name ?? (p.taxGroupId ? `#${p.taxGroupId}` : "—")}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-5 w-5 text-[#D32F2F]" />
              {t("Accounting")}
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-gray-100 dark:divide-gray-800">
            <InfoRow
              icon={<BookOpen className="h-4 w-4" />}
              label={t("Accounting Rule")}
              value={ACCOUNTING_RULE_LABELS[accountingRuleId] ?? enumVal(accountingRuleId, "—")}
            />
            {(accountingRuleId === 2 || accountingRuleId === 3 || accountingRuleId === 4) && (
              <>
                <InfoRow
                  icon={<Landmark className="h-4 w-4" />}
                  label={t("Savings Reference Account")}
                  value={mappings.savingsReferenceAccount ? `${mappings.savingsReferenceAccount.name} (${mappings.savingsReferenceAccount.glCode ?? "—"})` : "—"}
                />
                <InfoRow
                  icon={<Landmark className="h-4 w-4" />}
                  label={t("Savings Control Account")}
                  value={mappings.savingsControlAccount ? `${mappings.savingsControlAccount.name} (${mappings.savingsControlAccount.glCode ?? "—"})` : "—"}
                />
                <InfoRow
                  icon={<Landmark className="h-4 w-4" />}
                  label={t("Interest on Savings Account")}
                  value={mappings.interestOnSavingsAccount ? `${mappings.interestOnSavingsAccount.name} (${mappings.interestOnSavingsAccount.glCode ?? "—"})` : "—"}
                />
                <InfoRow
                  icon={<Landmark className="h-4 w-4" />}
                  label={t("Income from Fees Account")}
                  value={mappings.incomeFromFeeAccount ? `${mappings.incomeFromFeeAccount.name} (${mappings.incomeFromFeeAccount.glCode ?? "—"})` : "—"}
                />
                <InfoRow
                  icon={<Landmark className="h-4 w-4" />}
                  label={t("Income from Penalties Account")}
                  value={mappings.incomeFromPenaltyAccount ? `${mappings.incomeFromPenaltyAccount.name} (${mappings.incomeFromPenaltyAccount.glCode ?? "—"})` : "—"}
                />
                <InfoRow
                  icon={<Landmark className="h-4 w-4" />}
                  label={t("Transfers in Suspense Account")}
                  value={mappings.transfersInSuspenseAccount ? `${mappings.transfersInSuspenseAccount.name} (${mappings.transfersInSuspenseAccount.glCode ?? "—"})` : "—"}
                />
                {p.allowOverdraft && (
                  <>
                    <InfoRow
                      icon={<Landmark className="h-4 w-4" />}
                      label={t("Overdraft Portfolio Control")}
                      value={mappings.overdraftPortfolioControl ? `${mappings.overdraftPortfolioControl.name} (${mappings.overdraftPortfolioControl.glCode ?? "—"})` : "—"}
                    />
                    <InfoRow
                      icon={<Landmark className="h-4 w-4" />}
                      label={t("Income from Interest")}
                      value={mappings.incomeFromInterest ? `${mappings.incomeFromInterest.name} (${mappings.incomeFromInterest.glCode ?? "—"})` : "—"}
                    />
                    <InfoRow
                      icon={<Landmark className="h-4 w-4" />}
                      label={t("Losses Written Off")}
                      value={mappings.lossesWrittenOff ? `${mappings.lossesWrittenOff.name} (${mappings.lossesWrittenOff.glCode ?? "—"})` : "—"}
                    />
                  </>
                )}
                {accountingRuleId === 3 && (
                  <>
                    <InfoRow
                      icon={<Landmark className="h-4 w-4" />}
                      label={t("Fees Receivable Account")}
                      value={mappings.feesReceivableAccount ? `${mappings.feesReceivableAccount.name} (${mappings.feesReceivableAccount.glCode ?? "—"})` : "—"}
                    />
                    <InfoRow
                      icon={<Landmark className="h-4 w-4" />}
                      label={t("Penalties Receivable Account")}
                      value={mappings.penaltiesReceivableAccount ? `${mappings.penaltiesReceivableAccount.name} (${mappings.penaltiesReceivableAccount.glCode ?? "—"})` : "—"}
                    />
                    <InfoRow
                      icon={<Landmark className="h-4 w-4" />}
                      label={t("Interest Payable Account")}
                      value={mappings.interestPayableAccount ? `${mappings.interestPayableAccount.name} (${mappings.interestPayableAccount.glCode ?? "—"})` : "—"}
                    />
                  </>
                )}
                {p.isDormancyTrackingActive && (
                  <InfoRow
                    icon={<Landmark className="h-4 w-4" />}
                    label={t("Escheat Liability Account")}
                    value={mappings.escheatLiabilityAccount ? `${mappings.escheatLiabilityAccount.name} (${mappings.escheatLiabilityAccount.glCode ?? "—"})` : "—"}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {p.charges?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="h-5 w-5 text-[#D32F2F]" />
              {t("Charges")} ({p.charges.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={
                [
                  { key: "name", header: t("Name"), cell: (r: any) => r.name },
                  {
                    key: "amount",
                    header: t("Amount"),
                    cell: (r: any) => <span className="font-mono">{(r.amount ?? 0).toLocaleString()}</span>,
                  },
                  {
                    key: "chargeTimeType",
                    header: t("Time"),
                    cell: (r: any) => r.chargeTimeType?.value ?? "—",
                  },
                  {
                    key: "chargeCalculationType",
                    header: t("Calculation"),
                    cell: (r: any) => r.chargeCalculationType?.value ?? "—",
                  },
                  {
                    key: "isPenalty",
                    header: t("Penalty"),
                    cell: (r: any) => (r.isPenalty ? t("Yes") : t("No")),
                  },
                ] as ColumnDef<any>[]
              }
              data={p.charges}
              emptyState={{ message: t("No charges defined.") }}
              minWidth={600}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SavingsProductDetailPage;
