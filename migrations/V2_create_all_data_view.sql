/*
SQL to copy data from players to new tables

INSERT INTO users (name, steamid, license, discord, last_updated)
SELECT name, steamid, license, discord, last_updated
from players;

INSERT INTO characters (citizenid, cid, steamid, last_updated)
SELECT citizenid, cid, steamid, last_updated
FROM players;

INSERT INTO character_data (cid, gang, position, metadata, last_updated)
SELECT citizenid as cid, gang, position, metadata, last_updated
FROM players;

INSERT INTO character_info (cid, firstname, lastname, birthdate, gender, backstory, nationality, phone, cash,
                            last_updated)

SELECT citizenid as cid,
       firstname,
       lastname,
       birthdate,
       gender,
       backstory,
       nationality,
       phone,
       cash,
       last_updated
FROM players;
*/

create view all_character_data AS
SELECT c.*,
       ci.firstname,
       ci.lastname,
       ci.birthdate,
       ci.gender,
       ci.backstory,
       ci.nationality,
       ci.phone,
       ci.cash,
       cd.gang,
       cd.position,
       cd.metadata
FROM characters AS c
         LEFT JOIN character_info AS ci ON ci.cid = c.citizenid
         LEFT JOIN character_data AS cd ON cd.cid = c.citizenid;
