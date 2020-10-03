# Trinity College Science Society Website

Live @ https://tcss.soc.srcf.net/

## Contents
1. Introduction
2. Documentation
	1. General Overview
	2. Tools/Languages
		1. Build Tool
			1. General
			2. HTML
		2. PHP
		3. JavaScript
			1. Vendor Libraries
			2. Application Layer
		4. PostgreSQL
		5. Docker
	3. Explanation of Code
		1. Raven Backend
		2. History Hooks
		3. Sessions
        4. Atlas
		5. Dynamic Content
		6. Content Editing
3. Motivations
	1. Personal Background
	2. Aims for the society
	3. Personal Benefit
	4. Time Spent

# Introduction
This text file can largely be split into two seperate categories. Firstly, this text file will contain the necessary documentation for maintenance purposes as time progresses.
I will also outline my motivations for making a new website for TCSS and spending a significant portion of my holiday time locked away in a basement, writing code and growing a neckbeard.

# Documentation
## General Overview
The website frontend is generated with _rust_, using a library called _aggregate_. Most of the website functionality is accomplished using a JavaScript library called _jQuery_.

The website backend is written in _PHP_, and makes use of _PostgreSQL_ as a database server. 

## Tools/Languages
### Build Tool
#### General
The build tool resides in the `aggregate` directory and is written in Rust.
The repository can be obtained via:
```
cd $ROOTDIR
git clone git@github.com/skydive:aggregate
```

In the past, `npm` and `gulp` were used. This has been deprecated due to security considerations. The Rust build tool makes use of petgraph and async_std to perform the entire build process in parallel across all available threads. It is by far superior to what existed in the past.

Copy `config.json` into `aggregate/config.json` and execute `cargo run -- build` in shell to build the program

__DEVELOPMENT__
During development, ___watchers___, are created. When a file is changed, the respective output file, in the
`/build` output directory, is regenerated.

__Within a terminal:__
```
cd aggregate
cargo run -- watch
```

__DEPLOY__
The most important think about deployment, is that the code is automatically minified to reduce filesize, and a revisioning system is implemented to force all clientside caches to fetch the new files. This guarantees that the site, and the code for the site, updates correctly. Every time.

__Within a terminal:__
```
cd aggregate
cargo run -- deploy
```

The build tool is written with great emphasis on configuration. It is written to apply specific 'processors', each lying in `aggregate/src/processor` Procedures in use include: `html, clone, js, css, php`.

The configuration for the build tool resides in `config.json`, and outlines the procedures required, including specifying the output directory of the built files and supports passing arguments to each of the procedures.

Global build modifiers include: `build`, and `deploy`. Where each modifies the behaviour of every procedure executed. Notably, 'deploy' exists for producing revisions and minifying code upon deployment.

#### HTML
The htmlpages procedure, in particular, is the most complicated. 
For each page directory specified, the procedure seeks a ```template.html``` file, in the /src/pages/ folder
recursively looking up directories. The ```template.html``` contains syntax which specifies the output files and how to construct them..

The standard ```template.html``` file creates both ```content.html```, and ```index.html``` files. This integrates seamlessly with the ```sky-history.js``` library, providing seamless page transitions and hooking into browser history.

See `aggregate/src/processor/htmlpages.rs`

### PHP
#### Philosophy
PHP is the most widely used language for backend. It has been proven to scale and is still widely used by many major companies.

The principal argument for its use here is so the society does not need to pay for webhosting, as the SRCF (Student Run Computing Facility) supports PHP by default.

#### Structure of Code
The entire collection of possible backend php _actions_ has a common entry point `/src/php/index.php`. A switch/case statement is used to ensure the execution of particular scripts. This is (usually) bundled with a `.htaccess` file, to ensure that only index.php may be executed. This is added security, and guarantees only intended execution of code.

The configuration of the backend resides in `/src/php/config.php`, where fields within the `$GLOBALS` associative array may be modified to alter the hostnames of the database server, list valid exceptions to return to the client, and provide information about where image uploads should reside.

#### PHP Configuration
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

One will notice the correct usage of jQuery event handlers. All code associated with UI elements may be self-contained and can exist within the DOM itself. Functions can be stored within DOM elements, and can therefore be created by other functions. This approach is invaluable when writing UI code, however, as expected the code may not look conventional or pretty. This is an unavoidable consequence of web development.

