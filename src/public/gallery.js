// gallery.js
// Requests list of videos and dynamically
// Creates entries for each video

const server_url = "http://localhost:4200"; // Endpoint to retrieve videos, should add a config option for this
const table = document.getElementById("gal_table"); // Table element that videos will be added to
const urlParams = new URLSearchParams(window.location.search); // A list of all query parameters
const query = urlParams.get("q"); // The search query used to filter displayed videos
const fav = urlParams.get("fav");

/**
 * Creates a row in a table for a single video
 * @param {} res
 */
function populateVideo(res) {
  // Make a new cell in the table
  let row = table.insertRow();
  let cell = row.insertCell();

  const cellAnchor = document.createElement("a");
  cellAnchor.href = server_url + "/videoViewer?url=" + res.url; // <- We can pass stuff to the loaded page like this
  cellAnchor.textContent = res.name;
  
  const thumbnailImg = document.createElement("img");
  thumbnailImg.src = res.thumbnail;
  thumbnailImg.alt = "Le video thumbnail";
  thumbnailImg.style.width = "400px";
  thumbnailImg.style.height = "auto";
  thumbnailImg.style.display = "block";
  
  cellAnchor.appendChild(thumbnailImg);
  cell.appendChild(cellAnchor);
}

function clearTable() {
  table.detach();
}

// Updates the display shown to content editors
function updateContentEditor() {}

/**
 * Updates the videos displayed based on query
 * @param {String} query
 */
function updateDisplayedVideos(query) {
  // Fill in first row of table with column names
  let id_row = table.insertRow();
  let name_cell = id_row.insertCell();
  name_cell.innerHTML = "Name";

  // Fetch all videos from db and populate the gallery with them
  let req_url = server_url + "/api/videos?q=" + query + "&fav=" + fav;

  console.log(req_url);

  fetch(req_url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to get list of videos");
      }
      return response.json();
    })
    .then((json) => {
      if (json.role == 1) {
        let edit_button = document.createElement("button");
      }

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
}

/**
 * Event handler for search button click
 */
function onSearchClick() {
  table.innerHTML = "";
  let query = document.getElementById("search_query");
  updateDisplayedVideos(query.value);
}

/**
 * Event handler for upload video button click
 */
document.getElementById("toUploadPage").onclick = function () {
  window.location.href = "/uploadVideo";
};

updateDisplayedVideos("");
