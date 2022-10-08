/*
  Modify columns to allow null
*/
ALTER TABLE transaction_log
  MODIFY triggered_by VARCHAR(255) NOT NULL,
  MODIFY accepted_by VARCHAR(255) NULL;
