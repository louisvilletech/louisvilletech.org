# LouisvilleTech.org
[<img src="./src/images/btn-add-to-slack.svg" alt="Add to Slack" width="120">](https://join.slack.com/t/louisville/shared_invite/zt-9l0fgrht-EpCk7jDw7LvcgETaYPV46g)

Software to generate a consolidated directory and calendar of technology user groups and meetups.

This generates a static site, so the generation is meant to be run as a cron job to keep the site up-to-date. The site is built with the [unfold](https://github.com/ericlathrop/unfold) static site generator.

To generate the site:

1. Clone this repo
2. Install [Node.js](http://nodejs.org/)
3. Run `npm install`
4. Run `npm run build`
5. After the site is built, you can run it in your browser by opening `index.html` located in `/dest/` 

Removing a group and meetup
1. Edit the [data/groups.json](https://github.com/louisvilletech/louisvilletech.org/blob/master/data/groups.json) file to remove the group.
2. Remove the stale ical file in the `./ics` directory.
3. Rebuild the site.
