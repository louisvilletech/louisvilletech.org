const fetch = require("node-fetch");
const fs = require("fs");
const util = require("util");
const writeFile = util.promisify(fs.writeFile);
const { URLSearchParams } = require("url");
 
const slackApiUrl = "https://slack.com/api";
const token = process.env.SLACK_TOKEN;
const jobsChannel = "C06N77DRR";
const trustedUserIds = [
  "U0AH3J467", // Austyn Hill
  "U06HNDF1U", // Eric Lathrop
  "U6ZLWDMCL" // Tyler Mullins
];
const outputPath = "data/jobs.json";

function slackRequest(httpMethod, apiMethod, body) {
  return fetch(`${slackApiUrl}/${apiMethod}`, {
    method: httpMethod,
    body: body,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/x-www-form-urlencoded"
    }
  }).then(res => res.json());
}

function listPins(channel) {
  const params = new URLSearchParams();
  params.append("channel", channel);

  return slackRequest("post", "pins.list", params)
    .then(resp => {
      if (resp.ok) {
        return resp.items;
      } else {
        throw resp.error;
      }
    });
}

listPins(jobsChannel)
  .then(pins => pins.filter(pin => pin.type === "message" && trustedUserIds.indexOf(pin.created_by) !== -1))
  .then(pins => writeFile(outputPath, JSON.stringify(pins)));
