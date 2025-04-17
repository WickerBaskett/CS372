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
import session from "express-session";
import { configDotenv } from "dotenv";

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

// Load secrets from .env
configDotenv();
const session_key = process.env.SESSION_KEY;

// Custom Middleware to validate user session
function authMiddleware(req, res, next) {
  console.log("In authMiddleware: ");
  console.log(req.session);

  if (req.session.isLoggedIn == true) {
    next();
  } else {
    res.redirect("/login.html?alert=2");
  }
}

// Set up middleware
app.use(
  session({
    secret: session_key,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 86400000, // session timeout of 24 hours
    },
  }),
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(ExpressMongoSanitize());
app.use(express.static(path.join(__dirname, "/public")));
app.use(cookieParser());

///////////////////////////////
//     Routing Endpoints     //
///////////////////////////////

// Endpoint for serving the login page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/login.html"));
});

// Redirects from gallery back to gallery with a query parameter
// to filter the displayed videos with
app.get("/search", authMiddleware, (req, res) => {
  res.
  res.sendFile("/protected/gallery?q=" + req.query.search);
});

// Serves the video viewer page
app.get("/videoViewer", authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "/protected/videoViewer.html"));
});

app.get("/gallery", authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "/protected/gallery.html"));
})

///////////////////////////
//     API Endpoints     //
///////////////////////////

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

      // Set session parameters
      req.session.isLoggedIn = true;
      req.session.username = req.body.username_input;
      req.session.role = result.role;

      console.log("In /auth");
      console.log(req.session);

      updateLoginTally(req.session.username, -1);
      res.redirect("/gallery?q=");
    } else {
      console.log("Invalid Password");
      res.redirect(alert_url);
      updateLoginTally(req.body.username_input, result.login_tally);
    }
  });
});

// Endpoint responsible for the creation of new user accounts via login page
app.post("/register", (req, res) => {
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
    retrieveUser(req.session.username).then((result) => {
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
    let field = req.query.field;
    if (field == null) {
      field = "name";
    }
    retrieveVideos(field, req.query.q).then((videos) => {

      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          videos: videos,
        }),
      );
    });
  }
});

// Handles a user liking a video
app.get("/opinion", (req, res) => {
  console.log("In /opinion");
  console.log(req.session);
  const opinion = req.query.opinion;
  const vid = req.query.vid;
  const user = req.session.username;
  console.log(user);
  retrieveUser(user).then((result) => {
    if (result == undefined) {
      console.log("User does not exist in /opinion");
      res.sendStatus(500);
      return;
    }
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
