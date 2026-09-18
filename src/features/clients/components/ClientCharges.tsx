import { type FC, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Ban, Trash2, Receipt, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataTable } from "@/components/shared/DataTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import type { ColumnDef } from "@/components/shared/DataTable";
import {
  useClientCharges,
  useCreateClientCharge,
  usePayClientCharge,
  useWaiveClientCharge,
  useDeleteClientCharge,
} from "../hooks/useClientCharges";
import { useClientPermissions } from "../hooks/useClientPermissions";
import { useCharges } from "@/features/charges/hooks/useCharges";
import type { ClientCharge, PostClientChargeRequest } from "../api/charges";
import { formatClientDate } from "../utils/client";

const chargeSchema = z.object({
  chargeId: z.number({ message: "Charge is required" }),
  amount: z.number({ message: "Amount is required" }).positive("Amount must be positive"),
  dueDate: z.string().optional(),
});

type ChargeFormValues = z.infer<typeof chargeSchema>;

const formatCurrency = (n?: number) =>
  n != null ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n) : "—";

interface ClientChargesProps {
  clientId: number;
}

const ClientCharges: FC<ClientChargesProps> = ({ clientId }) => {
  const { t } = useTranslation();
  const { hasPermission } = useClientPermissions();
  const { data: chargesData, isLoading } = useClientCharges(clientId);
  const { data: globalCharges } = useCharges();
  const createMutation = useCreateClientCharge();

  const clientChargeOptions = (globalCharges ?? []).filter((c) => c.chargeAppliesTo?.id === 1 && c.active);

  const payMutation = usePayClientCharge();
  const waiveMutation = useWaiveClientCharge();
  const deleteMutation = useDeleteClientCharge();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [payId, setPayId] = useState<number | null>(null);
  const [waiveId, setWaiveId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const charges = chargesData?.pageItems ?? [];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ChargeFormValues>({
    resolver: zodResolver(chargeSchema),
  });

  const openCreate = useCallback(() => {
    reset({ chargeId: undefined as unknown as number, amount: undefined as unknown as number, dueDate: "" });
    setDialogOpen(true);
  }, [reset, setDialogOpen]);

  const onSubmit = useCallback(
    async (values: ChargeFormValues) => {
      const payload: PostClientChargeRequest = {
        chargeId: Number(values.chargeId),
        amount: Number(values.amount),
        dateFormat: "yyyy-MM-dd",
        locale: "en",
        ...(values.dueDate ? { dueDate: values.dueDate } : {}),
      };
      await createMutation.mutateAsync({ clientId, payload });
      setDialogOpen(false);
    },
    [clientId, createMutation, setDialogOpen],
  );

  const handlePay = useCallback(async () => {
    if (!payId) return;
    await payMutation.mutateAsync({ clientId, chargeId: payId });
    setPayId(null);
  }, [clientId, payId, payMutation, setPayId]);

  const handleWaive = useCallback(async () => {
    if (!waiveId) return;
    await waiveMutation.mutateAsync({ clientId, chargeId: waiveId });
    setWaiveId(null);
  }, [clientId, waiveId, waiveMutation, setWaiveId]);

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    await deleteMutation.mutateAsync({ clientId, chargeId: deleteId });
    setDeleteId(null);
  }, [clientId, deleteId, deleteMutation, setDeleteId]);

  const columns: ColumnDef<ClientCharge>[] = [
    {
      key: "name",
      header: t("clients.charges.charge"),
      accessorFn: (row) => <span className="text-sm font-medium">{row.name ?? `#${row.chargeId}`}</span>,
    },
    {
      key: "chargeTimeType",
      header: t("clients.charges.chargeType"),
      accessorFn: (row) => <span className="text-sm">{row.chargeTimeType?.value ?? "—"}</span>,
    },
    {
      key: "amount",
      header: t("clients.charges.amount"),
      accessorFn: (row) => <span className="text-sm font-mono">{formatCurrency(row.amount)}</span>,
    },
    {
      key: "amountPaid",
      header: t("clients.charges.paid"),
      accessorFn: (row) => <span className="text-sm font-mono">{formatCurrency(row.amountPaid)}</span>,
    },
    {
      key: "amountOutstanding",
      header: t("clients.charges.outstanding"),
      accessorFn: (row) => <span className="text-sm font-mono">{formatCurrency(row.amountOutstanding)}</span>,
    },
    {
      key: "dueDate",
      header: t("clients.charges.dueDate"),
      accessorFn: (row) => <span className="text-sm">{formatClientDate(row.dueDate)}</span>,
    },
    {
      key: "isPaid",
      header: t("clients.charges.status"),
      accessorFn: (row) =>
        row.isPaid ? (
          <Badge variant="success" size="sm">
            {t("clients.charges.paid")}
          </Badge>
        ) : row.isWaived ? (
          <Badge variant="default" size="sm">
            {t("clients.charges.waived")}
          </Badge>
        ) : (
          <Badge variant="warning" size="sm">
            {t("clients.charges.pending")}
          </Badge>
        ),
    },
    {
      key: "penalty",
      header: t("clients.charges.penalty"),
      accessorFn: (row) =>
        row.penalty ? (
          <Badge variant="error" size="sm">
            {t("clients.charges.yes")}
          </Badge>
        ) : (
          <span className="text-sm text-gray-400">—</span>
        ),
    },
    {
      key: "actions",
      header: t("clients.charges.actions"),
      accessorFn: (row) => (
        <div className="flex items-center gap-1">
          {!row.isPaid && !row.isWaived && hasPermission("PAY_CHARGE") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setPayId(row.id);
              }}
              title={t("clients.charges.pay")}
            >
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </Button>
          )}
          {!row.isPaid && !row.isWaived && row.waiverable && hasPermission("WAIVE_CHARGE") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setWaiveId(row.id);
              }}
              title={t("clients.charges.waive")}
            >
              <Ban className="h-4 w-4 text-amber-500" />
            </Button>
          )}
          {!row.isPaid && hasPermission("DELETE_CHARGE") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteId(row.id);
              }}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          {t("clients.charges.title")}
        </h3>
        {hasPermission("CREATE_CHARGE") && (
          <Button onClick={openCreate} size="sm" disabled={clientChargeOptions.length === 0}>
            <Plus className="mr-1 h-4 w-4" />
            {t("clients.charges.applyCharge")}
          </Button>
        )}
      </div>
      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={charges}
            loading={isLoading}
            minWidth={800}
            emptyState={{
              icon: <Receipt className="h-8 w-8 text-gray-300" />,
              message: t("clients.charges.noCharges"),
            }}
          />
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("clients.charges.applyCharge")}</DialogTitle>
            <DialogDescription>{t("clients.charges.selectDescription")}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="block text-sm font-medium">{t("clients.charges.chargeType")} *</label>
              <Select onValueChange={(v) => setValue("chargeId", Number(v), { shouldValidate: true })}>
                <SelectTrigger>
                  <SelectValue placeholder={t("clients.charges.selectCharge")} />
                </SelectTrigger>
                <SelectContent>
                  {clientChargeOptions.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name} ({formatCurrency(c.amount)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.chargeId && <p className="text-xs text-red-500">{errors.chargeId.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("clients.charges.amount")} *</label>
              <Input
                type="number"
                step="0.01"
                {...register("amount", { valueAsNumber: true })}
                error={errors.amount?.message}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("clients.charges.dueDate")}</label>
              <Input type="date" {...register("dueDate")} />
            </div>
            <Button type="submit" disabled={createMutation.isPending} className="bg-[#D32F2F] hover:bg-red-700">
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("clients.charges.applyCharge")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!payId}
        onOpenChange={() => setPayId(null)}
        title={t("clients.charges.payCharge")}
        description={t("clients.charges.payConfirmation")}
        onConfirm={handlePay}
        variant="default"
        confirmLabel={t("clients.charges.pay")}
        loading={payMutation.isPending}
      />
      <ConfirmDialog
        open={!!waiveId}
        onOpenChange={() => setWaiveId(null)}
        title={t("clients.charges.waiveCharge")}
        description={t("clients.charges.waiveConfirmation")}
        onConfirm={handleWaive}
        variant="default"
        confirmLabel={t("clients.charges.waive")}
        loading={waiveMutation.isPending}
      />
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title={t("clients.charges.deleteCharge")}
        description={t("clients.charges.deleteConfirmation")}
        onConfirm={handleDelete}
        variant="destructive"
        confirmLabel={t("clients.charges.delete")}
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default ClientCharges;
