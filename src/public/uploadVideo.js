// uploadVideo.js
// Handles logic for uploadVideo.html

const urlParams = new URLSearchParams(window.location.search);
const alert_status = urlParams.get("alert");

if (alert_status == 1) {
  alert("Invalid name, video, or thumbnail URL");
} else if (alert_status == 2) {
  alert("Invalid Session");
}

document.getElementById("backToGallery").onclick = function () {
  window.location.href = "/gallery";
};
