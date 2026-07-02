-- Add secretaria role and staff editor flag
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'secretaria';

ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "staff_editor" BOOLEAN NOT NULL DEFAULT false;
