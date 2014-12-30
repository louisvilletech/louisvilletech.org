#!/bin/sh
PATH="node_modules/.bin:$PATH"
node download.js
node index.js
unfold site.json
