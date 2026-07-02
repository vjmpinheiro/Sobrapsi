-- Normalize legacy registration numbers to SBR-NNNNNN format
UPDATE "members"
SET "registration_number" = 'SBR-000001'
WHERE "registration_number" = 'SBR-2026-000001';

UPDATE "membership_cards"
SET
  "card_number" = 'SBR-000001',
  "pdf_path" = 'uploads/cards/SBR-000001.pdf'
WHERE "card_number" = 'SBR-2026-000001';
