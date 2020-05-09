// keys.js - figure which set of credentials to use (prod or local)
// Heroku sets the NODE_ENV to "production"
if (process.env.NODE_ENV === "production") {
    module.exports = require("./prod");
  } else {
    module.exports = require("./dev");
  }