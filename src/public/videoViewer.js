// videoViewer.js
// Handles logic for videoViewer page
const server_url = "http://localhost:4200"; // Endpoint to retrieve videos, should add a config option for this

/**
 *
 * @param {Number} opinion
 */
function onOpinionChange(opinion) {
  console.log("Opinion: " + opinion);

  fetch("/opinion?vid=" + url + "&opinion=" + opinion).then(() => {
    updateOpinionDisplay();
  });
}
/**
 * Updates like and dislike counter with current tallies
 */
function updateOpinionDisplay() {
  const q_url = url.split("embed/")[1].split("?")[0];
  console.log(q_url);

  // Fetch video to display likes to Marketing Manager
  let req_url = server_url + "/videos?q=" + q_url + "&fav=&field=url";

  fetch(req_url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to get video");
      }
      console.log("Response is good!");
      return response.json();
    })
    .then((json) => {
      document.getElementById("likecount").innerHTML =
        "Likes: " + json.videos[0].likes;
      document.getElementById("dislikecount").innerHTML =
        "Dislikes: " + json.videos[0].dislikes;
    })
    .catch((error) => {
      console.error("An error occurred with the fetch request: " + error);
    });
}

const urlParams = new URLSearchParams(window.location.search);
const url = urlParams.get("url");
let player = document.getElementById("video_player");
player.setAttribute("src", url);

updateOpinionDisplay();

const like_radio = document.getElementById("like");
const dislike_radio = document.getElementById("dislike");

like_radio.addEventListener("click", function () {
  onOpinionChange(1);
});

dislike_radio.addEventListener("click", function () {
  onOpinionChange(0);
});
