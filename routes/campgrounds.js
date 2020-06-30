var express = require("express");
var router = express.Router();
var Campground = require('../models/campgrounds.js');
var Comment = require('../models/comments.js');
var Reviews = require('../models/reviews.js');
var middleware = require('../middleware');

//Index Route
router.get("/",function(request,response)
{
    // Get all campgrounds from Mongoose Database
    Campground.find({},function(error,campGrounds)
    {
       if(error)
       {
            console.log(error);    
       } 
       else
       {
            response.render("campgrounds/index.ejs",{yelpCampGrounds: campGrounds, currentUser: request.user, page: 'campgrounds'});
       }
    });
});

//NEW route
router.get("/new", middleware.isLoggedIn, function(request,response)
{
    response.render("campgrounds/new.ejs");
});

//SHOW route
router.get("/:id", function(request, response)
{
    //Find campground with provided ID
    Campground.findById(request.params.id).populate("comments").populate
    ({
        path: 'reviews',
        options: {sort: {createdAt: -1}}
    }).exec( function(error, foundCampGround)
    {
        if(error || !foundCampGround)
        {
            request.flash('error','Campground not found');
            response.redirect('back');
        }
        else
        {     
        //Show template for that campground
            response.render("campgrounds/show.ejs", {yelpCampGrounds: foundCampGround});
        }
    });
});


//Edit Route
router.get("/:id/edit", middleware.checkCampgroundOwner, function(request, response)
{
    Campground.findById(request.params.id, function(error, foundCampGround)
    {
        response.render("campgrounds/edit.ejs", {yelpCampGrounds: foundCampGround}); 
    });
});

//========================== PUT Route =============================
//Update Route
router.put("/:id", middleware.checkCampgroundOwner, function(request, response)
{
   Campground.findByIdAndUpdate(request.params.id, request.body.campground, function(error, updatedCampground)
   {
        if(error)
        {
            response.redirect("/campgrounds");
        }
        else
        {
            delete request.body.campground.rating;
            response.redirect("/campgrounds/" + request.params.id);
        }
   }); 
});

//============= Delete Route =========================
//Destroy Campground Route
router.delete("/:id", middleware.checkCampgroundOwner, function(request, response)
{
    Campground.findByIdAndRemove(request.params.id, function(error, campground){
        if(error)
        {
            response.redirect("/campgrounds");
        }
        else 
        {
            // deletes all comments associated with the campground
            Comment.remove({"_id": {$in: campground.comments}}, function (error) 
            {
                if (error) 
                {
                    console.log(error);
                    return response.redirect("/campgrounds");
                }
                // deletes all reviews associated with the campground
                Reviews.remove({"_id": {$in: campground.reviews}}, function (error) 
                {
                    if (error) 
                    {
                        console.log(error);
                        return response.redirect("/campgrounds");
                    }
                    //  delete the campground
                    campground.remove();
                    request.flash("success", "Campground deleted successfully!");
                    response.redirect("/campgrounds");
                });
            });
        }
    });  
});

//==============POST Routes===========================

//CREATE route
router.post("/", middleware.isLoggedIn, function(request,response)
{
   var campName = request.body.name;
   var campImage = request.body.image;
   var campDesc = request.body.description;
   var campPrice = request.body.price;
   var author = {
       id: request.user._id,
       username: request.user.username
   }; 
   var newCampGrounds =  {name: campName, image: campImage, description: campDesc, author: author, price: campPrice};
   Campground.create(newCampGrounds, function(error, createdCampground)
        {
            if(error)
            {
                console.log(error);
            }
            else
            {
                console.log("New Campground: ");
                console.log(createdCampground);
            }
        });
   response.redirect("/campgrounds");
});

module.exports = router;