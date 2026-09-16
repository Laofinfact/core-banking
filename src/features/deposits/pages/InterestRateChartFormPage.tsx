import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Loader2, Plus, Trash2, Pencil, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  useInterestRateChart,
  useCreateInterestRateChart,
  useUpdateInterestRateChart,
  useInterestRateChartTemplate,
  useChartSlabs,
  useChartSlabTemplate,
  useCreateChartSlab,
  useUpdateChartSlab,
  useDeleteChartSlab,
} from "@/features/deposits/hooks/useInterestRateCharts";
import type { InterestRateChartSlab, InterestRateChartTemplate } from "@/features/deposits/api/deposit";

interface SlabForm {
  description: string;
  periodType: string;
  fromPeriod: number | null;
  toPeriod: number | null;
  amountRangeFrom: number | null;
  amountRangeTo: number | null;
  annualInterestRate: number;
  currencyCode: string;
}

const emptySlab = (template?: InterestRateChartTemplate, currencyCode = "USD"): SlabForm => ({
  description: "",
  periodType: String(template?.periodTypes?.[0]?.id ?? 2),
  fromPeriod: null,
  toPeriod: null,
  amountRangeFrom: null,
  amountRangeTo: null,
  annualInterestRate: 0,
  currencyCode,
});

const InterestRateChartFormPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const chartId = id ? Number(id) : undefined;

  const { data: existingChart, isLoading: chartLoading } = useInterestRateChart(chartId);
  const { data: template } = useInterestRateChartTemplate();
  const { data: slabTemplate } = useChartSlabTemplate(chartId);
  const { data: slabs = [], isLoading: slabsLoading } = useChartSlabs(chartId);
  const createMutation = useCreateInterestRateChart();
  const updateMutation = useUpdateInterestRateChart();
  const createSlabMutation = useCreateChartSlab();
  const updateSlabMutation = useUpdateChartSlab();
  const deleteSlabMutation = useDeleteChartSlab();

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    fromDate: "",
    endDate: "",
    isPrimaryGroupingByAmount: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const [slabDialogOpen, setSlabDialogOpen] = useState(false);
  const [editingSlab, setEditingSlab] = useState<InterestRateChartSlab | null>(null);
  const [slabForm, setSlabForm] = useState<SlabForm>(emptySlab(template));
  const [slabErrors, setSlabErrors] = useState<Record<string, string>>({});
  const [savingSlab, setSavingSlab] = useState(false);
  const [deleteSlabTarget, setDeleteSlabTarget] = useState<InterestRateChartSlab | null>(null);

  useEffect(() => {
    if (!existingChart) return;
    setForm({
      name: existingChart.name ?? "",
      description: existingChart.description ?? "",
      fromDate: existingChart.fromDate ?? "",
      endDate: existingChart.endDate ?? "",
      isPrimaryGroupingByAmount: existingChart.isPrimaryGroupingByAmount ?? false,
    });
  }, [existingChart]);

  useEffect(() => {
    if (!template) return;
    setSlabForm((prev) => ({
      ...prev,
      periodType: prev.periodType || String(template.periodTypes?.[0]?.id ?? 2),
    }));
  }, [template]);

  const updateForm = (field: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = t("Name is required");
    if (!form.fromDate.trim()) e.fromDate = t("From date is required");
    if (form.endDate && form.fromDate && form.endDate < form.fromDate) {
      e.endDate = t("End date must be after from date");
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateSlab = (): boolean => {
    const e: Record<string, string> = {};
    if (!slabForm.periodType) e.periodType = t("Period type is required");
    if (slabForm.fromPeriod == null) e.fromPeriod = t("From period is required");
    if (slabForm.annualInterestRate == null || slabForm.annualInterestRate < 0) {
      e.annualInterestRate = t("Annual interest rate must be non-negative");
    }
    if (
      slabForm.fromPeriod != null &&
      slabForm.toPeriod != null &&
      slabForm.fromPeriod > slabForm.toPeriod
    ) {
      e.toPeriod = t("To period must be greater than or equal to from period");
    }
    if (
      slabForm.amountRangeFrom != null &&
      slabForm.amountRangeTo != null &&
      slabForm.amountRangeFrom > slabForm.amountRangeTo
    ) {
      e.amountRangeTo = t("Amount range to must be greater than or equal to amount range from");
    }
    setSlabErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setFormError(null);
    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        description: form.description || undefined,
        fromDate: form.fromDate,
        endDate: form.endDate || undefined,
        isPrimaryGroupingByAmount: form.isPrimaryGroupingByAmount,
        dateFormat: "yyyy-MM-dd",
        locale: "en",
      };

      if (isEdit) {
        await updateMutation.mutateAsync({ chartId: chartId!, payload });
        navigate("/interest-rate-charts");
      } else {
        const result = await createMutation.mutateAsync(payload);
        navigate(`/interest-rate-charts/${result.resourceId}`);
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t("Failed to save chart"));
    } finally {
      setSaving(false);
    }
  };

  const openAddSlab = () => {
    setEditingSlab(null);
    setSlabForm(emptySlab(template));
    setSlabErrors({});
    setSlabDialogOpen(true);
  };

  const openEditSlab = (slab: InterestRateChartSlab) => {
    setEditingSlab(slab);
    setSlabForm({
      description: slab.description ?? "",
      periodType: String(slab.periodType?.id ?? 2),
      fromPeriod: slab.fromPeriod,
      toPeriod: slab.toPeriod,
      amountRangeFrom: slab.amountRangeFrom ?? null,
      amountRangeTo: slab.amountRangeTo ?? null,
      annualInterestRate: slab.annualInterestRate,
      currencyCode: slab.currencyCode ?? "USD",
    });
    setSlabErrors({});
    setSlabDialogOpen(true);
  };

  const handleSaveSlab = async () => {
    if (!chartId) return;
    if (!validateSlab()) return;
    setSavingSlab(true);
    try {
      const payload: Record<string, unknown> = {
        description: slabForm.description || undefined,
        periodType: Number(slabForm.periodType),
        fromPeriod: slabForm.fromPeriod ?? 0,
        toPeriod: slabForm.toPeriod ?? undefined,
        amountRangeFrom: slabForm.amountRangeFrom ?? undefined,
        amountRangeTo: slabForm.amountRangeTo ?? undefined,
        annualInterestRate: slabForm.annualInterestRate,
        currencyCode: slabForm.currencyCode,
        locale: "en",
      };

      if (editingSlab) {
        await updateSlabMutation.mutateAsync({ chartId, slabId: editingSlab.id, payload });
      } else {
        await createSlabMutation.mutateAsync({ chartId, payload });
      }
      setSlabDialogOpen(false);
    } catch (err) {
      setSlabErrors({ form: err instanceof Error ? err.message : t("Failed to save slab") });
    } finally {
      setSavingSlab(false);
    }
  };

  const handleDeleteSlab = async () => {
    if (!deleteSlabTarget || !chartId) return;
    await deleteSlabMutation.mutateAsync({ chartId, slabId: deleteSlabTarget.id });
    setDeleteSlabTarget(null);
  };

  const periodOptions = template?.periodTypes ?? [];

  const slabColumns: ColumnDef<InterestRateChartSlab>[] = [
    { key: "description", header: t("Description"), cell: (r) => r.description || "—" },
    {
      key: "periodType",
      header: t("Period Type"),
      cell: (r) => r.periodType?.value ?? String(r.periodType?.id ?? ""),
    },
    { key: "fromPeriod", header: t("From Period") },
    { key: "toPeriod", header: t("To Period") },
    {
      key: "amountRange",
      header: t("Amount Range"),
      cell: (r) => {
        const from = r.amountRangeFrom != null ? r.amountRangeFrom : "—";
        const to = r.amountRangeTo != null ? r.amountRangeTo : "—";
        if (r.amountRangeFrom == null && r.amountRangeTo == null) return "—";
        return `${from} - ${to}`;
      },
    },
    {
      key: "annualInterestRate",
      header: t("Rate (%)"),
      cell: (r) => <span className="font-mono font-semibold">{r.annualInterestRate}%</span>,
    },
    {
      key: "actions",
      header: "",
      cell: (r) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => openEditSlab(r)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteSlabTarget(r)}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  if (isEdit && chartLoading) {
    return (
      <div className="max-w-6xl m-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl m-auto space-y-6">
      <PageHeader
        title={isEdit ? t("Edit Interest Rate Chart") : t("Create Interest Rate Chart")}
        description={t("Define interest rate charts and their slabs.")}
        actions={
          <Button variant="outline" onClick={() => navigate("/interest-rate-charts")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> {t("Back")}
          </Button>
        }
      />

      {formError && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm">{formError}</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("Chart Details")}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-1.5">
            <label className="block text-sm font-medium">{t("Name")} *</label>
            <Input value={form.name} onChange={(e) => updateForm("name", e.target.value)} error={errors.name} />
          </div>
          <div className="col-span-2 space-y-1.5">
            <label className="block text-sm font-medium">{t("Description")}</label>
            <Textarea
              value={form.description}
              onChange={(e) => updateForm("description", e.target.value)}
              rows={3}
              placeholder={t("Chart description")}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">{t("From Date")} *</label>
            <Input
              type="date"
              value={form.fromDate}
              onChange={(e) => updateForm("fromDate", e.target.value)}
              error={errors.fromDate}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">{t("End Date")}</label>
            <Input
              type="date"
              value={form.endDate}
              onChange={(e) => updateForm("endDate", e.target.value)}
              error={errors.endDate}
            />
          </div>
          <div className="col-span-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPrimaryGroupingByAmount}
                onChange={(e) => updateForm("isPrimaryGroupingByAmount", e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm font-medium">{t("Primary Grouping By Amount")}</span>
            </label>
            <p className="mt-1 text-xs text-gray-500">
              {t("When enabled, chart slabs are grouped by amount ranges instead of periods.")}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{t("Chart Slabs")}</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openAddSlab}
              disabled={!chartId && !isEdit}
            >
              <Plus className="mr-1 h-4 w-4" /> {t("Add Slab")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {slabsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <DataTable
              columns={slabColumns}
              data={slabs}
              emptyState={{ message: t("No slabs defined. Click 'Add Slab' to create one.") }}
            />
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" type="button" onClick={() => navigate("/interest-rate-charts")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> {t("Cancel")}
        </Button>
        <Button onClick={handleSave} disabled={saving} className="bg-[#D32F2F] hover:bg-red-700">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("Saving…")}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> {isEdit ? t("Save Changes") : t("Create Chart")}
            </>
          )}
        </Button>
      </div>

      <Dialog open={slabDialogOpen} onOpenChange={setSlabDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingSlab ? t("Edit Slab") : t("Add Slab")}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2 space-y-1.5">
              <label className="block text-sm font-medium">{t("Description")}</label>
              <Input
                value={slabForm.description}
                onChange={(e) => setSlabForm((f) => ({ ...f, description: e.target.value }))}
                placeholder={t("Slab description")}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("Period Type")} *</label>
              <Select value={slabForm.periodType} onValueChange={(v) => setSlabForm((f) => ({ ...f, periodType: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periodOptions.map((opt) => (
                    <SelectItem key={opt.id} value={String(opt.id)}>
                      {opt.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("Annual Rate (%)")} *</label>
              <Input
                type="number"
                step="0.01"
                value={slabForm.annualInterestRate || ""}
                onChange={(e) => setSlabForm((f) => ({ ...f, annualInterestRate: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("From Period")} *</label>
              <Input
                type="number"
                value={slabForm.fromPeriod ?? ""}
                onChange={(e) =>
                  setSlabForm((f) => ({ ...f, fromPeriod: e.target.value === "" ? null : parseInt(e.target.value) }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("To Period")}</label>
              <Input
                type="number"
                value={slabForm.toPeriod ?? ""}
                onChange={(e) =>
                  setSlabForm((f) => ({ ...f, toPeriod: e.target.value === "" ? null : parseInt(e.target.value) }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("Amount Range From")}</label>
              <Input
                type="number"
                step="0.01"
                value={slabForm.amountRangeFrom ?? ""}
                onChange={(e) =>
                  setSlabForm((f) => ({
                    ...f,
                    amountRangeFrom: e.target.value === "" ? null : parseFloat(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("Amount Range To")}</label>
              <Input
                type="number"
                step="0.01"
                value={slabForm.amountRangeTo ?? ""}
                onChange={(e) =>
                  setSlabForm((f) => ({
                    ...f,
                    amountRangeTo: e.target.value === "" ? null : parseFloat(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t("Currency Code")}</label>
              <Input
                value={slabForm.currencyCode}
                onChange={(e) => setSlabForm((f) => ({ ...f, currencyCode: e.target.value }))}
              />
            </div>
          </div>
          {slabErrors.form && (
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {slabErrors.form}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSlabDialogOpen(false)}>
              {t("Cancel")}
            </Button>
            <Button onClick={handleSaveSlab} disabled={savingSlab} className="bg-[#D32F2F] hover:bg-red-700">
              {savingSlab ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("Saving…")}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> {editingSlab ? t("Update") : t("Add")}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteSlabTarget}
        onOpenChange={() => setDeleteSlabTarget(null)}
        onConfirm={handleDeleteSlab}
        loading={deleteSlabMutation.isPending}
        title={t("Delete Slab")}
        description={`${t("Delete this slab?")}`}
        confirmLabel={t("Delete")}
        variant="destructive"
      />
    </div>
  );
};

export default InterestRateChartFormPage;
