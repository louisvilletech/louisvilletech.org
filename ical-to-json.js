const ical = require("ical.js");
const fs = require("fs");
const groups = require("./data/groups");
const path = require("path");
const util = require("util");

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const icsDir = "ics";
const eventJson = "data/events.json";

function isIcsFile(filename) {
  return filename.endsWith(".ics");
}

function keepIcsFiles(files) {
  return files.filter(isIcsFile);
}

function buildFullPath(files) {
  return files.map(file => path.join(icsDir, file));
}

function readAndParseCalendars(files) {
  return Promise.all(files.map(readAndParseCalendar));
}

function readAndParseCalendar(file) {
  return readFile(file)
    .then(buffer => buffer.toString())
    .then(ical.parse)
    .then(jcalData => new ical.Component(jcalData))
    .then(component => component.getAllSubcomponents("vevent"))
    .then(vevents => vevents.map(vevent => expandVeventsAndConvertToJson(vevent, file)))
    .then(flatten);
}

// only expand one year into the future
let recurrenceCutoff = ical.Time.now();
recurrenceCutoff.addDuration(ical.Duration.fromSeconds(60 * 60 * 24 * 365));

function expandVeventsAndConvertToJson(vevent, file) {
  const event = new ical.Event(vevent);

  if (event.isRecurring()) {
    let iter = event.iterator();

    let occurrences = [];

    for (let next = iter.next(); next; next = iter.next()) {
      let occurrence = event.getOccurrenceDetails(next);
      if (recurrenceCutoff.compare(occurrence.startDate) < 0) {
        break;
      }
      var json = updateTimes(eventToJson(event, file), occurrence);
      occurrences.push(json);
    }
    return occurrences;
  } else {
    return [
      eventToJson(event, file)
    ];
  }
}

function eventToJson(event, file) {
  const group = path.basename(file, ".ics");
  const groupInfo = groups[group];

  let mapQuery = event.location;
  if (event.location) {
    mapQuery = event.location.replace("(", " ").replace(")", " ");
  }

  return updateTimes({
    description: event.description,
    group: group,
    groupName: groupInfo.name,
    groupUrl: groupInfo.web,
    location: event.location,
    mapQuery: mapQuery,
    summary: event.summary,
    url: event.component.getFirstPropertyValue("url"),
  }, event);
}

function updateTimes(json, event) {
  json.end = event.endDate.toJSDate();
  json.expired = event.endDate.compare(ical.Time.now()) < 0;
  json.started = event.startDate.compare(ical.Time.now()) < 0;
  json.start = event.startDate.toJSDate();
  return json;
}

function flatten(list) {
  return list.reduce(
    (acc, item) => acc.concat(item),
    []
  );
}

readdir(icsDir)
  .then(keepIcsFiles)
  .then(buildFullPath)
  .then(readAndParseCalendars)
  .then(flatten)
  .then(events => events.filter(event => !event.expired))
  .then(events => events.sort((a, b) => a.start - b.start))
  .then(events => writeFile(eventJson, JSON.stringify(events, undefined, 2)));
