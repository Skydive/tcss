# mariadb
DROP USER 'precess-io'@'172.17.0.1';
DROP DATABASE precess;

CREATE USER 'precess-io'@'172.17.0.1' IDENTIFIED BY 'xaxaxaxa';
GRANT ALL PRIVILEGES ON `precess-io`.* TO 'precess-io'@'172.17.0.1' WITH GRANT OPTION;

FLUSH PRIVILEGES;

CREATE DATABASE `precess-io`;
USE `precess-io`;
CREATE TABLE users (
	`id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
	`user_id` bigint(20) NOT NULL,
	`username` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
	`password_hash` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
	`auth_provider` tinyint(1) NOT NULL,
	`creation_date` timestamp NOT NULL,
	`group_id` bigint(20) NOT NULL DEFAULT 1, # See classification of 1 below...
	`active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
ALTER TABLE users
	ADD UNIQUE KEY `user_id` (`user_id`),
	ADD KEY `username` (`username`),
	ADD KEY `auth_provider` (`auth_provider`);

CREATE TABLE logins (
	`id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
	`user_id` bigint(20) NOT NULL,
	`session_token` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
	`ip_address` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
	`user_agent` text COLLATE utf8mb4_unicode_ci NOT NULL,
	`login_date` timestamp NOT NULL,
	`logout_date` timestamp NULL DEFAULT NULL,
	`active` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
ALTER TABLE logins
	ADD KEY `user_id` (`user_id`),
	ADD KEY `session_token` (`session_token`);

#hmm
CREATE TABLE groups (
	`id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
	`group_id` bigint(20) NOT NULL,
	`name` varchar(64) NOT NULL,
	`display_name` varchar(64) NOT NULL,
	`access_level` tinyint(3) UNSIGNED NOT NULL DEFAULT 255,
	`creation_date` timestamp NOT NULL DEFAULT FROM_UNIXTIME(1),
	`active` tinyint(1) NOT NULL DEFAULT 1
);
ALTER TABLE groups
	ADD UNIQUE KEY `group_id` (`group_id`),
	ADD UNIQUE KEY `name` (`name`);
INSERT INTO groups (group_id, name, display_name, access_level) VALUES (0, 'developer', 'Developer', 0);
INSERT INTO groups (group_id, name, display_name, access_level) VALUES (1, 'unassigned', 'Unassigned', 255);
INSERT INTO groups (group_id, name, display_name, access_level) VALUES (2, 'student', 'Student', 100);

INSERT INTO groups (group_id, name, display_name, access_level) VALUES (3, 'president', 'President', 10);
INSERT INTO groups (group_id, name, display_name, access_level) VALUES (4, 'committee', 'General Committee', 20);

# ka476,K. Aleem,Aleem,student,TRIN,TRINUG
# TODO: rename atlas_users
CREATE TABLE atlas (
	`id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
	`crsid` varchar(16) COLLATE utf8mb4_unicode_ci NOT NULL,
	`display_name` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
	`surname` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
	`role` varchar(16) COLLATE utf8mb4_unicode_ci NOT NULL, # staff/student
	`college` varchar(16) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE atlas
	ADD UNIQUE KEY `crsid` (`crsid`),
	ADD KEY `surname` (`surname`);

CREATE TABLE content_editable (
	`id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
	`content_id` int(11) bigint(20) NOT NULL,
	`name` varchar(64) NOT NULL,
	`access_level` tinyint(3) unsigned NOT NULL,
	`content` TEXT NOT NULL,
	`user_id` int(11) bigint(20) NOT NULL,
	`modify_date` timestamp NOT NULL,
	`active` tinyint(1) NOT NULL DEFAULT 1 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
ALTER TABLE content_editable
	ADD UNIQUE KEY `content_id` (`content_id`),
	ADD KEY `modify_date` (`modify_date`);


# PGSQL
CREATE DATABASE "precess-io" WITH ENCODING "UTF8" LC_COLLATE="en_US.UTF-8" LC_CTYPE="en_US.UTF-8" TEMPLATE="template0";
CREATE ROLE "precess-io" WITH LOGIN ENCRYPTED PASSWORD 'xaxaxaxa';
GRANT ALL PRIVILEGES ON DATABASE "precess-io" TO "precess-io";

CREATE TABLE users (
	id SERIAL NOT NULL PRIMARY KEY,
	user_id BIGINT NOT NULL,
	username VARCHAR(64) NOT NULL,
	password_hash VARCHAR(128) NOT NULL,
	auth_provider SMALLINT NOT NULL,
	creation_date TIMESTAMP NOT NULL,
	group_id BIGINT NOT NULL DEFAULT 1,
	active BOOLEAN NOT NULL DEFAULT 1::BOOLEAN
);
CREATE UNIQUE INDEX index_users_user_id ON users (user_id);
CREATE INDEX index_users_username ON users (username);
CREATE INDEX index_users_auth_provider ON users (auth_provider);

CREATE TABLE logins (
	id SERIAL NOT NULL PRIMARY KEY,
	user_id BIGINT NOT NULL,
	session_token VARCHAR(128) NOT NULL,
	ip_address INET NOT NULL,
	user_agent TEXT NOT NULL,
	login_date TIMESTAMP NOT NULL,
	logout_date TIMESTAMP NULL DEFAULT NULL,
	active BOOLEAN NOT NULL DEFAULT 1::BOOLEAN
);
CREATE INDEX index_logins_user_id ON logins (user_id);
CREATE INDEX index_logins_session_token ON logins (session_token);

CREATE TABLE groups (
	id SERIAL NOT NULL PRIMARY KEY,
	group_id BIGINT NOT NULL,
	name VARCHAR(64) NOT NULL,
	display_name VARCHAR(64) NOT NULL,
	access_level SMALLINT DEFAULT 255,
	creation_date TIMESTAMP NOT NULL DEFAULT 'epoch',
	active BOOLEAN NOT NULL DEFAULT 1::BOOLEAN
);
CREATE UNIQUE INDEX index_groups_group_id ON groups (group_id);

INSERT INTO groups (group_id, name, display_name, access_level) VALUES (0, 'developer', 'Developer', 0);
INSERT INTO groups (group_id, name, display_name, access_level) VALUES (1, 'unassigned', 'Unassigned', 255);
INSERT INTO groups (group_id, name, display_name, access_level) VALUES (2, 'student', 'Student', 100);

INSERT INTO groups (group_id, name, display_name, access_level) VALUES (3, 'president', 'President', 10);
INSERT INTO groups (group_id, name, display_name, access_level) VALUES (4, 'committee', 'General Committee', 20);


CREATE TABLE atlas (
	id SERIAL NOT NULL PRIMARY KEY,
	crsid VARCHAR(16) NOT NULL,
	display_name VARCHAR(128) NOT NULL,
	surname VARCHAR(64) NOT NULL,
	role VARCHAR(16) NOT NULL,
	college VARCHAR(16) NOT NULL
);
CREATE UNIQUE INDEX index_atlas_crsid ON atlas (crsid);
CREATE INDEX index_atlas_surname ON atlas (surname);

# SKY BLOCK PHP
CREATE TABLE content_blk (
	id SERIAL NOT NULL PRIMARY KEY,
	blk_id BIGINT NOT NULL,
	blk_hash CHAR(8) NOT NULL,
	metadata JSONB NULL DEFAULT '{}'::JSONB
);
CREATE UNIQUE INDEX index_content_blk_id ON content_blk (blk_id);

CREATE TABLE content_blk_ref (
	id SERIAL NOT NULL PRIMARY KEY,
	blk_ref_id BIGINT NOT NULL,
	blk_id BIGINT NOT NULL,
	metadata JSONB NULL DEFAULT '{}'::JSONB,
	data TEXT DEFAULT NULL
);
CREATE UNIQUE INDEX index_content_blk_ref_blk_ref_id ON content_blk_ref (blk_ref_id);
CREATE INDEX index_content_blk_ref_blk_id ON content_blk_ref (blk_id);