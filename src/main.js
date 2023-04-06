// Impor fungsi dari file algorithm
// import { AStar } from './algorithm.js';
// const AStar = require('./algorithm.js');

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

// Penerimaan dan pembaacan konfigurasi peta bonus dari masukan
function readFileBonus () {
  // Beberapa kasus ujung penerimaan file
  let input = document.getElementById('inputFile');
  if (!input.files[0]) {
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

    startMapSearch();   // Inisiasi penandaan posisi koordinat pada peta
    drawPathLine();     // Menggambar petak path
    tablePathControl(); // Menangani tabel daftar simpul dan jaraknya
    chooseNode();       // Melakukan penanganan terhadap pengisian simpul yang akan dijelajah
  }
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
    reader.onload = initiateSearch;
    reader.readAsText(file);
  }

  // Instansiasi onload dengan JSON
  function initiateSearch (e) {
    let lines = e.target.result;
    // Informasi dari masukan
    infoParsed = JSON.parse(lines.toString());
    adjMatrix = infoParsed.adjMatrix;

    tablePathControl(); // Menangani tabel daftar simpul dan jaraknya
    chooseNode();       // Melakukan penanganan terhadap pengisian simpul yang akan dijelajah
  }
}

/* Function to initialize map */
function startMapSearch (){
  // Instantiate markers
  markers = [];

  // Zoom in to map position
  maps.flyTo([parseFloat(posList[0].lintang), parseFloat(posList[0].bujur)], 17);

  let i = 1;
  posList.forEach(function(info) {
    let marker = L.marker([parseFloat(info.lintang), parseFloat(info.bujur)], {draggable: 'true'});
    marker.id = i;
    i++;
    marker.bindPopup(`${info.id} - ${info.nama}`);
    maps.addLayer(marker);

    markers.push(marker);
  });
}

/* Draw a pathline */
function drawPathLine () {
  // Instantiate pathline
  path = [];

  // Traverse the adjacency matrix
  for (let i = 0; i < adjMatrix.length; i++) {
    for (let j = 0; j < i; j++) {
      // Validasi terhubung
      if (adjMatrix[i][j] != -1) {
        let latlons = [markers[i].getLatLng(), markers[j].getLatLng()];

        let line = L.polyline(latlons, {color: 'green'});
        path.push(line);
        maps.addLayer(line);
      }
    }
  }
}

function tablePathControl () {
  // Mengambil elemen id di HTML nya
  let tableContents = document.getElementById('pathContent');
  tableContents.innerHTML = '';
  let count = 1;

  // Membuat tabel list simpul dari masukan
  for (let i = 0; i < adjMatrix.length; i++) {
    for (let j = 0; j < i; j++) {
      // Validasi terhubung
      if (adjMatrix[i][j] != -1) {
        tableContents.innerHTML += 
        `<tr>
          <th scope="row">${count}</th>
          <td>${j+1}-${i+1}</td>
          <td>${adjMatrix[i][j]}</td>
        </tr>`;
        count++;
      }
    }
  }
}

// Memilih simpul yang akan dijadikan bagian awal dan akhir
function chooseNode () {
  // Instansiasi konstanta
  let pilAwal = document.getElementsByClassName('init-pos')[0];
  let pilAkhir = document.getElementsByClassName('final-pos')[0];

  // Set awal isinya kosong
  pilAwal.innerHTML = '';
  pilAkhir.innerHTML = '';

  // Menambahkan jumlah opsi
  for (let i = 1; i <= adjMatrix.length; i++){
    pilAwal.innerHTML += `<option value="${i}">${i.toString()}</option>`
    pilAkhir.innerHTML += `<option value="${i}">${i.toString()}</option>`
  }
}

// Melakukan pemrosesan secara A*
function doAStar () {
  // Inisiasi posisi
  initialPosition = document.getElementsByClassName('init-pos')[0].value;
  finalPosition = document.getElementsByClassName('final-pos')[0].value;

  // Melakukan pemrosesan menggunakan A*
  // path = AStar(initialPosition, finalPosition, adjMatrix, posList);
  
  // Mencetak hasil pada layar, lakukan pemrosesan pada kelas tertentu
  elmtPath = document.getElementsByClassName('path')[0];
  if (!(path.length)) {
    // Jika panjang path kosong, maka tidak ada jalur
    elmtPath.innerHTML = '<p>Tidak ditemukannya Path</p>';
  } else {
    // Jika ada, cetak path
    let finPath = "Path: ";
    for (let i = 0; i < path[0].length; i++){
      if (i != path[0].length-1) {
        finPath += path[0][i] + ' -> ';
      } else {
        finPath += path[0][i];
      }
    }
    elmtPath.innerHTML = `<p>${finPath}</p>`;  
    elmtPath.innerHTML += `<p>Jaraknya : ${path[1]} km`

    // Ilustrasikan dalam peta masukan
    let latlons = [];
    drawPathLine();

    for(let i = 0; i < path[0].length; i++) {
      latlons.push(markers[path[0][i]-1].getLatLng());
    }

    let line = L.polyline(latlons, {color: 'red'});
    // pathlines.push(line);
    maps.addLayer(line);
  }
}