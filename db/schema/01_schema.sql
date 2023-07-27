DROP Table if exist users;
DROP Table if exist polls;
DROP Table if exist choices;
DROP Table if exist answers;


CREATE TABLE users (
 id SERIAL PRIMARY KEY NOT NULL,
 email VARCHAR(100) NOT NULL
 );

  CREATE TABLE polls (
  id SERIAL PRIMARY KEY NOT NULL,
  title VARCHAR(100) NOT NULL,
  question VARCHAR(250) NOT NULL,
  link VARCHAR(500) NOT NULL,
  users_id INTEGER not null REFERENCES users(id) ON DELETE CASCADE
 );

  CREATE TABLE choices (
  id SERIAL PRIMARY KEY NOT NULL,
  polls_id INTEGER NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  polls_options VARCHAR(100) NOT NULL
  );

 CREATE TABLE answers (
 id SERIAL PRIMARY KEY NOT NULL,
 polls_id INTEGER NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
 users_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 polls_answer VARCHAR(250) NOT NULL
 );
