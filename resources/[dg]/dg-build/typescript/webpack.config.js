const client = require('../../../../webpack/webpack.client');

module.exports = (p1, args) => [
  client(p1, args, false, true),  
]
