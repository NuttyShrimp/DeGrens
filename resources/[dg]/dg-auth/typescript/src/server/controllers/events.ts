import { Config } from "@dgx/server"
import { setPrivateToken } from "helpers/privateToken";
import { addStartedResource, createList } from "helpers/resources";

setImmediate(async () => {
  createList();
  await Config.awaitConfigLoad();
  setPrivateToken(Config.getConfigValue('auth.private_key'))
})

on("onResourceStart", (resName: string) => {
  addStartedResource(resName);
})

on('dg-config:moduleLoaded', (name: string, data: { private_key: string }) => {
  if (name !== 'auth') return;
  setPrivateToken(data.private_key)
})
