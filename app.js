var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var seedDB = require('./seeds.js');
var passport = require('passport');
var LocalStrategy = require("passport-local");
var methodOverride = require("method-override");
var flash = require("connect-flash");

var User = require("./models/user.js");


//Requiring Routes
var campgroundRoutes = require('./routes/campgrounds.js');
var commentRoutes = require('./routes/comments.js');
var indexRoutes = require('./routes/index.js');
var reviewRoutes = require('./routes/reviews.js');

app.use(bodyParser.urlencoded({extended: true}));
mongoose.connect("mongodb://localhost/yelp_camp");
app.use(express.static(__dirname + "/public"));
// '__dirname' - Just references to the current directory path Ex) .../workspace/YelpCamp/
app.use(methodOverride("_method"));
app.use(flash());

//Passport Config
app.use(require("express-session")({
    secret:"Into the Spiderverse was amazing!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(request, response, next){
    response.locals.currentUser = request.user;
    response.locals.error = request.flash("error");
    response.locals.success = request.flash("success");
    next();
});

//Imports Routes
app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

//seedDB(); Commented out to avoid constant changing of ids

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Starting YelpCamp server...");
});