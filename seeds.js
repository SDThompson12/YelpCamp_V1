var mongoose = require("mongoose");
var Campground = require("./models/campgrounds.js");
var Comments   = require("./models/comments.js");
 
var seededData = [
    {
        name:"Brown Buffalo Hills", 
        image:"https://www.yellowstonenationalparklodges.com/content/uploads/2017/04/madison-campground-1024x768.jpg",
        description:"This beautiful range is populated by our protected herd of Buffalo. Accompanied by acres of open fields and fresh air. Perfect for the outside camp lifestyle!"
    },
    {
        name:"Tiny House Campground", 
        image:"https://riverside-campground.com/images/005.jpg",
        description:"Park your tiny house on the forest side and enjoy the scenery with all your new neighbors!"
    }
]
 
function seedDB()
{
   //Removes all campgrounds
   Campground.remove({}, function(error)
   {
        if(error)
        {
            console.log(error);
        }
        console.log("Removed all campgrounds.");
        Comments.remove({}, function(error) 
        {
            if(error)
            {
                console.log(error);
            }
            console.log("Removed all comments.");
             //Adds a few campgrounds
            seededData.forEach(function(seed)
            {
                Campground.create(seed, function(error, campground)
                {
                    if(error)
                    {
                        console.log(error)
                    } 
                    
                    else 
                    {
                        console.log("Added a campground");
                        //create a comment
                        Comments.create(
                            {
                                text: "This place is great, but I wish there was internet.",
                                author: "Bored Teenager"
                            }, function(error, comment)
                            {
                                if(error)
                                {
                                    console.log(error);
                                } 
                                else 
                                {
                                    campground.comments.push(comment);
                                    campground.save();
                                    console.log("Created a new comment");
                                }
                            });
                    }
                });
            });
        });
    });

    //Adds a few comments
}
 
module.exports = seedDB;