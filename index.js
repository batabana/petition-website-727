const express = require("express");
const app = express();
app.disable("x-powered-by");
const bodyParser = require("body-parser");
const {getSigners, saveSigners} = require("./db.js");

// setup express-handlebars
const hb = require('express-handlebars');
app.engine('handlebars', hb());
app.set('view engine', 'handlebars');

// use middleware to parse request body
app.use(bodyParser.urlencoded({
    extended: false
}));

// serve static files
app.use(express.static("./public"));

// get routes for petition
app.get("/", (req, res) => {
    res.redirect("/petition");
});

app.get("/petition", (req, res) => {
    res.render("petition", {
        layout: "main",
        title: "Petition",
        text: "Petition"
    });
});

app.post("/petition", (req, res) => {
    const {first, last, sig} = req.body;
    saveSigners(first, last, sig);
    res.redirect("/success");
});

// get routes for other pages
app.get("/success", (req, res) => {
    res.render("success", {
        layout: "main",
        title: "Success",
        text: "Thanks for supporting us!"
    });
});

app.get("/signers", (req, res) => {
    // to do: solve promise in here (again), catch error in here
    const signers = getSigners();
    console.log(signers);
    res.render("signers", {
        layout: "main",
        title: "Signers",
        text: "Here are the people that have signed so far:",
        signers: signers
    });
});

app.listen(8080, () => console.log("Listening"));
