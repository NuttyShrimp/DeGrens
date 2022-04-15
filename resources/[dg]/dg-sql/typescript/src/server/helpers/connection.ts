export const mysql_connection_string = GetConvar('mysql_connection_string', '');

export const connectionOptions = (() => {
  if (mysql_connection_string.includes('mysql://')) return { uri: mysql_connection_string };

  return mysql_connection_string
    .replace(/(?:host(?:name)|ip|server|data\s?source|addr(?:ess)?)=/gi, 'host=')
    .replace(/(?:user\s?(?:id|name)?|uid)=/gi, 'user=')
    .replace(/(?:pwd|pass)=/gi, 'password=')
    .replace(/(?:db)=/gi, 'database=')
    .split(';')
    .reduce<Record<string, string>>((connectionInfo, parameter) => {
      const [key, value] = parameter.split('=');
      connectionInfo[key] = value;
      return connectionInfo;
    }, {});
})();
