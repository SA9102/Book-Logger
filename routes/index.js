// NPM Packages
const express = require("express");
const passport = require("passport");

// Models
const User = require("../models/user");
const Book = require("../models/book");

// Custom middleware
const checkAuthenticated = require("../middleware/auth").checkAuthenticated;
const checkNotAuthenticated =
  require("../middleware/auth").checkNotAuthenticated;

const router = express.Router();

router.get("/", checkAuthenticated, async (req, res) => {
  const bookIds = req.user.books;
  // Get all the ids of the user's books
  const books = [];
  // Each item in this list will be a string of categories for a particular book,
  // where each category in the string is separated by a single whitespace.
  // Each string is for a different book.

  // The reason for formatting the categories this way is so that when the categories
  // of a book are displayed, it is displayed within a single <p> tag. This is to allow
  // word wrapping if there are multiple categories for a book.
  const categories = [];
  for (let i = 0; i < bookIds.length; i++) {
    try {
      // Get the id of the book
      const book = await Book.findById(bookIds[i]);
      books.push(book);
      let categoriesString = "";
      book.category.forEach((cat) => {
        categoriesString += `${cat} `;
      });
      categories.push(categoriesString);
    } catch (err) {
      console.error(err);
    }
  }
  res.render("index", {
    title: "Home",
    books,
    name: req.user.name,
    categories,
  });
});

// Page for registering an account
router.get("/register", checkNotAuthenticated, (req, res) => {
  res.render("register", { title: "Register", errorMsg: null });
});

// Registering an account
router.post("/register", async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    // If an account with that email address already exists
    if (existingUser) {
      return res.render("register", {
        title: "Register",
        errorMsg: "An account with that email already exists.",
      });
    }
    // If the password does not match the given criteria.
    // Credit for regex: Srinivas from StackOverflow
    // (https://stackoverflow.com/questions/19605150/regex-for-password-must-contain-at-least-eight-characters-at-least-one-number-a)
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/g;
    if (!regex.test(req.body.password)) {
      return res.render("register", {
        title: "Register",
        errorMsg: "Password must fulfill all criteria.",
      });
    }
    // If the entered password and confirm password do not match
    if (req.body.password !== req.body.conpass) {
      return res.render("register", {
        title: "Register",
        errorMsg: "Passwords do not match.",
      });
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await User.create({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      books: [],
    });
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.redirect("/register");
  }
});

// Page for logging in
router.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login", { title: "Login" });
});

// Logging in
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

router.post("/logout", (req, res, next) => {
  req.logOut((err) => {
    if (err) return next(err);
    res.redirect("/login");
  });
});

module.exports = router;
