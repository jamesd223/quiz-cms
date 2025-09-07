import { z } from "zod";

export const fieldTypeEnum = z.enum([
  "input_text",
  "input_number",
  "input_email",
  "input_phone",
  "input_date",
  "input_slider",
  "choice_single",
  "choice_multi",
  "group",
]);

export type FieldType = z.infer<typeof fieldTypeEnum>;

export const gridPositionSchema = z.object({
  row: z.number().int().min(1),
  col: z.number().int().min(1),
  rowSpan: z.number().int().min(1),
  colSpan: z.number().int().min(1),
});
export type GridPosition = z.infer<typeof gridPositionSchema>;

export const fieldValidationSchema = z.object({
  regex: z.string().optional(),
  message: z.string().optional(),
});
export type FieldValidation = z.infer<typeof fieldValidationSchema>;

export const choiceOptionSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
});
export type ChoiceOption = z.infer<typeof choiceOptionSchema>;

export const baseFieldSchema = z.object({
  id: z.string().uuid(),
  type: fieldTypeEnum,
  key: z.string().min(1),
  label: z.string().min(1),
  help: z.string().optional(),
  required: z.boolean().default(false),
  placeholder: z.string().optional(),
  masks: z.array(z.string()).optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  unit: z.string().optional(),
  validation: fieldValidationSchema.optional(),
  position: gridPositionSchema,
});

export const inputFieldSchema = baseFieldSchema.extend({
  type: z.enum([
    "input_text",
    "input_number",
    "input_email",
    "input_phone",
    "input_date",
    "input_slider",
  ]),
});
export type InputField = z.infer<typeof inputFieldSchema>;

export const choiceFieldSchema = baseFieldSchema.extend({
  type: z.enum(["choice_single", "choice_multi"]),
  options: z.array(choiceOptionSchema).default([]),
});
export type ChoiceField = z.infer<typeof choiceFieldSchema>;

export const groupChildLayoutSchema = z.object({
  position: gridPositionSchema.optional(),
});

export const groupedInputSchema = inputFieldSchema
  .merge(groupChildLayoutSchema)
  .omit({
    id: true,
    position: true,
  });
export type GroupedInput = z.infer<typeof groupedInputSchema>;

export const groupFieldSchema = baseFieldSchema.extend({
  type: z.literal("group"),
  containerLayoutMode: z.enum(["auto", "manual"]).default("auto"),
  groupedInputs: z.array(groupedInputSchema).default([]),
});
export type GroupField = z.infer<typeof groupFieldSchema>;

export const fieldSchema = z.discriminatedUnion("type", [
  inputFieldSchema,
  choiceFieldSchema,
  groupFieldSchema,
]);
export type Field = z.infer<typeof fieldSchema>;

export const isChoiceField = (f: Field): f is ChoiceField =>
  f.type === "choice_single" || f.type === "choice_multi";
export const isGroupField = (f: Field): f is GroupField => f.type === "group";

export const stepMetaSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  footnote: z.string().optional(),
  cta: z.string().optional(),
  isVisible: z.boolean().default(true),
  layout: z.enum(["default", "wide", "narrow"]).default("default"),
  media: z
    .object({ id: z.string().uuid(), url: z.string().url() })
    .nullable()
    .optional(),
});

export const stepSchema = z.object({
  id: z.string().uuid(),
  orderIndex: z.number().int().min(0),
  meta: stepMetaSchema,
  gridColumns: z.number().int().min(1).max(24).default(12),
  gridGapPx: z.number().int().min(0).max(64).default(8),
  fields: z.array(fieldSchema).default([]),
});
export type Step = z.infer<typeof stepSchema>;

export const versionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  isDefault: z.boolean().default(false),
  trafficWeight: z.number().int().min(0).max(100).default(100),
  steps: z.array(stepSchema).default([]),
});
export type QuizVersion = z.infer<typeof versionSchema>;

export const quizSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  slug: z.string().min(1),
  brand: z.string().min(1),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  updatedAt: z.string().datetime(),
  versions: z.array(versionSchema).default([]),
});
export type Quiz = z.infer<typeof quizSchema>;

export const ensureUniqueFieldKeys = (version: QuizVersion): string[] => {
  const seen = new Set<string>();
  const duplicates: string[] = [];
  for (const step of version.steps) {
    for (const field of step.fields) {
      if (seen.has(field.key)) duplicates.push(field.key);
      else seen.add(field.key);
    }
  }
  return Array.from(new Set(duplicates));
};

export const ensureUniqueOptionValues = (field: Field): string[] => {
  if (field.type !== "choice_single" && field.type !== "choice_multi")
    return [];
  const seen = new Set<string>();
  const duplicates: string[] = [];
  for (const opt of field.options ?? []) {
    if (seen.has(opt.value)) duplicates.push(opt.value);
    else seen.add(opt.value);
  }
  return Array.from(new Set(duplicates));
};

export type GridCollision = {
  fieldIdA: string;
  fieldIdB: string;
};

export const detectGridCollisions = (
  fields: Field[],
  gridColumns: number
): GridCollision[] => {
  type CellKey = string;
  const occupied = new Map<CellKey, string>();
  const collisions: GridCollision[] = [];
  const clamp = (val: number, min: number, max: number) =>
    Math.max(min, Math.min(max, val));

  for (const f of fields) {
    const startRow = Math.max(1, f.position.row);
    const startCol = clamp(f.position.col, 1, gridColumns);
    const endRow = startRow + Math.max(1, f.position.rowSpan) - 1;
    const endCol = clamp(
      startCol + Math.max(1, f.position.colSpan) - 1,
      1,
      gridColumns
    );
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const key = `${r}:${c}`;
        const existing = occupied.get(key);
        if (existing && existing !== f.id) {
          collisions.push({ fieldIdA: existing, fieldIdB: f.id });
        } else {
          occupied.set(key, f.id);
        }
      }
    }
  }

  // De-duplicate symmetric collisions
  const unique = new Map<string, GridCollision>();
  for (const col of collisions) {
    const key = [col.fieldIdA, col.fieldIdB].sort().join("|");
    if (!unique.has(key)) unique.set(key, col);
  }
  return Array.from(unique.values());
};
