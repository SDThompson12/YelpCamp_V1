var mongoose = require("mongoose");

var reviewSchema = new mongoose.Schema({
    rating: 
    {
        // Setting the field type
        type: Number,
        // Making the star rating required
        required: "Please provide a rating (1-5 stars).",
        // Max and Min values for rating
        min: 1,
        max: 5,
        //Validation that input is an integer 
        validate: {
            // validator accepts a function definition which it uses for validation
            validator: Number.isInteger,
            message: "{VALUE} is not an integer value."
        }
    },
    //Text for Review
    text: 
    {
        type: String
    },
    // author id and username fields
    author: 
    {
        id: 
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    //Campground realated to the review given
    campground: 
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Campground"
    }
}, {
    // if timestamps are set to true, mongoose assigns createdAt and updatedAt fields to your schema, the type assigned is Date.
    timestamps: true
});

module.exports = mongoose.model("Review", reviewSchema);