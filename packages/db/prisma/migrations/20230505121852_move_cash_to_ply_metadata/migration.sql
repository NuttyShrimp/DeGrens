UPDATE character_data as cd SET metadata = JSON_INSERT(metadata, '$.cash', (SELECT cash FROM character_info as ci WHERE ci.citizenid = cd.citizenid));
ALTER TABLE character_info DROP cash;

CREATE OR REPLACE VIEW all_character_data AS SELECT c.*,
       ci.firstname,
       ci.lastname,
       ci.birthdate,
       ci.gender,
       ci.nationality,
       ci.phone,
       cd.position,
       cd.metadata
FROM characters AS c
         LEFT JOIN character_info AS ci ON ci.citizenid = c.citizenid
         LEFT JOIN character_data AS cd ON cd.citizenid = c.citizenid;
