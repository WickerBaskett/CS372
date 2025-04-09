// gallery.js
// Requests list of videos and dynamically
// creates entries for each video

const url = "http://localhost:4200/videos"; // Endpoint to retrieve videos, should add a config option for this
const table = document.getElementById("gal_table"); // Table element that videos will be added to

/**
 * Creates a row in a table for a single video
 * @param {} res
 */
function populateVideo(res) {

  // Make a new cell in the table
  let row = table.insertRow();
  let cell = row.insertCell();

  const cellAnchor = document.createElement("a");
  cellAnchor.href = res.url;
  cellAnchor.textContent = res.name;
  cell.appendChild(cellAnchor);

  //cell.textContent = res.name;
}

// Fetch all videos from db and populate the gallery with them
fetch(url)
  .then((response) => {
    if (!response.ok) {
      throw new Error("Failed to get list of videos");
    }
    return response.json();
  })
  .then((json) => {
    json.videos.forEach((vid) => {
      console.log("URL: " + vid.url + "   L: " + vid.likes + "   D: " + vid.dislikes);
      populateVideo(vid)
    });
  })
  .catch((error) => {
    console.error("An error occured with the fetch request: " + error);
  });
