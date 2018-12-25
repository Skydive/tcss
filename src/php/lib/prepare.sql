CREATE DATABASE "tcss" WITH ENCODING "UTF8" LC_COLLATE="en_US.UTF-8" LC_CTYPE="en_US.UTF-8" TEMPLATE="template0";
CREATE ROLE "tcss" WITH LOGIN ENCRYPTED PASSWORD 'xaxaxaxa';
GRANT ALL PRIVILEGES ON DATABASE "tcss" TO "tcss";

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


CREATE TABLE blk (
	id SERIAL NOT NULL PRIMARY KEY,
	blk_id BIGINT NOT NULL,
	hash CHAR(8) NOT NULL,
	metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
	active BOOLEAN NOT NULL DEFAULT 1::BOOLEAN
);
CREATE UNIQUE INDEX index_blk_id ON blk (blk_id);

CREATE TABLE blk_ref (
	id SERIAL NOT NULL PRIMARY KEY,
	blk_ref_id BIGINT NOT NULL,
	blk_id BIGINT NOT NULL,
	name VARCHAR(64) NOT NULL,
	data TEXT DEFAULT NULL
);
CREATE UNIQUE INDEX index_blk_ref_blk_ref_id ON blk_ref (blk_ref_id);
CREATE INDEX index_blk_ref_name ON blk_ref (name);
CREATE INDEX index_blk_ref_blk_id ON blk_ref (blk_id);

-- CREATE TABLE events (
-- 	id SERIAL NOT NULL PRIMARY KEY,
-- 	event_id BIGINT NOT NULL,
-- 	blk_id BIGINT NOT NULL,
-- 	user_owner BIGINT NOT NULL,
-- 	event_date TIMESTAMP NOT NULL,
-- 	active BOOLEAN NOT NULL DEFAULT 1::BOOLEAN
-- );
-- CREATE UNIQUE INDEX index_events_event_id ON events (event_id);
-- CREATE INDEX index_events_event_date ON events (event_date);


CREATE INDEX index_blk_meta_handler ON blk ((metadata ->> 'handler'))
	WHERE (metadata ->> 'handler') IS NOT NULL;

CREATE INDEX index_blk_metadata_feed_date ON blk (((metadata ->> 'feed_date')::BIGINT))
	WHERE (metadata ->> 'feed_date') IS NOT NULL;

CREATE INDEX index_blk_metadata_pinboard_position ON blk (((metadata ->> 'pinboard_position')::BIGINT))
	WHERE (metadata ->> 'pinboard_position') IS NOT NULL;