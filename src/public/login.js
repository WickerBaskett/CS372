const eventSource = new EventSource("/events");

eventSource.onmessage = function(event) {
    alert(event.data);
};

eventSource.onerror = function(event) {
    console.log("Error Occured: ", event);
}
