/**
 * Handles retrieval and insertion of data
 * into the mongodb database associated with
 * the service
 * @module mongo
*/

import { configDotenv } from "dotenv";
import { MongoClient } from "mongodb";

// Load config from .env
configDotenv();
const db_name = process.env.DB_NAME;
const db_uri = process.env.DB_URI;

/**
 * Retrieve the first document with a name field that matches
 * username and returns it
 * @async
 * @function retrieveUser
 * @param {String} username - Username to search the database for
 * @returns {WithId<Document>}
 * */
async function retrieveUser(username) {
  let client = new MongoClient(db_uri);
  try {
    // define a database and collection on which to run the method
    const database = client.db(db_name);
    const coll = database.collection("users");

    const distinctValues = await coll.findOne({ username: username });

    return distinctValues;
  } finally {
    await client.close();
  }
}

/**
 * Add a new user to the users collection
 * User name and password are set according to parameters
 * All other user values are 0 by default
 * @async
 * @function createUser
 * @param {String} pass - New password for user, should already be hashed
 * @param {String} username - New username for user
 */
async function createUser(username, pass) {
  let client = new MongoClient(db_uri);
  try {
    // define a database and collection on which to run the method
    const database = client.db(db_name);
    const coll = database.collection("users");

    await coll.insertOne({
      username: username,
      password: pass,
      login_tally: 0,
      role: 0,
      favorites: [],
      disfavorites: [],
    });
  } finally {
    await client.close();
  }
}

/**
 * Add a new video to the videos collection
 * Likes/dislikes are set to 0
 * Comment is left empty
 * @async
 * @function createVideo
 * @param {String} videoName - Name of video
 * @param {String} videoURL - Url of video
 * @param {String} thumbURL - Url of thumbnail
 */
async function createVideo(videoName, videoURL, thumbURL) {
  let client = new MongoClient(db_uri);
  try {
    // define a database and collection on which to run the method
    const database = client.db(db_name);
    const coll = database.collection("videos");

    await coll.insertOne({
      name: videoName,
      url: videoURL,
      likes: 0,
      dislikes: 0,
      comment: "",
      thumbnail: thumbURL,
    });
  } finally {
    await client.close();
  }
}

/**
 * Remove a video from the videos collection
 * @async
 * @function deleteVideo
 * @param {String} removeVideoName - Name of video to be removed
 */
async function deleteVideo(removeVideoName) {
  let client = new MongoClient(db_uri);
  try {
    // define a database and collection on which to run the method
    const database = client.db(db_name);
    const coll = database.collection("videos");

    await coll.deleteOne({
      name: removeVideoName,
    });
  } finally {
    await client.close();
  }
}

/**
 * Updates fields specified in query for video specified by name
 * in the videos collection
 * @async
 * @function editVideo
 * @param {JSON} filter - The filter used in the mongodb updateOne call
 * @param {JSON} query  - The query used in the mongodb updateOne call
 */
async function editVideo(filter, query) {
  let client = new MongoClient(db_uri);
  try {
    // define a database and collection on which to run the method
    const database = client.db(db_name);
    const coll = database.collection("videos");

    await coll.updateOne(filter, query);
  } finally {
    await client.close();
  }
}

/**
 * Sets the login_tally field of the document with name matching
 * username to count + 1. If count is 2 then it will delete the
 * associated account
 * @async
 * @function updateLoginTally
 * @param {String} username - Username of account
 * @param {Number} count - Current login tally count
 * @returns {Promise<void>}
 * */
async function updateLoginTally(username, count) {
  let client = new MongoClient(db_uri);
  try {
    const database = client.db(db_name);
    const coll = database.collection("users");

    if (count == 2) {
      console.log("To many failed login attempts, deleting user: " + username);
      await coll.deleteOne({ name: username });
    } else {
      await coll.updateOne(
        { name: username },
        {
          $set: { login_tally: count + 1 },
        },
      );
    }
  } finally {
    await client.close();
  }
}

/**
 * Retrieve the all videos stored in the database
 * @async
 * @function retrieveVideos
 * @param {String} field - Field in database to search
 * @param {String} query - Regex matched with case insensitivity against contents of ${field} in videos
 * @returns {void}
 * */
async function retrieveVideos(field, query) {
  let client = new MongoClient(db_uri);
  try {
    // define a database and collection on which to run the method
    const database = client.db(db_name);
    const coll = database.collection("videos");

    const distinctValues = await coll
      .find({ [field]: { $regex: query, $options: "i" } })
      .toArray();
    return distinctValues;
  } finally {
    await client.close();
  }
}

/**
 * Retrieve likes/dislikes
 * Increment/decrement likes based on inc_query
 * @async
 * @function updateUserOpinion
 * @param {String} vid - Url of video
 * @param {{key: value}} inc_query - {(likes|dislikes): amount to increment}
 * @returns {void}
 */
async function updateUserOpinion(vid, inc_query) {
  let client = new MongoClient(db_uri);
  try {
    // define a database and collection on which to run the method
    const database = client.db(db_name);
    const coll = database.collection("videos");

    const filter = { url: vid };
    const update = { $inc: inc_query };

    await coll.updateOne(filter, update);
  } finally {
    await client.close();
  }
}

/**
 * Add liked videos to user's favorites list
 * @async
 * @function updateFavorites
 * @param {String} user - Username to update
 * @param {String} vid - Url of video
 * @param {Boolean} adding - True = Add, False = Remove
 * @return {void}
 */
async function updateFavorites(vid, user, adding) {
  let client = new MongoClient(db_uri);
  try {
    const database = client.db(db_name);
    const coll = database.collection("users");

    const filter = { username: user };
    let update = {};
    if (adding) {
      update = { $push: { favorites: vid } };
    } else {
      update = { $pull: { favorites: vid } };
    }

    await coll.updateOne(filter, update);
  } finally {
    await client.close();
  }
}

/**
 * Add liked videos to user's favorites list
 * @async
 * @function updateDisfavorites
 * @param {String} user - Username to update
 * @param {String} vid - Url of video
 * @param {Boolean} adding - True = Add, False = Remove
 * @return {void}
 */
async function updateDisfavorites(vid, user, adding) {
  let client = new MongoClient(db_uri);
  try {
    const database = client.db(db_name);
    const coll = database.collection("users");

    const filter = { username: user };
    let update = {};
    if (adding) {
      update = { $push: { disfavorites: vid } };
    } else {
      update = { $pull: { disfavorites: vid } };
    }

    await coll.updateOne(filter, update);
  } finally {
    await client.close();
  }
}

/**
 * Overwrite the comment on a video with a new comment
 * @async
 * @function uploadComment
 * @param {String} vid - The Url of the video to add the comment to
 * @param {String} comment - The comment to be uploaded 
 */
async function uploadComment(vid, comment) {
  let client = new MongoClient(db_uri);
  try {
    const database = client.db(db_name);
    const coll = database.collection("videos");

    const filter = { url: vid };
    let update = { $set: { comment: comment } };

    await coll.updateOne(filter, update);
  } finally {
    await client.close();
  }
}

export {retrieveUser, createUser, createVideo, deleteVideo, editVideo, updateLoginTally, retrieveVideos, updateUserOpinion, updateFavorites, updateDisfavorites, uploadComment};
