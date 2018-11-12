// setup express
const express = require("express");
const app = express();
app.disable("x-powered-by");

// setup express-handlebars
const hb = require('express-handlebars');
app.engine('handlebars', hb());
app.set('view engine', 'handlebars');

// db-stuff
const {getSigners, saveSigners, getSignature, countSigners, createUser, getUser, writeUserProfile} = require("./db.js");

// encryption
const {hash, compare} = require("./bcrypt");

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

// if user is not logged in, redirect to login
app.use(function(req, res, next) {
    if (!req.session.userId && req.url != "/register" && req.url != "/login") {
        res.redirect("/login");
    } else {
        next();
    }
});

// routes
app.get("/", (req, res) => {
    res.redirect("/login");
});

app.get("/register", (req,res) => {
    if (req.session.userId) {
        res.redirect("/petition");
        return;
    }
    res.render("register", {
        layout: "main",
        title: "Sign up",
    });
});

app.post("/register", (req, res) => {
    const { first, last, email, password } = req.body;
    hash(password)
        .then(hash => {
            return createUser(first, last, email, hash);
        })
        .then(results => {
            req.session.userId = results.rows[0].id;
            // todo: get signatureId from db
            res.redirect("/profile");
        })
        .catch(err => {
            console.log("Error in POST /register: ", err);
            res.render("register", {
                layout: "main",
                title: "Sign up",
                err: "Something went wrong, please try again."
            });
        });
});

app.get("/profile", (req, res) => {
    res.render("profile", {
        layout: "main",
        title: "Additional Information"
    });
});

app.post("/profile", (req, res) => {
    const user_id = req.session.userId;
    let {age, city, url} = req.body;
    if (age == "" && city == "" && url == "") {
        res.redirect("/petition");
        return;
    } else if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "http://" + url;
    }
    writeUserProfile(age, city, url, user_id)
        .then( () => res.redirect("/petition"))
        .catch(err => {
            console.log("Error in POST /profile: ", err);
            res.render("profile", {
                layout: "main",
                title: "Additional Information",
                err: "Something went wrong, please try again."
            });
        });
});

app.get("/login", (req,res) => {
    if (req.session.userId) {
        res.redirect("/petition");
        return;
    }
    res.render("login", {
        layout: "main",
        title: "Sign in",
    });
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;
    getUser(email)
        .then(results => {
            req.session.userId = results.rows[0].userId;
            req.session.signatureId = results.rows[0].signatureId;
            return compare(password, results.rows[0].password);
        })
        .then(doesmatch => {
            if(doesmatch) {
                res.redirect("/petition");
            } else {
                res.render("login", {
                    layout: "main",
                    title: "Sign in",
                    err: "Wrong password, please try again."
                });
            }
        })
        .catch(err => {
            console.log("Error in POST /login: ", err);
            res.render("login", {
                layout: "main",
                title: "Sign in",
                err: "User unknown, please try again."
            });
        });
});

app.get("/petition", (req, res) => {
    if (req.session.signatureId) {
        res.redirect("/thankyou");
        return;
    }
    res.render("petition", {
        layout: "main",
        title: "Petition",
        logout: "yes"
        // text: "Petition"
    });
});

app.post("/petition", (req, res) => {
    const {sig } = req.body;
    const user_id = req.session.userId;
    saveSigners(sig, user_id)
        .then(results => {
            req.session.signatureId = results.rows[0].id;
            res.redirect("/thankyou");
        })
        .catch(err => {
            console.log("Error in POST /petition: ", err);
            res.render("petition", {
                layout: "main",
                title: "Petition",
                logout: "yes",
                // text: "Petition",
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
    Promise.all([
        getSignature(id),
        countSigners()
    ]).then(results => {
        const count = results[1].rows[0].count;
        let text;
        count < 2 ? text = "supporter" : text = "supporters";
        res.render("thankyou", {
            layout: "main",
            title: "Thank you",
            logout: "yes",
            base64str: results[0].rows[0].sig,
            count: count,
            text: `Have a look at ${count} ${text} so far.`
        });
    }).catch(err => console.log("Error in GET /thankyou: ", err));
});

app.get("/signers", (req, res) => {
    if (!req.session.signatureId) {
        res.redirect("/petition");
        return;
    }
    Promise.all([
        getSigners(),
        countSigners()
    ]).then(function(results) {
        let text;
        results[1].rows[0].count < 2 ? text = "person has signed so far:" : text = "people have signed so far:";
        res.render("signers", {
            layout: "main",
            title: "Signers",
            logout: "yes",
            text: `${results[1].rows[0].count} ${text}`,
            signers: results[0].rows
        });
    }).catch(err => console.log("Error in GET /signers: ", err));
});

app.get("/signers/:city", (req, res) => {
    if (!req.session.signatureId) {
        res.redirect("/petition");
        return;
    }
    const city = req.params.city;
    Promise.all([
        getSigners(city),
        countSigners(city)
    ]).then(function(results) {
        let text;
        results[1].rows[0].count < 2 ? text = `person from ${city} has signed so far:` : text = `people from ${city} have signed so far:`;
        res.render("signers", {
            layout: "main",
            title: "Signers",
            logout: "yes",
            text: `${results[1].rows[0].count} ${text}`,
            signers: results[0].rows,
            link: "yes"
        });
    }).catch(err => console.log(`Error in GET /signers/${city} `, err));
});

app.get('/logout', function(req, res) {
    req.session = null;
    res.redirect('/login');
});

app.get("/*", (req, res) => {
    res.redirect("/petition");
});

app.listen(8080, () => console.log("Listening on 8080"));
