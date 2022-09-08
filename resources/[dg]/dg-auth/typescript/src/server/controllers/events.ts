import { Config } from "@dgx/server"
import { setPrivateToken } from "helpers/privateToken";

setImmediate(async () => {
  await Config.awaitConfigLoad();
  setPrivateToken(Config.getConfigValue('auth.private_key'))
})

on('dg-config:moduleLoaded', (name: string, data: { private_key: string }) => {
  if (name !== 'auth') return;
  setPrivateToken(data.private_key)
})
