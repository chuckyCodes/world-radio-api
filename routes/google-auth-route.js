const express = require("express");
const router = express.Router();
const { OAuth2Client } = require("google-auth-library");
const axios = require("axios");
const User = require("../models/user-model");
const createToken = require("../utils/createToken");
const hashPassword = require("../utils/hashPassword");
const handleCreateUserErrors = require("../utils/handleSignUpErrors");

const redirectUrl = `${process.env.REDIRECT_BASE_URL}/api/v1/oauth/google`;
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const oAuth2Client = new OAuth2Client(client_id, client_secret, redirectUrl);

const getGoogleUser = async (access_token) => {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`
    );
    return response.data;
  } catch (error) {
    console.error(error, "Error getting google user");
  }
};

const getData = (user, token) => {
  let data = {};

  data["name"] = user.name;
  data["email"] = user.email;
  data["picture"] = user.picture;
  data["verified"] = user.verified;
  data["token"] = token;

  return data;
};

//get authorize url end-point
router.get("/url", (req, res) => {
  const authorizeUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: "https://www.googleapis.com/auth/userinfo.profile email",
  });

  res.status(200).json({ authorizeUrl });
});

//receive oauth callback and process google user data
router.get("/", async (req, res) => {
  const { code } = req.query;
  try {
    const response = await oAuth2Client.getToken(code);
    await oAuth2Client.setCredentials(response.tokens);
    const userCredentials = oAuth2Client.credentials;
    const userInfo = await getGoogleUser(userCredentials.access_token);
    const users = await User.find({ email: userInfo.email });

    const verifiedUser = users.find((user) => user.verified);

    let data;

    if (verifiedUser) {
      if (!verifiedUser.picture) {
        verifiedUser.picture = userInfo.picture;
        verifiedUser.name = userInfo.name;
        await verifiedUser.save();
      }
      const token = createToken(verifiedUser._id);
      data = getData(verifiedUser, token);
    }

    if (users.length === 0 || !verifiedUser) {
      const hashedPassword = await hashPassword(
        process.env.GOOGLE_LOGIN_PASSWORD
      );
      const newUser = await User.create({
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        verified: true,
        password: hashedPassword,
      });

      const createdUser = await newUser.save();
      if (createdUser) {
        const token = createToken(createdUser._id);
        data = getData(createdUser, token);
      }
    }

    const stringifiedData = JSON.stringify(data);
    const encodedData = Buffer.from(stringifiedData).toString("base64");
    res.redirect(`${process.env.CLIENT_URL}?data=${encodedData}`);
  } catch (err) {
    const error = handleCreateUserErrors(err);
    res.json({ error });
    console.log(error);
  }
});

module.exports = router;
