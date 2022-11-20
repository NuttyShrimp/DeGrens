CREATE TABLE IF NOT EXISTS queue_priority (
  steamid VARCHAR(255) NOT NULL,
  priority INT(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (steamid)
);