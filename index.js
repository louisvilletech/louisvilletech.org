var fs = require("fs");
var path = require("path");
var ical2json = require("ical2json");
var _ = require("lodash");

var icsDir = "ics";
var eventJson = "data/events.json";

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
	if (tz.VTIMEZONE) {
		tz = tz.VTIMEZONE[0];
	}
	return tz.VEVENT;
}

function hiddenFile(file) {
	return file[0] === ".";
}



var events = _.chain(fs.readdirSync(icsDir))
	.reject(hiddenFile)
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

function fixText(text) {
	return text.replace(/\\n/g, "\n").replace(/\\,/g, ",");
}

function fixEvent(event) {
	event.SUMMARY = fixText(event.SUMMARY);
	event.DESCRIPTION = fixText(event.DESCRIPTION);
	event.startDate = toDate(startTime(event)).toString();
	event.jsonDate = toDate(startTime(event)).toJSON();
	return event;
}
events = events.map(fixEvent);

fs.writeFileSync(eventJson, JSON.stringify(events, null, 4), { encoding: 'UTF8' });
