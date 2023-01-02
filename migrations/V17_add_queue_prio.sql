CREATE TABLE IF NOT EXISTS queue_priority (
  steamid VARCHAR(255) NOT NULL,
  priority INT(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (steamid)
);

INSERT INTO queue_priority (steamid, priority)
VALUES ('steam:110000137164c7d', 999),
       ('steam:11000011bf78d6c', 999);