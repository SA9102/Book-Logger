const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("../models/user");

const initialize = (passport) => {
  const authenticateUser = async (email, password, done) => {
    try {
      const user = await User.findOne({ email: email });
      if (!user)
        return done(null, false, {
          message: "Incorrect username or password.",
        });
      if (!(await bcrypt.compare(password, user.password)))
        return done(null, false, {
          message: "Incorrect username or password.",
        });
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  };
  passport.use(new LocalStrategy({ usernameField: "email" }, authenticateUser));

  passport.serializeUser((user, done) => done(null, user._id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  });
};

module.exports = initialize;
