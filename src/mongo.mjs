import { MongoClient } from "mongodb";

const uri = "mongodb://localhost:27017";

/// Retrieve the first document with a name field that matches
/// username and returns it
export async function mongo_retrieve(username) {
  let client = new MongoClient(uri);
  try {
    // define a database and collection on which to run the method
    const database = client.db("importantDatabase");
    const coll = database.collection("loginInfo");
    console.log("Sending request to db");

    const distinctValues = await coll.findOne({ name: username });

    console.log("Returning from mongo_retrieve()");
    return distinctValues;
  } finally {
    await client.close();
  }
}

/// Sets the login_tally field of the document with name matching username
/// If count is 2 then it will delete the associated account
export async function mongo_update_login_tally(username, count) {
  let client = new MongoClient(uri);
  try {
    const database = client.db("importantDatabase");
    const coll = database.collection("loginInfo");

    if (count == 2) {
      console.log("To many failed login attempts, deleting user: " + username);
      await coll.deleteOne({ name: username });
    }

    await coll.updateOne(
      { name: username },
      {
        $set: { login_tally: count + 1 },
      },
    );

    console.log("Counter Updated");
  } finally {
    await client.close();
  }
}