The choice of using jQuery instead of a large framework like React/Angular is again one of personal preference. My approach involves less overhead, and is using a the most common library that is indispensible for web developers.

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
| sky-notify.js         | Notification popups |
| sky-blk.js            | Dynamic Content |
| sky-contenttools.js   | Monkeypatch for ContentTools |
| sky-jquery.js         | Minor patched methods |

### Docker
Docker is used to rapidly deploy a testing server. Each individual service, or webserver required for the TCSS site, has an associated Docker container. This reduces the overhead of manually installing nginx, php-fpm, postgresql and configuring everything, as the containers may simply be generated and the configuration files copied over as required. 

The `/docker-alpine` folder contains the Dockerfiles for the services required, and the `/stack` folder contains the configuration files required.

`/docker-compose.yml` contains the necessary configuration to start a testing server instantly, using __docker-compose__.

The necessary containers are created for fast deployment on an external server, in the case that SRCF fails.

### PostgreSQL
PGSQL (PostgreSQL) is used, partly because it is supported by SRCF, but also because it is the standard for web based databases.

The most beneficial use of PGSQL, is that it has native support for JSON indexing. This is used extensively in storing blk metadata to prevent the creation of unnecessary tables.

__Relevant Files__
SQL Schema, to generate the default database: `/src/php/lib/prepare.sql`

## Explanation of Code
### Raven Backend
Raven authentication is a very complex process. It became apparent that the provided web authentication script, on the _cambridge university_ github, was not fit for purpose. It was incredibly unstable, and did not perform reliably. The code was not written particularly well and it wasn't entirely readable.

