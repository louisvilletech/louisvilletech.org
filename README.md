# Louisville.io

Software to generate a consolidated directory and calendar of technology user groups and meetups.

This generates a static site, so the generation is meant to be run as a cron job to keep the site up-to-date.

To generate the site:

1. Clone this repo
2. Install [Node.js](http://nodejs.org/)
3. Run `npm install`
4. Run `npm run build`
5. Run `npm run deploy` (or `npm run build-deploy`)

Steps 4-5 are meant to be run as a cron job.

The site is built with the [unfold](https://github.com/ericlathrop/unfold) static site generator.
