const Organiser = require("../../Models/OrganizerModel");
const mongoose = require('mongoose');
const User = require("../../Models/userModel");
const apiResponse = require("../../Utils/APIresponse");
const { uploadOnCloudinary } = require("../../Utils/Cloudnary");
const jwt = require("jsonwebtoken");
const generateToken = require("../../Utils/Token");
const organiserMiddleware = require("../../Middleware/organiserMiddleware");
const userMiddleware = require("../../Middleware/userMiddleware");
const Event = require("../../Models/eventModel");
const userModel = require("../../Models/userModel");

//Set organiser
exports.register = async (req, res) => {
  try {
    const { organiserName, buisnessEmail, location } = req.body;
    const organiser = await Organiser.findOne({ buisnessEmail });
    const user = await User.findById(req.user);

    if (organiser) {
      return apiResponse.onSuccess(
        res,
        "User Already an Organiser",
        400,
        false
      );
    }

    const registerOrganiser = await Organiser.create({
      organiserName,
      buisnessEmail,
      location,
      userId: req.user,
    });

    let RegisterOrganiser = await Organiser.findById(registerOrganiser._id);

    if (req.files) {
      const number = Object.keys(req.files).length;

      if (number >= 0 && number <= 5) {
        const responses = [];

        const maxPhotos = Math.min(number - 1, 4);

        for (let i = 0; i <= maxPhotos; i++) {
          const photoField = `photo${i + 1}`;

          if (req.files && req.files[photoField] && req.files[photoField][0]) {
            const response = await uploadOnCloudinary(
              req.files[photoField][0].path
            );

            responses.push(response.url);
          } else {
            console.error(`Error: ${photoField} is undefined or empty.`);
          }
        }

        if (req.files && req.files.profileImage && req.files.profileImage[0]) {
          const profileResponse = await uploadOnCloudinary(
            req.files.profileImage[0].path
          );
          const profileImageURL = profileResponse.url;

          RegisterOrganiser.profilePicture = profileImageURL;
        }

        RegisterOrganiser.photos = responses;

        await RegisterOrganiser.save();
      }
    }

    const tokenOrganiser = generateToken.generateTokenForOrganizer(registerOrganiser._id);

    const RegisterOrganiserData = await Organiser.findById(
      registerOrganiser._id
    );

    await User.findByIdAndUpdate(
      req.user,
      { $set: { status: "Organiser" } },
      { new: true }
    );
    return apiResponse.onSuccess(
      res,
      "Organiser Successfully registered",
      200,
      true,
      { tokenOrganiser, RegisterOrganiserData }
    );
  } catch (error) {
    console.log("Something went wrong :", error);

    return apiResponse.onSuccess(
      res,
      "Error on Registering Organiser",
      500,
      false,
      
    );
  } 
};

//Choose Event
exports.chooseLeauge = async (req, res) => {
  try {
    const { chooseLeauge } = req.body;

    if (!chooseLeauge) {
      return apiResponse.onError(
        res, 
        "Please choose leauge first", 
        400, 
        false
      );
    }

    if (chooseLeauge.length > 3) {
      return apiResponse.onError(
        res,
        "Limit Exceede of choosing Leauge (max:3)",
        400,
        false
      );
    }

    var organiserDetails = await Organiser.findOne({ email: req.body.buisnessEmail });
    organiserDetails.chooseLeauge = chooseLeauge;
    await organiserDetails.save();

    return apiResponse.onSuccess(
      res,
      "League choose Successfully",
      200,
      true,
      organiserDetails
    );
  } catch (error) {
    return apiResponse.onError(
      res, 
      "Error choosing League", 
      400, 
      false
    );
  }
};

exports.chooseTeam = async (req, res) => {
  try {
    const { chooseTeam } = req.body;

    if (!chooseTeam) {
      return apiResponse.onError(res, "Please choose team first", 400, false);
    }

    if (chooseTeam.length > 5) {
      return apiResponse.onError(
        res,
        "Limit Exceed of choosing Team(maximum -- 3)",
        400,
        false
      );
    }

    var organiserDetails = await Organiser.findOne({ email: req.body.buisnessEmail });
    organiserDetails.chooseTeam = chooseTeam;
    await organiserDetails.save();

    return apiResponse.onSuccess(res, "Team successfully choosed", 201, true, {
      organiserDetails,
    });
  } catch (error) {
    console.log("Error choosing Team : ", error);

    return apiResponse.onError(res, "Error in choosing team", 500, false);
  }
}


//Create Event
exports.createEvent = async (req, res) => {
  try {
    const {
      eventName,
      description,
      location,
      price_Types,
      leauge,
      match,
      Date,
      Time,
    } = req.body;

    const user = await User.findById(req.user);

    if (user.status === "User") {
      return apiResponse.onError(
        res,
        "You have not switched to user",
        400,
        false
      );
    }

    const organizer = await Organiser.findOne({ email: req.body.buisnessEmail });

    if (!organizer) {
      return apiResponse.onError(
        res,
        "Organiser not found",
        404,
        false
      );
    }

    if (!req.url) {
      return apiResponse.onError(
        res,
        "Please select Atleast One Image before Creating an Event",
        400,
        false
      );
    }

    var registerEvent = await Event.create({
      eventName,
      description,
      location,
      price_Types,
      leauge,
      match,
      Date,
      Time,
      userId: req.user,
      organiserId: organizer._id
    })

    const number = Object.keys(req.files).length

    if (number > 0) {
      for (let i = 1; i <= Math.min(number, 4); i++) {
        const response = await uploadOnCloudinary(
          req.files[`photo${i}`][0].path
        )
        const imageURL = response.url

        registerEvent.photos[i - 1] = imageURL
      }

      await registerEvent.save()
    }

    const RegisterEvent = await Event.findById(registerEvent._id).select({
      userId: 0,
      organiserId: 0,
    })

    return apiResponse.onSuccess(
      res,
      "Event created successfully",
      201,
      true,
      RegisterEvent
    )
  } catch (error) {
    console.log("Error during Event Creating:", error);

    return apiResponse.onError(      
      res, 
      "Error during creating event", 
      500, 
      false
    );
  }
}

exports.deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;

    const event = await Event.findById(eventId);

    if (!event) {

      return apiResponse.onError(
        res, 
        "Event not found", 
        400, 
        false
      );
    }

    await Event.findByIdAndDelete(eventId);

    return apiResponse.onSuccess(
      res, 
      "Event deleted Successfully", 
      201, 
      true
    );
  } catch (error) {
    console.log("Error deleting event:", error);

    return apiResponse.onError(
      res,
      "Error during deleteing an event",
      500,
      false
    );
  }
};

exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find();

    return apiResponse.onSuccess(
      res, 
      "All Events are : ", 
      201, 
      true, 
      events
    );
  } catch (error) {
    console.log("Error fetching events:", error);
    return apiResponse.onError(
      res, 
      "Error fetching events", 
      500, 
      false
    );
  }
}; 


