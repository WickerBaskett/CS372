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
  updateDisfavorites,
  updateFavorites,
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

  if (!checkUsername(req.body.new_username_input)) {
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
  if (req.query.fav == "true") {
    // Send the gallery a list of the users favorite movies
    console.log("Favorites are being searched");
    retrieveUser(req.query.user).then((result) => {
      // Check that there is an account associated with username
      if (result == null) {
        console.log("User " + req.body.username_input + " does not exist");
        res.status(500);
        return;
      }

      if (result.favorites.length == 0) {
        console.log("Favs Empty!");
        res.status(200);
        return;
      }

      let query = Object.entries(result.favorites).reduce((acc, item) => {
        if (item[0] != 0 && item[1] != "") {
          acc += "|";
        }

        let temp = item[1].split("/").at(-1);
        let split = temp.split("?");
        console.log(split[0]);
        return acc + split[0];
      }, "");
      console.log(query);

      retrieveVideos("url", query).then((videos) => {
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            videos: videos,
          }),
        );
      });
    });
  } else {
    // Send a gallery a list of movies based off of query
    retrieveVideos("name", req.query.q).then((videos) => {
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          videos: videos,
        }),
      );
    });
  }
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
  console.log("In /opinion");
  const opinion = req.query.opinion;
  const vid = req.query.vid;
  const user = req.query.user;
  retrieveUser(user).then((result) => {
    let favorites = result.favorites;
    let disfavorites = result.disfavorites;

    console.log("Favorites: " + favorites[0]);
    console.log(favorites.includes(vid));

    if (opinion == 1 && !favorites.includes(vid)) {
      // User liked the video
      updateUserOpinion(vid, { likes: 1 });
      updateFavorites(vid, user, true);
      if (disfavorites.includes(vid)) {
        updateUserOpinion(vid, { dislikes: -1 });
        updateDisfavorites(vid, user, false);
      }
    } else if (opinion == 0 && !disfavorites.includes(vid)) {
      // User disliked the video
      updateUserOpinion(vid, { dislikes: 1 });
      updateDisfavorites(vid, user, true);
      if (favorites.includes(vid)) {
        updateUserOpinion(vid, { likes: -1 });
        updateFavorites(vid, user, false);
      }
    }
  });
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log("Server running on port 4200");
});
