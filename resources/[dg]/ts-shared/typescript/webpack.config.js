const client = require('../../../../webpack/webpack.client');
const server = require('../../../../webpack/webpack.server');

module.exports = (p1, args) => [
  client(p1, args, "index"),
  server(p1, args, "index")
]
