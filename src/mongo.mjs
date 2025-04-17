// mongo.mjs
// Handles retrieval and insertion of data
// into the mongodb database associated with
// the service

import { MongoClient } from "mongodb";

const uri = "mongodb://localhost:27017";

/**
 * Retrieve the first document with a name field that matches
 * username and returns it
 * @param {String} username
 * @returns {WithId<Document>}
 * */
export async function retrieveUser(username) {
  let client = new MongoClient(uri);
  try {
    // define a database and collection on which to run the method
    const database = client.db("importantDatabase");
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
 * @param {String} pass
 * @param {String} username
 */
export async function createUser(username, pass) {
  let client = new MongoClient(uri);
  try {
    // define a database and collection on which to run the method
    const database = client.db("importantDatabase");
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
 * Video name, url, and thumbnail are set according to parameters
 * Likes/dislikes are 0 by default
 * Comment is empty by default
 * @param {String} videoName
 * @param {String} videoURL
 * @param {String} thumbURL
 */
export async function createVideo(videoName, videoURL, thumbURL) {
  let client = new MongoClient(uri);
  try {
    // define a database and collection on which to run the method
    const database = client.db("importantDatabase");
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
 * Video is removed based on the name passed
 * @param {String} removeVideoName
 */
export async function deleteVideo(removeVideoName) {
  let client = new MongoClient(uri);
  try {
    // define a database and collection on which to run the method
    const database = client.db("importantDatabase");
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
 * @param {String} name
 * @param {JSON} query
 */
export async function editVideo(filter, query) {
  let client = new MongoClient(uri);
  try {
    // define a database and collection on which to run the method
    const database = client.db("importantDatabase");
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
 * @param {String} username
 * @param {Number} count
 * @returns {Promise<void>}
 * */
export async function updateLoginTally(username, count) {
  let client = new MongoClient(uri);
  try {
    const database = client.db("importantDatabase");
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
 * @param {String} query
 * @returns {void}
 * */
export async function retrieveVideos(field, query) {
  let client = new MongoClient(uri);
  try {
    // define a database and collection on which to run the method
    const database = client.db("importantDatabase");
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
 * Increment/decrement likes based on user input, if dir is
 * true increment likes, if dir is false decrement likes
 * @param {String} vid
 * @param {{key: value}} inc_query
 * @returns {void}
 */
export async function updateUserOpinion(vid, inc_query) {
  let client = new MongoClient(uri);
  try {
    // define a database and collection on which to run the method
    const database = client.db("importantDatabase");
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
 * @param {String} user
 * @param {String} vid
 * @param {Boolean} adding
 * @return {void}
 */
export async function updateFavorites(vid, user, adding) {
  let client = new MongoClient(uri);
  try {
    const database = client.db("importantDatabase");
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
 * @param {String} user
 * @param {String} vid
 * @param {Boolean} adding
 * @return {void}
 */
export async function updateDisfavorites(vid, user, adding) {
  let client = new MongoClient(uri);
  try {
    const database = client.db("importantDatabase");
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

export async function uploadComment(vid, comment) {
  let client = new MongoClient(uri);
  try {
    const database = client.db("importantDatabase");
    const coll = database.collection("videos");

    const filter = { url: vid };
    let update = { $set: { comment: comment } };

    await coll.updateOne(filter, update);
  } finally {
    await client.close();
  }
}
