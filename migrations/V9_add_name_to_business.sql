ALTER TABLE business
  ADD COLUMN IF NOT EXISTS name VARCHAR(255) NOT NULL DEFAULT '';

UPDATE business
SET name = 'dff'
WHERE id = 1 AND label='De FliereFluiters';

UPDATE business
SET name = 'pdm'
WHERE id = 2 AND label="PDM";

ALTER TABLE business
  MODIFY COLUMN name VARCHAR(255) NOT NULL UNIQUE;

