import { type FC } from "react";
import { useParams } from "react-router-dom";
import ClientCollateralManagementDetail from "./ClientCollateralManagementDetail";

const ClientCollateralManagementDetailWrapper: FC = () => {
  const { clientId, collateralId } = useParams<{ clientId: string; collateralId: string }>();

  if (!clientId || !collateralId) return null;

  return (
    <ClientCollateralManagementDetail
      clientId={Number(clientId)}
      collateralId={Number(collateralId)}
    />
  );
};

export default ClientCollateralManagementDetailWrapper;
