import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { mongo_retrieve, mongo_update_login_tally } from "./mongo.mjs";
import { sha256 } from "js-sha256";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Holds state for failed login attempts
const login_context = {
  failed: false,
  message: "",
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 4200;

app.use(express.static(path.join(__dirname, "/public")));
app.use(bodyParser.urlencoded({ extended: true }));

console.log(__dirname);

/// Endpoint for serving the login page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/login.html"));
});

/// Endpoint responsible for validating user login attempts
app.get("/auth", (req, res) => {
  res.setHeader("Content-Type", "application/json");

  mongo_retrieve(req.query.username_input).then((result) => {
    // Check that there is an account associated with username
    if (result == null) {
      console.log("User does not exist");
      res.redirect("/login.html");
      login_context.message = "User does not exist";
      login_context.failed = true;
      return;
    }

    // Hash the user password for comparison to stored password
    var user_pass = sha256.create();
    user_pass.update(req.query.password_input);
    user_pass.hex();
    console.log(user_pass.hex());

    // Route the client based on authentication success or failure
    if (result.password == user_pass) {
      console.log("Good :]");
      res.redirect("/gallery.html");
      mongo_update_login_tally(req.query.username_input, -1);
    } else {
      console.log("Invalid Password");
      res.redirect("/login.html");
      login_context.message = "Invalid Password";
      login_context.failed = true;
      mongo_update_login_tally(req.query.username_input, result.login_tally);
    }
  });
});

/// Establishes endpoint for Server Sent Events (SSE)
/// Sends an alert to the client on failed login attempt
app.get("/events", (req, res) => {
  console.log("SSE connection requested");
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  if (login_context.failed) {
    res.write("data: " + login_context.message + "\n\n");
    login_context.failed = true;
  }

  res.on("close", () => {
    console.log("SSE session closed by client");
    res.end();
  });
});

app.listen(port, () => {
  console.log("Server running on port 4200");
});
