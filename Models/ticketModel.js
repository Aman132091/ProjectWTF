const mongoose = require("mongoose");
const ticketSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    eventName: {
      type: String,
    },

    Date: {
      type: String,
    },

    Time: {
      type: String,
    },

    numberOfTickets: {
      type: Number,
    },
  },
  { timestamps: true }
);

const ticketModel = mongoose.model("Tickets", ticketSchema);
module.exports = ticketModel;
