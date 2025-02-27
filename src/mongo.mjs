import { MongoClient } from "mongodb";

const uri = "mongodb://localhost:27017";

export async function mongo_retrieve(username) {
  let client = new MongoClient(uri);
  try {
    // define a database and collection on which to run the method
    const database = client.db("importantDatabase");
    const coll = database.collection("loginInfo");
    console.log("Sending request to db");

    const distinctValues = await coll.findOne({ name: username })
    
    console.log("Returning from mongo_retrieve()");
    return distinctValues;
  } finally {
    await client.close();
  }
}
