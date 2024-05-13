const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  organiserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organiser",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  reviewText: {
    type: String,
    required: true,
  },
  percentage: {},
});

const Review_Rating = mongoose.model("Review", reviewSchema);

module.exports = Review_Rating;
