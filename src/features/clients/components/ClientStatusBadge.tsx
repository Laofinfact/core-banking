import type { FC } from "react";
import { Badge } from "@/components/ui/badge";
import { CLIENT_STATUS_CONFIG } from "../constants/status";

interface ClientStatusBadgeProps {
  status: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const ClientStatusBadge: FC<ClientStatusBadgeProps> = ({ status, size = "md", className }) => {
  const config = CLIENT_STATUS_CONFIG[status] ?? { variant: "default" as const, label: status };

  return (
    <Badge variant={config.variant} size={size} rounded className={className}>
      {config.label}
    </Badge>
  );
};

export default ClientStatusBadge;
