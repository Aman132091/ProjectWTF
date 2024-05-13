require("dotenv").config();
const twilio = require("twilio");

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const generateOTP = () => {
  // Generate a random 4-digit OTP
  return Math.floor(1000 + Math.random() * 9000);
};

const sendOTP = async (phoneNumber) => {
  const otp = generateOTP(); // Generate OTP
  try {
    await twilioClient.messages.create({
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
      body: `OTP for Login : ${otp}`,
    });
    console.log("OTP sent successfully");
    return otp; // Return the OTP for verification purposes if needed
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw new Error("Error sending OTP");
  }
};

module.exports = sendOTP;
