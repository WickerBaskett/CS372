import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { mongo_retrieve } from "./mongo.mjs";
import { sha256 } from 'js-sha256';
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 4200;

app.use(express.static("src/public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/login.html"));
});

app.get("/auth", (req, res) => {
  res.setHeader("Content-Type", "application/json");

  var user_pass = sha256.create();
  user_pass.update(req.query.password_input);
  user_pass.hex();

  mongo_retrieve(req.query.username_input).then((result) => {
    console.log(result.password);
    if (result.password == user_pass) {
        console.log("Good :]");
    } else {
        console.log("Bad:( 😧");
    }
  });
});

app.listen(port, () => {
  console.log("Server running on port 4200");
});
