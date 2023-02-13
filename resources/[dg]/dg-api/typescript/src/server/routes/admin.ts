import { Admin } from "@dgx/server";
import { validateBody } from "helpers/bodyHelper";
import { registerRoute } from "sv_routes";

registerRoute("POST", "/admin/actions/warn", async (req, res) => {
  if (!req.body.target) {
    res(400, {
      message: "No target given to warn"
    })
    return;
  }
  await Admin.warn(0, req.body.target, req.body.reason);
  res(200, {
    result: true
  })
})

registerRoute("POST", "/admin/actions/kick", async (req, res) => {
  if (!req.body.target) {
    res(400, {
      message: "No target given to kick"
    })
    return;
  }
  if (!req.body.reason || !String(req.body.reason) || req.body.reason.trim() === "") {
    res(400,{
      message: "reason must be valid string and cannot be empty"
    })
    return;
  }
  if (!req.body.points || Number.isNaN(Number(req.body.points)) || Number(req.body.points) < 0) {
    res(400,{
      message: "points must be valid number that is positive or 0"
    })
    return;
  }
  await Admin.kick(0, req.body.target, req.body.reason, req.body.points);
  res(200, {
    result: true
  })
})

registerRoute("POST", "/admin/actions/ban", async (req, res) => {
  if (!validateBody(res, req.body, ["target", "length", "reason", "points"])) {
    return;
  }
  if (!req.body.target) {
    res(400, {
      message: "No target given to ban"
    })
    return;
  }
  if (!req.body.reason || !String(req.body.reason) || req.body.reason.trim() === "") {
    res(400,{
      message: "reason must be a valid string and cannot be empty"
    })
    return;
  }
  if (Number.isNaN(Number(req.body.points)) || Number(req.body.points) < 0) {
    res(400,{
      message: "points must be a valid number that is positive or 0"
    })
    return;
  }
  if (Number.isNaN(Number(req.body.length)) || Number(req.body.length) < -1 || Number(req.body.length) === 0) {
    res(400,{
      message: "length must be a valid number that is positive or -1"
    })
    return;
  }
  await Admin.ban(0, req.body.target, req.body.reason, req.body.points, req.body.length);
  res(200, {
    result: true,
  });
})