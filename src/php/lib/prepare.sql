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
	`creation_date` timestamp NULL DEFAULT NULL,
	`active` tinyint(1) NOT NULL DEFAULT '1'
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
	`login_date` timestamp NULL DEFAULT NULL,
	`logout_date` timestamp NULL DEFAULT NULL,
	`active` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
ALTER TABLE logins
	ADD KEY `user_id` (`user_id`),
	ADD KEY `session_token` (`session_token`);

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
