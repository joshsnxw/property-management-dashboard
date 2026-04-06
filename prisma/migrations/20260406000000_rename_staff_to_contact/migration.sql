-- Rename enum StaffRole → ContactRole
ALTER TYPE "StaffRole" RENAME TO "ContactRole";

-- Rename table Staff → Contact
ALTER TABLE "Staff" RENAME TO "Contact";

-- Add optional address fields to Contact
ALTER TABLE "Contact" ADD COLUMN "street"      TEXT;
ALTER TABLE "Contact" ADD COLUMN "houseNumber" TEXT;
ALTER TABLE "Contact" ADD COLUMN "postalCode"  TEXT;
ALTER TABLE "Contact" ADD COLUMN "city"        TEXT;
