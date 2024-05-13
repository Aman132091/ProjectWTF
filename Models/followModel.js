const mongoose = require("mongoose");
const followSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organiser",
    },
  },
  { timestamps: true }
);

const followModel = mongoose.model("Follow", followSchema);
module.exports = followModel;
