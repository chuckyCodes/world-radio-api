require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const port = process.env.PORT;
const authRoute = require("./routes/auth-route");
const favRoute = require("./routes/favorites-route");
const stationsRoute = require("./routes/stations-route");
const googleAuth = require("./routes/google-auth-route");
const verifyRoute = require("./routes/verification-route");

mongoose.connect(process.env.DB_URI).then(() => {
  console.log("connected to database");
  app.listen(port, () => console.log(`server listening on port ${port}`));
});

app.use(express.json());
app.use(cors());

app.use("/api/v1/user/auth", authRoute);
app.use("/api/v1/stations", stationsRoute);
app.use("/api/v1/favorites", favRoute);
app.use("/api/v1/oauth/google", googleAuth);
app.use("/", verifyRoute);
