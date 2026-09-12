import { type FC, useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Pencil, Trash2, Gem, Loader2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createClientCollateralManagementSchema,
  updateClientCollateralManagementSchema,
  type CreateClientCollateralManagementFormValues,
  type UpdateClientCollateralManagementFormValues,
} from "../schemas/clientCollateral.schema";
import {
  useClientCollateralManagements,
  useCreateClientCollateralManagement,
  useUpdateClientCollateralManagement,
  useDeleteClientCollateralManagement,
} from "../hooks/useClientCollateralManagement";
import { useCollateralProducts } from "@/features/collateral-products";
import type { ClientCollateralManagement } from "../types/clientCollateral";

interface ClientCollateralManagementListProps {
  clientId: number;
  onViewDetail?: (collateralId: number) => void;
}

const formatCurrency = (v: number, code = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: code }).format(v);

const ClientCollateralManagementList: FC<ClientCollateralManagementListProps> = ({
  clientId,
  onViewDetail,
}) => {
  const { t } = useTranslation();
  const { data: collaterals = [], isLoading } = useClientCollateralManagements(clientId);
  const { data: products = [] } = useCollateralProducts();
  const createMutation = useCreateClientCollateralManagement();
  const updateMutation = useUpdateClientCollateralManagement();
  const deleteMutation = useDeleteClientCollateralManagement();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ClientCollateralManagement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ClientCollateralManagement | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateClientCollateralManagementFormValues>({
    resolver: zodResolver(createClientCollateralManagementSchema),
    defaultValues: {
      collateralId: undefined as unknown as number,
      quantity: undefined as unknown as number,
    },
  });

  const collateralName = useCallback(
    (id: number) => products.find((o) => o.id === id)?.name ?? `#${id}`,
    [products],
  );

  const openCreate = useCallback(() => {
    setEditing(null);
    reset({ collateralId: undefined as unknown as number, quantity: undefined as unknown as number });
    setDialogOpen(true);
  }, [reset]);

  const openEdit = useCallback(
    (c: ClientCollateralManagement) => {
      setEditing(c);
      reset({ collateralId: c.collateralId, quantity: c.quantity });
      setDialogOpen(true);
    },
    [reset],
  );

  const onSubmit = handleSubmit(async (values) => {
    if (editing) {
      await updateMutation.mutateAsync({
        clientId,
        collateralId: editing.id,
        payload: { quantity: Number(values.quantity), locale: "en" },
      });
    } else {
      await createMutation.mutateAsync({
        clientId,
        payload: {
          collateralId: Number(values.collateralId),
          quantity: Number(values.quantity),
          locale: "en",
        },
      });
    }
    setDialogOpen(false);
  });

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync({ clientId, collateralId: deleteTarget.id });
    setDeleteTarget(null);
  }, [clientId, deleteTarget, deleteMutation]);

  const columns: ColumnDef<ClientCollateralManagement>[] = useMemo(
    () => [
      {
        key: "name",
        header: t("Collateral"),
        accessorFn: (row) => (
          <span className="text-sm font-medium">{row.name ?? collateralName(row.collateralId)}</span>
        ),
      },
      {
        key: "quantity",
        header: t("Quantity"),
        accessorFn: (row) => (
          <span className="text-sm font-mono">
            {row.quantity} {row.unitType}
          </span>
        ),
      },
      {
        key: "basePrice",
        header: t("Base Price"),
        accessorFn: (row) => (
          <span className="text-sm font-mono">{formatCurrency(row.basePrice, row.currency)}</span>
        ),
      },
      {
        key: "pctToBase",
        header: t("Pct to Base"),
        accessorFn: (row) => <span className="text-sm font-mono">{row.pctToBase}%</span>,
      },
      {
        key: "total",
        header: t("Total Value"),
        accessorFn: (row) => (
          <span className="text-sm font-mono">{formatCurrency(row.total, row.currency)}</span>
        ),
      },
      {
        key: "totalCollateral",
        header: t("Total Collateral"),
        accessorFn: (row) => (
          <span className="text-sm font-mono font-semibold">
            {formatCurrency(row.totalCollateral, row.currency)}
          </span>
        ),
      },
      {
        key: "actions",
        header: "",
        accessorFn: (row) => (
          <div className="flex items-center gap-1">
            {onViewDetail && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetail(row.id);
                }}
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                openEdit(row);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteTarget(row);
              }}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        ),
      },
    ],
    [t, collateralName, onViewDetail, openEdit],
  );

  const isMutating = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Gem className="h-5 w-5" />
          {t("Collateral Management")}
        </h3>
        <Button onClick={openCreate} size="sm" className="bg-[#D32F2F] hover:bg-red-700">
          <Plus className="mr-1 h-4 w-4" />
          {t("Add Collateral")}
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={collaterals}
            loading={isLoading}
            minWidth={900}
            emptyState={{
              icon: <Gem className="h-8 w-8 text-gray-300" />,
              message: t("No collateral management products assigned to this client."),
            }}
          />
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? t("Edit Client Collateral") : t("Add Client Collateral")}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? t("Update the collateral quantity for this client.")
                : t("Assign a collateral product to this client with a quantity.")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            {!editing && (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium">{t("Collateral Product")} *</label>
                <Select
                  onValueChange={(v) =>
                    setValue("collateralId", Number(v), { shouldValidate: true })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("Select collateral product")} />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((opt) => (
                      <SelectItem key={opt.id} value={String(opt.id)}>
                        {opt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!editing && errors.collateralId && (
                  <p className="text-xs text-red-500">{errors.collateralId.message}</p>
                )}
              </div>
            )}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("Quantity")} *</label>
              <Input
                type="number"
                step="0.01"
                {...register("quantity", { valueAsNumber: true })}
                disabled={isMutating}
                error={errors.quantity?.message}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={isMutating}>
                {t("Cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting || isMutating} className="bg-[#D32F2F] hover:bg-red-700">
                {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editing ? t("Update") : t("Add Collateral")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title={t("Delete Client Collateral")}
        description={t(
          'Remove "{{name}}" from this client? Cannot delete if collateral is attached to an active loan.',
          { name: deleteTarget?.name ?? (deleteTarget ? collateralName(deleteTarget.collateralId) : "") },
        )}
        onConfirm={handleDelete}
        variant="destructive"
        confirmLabel={t("Delete")}
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default ClientCollateralManagementList;
