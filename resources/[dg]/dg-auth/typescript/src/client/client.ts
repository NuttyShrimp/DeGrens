setImmediate(async () => {
  while (!NetworkIsSessionStarted()) {
    await new Promise(res => setTimeout(res, 100));
  }
  emitNet('dg-auth:authenticate');
});
