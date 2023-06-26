const handleSignUpErrors = (error) => {
  let err = {};
  if (error.name === "ValidationError") {
    if (error.errors.email) {
      err["email"] = error.errors.email.message;
    }

    if (error.errors.name) {
      err["name"] = error.errors.name.message;
    }

    if (error.errors.password) {
      err["password"] = error.errors.password.message;
    }
    return err;
  }

  if (error.code === 11000) {
    if (error.keyValue.email)
      err["email"] = "Account with this email already exist";
    return err;
  }
  return error;
};

module.exports = handleSignUpErrors;
