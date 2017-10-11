"use strict";

var fs = require("fs");
var path = require("path");
var ical = require("ical");
var groups = require("./data/groups");
var R = require("ramda");

var icsDir = "ics";
var eventJson = "data/events.json";

var isHiddenFile = R.pipe(R.lensIndex(0), R.eq("."));

function expandRecurrences(event) {
  var future = new Date(Date.now());
  future.setDate(future.getDate() + 365); // adding years gives you a date in the year "116", so just add days. leap years aren't important, we just want a rough future date

  if (event.rrule === undefined) {
    return [event];
  }
  return event.rrule.all(function(date) {
    return date < future;
  }).map(function(date) {
    var copy = R.clone(event);
    var duration = copy.end - copy.start;
    copy.start = date;
    copy.end = new Date(date);
    copy.end.setMilliseconds(copy.end.getMilliseconds() + duration);
    return copy;
  });
}

function enhanceEvent(group, event) {
  if (event.location) {
    event.mapQuery = event.location.replace("(", " ").replace(")", " ");
  }

  var start = event.start;
  event.startDate = start.toString();
  event.startDateJson = start.toJSON();

  var end = event.end;
  event.endDate = end.toString();
  event.endDateJson = end.toJSON();
  if (end < Date.now()) {
    event.expired = true;
  }

  event.group = group;
  event.groupName = groups[group].name;
  event.groupUrl = groups[group].web;

  delete event.rrule;

  return event;
}

var icsPath = R.curryN(2, path.join)(icsDir);

function loadCal(filename) {
  var group = filename.substr(0, filename.indexOf("."));
  return R.pipe(
    R.values,
    R.filter(R.propEq("type", "VEVENT")),
    R.chain(expandRecurrences),
    R.map(enhanceEvent.bind(this, group))
  )(ical.parseFile(icsPath(filename)));
}

function isOld(date) {
  var now = new Date(Date.now());
  now.setDate(now.getDate() - 1);
  return date < now;
}

function writeJson(filename, data) {
  fs.writeFileSync(filename, JSON.stringify(data, null, 4), { encoding: "UTF8" });
}

var events = R.pipe(
  R.reject(isHiddenFile),
  R.chain(loadCal),
  R.sortBy(R.prop("start")),
  R.reject(R.compose(isOld, R.prop("end")))
)(fs.readdirSync(icsDir));

writeJson(eventJson, events);
