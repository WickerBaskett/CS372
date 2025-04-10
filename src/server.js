// server.js
// Nodejs server that serves a login page
// to the client and handles authentication
// of user passwords submitted from client pages

import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { sha256 } from "js-sha256";
import { fileURLToPath } from "url";
import { dirname } from "path";
import ExpressMongoSanitize from "express-mongo-sanitize";
import cookieParser from "cookie-parser";

import {
  updateLoginTally,
  retrieveUser,
  retrieveVideos,
  createUser,
  updateUserOpinion,
  addToFavorites,
} from "./mongo.mjs";
import { checkPasswordFormat, checkUsername } from "./validity.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 4200;

// Set up middleware
app.use(express.static(path.join(__dirname, "/public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(ExpressMongoSanitize());
app.use(cookieParser());

// Endpoint for serving the login page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/login.html"));
});

// Endpoint responsible for validating user login attempts
app.post("/auth", (req, res) => {
  const alert_url = "/login.html?alert=1";
  res.setHeader("Content-Type", "application/json");

  if (!checkPasswordFormat(req.body.password_input)) {
    console.log("Password failed to meet complexity requirments");
    res.redirect(alert_url);
    return;
  }

  retrieveUser(req.body.username_input).then((result) => {
    // Check that there is an account associated with username
    if (result == null) {
      console.log("User " + req.body.username_input + " does not exist");
      res.redirect(alert_url);
      return;
    }

    // Hash the user password for comparison to stored password
    var user_pass = sha256.create();
    user_pass.update(req.body.password_input);
    user_pass.hex();

    // Route the client based on authentication success or failure
    if (result.password == user_pass) {
      console.log("Good :]");
      res.cookie("user", req.body.username_input);
      res.redirect("/gallery.html?q=");
      updateLoginTally(req.body.username_input, -1);
    } else {
      console.log("Invalid Password");
      res.redirect(alert_url);
      updateLoginTally(req.body.username_input, result.login_tally);
    }
  });
});

// Endpoint responsible for the creation of new user accounts via login page
app.post("/new_acc", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const alert_url = "/login.html?alert=1";

  if (!checkPasswordFormat(req.body.new_password_input)) {
    console.log("Password failed to meet complexity requirements");
    res.redirect(alert_url);
    return;
  }

  if (checkUsername(req.body.new_user)) {
    console.log("Username failed to meet requirements");
    res.redirect(alert_url);
    return;
  }

  // Hash the user password for security
  var user_pass = sha256.create();
  user_pass.update(req.body.new_password_input);

  //Insert username and password into database
  createUser(req.body.new_username_input, user_pass.hex());

  res.redirect("/login.html");
});

// Sends a json payload with all video urls encoded
app.get("/videos", (req, res) => {
  console.log("Request for videos recieved!");
  retrieveVideos(req.query.q).then((videos) => {
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        videos: videos,
      }),
    );
  });
});

// Redirects from gallery back to gallery with a query parameter
// to filter the displayed videos with
app.get("/search", (req, res) => {
  console.log("Search Query: " + req.query.search);
  res.redirect("/gallery.html?q=" + req.query.search);
});

// Serves the video viewer page
app.get("/videoViewer", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/videoViewer.html"));
});

// Handles a user liking a video
app.get("/opinion", (req, res) => {
  let opinion = req.query.opinion;
  
  if (opinion == 1) { // User liked the video
    updateUserOpinion(req.query.vid, {likes: 1});
    addToFavorites(req.query.vid, req.query.user);
  } else { // User disliked the video
    updateUserOpinion(req.query.vid, {dislikes: 1});
  }
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log("Server running on port 4200");
});
