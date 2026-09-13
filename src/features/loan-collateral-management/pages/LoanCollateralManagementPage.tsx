import { type FC } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { LoanCollateralManagementCard } from "@/features/loan-collateral-management";

interface LoanCollateralManagementPageProps {
  loanId?: number;
  currencyCode?: string;
}

const LoanCollateralManagementPage: FC<LoanCollateralManagementPageProps> = ({ currencyCode = "USD" }) => {
  const { t } = useTranslation();
  const { loanId } = useParams<{ loanId: string }>();
  const navigate = useNavigate();

  if (!loanId) return null;

  const loanIdNum = Number(loanId);

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={t("Loan Collateral Management")}
        description={t("Collateral management products linked to this loan")}
        actions={
          <Button variant="outline" onClick={() => navigate(`/loans/view/${loanId}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("Back to Loan")}
          </Button>
        }
      />
      <LoanCollateralManagementCard
        loanId={loanIdNum}
        currencyCode={currencyCode}
      />
    </div>
  );
};

export default LoanCollateralManagementPage;
