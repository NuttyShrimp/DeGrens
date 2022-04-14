local EX = exports['dg-sql']

local function checkArgs(query, params, cb)
  assert(type(query) == 'string', ('query must be a string, got %s'):format(query))
  if cb then
    assert(type(cb) == 'function', ('callback must be a function, got %s'):format(cb))
  end
  if (params) then
    assert(type(params) == 'table', ('params must be a table, got %s'):format(params))
  end
  return query, params, cb
end

SQL = {
  query = function(query, params, callback)
    EX:query(checkArgs(query, params, callback))
  end,
  scalar = function(query, params, callback)
    EX:scalar(checkArgs(query, params, callback))
  end,
  insert = function(query, values, callback)
    query, values, callback = checkArgs(query, values, callback)
    EX:insert(checkArgs(query, values, callback))
  end
}