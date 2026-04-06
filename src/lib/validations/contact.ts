import { z } from "zod";

export const ContactSchema = z.object({
  name:        z.string().min(1, "Name is required"),
  role:        z.enum(["MANAGER", "ACCOUNTANT"]),
  street:      z.string().nullish(),
  houseNumber: z.string().nullish(),
  postalCode:  z.string().nullish(),
  city:        z.string().nullish(),
});

export type ContactInput = z.infer<typeof ContactSchema>;
