import { z } from "zod";
import i18n from "@/i18n";

export const createClientCollateralManagementSchema = z.object({
  collateralId: z.number({ message: i18n.t("Collateral product is required") }).int().positive(),
  quantity: z
    .number({ message: i18n.t("Quantity is required") })
    .positive(i18n.t("Quantity must be greater than 0")),
});

export const updateClientCollateralManagementSchema = z.object({
  quantity: z
    .number({ message: i18n.t("Quantity is required") })
    .positive(i18n.t("Quantity must be greater than 0")),
});

export type CreateClientCollateralManagementFormValues = z.infer<
  typeof createClientCollateralManagementSchema
>;
export type UpdateClientCollateralManagementFormValues = z.infer<
  typeof updateClientCollateralManagementSchema
>;
