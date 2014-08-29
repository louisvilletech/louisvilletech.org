var fs = require("fs");
var path = require("path");
var ical2json = require("ical2json");
var _ = require("lodash");

var icsDir = "ics";

function wholePath(file) {
	return path.join(icsDir, file);
}
function readUtf8(path) {
	return fs.readFileSync(path, { encoding: 'UTF8' });
}
function cal2vcal(cal) {
	return cal.VCALENDAR;
}
function cal2tz(cal) {
	return cal.VTIMEZONE || [];
}
function tz2event(tz) {
	return tz.VEVENT;
}

var events = _.chain(fs.readdirSync(icsDir))
	.map(wholePath)
	.map(readUtf8)
	.map(ical2json.convert)
	.map(cal2vcal)
	.flatten()
	.map(cal2tz)
	.flatten()
	.map(tz2event)
	.flatten()
	.sortBy(function(event) {
		return toDate(startTime(event));
	})
	.value();

function startTime(event) {
	for (var prop in event) {
		if (event.hasOwnProperty(prop)) {
			if (prop.indexOf("DTSTART") === 0) {
				return event[prop];
			}
		}
	}
}

function toDate(time) {
	var year = time.substr(0, 4);
	var month = time.substr(4, 2) - 1;
	var day = time.substr(6, 2);
	var hour = time.substr(9, 2);
	var min = time.substr(11, 2);
	var sec = time.substr(13, 2);
	return new Date(year, month, day, hour, min, sec);
}

console.log(events.map(function(event) {
	return event.SUMMARY + " - " + toDate(startTime(event));
}));
