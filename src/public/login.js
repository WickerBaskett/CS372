// login.js
// Handles the client side of Server Sent Events
// used to display alerts on failed login attempts

const eventSource = new EventSource("/events");

eventSource.onmessage = function (event) {
  alert(event.data);
};

eventSource.onerror = function (event) {
  console.log("Error Occured: ", event);
};
