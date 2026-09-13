import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/shared/DataTable";
import type { ColumnDef } from "@/components/shared/DataTable";
import { useClientObligeeDetails } from "../hooks/useClientObligee";
import type { ClientObligeeDetails as ClientObligeeDetail } from "../api/obligee";

interface ClientObligeeDetailsProps {
  clientId: number;
}

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n);

const ClientObligeeDetails: FC<ClientObligeeDetailsProps> = ({ clientId }) => {
  const { t } = useTranslation();
  const { data, isLoading } = useClientObligeeDetails(clientId);
  const obligees = data?.obligeeDetails ?? [];

  const columns: ColumnDef<ClientObligeeDetail>[] = [
    {
      key: "loanAccountNumber",
      header: t("clients.obligee.loanAccount"),
      accessorFn: (row) => <span className="text-sm font-mono">{row.loanAccountNumber}</span>,
    },
    {
      key: "displayName",
      header: t("clients.obligee.borrower"),
      accessorFn: (row) => <span className="text-sm font-medium">{row.displayName}</span>,
    },
    {
      key: "actualAmount",
      header: t("clients.obligee.actualAmount"),
      accessorFn: (row) => <span className="text-sm">{formatCurrency(row.actualAmount)}</span>,
    },
    {
      key: "pendingAmount",
      header: t("clients.obligee.pendingAmount"),
      accessorFn: (row) => <span className="text-sm">{formatCurrency(row.pendingAmount)}</span>,
    },
    {
      key: "disbursedAmount",
      header: t("clients.obligee.disbursedAmount"),
      accessorFn: (row) => <span className="text-sm">{formatCurrency(row.disbursedAmount)}</span>,
    },
    {
      key: "totalAmount",
      header: t("clients.obligee.totalAmount"),
      accessorFn: (row) => <span className="text-sm font-semibold">{formatCurrency(row.totalAmount)}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium flex items-center gap-2">
        <ShieldCheck className="h-5 w-5" />
        {t("clients.obligee.title")}
      </h3>
      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={obligees}
            loading={isLoading}
            minWidth={700}
            emptyState={{
              icon: <ShieldCheck className="h-8 w-8 text-gray-300" />,
              message: t("clients.obligee.noObligees"),
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientObligeeDetails;
