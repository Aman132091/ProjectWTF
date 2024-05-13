const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
    },

    otp: {
      type: String,
    },

    otpExpiration: {
      type: Date,
    },

    status: {
      type: String,
      default: "user",
    },

    otpAttempts: {
      type: String,
      default: "0",
    },

    googleID: {
      type: String,
    },
    email: {
      type: String,
    },

    firstName: {
      type: String,
    },

    userProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User_Profile",
    },
  },
  { timestamps: true }
);

const userModel = mongoose.model("User", userSchema);
module.exports = userModel;
