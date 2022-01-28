create database if not exists degrens2;
use degrens2;

create table if not exists players
(
  citizenid    int                                   not null auto_increment,
  cid          int                                   null,
  steamid      varchar(255)                          not null,
  license      varchar(255)                          not null,
  discord      varchar(255)                          not null,
  name         varchar(255)                          not null,
  firstname    text                                  not null,
  lastname     text                                  not null,
  birthdate    varchar(11)                           not null,
  gender       int(1)                                not null,
  backstory    text                                  not null,
  nationality  text                                  not null,
  phone        varchar(255)                          not null,
  cash         bigint    default 0,
  gang         text                                  null,
  position     text                                  not null,
  job          text                                  not null,
  metadata     text                                  not null,
  last_updated timestamp default current_timestamp() not null on update current_timestamp(),
  PRIMARY KEY (citizenid),
  INDEX (steamid),
  INDEX (license)
) AUTO_INCREMENT = 1000;

create table if not exists apartments
(
  id        int auto_increment,
  citizenid int not null,
  PRIMARY KEY (id),
  FOREIGN KEY (citizenid) REFERENCES players (citizenid) on update cascade on delete cascade
);

create table if not exists api_tokens
(
  token     varchar(255) default ''                  not null,
  timestamp timestamp    default current_timestamp() not null,
  PRIMARY KEY (token)
);

create table if not exists bans
(
  id       int auto_increment,
  name     varchar(50)                        null,
  steamid  varchar(50)                        null,
  license  varchar(50)                        null,
  discord  varchar(50)                        null,
  ip       varchar(50)                        null,
  reason   text                               null,
  expire   int                                null,
  bannedby varchar(255) default 'LeBanhammer' not null,
  PRIMARY KEY (id)
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
  seller      int         null,
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
  steamid    varchar(255) not null,
  permission varchar(255) not null,
  PRIMARY KEY (id),
  FOREIGN KEY (steamid) REFERENCES players (steamid) on update cascade on delete cascade
);

create table if not exists player_boats
(
  id        int auto_increment,
  citizenid int             null,
  model     varchar(50)     null,
  plate     varchar(50)     null,
  boathouse varchar(50)     null,
  fuel      int default 100 not null,
  state     int default 0   not null,
  PRIMARY KEY (id),
  FOREIGN KEY (citizenid) REFERENCES players (citizenid) on update cascade on delete cascade
);

