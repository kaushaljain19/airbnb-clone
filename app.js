if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate"); // Importing ejs-mate
const ExpressError = require("./utils/ExpressError.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const multer = require("multer");
const upload = multer({ dest: "uploads/" }); // If this folder does not exist, multer will create it.
const Listing = require("./models/listing.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate); // Defining engine ejsMate for ejs
app.use(express.static(path.join(__dirname, "/public")));

const dbUrl = process.env.ATLASDB_URL;

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // (time in milliseconds)
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
  },
};

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

// CONNECTING TO MONGODB ATLAS
async function main() {
  await mongoose.connect(dbUrl);
}

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize()); // A middleware that initializes passport
app.use(passport.session()); // Used this to give our web application the ability to identify users from page to page. This enables each request to know that it is part of which session.
passport.use(new LocalStrategy(User.authenticate())); // This line authenticates all the users through the in-built static authentication method model in LocalStrategy.

passport.serializeUser(User.serializeUser()); // After a user has logged-in, this method is used to store his info in the session
passport.deserializeUser(User.deserializeUser()); // This method is used to remove the stored info from the session, after the user ends the session.

app.use((req, res, next) => {
  res.locals.success = req.flash("success") || [];
  res.locals.error = req.flash("error") || [];
  res.locals.currUser = req.user || null;
  next();
});

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/search", async (req, res) => {
  const query = req.query.query;
  let results;
  try {
    if (query) {
      results = await Listing.find({
        title: { $regex: query, $options: "i" }, // i for case-insensitive
      });
    } else {
      results = await Listing.find();
    }
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found!"));
});

// Error handler
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("listings/error.ejs", { message });
  // res.status(statusCode).send(message);
});

app.listen(8080, () => {
  console.log("server is listening to port 8080");
});
