create database if not exists degrens2;
use degrens2;

create table if not exists players
(
  citizenid    varchar(255)                          not null,
  cid          int                                   null,
  license      varchar(255)                          not null,
  name         varchar(255)                          not null,
  firstname    text                                  not null,
  lastname     text                                  not null,
  birthdate    varchar(11)                           not null,
  gender       int(1)                                not null,
  backstory    text                                  not null,
  nationality  text                                  not null,
  phone        varchar(255)                          not null,
  account      varchar(255)                          not null,
  gang         text                                  null,
  charinfo     text                                  null,
  position     text                                  not null,
  money        text                                  not null,
  job          text                                  not null,
  metadata     text                                  not null,
  last_updated timestamp default current_timestamp() not null on update current_timestamp(),
  PRIMARY KEY (citizenid),
  INDEX (license)
);

create table if not exists apartments
(
  id        int auto_increment,
  citizenid varchar(255) not null,
  PRIMARY KEY (id),
  FOREIGN KEY (citizenid) REFERENCES players (citizenid) on update cascade on delete cascade
);

create table if not exists api_tokens
(
  token     varchar(255) default ''                  not null,
  timestamp timestamp    default current_timestamp() not null,
  PRIMARY KEY (token)
);

create table if not exists bank_accounts
(
  record_id    bigint(255) auto_increment,
  citizenid    varchar(250)                                                      null unique,
  buisness     varchar(50)                                                       null,
  buisnessid   int                                                               null,
  gangid       varchar(50)                                                       null,
  amount       bigint(255)                                     default 0         not null,
  account_type enum ('Current', 'Savings', 'Buisness', 'Gang') default 'Current' not null,
  PRIMARY KEY (record_id),
  FOREIGN KEY (citizenid) REFERENCES players (citizenid) on update cascade on delete cascade
);

create table if not exists bank_statements
(
  record_id  bigint(255) auto_increment,
  citizenid  varchar(50)  null,
  account    varchar(50)  null,
  buisness   varchar(50)  null,
  buisnessid int          null,
  gangid     varchar(50)  null,
  deposited  int          null,
  withdraw   int          null,
  balance    int          null,
  date       varchar(50)  null,
  type       varchar(255) null,
  PRIMARY KEY (record_id),
  FOREIGN KEY (citizenid) REFERENCES players (citizenid) on update cascade on delete cascade
);

create table if not exists bans
(
  id       int auto_increment,
  name     varchar(50)                        null,
  license  varchar(50)                        null,
  discord  varchar(50)                        null,
  ip       varchar(50)                        null,
  reason   text                               null,
  expire   int                                null,
  bannedby varchar(255) default 'LeBanhammer' not null,
  PRIMARY KEY (id)
);

create table if not exists crypto
(
  crypto  varchar(50) default 'qbit' not null,
  worth   int         default 0      not null,
  history longtext                   null,
  PRIMARY KEY (crypto)
);

create table if not exists crypto_transactions
(
  id        int auto_increment,
  citizenid varchar(50)                           null,
  title     varchar(50)                           null,
  message   varchar(50)                           null,
  date      timestamp default current_timestamp() null,
  PRIMARY KEY (id),
  FOREIGN KEY (citizenid) REFERENCES players (citizenid) on update cascade on delete cascade
);

create table if not exists dealers
(
  id        int auto_increment,
  name      varchar(50) default '0'      not null,
  coords    longtext collate utf8mb4_bin null,
  time      longtext collate utf8mb4_bin null,
  createdby varchar(50) default '0'      not null,
  PRIMARY KEY (id)
);

create table if not exists houselocations
(
  name   varchar(255) null unique,
  label  varchar(255) null,
  coords text         null,
  owned  tinyint(1)   null,
  price  int          null,
  tier   tinyint      null,
  garage text         null,
  PRIMARY KEY (name)
);

create table if not exists house_plants
(
  plantid  varchar(50)                   null,
  building varchar(255)                  null,
  stage    varchar(50) default 'stage-a' null,
  sort     varchar(50)                   null,
  gender   varchar(50)                   null,
  food     int         default 100       null,
  health   int         default 100       null,
  progress int         default 0         null,
  coords   text                          null,
  PRIMARY KEY (plantid),
  FOREIGN KEY (building) REFERENCES houselocations (name) on update cascade on delete cascade,
  CHECK (house_plants.food <= 100),
  CHECK (house_plants.food > 0),
  CHECK (house_plants.health <= 100),
  CHECK (house_plants.health > 0),
  CHECK (house_plants.progress <= 100),
  CHECK (house_plants.progress > 0)
);

create table if not exists lapraces
(
  id          int auto_increment,
  name        varchar(50) null,
  checkpoints text        null,
  records     text        null,
  creator     varchar(50) null,
  distance    int         null,
  raceid      varchar(50) null,
  PRIMARY KEY (id),
  FOREIGN KEY (creator) REFERENCES players (license) on update cascade on delete cascade
);

create table if not exists occasion_vehicles
(
  id          int auto_increment,
  seller      varchar(50) null,
  price       int         null,
  description longtext    null,
  plate       varchar(50) null,
  model       varchar(50) null,
  mods        text        null,
  occasionid  varchar(50) null,
  PRIMARY KEY (id),
  FOREIGN KEY (seller) REFERENCES players (citizenid) on update cascade on delete cascade
);

create table if not exists permissions
(
  id         int auto_increment,
  name       varchar(255) not null,
  license    varchar(255) not null,
  permission varchar(255) not null,
  PRIMARY KEY (id),
  FOREIGN KEY (license) REFERENCES players (license) on update cascade on delete cascade
);

