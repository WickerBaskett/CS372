/**
 * Contains code for all api endpoints
 * @module api
 */
import { sha256 } from "js-sha256";

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
  editVideo,
} from "./mongo.mjs";
import {
  checkPasswordFormat,
  checkUsername,
  checkURL,
  sanitizeVideos,
} from "./validity.mjs";

//////////////////////////////
//    All User Endpoints    //
//////////////////////////////

/**
 * Handles authentication of username password combos
 * and creates user sessions
 * @function loginUser
 * @param {object} req - Request
 * @param {object} res - Response
 */
function loginUser(req, res) {
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
}

/**
 * Register a new user
 * @function registerUser
 * @param {object} req - Request
 * @param {object} res - Response
 */
function registerUser(req, res) {
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
}

/**
 * Sends a list of videos back to the requester.
 * Fields associated with each video are sanitized
 * based on requester role
 * @function getVideos
 * @param {object} req - Request
 * @param {object} res - Response
 */
function getVideos(req, res) {
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
        let sanitizedVideos = sanitizeVideos(req.session.role, videos);
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            videos: sanitizedVideos,
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
      let sanitizedVideos = sanitizeVideos(req.session.role, videos);
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          videos: sanitizedVideos,
        }),
      );
    });
  }
}

/**
 * Sets user opinion on a video
 * @function setOpinion
 * @param {object} req - Request
 * @param {object} res - Response
 */
function setOpinion(req, res) {
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
}

/**
 * Tells the requester their username and role
 * @function whoami
 * @param {object} req - Request
 * @param {object} res - Response
 */
function whoami(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.end(
    JSON.stringify({
      username: req.session.username,
      role: req.session.role,
    }),
  );
}

//////////////////////////////////////
//     Content Editor Endpoints     //
//////////////////////////////////////

/**
 * Upload a new video to the database
 * @function uploadVideo
 * @param {object} req - Request
 * @param {object} res - Response
 */
function uploadVideo(req, res) {
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

  // Insert video into database
  createVideo(
    req.body.new_name_input,
    req.body.new_URL_input,
    req.body.new_thumbail_input,
  );

  res.redirect("/uploadVideo");
}

/**
 * Remove a video from the database
 * @function removeVideo
 * @param {object} req - Request
 * @param {object} res - Response
 */
function removeVideo(req, res) {
  res.setHeader("Content-Type", "application/json");

  deleteVideo(req.body.video_name_input);
  res.redirect("/uploadVideo");
}

/**
 * Edit fields of an existing video in the database
 * @function modifyVideo
 * @param {object} req - Request
 * @param {object} res - Response
 */
function modifyVideo(req, res) {
  if (req.body.curr_name == "") {
    res.statusMessage = "Current Name field was empty";
    res.redirect("/uploadVideo");
    return;
  }

  let query = {};
  if (req.body.new_url != "") {
    query.url = req.body.new_url;
  }
  if (req.body.new_name != "") {
    query.name = req.body.new_name;
  }
  if (req.body.new_thumbnail != "") {
    query.thumbnail = req.body.new_thumbnail;
  }

  editVideo({ name: req.body.curr_name }, { $set: query });
  res.redirect("/uploadVideo");
}

/////////////////////////////////////////
//     Marketing Manager Endpoints     //
/////////////////////////////////////////

/**
 * Modifys the comment field of a video in the database
 * @function modifyComment
 * @param {object} req - Request
 * @param {object} res - Response
 */
function modifyComment(req, res) {
  let comment = req.body.comment;
  let url = req.body.url;
  uploadComment(url, comment);
  res.redirect("/videoViewer?url=" + url);
}

export {
  loginUser,
  registerUser,
  getVideos,
  setOpinion,
  whoami,
  uploadVideo,
  removeVideo,
  modifyVideo,
  modifyComment,
};
