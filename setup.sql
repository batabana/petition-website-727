DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS user_profiles;
DROP TABLE IF EXISTS users;

CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    first VARCHAR(200) NOT NULL,
    last VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL UNIQUE,
    password VARCHAR(200) NOT NULL,
    createtime TIMESTAMP DEFAULT current_timestamp
);

CREATE TABLE user_profiles(
    id SERIAL PRIMARY KEY,
    age INTEGER,
    city VARCHAR(100),
    url VARCHAR(300),
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id)
);

CREATE TABLE signatures(
    id SERIAL PRIMARY KEY,
    sig TEXT NOT NULL,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id),
    createtime TIMESTAMP DEFAULT current_timestamp
);
