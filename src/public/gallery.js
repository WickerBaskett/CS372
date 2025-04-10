// gallery.js
// Requests list of videos and dynamically
// Creates entries for each video

const url = "http://localhost:4200"; // Endpoint to retrieve videos, should add a config option for this
const table = document.getElementById("gal_table"); // Table element that videos will be added to
const urlParams = new URLSearchParams(window.location.search); // A list of all query parameters
const query = urlParams.get("q"); // The search query used to filter displayed videos

/**
 * Creates a row in a table for a single video
 * @param {} res
 */
function populateVideo(res) {
  // Make a new cell in the table
  let row = table.insertRow();
  let cell = row.insertCell();

  const cellAnchor = document.createElement("a");
  cellAnchor.href = url + "/videoViewer?url=" + res.url; // <- We can pass stuff to the loaded page like this
  cellAnchor.textContent = res.name;
  cell.appendChild(cellAnchor);
}

// Fetch all videos from db and populate the gallery with them
fetch(url + "/videos?q=" + query)
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
