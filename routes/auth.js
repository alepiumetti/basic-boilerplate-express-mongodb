/* jshint esversion: 6 */
const { login, logout } = require("../controllers/auth");

const { rateLimiter } = require("../middlewares/app");

module.exports = (application) => {
  application.route("/endpoint/login").post(rateLimiter, login);

  application.route("/endpoint/logout").get(rateLimiter, logout);
};
