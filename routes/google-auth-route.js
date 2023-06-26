const express = require("express");
const router = express.Router();
const { OAuth2Client } = require("google-auth-library");
const axios = require("axios");

const redirectUrl = `${process.env.CLIENT_BASE_URL}/api/v1/oauth/google`;
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

//get authorize url end-point
router.get("/url", (req, res) => {
  const authorizeUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: "https://www.googleapis.com/auth/userinfo.profile",
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
    res.json({ userInfo });
  } catch (error) {
    res.json({ error });
  }
});

module.exports = router;
