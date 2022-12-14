CREATE TABLE IF NOT EXISTS user_kill_stats (
  steamid VARCHAR(255) NOT NULL,
  shots INT DEFAULT 0,
  kills INT DEFAULT 0,
  headshots INT DEFAULT 0,
  PRIMARY KEY (`steamid`),
  FOREIGN KEY (`steamid`) REFERENCES `users` (`steamid`) ON UPDATE CASCADE ON DELETE CASCADE
)
