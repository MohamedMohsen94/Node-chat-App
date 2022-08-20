let socket = io();
socket.on("connect", function () {
  console.log("connected to server");
});

socket.on("disconnect", function () {
  console.log("disconnected from the server");
});

socket.on("newMessage", function (newMessage) {
  let formattedTime = moment(newMessage.createdAt).format("h:mm a");
  let template = jQuery("#message-template").html();
  let html = Mustache.render(template, {
    text: newMessage.text,
    from: newMessage.from,
    createdAt: formattedTime,
  });
  jQuery("#messages").append(html);
});

socket.on("newLocationMessage", function (newMessage) {
  let formattedTime = moment(newMessage.createdAt).format("h:mm a");
  let template = jQuery("#location-message-template").html();
  let html = Mustache.render(template, {
    url: newMessage.url,
    from: newMessage.from,
    createdAt: formattedTime,
  });
  jQuery("#messages").append(html);
});

$("#message-form").submit(function (e) {
  e.preventDefault();

  socket.emit(
    "createMessage",
    {
      from: "User",
      text: $("[name=message]").val(),
    },
    function () {
      $("[name=message]").val("");
    }
  );
});

let locationButton = $("#send-location");

locationButton.on("click", function () {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }
  locationButton.attr("disabled", "disabled").text("Sending Location...");
  navigator.geolocation.getCurrentPosition(
    function (location) {
      locationButton.removeAttr("disabled").text("Send location");
      socket.emit("createLocationMessage", {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    },
    function () {
      locationButton.removeAttr("disabled").text("Send location");
      alert("unable to fetch location");
    }
  );
});
