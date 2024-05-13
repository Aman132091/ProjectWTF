const mongoose = require("mongoose");
const favLeagueSchema = new mongoose.Schema(
  {
    favleague: [
      {
        type: String,
      },
    ],

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const favLeagueModel = mongoose.model("FAVOURITE LEAGUE", favLeagueSchema);
module.exports = favLeagueModel;
