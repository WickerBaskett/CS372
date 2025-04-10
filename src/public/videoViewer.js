// videoViewer.js
// Handles logic for videoViewer page

const urlParams = new URLSearchParams(window.location.search);
const url = urlParams.get("url");
let player = document.getElementById("video_player");
player.setAttribute("src", url);

let like = document.getElementById("like");
if (!like) {
    
}

console.log(url);
