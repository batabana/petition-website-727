var spicedPg = require('spiced-pg');

var db = spicedPg(process.env.DATABASE_URL || 'postgres:postgres:postgres@localhost:5432/petition');

exports.getSigners = (city) => {
    if (city) {
        return db.query(
            `SELECT u.first AS first, u.last AS last, p.age AS age, p.url AS URL
            FROM signatures AS s
            LEFT JOIN users AS u
            ON s.user_id = u.id
            LEFT JOIN user_profiles AS p
            ON s.user_id = p.user_id
            WHERE LOWER(p.city) = LOWER($1)`,
            [city]
        );
    } else {
        return db.query(
            `SELECT u.first AS first, u.last AS last, p.age AS age, p.city AS city, p.url AS URL
            FROM signatures AS s
            LEFT JOIN users AS u
            ON s.user_id = u.id
            LEFT JOIN user_profiles AS p
            ON s.user_id = p.user_id`
        );
    }
};

exports.countSigners = (city) => {
    if (city) {
        return db.query(
            `SELECT COUNT(s.id)
            FROM signatures AS s
            LEFT JOIN user_profiles AS p
            ON s.user_id = p.user_id
            WHERE LOWER(p.city) = LOWER($1)`,
            [city]
        );
    } else {
        return db.query(
            'SELECT COUNT(id) FROM signatures'
        );
    }
};

exports.saveSigners = (sig, user_id) => {
    return db.query(
        `INSERT INTO signatures (sig, user_id)
        VALUES ($1, $2)
        RETURNING id`,
        [sig || null, user_id || null]
    );
};

exports.getSignature = (id) => {
    return db.query(
        `SELECT sig
        FROM signatures
        WHERE id = $1`,
        [id]
    );
};

exports.createUser = (first, last, email, password) => {
    return db.query(
        `INSERT INTO users (first, last, email, password)
        VALUES ($1, $2, $3, $4)
        RETURNING id`,
        [first || null, last || null, email || null, password || null]
    );
};

exports.getUser = (email) => {
    return db.query(
        `SELECT users.id AS "userId", users.password, signatures.id AS "signatureId"
        FROM users
        LEFT JOIN signatures
        ON users.id = signatures.user_id
        WHERE users.email = $1`,
        [email]
    );
};

exports.writeProfile = (age, city, url, user_id) => {
    return db.query(
        `INSERT INTO user_profiles (age, city, url, user_id)
        VALUES ($1, $2, $3, $4)`,
        [age || null, city || null, url || null, user_id || null]
    );
};

exports.getProfile = (id) => {
    return db.query(
        `SELECT u.first, u.last, u.email, p.age, p.city, p.url
        FROM users AS u
        LEFT JOIN user_profiles AS p
        ON u.id = p.user_id
        WHERE u.id = $1`,
        [id]
    );
};

exports.updateProfile = (age, city, url, user_id) => {
    return db.query(
        `INSERT INTO user_profiles (age, city, url, user_id)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id)
        DO UPDATE SET age = $1, city = $2, url = $3`,
        [age || null, city || null, url || null, user_id || null]
    );
};

exports.updateUser = (user_id, first, last, email, password) => {
    if (password) {
        return db.query(
            `UPDATE users
            SET first = $2, last = $3, email = $4, password = $5
            WHERE id = $1`,
            [user_id, first || null, last || null, email || null, password || null]
        );
    } else {
        return db.query(
            `UPDATE users
            SET first = $2, last = $3, email = $4
            WHERE id = $1`,
            [user_id, first || null, last || null, email || null]
        );
    }
};

exports.deleteSignature = (signature_id) => {
    return db.query(
        `DELETE FROM signatures
        WHERE id = $1`,
        [signature_id]
    );
};

exports.deleteUser = (user_id) => {
    return db.query(
        `DELETE FROM users
        WHERE id = $1`,
        [user_id]
    );
};

exports.deleteProfile = (user_id) => {
    return db.query(
        `DELETE FROM user_profiles
        WHERE user_id = $1`,
        [user_id]
    );
};
