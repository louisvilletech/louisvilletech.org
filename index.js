var fs = require("fs");

var icsDir = "ics";

fs.readdirSync(icsDir).forEach(function(dir) {
	console.log(dir);
});
