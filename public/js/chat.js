let socket = io();
//param takes an object and return a string
//deparam its otherwise takes a string and returns an object

let scrollToBottom = function () {
  //selectors
  let messages = $("#messages");
  let newMessage = $("li:last-child");
  //heights
  let clientHeight = messages.prop("clientHeight");
  let scrollTop = messages.prop("scrollTop");
  let scrollHeight = messages.prop("scrollHeight");
  let newMessageHeight = newMessage.innerHeight();
  let lastMessageHeight = newMessage.prev().innerHeight();

  if (
    clientHeight + scrollTop + newMessageHeight + lastMessageHeight >=
    scrollHeight
  ) {
    messages.scrollTop(scrollHeight);
  }
};

socket.on("connect", function () {
  //console.log('connected to server')
  // deparams to convert that data to an object so we can use
  let params = $.deparam(window.location.search);
  console.log(params);
  socket.emit("join", params, function (err) {
    if (err) {
      alert(err);
      window.location.href = "/";
    } else {
      console.log("No error");
    }
  });
});

socket.on("disconnect", function () {
  console.log("disconnected from the server");
});

socket.on("updateUserList", function (users) {
  let ol = $("<ol></ol>");
  users.forEach(function (user) {
    ol.append($("<li></li>").text(user));
  });
  jQuery("#users").html(ol);
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
  scrollToBottom();
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
  scrollToBottom();
});

$("#message-form").submit(function (e) {
  e.preventDefault();

  socket.emit(
    "createMessage",
    {
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
