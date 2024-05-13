require("dotenv").config();
const express = require("express");

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const router = require("./Routes/User/UserRoute");

const { db } = require("./Config/DB");
const organizerRoute = require("./Routes/Organiser/OrganiserRoutes");
db();
const app = express();

// Middleware
app.use(cookieParser("secret"));
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use("/user", router);
app.use("/organizer", organizerRoute);

app.get("/", (req, res) => {
  res.send({ message: "Done" });
});
// Listner
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server is Started at http://localhost:${port}`);
});

// //UserRoute
// const userRoute = require("./Routes/User/UserRoute")
// app.use("/user" , userRoute)

//OrganiserRoute
// const OrganiserRoute = require("./Routes/Organiser/OrganiserRoutes.js")
// app.use("/organiser" , OrganiserRoute)

// const adminRoute = require("./routes/admin/admin.js")
// app.use("/admin" , adminRoute)
