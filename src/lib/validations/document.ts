import { z } from "zod";

export const CreateDocumentSchema = z.object({
  name:      z.string().min(1, "Name is required"),
  url:       z.string().url("Must be a valid URL"),
  sizeBytes: z.number().int().positive().optional(),
});

export type CreateDocumentInput = z.infer<typeof CreateDocumentSchema>;
