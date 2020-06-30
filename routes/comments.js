var express = require('express');
var router = express.Router({mergeParams: true});
var Campground = require('../models/campgrounds.js');
var Comments = require('../models/comments.js');
var middleware = require("../middleware");

//===================NESTED ROUTES==============================
//Comments New
router.get("/new", middleware.isLoggedIn, function(request, response)
{
    //Find Campground by id
    Campground.findById(request.params.id, function(error, campgroundData){
        if(error)
        {
            console.log(error);
        }
        else
        {
             response.render("comments/new.ejs", {campground: campgroundData});
            
        }
    });
});

//Comments Create
router.post("/", middleware.isLoggedIn, function(request, response)
{
    //Look up Campground id
    Campground.findById(request.params.id, function(error, campgroundData)
    {
        if(error)
        {
            console.log(error);
            response.redirect("/campgrounds");
        }
        else
        {
            Comments.create(request.body.comments, function(error, comments)
            {
                if(error)
                {
                    console.log(error);
                }
                else
                {
                    //Add Username and Id to comment
                    comments.author.id = request.user._id;
                    comments.author.username = request.user.username;
                    //Save comment
                    comments.save();
                    campgroundData.comments.push(comments);
                    campgroundData.save();
                    response.redirect('/campgrounds/' + campgroundData._id);
                }
            });
        }
    });
});

//Comments Edit
router.get('/:comment_id/edit', middleware.checkCommentOwner, function(request, response)
{
    Campground.findById(request.params.id, function(error, foundCampGround)
    {
        if(error || !foundCampGround)
        {
            request.flash('error', 'Campground not found.');
            return response.redirect('back');
        }
        Comments.findById(request.params.comment_id, function(error, foundComment)
        {
            if(error)
            {
                response.redirect('back');
            }
            else
            {
              response.render("comments/edit.ejs", {campground_id: request.params.id, comments: foundComment});   
            }
        });
    });
});

//Comments Update
router.put('/:comment_id', middleware.checkCommentOwner, function(request, response)
{
   Comments.findByIdAndUpdate(request.params.comment_id, request.body.comments, function(error,updatedComment)
   {
      if(error)
      {
          response.redirect('back');
      }
      else
      {
          response.redirect('/campgrounds/' + request.params.id);
      }
   });
});4

//Comments Destroy
router.delete('/:comment_id', middleware.checkCommentOwner, function(request, response)
{
   Comments.findByIdAndRemove(request.params.comment_id, function(error)
   {
       if(error)
       {
           response.redirect('back');
       }
       else
       {
           request.flash('sucess','Comment deleted.');
           response.redirect("/campgrounds/" + request.params.id);
       }
   });
});

module.exports = router;