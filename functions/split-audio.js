

const serverless = require('serverless-http');
const app = require('../app'); // załóżmy, że główny kod jest w pliku app.js

module.exports.handler = serverless(app);
