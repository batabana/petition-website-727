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

exports.saveSigners = (first, last, sig) => {
    return db.query(
        `INSERT INTO signatures (first, last, sig)
        VALUES ($1, $2, $3)
        RETURNING id`,
        [first || null, last || null, sig || null]
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
