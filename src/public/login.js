function db_request() {
  fetch("/retrieve")
    .then((result) => result.json())
    .then((data) => {
      for (const obj in data) {
        document.getElementById("dbDisplay").innerHTML = JSON.stringify(data);
      }
    });
}
