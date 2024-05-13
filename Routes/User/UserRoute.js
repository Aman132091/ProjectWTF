const express = require("express");
const userRoute = express.Router();

const {
  Login,
  VerifyOTP,
  loginGoogle,
  verifyGoogle,
  chooseFavLeague,
  chooseFavTeam,
  userProfileDetails,
  editUserProfile,
  viewUserProfile,
  selectFavoriteEvents,
  viewFavoriteEvents,
  switchUser,
  switchToOrganiser,
  followOrganiser,
  unfollowOrganiser,
  bookTickets,
  cancelBooking,
  ShowMyAllBookings,
  getTicketDetail,
  changePhoneNumber,
  countFollower,
  review,
  reviews,
  averageReview,
  averageForEachStar,
} = require("../../Controller/User/userController");
const { checkAuth } = require("../../Middleware/userMiddleware");
const createMulterMiddleware = require("../../Middleware/Multer.js");
const { organiserVerify } = require("../../Middleware/organiserMiddleware.js");

const upload = createMulterMiddleware([
  { name: "profileImage" },
  { name: "photo1" },
  { name: "photo2" },
  { name: "photo3" },
  { name: "photo4" },
]);

userRoute.post("/loginUser", Login);
userRoute.post("/verifyOTP", VerifyOTP);
userRoute.put("/changePhoneNumber", checkAuth, changePhoneNumber);

userRoute.get("/loginGoogle", loginGoogle);
userRoute.get("/verifyGoogle", verifyGoogle);
userRoute.get("/favLeauge", checkAuth, chooseFavLeague);
userRoute.get("/favTeam", checkAuth, chooseFavTeam);
userRoute.get("/userprofile", checkAuth, userProfileDetails);

userRoute.put("/editUserProfile", checkAuth, upload, editUserProfile);
userRoute.get("/viewUserProfile", checkAuth, viewUserProfile);

userRoute.get("/favEvent", checkAuth, selectFavoriteEvents);
userRoute.get("/userFavouriteEvent", checkAuth, viewFavoriteEvents);

userRoute.get("/switchtouser", checkAuth, switchUser);
userRoute.get("/switchtoorganiser", checkAuth, switchToOrganiser);

userRoute.get("/followorganiser/:organizerId", checkAuth, followOrganiser);
userRoute.delete(
  "/unfollowOrganiser/:organizerId",
  checkAuth,
  unfollowOrganiser
);

userRoute.get("/bookTickets/:eventId", checkAuth, bookTickets);
userRoute.delete("/cancleTicket/:ticketId", checkAuth, cancelBooking);

userRoute.get("/showMyAllBookings", checkAuth, ShowMyAllBookings);
userRoute.get("/getTecketDetail/:ticketId", checkAuth, getTicketDetail);

userRoute.get("/countFollow", organiserVerify, countFollower);
userRoute.post('/review',checkAuth,organiserVerify,review)
userRoute.get('/reviews/:organiserId',organiserVerify,reviews)
userRoute.get('/averageReview/:organiserId',averageReview)
userRoute.get('/averageForEachStar',averageForEachStar)
module.exports = userRoute;
