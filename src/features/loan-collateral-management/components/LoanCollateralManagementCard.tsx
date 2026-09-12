import { type FC, useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Trash2, Gem, Loader2, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import {
  useLoanCollateralManagements,
  useDeleteLoanCollateralManagement,
} from "../hooks/useLoanCollateralManagement";
import type { LoanCollateralManagement } from "../types/loanCollateralManagement";

interface LoanCollateralManagementCardProps {
  loanId: number;
  currencyCode?: string;
}

const LoanCollateralManagementCard: FC<LoanCollateralManagementCardProps> = ({
  loanId,
  currencyCode = "USD",
}) => {
  const { t } = useTranslation();
  const { data: collaterals = [], isLoading } = useLoanCollateralManagements(loanId);
  const deleteMutation = useDeleteLoanCollateralManagement();
  const [deleteTarget, setDeleteTarget] = useState<LoanCollateralManagement | null>(null);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync({ loanId, collateralId: deleteTarget.id });
    setDeleteTarget(null);
  }, [loanId, deleteTarget, deleteMutation]);

  const columns = useMemo(
    () => [
      { key: "name", header: t("Collateral") },
      { key: "quantity", header: t("Quantity") },
      { key: "total", header: t("Total Value") },
      { key: "totalCollateral", header: t("Total Collateral") },
      { key: "status", header: t("Status") },
      { key: "actions", header: "" },
    ],
    [t],
  );

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: currencyCode }).format(v);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-gray-400" />
            {t("Loan Collateral Management")} ({collaterals.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : collaterals.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-gray-400">
              {t("No collateral management items linked to this loan.")}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("Collateral")}</TableHead>
                  <TableHead>{t("Quantity")}</TableHead>
                  <TableHead className="text-right">{t("Total Value")}</TableHead>
                  <TableHead className="text-right">{t("Total Collateral")}</TableHead>
                  <TableHead>{t("Status")}</TableHead>
                  <TableHead className="text-right">{t("Actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collaterals.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-sm font-medium">
                      {item.collateralName ?? `#${item.clientCollateralId}`}
                    </TableCell>
                    <TableCell className="text-sm font-mono">
                      {item.quantity} {item.unitType ?? ""}
                    </TableCell>
                    <TableCell className="text-right text-sm font-mono">
                      {formatCurrency(item.total)}
                    </TableCell>
                    <TableCell className="text-right text-sm font-mono font-semibold text-green-700">
                      {formatCurrency(item.totalCollateral)}
                    </TableCell>
                    <TableCell>
                      {item.isReleased ? (
                        <Badge variant="info">{t("Released")}</Badge>
                      ) : (
                        <Badge variant="success">{t("Active")}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(item)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title={t("Remove Loan Collateral")}
        description={t(
          'Remove "{{name}}" from this loan? The quantity will be returned to the client\'s collateral.',
          { name: deleteTarget?.collateralName ?? `#${deleteTarget?.clientCollateralId}` },
        )}
        onConfirm={handleDelete}
        variant="destructive"
        confirmLabel={t("Remove")}
        loading={deleteMutation.isPending}
      />
    </>
  );
};

export default LoanCollateralManagementCard;
