#loutechcal

Software to generate a consolidated directory and calendar of technology user groups and meetups.

This generates a static site, so the generation is meant to be run as a cron job to keep the site up-to-date.

To generate the site:

1. Clone this repo
2. Install [Node.js](http://nodejs.org/)
3. Run `npm install`
4. Run `npm run build`
5. The "dest" folder contains the generated site. You can upload this to a server somewhere.

Steps 4-6 are meant to be run as a cron job.

## Temporary steps for deployment
1. Run `npm run build` locally
2. Copy contents of "dest" to `deploy@louisville.io:/www/louisville.io/htdocs`
