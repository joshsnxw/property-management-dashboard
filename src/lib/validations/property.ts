import { z } from "zod";

export const UnitSchema = z.object({
  number:          z.string().min(1, "Unit number is required"),
  type:            z.enum(["APARTMENT", "OFFICE", "GARDEN", "PARKING"]),
  floor:           z.string().optional(),
  entrance:        z.string().optional(),
  sizeSqm:         z.number().positive().optional(),
  coOwnershipShare:z.string().optional(),
  yearBuilt:       z.number().int().optional(),
  rooms:           z.number().positive().optional(),
  buildingIndex:   z.number().int().min(0), // which building this unit belongs to
});

export const BuildingSchema = z.object({
  label:       z.string().min(1, "Building label is required"),
  street:      z.string().default(""),
  houseNumber: z.string().default(""),
  postalCode:  z.string().default(""),
  city:        z.string().default("Berlin"),
  yearBuilt:   z.number().int().optional(),
  floors:      z.number().int().positive().optional(),
});

export const CreatePropertySchema = z.object({
  name:        z.string().min(1, "Property name is required"),
  address:     z.string().min(1, "Address is required"),
  number:      z.string().optional(), // auto-generated if omitted
  type:        z.enum(["WEG", "MV"]),
  managerId:   z.string().min(1, "Manager is required"),
  accountantId:z.string().min(1, "Accountant is required"),
  buildings:   z.array(BuildingSchema).min(1, "At least one building is required"),
  units:       z.array(UnitSchema).default([]),
});

export type CreatePropertyInput = z.infer<typeof CreatePropertySchema>;

export const PatchPropertySchema = z.object({
  name:        z.string().min(1).optional(),
  address:     z.string().min(1).optional(),
  number:      z.string().min(1).optional(),
  type:        z.enum(["WEG", "MV"]).optional(),
  status:      z.enum(["ACTIVE", "PENDING", "ARCHIVED"]).optional(),
  managerId:   z.string().min(1).optional(),
  accountantId:z.string().min(1).optional(),
});

// Used when creating a unit under an existing property (buildingId instead of buildingIndex)
export const CreateUnitForBuildingSchema = z.object({
  number:          z.string().default(""),
  type:            z.enum(["APARTMENT", "OFFICE", "GARDEN", "PARKING"]),
  floor:           z.string().optional(),
  entrance:        z.string().optional(),
  sizeSqm:         z.number().positive().optional(),
  coOwnershipShare:z.string().optional(),
  yearBuilt:       z.number().int().optional(),
  rooms:           z.number().positive().optional(),
  buildingId:      z.string().min(1),
});

export const PatchUnitSchema = z.object({
  number:          z.string().min(1).optional(),
  type:            z.enum(["APARTMENT", "OFFICE", "GARDEN", "PARKING"]).optional(),
  floor:           z.string().optional(),
  entrance:        z.string().optional(),
  sizeSqm:         z.number().positive().optional(),
  coOwnershipShare:z.string().optional(),
  yearBuilt:       z.number().int().optional(),
  rooms:           z.number().positive().optional(),
  buildingId:      z.string().optional(),
});
