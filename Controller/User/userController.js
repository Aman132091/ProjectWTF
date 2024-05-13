const mongoose = require("mongoose");
const userModel = require("../../Models/userModel");
const sendOTP = require("../../Utils/SendSMS");
const generateToken = require("../../Utils/Token");
const apiResponse = require("../../Utils/APIresponse");
const userProfileModel = require("../../Models/userProfileModel");
const favLeagueModel = require("../../Models/favLeagueModel");
const userMiddleware = require("../../Middleware/userMiddleware");
const favTeamModel = require("../../Models/FavTeamModel");
const favEventModel = require("../../Models/favEventModel");
const followModel = require("../../Models/followModel");
const Event = require("../../Models/eventModel");
const Ticket = require("../../Models/ticketModel");
const CountFollow = require("../../Models/followCountModel");
const countModel = require("../../Models/followCountModel");
const Review = require("../../Models/ReviewsAndRatingsModel");

exports.Login = async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    let userExists = await userModel.findOne({ phoneNumber });
    let otp, otpExpiration;

    if (!userExists) {
      otp = await sendOTP(phoneNumber);
      otpExpiration = new Date();
      otpExpiration.setSeconds(otpExpiration.getSeconds() + 3000000);

      userExists = await userModel.create({
        phoneNumber,
        otp,
        otpExpiration,
      });
    } else {
      otp = await sendOTP(phoneNumber);
      otpExpiration = new Date();
      otpExpiration.setSeconds(otpExpiration.getSeconds() + 3000000);

      userExists.otp = otp;
      userExists.otpExpiration = otpExpiration;
      userExists.otpAttempts = 0;
      await userExists.save();
    }

    const token = generateToken.generateToken(userExists._id);

    return apiResponse.onSuccess(res, "OTP sent successfully", 200, true, {
      otp,
      token,
    });
  } catch (error) {
    return apiResponse.onError(res, "An error occurred", 500, false);
  }
};

exports.changePhoneNumber = async (req, res) => {
  const { phoneNumber } = req.body;

  const user = await userModel.findById(req.user);

  if (user) {
    if (phoneNumber) {
      const otp = await sendOTP(phoneNumber);
      otpExpiration = new Date();
      otpExpiration.setSeconds(otpExpiration.getSeconds() + 3000000);

      user.otp = otp;
      await user.save();

      return apiResponse.onSuccess(res, "OTP sent successfully", 201, true, {
        otp,
      });
    } else {
      return apiResponse.onError(res, "Not enterd a phone number");
    }
  } else {
    return apiResponse.onError(res, "User not found", 400, false);
  }
};

exports.VerifyOTP = async (req, res) => {
  const { phoneNumber, otp } = req.body;

  if (!phoneNumber || !otp) {
    return apiResponse.onError(
      res,
      "Phone number and OTP are required",
      400,
      false
    );
  }

  try {
    let user = await userModel.findOne({ phoneNumber });

    if (!user) {
      return apiResponse.onError(res, "User not found", 404, false);
    }

    if (user.otpAttempts >= 3 && user.otpExpiration > new Date()) {
      // User has exceeded OTP attempts, return error
      return apiResponse.onError(
        res,
        "Maximum OTP attempts reached. Please try again after 30 minutes.",
        400,
        false
      );
    }

    if (user.otp !== otp || user.otpExpiration < new Date()) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;

      if (user.otpAttempts >= 3) {
        const thirtyMinutesFromNow = new Date();
        thirtyMinutesFromNow.setMinutes(thirtyMinutesFromNow.getMinutes() + 30);
        user.otpExpiration = thirtyMinutesFromNow;
      }

      await user.save();

      return apiResponse.onError(res, "Invalid or expired OTP", 400, false);
    }

    user.otp = undefined;
    user.otpExpiration = undefined;
    user.otpAttempts = 0;
    await user.save();

    return apiResponse.onSuccess(res, "OTP verified successfully", 200, true);
  } catch (error) {
    return apiResponse.onError(res, "Failed to verify OTP", 500, false);
  }
};

