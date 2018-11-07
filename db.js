var spicedPg = require('spiced-pg');

var db = spicedPg('postgres:postgres:postgres@localhost:5432/petition');

exports.getSigners = () => {
    return db.query(
        'SELECT * FROM signatures'
    ).then(function(results) {
        return results.rows;
    }).catch(function(err) {
        return err;
    });
};

exports.saveSigners = (first, last, sig) => {
    return db.query(
        `INSERT INTO signatures (first, last, sig)
        VALUES ($1, $2, $3)
        RETURNING *`,
        [first, last, sig]
    ).then(function(results) {
        console.log(results.rows);
    }).catch(function(err) {
        console.log(err);
    });
};
