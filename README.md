# Trinity College Science Society Website

## Contents
1. [Introduction](#introduction)
2. [Documentation](#documentation)
	1. General Overview
	2. Tools/Languages
		1. [Build Tool](#build-tool) 
			1. General
			2. HTML
		2. PHP
		3. JavaScript
			1. Vendor Libraries
			2. Application Layer
		4. PostgreSQL
		5. Docker
	3. [Explanation of Code](#explanation-of-code)
		1. Raven Backend
		2. History Hooks
		3. Dynamic Content
		4. Content Editing
3. [Motivations](#motivations)
	1. Personal Background
	2. Aims for the society

# Introduction
This text file can largely be split into two seperate categories. Firstly, this text file will contain the necessary documentation for maintenance purposes as time progresses.
I will also outline my motivations for making a new website for TCSS and spending a significant portion of my holiday time locked away in a basement, writing code and growing a neckbeard.

# Documentation
## General Overview

## Tools/Languages
### Build Tool
#### General
The build tool resides in the `/gulp` directory and is written in ES6, a form of JavaScript used by node.

[Gulp](https://gulpjs.com/) is a pipe-based build tool, designed for efficient generation of code, and is used extensively. It is [heavily documented](https://gulpjs.com/docs/en/api/concepts) in other places.

__DEVELOPMENT__
During development, ___watchers___, are created. When a file is changed, the respective output file, in the
`/build` output directory, is regenerated.

__Within a terminal:__
```
cd $ROOTDIR/gulp
npm install
npm start
npm run deploy
```

__DEPLOY__
The most important think about deployment, is that the code is automatically minified to reduce filesize, and a revisioning system is implemented to force all clientside caches to fetch the new files. This guarantees that the site, and the code for the site, updates correctly. Every time.

__Within a terminal:__
```
cd $ROOTDIR/gulp
npm install
npm run deploy
```

The build tool is written with great emphasis on configuration. It is written to apply specific 'procedures', each lying in `/gulp/proc`. Procedures in use include: `html, clone, js, css, php`.

The configuration for the build tool resides in `/config.json`, and outlines the procedures required, including specifying the output directory of the built files and supports passing arguments to each of the procedures.

Global build modifiers include: `build`, and `deploy`. Where each modifies
the behaviour of every procedure executed. Notably, 'deploy' exists for
producing revisions and minifying code upon deployment.

#### HTML
The html procedure, in particular, is the most complicated. 
For each page directory specified, the procedure seeks a ```template.html``` file, in the /src/pages/ folder
recursively looking up directories. The ```template.html``` contains syntax which specifies the output files and how to construct them..

The standard ```template.html``` file creates both ```content.html```, and ```index.html``` files. This integrates seamlessly with the ```sky-history.js``` library, providing seamless page transitions and hooking into browser history.


### PHP
__Philosophy__
PHP is the most widely used language for backend. It has been proven to scale and is still widely used by many major companies.

The choice of using PHP is quite controvertial. Other, newer ways to write backend code exist. Notably, Ruby On Rails, Python Django, Flask. Many of these are easier to use, have a more familiar syntax and are much less time consuming.

The principal argument here is so the society does not need to pay for webhosting, as the SRCF (Student Run Computing Facility) supports PHP by default.

Large companies have had scalability problems with 
[Twitter](https://techcrunch.com/2008/05/01/twitter-said-to-be-abandoning-ruby-on-rails/)

__Concerns__

__PHP Configuration__

__Libraries__
These are the ONLY php libraries used, and almost all of these are provided by a _default_ php installation.
`/stack/php-fpm/config/php.ini`:
```
[PHP]
...
extension=curl
extension=json
extension=mysqlnd
extension=mysqli
extension=pdo
extension=pdo_mysql
extension=pdo_pgsql
extension=zip
extension=fileinfo
...
```
__PDO__
The PHP Data Object libraries are used for performing any and all SQL operations. Manual escaping of arguments within queries is no longer necessary, as the library is written to prevent SQL injection.
The `PDO->execute({})` function automatically escapes any variable within queries.


__Other__
Disabled `E_NOTICE` errors. Being strict isn't necessary and exceptions are used widely to catch errors that do occur. A minor problem such as a variable being null within a comparison should not produce an error, as the PHP script could output malformed JSON.

PHP support for uploading files is also necessary, for images within editable fields of dynamic content. This is _fortunately_ enabled by default on SRCF.
```

[PHP]
...
error_reporting = E_ALL & ~E_NOTICE
display_errors = On
display_startup_errors = On
...
file_uploads = On
upload_max_filesize = 2M
max_file_uploads = 20
...
```


### JavaScript
#### Philosophy
The choice of writing plain JavaScript over languages such as [TypeScript](https://www.typescriptlang.org/) or ES6 Babel and transpiling the code was a matter of personal preference.

[TypeScript](https://www.typescriptlang.org/) is best to guarantee consistency when a large team of programmers is working on a project. I feel that it is unnecessary in the usecase of writing a website for a single society, especially when rapid prototyping is required.

One will notice the mass `abuse`, but arguably, correct usage of jQuery event handlers. All code associated with UI elements may be self-contained and can exist within the DOM itself. Functions can be stored within DOM elements, and can therefore be created by other functions. This approach is invaluable when writing UI code, however, as expected the code may not look conventional or pretty. This is an unavoidable consequence of web development.

The choice of using jQuery instead of a large framework like React/Angular is again one of personal preference. An argument can be made that my approach involves less overhead, and is using a very common library that is indispensible for web developers.


#### Vendor Libraries
| Title         | Use Case |
| --- | --- | 
| moment.js         | Manipulating timestrings | 
| jquery.js         | DOM Manipulation / Event Handlers |
| jquery-ui.js      | Popups within Group Editing |
| native.history.js | History hooking |
| jdenticon.js      | Generate avatars for each Raven crsid |
| lz-string.js      | Compress the stored dynamic content |

#### Application Layer
| Title         | Use Case |
| --- | --- | 
| sky-notify.js         |
| sky-blk.js            |
| sky-contenttools.js   |
| sky-jquery.js         |

### Docker
Docker is used to rapidly deploy a testing server. Each individual service, or webserver required for the TCSS site, has an associated Docker container. This reduces the overhead of manually installing nginx, php-fpm, postgresql and configuring everything, as the containers may simply be generated and the configuration files copied over as required. 

The `/docker-alpine` folder contains the Dockerfiles for the services required, and the `/stack` folder contains the configuration files required.

`/docker-compose.yml` contains the necessary configuration to start a testing server instantly, using __docker-compose__.

The necessary containers are created for fast deployment on an external server, in the case that SRCF fails.

### PostgreSQL
PGSQL (PostgreSQL) is used, partly because it is supported by SRCF, but also because it is the standard for web based databases.

## Explanation of Code
### Raven Backend
WAA2WLS Protocol
Sessions
ATLAS CACHE (Yearly Update - CRON JOB)

### Dynamic Content
Blk, LocalStorage, Reverse Scaling, LZO Compression

### Content Editing
ContentTools
Image Uploading

# Motivations
## Personal Background
I am a student who is genuinely passionate about software development, and
I have been programming, primarily as a hobby, from a young age.

Given that I've spent over 2000 hours, over the course of 9 years learning how to code. (See https://github.com/Skydive/), 

Past projects include:
- A Steam Chatbot (Written in C#)
- C 3D Rendering Engine
- WebGL Sprite Ship Game
- C Neural Network (MNIST ~80% coverage)
- Recently, I've spent 100 hours in the summer holiday period learning the relevant PHP/HTML/JS/SQL,
and reading dev/techblogs to understand the best and necessary practices. (See https://portfolio.precess.io/)

## Aims for the society
The current website is incredibly old and unmaintainable. It sets an incredibly negative image to those who are also passionate about software development and web technologies. 

I feel a deep sense of fulfillment for improving it.

## Personal Benefit
Within my first few weeks of studying here, I grew quite dissatisfied with the Natural Sciences course. I sought to switch to Computer Science, however the DoS for computer science did not let me change course. I feel that this has had an adverse impact on my ability to actually acquire internships. 

Most software companies, especially the major ones, provide a clean rejection without considering my application individually as I am doing a physics course instead of a, more relevant in their eyes, computer science degree due to how competitive places are.

Making a website, of very high quality, gives me a greater ability to compete, and demonstrates my ability to actually write extensive software. This is a big differentiator, if not with major companies, than with startups and will hopefully make acquiring a position much more likely.
