// Impor fungsi dari file algorithm
// import { AStar } from './algorithm.js';

// Deklarasi variabel global
let maps;
let adjMatrix = [];
let posList = [];

// Berkaitan dengan setup awal web
window.onload = function() {
  document.getElementsByClassName('map')[0].style.display = 'block';
  maps = L.map('map').setView([0, 0], 1);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(maps);
}

// Penerimaan dan pembaacan konfigurasi peta dari masukan
function readFile () {
  // Beberapa kasus ujung penerimaan file
  let input = document.getElementById('inputFile');
  if (!input) {
    /* Tidak ditemukannya objek element 'fileinput' pada DOM Tree */
    alert("Um, couldn't find the fileinput element.");
  }
  else if (!input.files) {
    /* Browser tidak support `files` property */
    alert("This browser doesn't seem to support the `files` property of file inputs.");
  }
  else if (!input.files[0]) {
    alert("Please select a file!");
  } else {
    let file = input.files[0];
    let reader = new FileReader();
    reader.onload = initiateSearch;
    reader.readAsText(file);
  }

  // Instansiasi onload dengan JSON
  function initiateSearch (e) {
    let lines = e.target.result;
    // Informasi dari masukan
    infoParsed = JSON.parse(lines.toString());
    posList = infoParsed.posList;
    adjMatrix = infoParsed.adjMatrix;

    console.log("Hello world!");

    // Inisiasi penandaan posisi korrdinat pada peta
    startMapSearch();

    // Melakukan penanganan terhadap pengisian simpul yang akan dijelajah
    // handleNodePilForm();

    // Menangani tabel daftar simpul dan jaraknya
    // handlePathTable(); 

    // Menggambar petak path
    // drawPath();
  }
}

/* Function to initialize map */
function startMapSearch (){
  console.log(posList[0].lintang);
  /* for(let i = 0; i < markers.length; i++) {
    maps.removeLayer(markers[i]);
  } */
  markers = [];

  maps.flyTo([parseFloat(posList[0].lintang), parseFloat(posList[0].bujur)], 18);

  let i = 1;
  posList.forEach(function(info) {
    let marker = L.marker([parseFloat(info.lintang), parseFloat(info.bujur)], {draggable: 'true'});
    marker.id = i;
    i++;
    marker.bindPopup(`${info.id}`);
    maps.addLayer(marker);

    marker.on('dragend', function()
    {
      console.log("New lintang len is", marker.getLatLng());
      posList[marker.id-1].lintang = marker.getLatLng().lintang;
      posList[marker.id-1].bujur = marker.getLatLng().bujur;
      console.log("New marker is", posList[marker.id]);
      drawPath();
      handlePathTable();
    });

    marker.on('mouseover', function (e) {
      this.openPopup();
    });
    marker.on('mouseout', function (e) {
        this.closePopup();
    });

    markers.push(marker);
  });
}