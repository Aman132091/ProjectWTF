const mongoose = require("mongoose");

const userProfileSchema = new mongoose.Schema(
  {
    favleague: [
      {
        type: [String], // Assuming favleague is an array of strings
        default: [], // Default value is an empty array
      },
    ],

    favTeam: [
      {
        type: [String],
        default: [],
      },
    ],

    firstName: {
      type: String,
    },

    dob: {
      type: String,
    },

    profileImage: {
      type: String,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const userProfileModel = mongoose.model("User_Profile", userProfileSchema);
module.exports = userProfileModel;
