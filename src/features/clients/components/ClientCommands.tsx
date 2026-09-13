import { type FC, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  CheckCircle2,
  XCircle,
  Ban,
  RotateCcw,
  LogOut,
  Undo2,
  Power,
  Loader2,
  UserPlus,
  UserX,
  PiggyBank,
  ArrowLeftRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useRejectClient,
  useWithdrawClient,
  useCloseClient,
  useReactivateClient,
  useUndoRejectClient,
  useUndoWithdrawClient,
} from "../hooks/useClientCommands";
import { useAssignStaff } from "../hooks/useAssignStaff";
import { useUnassignStaff } from "../hooks/useUnassignStaff";
import { useUpdateSavingsAccount } from "../hooks/useUpdateSavingsAccount";
import {
  useProposeClientTransfer,
  useAcceptClientTransfer,
  useRejectClientTransfer,
  useWithdrawClientTransfer,
} from "../hooks/useClientTransfer";
import type { ClientTemplate } from "../types/client";
import {
  rejectClientSchema,
  withdrawClientSchema,
  closeClientSchema,
  reactivateClientSchema,
  undoRejectionSchema,
  undoWithdrawalSchema,
  proposeTransferSchema,
  acceptTransferSchema,
  transferActionSchema,
  type RejectClientFormValues,
  type WithdrawClientFormValues,
  type CloseClientFormValues,
  type ReactivateClientFormValues,
  type UndoRejectClientFormValues,
  type UndoWithdrawClientFormValues,
  type ProposeTransferFormValues,
  type AcceptTransferFormValues,
  type TransferActionFormValues,
} from "../schemas/client.schema";

interface ClientCommandsProps {
  clientId: number;
  status: string;
  displayName: string;
  template?: ClientTemplate;
  currentStaffId?: number | null;
  onSuccess?: () => void;
}

