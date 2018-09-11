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
	`access_level` TINYINT(3) UNSIGNED NOT NULL DEFAULT 255,
	`creation_date` timestamp NOT NULL,
	`active` tinyint(1) NOT NULL DEFAULT 1
);
ALTER TABLE groups
	ADD UNIQUE KEY `group_id` (`group_id`);
INSERT INTO groups (group_id, name, display_name, access_level, creation_date) VALUES (0, 'developer', 'Developer', 0, FROM_UNIXTIME(1));
INSERT INTO groups (group_id, name, display_name, access_level, creation_date) VALUES (1, 'unassigned', 'Unassigned', 255, FROM_UNIXTIME(1));
INSERT INTO groups (group_id, name, display_name, access_level, creation_date) VALUES (2, 'student', 'Student', 100, FROM_UNIXTIME(1));

INSERT INTO groups (group_id, name, display_name, access_level, creation_date) VALUES (3, 'president', 'President', 10, FROM_UNIXTIME(1));
INSERT INTO groups (group_id, name, display_name, access_level, creation_date) VALUES (4, 'committee', 'General Committee', 20, FROM_UNIXTIME(1));

# ka476,K. Aleem,Aleem,student,TRIN,TRINUG
# TODO: rename atlas_users
CREATE TABLE raven_users (
	`id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
	`crsid` varchar(16) COLLATE utf8mb4_unicode_ci NOT NULL,
	`display_name` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
	`surname` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
	`role` varchar(16) COLLATE utf8mb4_unicode_ci NOT NULL, # staff/student
	`college` varchar(16) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE raven_users
	ADD UNIQUE KEY `crsid` (`crsid`),
	ADD KEY `surname` (`surname`);
