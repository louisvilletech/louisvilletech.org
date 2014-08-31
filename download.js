"use strict";

var fs = require("fs");
var path = require("path");
var http = require("http");

var groups = require("./groups");
var IcsDir = "ics";
var MaxCalendarAgeMinutes = 30;

for (var groupId in groups) {
	if (groups.hasOwnProperty(groupId)) {
		var group = groups[groupId];
		var icsPath = getIcsPath(groupId);
		if (group.calendar) {
			fileAgeMinutes(icsPath, downloadOldCalendars.bind(undefined, group));
		}
	}
}

function fileAgeMinutes(path, callback) {
	fs.stat(path, function(err, stats) {
		if (err) {
			if (err.code === "ENOENT") {
				callback(undefined, path, msToMin(new Date().getTime()));
				return;
			}
			callback(err);
			return;
		}
		callback(undefined, path, msToMin(new Date() - stats.mtime));
	});
}

function msToMin(ms) {
	return Math.floor(ms / 1000 / 60);
}

function getIcsPath(groupId) {
	return path.join(IcsDir, groupId + ".ics");
}

function downloadOldCalendars(group, err, path, ageMinutes) {
	if (err) {
		console.error(err);
		return;
	}
	console.log(path, "is", ageMinutes, "old");
	if (ageMinutes > MaxCalendarAgeMinutes) {
		downloadCalendar(group.calendar, path);
	}
}

function downloadCalendar(url, path) {
	console.log("downloading", url, "to", path);
	http.get(url, function(res) {
		console.log(res.statusCode);
		var file = fs.createWriteStream(path);
		res.pipe(file);
	}).on("error", function(e) {
		console.error(e);
	});
}