const ClientCommands: FC<ClientCommandsProps> = ({
  clientId,
  status,
  displayName,
  template,
  currentStaffId,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const today = new Date().toISOString().split("T")[0];

  const rejectMutation = useRejectClient();
  const withdrawMutation = useWithdrawClient();
  const closeMutation = useCloseClient();
  const reactivateMutation = useReactivateClient();
  const undoRejectMutation = useUndoRejectClient();
  const undoWithdrawMutation = useUndoWithdrawClient();
  const assignStaffMutation = useAssignStaff();
  const unassignStaffMutation = useUnassignStaff();
  const updateSavingsMutation = useUpdateSavingsAccount();
  const proposeTransferMutation = useProposeClientTransfer();
  const acceptTransferMutation = useAcceptClientTransfer();
  const rejectTransferMutation = useRejectClientTransfer();
  const withdrawTransferMutation = useWithdrawClientTransfer();

  const [dialog, setDialog] = useState<string | null>(null);

  const rejectForm = useForm<RejectClientFormValues>({
    resolver: zodResolver(rejectClientSchema),
    defaultValues: { rejectionDate: today, rejectionReasonId: undefined as unknown as number, dateFormat: "yyyy-MM-dd", locale: "en" },
  });
  const withdrawForm = useForm<WithdrawClientFormValues>({
    resolver: zodResolver(withdrawClientSchema),
    defaultValues: { withdrawalDate: today, withdrawalReasonId: undefined as unknown as number, dateFormat: "yyyy-MM-dd", locale: "en" },
  });
  const closeForm = useForm<CloseClientFormValues>({
    resolver: zodResolver(closeClientSchema),
    defaultValues: { closureDate: today, closureReasonId: undefined as unknown as number, dateFormat: "yyyy-MM-dd", locale: "en" },
  });
  const reactivateForm = useForm<ReactivateClientFormValues>({
    resolver: zodResolver(reactivateClientSchema),
    defaultValues: { reactivationDate: today, dateFormat: "yyyy-MM-dd", locale: "en" },
  });
  const undoRejectForm = useForm<UndoRejectClientFormValues>({
    resolver: zodResolver(undoRejectionSchema),
    defaultValues: { reopenedDate: today, dateFormat: "yyyy-MM-dd", locale: "en" },
  });
  const undoWithdrawForm = useForm<UndoWithdrawClientFormValues>({
    resolver: zodResolver(undoWithdrawalSchema),
    defaultValues: { reopenedDate: today, dateFormat: "yyyy-MM-dd", locale: "en" },
  });
  const transferForm = useForm<ProposeTransferFormValues>({
    resolver: zodResolver(proposeTransferSchema),
    defaultValues: { destinationOfficeId: undefined as unknown as number, dateFormat: "yyyy-MM-dd", locale: "en" },
  });

  const acceptTransferForm = useForm<AcceptTransferFormValues>({
    resolver: zodResolver(acceptTransferSchema),
    defaultValues: { dateFormat: "yyyy-MM-dd", locale: "en" },
  });
  const rejectTransferForm = useForm<TransferActionFormValues>({
    resolver: zodResolver(transferActionSchema),
    defaultValues: { dateFormat: "yyyy-MM-dd", locale: "en" },
  });
  const withdrawTransferForm = useForm<TransferActionFormValues>({
    resolver: zodResolver(transferActionSchema),
    defaultValues: { dateFormat: "yyyy-MM-dd", locale: "en" },
  });

  const [staffDialogOpen, setStaffDialogOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [savingsDialogOpen, setSavingsDialogOpen] = useState(false);
  const [savingsAccountId, setSavingsAccountId] = useState<string>("");

  const handleReject = useCallback(async () => {
    const values = rejectForm.getValues();
    await rejectMutation.mutateAsync({ clientId, payload: values });
    setDialog(null);
    rejectForm.reset();
    onSuccess?.();
  }, [clientId, rejectMutation, rejectForm, onSuccess]);

  const handleWithdraw = useCallback(async () => {
    const values = withdrawForm.getValues();
    await withdrawMutation.mutateAsync({ clientId, payload: values });
    setDialog(null);
    withdrawForm.reset();
    onSuccess?.();
  }, [clientId, withdrawMutation, withdrawForm, onSuccess]);

  const handleClose = useCallback(async () => {
    const values = closeForm.getValues();
    await closeMutation.mutateAsync({ clientId, payload: values });
    setDialog(null);
    closeForm.reset();
    onSuccess?.();
  }, [clientId, closeMutation, closeForm, onSuccess]);

  const handleReactivate = useCallback(async () => {
    const values = reactivateForm.getValues();
    await reactivateMutation.mutateAsync({ clientId, payload: values });
    setDialog(null);
    reactivateForm.reset();
    onSuccess?.();
  }, [clientId, reactivateMutation, reactivateForm, onSuccess]);

  const handleUndoReject = useCallback(async () => {
    const values = undoRejectForm.getValues();
    await undoRejectMutation.mutateAsync({ clientId, payload: values });
    setDialog(null);
    undoRejectForm.reset();
    onSuccess?.();
  }, [clientId, undoRejectMutation, undoRejectForm, onSuccess]);

  const handleUndoWithdraw = useCallback(async () => {
    const values = undoWithdrawForm.getValues();
    await undoWithdrawMutation.mutateAsync({ clientId, payload: values });
    setDialog(null);
    undoWithdrawForm.reset();
    onSuccess?.();
  }, [clientId, undoWithdrawMutation, undoWithdrawForm, onSuccess]);

  const handleAssignStaff = useCallback(async () => {
    if (!selectedStaffId) return;
    await assignStaffMutation.mutateAsync({ clientId, staffId: Number(selectedStaffId) });
    setStaffDialogOpen(false);
    setSelectedStaffId("");
    onSuccess?.();
  }, [clientId, selectedStaffId, assignStaffMutation, onSuccess]);

  const handleUnassignStaff = useCallback(async () => {
    if (!currentStaffId) return;
    await unassignStaffMutation.mutateAsync({ clientId, staffId: currentStaffId });
    onSuccess?.();
  }, [clientId, currentStaffId, unassignStaffMutation, onSuccess]);

  const handleUpdateSavings = useCallback(async () => {
    if (!savingsAccountId) return;
    await updateSavingsMutation.mutateAsync({ clientId, savingsAccountId: Number(savingsAccountId) });
    setSavingsDialogOpen(false);
    setSavingsAccountId("");
    onSuccess?.();
  }, [clientId, savingsAccountId, updateSavingsMutation, onSuccess]);

  const handleProposeTransfer = useCallback(async () => {
    await proposeTransferMutation.mutateAsync({
      clientId,
      payload: {
        destinationOfficeId: transferForm.getValues("destinationOfficeId"),
        transferDate: transferForm.getValues("transferDate"),
        dateFormat: transferForm.getValues("dateFormat") ?? "yyyy-MM-dd",
        locale: transferForm.getValues("locale") ?? "en",
        note: transferForm.getValues("note"),
      },
    });
    setDialog(null);
    transferForm.reset();
    onSuccess?.();
  }, [clientId, proposeTransferMutation, transferForm, onSuccess]);

  const handleAcceptTransfer = useCallback(async () => {
    const values = acceptTransferForm.getValues();
    await acceptTransferMutation.mutateAsync({
      clientId,
      payload: {
        transferDate: values.transferDate,
        dateFormat: values.dateFormat ?? "yyyy-MM-dd",
        locale: values.locale ?? "en",
        note: values.note,
      },
    });
    setDialog(null);
    acceptTransferForm.reset();
    onSuccess?.();
  }, [clientId, acceptTransferMutation, acceptTransferForm, onSuccess]);

  const handleRejectTransfer = useCallback(async () => {
    const values = rejectTransferForm.getValues();
    await rejectTransferMutation.mutateAsync({
      clientId,
      payload: {
        transferDate: values.transferDate,
        dateFormat: values.dateFormat ?? "yyyy-MM-dd",
        locale: values.locale ?? "en",
        note: values.note,
      },
    });
    setDialog(null);
    rejectTransferForm.reset();
    onSuccess?.();
  }, [clientId, rejectTransferMutation, rejectTransferForm, onSuccess]);

  const handleWithdrawTransfer = useCallback(async () => {
    const values = withdrawTransferForm.getValues();
    await withdrawTransferMutation.mutateAsync({
      clientId,
      payload: {
        transferDate: values.transferDate,
        dateFormat: values.dateFormat ?? "yyyy-MM-dd",
        locale: values.locale ?? "en",
        note: values.note,
      },
    });
    setDialog(null);
    withdrawTransferForm.reset();
    onSuccess?.();
  }, [clientId, withdrawTransferMutation, withdrawTransferForm, onSuccess]);

  const isPending = status === "pending";
  const isActive = status === "active";
  const isClosed = status === "closed";
  const isRejected = status === "rejected";
  const isWithdrawn = status === "withdrawn";
  const isTransferInProgress = status === "transfer in progress";

  const anyLoading =
    rejectMutation.isPending ||
    withdrawMutation.isPending ||
    closeMutation.isPending ||
    reactivateMutation.isPending ||
    undoRejectMutation.isPending ||
    undoWithdrawMutation.isPending ||
    assignStaffMutation.isPending ||
    unassignStaffMutation.isPending ||
    updateSavingsMutation.isPending ||
    proposeTransferMutation.isPending ||
    acceptTransferMutation.isPending ||
    rejectTransferMutation.isPending ||
    withdrawTransferMutation.isPending;

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {/* Lifecycle commands */}
        {isPending && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDialog("reject")}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <XCircle className="mr-1 h-4 w-4" />
              {t("clients.commands.reject")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDialog("withdraw")}
              className="text-amber-600 border-amber-200 hover:bg-amber-50"
            >
              <Ban className="mr-1 h-4 w-4" />
              {t("clients.commands.withdraw")}
            </Button>
          </>
        )}
        {isActive && (
          <Button variant="outline" size="sm" onClick={() => setDialog("close")} className="text-gray-600">
            <LogOut className="mr-1 h-4 w-4" />
            {t("clients.commands.close")}
          </Button>
        )}
        {isClosed && (
          <Button variant="outline" size="sm" onClick={() => setDialog("reactivate")}>
            <Power className="mr-1 h-4 w-4" />
            {t("clients.commands.reactivate")}
          </Button>
        )}
        {isRejected && (
          <Button variant="outline" size="sm" onClick={() => setDialog("undoreject")}>
            <Undo2 className="mr-1 h-4 w-4" />
            {t("clients.commands.undoReject")}
          </Button>
        )}
        {isWithdrawn && (
          <Button variant="outline" size="sm" onClick={() => setDialog("undowithdraw")}>
            <RotateCcw className="mr-1 h-4 w-4" />
            {t("clients.commands.undoWithdraw")}
          </Button>
        )}

        {/* Staff commands */}
        {isActive && (
          <>
            <Button variant="outline" size="sm" onClick={() => setStaffDialogOpen(true)}>
              <UserPlus className="mr-1 h-4 w-4" />
              {currentStaffId ? t("clients.commands.changeStaff") : t("clients.commands.assignStaff")}
            </Button>
            {currentStaffId && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleUnassignStaff}
                className="text-gray-600"
                disabled={anyLoading}
              >
                <UserX className="mr-1 h-4 w-4" />
                {t("clients.commands.unassignStaff")}
              </Button>
            )}
          </>
        )}

        {/* Savings account command */}
        {isActive && (
          <Button variant="outline" size="sm" onClick={() => setSavingsDialogOpen(true)}>
            <PiggyBank className="mr-1 h-4 w-4" />
            {t("clients.commands.updateSavings")}
          </Button>
        )}

        {/* Transfer commands */}
        {isActive && !isTransferInProgress && (
          <Button variant="outline" size="sm" onClick={() => setDialog("proposeTransfer")}>
            <ArrowLeftRight className="mr-1 h-4 w-4" />
            {t("clients.commands.proposeTransfer")}
          </Button>
        )}
        {isTransferInProgress && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDialog("acceptTransfer")}
              className="text-emerald-600"
              disabled={anyLoading}
            >
              <CheckCircle2 className="mr-1 h-4 w-4" />
              {t("clients.commands.acceptTransfer")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDialog("rejectTransfer")}
              className="text-red-600"
              disabled={anyLoading}
            >
              <XCircle className="mr-1 h-4 w-4" />
              {t("clients.commands.rejectTransfer")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDialog("withdrawTransfer")}
              className="text-amber-600"
              disabled={anyLoading}
            >
              <Ban className="mr-1 h-4 w-4" />
              {t("clients.commands.withdrawTransfer")}
            </Button>
          </>
        )}
      </div>

      {/* Reject Dialog */}
      <Dialog open={dialog === "reject"} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("clients.commands.reject")}</DialogTitle>
            <DialogDescription>{t("clients.commands.rejectDescription", { name: displayName })}</DialogDescription>
          </DialogHeader>
          <form onSubmit={rejectForm.handleSubmit(handleReject)} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="block text-sm font-medium">{t("clients.commands.rejectionDate")} *</label>
              <Input type="date" {...rejectForm.register("rejectionDate")} />
              {rejectForm.formState.errors.rejectionDate && (
                <p className="text-xs text-red-500">{rejectForm.formState.errors.rejectionDate.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="block text-sm font-medium">{t("clients.commands.rejectionReason")} *</label>
              <Select
                onValueChange={(v) => rejectForm.setValue("rejectionReasonId", Number(v), { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("clients.commands.selectReason")} />
                </SelectTrigger>
                <SelectContent>
                  {template?.rejectionReasons?.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {rejectForm.formState.errors.rejectionReasonId && (
                <p className="text-xs text-red-500">{rejectForm.formState.errors.rejectionReasonId.message}</p>
              )}
            </div>
            <Button type="submit" disabled={rejectMutation.isPending} variant="destructive">
              {rejectMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("clients.commands.reject")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={dialog === "withdraw"} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("clients.commands.withdraw")}</DialogTitle>
            <DialogDescription>{t("clients.commands.withdrawDescription", { name: displayName })}</DialogDescription>
          </DialogHeader>
          <form onSubmit={withdrawForm.handleSubmit(handleWithdraw)} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="block text-sm font-medium">{t("clients.commands.withdrawalDate")} *</label>
              <Input type="date" {...withdrawForm.register("withdrawalDate")} />
              {withdrawForm.formState.errors.withdrawalDate && (
                <p className="text-xs text-red-500">{withdrawForm.formState.errors.withdrawalDate.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="block text-sm font-medium">{t("clients.commands.withdrawalReason")} *</label>
              <Select
                onValueChange={(v) => withdrawForm.setValue("withdrawalReasonId", Number(v), { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("clients.commands.selectReason")} />
                </SelectTrigger>
                <SelectContent>
                  {template?.withdrawalReasons?.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {withdrawForm.formState.errors.withdrawalReasonId && (
                <p className="text-xs text-red-500">{withdrawForm.formState.errors.withdrawalReasonId.message}</p>
              )}
            </div>
            <Button type="submit" disabled={withdrawMutation.isPending} variant="destructive">
              {withdrawMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("clients.commands.withdraw")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Close Dialog */}
      <Dialog open={dialog === "close"} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("clients.commands.close")}</DialogTitle>
            <DialogDescription>{t("clients.commands.closeDescription", { name: displayName })}</DialogDescription>
          </DialogHeader>
          <form onSubmit={closeForm.handleSubmit(handleClose)} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="block text-sm font-medium">{t("clients.commands.closureDate")} *</label>
              <Input type="date" {...closeForm.register("closureDate")} />
              {closeForm.formState.errors.closureDate && (
                <p className="text-xs text-red-500">{closeForm.formState.errors.closureDate.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="block text-sm font-medium">{t("clients.commands.closureReason")} *</label>
              <Select
                onValueChange={(v) => closeForm.setValue("closureReasonId", Number(v), { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("clients.commands.selectReason")} />
                </SelectTrigger>
                <SelectContent>
                  {template?.closureReasons?.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {closeForm.formState.errors.closureReasonId && (
                <p className="text-xs text-red-500">{closeForm.formState.errors.closureReasonId.message}</p>
              )}
            </div>
            <Button type="submit" disabled={closeMutation.isPending} variant="destructive">
              {closeMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("clients.commands.close")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reactivate Dialog */}
      <Dialog open={dialog === "reactivate"} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("clients.commands.reactivate")}</DialogTitle>
            <DialogDescription>{t("clients.commands.reactivateDescription", { name: displayName })}</DialogDescription>
          </DialogHeader>
          <form onSubmit={reactivateForm.handleSubmit(handleReactivate)} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="block text-sm font-medium">{t("clients.commands.reactivationDate")} *</label>
              <Input type="date" {...reactivateForm.register("reactivationDate")} />
              {reactivateForm.formState.errors.reactivationDate && (
                <p className="text-xs text-red-500">{reactivateForm.formState.errors.reactivationDate.message}</p>
              )}
            </div>
            <Button type="submit" disabled={reactivateMutation.isPending}>
              {reactivateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("clients.commands.reactivate")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Undo Reject Dialog */}
      <Dialog open={dialog === "undoreject"} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("clients.commands.undoReject")}</DialogTitle>
            <DialogDescription>{t("clients.commands.undoRejectDescription", { name: displayName })}</DialogDescription>
          </DialogHeader>
          <form onSubmit={undoRejectForm.handleSubmit(handleUndoReject)} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="block text-sm font-medium">{t("clients.commands.reopenedDate")} *</label>
              <Input type="date" {...undoRejectForm.register("reopenedDate")} />
              {undoRejectForm.formState.errors.reopenedDate && (
                <p className="text-xs text-red-500">{undoRejectForm.formState.errors.reopenedDate.message}</p>
              )}
            </div>
            <Button type="submit" disabled={undoRejectMutation.isPending}>
              {undoRejectMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("clients.commands.undoReject")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Undo Withdraw Dialog */}
      <Dialog open={dialog === "undowithdraw"} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("clients.commands.undoWithdraw")}</DialogTitle>
            <DialogDescription>{t("clients.commands.undoWithdrawDescription", { name: displayName })}</DialogDescription>
          </DialogHeader>
          <form onSubmit={undoWithdrawForm.handleSubmit(handleUndoWithdraw)} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="block text-sm font-medium">{t("clients.commands.reopenedDate")} *</label>
              <Input type="date" {...undoWithdrawForm.register("reopenedDate")} />
              {undoWithdrawForm.formState.errors.reopenedDate && (
                <p className="text-xs text-red-500">{undoWithdrawForm.formState.errors.reopenedDate.message}</p>
              )}
            </div>
            <Button type="submit" disabled={undoWithdrawMutation.isPending}>
              {undoWithdrawMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("clients.commands.undoWithdraw")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Staff dialog */}
      <Dialog open={staffDialogOpen} onOpenChange={setStaffDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentStaffId ? t("clients.commands.changeStaff") : t("clients.commands.assignStaff")}</DialogTitle>
            <DialogDescription>{t("clients.commands.assignStaffDescription", { name: displayName })}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="block text-sm font-medium">{t("clients.commands.staffLoanOfficer")}</label>
              <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                <SelectTrigger>
                  <SelectValue placeholder={t("clients.commands.selectStaff")} />
                </SelectTrigger>
                <SelectContent>
                  {template?.staffOptions?.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAssignStaff} disabled={!selectedStaffId || assignStaffMutation.isPending}>
              {assignStaffMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("clients.commands.assign")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Update Savings Account dialog */}
      <Dialog open={savingsDialogOpen} onOpenChange={setSavingsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("clients.commands.updateDefaultSavingsAccount")}</DialogTitle>
            <DialogDescription>{t("clients.commands.savingsDescription", { name: displayName })}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="block text-sm font-medium" htmlFor="savingsAccountId">
                {t("clients.commands.savingsAccountId")}
              </label>
              <Input
                id="savingsAccountId"
                type="number"
                value={savingsAccountId}
                onChange={(e) => setSavingsAccountId(e.target.value)}
                placeholder={t("clients.commands.savingsAccountPlaceholder")}
              />
            </div>
            <Button onClick={handleUpdateSavings} disabled={!savingsAccountId || updateSavingsMutation.isPending}>
              {updateSavingsMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("clients.commands.update")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Propose Transfer dialog */}
      <Dialog open={dialog === "proposeTransfer"} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("clients.commands.proposeTransfer")}</DialogTitle>
            <DialogDescription>{t("clients.commands.transferDescription", { name: displayName })}</DialogDescription>
          </DialogHeader>
          <form onSubmit={transferForm.handleSubmit(handleProposeTransfer)} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="block text-sm font-medium">{t("clients.commands.destinationOffice")} *</label>
              <Select
                onValueChange={(v) => transferForm.setValue("destinationOfficeId", Number(v), { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("clients.commands.selectOffice")} />
                </SelectTrigger>
                <SelectContent>
                  {template?.officeOptions?.map((o) => (
                    <SelectItem key={o.id} value={String(o.id)}>
                      {o.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {transferForm.formState.errors.destinationOfficeId && (
                <p className="text-xs text-red-500">{transferForm.formState.errors.destinationOfficeId.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="block text-sm font-medium" htmlFor="transferDate">
                {t("clients.commands.transferDate")}
              </label>
              <Input id="transferDate" type="date" {...transferForm.register("transferDate")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="block text-sm font-medium" htmlFor="transferNote">
                {t("clients.commands.note")}
              </label>
              <Input id="transferNote" {...transferForm.register("note")} placeholder={t("clients.commands.optionalNote")} />
            </div>
            <Button
              type="submit"
              disabled={!transferForm.getValues("destinationOfficeId") || proposeTransferMutation.isPending}
            >
              {proposeTransferMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("clients.commands.proposeTransfer")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Accept Transfer dialog */}
      <Dialog open={dialog === "acceptTransfer"} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("clients.commands.acceptTransfer")}</DialogTitle>
            <DialogDescription>{t("clients.commands.acceptTransferDescription", { name: displayName })}</DialogDescription>
          </DialogHeader>
          <form onSubmit={acceptTransferForm.handleSubmit(handleAcceptTransfer)} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="block text-sm font-medium" htmlFor="acceptTransferDate">
                {t("clients.commands.transferDate")}
              </label>
              <Input id="acceptTransferDate" type="date" {...acceptTransferForm.register("transferDate")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="block text-sm font-medium" htmlFor="acceptTransferNote">
                {t("clients.commands.note")}
              </label>
              <Input id="acceptTransferNote" {...acceptTransferForm.register("note")} placeholder={t("clients.commands.optionalNote")} />
            </div>
            <Button type="submit" disabled={acceptTransferMutation.isPending}>
              {acceptTransferMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("clients.commands.acceptTransfer")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reject Transfer dialog */}
      <Dialog open={dialog === "rejectTransfer"} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("clients.commands.rejectTransfer")}</DialogTitle>
            <DialogDescription>{t("clients.commands.rejectTransferDescription", { name: displayName })}</DialogDescription>
          </DialogHeader>
          <form onSubmit={rejectTransferForm.handleSubmit(handleRejectTransfer)} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="block text-sm font-medium" htmlFor="rejectTransferDate">
                {t("clients.commands.transferDate")}
              </label>
              <Input id="rejectTransferDate" type="date" {...rejectTransferForm.register("transferDate")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="block text-sm font-medium" htmlFor="rejectTransferNote">
                {t("clients.commands.note")}
              </label>
              <Input id="rejectTransferNote" {...rejectTransferForm.register("note")} placeholder={t("clients.commands.optionalNote")} />
            </div>
            <Button type="submit" disabled={rejectTransferMutation.isPending} variant="destructive">
              {rejectTransferMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("clients.commands.rejectTransfer")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Withdraw Transfer dialog */}
      <Dialog open={dialog === "withdrawTransfer"} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("clients.commands.withdrawTransfer")}</DialogTitle>
            <DialogDescription>{t("clients.commands.withdrawTransferDescription", { name: displayName })}</DialogDescription>
          </DialogHeader>
          <form onSubmit={withdrawTransferForm.handleSubmit(handleWithdrawTransfer)} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="block text-sm font-medium" htmlFor="withdrawTransferDate">
                {t("clients.commands.transferDate")}
              </label>
              <Input id="withdrawTransferDate" type="date" {...withdrawTransferForm.register("transferDate")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="block text-sm font-medium" htmlFor="withdrawTransferNote">
                {t("clients.commands.note")}
              </label>
              <Input id="withdrawTransferNote" {...withdrawTransferForm.register("note")} placeholder={t("clients.commands.optionalNote")} />
            </div>
            <Button type="submit" disabled={withdrawTransferMutation.isPending} variant="destructive">
              {withdrawTransferMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("clients.commands.withdrawTransfer")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ClientCommands;
