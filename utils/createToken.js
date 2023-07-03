const jwt = require("jsonwebtoken");

const createToken = (userId) => {
  const token = jwt.sign({ id: userId }, process.env.SECRET, {
    expiresIn: "3d",
  });

  return token;
};

module.exports = createToken;
