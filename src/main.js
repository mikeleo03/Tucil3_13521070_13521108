// Impor fungsi dari file algorithm
// import { AStar } from './algorithm.js';

// Deklarasi variabel global
let myMap;
let adjMatrix = [];
let weightGraph = [];
let posList = [];

// Berkaitan dengan setup awal web
window.onload = function() {
  document.getElementsByClassName('map')[0].style.display = 'block';
  myMap = L.map('map').setView([0, 0], 1);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(myMap);
}

// Penerimaan dan pembaacan konfigurasi peta dari masukan
function readFile () {
  // Beberapa kasus ujung penerimaan file
  let input = document.getElementById('inputFile');
  if (!input.files[0]) {
    alert("Please select a file!");
  } else {
    let file = input.files[0];
    let reader = new FileReader();
    reader.readAsText(file);
    reader.onload = initiateSearch;
  }

  // Instansiasi onload dengan JSON
  function initiateSearch (e) {
    // Informasi dari masukan
    infoParsed = JSON.parse(e.target.result.toString());
    adjMatrix = infoParsed.adjMatrix;
    weightGraph = infoParsed.weightGraph;
    posList = infoParsed.posList;

    // Inisiasi penandaan posisi korrdinat pada peta

    // Melakukan penanganan terhadap pengisian simpul yang akan dijelajah

    // Menangani tabel daftar simpul dan jaraknya

    // Menggambar petak path
  }
}