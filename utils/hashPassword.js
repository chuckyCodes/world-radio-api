const bcrypt = require("bcrypt");
const saltRounds = 10;

const hashPassword = async (password) => {
  const hash = await bcrypt.hash(password, saltRounds);
  return hash;
};

module.exports = hashPassword;
