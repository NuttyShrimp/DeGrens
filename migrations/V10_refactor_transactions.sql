/*
  First we add the new columns at correct position and set default of change to 0 for next step
*/
ALTER TABLE transaction_log
  ADD COLUMN IF NOT EXISTS origin_account_name VARCHAR(255) NOT NULL AFTER origin_account_id,
  ADD COLUMN IF NOT EXISTS origin_change FLOAT(18, 2) NOT NULL DEFAULT 0 AFTER origin_account_name,
  ADD COLUMN IF NOT EXISTS target_account_name VARCHAR(255) NOT NULL AFTER target_account_id,
  ADD COLUMN IF NOT EXISTS target_change FLOAT(18, 2) NOT NULL DEFAULT 0 AFTER target_account_name;

/*
  We get the old value in change column and insert into both new change columns, if fails we got the default of 0
*/
UPDATE transaction_log AS tl
SET tl.origin_change = (SELECT `change` FROM transaction_log WHERE transaction_id = tl.transaction_id) AND
    tl.target_change = (SELECT `change` FROM transaction_log WHERE transaction_id = tl.transaction_id);

/*
  Remove default value and remove old column
*/
ALTER TABLE transaction_log
  MODIFY origin_change FLOAT(18, 2) NOT NULL,
  MODIFY target_change FLOAT(18, 2) NOT NULL,
  DROP `change`;

/*
  Remove constraints
*/
ALTER TABLE transaction_log
  DROP CONSTRAINT IF EXISTS fk_transaction_log_origin_account,
  DROP CONSTRAINT IF EXISTS fk_transaction_log_trigger_account,
  DROP CONSTRAINT IF EXISTS fk_transaction_log_trigger_cid,
  DROP CONSTRAINT IF EXISTS fk_transaction_log_acceptor_cid;

ALTER TABLE transaction_log
  DROP INDEX IF EXISTS fk_transaction_log_origin_account,
  DROP INDEX IF EXISTS fk_transaction_log_trigger_account,
  DROP INDEX IF EXISTS fk_transaction_log_trigger_cid,
  DROP INDEX IF EXISTS fk_transaction_log_acceptor_cid;
