// gallery.js
// Requests list of videos and dynamically
// creates entries for each video

const url = "localhost:4200/videos"

/**
 * Creates a row in a table for each element of the passed array
 * @param {Array} res 
 */
function populateVideos(res) {
    let table = document.getElementById("gal_table");

    res.forEach((vid) => {
        let row = table.insertRow();
        let cell = row.insertCell();
        cell.textContent = vid;
    })
}

fetch(url).then((response) => { 
        if (!response.ok()) {
            throw new Error("Failed to get list of videos");
        }
        return response.json();
    })
    .then((json) => {
        console.log(json);
    });
