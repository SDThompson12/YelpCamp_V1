var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user.js');
var Campgrounds = require("../models/campgrounds.js");

//=============GET Routes===============================
//Root Route
router.get("/",function(request,response)
{
     response.render("landing.ejs");
});

//==============Authenication Routes================
//Show Register form
router.get('/register', function(request, response)
{
    response.render("register.ejs", {page: 'register'});
    });

//Register Sign Up Logic (Post Route)
router.post('/register', function(request, response)
{
    
    var newUser = new User({
        username: request.body.username,
        firstName: request.body.firstName, 
        lastName: request.body.lastName, 
        avatar: request.body.avatar, 
        email: request.body.email});
    if(request.body.adminCode === 'secretcode123')
    {
        newUser.isAdmin = true;
    }
    User.register(newUser, request.body.password, function(error, user)
    {
        if(error)
        {
            console.log(error);
            return response.render("register.ejs", {error: error.message});
        }
        //This portion handles the action if the sign up is successful
        passport.authenticate('local')(request, response, function(){
            request.flash('success','Welcome to YelpCamp ' + user.username);
            response.redirect("/campgrounds");
        });
    });
});

//Show Login Form
router.get('/login', function(request, response)
{
    response.render('login.ejs', {page: 'login'});
});

//This is using middleware to handle Login (app.post('/login', middleware, callback)
router.post("/login", passport.authenticate('local', 
    {
        successRedirect: '/campgrounds',
        failureRedirect: '/login'
    }), function(request, response){
    
});

//Logout Route
router.get('/logout', function(request, response)
{
    request.logout();
    request.flash('success','Logout successful.');
    response.redirect('/campgrounds');
});

//User Profile Route
router.get('/users/:id', function(request, response)
{
   User.findById(request.params.id, function(error, foundUser)
   {
        if(error)
        {
            request.flash('error',"Failed to find user.");
            response.redirect('/');
        }
    Campgrounds.find().where('author.id').equals(foundUser._id).exec(function(error, yelpCampGrounds)
            {
                if(error)
                {
                    request.flash('error',"Failed to find user.");
                    response.redirect('/');  
                } 
                response.render("users/show.ejs", {user: foundUser, yelpCampGrounds: yelpCampGrounds, page: 'profile'});
        });
    });
});

module.exports = router;