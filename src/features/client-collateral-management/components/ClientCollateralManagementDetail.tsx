import { type FC } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Gem, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { useClientCollateralManagement } from "../hooks/useClientCollateralManagement";

interface ClientCollateralManagementDetailProps {
  clientId: number;
  collateralId: number;
}

const formatCurrency = (v: number, code = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: code }).format(v);

const ClientCollateralManagementDetail: FC<ClientCollateralManagementDetailProps> = ({ clientId, collateralId }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: collateral, isLoading } = useClientCollateralManagement(clientId, collateralId);

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl m-auto">
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!collateral) {
    return (
      <div className="p-6">
        <PageHeader title={t("Collateral Not Found")} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl m-auto space-y-6">
      <PageHeader
        title={collateral.name}
        description={t("Client Collateral Management Detail")}
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("Back")}
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Gem className="h-5 w-5" />
            {t("Collateral Details")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-sm text-gray-500">{t("Collateral Product")}</span>
              <p className="font-medium">{collateral.name}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-gray-500">{t("Quantity")}</span>
              <p className="font-medium font-mono">
                {collateral.quantity} {collateral.unitType}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-gray-500">{t("Base Price")}</span>
              <p className="font-medium font-mono">{formatCurrency(collateral.basePrice, collateral.currency)}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-gray-500">{t("Pct to Base")}</span>
              <p className="font-medium font-mono">{collateral.pctToBase}%</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-gray-500">{t("Total Value")}</span>
              <p className="font-medium font-mono">{formatCurrency(collateral.total, collateral.currency)}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-gray-500">{t("Total Collateral")}</span>
              <p className="font-medium font-mono text-green-700">
                {formatCurrency(collateral.totalCollateral, collateral.currency)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {collateral.loanTransactionData && collateral.loanTransactionData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("Associated Loan Transactions")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {collateral.loanTransactionData.map((txn, idx) => (
                <div key={idx} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="text-sm font-medium">
                      {t("Loan")} #{txn.loanId}
                    </p>
                    <p className="text-xs text-gray-500">
                      {txn.date ? new Date(txn.date as string).toLocaleDateString() : "—"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono">
                      {txn.principalPortion != null ? formatCurrency(txn.principalPortion) : "—"}
                    </p>
                    <p className="text-xs text-gray-500">{t("Principal")}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClientCollateralManagementDetail;
