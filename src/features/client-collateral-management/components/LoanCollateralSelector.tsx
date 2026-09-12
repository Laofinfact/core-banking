import { type FC, useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useClientCollateralTemplate } from "../hooks/useClientCollateralManagement";
import type { LoanCollateralTemplate } from "../types/clientCollateral";
import type { LoanCollateralManagementCreateRequest } from "@/features/loan-collateral-management";

interface LoanCollateralSelectorProps {
  clientId: number | undefined;
  disabled?: boolean;
  collateralItems: LoanCollateralManagementCreateRequest[];
  onCollateralItemsChange: (items: LoanCollateralManagementCreateRequest[]) => void;
}

const LoanCollateralSelector: FC<LoanCollateralSelectorProps> = ({
  clientId,
  disabled,
  collateralItems,
  onCollateralItemsChange,
}) => {
  const { t } = useTranslation();
  const { data: template = [] } = useClientCollateralTemplate(clientId);
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const templateMap = useMemo(() => {
    const map: Record<number, LoanCollateralTemplate> = {};
    template.forEach((item) => {
      map[item.collateralId] = item;
    });
    return map;
  }, [template]);

  const handleAddCollateral = useCallback(
    (collateralId: number) => {
      if (collateralItems.some((c) => c.clientCollateralId === collateralId)) return;
      const newItem: LoanCollateralManagementCreateRequest = {
        clientCollateralId: collateralId,
        quantity: quantities[collateralId] ?? 1,
        locale: "en",
      };
      onCollateralItemsChange([...collateralItems, newItem]);
    },
    [collateralItems, quantities, onCollateralItemsChange],
  );

  const handleRemoveCollateral = useCallback(
    (collateralId: number) => {
      onCollateralItemsChange(collateralItems.filter((c) => c.clientCollateralId !== collateralId));
    },
    [collateralItems, onCollateralItemsChange],
  );

  const handleQuantityChange = useCallback(
    (collateralId: number, quantity: number) => {
      setQuantities((prev) => ({ ...prev, [collateralId]: quantity }));
      onCollateralItemsChange(
        collateralItems.map((c) =>
          c.clientCollateralId === collateralId ? { ...c, quantity } : c,
        ),
      );
    },
    [collateralItems, onCollateralItemsChange],
  );

  const availableCollaterals = template.filter(
    (item) => !collateralItems.some((c) => c.clientCollateralId === item.collateralId),
  );

  if (!clientId) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" />
          {t("Collateral Management Products")}
        </CardTitle>
        {!disabled && availableCollaterals.length > 0 && (
          <Select
            value=""
            onValueChange={(v) => {
              if (v) handleAddCollateral(Number(v));
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t("Add collateral product")} />
            </SelectTrigger>
            <SelectContent>
              {availableCollaterals.map((item) => (
                <SelectItem key={item.collateralId} value={String(item.collateralId)}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {collateralItems.length === 0 ? (
          <p className="text-center text-sm text-gray-400">
            {t("No collateral management products selected. These are optional.")}
          </p>
        ) : (
          collateralItems.map((item) => {
            const collateralTemplate = templateMap[item.clientCollateralId];
            const maxQuantity = collateralTemplate?.quantity ?? 0;
            const errorMessage =
              item.quantity > maxQuantity ? t("Quantity cannot exceed available: {{max}}", { max: maxQuantity }) : null;

            return (
              <div key={item.clientCollateralId} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {collateralTemplate?.name ?? `#${item.clientCollateralId}`}
                    </span>
                    {collateralTemplate && (
                      <span className="text-xs text-gray-500">
                        ({t("Available")}: {collateralTemplate.quantity} {collateralTemplate.basePrice && `@ ${collateralTemplate.basePrice}`})
                      </span>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCollateral(item.clientCollateralId)}
                    disabled={disabled}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium">
                      {t("Quantity")} {collateralTemplate ? `(${t("max")}: ${maxQuantity})` : ""} *
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.quantity || ""}
                      onChange={(e) => handleQuantityChange(item.clientCollateralId, Number(e.target.value))}
                      disabled={disabled}
                      placeholder={t("Enter quantity")}
                    />
                    {errorMessage && <p className="text-xs text-red-500">{errorMessage}</p>}
                  </div>
                  {collateralTemplate && (
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium">{t("Est. Total Collateral")}</label>
                      <div className="pt-2 text-sm font-mono font-semibold text-green-700">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format(
                          item.quantity *
                            collateralTemplate.basePrice *
                            (collateralTemplate.pctToBase / 100),
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default LoanCollateralSelector;
