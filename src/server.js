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
  createVideo,
  deleteVideo,
  updateUserOpinion,
  updateDisfavorites,
  updateFavorites,
  uploadComment,
} from "./mongo.mjs";
import {
  checkPasswordFormat,
  checkUsername,
  checkURL,
  checkThumbnail,
} from "./validity.mjs";

///////////////////
//     Setup     //
///////////////////

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 4200;

// Load secrets from .env
configDotenv();
const session_key = process.env.SESSION_KEY;

///////////////////////
//     Middleware    //
///////////////////////

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

// Custom Middleware to validate user session
function authMiddleware(req, res, next) {
  if (req.session.isLoggedIn == true) {
    next();
  } else {
    res.redirect("/login.html?alert=2");
  }
}

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
  res.sendFile("/protected/gallery.html");
});

// Serves the video viewer page with authentication middleware
app.get("/videoViewer", authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "/protected/videoViewer.html"));
});

// Serves the gallery page with authenitcation middleware
app.get("/gallery", authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "/protected/gallery.html"));
});

// Serves the video upload page with autentication middleware
app.get("/uploadVideo", authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "/protected/uploadVideo.html"));
});

///////////////////////////
//     API Endpoints     //
///////////////////////////

// Endpoint responsible for validating user login attempts
app.post("/api/auth", (req, res) => {
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
app.post("/api/register", (req, res) => {
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

// Endpoint responsible for the upload of new videos via video upload page
app.post("/api/upload", authMiddleware, (req, res) => {
  console.log(req.body);
  res.setHeader("Content-Type", "application/json");
  const video_alert_url = "/uploadVideo";

  if (req.body.new_name_input == "") {
    console.log("video name failed to meet requirements");
    res.redirect(video_alert_url);
    return;
  }

  // Determine if the video url is valid
  if (!checkURL(req.body.new_URL_input)) {
    console.log("video url has failed to meet requirements");
    res.redirect(video_alert_url);
    return;
  }

  // Determine if the image url is valid
  //if (!checkThumbnail(req.body.new_thumbnail_input)) {
  //  console.log("thumbnail url has failed to meet requirements");
  //  res.redirect(video_alert_url);
  //  return;
  //}

  // Insert video into database
  createVideo(
    req.body.new_name_input,
    req.body.new_URL_input,
    req.body.new_thumbnail_input,
  );

  res.redirect("/uploadVideo");
});

// Endpoint responsible for the upload of new videos via video upload page
app.post("/api/remove", authMiddleware, (req, res) => {
  res.setHeader("Content-Type", "application/json");

  deleteVideo(req.body.video_name_input);
  res.redirect("/uploadVideo");
});

app.post("/api/upload_comment", authMiddleware, (req, res) => {
  let comment = req.body.comment;
  let url = req.body.url;
  uploadComment(url, comment);
  res.redirect("/videoViewer?url=" + url);
});

// Sends a json payload with all video urls encoded
app.get("/api/videos", authMiddleware, (req, res) => {
  if (req.query.fav == "true") {
    // Send the gallery a list of the users favorite movies
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
        return acc + split[0];
      }, "");

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
app.get("/api/opinion", authMiddleware, (req, res) => {
  const opinion = req.query.opinion;
  const vid = req.query.vid;
  const user = req.session.username;

  retrieveUser(user).then((result) => {
    if (result == undefined) {
      console.log("User does not exist");
      res.sendStatus(500);
      return;
    }
    let favorites = result.favorites;
    let disfavorites = result.disfavorites;

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

app.get("/api/whoami", authMiddleware, (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.end(
    JSON.stringify({
      username: req.session.username,
      role: req.session.role,
    }),
  );
});

app.listen(port, () => {
  console.log("Server running on port 4200");
});
