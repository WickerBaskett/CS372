// videoViewer.js
// Handles logic for videoViewer page

let cookies = document.cookie
    .split("&")
    .map((item) => {
      let args = item.split("=");
      return args;
    })
    .reduce((acc, curr) => {
      acc[curr[0]] = curr[1];
      return acc;
    }, []);

/**
 *
 * @param {Number} opinion
 */
function onOpinionChange(opinion) {
  console.log("Opinion: " + opinion);

  fetch(
    "/opinion?vid=" + url + "&user=" + cookies["user"] + "&opinion=" + opinion,
  );
}

const urlParams = new URLSearchParams(window.location.search);
const url = urlParams.get("url");
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

// Check user permissions
// Fetch videos
let req_url =
  server_url +
  "/videos?q=" +
  url +
  "&fav=&user=" + cookies["user"];

fetch(req_url)
.then((response) => {
  if (!response.ok) {
    throw new Error("Failed to get list of videos");
  }
  return response.json();
  })
  .then((json) => {
    Object.entries(json.videos)
      .sort((a, b) => {
        if (a[1].name < b[1].name) {
          return -1;
        }
        if (a[1].name > b[1].name) {
          return 1;
        }
        return 0;
      })
      .map((item) => {
        populateVideo(item[1]);
      });
  })
  .catch((error) => {
    console.error("An error occurred with the fetch request: " + error);
  });
