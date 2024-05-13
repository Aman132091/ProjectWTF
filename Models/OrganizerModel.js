const mongoose = require("mongoose");

const organiser = mongoose.Schema(
  {
    profilePicture: {
      type: String,
    },

    organiserName: {
      type: String,
    },

    buisnessEmail: {
      type: String,
      unique: true,
    },
    location: {
      lat: {
        type: String,
      },
      long: {
        type: String,
      },
    },

    photos: [
      {
        type: String,
      },
    ],

    chooseLeauge: [
      {
        type: String,
        default: [],
      },
    ],
    chooseTeam: [
      {
        type: String,
        default: [],
      },
    ],

    events: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Events",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    status: {
      type: Number,
      default: 0, // 0 for Pending , 1 for Verify , 2 for Rejected
    },
    privacy: {
      type: String,
      enum: ["Everyone", "no-one"],
      default: "Everyone",
    },
  },
  {
    timestamps: true,
  }
);
const Organiser = mongoose.model("Organiser", organiser);
module.exports = Organiser;
