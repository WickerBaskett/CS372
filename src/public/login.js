// login.js
// Handles the client side of Server Sent Events
// used to display alerts on failed login attempts

const urlParams = new URLSearchParams(window.location.search);
const alert_status = urlParams.get("alert");

if (alert_status == 1) {
    alert("Invalid Username or Password");
}