create table if not exists phone_invoices
(
  id              int(10) auto_increment,
  citizenid       varchar(50)   null,
  amount          int default 0 not null,
  society         tinytext      null,
  sender          varchar(50)   null,
  sendercitizenid varchar(50)   null,
  PRIMARY KEY (id),
  FOREIGN KEY (citizenid) REFERENCES players (citizenid) on update cascade on delete cascade,
  FOREIGN KEY (sendercitizenid) REFERENCES players (citizenid) on update cascade on delete cascade,
  CHECK ( phone_invoices.amount > 0)
);

create table if not exists phone_messages
(
  id        int auto_increment,
  citizenid varchar(50) null,
  number    varchar(50) null,
  messages  text        null,
  PRIMARY KEY (id),
  FOREIGN KEY (citizenid) REFERENCES players (citizenid) on update cascade on delete cascade
);

create table if not exists phone_tweets
(
  id        int auto_increment,
  citizenid varchar(50)                          null,
  sender    varchar(50)                          null,
  message   text                                 null,
  date      datetime default current_timestamp() null,
  PRIMARY KEY (id),
  FOREIGN KEY (citizenid) REFERENCES players (citizenid) on update cascade on delete cascade
);

create table if not exists player_boats
(
  id        int auto_increment,
  citizenid varchar(50)     null,
  model     varchar(50)     null,
  plate     varchar(50)     null,
  boathouse varchar(50)     null,
  fuel      int default 100 not null,
  state     int default 0   not null,
  PRIMARY KEY (id),
  FOREIGN KEY (citizenid) REFERENCES players (citizenid) on update cascade on delete cascade
);

create table if not exists player_contacts
(
  id        int auto_increment,
  citizenid varchar(50)             null,
  name      varchar(50)             null,
  number    varchar(50)             null,
  iban      varchar(50) default '0' not null,
  PRIMARY KEY (id),
  FOREIGN KEY (citizenid) REFERENCES players (citizenid) on update cascade on delete cascade
);

create table if not exists player_houses
(
  id          int(255) auto_increment,
  house       varchar(50) not null,
  identifier  varchar(50) null,
  citizenid   varchar(50) null,
  keyholders  text        null,
  decorations text        null,
  stash       text        null,
  outfit      text        null,
  logout      text        null,
  PRIMARY KEY (id),
  FOREIGN KEY (citizenid) REFERENCES players (citizenid) on update cascade on delete cascade
);

create table if not exists player_mails
(
  id        int auto_increment,
  citizenid varchar(50)                           null,
  sender    varchar(50)                           null,
  subject   varchar(50)                           null,
  message   text                                  null,
  `read`    tinyint   default 0                   null,
  mailid    int                                   null,
  date      timestamp default current_timestamp() null,
  button    text                                  null,
  PRIMARY KEY (id),
  FOREIGN KEY (citizenid) REFERENCES players (citizenid) on update cascade on delete cascade
);

create table if not exists player_outfits
(
  id         int auto_increment,
  citizenid  varchar(50) null,
  outfitname varchar(50) not null,
  model      varchar(50) null,
  skin       text        null,
  outfitId   varchar(50) not null,
  PRIMARY KEY (id),
  FOREIGN KEY (citizenid) REFERENCES players (citizenid) on update cascade on delete cascade
);

create table if not exists player_vehicles
(
  id              int auto_increment,
  license         varchar(50)                  null,
  citizenid       varchar(50)                  null,
  vehicle         varchar(50)                  null,
  hash            varchar(50)                  null,
  mods            longtext collate utf8mb4_bin null,
  plate           varchar(50)                  not null,
  fakeplate       varchar(50)                  null,
  garage          varchar(50)                  null,
  fuel            int   default 100            null,
  engine          float default 1000           null,
  body            float default 1000           null,
  state           int   default 1              null,
  depotprice      int   default 0              not null,
  drivingdistance int(50)                      null,
  status          text                         null,
  balance         int   default 0              not null,
  paymentamount   int   default 0              not null,
  paymentsleft    int   default 0              not null,
  financetime     int   default 0              not null,
  PRIMARY KEY (id),
  FOREIGN KEY (citizenid) REFERENCES players (citizenid) on update cascade on delete cascade,
  CHECK ( fuel > 0),
  CHECK ( fuel <= 100),
  CHECK ( engine > 0),
  CHECK ( engine <= 1000),
  CHECK ( body > 0),
  CHECK ( body <= 1000)
);

create table if not exists player_warns
(
  id               int auto_increment,
  senderIdentifier varchar(50) null,
  targetIdentifier varchar(50) null,
  reason           text        null,
  warnId           varchar(50) null,
  PRIMARY KEY (id)
);

create table if not exists playerskins
(
  id        int auto_increment,
  citizenid varchar(255)      not null,
  model     varchar(255)      not null,
  skin      text              not null,
  active    tinyint default 1 not null,
  PRIMARY KEY (id),
  FOREIGN KEY (citizenid) REFERENCES players (citizenid) on update cascade on delete cascade,
  CHECK ( active < 2)
);

create table if not exists inventoryitems
(
  inventorytype varchar(10) NOT NULL,
  inventoryid   varchar(50) NOT NULL,
  slot          int(11)     NOT NULL,
  name          varchar(50) DEFAULT NULL,
  info          longtext    DEFAULT NULL,
  amount        int(11)     DEFAULT NULL,
  quality       int(11)     DEFAULT NULL,
  createtime    int(11)     DEFAULT NULL,
  PRIMARY KEY (inventorytype, inventoryid, slot)
);