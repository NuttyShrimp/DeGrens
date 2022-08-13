-- Remove unused column characters.cid
ALTER TABLE characters
DROP COLUMN cid;

-- Rename `characters.citizenid` foreign key columns to `citizenid` for consistency
ALTER TABLE character_data 
RENAME COLUMN cid TO citizenid;
ALTER TABLE character_info
RENAME COLUMN cid TO citizenid;

-- Remove unused column character_info.backstory
ALTER TABLE character_info
DROP COLUMN backstory;

-- Edit view all_character_data to account for previous changes ^
CREATE OR REPLACE VIEW all_character_data AS
SELECT c.*,
       ci.firstname,
       ci.lastname,
       ci.birthdate,
       ci.gender,
       ci.nationality,
       ci.phone,
       ci.cash,
       cd.gang,
       cd.position,
       cd.metadata
FROM characters AS c
         LEFT JOIN character_info AS ci ON ci.citizenid = c.citizenid
         LEFT JOIN character_data AS cd ON cd.citizenid = c.citizenid;

