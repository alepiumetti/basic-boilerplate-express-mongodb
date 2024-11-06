/* jshint esversion: 6 */

module.exports = (application) => {
	// core routes
	require('./auth')(application);
	require('./usuarios')(application);
	// require("./views")(application);

	// custom routes
};