exports.loginGoogle = async (req, res) => {
  try {
    const redirectURI = encodeURIComponent(
      "http://localhost:5874/user/verifyGoogle"
    );
    const authURL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.CLIENT_ID}&redirect_uri=${redirectURI}&response_type=code&scope=email%20profile`;
    res.send(authURL);
  } catch (error) {
    return apiResponse.onError(res, "Error During Login", 400, false);
  }
};

exports.verifyGoogle = async (req, res) => {
  const code = req.query.code;

  try {
    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      querystring.stringify({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        code: code,
        redirect_uri: "http://localhost:5874/user/verifyGoogle",
        grant_type: "authorization_code",
      })
    );

    const accessToken = tokenResponse.data.access_token;

    // Fetch user details from Google using the access token
    const profileResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    // console.log(profileResponse.data.id);
    // console.log(profileResponse.data.email);
    // console.log(profileResponse.data.name);

    const userData = await userModel.create({
      googleID: profileResponse.data.id,
      email: profileResponse.data.email,
      firstName: profileResponse.data.name,
    });

    const userProfile = await userProfileModel.create({
      profileImage: profileResponse.data.picture,
      userId: userData._id,
    });

    if (!userProfile) {
      return apiResponse.onError(
        res,
        "Error During saving UserProfile Data",
        400,
        false
      );
    }

    if (!userData) {
      return apiResponse.onError(
        res,
        "Error During saving User Data",
        400,
        false
      );
    }

    const dataUser = {
      userData,
      userProfile,
    };

    return apiResponse.onSuccess(
      res,
      "Sign-up successful!",
      201,
      true,
      dataUser
    );
  } catch (error) {
    return apiResponse.onError(
      res,
      "Error occurred during sign-up: Verify",
      500,
      false
    );
  }
};

exports.chooseFavTeam = async (req, res) => {
  const { favTeam } = req.body;

  try {
    const user = await userModel.findById(req.user);

    if (user) {
      if (favTeam.length > 3) {
        return apiResponse.onSuccess(
          res,
          "You can choose up to 3 favourite Teams only!",
          400,
          false
        );
      }

      const chooseSave = favTeamModel({
        favTeam,
        userId: req.user,
      });

      await chooseSave.save();

      return apiResponse.onSuccess(res, "Favourite team selected", 200, true);
    }
  } catch (error) {
    return apiResponse.onError(res, "Error on saving fav team", 500, false);
  }
};

exports.chooseFavLeague = async (req, res) => {
  const { favleague } = req.body;

  try {
    const user = await userModel.findById(req.user);

    if (user) {
      if (favleague.length > 3) {
        return apiResponse.onSuccess(
          res,
          "You can choose up to 3 favourite leagues only!",
          400,
          false
        );
      }

      const chooseSave = favLeagueModel({
        favleague,
        userId: req.user,
      });

      await chooseSave.save();
      return apiResponse.onSuccess(res, "Favourite league selected", 200, true);
    }
  } catch (error) {
    return apiResponse.onError(res, "Error on svAING fav league", 500, false);
  }
};

exports.userProfileDetails = async (req, res) => {
  const { firstName, dob } = req.body;

  const user = await userModel.findById(req.user);

  if (user) {
    const existingProfile = await userProfileModel.findOne({
      userId: req.user,
    });

    if (existingProfile) {
      return apiResponse.onError(
        res,
        "User Profile Already Exists",
        400,
        false
      );
    } else {
      const favleagueDetails = await favLeagueModel.findOne({
        userId: req.user,
      });

      const favTeamDeatils = await favTeamModel.findOne({ userId: req.user });

      const newUserProfile = userProfileModel({
        favleague: favleagueDetails ? favleagueDetails.favleague : [],
        favTeam: favTeamDeatils ? favTeamDeatils.favTeam : [],
        firstName,
        dob,
        userId: req.user,
      });

      await newUserProfile.save();
      return apiResponse.onSuccess(
        res,
        "User Profile Details Added",
        200,
        true
      );
    }
  }
};

exports.editUserProfile = async (req, res) => {
  const { firstName, dob, favleague, favTeam } = req.body;

  try {
    const user = await userModel.findById(req.user);

    if (user) {
      // Check if userProfile already exists for the userId
      const existingProfile = await userProfileModel.findOne({
        userId: req.user,
      });

      if (existingProfile) {
        // Update the existing userProfile
        existingProfile.firstName = firstName || existingProfile.firstName; // keep the firstname same as the save already
        existingProfile.dob = dob || existingProfile.dob; // keep the dob same as it save ib DB
        existingProfile.favleague = favleague || existingProfile.favleague; // Keep the existing favleague if not provided in the request
        existingProfile.favTeam = favTeam || existingProfile.favTeam; //for team

        if (req.file) {
          // If file is uploaded, update profile picture path
          existingProfile.profileImage = req.file.path;
        }

        await existingProfile.save();

        return apiResponse.onSuccess(
          res,
          "User profile updated successfully",
          200,
          true
        );
      } else {
        // If userProfile does not exist, return error
        return apiResponse.onError(res, "User profile not found", 400, false);
      }
    } else {
      return apiResponse.onError(res, "User not found", 400, false);
    }
  } catch (error) {
    return apiResponse.onError(res, "Error updating user profile", 500, false);
  }
};

exports.viewUserProfile = async (req, res) => {
  const user = await userModel.findById(req.user);

  try {
    if (user) {
      const userProfile = await userProfileModel
        .findOne({ userId: req.user })
        .select("-userId");

      if (userProfile) {
        return apiResponse.onSuccess(
          res,
          "User profile found",
          200,
          userProfile
        );
      } else {
        return apiResponse.onError(res, "User profile not found", 404, false);
      }
    } else {
      return apiResponse.onError(res, "User Not Found", 400, false);
    }
  } catch (error) {
    return apiResponse.onError(res, "Error on Viewing Profile", 500, false);
  }
};

exports.selectFavoriteEvents = async (req, res) => {
  try {
    const { favoriteEvents } = req.body;

    const result = await favEventModel.findOneAndUpdate(
      { userId: req.user },
      { $set: { favEvent: favoriteEvents } },
      { upsert: true, new: true }
    );

    // res.status(200).json({ message: "Favorite events updated successfully", favoriteEvents: result.favEvent });
    return apiResponse.onSuccess(
      res,
      "Favorite events updated successfully",
      201,
      true,
      result
    );
  } catch (error) {
    console.log("Error selecting favorite events:", error);

    return apiResponse.onError(
      res,
      "Error selecting favourite events",
      500,
      false
    );
  }
};

exports.viewFavoriteEvents = async (req, res) => {
  try {
    // const userId = req.params

    const favoriteEvents = await favEventModel
      .findOne({ userId: req.user })
      .populate("userId", "username");

    if (!favoriteEvents) {
      // return res.status(404).json({ message: "Favorite events not found for the user" });
      return apiResponse.onError(
        res,
        "Favorite events not found for the user",
        400,
        false
      );
    }

    // res.status(200).json({ favoriteEvents: favoriteEvents.favEvent });
    return apiResponse.onSuccess(
      res,
      "Favorite events : ",
      200,
      true,
      favoriteEvents.favEvent
    );
  } catch (error) {
    console.log("Error viewing favorite events:", error);

    return apiResponse.onError(
      res,
      "Error on viewing favourite events",
      500,
      false
    );
  }
};

exports.switchUser = async (req, res) => {
  const user = await userModel.findById(req.user);

  if (user.status === "Organiser") {
    user.status = "user";

    await user.save();
    return apiResponse.onSuccess(res, "Organiser now become a User", 200, true);
  } else {
    return apiResponse.onError(res, "Already an user", 404, false);
  }
};

exports.switchToOrganiser = async (req, res) => {
  const user = await userModel.findById(req.user);

  if (user.status === "user") {
    user.status = "Organiser";

    await user.save();
    // res.send({message:'organiser now brecome a user'})
    return apiResponse.onSuccess(
      res,
      "User now become an Organiser",
      200,
      true
    );
  } else {
    // res.send({message:'Already an User'})
    return apiResponse.onError(res, "Already an Organiser", 404, false);
  }
};

exports.followOrganiser = async (req, res) => {
  const userId = req.user;
  const { organizerId } = req.params;

  try {
    const alreadyFollowed = await followModel.findOne({
      userId: userId,
      organizerId: organizerId,
    });

    if (alreadyFollowed) {
      return apiResponse.onError(
        res,
        "User already followed this organiser",
        404,
        false
      );
    }

    const followOtherOrganiser = await followModel.create({
      userId,
      organizerId,
    });

    return apiResponse.onSuccess(
      res,
      "User follows organiser Successfully",
      201,
      true
    );
  } catch (error) {
    return apiResponse.onError(
      res,
      "Error during follow the organiser",
      500,
      false
    );
  }
};

exports.unfollowOrganiser = async (req, res) => {
  const userId = req.user;
  const { organizerId } = req.params;

  try {
    const alreadyFollowed = await followModel.findOne({ userId, organizerId });
    if (!alreadyFollowed) {
      return apiResponse.onError(
        res,
        "User is not following this organiser",
        404,
        false
      );
    }
    await followModel.deleteOne({ userId, organizerId });

    return apiResponse.onSuccess(
      res,
      "User unfollows the organiser successfully",
      200,
      true
    );
  } catch (error) {
    return apiResponse.onError(
      res,
      "Error occurred while unfollowing the organiser",
      500,
      false
    );
  }
};

exports.bookTickets = async (req, res) => {
  try {
    const { numberOfTickets } = req.body;
    const { eventId } = req.params;

    const event = await Event.findById(eventId);

    if (!event) {
      return apiResponse.onError(res, "Event not found", 404, false);
    }

    if (event.availableTickets < numberOfTickets) {
      return apiResponse.onError(
        res,
        "Not enough tickets available",
        400,
        false
      );
    }

    // Update availableTickets count
    event.availableTickets -= numberOfTickets;
    await event.save();

    // Generate tickets
    const tickets = [];

    for (let i = 0; i < numberOfTickets; i++) {
      const ticket = new Ticket({
        userId: req.user,
        eventId: event._id,
        eventName: event.eventName,
        Date: event.Date,
        Time: event.Time,
        numberOfTickets,
      });

      await ticket.save();
      tickets.push(ticket);
      return apiResponse.onSuccess(
        res,
        "Tickets booked successfully",
        201,
        true,
        { tickets }
      );
    }
  } catch (error) {
    console.log("Error during Ticket Booking:", error);

    return apiResponse.onError(res, "Error during booking tickets", 500, false);
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return apiResponse.onError(res, "Ticket not found", 404, false);
    }

    const matchUserIsAuthorized = ticket.userId == req.user;

    if (matchUserIsAuthorized) {
      const event = await Event.findById(ticket.eventId);

      if (!event) {
        return apiResponse.onError(res, "Event not found", 404, false);
      }

      // Increment availableTickets count
      event.availableTickets += ticket.numberOfTickets;
      await event.save();

      await Ticket.findByIdAndDelete(ticketId);

      return apiResponse.onSuccess(
        res,
        "Ticket cancelled successfully",
        200,
        true
      );
    } else {
      return apiResponse.onError(res, "Not Authorized User", 400, false);
    }
  } catch (error) {
    console.log("Error during Ticket Cancellation:", error);
    return apiResponse.onError(
      res,
      "Error during cancelling ticket",
      500,
      false
    );
  }
};

exports.ShowMyAllBookings = async (req, res) => {
  const userId = req.user;

  const tickets = await Ticket.find({ userId }).select("-userId -eventId");
  console.log(tickets);

  return apiResponse.onSuccess(res, " All Bookings :- ", 201, true, tickets);
};

exports.getTicketDetail = async (req, res) => {
  const userId = req.user;
  const { ticketId } = req.params;

  const findBookingDetails = await Ticket.findById(ticketId).select("-eventId");

  if (!findBookingDetails) {
    return apiResponse.onError(res, "Ticket not found", 404, false);
  }

  const validUser = userId.toString() === findBookingDetails.userId.toString();

  if (validUser) {
    if (findBookingDetails) {
      return apiResponse.onSuccess(
        res,
        " Bookings Details are :- ",
        201,
        true,
        findBookingDetails
      );
    }
  } else {
    return apiResponse.onError(res, " is not a vaild user ", 400, false);
  }
};

exports.countFollower = async (req, res) => {
  const organizerId = req.organizer;
  console.log(organizerId);

  try {
    const followerCount = await followModel.countDocuments(organizerId);

    const countDocument = await countModel.create({
      organizerId: organizerId,
      TotalFollowers: followerCount,
    });

    return apiResponse.onSuccess(
      res,
      "Follower count retrieved successfully",
      200,
      true,
      { TotalFollowers: countDocument }
    );
  } catch (error) {
    return apiResponse.onError(
      res,
      "Error while retrieving follower count",
      500,
      false
    );
  }
};

exports.review = async (req, res) => {
  try {
    const { rating, reviewText } = req.body;
    const userId = req.user;
    const organiserId = req.organizer;

    const existingReview = await Review.findOne({
      userId,
      organiserId,
    });

    if (existingReview) {
      return apiResponse.onError(
        res,
        "You have already reviewed this Organizer.",
        400,
        false
      );
    }

    const review = await Review.create({
      userId: req.user,
      organiserId: organiserId,
      rating,
      reviewText,
    });
    return apiResponse.onSuccess(
      res,
      "You review Successfully",
      201,
      true,
      review
    );
  } catch (error) {
    return apiResponse.onSuccess(res, "Internal Server Error", 500, false);
  }
};




// Endpoint to get reviews for an Organiser
exports.reviews = async (req, res) => {
  try {
    const { organiserId } = req.params;
    const reviews = await Review.find({ organiserId: organiserId });
    return apiResponse.onSuccess(
      res,
      "Review fetch Successfully",
      201,
      true,
      reviews
    );
  } catch (error) {
    return apiResponse.onError(
      res,
      "Review not fetched Successfully",
      500,
      false
    );
  }
};

// Endpoint to calculate average rating for an item
exports.averageReview = async (req, res) => {
  try {
    const { organiserId } = req.params;
    const averageRating = await Review.aggregate([
      { $match: { organiserId: new mongoose.Types.ObjectId(organiserId) } },
      { $group: { _id: null, averageRating: { $avg: "$rating" } } },
    ]);

    return apiResponse.onSuccess(res, "Average rating calculated", 201, true, {
      Average_Rating: {
        averageRating:
          averageRating.length > 0 ? averageRating[0].averageRating : null,
      },
    });
  } catch (error) {
    console.log(error);
    return apiResponse.onError(res, " Average rating not fetched ", 500, false);
  }
};

exports.averageForEachStar = async (req, res) => {
  try {
    const result = await Review.aggregate([
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$count" },
          ratings: { $push: { rating: "$_id", count: "$count" } },
        },
      },
      {
        $unwind: "$ratings",
      },
      {
        $project: {
          _id: 0,
          rating: "$ratings.rating",
          percentage: {
            $multiply: [{ $divide: ["$ratings.count", "$total"] }, 100],
          },
        },
      },
    ]);

    return apiResponse.onSuccess(
      res,
      "Average for each star successfully",
      201,
      true,
      result
    );
  } catch (error) {
    console.error(error);
    return apiResponse.onError(res, "Internal Server Error", 500, false);
  }
};


