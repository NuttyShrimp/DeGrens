UPDATE character_data as cd SET metadata = JSON_INSERT(metadata, '$.cash', (SELECT cash FROM character_info as ci WHERE ci.citizenid = cd.citizenid));
ALTER TABLE character_info DROP cash;