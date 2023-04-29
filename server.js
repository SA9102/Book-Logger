require("dotenv").config();

// Packages
const methodOverride = require("method-override");
const passport = require("passport");
const session = require("express-session");
const express = require("express");
const mongoose = require("mongoose");
const flash = require("express-flash");

// // Passport Config
const initialize = require("./config/passport-config");
initialize(passport);

// Routes
const indexRoutes = require("./routes/index");
const bookRoutes = require("./routes/book");
const accountRoutes = require("./routes/account");

// Initialize Express app
const app = express();

const dbUri = process.env.DB_CONN;

mongoose
  .connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) =>
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Database connected; listening on port ${process.env.PORT}`);
    })
  )
  .catch((err) => console.error(err));

// Register view engine
app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(flash());
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use("/", indexRoutes);
app.use("/books", bookRoutes);
app.use("/account", accountRoutes);

app.use((req, res) => {
  res.status(404).render("404", { title: "404 Not Found" });
});
