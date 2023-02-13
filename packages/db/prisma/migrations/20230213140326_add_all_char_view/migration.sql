-- This is an empty migration.
CREATE OR REPLACE VIEW all_character_data AS
SELECT c.*,
       ci.firstname,
       ci.lastname,
       ci.birthdate,
       ci.gender,
       ci.nationality,
       ci.phone,
       ci.cash,
       cd.position,
       cd.metadata
FROM characters AS c
         LEFT JOIN character_info AS ci ON ci.citizenid = c.citizenid
         LEFT JOIN character_data AS cd ON cd.citizenid = c.citizenid;
