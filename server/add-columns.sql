-- Script SQL pentru a adăuga coloanele lipsă în tabelul facilities
-- Rulează: mysql -u user -p database < server/add-columns.sql

-- Verifică dacă coloanele există și le adaugă dacă lipsesc
-- (MySQL nu suportă IF NOT EXISTS pentru ALTER TABLE, deci rulează manual)

ALTER TABLE facilities 
ADD COLUMN IF NOT EXISTS logo_url VARCHAR(500) AFTER image_url;

ALTER TABLE facilities 
ADD COLUMN IF NOT EXISTS social_media JSON AFTER logo_url;

ALTER TABLE facilities 
ADD COLUMN IF NOT EXISTS gallery JSON AFTER social_media;

ALTER TABLE facilities 
ADD COLUMN IF NOT EXISTS pricing_details JSON AFTER price_per_hour;

