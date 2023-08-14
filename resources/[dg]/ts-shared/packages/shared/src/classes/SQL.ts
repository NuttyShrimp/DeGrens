class SQL {
  query<T = any>(query: string, params: (string | number | boolean)[], cb?: (result: T[]) => void): Promise<T[]> {
    return global.exports['dg-sql'].query(query, params, cb);
  }

  scalar<T = any>(query: string, params: (string | number | boolean)[], cb?: (result: T) => void): Promise<T> {
    return global.exports['dg-sql'].scalar(query, params, cb);
  }

  /**
   * Adds one of more rows to the database. in the specified table.
   * @returns If only one row is added, the id is returned. Otherwise, the amount of inserted rows.
   */
  insert(table: string, values: { [k: string]: any }[], cb?: (result: number) => void): Promise<number> {
    return global.exports['dg-sql'].insert(table, values, cb);
  }
}

export default {
  SQL: new SQL(),
};
