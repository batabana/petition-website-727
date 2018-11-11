var spicedPg = require('spiced-pg');

var db = spicedPg('postgres:postgres:postgres@localhost:5432/petition');

exports.getSigners = () => {
    return db.query(
        'SELECT * FROM signatures'
    );
};

exports.countSigners = () => {
    return db.query(
        'SELECT COUNT(id) FROM signatures'
    );
};

exports.saveSigners = (first, last, sig, user_id) => {
    return db.query(
        `INSERT INTO signatures (first, last, sig, user_id)
        VALUES ($1, $2, $3, $4)
        RETURNING id`,
        [first || null, last || null, sig || null, user_id || null]
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
        `SELECT users.id AS "userId", users.password, signatures.id AS "signaturesId"
        FROM users
        JOIN signatures ON users.id = signatures.user_id
        WHERE users.email = $1`,
        [email]
    );
};
