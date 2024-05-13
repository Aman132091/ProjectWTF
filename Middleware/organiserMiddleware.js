// require("dotenv").config();
// const jwt = require("jsonwebtoken");

// const organiserVerify = async function (req, res, next) {
//   const token = req.cookies.organiserToken;
//   // const token = req.header("Authorization")?.replace("Bearer ", "")
//   //  console.log(token)
//   if (!token) {
//     return res.status(400).json({
//       message: "Not Authrozied",
//     });
//   }
//   jwt.verify(token, process.env.JWT_SECRET_KEY_ORG, (error, payload) => {
//     if (error) {
//       return res.status(400).json({
//         message: "Token Is Invalid",
//       });
//     } else {
//       //    console.log("You Have sucessfully verified and Get Details !! :--> ")
//       //    console.log(payload)

//       req.details = payload;

//       next();
//     }
//   });
// };
// module.exports = { organiserVerify };

require("dotenv").config();
const jwt = require("jsonwebtoken");
exports.organiserVerify = async (req, res, next) => {
  const { authorization2 } = req.headers;

  if (authorization2 && authorization2.startsWith("Bearer")) {
    try {
      tokenOrganiser = authorization2.split(" ")[1];
      const { organiserId } = jwt.verify(
        tokenOrganiser,
        process.env.JWT_SECRET_KEY_ORG
      );


      req.organizer = organiserId;

      next();
    } catch (error) {
      console.log(error);
      res.send({ status: "failed", message: error.message });
    }
  } else {
    res.send({ status: "failed", message: "authorization2 not matched....." });
  }
};
