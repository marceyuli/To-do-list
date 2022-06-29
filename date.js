exports.getDate = function () {
  var today = new Date();
  var currentDay = today.getDay();
  var day = "";

  var options = {
    weekday: "long",
    day: "numeric",
    month: "long",
  };

  day = today.toLocaleDateString("es-BO", options);
  return day;
}
