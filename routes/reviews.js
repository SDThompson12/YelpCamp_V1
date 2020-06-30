var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campgrounds");
var Review = require("../models/reviews");
var middleware = require("../middleware");

// Reviews Index Route
router.get("/", function (request, response)
{
    Campground.findById(request.params.id).populate
    ({
        path: "reviews",
        options: {sort: {createdAt: -1}} //Sorts the reviews array to show the latest first
    }).exec(function (error, campground) {
        if (error || !campground) {
            request.flash("error", error.message);
            return response.redirect("back");
        }
        response.render("reviews/index.ejs", {yelpCampGrounds: campground});
    });
});

// Reviews New Route
router.get("/new", middleware.isLoggedIn, middleware.checkReviewExistence, function (request, response) 
{
    // middleware.checkReviewExistence checks if a user already reviewed the campground, only one review per user is allowed
    Campground.findById(request.params.id, function (error, campground) 
    {
        if (error) 
        {
            request.flash("error", error.message);
            return response.redirect("back");
        }
        response.render("reviews/new.ejs", {yelpCampGrounds: campground});

    });
});

// Reviews Create Route
router.post("/", middleware.isLoggedIn, middleware.checkReviewExistence, function (request, response)
{
    //lookup campground using ID
    Campground.findById(request.params.id).populate("reviews").exec(function (error, campground) 
    {
        if (error) 
        {
            request.flash("error", error.message);
            return response.redirect("back");
        }
        Review.create(request.body.review, function (error, review) 
        {
            if (error) 
            {
                request.flash("error", error.message);
                return response.redirect("back");
            }
            //add author username/id and associated campground to the review
            review.author.id = request.user._id;
            review.author.username = request.user.username;
            review.campground = campground;
            //save review
            review.save();
            campground.reviews.push(review);
            // calculate the new average review for the campground
            campground.rating = calculateAverage(campground.reviews);
            //save campground
            campground.save();
            request.flash("success", "Your review has been successfully added.");
            response.redirect('/campgrounds/' + campground._id);
        });
    });
});

function calculateAverage(reviews)
{
    if (reviews.length === 0) 
    {
        return 0;
    }
    var sum = 0;
    reviews.forEach(function (element) 
    {
        sum += element.rating;
    });
    return sum / reviews.length;
}

// Reviews Edit Route
router.get("/:review_id/edit", middleware.checkReviewOwnership, function (request, response)
{
    Review.findById(request.params.review_id, function (error, foundReview) 
    {
        if (error) {
            request.flash("error", error.message);
            return response.redirect("back");
        }
        response.render("reviews/edit.ejs", {campground_id: request.params.id, review: foundReview});
    });
});

// Reviews Update Route
router.put("/:review_id", middleware.checkReviewOwnership, function (request, response) 
{
    Review.findByIdAndUpdate(request.params.review_id, request.body.review, {new: true}, function (error, updatedReview) 
    {
        if (error) 
        {
            request.flash("error", error.message);
            return response.redirect("back");
        }
        Campground.findById(request.params.id).populate("reviews").exec(function (error, campground) {
            if (error) {
                request.flash("error", error.message);
                return response.redirect("back");
            }
            // recalculate campground average
            campground.rating = calculateAverage(campground.reviews);
            //save changes
            campground.save();
            request.flash("success", "Your review was successfully edited.");
            response.redirect('/campgrounds/' + campground._id);
        });
    });
});

// Reviews Delete
router.delete("/:review_id", middleware.checkReviewOwnership, function (request, response) 
{
    Review.findByIdAndRemove(request.params.review_id, function (error) {
        if (error) 
        {
            request.flash("error", error.message);
            return response.redirect("back");
        }
        Campground.findByIdAndUpdate(request.params.id, {$pull: {reviews: request.params.review_id}}, {new: true}).populate("reviews").exec(function (error, campground) {
            if (error) 
            {
                request.flash("error", error.message);
                return response.redirect("back");
            }
            // recalculate campground average
            campground.rating = calculateAverage(campground.reviews);
            //save changes
            campground.save();
            request.flash("success", "Your review was deleted successfully.");
            response.redirect("/campgrounds/" + request.params.id);
        });
    });
});

module.exports = router;