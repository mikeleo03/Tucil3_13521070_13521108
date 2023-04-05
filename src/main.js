window.onload = function() {
  document.getElementsByClassName('map')[0].style.display = 'block';

  myMap = L.map('map').setView([0, 0], 1);
  myMap.doubleClickZoom.disable();

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(myMap);
}