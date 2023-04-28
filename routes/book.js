// NPM Packages
const express = require("express");

// Models
const User = require("../models/user");
const Book = require("../models/book");

// Custom middleware
const { checkAuthenticated } = require("../middleware/auth");

const router = express.Router();

// Page for adding a book
router.get("/new", (req, res) => {
  res.render("books/new", { title: "Add book", errorMsg: null });
});

// Adding a book
router.post("/new", checkAuthenticated, async (req, res) => {
  console.log(req.body.book);
  try {
    await Book.create({
      title: req.body.title,
      author: req.body.author,
      category: req.body.category.trim().replace(/ +/g, " ").split(" "),
      status: req.body.status,
      user: req.user._id,
    });
    const book = await Book.find().sort({ _id: -1 }).limit(1);
    const user = await User.findById(req.user._id);
    user.books.push(book[0]._id);
    user.save();
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.render("books/new", {
      title: "Add book",
      errorMsg: "Please enter a book title.",
    });
  }
});

// Page for editing a book entry
router.get("/:id", checkAuthenticated, async (req, res) => {
  try {
    // First we need to check if the user is authorized to edit
    // the book (if it is a book that they have created).
    const book = await Book.findById(req.params.id);
    if (book.user.toString() !== req.user._id.toString()) {
      // If they are not authorized to edit the book.
      return res.redirect("/");
    }
    res.render("books/edit", { title: "Edit Book", book });
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});

// Editing a book entry
router.put("/:id", checkAuthenticated, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    book.title = req.body.title;
    book.author = req.body.author;
    book.category = req.body.category.trim().replace(/ +/g, " ").split(" ");
    book.status = req.body.status;
    book.save();
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});

// Deleting a book entry
router.delete("/:id", checkAuthenticated, async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    const newBooks = req.user.books.filter(
      (id) => id.toString() !== req.params.id
    );
    const user = await User.findById(req.params.id);
    user.books = newBooks;
    user
      .save()
      .then(() => res.redirect("/"))
      .catch((err) => {
        console.error(err);
        res.redirect("/");
      });
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});

module.exports = router;
