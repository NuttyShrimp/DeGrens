const routes = {}

const registerRoute = (name, handler) => {
	routes[name] = handler;
}

global.exports('registerRoute', registerRoute)

SetHttpHandler((req, res) => {
	req.path = req.path.slice(1)
	// Preflight check
	if (req.method === "OPTIONS") return responseRequest(res, "", 200, { ["Access-Control-Allow-Origin"]: "*"})
	if (req.method !== "POST") return responseRequest(res, "", 404)
	return req.setDataHandler(async body => {
		req.body = JSON.parse(body)
		try {
			if (!(await verifyToken(req))) {
				return responseRequest(res, "Invalid API token", 401)
			}
			if (!doesRouteExist(req.path)) {
				return responseRequest(res, "", 404);
			}
			return handleRoute(req, res);
		} catch (e) {
			console.error(e);
			responseRequest(res, "Encountered backend error", 500)
		}
	})
})

const doesRouteExist = (path) => {
	return Object.keys(routes).find(r => r == path);
}

const handleRoute = (req, res) => {
	const result = routes[req.path](req.body);
	if (result === undefined) return responseRequest(res, "Encountered backend error", 500)
	if (typeof result === "boolean") {
		if (!result) return responseRequest(res, "The request failed to process on our side", 502)
		return responseRequest(res, "")
	}
	return responseRequest(res, result)
}

const verifyToken = async (req) => {
	if (!req.body || !req.body.token) return false;
	const result = await global.exports.oxmysql.scalarSync('SELECT token, UNIX_TIMESTAMP(timestamp) as timestamp FROM api_tokens WHERE token=?', [req.body.token])
	if (!result) return false;
	if (Date.now() - result.timestamp > 3600 * 6) return false; // Not accepting any tokens that are older than 6 hours
	global.exports.oxmysql.execute('DELETE FROM api_tokens WHERE token=?', [req.body.token]); // Delete the token :)
	return true;
}

const responseRequest = (httpRes, res, code = 200, header = {}) => {
	if (typeof res === "string") {
		httpRes.writeHead(code, header);
		httpRes.send(res);
		return;
	}
	httpRes.writeHead(code, {"Content-Type": "application/json",...header});
	httpRes.send(JSON.stringify(res))
}