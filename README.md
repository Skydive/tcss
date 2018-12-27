TCSS website
Started in July 2018, finished (mostly) in early 2019

Broadly speaking, everything should work on the system.

Any changes to a page will require a re-run of the build tool (which may not work on the srcf)








The most complicated features of this project are:
- Docker container
- Custom HTML build tool
- RAVEN DATABASE UPDATE

Explanation of each:
DOCKER CONTAINERS:
Alpine Linux containers reside in /docker-alpine/ for nginx, pgsql, php-fpm 
- USING nginx
- Change port 8080 to  port 443 - enable SSL (nginx) /stack/nginx/config/nginx.conf
- Forward port 443 in docker-compose.yml, map to 443
- To start the program:
- sudo docker-compose up -d
WITHOUT DOCKER:
- nginx, php-fpm, pgsql all required, copy configuration as necessary

CUSTOM HTML BUILD TOOL:
- cd /gulp
- npm install
- npm start TO BUILD (with watchers)
- npm run deploy TO BUILD FOR PRODUCTION
- Output of webroot will reside in /build, /deploy respectively

RAVEN DATABASE UPDATE:
- It's bad to CONTINUALLY query raven for every request, so a caching system has been devised.
- There is a 1-to-1 correspondence between the caching system and user accounts created UPON CACHING.

POTENTIAL ERRORS UPON DEPLOYMENT:
- MAKE SURE THE SERVER HAS NTP-TIME WORKING CORRECTLY
- /php/lib/webauth/webauth_raven.php 
- PREVENT (request coming from future error)
- set const CLOCK_SKEW = 5; to some large negative value: const CLOCK_SKEW = -500;
- PREVENT (wls response expired 1338 error)
- set const REQUEST_LIFETIME = 1; to some parge positive value:  const REQUEST_LIFETIME = 1000;



I'm fairly certain it'll be a few years until anyone THIS enthusiastic comes along again.
Regardless - email: timothy@precess.io if any technical issues arise.
I will fix it for you.