DROP TABLE IF EXISTS player_vehicles;
DROP TABLE IF EXISTS vehicle_status;
DROP TABLE IF EXISTS vehicle_stock;
DROP TABLE IF EXISTS vehicle_restocks;
DROP TABLE IF EXISTS vehicle_upgrades;

CREATE TABLE IF NOT EXISTS player_vehicles
(
  vin       VARCHAR(255)                        NOT NULL,
  cid       INT                                 NOT NULL,
  model     VARCHAR(255)                        NOT NULL,
  plate     VARCHAR(8)                          NOT NULL,
  fakeplate VARCHAR(8)                                   DEFAULT NULL,
  state     ENUM ('parked', 'out', 'impounded') NOT NULL DEFAULT 'parked',
  garageId  VARCHAR(255)                        NOT NULL default 'alta_apartments',
  harness   SMALLINT(6)                         NOT NULL DEFAULT 0,
  stance    LONGTEXT                                     DEFAULT NULL,
  wax       INT                                          DEFAULT NULL,
  nos       SMALLINT(6)                         NOT NULL DEFAULT 0,
  PRIMARY KEY (vin),
  FOREIGN KEY (cid) REFERENCES characters (citizenid) on update cascade on delete cascade
);

CREATE TABLE IF NOT EXISTS vehicle_status
(
  vin     VARCHAR(255) NOT NULL,
  body    VARCHAR(255) NOT NULL DEFAULT 1000,
  engine  VARCHAR(255) NOT NULL DEFAULT 1000,
  fuel    VARCHAR(255) NOT NULL DEFAULT 100,
  wheels  LONGTEXT     NOT NULL DEFAULT '[1000,1000,1000,1000,1000,1000,1000,1000,1000,1000]',
  windows LONGTEXT     NOT NULL DEFAULT '[1,1,1,1,1,1,1,1]',
  doors   LONGTEXT     NOT NULL DEFAULT '[0,0,0,0,0,0,0,0]',
  PRIMARY KEY (vin),
  FOREIGN KEY (vin) REFERENCES player_vehicles (vin) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS vehicle_garage_logs
(
  id      INT          NOT NULL AUTO_INCREMENT,
  vin     VARCHAR(255) NOT NULL,
  cid     INT          NOT NULL,
  logDate DATE         NOT NULL DEFAULT current_timestamp,
  action  ENUM ('parked', 'retrieved'),
  state   TEXT         NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (vin) REFERENCES player_vehicles (vin) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS vehicle_transfer_logs
(
  id      INT          NOT NULL AUTO_INCREMENT,
  vin     VARCHAR(255) NOT NULL,
  origin  INT          NOT NULL,
  target  INT          NOT NULL,
  logDate DATE         NOT NULL DEFAULT current_timestamp,
  PRIMARY KEY (id),
  FOREIGN KEY (vin) REFERENCES player_vehicles (vin) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (target) REFERENCES characters (citizenid) on update cascade on delete cascade
);

CREATE TABLE IF NOT EXISTS vehicle_upgrades
(
  vin      VARCHAR(255) NOT NULL,
  cosmetic LONGTEXT     NOT NULL DEFAULT '{}',
  items    LONGTEXT     NOT NULL DEFAULT '[]',
  PRIMARY KEY (vin),
  FOREIGN KEY (vin) REFERENCES player_vehicles (vin) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS vehicle_service_status
(
  vin        VARCHAR(255) NOT NULL,
  axle       FLOAT        NOT NULL DEFAULT 1000,
  brakes     FLOAT        NOT NULL DEFAULT 1000,
  engine     FLOAT        NOT NULL DEFAULT 1000,
  suspension FLOAT        NOT NULL DEFAULT 1000,
  PRIMARY KEY (vin),
  FOREIGN KEY (vin) REFERENCES player_vehicles (vin) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS vehicle_stock
(
  model VARCHAR(255) NOT NULL,
  stock INT          NOT NULL,
  PRIMARY KEY (model)
);

CREATE TABLE IF NOT EXISTS vehicle_restocks
(
  id          INT          NOT NULL AUTO_INCREMENT,
  model       VARCHAR(255) NOT NULL,
  restockDate DATE         NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (model) REFERENCES vehicle_stock (model) on update cascade on delete cascade
);

CREATE TABLE IF NOT EXISTS vehicle_depot_info
(
  id    INT          NOT NULL AUTO_INCREMENT,
  vin   VARCHAR(255) NOT NULL,
  price INT          NOT NULL,
  created_at INT     NOT NULL DEFAULT UNIX_TIMESTAMP(CURRENT_TIMESTAMP),
  until INT          NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (vin) REFERENCES player_vehicles (vin) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS vehicle_resale
(
  vin   VARCHAR(255),
  model VARCHAR(255),
  plate VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(vin)
);

CREATE TABLE IF NOT EXISTS vehicle_strikes (
  vin   VARCHAR(255) NOT NULL,
  strikes INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (vin),
  FOREIGN KEY (vin) REFERENCES player_vehicles (vin) ON UPDATE CASCADE ON DELETE CASCADE
);