create table if not exists player_houses
(
  id          int(255) auto_increment,
  house       varchar(50) not null,
  identifier  varchar(50) null,
  citizenid   int         null,
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
  citizenid int                                   null,
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
  citizenid  int         null,
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
  citizenid       int                          null,
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
  citizenid int               not null,
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

CREATE TABLE IF NOT EXISTS phone_contacts
(
  id    int(11)      NOT NULL AUTO_INCREMENT,
  cid   int          NOT NULL,
  label varchar(255) NOT NULL,
  phone varchar(255) NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (cid) REFERENCES players (citizenid) on update cascade on delete cascade
);

CREATE TABLE IF NOT EXISTS phone_tweets
(
  id    int(11)  NOT NULL AUTO_INCREMENT,
  cid   int      NOT NULL,
  tweet LONGTEXT NOT NULL,
  date  bigint   NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (cid) REFERENCES players (citizenid) on update cascade on delete cascade
);

CREATE TABLE IF NOT EXISTS phone_tweets_retweets
(
  tweetid int(11) NOT NULL,
  cid     int     NOT NULL,
  PRIMARY KEY (tweetid, cid),
  FOREIGN KEY (tweetid) REFERENCES phone_tweets (id) on update cascade on delete cascade,
  FOREIGN KEY (cid) REFERENCES players (citizenid) on update cascade on delete cascade
);

CREATE TABLE IF NOT EXISTS phone_tweets_likes
(
  tweetid int(11) NOT NULL,
  cid     int     NOT NULL,
  PRIMARY KEY (tweetid, cid),
  FOREIGN KEY (tweetid) REFERENCES phone_tweets (id) on update cascade on delete cascade,
  FOREIGN KEY (cid) REFERENCES players (citizenid) on update cascade on delete cascade
);

CREATE TABLE IF NOT EXISTS phone_messages
(
  id       int(11)      NOT NULL AUTO_INCREMENT,
  sender   varchar(255) NOT NULL, -- phone number adds supports for possible burner phone numbers
  receiver varchar(255) NOT NULL,
  message  text         NOT NULL,
  isread   tinyint(1)   NOT NULL,
  date     bigint       NOT NULL,
  PRIMARY KEY (id),
  CHECK ( isread < 2 ),
  CHECK ( date > 0 )
);

CREATE TABLE IF NOT EXISTS phone_notes
(
  id     int(11)      NOT NULL AUTO_INCREMENT,
  cid    int          NOT NULL,
  title  varchar(255) NOT NULL,
  note   longtext     NOT NULL,
  `date` bigint       NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (cid) REFERENCES players (citizenid) on update cascade on delete cascade,
  CHECK ( `date` > 0 )
);

CREATE TABLE IF NOT EXISTS phone_images
(
  id   int(11)      NOT NULL AUTO_INCREMENT,
  cid  int          NOT NULL,
  link varchar(255) NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (cid) REFERENCES players (citizenid) on update cascade on delete cascade
);

CREATE TABLE IF NOT EXISTS phone_mails
(
  id      int(11)      NOT NULL AUTO_INCREMENT,
  cid     int          NOT NULL,
  sender  varchar(255) NOT NULL,
  subject varchar(255) NOT NULL,
  message LONGTEXT     NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (cid) REFERENCES players (citizenid) on update cascade on delete cascade
);

CREATE TABLE IF NOT EXISTS bank_accounts
(
  account_id varchar(255)                             NOT NULL,
  name       varchar(255)                                      default 'Name',
  type       ENUM ('standard', 'savings', 'business') NOT NULL,
  balance    BIGINT                                   NOT NULL DEFAULT 0,
  PRIMARY KEY (account_id)
);

CREATE TABLE IF NOT EXISTS bank_accounts_access
(
  account_id   varchar(255) NOT NULL,
  cid          int          NOT NULL,
  access_level int(11)      NOT NULL default 1,
  PRIMARY KEY (account_id, cid),
  FOREIGN KEY (account_id) REFERENCES bank_accounts (account_id) on update cascade on delete cascade,
  FOREIGN KEY (cid) REFERENCES players (citizenid) on update cascade on delete cascade
);

CREATE TABLE IF NOT EXISTS transaction_log
(
  transaction_id    varchar(255)                                                     NOT NULL,
  origin_account_id varchar(255)                                                     NOT NULL,
  target_account_id varchar(255)                                                     NOT NULL,
  `change`          BIGINT                                                           NOT NULL,
  comment           LONGTEXT                                                         NOT NULL default '',
  triggered_by      int                                                              NOT NULL,
  accepted_by       int                                                              NOT NULL,
  date              bigint                                                           NOT NULL,
  type              ENUM ('transfer', 'deposit', 'withdraw', 'purchase', 'paycheck') NOT NULL,
  PRIMARY KEY (transaction_id),
  FOREIGN KEY (origin_account_id) REFERENCES bank_accounts (account_id) on update cascade on delete cascade,
  FOREIGN KEY (target_account_id) REFERENCES bank_accounts (account_id) on update cascade on delete cascade,
  FOREIGN KEY (triggered_by) REFERENCES players (citizenid) on update cascade on delete cascade,
  FOREIGN KEY (accepted_by) REFERENCES players (citizenid) on update cascade on delete cascade
);

CREATE TABLE IF NOT EXISTS player_paycheck
(
  cid    int    NOT NULL,
  amount BIGINT NOT NULL,
  PRIMARY KEY (cid),
  FOREIGN KEY (cid) REFERENCES players (citizenid) on update cascade on delete cascade
);

CREATE TABLE IF NOT EXISTS crypto
(
  crypto_name varchar(255) NOT NULL,
  value       INT          NOT NULL DEFAULT 100 comment 'How much 1 of this crypto is worth',
  PRIMARY KEY (crypto_name)
);

CREATE TABLE IF NOT EXISTS crypto_wallets
(
  cid         int          NOT NULL,
  crypto_name varchar(255) NOT NULL,
  amount      INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (cid, crypto_name),
  FOREIGN KEY (crypto_name) REFERENCES crypto (crypto_name) on update cascade on delete cascade,
  FOREIGN KEY (cid) REFERENCES players (citizenid) on update cascade on delete cascade
);

CREATE TABLE IF NOT EXISTS taxes
(
  tax_id   INT          NOT NULL AUTO_INCREMENT,
  tax_name varchar(255) NOT NULL,
  tax_rate INT          NOT NULL DEFAULT 0,
  set_date TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (tax_id)
);

CREATE TABLE IF NOT EXISTS debts
(
  id             INT                          NOT NULL AUTO_INCREMENT,
  cid            int                          NOT NULL,
  target_account varchar(255)                 NOT NULL,
  debt           BIGINT                       NOT NULL DEFAULT 0,
  type           ENUM ('debt', 'maintenance') NOT NULL DEFAULT 'debt',
  given_by       int                          NOT NULL,
  date           TIMESTAMP                    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reason         LONGTEXT                     NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (cid) REFERENCES players (citizenid) on update cascade on delete cascade,
  FOREIGN KEY (given_by) REFERENCES players (citizenid) on update cascade on delete cascade,
  FOREIGN KEY (target_account) REFERENCES bank_accounts (account_id) on update cascade on delete cascade
);

CREATE TABLE IF NOT EXISTS maintenance_fee_log
(
  id   INT       NOT NULL AUTO_INCREMENT,
  date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);