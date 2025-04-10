// videoViewer.js
// Handles logic for videoViewer page

function onLike() {
    let cookies = document.cookie;
    const cookie_reg = /=*&/
    cookie_reg.exec(cookies).forEach(item => {
        console.log("Cookie: " + item);
    })
    function readCookie(name) { // Escape regexp special characters (thanks kangax!) name = name.replace(/([.*+?^=!:${}()|[\]\/\\])/g, ‘\\$1’);
        
        return match && unescape(match[1]); 
    }
    
    fetch("/likes?vid=" + url + "&user=" + user);
}

const urlParams = new URLSearchParams(window.location.search);
const url = urlParams.get("url");
let player = document.getElementById("video_player");
player.setAttribute("src", url);


