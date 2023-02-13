export const getAPIPlayer = (src: number): API.Player => {
  const Player = DGCore.Functions.GetPlayer(src);
  return {
    source: src,
    cid: Player.PlayerData.citizenid,
    firstname: Player.PlayerData?.charinfo?.firstname ?? GetPlayerName(String(src)),
    lastname: Player.PlayerData?.charinfo?.lastname ?? ''
  }
}
