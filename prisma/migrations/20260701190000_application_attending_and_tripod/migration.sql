ALTER TABLE "applications"
ADD COLUMN "attending_course_type" TEXT,
ADD COLUMN "attending_institution" TEXT,
ADD COLUMN "attending_institution_other" TEXT;

ALTER TABLE "curriculum_records"
ADD COLUMN "analysis_hours" INTEGER,
ADD COLUMN "analyst_name" TEXT,
ADD COLUMN "supervision_hours" INTEGER,
ADD COLUMN "supervisor_name" TEXT;
