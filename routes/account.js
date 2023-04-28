// NPM Packages
const express = require("express");
const bcrypt = require("bcrypt");

// Models
const User = require("../models/user");
const Book = require("../models/book");

// Custom middleware
const checkAuthenticated = require("../middleware/auth").checkAuthenticated;

const router = express.Router();

// Account page
router.get("/", checkAuthenticated, async (req, res) => {
  let books = [];
  for (let i = 0; i < req.user.books.length; i++) {
    try {
      const book = await Book.findById(req.user.books[i]);
      books.push(book);
    } catch (err) {
      console.error(err);
    }
  }
  res.render("account/account", { title: "My Account", user: req.user, books });
});

// Page for editing account
router.get("/edit", checkAuthenticated, (req, res) => {
  res.render("account/edit", {
    title: "Edit Account",
    user: req.user,
    errorMsg: null,
  });
});

// Editing account
router.put("/edit/:id", checkAuthenticated, async (req, res) => {
  try {
    // If the name and/or email fields are empty
    if (req.body.name.trim() === "" || req.body.email.trim() === "") {
      return res.render("account/edit", {
        title: "Register",
        user: req.user,
        errorMsg: "Please enter a name and email address.",
      });
    }
    const existingUser = await User.findOne({ email: req.body.email });
    // The user may not change their email address, so we need to ensure that the
    // user id found by the given email address is the same as that of the logged-
    // in user
    if (
      existingUser &&
      existingUser._id.toString() !== req.user._id.toString()
    ) {
      return res.render("account/edit", {
        title: "Register",
        user: req.user,
        errorMsg: "An account with that email already exists.",
      });
    }
    const user = await User.findById(req.params.id);
    user.name = req.body.name;
    user.email = req.body.email;
    user.save();
    res.redirect("/account");
  } catch (err) {
    console.error(err);
    res.redirect("/account/edit");
  }
});

// Changing password
router.put("/edit/:id/changepassword", checkAuthenticated, async (req, res) => {
  try {
    // If the user has incorrectly entered their old password
    if (!(await bcrypt.compare(req.body.oldpassword, req.user.password))) {
      return res.render("account/edit", {
        title: "Edit Account",
        user: req.user,
        errorMsg: "Incorrect password.",
      });
    }
    // If the password does not match the given criteria.
    // Credit for regex: Srinivas from StackOverflow
    // (https://stackoverflow.com/questions/19605150/regex-for-password-must-contain-at-least-eight-characters-at-least-one-number-a)
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/g;
    if (!regex.test(req.body.newpassword)) {
      return res.render("account/edit", {
        title: "Edit Account",
        user: req.user,
        errorMsg: "Password must fulfill all criteria.",
      });
    }
    // If the new password and confirm new password do not match
    if (req.body.newpassword !== req.body.conpassword) {
      return res.render("account/edit", {
        title: "Edit Account",
        user: req.user,
        errorMsg: "Passwords do not match",
      });
    }
    const hashedPassword = await bcrypt.hash(req.body.newpassword, 10);
    const user = await User.findById(req.params.id);
    user.password = hashedPassword;
    user.save();
    res.redirect("/account");
  } catch (err) {
    console.error(err);
    res.redirect("/account/edit");
  }
});

// Deleting account
router.delete("/:id", async (req, res) => {
  // First we delete the books the user has created
  for (let i = 0; i < req.user.books.length; i++) {
    try {
      await Book.findByIdAndDelete(req.user.books[i]);
    } catch (err) {
      console.error(err);
    }
  }
  // Then we delete the actual user
  try {
    await User.findByIdAndDelete(req.user._id);
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});

module.exports = router;
