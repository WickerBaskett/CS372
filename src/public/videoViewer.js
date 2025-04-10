// videoViewer.js
// Handles logic for videoViewer page

/**
 *
 * @param {Number} opinion
 */
function onOpinionChange(opinion) {
  console.log("Opinion: " + opinion);
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
