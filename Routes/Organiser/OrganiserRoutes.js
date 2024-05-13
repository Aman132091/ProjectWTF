const express = require("express");
const {
  register,
  chooseLeauge,
  chooseTeam,
  createEvent,
  deleteEvent,
  getAllEvents,
} = require("../../Controller/Organiser/organiserController");
const { checkAuth } = require("../../Middleware/userMiddleware");
const { organiserVerify } = require("../../Middleware/organiserMiddleware.js");
const createMulterMiddleware = require("../../Middleware/Multer.js");

const uploads = createMulterMiddleware([
  { name: "profileImage" },
  { name: "photo1" },
  { name: "photo2" },
  { name: "photo3" },
  { name: "photo4" },
]);
const organizerRoute = express.Router();

// Use a POST request to set organizer profile
organizerRoute.post("/setOrganizerProfile", checkAuth, uploads, register);
organizerRoute.get("/selectleague", chooseLeauge);
organizerRoute.get("/selectteam", chooseTeam);
organizerRoute.post("/createEvent", uploads, checkAuth, createEvent);
organizerRoute.delete("/deleteEvent/:eventId", deleteEvent);
organizerRoute.get("/viewallevent", getAllEvents);

module.exports = organizerRoute;