Raven authentication uses the WAA2WLS protocol. The script redirects the person to the raven authentication page, and sends a 'post-authentication/host' parameter. If authentication is __successful__, a response web request is sent to __our php server__ (SRCF), signed with their __private key__. We perform RSA signature verification, using their public key in order to verify that the web response of successful authentication is truly coming from the raven servers. The complete _detailed_, process is described in [waa2wls-protocol.txt](https://raven.cam.ac.uk/project/waa2wls-protocol.txt).

__Relevant Source Files__
Custom raven authentication class: `/src/php/lib/webauth/webauth_raven.php`
Raven redirect URL generator: `/src/php/scripts/raven/raven_redirect.php`
Raven session creator: `/src/php/scripts/raven/raven_session.php`

__Relevant Links__
[Apache module](https://github.com/cambridgeuniversity/mod_ucam_webauth) (Written in C)
[PHP authenticator](https://github.com/cambridgeuniversity/ucam-webauth-php) 
[WAA2WLS Protocol](https://raven.cam.ac.uk/project/waa2wls-protocol.txt)

### History Hooks
The build tool, as described earlier, generates an `index.html` and `content.html` file. Page transitions are managed by `/src/js/app/sky_history.js`, and only the `content.html` section of the page is dynamically loaded in. This allows for seamless page transitions, and prevents the website from flickering when the page is changed, as only the necessary sections are reloaded.

### Sessions
Session management is vital for persistent logins. The pgsql database contains a `logins` table, recording necessary information about successful authentications. Upon a successful login, a random `SHA-512` hash is generated, and stored as a cookie with key `session_cookie`. This is sent to the server to authenticate all future requests, until the session_token has been invalidated due to expiration, or the user logging out.

__Relevant Source Files__
Session management: `/src/php/lib/framework/auth/session.php`
User management: `/src/php/lib/framework/auth/user.php`

### Atlas
The problem of listing all crsids, and obtaining as much information from the UIS as possible to assign groups to people who haven't yet logged in is achieved by _caching_ necessary crsids.

A cron job is set to execute once a month. It fetches a JSON list of all members of the University, containing initials, last name and crsids, and caches it within the `atlas` table. New accounts are generated as required. This allows groups to be assigned to users who have not yet logged on by having their accounts generated automatically.

[SRCF Crontab](https://www.srcf.net/faq/managing-socaccount#crontab)

### Dynamic Content
Dynamic content was likely one of the hardest things to design and optimise. 
Consider a web page consisting of 100 seperate news articles. Each article consisting of a header, content and footer. We intend to minimise the amount of data sent to clients by the server. 
Each individual header, content and footer. Each news article may be assigned a seperate id, crc32 hash and then cached in browser localstorage. This is a total of 300 hash comparisons, and 300+ fields in localstorage. Incredibly impractical.

__BLK__
A blk contains within it, references to the header, footer and body of the news article. The blk stores a combined hash, of everything it refers to. When a single reference of the blk has its data changed, the hash of the blk will then be recalculated, and everything it references will be fetched again by clients. 

The stored _blks_ on the client are lzo compressed, as json is an inefficient format for storing data. This ensures that the ~8MB localstorage cap will not be exceeded.

EDIT 2020: THIS IS A GOOD LESSON IN OVERENGINEERING
Some browsers dislike storing lzo-compressed UTF32 bytes in localStorage. This results in a JSON.parse error.
The original fix was to store UTF16 bytes in memory - but this is still disliked by many browsers.
TODO: Re-enable with a try/catch CASE for the JSON.parse to set a boolean in localStorage to disable fetching from cache!
For now - this is DISABLED. See `sky-blk.js`, Line 90 is commented out.

### Content Editing
ContentTools, a _WYSIWYG_ editor, was used to provide an interface for content editing. 
Image uploading involves a series of checks to ensure the format is supported.

Supported formats include: `jpeg/png/gif/svg/bmp`

__Singleton__
A singleton (`/src/js/app/singleton/*.js`) contains the code necessary for generating the event handlers to load a _blk_, and make a particular html element editable. Feed and pinboard editables attach additional event handlers to the singleton element. This _psuedo-element_


# Motivations
What would justify this level of effort in making a society website? A quick one could obviously be made for free, and with much much less effort using a service such a WordPress, for instance.

The featureset required is not met with WordPress. Raven authentication and user management, partnered with the caching of dynamic content to both reduce server load and speed up loading times.

Making a website quickly in wordpress has no educational aspect to it. I am fortunate to still be young and not in full time work, and to have the spare time to actually pursue the acquisition of new skills and knowledge. Given that I have the time and that the skills acquired would greatly benefit me immediate future and later in life. It is a task that is optimal for a holiday project, and surely the university should be supportive of this endeavor.

EDIT 2020: Most definitely.

## Personal Background
My name is Khalid Aleem (ka476). I am a student who is genuinely passionate about software development, and I have been programming, primarily as a hobby from a very young age.

Given that I've spent over 2000 hours, over the course of 9 years writing code. (See https://github.com/Skydive/), I feel as if I have the necessary skillset to make this new website for TCSS.

Past projects include:
- A Steam Chatbot (Written in C#) (2013-14)
- C++ 3D Rendering Engine (2015)
- WebGL Sprite Ship Game (2017)
- C++ Neural Network (MNIST ~80% coverage) (2017)
- Rust async dependency resolver build tool (2020)

Recently, I've spent over 100 hours in the summer holiday period writing code for relevant web technologies and developing a familiarity with these languages: `PHP/HTML/JS/SQL`. 
I've spent some time reading dev/techblogs to understand the best and necessary practices involved.

I've started working on a [portfolio](https://portfolio.precess.io/) website.

The internet is the inevitable future of technology. Developing the necessary skillset to understand and deploy applications is universally useful.

## Aims for the society
The current website is incredibly old and unmaintainable. I feel it sets an incredibly negative image to those who are also passionate about software development and web technologies, especially in industry.

The dynamically generated php pages, overall lack of static content, and poorly done stylesheet makes the TCSS website visually resemble something from the 1990s, and functionally it resembles (and looks worse than) the first incarnation of facebook.

Furthermore, the admin section involves inserting raw html code. This demonstrates the unmaintainability of the website. Editing raw code should not be necessary to modify the content of the site. (Serious security risk)

Moreover, I feel a deep sense of fulfillment for improving it.

## Personal Benefit
Within my first few weeks of studying here, I grew quite dissatisfied with the Natural Sciences course and was not allowed to change course to Computer Science. While I am completely satisfied with my Physics degree this year, I feel that it has had an adverse impact on my ability to actually acquire internships. 

Due to how competitive places are. Most software companies, especially the major ones, provide a clean rejection without considering my application individually as I am doing a physics course instead of a, more relevant in their eyes, computer science degree.

Making a website for TCSS, gives me a greater ability to compete, and demonstrates my ability to write software at a larger scale then most other people my age, and in my position. This is a big differentiator, if not with major companies, than with startups and will hopefully make acquiring a position much more likely.

Given this very personal connection, it is also in my best interest to maintain the site and ensure it is up.

## Time Spent  
- Users/Sessions - 3 days
- Raven authentication - 3 days  
- Atlas fetching - 1 day
- Dynamic content - 1 week
- Maintenance - Ongoing... (too long... regrettably)
