document.addEventListener("DOMContentLoaded", function() {
  var textProperty;
  domLoaded = true;
  textProperty = "textContent" in document.body ? "textContent" : "innerText";
  var elements = document.querySelectorAll("time[data-format]");
  for (var i = 0; i < elements.length; i++) {
    var element = elements[i];
    var datetime = element.getAttribute("datetime");
    var format = element.getAttribute("data-format");

    element[textProperty] = moment(datetime).format(format);
  }
});

//Menu Toggle Script

document.querySelector('[data-behavior="toggle-menu"]').addEventListener('click', function(e) {
  e.preventDefault();
  document.querySelector('[data-object="menu-object"]').classList.toggle('is-open');
});


function setMenuState(target) {
  document.querySelector('[data-object="nav-id-'+target+'"]').classList.add('is-active');
}
