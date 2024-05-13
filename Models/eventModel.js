const mongoose = require("mongoose");
const eventSchema = new mongoose.Schema(
  {
    photos: [
      {
        type: String,
      },
    ],

    eventName: {
      type: String,
    },

    description: {
      type: String,
    },
    location: {
      type: String,
    },

    price_Types: [
      {
        type: {
          type: String,
        },

        price: {
          type: Number,
        },
      },
    ],

    leauge: {
      type: String,
    },

    match: {
      team1: {
        type: String,
      },
      team2: {
        type: String,
      },
    },
    price: {
      type: Number,
    },

    availableTickets: {
      type: Number,
      default: 20,
    },

    Date: {
      type: String,
    },

    Time: {
      type: String,
    },

    organiserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organiser",
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const eventModel = mongoose.model("Event", eventSchema);
module.exports = eventModel;
