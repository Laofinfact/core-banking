import { type FC } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Gem } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { ClientCollateralManagementList } from "@/features/client-collateral-management";

const ClientCollateralManagementListPage: FC = () => {
  const { t } = useTranslation();
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();

  if (!clientId) return null;

  const clientIdNum = Number(clientId);

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={t("Client Collateral Management")}
        description={t("Manage collateral products assigned to this client")}
        actions={
          <Button variant="outline" onClick={() => navigate(`/clients/${clientId}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("Back to Client")}
          </Button>
        }
      />
      <ClientCollateralManagementList
        clientId={clientIdNum}
        onViewDetail={(collateralId) => navigate(`/clients/${clientId}/collaterals/${collateralId}`)}
      />
    </div>
  );
};

export default ClientCollateralManagementListPage;
