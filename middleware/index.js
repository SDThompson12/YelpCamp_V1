var Campground = require('../models/campgrounds.js');
var Comments = require('../models/comments.js');
var Review = require('../models/reviews.js')
var middlewareObject = {};

middlewareObject.checkCampgroundOwner = function(request, response, next)
{
    if(request.isAuthenticated())
    {
        Campground.findById(request.params.id, function(error, foundCampGround)
        {
            if(error || !foundCampGround)
            {
               request.flash('error','Campground not found.');
               response.redirect("back");
            }
            else
            {
            //Does the User own the campground
              if(foundCampGround.author.id.equals(request.user._id) || request.user.isAdmin)
              {
                next(); 
              }
              else
              {
                  request.flash('error','Insufficent permissions for this action.');
                  response.redirect("back");
              }
            }
        });
    }
    else
    {
        request.flash('error','Please login into YelpCamp first!');
        response.redirect("back");
    }
};

middlewareObject.checkCommentOwner = function(request,response, next)
{
    if(request.isAuthenticated())
    {
        Comments.findById(request.params.comment_id, function(error, foundComment)
        {
            if(error || !foundComment)
            {
                request.flash('error','Comment not found.');
                response.redirect("back");
            }
            else
            {
            //Does the User own the comment
                  
                if(foundComment.author.id.equals(request.user._id) || request.user.isAdmin)
                {
                    next(); 
                }
                else
                {
                    request.flash('error','Insufficent permissions for this action.');
                    response.redirect("back");
                }
            }
        });
    }
    else
    {
        request.flash('error','Please login into YelpCamp first!');
        response.redirect("back");
    }
};

middlewareObject.isLoggedIn = function(request, response, next)
{
    if(request.isAuthenticated())
    {
        return next();
    }
    request.flash("error","Please login to YelpCamp first!");
    response.redirect('/login');
};

middlewareObject.checkReviewOwnership = function(request, response, next) 
{
    if(request.isAuthenticated())
    {
        Review.findById(request.params.review_id, function(error, foundReview)
        {
            if(error || !foundReview){
                response.redirect("back");
            }  else {
                // does user own the comment?
                if(foundReview.author.id.equals(request.user._id)) 
                {
                    next();
                } 
                else 
                {
                    request.flash("error", "Insufficent permissions for this action.");
                    response.redirect("back");
                }
            }
        });
    } 
    else 
    {
        request.flash("error", 'Please login into YelpCamp first!');
        response.redirect("back");
    }
};

middlewareObject.checkReviewExistence = function (request, response, next) 
{
    if (request.isAuthenticated()) 
    {
        Campground.findById(request.params.id).populate("reviews").exec(function (error, foundCampground) 
        {
            if (error || !foundCampground) 
            {
                request.flash("error", "Campground not found.");
                response.redirect("back");
            } 
            else 
            {
                // check if req.user._id exists in foundCampground.reviews
                var foundUserReview = foundCampground.reviews.some(function (review) 
                {
                    return review.author.id.equals(request.user._id);
                });
                if (foundUserReview) 
                {
                    request.flash("error", "Only one review per user is permitted.");
                    return response.redirect("/campgrounds/" + foundCampground._id);
                }
                // if the review was not found, go to the next middleware
                next();
            }
        });
    }
    else 
    {
        request.flash("error", "You need to login first.");
        response.redirect("back");
    }
};

module.exports = middlewareObject;