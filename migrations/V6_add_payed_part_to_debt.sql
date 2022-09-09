ALTER TABLE debts
    ADD COLUMN IF NOT EXISTS payed       BIGINT NOT NULL DEFAULT 0 AFTER debt,
    ADD COLUMN IF NOT EXISTS origin_name TEXT   NOT NULL AFTER given_by;

ALTER TABLE debts
    MODIFY given_by INT NULL,
    MODIFY debt FLOAT(18, 2);

CREATE TABLE tax_logs
(
    id   INT AUTO_INCREMENT,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

INSERT INTO tax_logs (date)
VALUES (CURRENT_TIMESTAMP);

ALTER TABLE bank_accounts
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

ALTER TABLE bank_accounts
    MODIFY balance FLOAT(18, 2);

ALTER TABLE transaction_log
    MODIFY `change` FLOAT(18, 2);