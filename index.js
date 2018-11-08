// setup express
const express = require("express");
const app = express();
app.disable("x-powered-by");

// setup express-handlebars
const hb = require('express-handlebars');
app.engine('handlebars', hb());
app.set('view engine', 'handlebars');

// db-stuff
const {getSigners, saveSigners, getSignature} = require("./db.js");

// setup middleware to parse cookies
const secrets = require("./secrets.json");
const cookieSession = require('cookie-session');
app.use(cookieSession({
    secret: secrets.cookieSecret,
    // delete after 2hr
    maxAge: 1000 * 60 * 60 * 2
}));

// setup middleware to parse request body
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
    extended: false
}));

// setup middleware to protect from csrf attack
const csurf = require('csurf');
app.use(csurf());
app.use(function(req, res, next) {
    res.locals.csrfToken = req.csrfToken();
    next();
});

// serve static files
app.use(express.static("./public"));

// routes
app.get("/", (req, res) => {
    res.redirect("/petition");
});

app.get("/petition", (req, res) => {
    if (req.session.signatureId) {
        res.redirect("/thankyou");
        return;
    }
    res.render("petition", {
        layout: "main",
        title: "Petition",
        text: "Petition"
    });
});

app.post("/petition", (req, res) => {
    const { first, last, sig } = req.body;
    saveSigners(first, last, sig)
        .then(results => {
            req.session.signatureId = results.rows[0].id;
            res.redirect("/thankyou");
        })
        .catch(err => {
            console.log(err);
            res.render("petition", {
                layout: "main",
                title: "Petition",
                text: "Petition",
                err: err
            });
        });
});

app.get("/thankyou", (req, res) => {
    if (!req.session.signatureId) {
        res.redirect("/petition");
        return;
    }
    const id = req.session.signatureId;
    getSignature(id)
        .then(results => {
            res.render("thankyou", {
                layout: "main",
                title: "Thank you",
                text: "Thanks for supporting us!",
                base64str: results.rows[0].sig
            });
        })
        .catch(err => console.log(err));
});

app.get("/signers", (req, res) => {
    if (!req.session.signatureId) {
        res.redirect("/petition");
        return;
    }
    getSigners().then(function(results) {
        res.render("signers", {
            layout: "main",
            title: "Signers",
            text: "XX people have signed so far:",
            signers: results.rows
        });
    }).catch(function(err) {
        return err;
    });
});

app.listen(8080, () => console.log("Listening on 8080"));
