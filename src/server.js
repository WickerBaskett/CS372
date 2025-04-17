// server.js
// Nodejs server that serves a login page
// to the client and handles authentication
// of user passwords submitted from client pages

import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import ExpressMongoSanitize from "express-mongo-sanitize";
import cookieParser from "cookie-parser";
import session from "express-session";
import { configDotenv } from "dotenv";

import {
  authUser,
  authContentEditor,
  authMarketingManager,
} from "./middleware.mjs";
import {
  getVideos,
  loginUser,
  modifyComment,
  modifyVideo,
  registerUser,
  removeVideo,
  setOpinion,
  uploadVideo,
  whoami,
} from "./api.mjs";

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

///////////////////////////////
//     Routing Endpoints     //
///////////////////////////////

// Endpoint for serving the login page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/login.html"));
});

// Redirects from gallery back to gallery with a query parameter
// to filter the displayed videos with
app.get("/search", authUser, (req, res) => {
  res.sendFile("/protected/gallery.html");
});

// Serves the video viewer page with authentication middleware
app.get("/videoViewer", authUser, (req, res) => {
  res.sendFile(path.join(__dirname, "/protected/videoViewer.html"));
});

// Serves the gallery page with authenitcation middleware
app.get("/gallery", authUser, (req, res) => {
  res.sendFile(path.join(__dirname, "/protected/gallery.html"));
});

// Serves the video upload page with autentication middleware
app.get("/uploadVideo", authUser, authContentEditor, (req, res) => {
  res.sendFile(path.join(__dirname, "/protected/uploadVideo.html"));
});

///////////////////////////
//     API Endpoints     //
///////////////////////////

// Endpoint responsible for validating user login attempts
app.post("/api/auth", loginUser);

// Endpoint responsible for the creation of new user accounts via login page
app.post("/api/register", registerUser);

// Endpoint responsible for the upload of new videos via video upload page
app.post("/api/upload", authUser, authContentEditor, uploadVideo);

// Endpoint responsible for the upload of new videos via video upload page
app.post("/api/remove", authUser, authContentEditor, removeVideo);

// Endpoint responsible for editing fields of existing videos
app.post("/api/edit", authUser, authContentEditor, modifyVideo);

// Endpoint responsible for comment upload from Marketing Managers
app.post("/api/upload_comment", authUser, authMarketingManager, modifyComment);

// Sends a json payload with all video urls encoded
app.get("/api/videos", authUser, getVideos);

// Handles a user liking a video
app.get("/api/opinion", authUser, setOpinion);

// Sends the user their username and role
app.get("/api/whoami", authUser, whoami);

app.listen(port, () => {
  console.log("Server running on port 4200");
});
