const jwt = require("jsonwebtoken");
const cryptoJS = require("crypto-js");

const reqAuthorization = (req, res, next) => {
  const { authorization } = req.headers;
  try {
    if (authorization) {
      const encryptedToken = authorization.split(" ")[1];
      const decryptedToken = cryptoJS.AES.decrypt(
        encryptedToken,
        process.env.ENCRYPTION_KEY
      ).toString(cryptoJS.enc.Utf8);
      const decoded = jwt.verify(decryptedToken, process.env.SECRET);
      const userId = decoded.id;
      req.userId = userId;
      next();
    } else {
      throw "Authorization required";
    }
  } catch (error) {
    res.status(401).json({ error });
  }
};

module.exports = reqAuthorization;
