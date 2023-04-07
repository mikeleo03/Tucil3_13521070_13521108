// Impor fungsi dari file algorithm
// import { AStar } from './algorithm.js';
// const AStar = require('./algorithm.js');

// Deklarasi variabel global
let maps;
let adjMatrix = [];
let posList = [];
let finalPath;

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
  AStar(parseInt(initialPosition), parseInt(finalPosition), adjMatrix, posList);
  
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

/* File untuk melakukan pemrosesan terhadap simpul */
/* Berbagai deklarasi data akan dijabarkan disini */
// Kelas Path, untuk melakukan pemrosesan terkait data simpul analisis
class Path {
  // 1. Konstruktor
  constructor (currentPos, passedpath, priority) {
      this.listPath = [];
      this.currentPos = currentPos;
      this.passedpath = passedpath;
      this.priority = priority;
  }

  copyPath (paths) {
      for (var i = 0; i < paths.listPath.length; i++) {
        this.listPath.push(paths.listPath[i]);
      }
  }

  // 3. Getter priority
  getPrio () {
      return this.priority;
  }

  // 4. Print path
  printPath () {
      let Path = "";
      for (var i = 0; i < this.route.getRouteLength(); i++) {
          Path = Path + this.route.listPath[i] + " > ";
      }
  }

  // 5. Add new position to the path
  addPosition (pos) {
    this.listPath.push(pos);
    this.currentPos = pos;
  }
}

// Kelas PQ berupa priorityqueue, untuk melakukan pemilihan simpul dengan bobot terkecil
class PQ {
  // 1. Konstruktor
  constructor () {
      this.queue = [];
  }

  // 2. Getter panjang queue
  getLength () {
      return this.queue.length;
  }

  // 3. Getter elemen queue
  getElmt (idx) {
      return this.queue[idx];
  }

  // 4. Setter elemen queue
  setElmt (idx, val) {
      this.queue[idx] = val;
  }

  // 5. Swap, untuk menukar posisi
  swap (pos1, pos2) {
      let val = this.queue[pos1];
      this.setElmt(pos1, this.getElmt(pos2));
      this.setElmt(pos2, val);
      // Mengembalikan isi queue setelah ditukar
      return this.queue;
  }

  // 6. Boolean function isEmpty
  isEmpty () {
      return (this.getLength() == 0);
  }

  // 7. Enquque, prosedur untuk menambahkan antrian
  // Ingat perlu juga untuk mempertimbangkan prioritas
  enqueue (newPath) {
      var check = false;

      // Menemukan lokasi yang tepat untuk insert
      for (var i = 0; i < this.getLength(); i++) {
          if (this.getElmt(i).getPrio() > newPath.getPrio()) {
              // Menemukan lokasi yang tepat
              this.queue.splice(i, 0, newPath);
              check = true;
              break;
          }
      }
  
      // Kalo semua lebih kecil, insert last
      if (!check) {
          this.queue.push(newPath);
      }
  }

  // 8. Dequeue, prosedur untuk menghapus elemen dari antrian prioritas
  // Ingat perlu mempertimbangkan prioritas
  dequeue () {
      if (this.isEmpty()) {
          return "PrioQueue kosong";
      } else {
          return this.queue.shift();
      }
  }
}

// Fungsi heuristics, untuk melakukan kalkulasi nilai h(n)
// Yaitu straight line distance dari simpul n ke finish
// Inspired by https://www.geeksforgeeks.org/program-distance-two-points-earth/
function heuristics (posList, final, initial) {
  // Mengambil informasi dari masukan
  // Posisi awal
  let lintang1 = posList[initial].lintang * Math.PI / 180;
  let bujur1 = posList[initial].bujur * Math.PI / 180;
  // Posisi akhir
  let lintang2 = posList[final].lintang * Math.PI / 180;
  let bujur2 = posList[final].bujur * Math.PI / 180;

  // Perhitungan
  let r = 6371
  let dLintang = lintang2 - lintang1
  let dBujur = bujur2 - bujur1

  // Haversine formula
  let a = Math.pow(Math.sin(dLintang / 2), 2)
          + Math.cos(lintang1) * Math.cos(lintang2)
          * Math.pow(Math.sin(dBujur / 2),2);
  let c = 2 * Math.asin(Math.sqrt(a));

  return r * c;
}

function isAStarDone (listActiveNode, finish) {
  let temp = false;
  for (var i = 0; i < listActiveNode.getLength(); i++) {
      if (listActiveNode.getElmt(i).currentPos == finish) {
          temp = true;
          finalPath = listActiveNode.getElmt(i);
          break;
      }
  }

  return temp;
}

function getExpand (position, adjMatrix, cek) {
  let expandNode = [];
  for (var i = 0; i < adjMatrix[0].length; i++) {
      if (adjMatrix[position - 1][i] != -1 && !cek.includes(i + 1)) {
          expandNode.push(i);
      }
  }

  return expandNode;
}

// Fungsi AStar, menjalankan algoritma A*
// prioritas berdasarkan f(n) = g(n) + h(n)
// dengan g(n) adalah jarak dari start ke n
// h(n) adalah straight line distance dari simpul n ke finish
function AStar (start, finish, adjMatrix, posList) {
  // Instansiasi simpul yang udah pernah kena ekspan
  let sudahdicek = [];
  sudahdicek.push(start);
  // Inisiasi posisi awal
  let current = start;
  // Membuat sebuah jalur awal, inisiasi peta
  let initialPath = new Path(current, 0, 0 + heuristics(posList, finish, start));
  // Memasukkan jalur awal ke antrian simpul aktif
  let listActiveNode = new PQ();
  listActiveNode.enqueue(initialPath);

  // Selama belum ada rute yang mencapai finish
  while (!isAStarDone(listActiveNode, finish)) {
      // Dequeue untuk ambil rute paling depan
      let Paths = listActiveNode.dequeue();
      // Ubah posisi titik analisis saat ini
      current = Paths.currentPos;
      if (!sudahdicek.includes(current)) {
        sudahdicek.push(current);
      }
      // Cari semua ekspan dari titik ini
      let expandNode = getExpand(current, adjMatrix, sudahdicek);
      for (var i = 0; i < expandNode.length; i++) {
          // Insiasi path baru yang ditambahkan rute sebelumnya
          gn = Paths.passedpath + adjMatrix[current - 1][expandNode[i]];
          hn = heuristics(posList, finish, expandNode[i] + 1);
          let newPath = new Path(expandNode[i] + 1, gn, gn + hn);
          newPath.copyPath(Paths);
          newPath.addPosition(expandNode[i] + 1);
          listActiveNode.enqueue(newPath);
      }
  }
}