const jwt = require("jsonwebtoken");
const cryptoJS = require("crypto-js");

const createToken = (userId) => {
  const token = jwt.sign({ id: userId }, process.env.SECRET, {
    expiresIn: "3d",
  });
  const encryptedToken = cryptoJS.AES.encrypt(
    token,
    process.env.ENCRYPTION_KEY
  ).toString();

  return encryptedToken;
};

module.exports = createToken;
