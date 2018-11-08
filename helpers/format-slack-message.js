const detectLinks = /<(.*?)>/g;

module.exports = function(context) {
  return context.replace(detectLinks, function(match, capture) {
    var label = getLabel(capture);
    if (capture.indexOf("#C") === 0) {
      return `<a href="https://louisville.slack.com/messages/${capture.substring(1)}/">${label}</a>`;
    } else if (capture.indexOf("@U") === 0) {
      return `<a href="https://louisville.slack.com/team/${capture.substring(1)}/">${label}</a>`;
    } else if (capture.indexOf("@W") === 0) {
      return `<a href="https://louisville.slack.com/team/${capture.substring(1)}/">${label}</a>`;
    } else if (capture.indexOf("!") === 0) {
      return `<i>${capture}</i>`;
    } else {
      return `<a href="${capture}">${label}</a>`;
    }
  });
};

function getLabel(link) {
  var parts = link.split("|");
  if (parts.length > 1) {
    return parts[1];
  } else {
    return parts[0];
  }
}
