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

import { updateLoginTally, retrieveUser, retrieveVideos } from "./mongo.mjs";
import { checkPasswordFormat } from "./auth.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 4200;

// Set up middleware
app.use(express.static(path.join(__dirname, "/public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(ExpressMongoSanitize());

// Endpoint for serving the login page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/login.html"));
});

// Endpoint responsible for validating user login attempts
app.post("/auth", (req, res) => {
  res.setHeader("Content-Type", "application/json");

  if (!checkPasswordFormat(req.body.password_input)) {
    console.log("Password failed to meet complextiy requirnments");
    res.redirect("/loginAlert.html");
    return;
  }

  retrieveUser(req.body.username_input).then((result) => {
    // Check that there is an account associated with username
    if (result == null) {
      console.log("User " + req.body.username_input + " does not exist");
      res.redirect("/loginAlert.html");
      return;
    }

    // Hash the user password for comparison to stored password
    var user_pass = sha256.create();
    user_pass.update(req.body.password_input);
    user_pass.hex();

    // Route the client based on authentication success or failure
    if (result.password == user_pass) {
      console.log("Good :]");
      res.redirect("/gallery.html");
      updateLoginTally(req.body.username_input, -1);
    } else {
      console.log("Invalid Password");
      res.redirect("/loginAlert.html");
      updateLoginTally(req.body.username_input, result.login_tally);
    }
  });
});

// Sends a json payload with all video urls encoded
app.get("/videos", (req, res) => {
  console.log("Request for videos recieved!");
  retrieveVideos().then((videos) => {
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        videos: videos,
      }),
    );
  });
});

app.get("/videoViewer", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/videoViewer.html"));
});

app.listen(port, () => {
  console.log("Server running on port 4200");
});
