const jwt = require("jsonwebtoken");

const reqAuthorization = (req, res, next) => {
  const { authorization } = req.headers;
  try {
    if (authorization) {
      const token = authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.SECRET);
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
