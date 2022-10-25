INSERT INTO users(name, steamid, license, discord, last_updated, created_at)
VALUES ('NuttyShrimp', 'steam:110000137164c7d', 'license:ea3021d1c62a5a3e3738dfefaed6de1137117a1e',
        'discord:214294598766297088', '2022-08-30 10:09:41', '2022-08-30 10:09:41'),
       ('Jens', 'steam:11000011bf78d6c', 'license:8bc761e0e627c998c5578b7eb902385e19f01860',
        'discord:265448399921348608', '2022-08-30 10:09:41', '2022-08-30 10:09:41');

INSERT INTO characters(citizenid, steamid, last_updated, created_at)
VALUES (1000, 'steam:110000137164c7d', '2022-08-30 10:09:41', '2022-08-30 10:09:41'),
       (1001, 'steam:11000011bf78d6c', '2022-08-30 10:09:41', '2022-08-30 10:09:41');

INSERT INTO character_data(citizenid, gang, position, metadata, last_updated, created_at)
VALUES (1000, '{"label":"No Gang Affiliaton","grade":{"name":"none","level":0},"name":"none","isboss":false}',
        '{"x":-0.0,"y":0.0,"z":-0.0}',
        '{"attachmentcraftingrep":0,"ishandcuffed":false,"tracker":false,"injail":0,"armor":0,"hunger":28.5,"inside":{"apartment":[]},"fitbit":[],"jailitems":[],"criminalrecord":{"hasRecord":false},"licences":{"driver":true,"business":false,"weapon":false},"inlaststand":false,"stress":64.3,"craftingrep":0,"fingerprint":"YV206m04WJr4024","callsign":"NO CALLSIGN","status":[],"bloodtype":"AB+","thirst":28.5,"isdead":false,"commandbinds":[],"jobrep":{"taxi":0,"hotdog":0,"trucker":0,"tow":0}}',
        '2022-10-03 01:37:12', '2022-08-30 10:09:41'),
       (1001, '{"label":"No Gang Affiliaton","grade":{"name":"none","level":0},"name":"none","isboss":false}',
        '{"x":-0.0,"y":0.0,"z":-0.0}',
        '{"attachmentcraftingrep":0,"ishandcuffed":false,"tracker":false,"injail":0,"armor":0,"hunger":28.5,"inside":{"apartment":[]},"fitbit":[],"jailitems":[],"criminalrecord":{"hasRecord":false},"licences":{"driver":true,"business":false,"weapon":false},"inlaststand":false,"stress":64.3,"craftingrep":0,"fingerprint":"YV206m04WJr4024","callsign":"NO CALLSIGN","status":[],"bloodtype":"AB+","thirst":28.5,"isdead":false,"commandbinds":[],"jobrep":{"taxi":0,"hotdog":0,"trucker":0,"tow":0}}',
        '2022-10-03 01:37:12', '2022-08-30 10:09:41');

INSERT INTO character_info(citizenid, firstname, lastname, birthdate, gender, nationality, phone, cash, last_updated,
                           created_at)
VALUES (1000, 'Nutty', 'Shrimp', '2000/08/29', 0, 'Belg', '0473626283', 500, '2022-08-30 10:09:41',
        '2022-08-30 10:09:41'),
       (1001, 'Benny', 'Van Der Meer', '2000/08/29', 0, 'Belg', '0473626284', 500, '2022-08-30 10:09:41',
        '2022-08-30 10:09:41');

INSERT INTO apartments(id, citizenid)
VALUES (1, 1000),
       (2, 1001);

INSERT INTO bank_accounts(account_id, name, type, balance, updated_at)
VALUES ('BE40040159', 'Persoonlijk account', 'standard', 5000, '2022-09-25 23:46:12'),
       ('BE50432172', 'Persoonlijk account', 'standard', 5000, '2022-09-25 23:46:12'),
       ('BE49834957', 'DFF Business', 'business', 5000, '2022-09-25 23:46:12'),
       ('BE58084424', 'PDM', 'business', NULL, '2022-10-03 23:35:02');

INSERT INTO bank_accounts_access(account_id, cid, access_level)
VALUES ('BE40040159', 1000, 31),
       ('BE50432172', 1001, 31);

INSERT INTO permissions(name, steamid, role)
VALUES ('NuttyShrimp', 'steam:110000137164c7d', 'developer'),
       ('Jens', 'steam:11000011bf78d6c', 'developer');

