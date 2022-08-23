DROP TABLE IF EXISTS permissions;

ALTER TABLE users ADD INDEX (name);

create table if not exists permissions
(
  id      int auto_increment,
  name    varchar(255) not null,
  steamid varchar(255) not null,
  role    varchar(255) not null,
  PRIMARY KEY (id),
  FOREIGN KEY (steamid) REFERENCES users(steamid) on update cascade on delete cascade,
  FOREIGN KEY (name) REFERENCES users(name) on update cascade on delete cascade
);

CREATE TABLE IF NOT EXISTS whitelist
(
  name     varchar(255) NOT NULL,
  steam_id varchar(255) NOT NULL,
  PRIMARY KEY (name)
);

CREATE TABLE IF NOT EXISTS penalties
(
  id      int auto_increment,
  steamId varchar(255)                 NOT NULL,
  penalty ENUM ('ban', 'kick', 'warn') NOT NULL,
  reason  LONGTEXT                     NOT NULL,
  points  INT                          NOT NULL DEFAULT 0,
  length  INT                                   DEFAULT NULL,
  date    TIMESTAMP                    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX (steamId)
);
