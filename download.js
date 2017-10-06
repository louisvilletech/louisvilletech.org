"use strict";

var async = require("async");
var fs = require("fs");
var http = require("http");
var https = require("https");
var path = require("path");
var R = require("ramda");

var groups = require("./data/groups");
var IcsDir = "ics";
var MaxCalendarAgeMinutes = 30;
var ConcurrentDownloads = 5;

var setIdFromPair = R.apply(R.assoc("id"));
var hasCalendar = R.has("calendar");

function getIcsPath(groupId) {
  return path.join(IcsDir, groupId + ".ics");
}

function getIcsPathForGroup(group) {
  return R.assoc("icsPath", getIcsPath(group.id), group);
}

var getGroupProperties = R.pipe(R.toPairs, R.map(setIdFromPair), R.filter(hasCalendar), R.map(getIcsPathForGroup));
groups = getGroupProperties(groups);

function swallowError(callback) {
  return function(err) {
    if (err) {
      callback(undefined);
      return;
    }
    callback.apply(this, arguments);
  };
}

function statForGroup(group, callback) {
  fs.stat(group.icsPath, swallowError(callback));
}

function msToMin(ms) {
  return Math.floor(ms / 1000 / 60);
}

function httpGet(url, callback) {
  var proto = url.indexOf("https://") === 0 ? https : http;
  proto.get(url, function(res) {
    callback(undefined, res);
  }).on("error", function(err) {
    callback(err);
  });
}

function downloadCalendar(url, filename, callback) {
  console.log("  GET", url, "=>", filename);
  httpGet(url, function(err, res) {
    if (err) {
      callback(err);
      return;
    }
    if (res.statusCode === 200) {
      console.log("    writing", filename);
      var file = fs.createWriteStream(filename);
      res.pipe(file);
      callback();
    } else {
      callback("Got " + res.statusCode + " when reading " + url);
    }
  });
}

async.map(groups, statForGroup, function(err, stats) {
  if (err) {
    console.error(err);
    return;
  }

  var returnOldAge = function() {
    return MaxCalendarAgeMinutes + 1;
  };
  var statsToAge = R.ifElse(R.identity, R.pipe(R.prop("mtime"), R.subtract(new Date()), msToMin), returnOldAge);
  var ages = R.map(statsToAge, stats);
  var pairs = R.zip(ages, groups);

  var groupsWithAge = R.map(R.apply(R.assoc("age")), pairs);

  var fileIsTooOld = R.pipe(R.prop("age"), R.lt(MaxCalendarAgeMinutes));
  var groupsWithOldFiles = R.filter(fileIsTooOld, groupsWithAge);
  var downloads = R.map(R.props(["calendar", "icsPath"]), groupsWithOldFiles);

  console.log("Downloading", downloads.length, "files...");
  async.eachLimit(downloads, ConcurrentDownloads, function(item, callback) {
    downloadCalendar(item[0], item[1], swallowError(callback));
  }, function(downloadErr) {
    if (downloadErr) {
      console.error(downloadErr);
      return;
    }
    console.log("Done!");
  });
});
