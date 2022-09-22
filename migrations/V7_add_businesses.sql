CREATE TABLE IF NOT EXISTS business_type
(
  id   INT(11)      NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS business
(
  id              INT(11)      NOT NULL AUTO_INCREMENT,
  label           VARCHAR(255) NOT NULL,
  business_type   INT(11)      NOT NULL,
  bank_account_id VARCHAR(255),
  PRIMARY KEY (id),
  FOREIGN KEY fk_business_business_type (business_type) REFERENCES business_type (id) on update cascade on delete cascade,
  FOREIGN KEY fk_business_bank_account (bank_account_id) REFERENCES bank_accounts (account_id) on update cascade on delete cascade
);

CREATE TABLE IF NOT EXISTS business_role
(
  id          INT(11)      NOT NULL AUTO_INCREMENT,
  name        VARCHAR(255) NOT NULL,
  permissions INT(11)      NOT NULL,
  business_id INT(11)      NOT NULL,
  PRIMARY KEY (id),
  UNIQUE (name, business_id),
  FOREIGN KEY fk_business_role_business (business_id) REFERENCES business (id) on update cascade on delete cascade
);

CREATE TABLE IF NOT EXISTS business_employee
(
  id          INT(11) NOT NULL AUTO_INCREMENT,
  is_owner    BOOLEAN NOT NULL DEFAULT FALSE,
  citizenid   INT(11) NOT NULL,
  role_id     INT(11) NOT NULL,
  business_id INT(11) NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY fk_business_employee_business (business_id) REFERENCES business (id) on update cascade on delete cascade,
  FOREIGN KEY fk_business_employee_business_role (role_id) REFERENCES business_role (id) on update cascade on delete RESTRICT,
  FOREIGN KEY fk_business_employee_character (citizenid) REFERENCES characters (citizenid) on update cascade on delete cascade
);

CREATE TABLE IF NOT EXISTS business_log
(
  id          INT(11) NOT NULL AUTO_INCREMENT,
  citizenid   INT(11) NOT NULL,
  business_id INT(11) NOT NULL,
  type        VARCHAR(255) NOT NULL,
  action      TEXT    NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY fk_business_log_employee_business (business_id) REFERENCES business (id) on update cascade on delete cascade,
  FOREIGN KEY fk_business_log_employee_character (citizenid) REFERENCES characters (citizenid) on update cascade on delete cascade
);