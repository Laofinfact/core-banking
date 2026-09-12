import { z } from "zod";
import i18n from "@/i18n";

const createClientSchemaBase = z.object({
  firstname: z.string().max(100).optional().or(z.literal("")),
  middlename: z.string().max(100).optional().or(z.literal("")),
  lastname: z.string().max(100).optional().or(z.literal("")),
  fullname: z.string().max(200).optional().or(z.literal("")),

  officeId: z.number({ message: i18n.t("validation.officeRequired") }).int(),
  staffId: z.number().int().optional(),
  groupId: z.number().int().optional(),

  dateOfBirth: z.string().optional().or(z.literal("")),
  genderId: z.number().int().optional(),
  legalFormId: z.number().int().min(1).max(2).optional(),

  externalId: z.string().max(100).optional().or(z.literal("")),
  savingsProductId: z.number().int().optional(),

  mobileNo: z
    .string()
    .max(50)
    .regex(/^\+?[0-9]{7,15}$/, i18n.t("validation.mobileNo"))
    .optional()
    .or(z.literal("")),
  emailAddress: z.string().email(i18n.t("validation.email")).max(100).optional().or(z.literal("")),

  activationDate: z.string().optional().or(z.literal("")),
  submittedOnDate: z.string().optional().or(z.literal("")),
  active: z.boolean().optional(),

  accountNo: z.string().max(20).optional().or(z.literal("")),
  isStaff: z.boolean().optional(),
  clientTypeId: z.number().int().optional(),
  clientClassificationId: z.number().int().optional(),

  clientNonPersonDetails: z
    .object({
      constitutionId: z.number().int().optional(),
      incorpNumber: z.string().max(50).optional().or(z.literal("")),
      mainBusinessLineId: z.number().int().optional(),
      remarks: z.string().max(150).optional().or(z.literal("")),
      incorpValidityTillDate: z.string().optional().or(z.literal("")),
    })
    .optional(),

  dateFormat: z.string(),
  locale: z.string(),
});

export const createClientSchema = createClientSchemaBase.superRefine((data, ctx) => {
  const isEntity = data.legalFormId === 2;

  if (isEntity) {
    if (!data.fullname || data.fullname.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: i18n.t("validation.fullnameRequired"),
        path: ["fullname"],
      });
    }
  } else {
    if (!data.firstname || data.firstname.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: i18n.t("validation.firstNameRequired"),
        path: ["firstname"],
      });
    }
    if (!data.lastname || data.lastname.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: i18n.t("validation.lastNameRequired"),
        path: ["lastname"],
      });
    }
  }

  if (data.active === true && (!data.activationDate || data.activationDate.trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: i18n.t("validation.activationDateRequired"),
      path: ["activationDate"],
    });
  }
});

export type CreateClientFormValues = z.infer<typeof createClientSchema>;

export const editClientSchema = createClientSchemaBase.partial().superRefine((data, ctx) => {
  if (data.legalFormId === 2) {
    if (data.fullname !== undefined && data.fullname.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: i18n.t("validation.fullnameRequired"),
        path: ["fullname"],
      });
    }
  }
});
export type EditClientFormValues = z.infer<typeof editClientSchema>;

export const activateClientSchema = z.object({
  activationDate: z.string().min(1, i18n.t("validation.activationDateRequired")),
  dateFormat: z.string().optional(),
  locale: z.string().optional(),
  savingsProductId: z.number().int().optional(),
});
export type ActivateClientFormValues = z.infer<typeof activateClientSchema>;

export const closeClientSchema = z.object({
  closureDate: z.string().min(1, i18n.t("validation.closureDateRequired")),
  closureReasonId: z.number().int().positive(i18n.t("validation.closureReasonRequired")),
  dateFormat: z.string().optional(),
  locale: z.string().optional(),
});
export type CloseClientFormValues = z.infer<typeof closeClientSchema>;

export const rejectClientSchema = z.object({
  rejectionDate: z.string().min(1, i18n.t("validation.rejectionDateRequired")),
  rejectionReasonId: z.number().int().positive(i18n.t("validation.rejectionReasonRequired")),
  dateFormat: z.string().optional(),
  locale: z.string().optional(),
});
export type RejectClientFormValues = z.infer<typeof rejectClientSchema>;

export const withdrawClientSchema = z.object({
  withdrawalDate: z.string().min(1, i18n.t("validation.withdrawalDateRequired")),
  withdrawalReasonId: z.number().int().positive(i18n.t("validation.withdrawalReasonRequired")),
  dateFormat: z.string().optional(),
  locale: z.string().optional(),
});
export type WithdrawClientFormValues = z.infer<typeof withdrawClientSchema>;

export const reactivateClientSchema = z.object({
  reactivationDate: z.string().min(1, i18n.t("validation.reactivationDateRequired")),
  dateFormat: z.string().optional(),
  locale: z.string().optional(),
});
export type ReactivateClientFormValues = z.infer<typeof reactivateClientSchema>;

export const undoRejectionSchema = z.object({
  reopenedDate: z.string().min(1, i18n.t("validation.reopenedDateRequired")),
  dateFormat: z.string().optional(),
  locale: z.string().optional(),
});
export type UndoRejectClientFormValues = z.infer<typeof undoRejectionSchema>;

export const undoWithdrawalSchema = z.object({
  reopenedDate: z.string().min(1, i18n.t("validation.reopenedDateRequired")),
  dateFormat: z.string().optional(),
  locale: z.string().optional(),
});
export type UndoWithdrawClientFormValues = z.infer<typeof undoWithdrawalSchema>;

export const assignStaffSchema = z.object({
  staffId: z.number().int().positive(i18n.t("validation.staffRequired")),
});
export type AssignStaffFormValues = z.infer<typeof assignStaffSchema>;

export const updateSavingsAccountSchema = z.object({
  savingsAccountId: z.number().int().positive(i18n.t("validation.savingsAccountRequired")),
});
export type UpdateSavingsAccountFormValues = z.infer<typeof updateSavingsAccountSchema>;

export const proposeTransferSchema = z.object({
  destinationOfficeId: z.number().int().positive(i18n.t("validation.destinationOfficeRequired")),
  transferDate: z.string().optional(),
  dateFormat: z.string().optional(),
  locale: z.string().optional(),
  note: z.string().optional(),
});
export type ProposeTransferFormValues = z.infer<typeof proposeTransferSchema>;

export const acceptTransferSchema = z.object({
  transferDate: z.string().optional(),
  dateFormat: z.string().optional(),
  locale: z.string().optional(),
  note: z.string().optional(),
});
export type AcceptTransferFormValues = z.infer<typeof acceptTransferSchema>;

export const transferActionSchema = z.object({
  transferDate: z.string().optional(),
  dateFormat: z.string().optional(),
  locale: z.string().optional(),
  note: z.string().optional(),
});
export type TransferActionFormValues = z.infer<typeof transferActionSchema>;
