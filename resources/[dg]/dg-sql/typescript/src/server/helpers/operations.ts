import handler from '../classes/handler';
import { OkPacket } from 'mysql2';

const prepareInsertStatement = (table: string, values: any[]) => {
  if (values.length < 1) {
    throw new Error('No values to insert');
  }
  if (typeof values[0] !== 'object' || Array.isArray(values[0])) {
    throw new Error('Values must be an array of objects');
  }
  const keys = Object.keys(values[0]);
  let sql = `INSERT INTO ${table} (${keys.join(', ')})
             VALUES `;
  values.forEach((value, index) => {
    sql += `(${keys.map(() => `?`).join(', ')})`;
    if (index !== values.length - 1) {
      sql += ', ';
    }
  });
  return sql;
};

export const doQuery = async (
  query: string,
  params: any[] = [],
  cb?: (result: any) => void,
  resource = GetInvokingResource()
) => {
  const resultPromise = handler.query(query, params, resource);
  if (cb) {
    cb(await resultPromise);
    return;
  }
  return resultPromise;
};

export const doSscalar = async (query: string, params: any[] = [], cb?: (result: any) => void) => {
  const result = await doQuery(query, params, cb, GetInvokingResource());
  let scalarInfo = result ? (Array.isArray(result) ? result[0] ?? {} : Object.values(result)[0]) : null;
  if (cb) {
    cb(scalarInfo);
    return;
  }
  return scalarInfo;
};

export const doInsert = async (query: string, params: any[] = [], cb?: (result: any) => void) => {
  const result: OkPacket = await doQuery(query, params, cb, GetInvokingResource());
  if (cb) {
    cb(result.insertId ?? null);
    return;
  }
  return result.insertId ?? null;
};

export const doInsertValues = async (table: string, values: any[] = [], cb?: (result: any) => void) => {
  if (values.length === 0) {
    if (cb) {
      cb(null);
    }
    return;
  }
  const query = prepareInsertStatement(table, values);
  const result = (await doQuery(
    query,
    values.reduce((acc, valObj) => {
      Object.values(valObj).forEach(val => acc.push(val));
      return acc;
    }, []),
    cb,
    GetInvokingResource()
  )) as OkPacket;
  if (cb) {
    cb(result.affectedRows == 1 ? result.insertId : result.affectedRows ?? null);
    return;
  }
  return result.affectedRows == 1 ? result.insertId : result.affectedRows ?? null;
};
