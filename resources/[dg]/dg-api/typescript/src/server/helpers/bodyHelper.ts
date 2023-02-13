export const validateBody = (res: API.Responser, reqBody: Record<string, any>, required: string[]) => {
  if (!reqBody || typeof reqBody !== 'object') {
    res(400, {
      message: "Request body does not exists or is not a object"
    })
    return false;
  }
  for (let rk of required) {
    if (!reqBody[rk] || reqBody[rk] === null) {
      res(400, {
        message: `Request body does not contain ${rk}`
      })
    }
    return false;
  }
  return true;
}