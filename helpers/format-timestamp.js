const moment = require("moment-timezone");

module.exports = function(context) {
  var date = new Date(context * 1000);
  return moment.tz(date, "America/New_York").fromNow();
};
