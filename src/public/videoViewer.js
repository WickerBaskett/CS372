// videoViewer.js
// Handles logic for videoViewer page

//////////////////////////////
//     Global Variables     //
//////////////////////////////

const server_url = "http://localhost:4200"; // Endpoint to retrieve videos, should add a config option for this
const urlParams = new URLSearchParams(window.location.search);
const url = urlParams.get("url");
const role_div = document.getElementById("role_elements");
let role = undefined;

///////////////////////
//     Functions     //
///////////////////////

/**
 * Runs on click of a like/dislike radio button
 * If opinion is 1 we like the video
 * If opinion is 0 we dislike the video
 * @param {Number} opinion
 */
function onOpinionChange(opinion) {
  console.log("Opinion: " + opinion);

  fetch("/api/opinion?vid=" + url + "&opinion=" + opinion).then(() => {
    console.log("Updating Opinions");
    console.log(role);
    if (role == undefined) {
      return;
    } else if (role == 1) {
    } else if (role == 2) {
      updateMarketingManager();
    }
  });
}
/**
 * Updates the display shown to Marketing Managers
 */
function updateMarketingManager() {
  console.log("Made it to update marketing manager");
  const q_url = url.split("embed/")[1].split("?")[0];

  // Fetch video to display likes/dislikes to Marketing Manager
  let req_url = server_url + "/api/videos?q=" + q_url + "&fav=&field=url";

  fetch(req_url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to get video");
      }
      console.log("Response is good!");
      return response.json();
    })
    .then((json) => {
      console.log(json.videos[0]);
      console.log("Updating opinion labels");
      document.getElementById("like_label").innerHTML =
        "Likes: " + json.videos[0].likes;
      document.getElementById("dislike_label").innerHTML =
        "Dislikes: " + json.videos[0].dislikes;
    })
    .catch((error) => {
      console.error(
        "An error occurred with the updateMarketingManager fetch request: " +
          error,
      );
    });
}

/**
 * Updates the display shown to Content Editors
 */
function updateContentEditor() {
  console.log("Made it to update content editor");
  const q_url = url.split("embed/")[1].split("?")[0];

  // Fetch video to display comment to Content Editor
  let req_url = server_url + "/api/videos?q=" + q_url + "&fav=&field=url";

  fetch(req_url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to get video");
      }
      console.log("Response is good!");
      return response.json();
    })
    .then((json) => {
      document.getElementById("view_comment").innerHTML =
        "Comment: " + json.videos[0].comment;
    })
    .catch((error) => {
      console.error(
        "An error occurred with the updateContentEditor fetch request: " +
          error,
      );
    });
}

/////////////////////////
//     Startup Ops     //
/////////////////////////

document.getElementById("backToGallery").onclick = function () {
  window.location.href = "/gallery";
};

let player = document.getElementById("video_player");
player.setAttribute("src", url);

const like_radio = document.getElementById("like");
const dislike_radio = document.getElementById("dislike");

like_radio.addEventListener("click", function () {
  onOpinionChange(1);
});

dislike_radio.addEventListener("click", function () {
  onOpinionChange(0);
});

fetch(server_url + "/api/whoami")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Failed to get list of videos");
    }
    return response.json();
  })
  .then((json) => {
    role = json.role;
    
    if (json.role == 1) {
      // If the user is a Content Editor
      role_div.appendChild(document.createElement("br"));
      let view_comment = document.createElement("label");
      view_comment.id = "view_comment";
      role_div.appendChild(view_comment);

      updateContentEditor();

    } else if (json.role == 2) {
      // If user is a Marketing Manager
      let like_label = document.createElement("label");
      let dislike_label = document.createElement("label");
      let comment_form = document.createElement("form");
      let comment_text = document.createElement("input");
      let comment_submit = document.createElement("input");
      let static_data = document.createElement("input");

      like_label.id = "like_label";
      dislike_label.id = "dislike_label";

      comment_form.id = "comment_form";
      comment_form.name = "comment_form_name";
      comment_form.method = "POST";
      comment_form.action = server_url + "/api/upload_comment";

      comment_text.id = "comment_entry";
      comment_text.name = "comment";
      comment_text.type = "text";
      comment_text.placeholder = "Enter Your Comment Here...";

      static_data.id = "static_data";
      static_data.name = "url";
      static_data.value = url;
      static_data.type = "hidden";

      comment_submit.id = "comment_submit";
      comment_submit.type = "submit";
      comment_submit.innerText = "Submit";
      comment_submit.name = "submit_button";

      role_div.appendChild(like_label);
      role_div.appendChild(document.createElement("br"));
      role_div.appendChild(dislike_label);
      role_div.appendChild(document.createElement("br"));

      comment_form.appendChild(comment_text);
      comment_form.appendChild(comment_submit);
      comment_form.appendChild(static_data);
      role_div.appendChild(comment_form);

      updateMarketingManager();
    }
  })
  .catch((error) => {
    console.error("An error occurred with the initial fetch request: " + error);
  });