INSERT INTO playerskins(citizenid, model, skin, active)
VALUES (1000, '1885233650',
        '{"nose_3":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"lips_thickness":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"vest":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"t-shirt":{"defaultTexture":0,"defaultItem":1,"item":176,"texture":1},"chimp_bone_width":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"torso2":{"defaultTexture":0,"defaultItem":0,"item":390,"texture":6},"nose_5":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"eyebrown_high":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"neck_thikness":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"blush":{"defaultTexture":1,"defaultItem":-1,"item":-1,"texture":1},"glass":{"defaultTexture":0,"defaultItem":0,"item":5,"texture":5},"decals":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"eye_opening":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"eye_color":{"defaultTexture":0,"defaultItem":-1,"item":-1,"texture":0},"arms":{"defaultTexture":0,"defaultItem":0,"item":4,"texture":0},"hair":{"defaultTexture":0,"defaultItem":0,"item":21,"texture":3},"makeup":{"defaultTexture":1,"defaultItem":-1,"item":-1,"texture":1},"lipstick":{"defaultTexture":1,"defaultItem":-1,"item":-1,"texture":1},"watch":{"defaultTexture":0,"defaultItem":-1,"item":-1,"texture":0},"face":{"defaultTexture":0,"defaultItem":0,"item":4,"texture":0},"shoes":{"defaultTexture":0,"defaultItem":1,"item":7,"texture":0},"cheek_1":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"beard":{"defaultTexture":1,"defaultItem":-1,"item":10,"texture":3},"nose_1":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"chimp_bone_lowering":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"jaw_bone_back_lenght":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"chimp_bone_lenght":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"jaw_bone_width":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"nose_2":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"mask":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"cheek_2":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"nose_4":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"eyebrown_forward":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"nose_0":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"eyebrows":{"defaultTexture":1,"defaultItem":-1,"item":1,"texture":1},"moles":{"defaultTexture":0,"defaultItem":-1,"item":-1,"texture":0},"hat":{"defaultTexture":0,"defaultItem":-1,"item":-1,"texture":0},"bag":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"ageing":{"defaultTexture":0,"defaultItem":-1,"item":-1,"texture":0},"accessory":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"ear":{"defaultTexture":0,"defaultItem":-1,"item":-1,"texture":0},"bracelet":{"defaultTexture":0,"defaultItem":-1,"item":-1,"texture":0},"cheek_3":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"pants":{"defaultTexture":0,"defaultItem":0,"item":143,"texture":0},"chimp_hole":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0}}',
        1),
       (1001, '1885233650',
        '{"nose_3":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"lips_thickness":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"vest":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"t-shirt":{"defaultTexture":0,"defaultItem":1,"item":176,"texture":1},"chimp_bone_width":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"torso2":{"defaultTexture":0,"defaultItem":0,"item":390,"texture":6},"nose_5":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"eyebrown_high":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"neck_thikness":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"blush":{"defaultTexture":1,"defaultItem":-1,"item":-1,"texture":1},"glass":{"defaultTexture":0,"defaultItem":0,"item":5,"texture":5},"decals":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"eye_opening":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"eye_color":{"defaultTexture":0,"defaultItem":-1,"item":-1,"texture":0},"arms":{"defaultTexture":0,"defaultItem":0,"item":4,"texture":0},"hair":{"defaultTexture":0,"defaultItem":0,"item":21,"texture":3},"makeup":{"defaultTexture":1,"defaultItem":-1,"item":-1,"texture":1},"lipstick":{"defaultTexture":1,"defaultItem":-1,"item":-1,"texture":1},"watch":{"defaultTexture":0,"defaultItem":-1,"item":-1,"texture":0},"face":{"defaultTexture":0,"defaultItem":0,"item":4,"texture":0},"shoes":{"defaultTexture":0,"defaultItem":1,"item":7,"texture":0},"cheek_1":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"beard":{"defaultTexture":1,"defaultItem":-1,"item":10,"texture":3},"nose_1":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"chimp_bone_lowering":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"jaw_bone_back_lenght":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"chimp_bone_lenght":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"jaw_bone_width":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"nose_2":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"mask":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"cheek_2":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"nose_4":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"eyebrown_forward":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"nose_0":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"eyebrows":{"defaultTexture":1,"defaultItem":-1,"item":1,"texture":1},"moles":{"defaultTexture":0,"defaultItem":-1,"item":-1,"texture":0},"hat":{"defaultTexture":0,"defaultItem":-1,"item":-1,"texture":0},"bag":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"ageing":{"defaultTexture":0,"defaultItem":-1,"item":-1,"texture":0},"accessory":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"ear":{"defaultTexture":0,"defaultItem":-1,"item":-1,"texture":0},"bracelet":{"defaultTexture":0,"defaultItem":-1,"item":-1,"texture":0},"cheek_3":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"pants":{"defaultTexture":0,"defaultItem":0,"item":143,"texture":0},"chimp_hole":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0}}',
        1);

INSERT INTO business(id, label, business_type, bank_account_id)
VALUES (1, 'De FliereFluiters', 1, 'BE49834957'),
       (2, 'PDM', 2, 'BE58084424');

INSERT INTO business_role(id, name, permissions, business_id)
VALUES (1, 'CEO', 63, 1),
       (2, 'CEO', 127, 2);

INSERT INTO business_employee(is_owner, citizenid, role_id, business_id)
VALUES (1, 1000, 1, 1),
       (0, 1001, 1, 1),
       (0, 1000, 2, 2),
       (1, 1001, 2, 2);

INSERT INTO whitelist_jobs(cid, job, `rank`, specialty)
VALUES (1000, 'police', 6, 7),
       (1001, 'police', 6, 7);