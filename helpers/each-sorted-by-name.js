"use strict";

module.exports = function(context, options) {
  return Object.keys(context).sort(function(a, b) {
    return context[a].name.localeCompare(context[b].name);
  }).reduce(function(ret, key) {
    return ret + options.fn(context[key], { data: { key: key } });
  }, "");
};
