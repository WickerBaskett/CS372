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

    await coll.insertOne({username: username, password: pass, login_tally: 0, role: 0, favorites: []});

  } finally {
    await client.close();
  }
}

/**
 * Sets the login_tally field of the document with name matching
 * username. If count is 2 then it will delete the associated account
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
export async function retrieveVideos(query) {
  let client = new MongoClient(uri);
  try {
    // define a database and collection on which to run the method
    const database = client.db("importantDatabase");
    const coll = database.collection("videos");

    const distinctValues = await coll.find({"name": {"$regex": query, "$options": "i"}}).toArray();
    console.log(distinctValues[0]);
    return distinctValues;
  } finally {
    await client.close();
  }
}

/**
 * Retrieve likes/dislikes
 * Increment/decrement likes based on user input
 * @param {String} vid 
 * @returns {void}
 */
export async function updateLikesTally(vid) {
  let client = new MongoClient(uri);
  try {
    // define a database and collection on which to run the method
    const database = client.db("importantDatabase");
    const coll = database.collection("videos");
    
    console.log(vid);

    const filter = {url: vid};
    const update = {$inc: {likes: 1}};
    
    const value = await coll.updateOne(filter, update);

    console.log("Made it past update 1");
  } finally {
    await client.close();
  }
}

/**
 * Add liked videos to user's favorites list
 * @param {String} user 
 * @param {String} vid 
 * @return {void}
 */
export async function addToFavorites(vid, user) {
  let client = new MongoClient(uri);
  try {
    const database = client.db("importantDatabase");
    const coll = database.collection("users");

    const filter = {username: user};
    const update = {$push: {favorites: vid}};

    const value = await coll.updateOne(filter, update);

  } finally {
    await client.close();
  }
}
