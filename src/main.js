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
  path = AStar(initialPosition, finalPosition, adjMatrix, posList);
  
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

// Inisiasi konstanta tak hingga
// Fun-fact : jarak 2 titik terjauh di bumi 7590 km, jadi ga akan mungkin ada yang 10000
const INF = 10000; // dalam km

// Kelas Node, untuk inisiasi sebuah simpul yang akan dianalisis
class Node {
    // 1. Konstruktor
    constructor (nilai, priority) {
        this.nilai = nilai
        this.priority = priority
    }

    // 2. Getter nilai
    getNilai () {
        return this.nilai;
    }

    // 3. Getter priority
    getPrio () {
        return this.priority;
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

    // 6. Enquque, prosedur untuk menambahkan antrian
    // Ingat perlu juga untuk mempertimbangkan prioritas
    enqueue (nilai) {
        this.queue.push(nilai);
        // Melakukan pemrosesan pemasukan
        let idx = this.getLength() - 1
        while (idx > 0) {
            let predecessor = Math.floor((idx - 1)/2);
            if (this.getElmt(predecessor).getPrio() > this.getElmt(idx).getPrio()) {
                this.swap(idx, predecessor);
                idx = predecessor;
            } else {
                break;
            }
        }
        return this.queue;
    }

    // 7. Dequeue, prosedur untuk menghapus elemen dari antrian prioritas
    // Ingat perlu mempertimbangkan prioritas
    dequeue () {
        // Pop di js unik, jadi harus pindah ke depan
        const prio = this.getElmt(0).getPrio();
        this.swap(length - 1, 0);

        let value = this.queue.pop();
        // Perhatikan solusi pop
        if (this.getLength() > 1) {
            let predecessor = 0;
            while (idxswap !== null) {
                let leftPart = 2 * predecessor;
                let rightPart = 2 * predecessor;
                idxswap = null;
                // Penanganan untuk sisi partisi kiri
                if (leftPart < this.getLength()) {
                    if (this.getElmt(leftPart).getPrio() < prio) {
                        idxswap = leftPart;
                    }
                }

                // Penanganan untuk sisi partisi kanan
                if (rightPart < this.getLength()) {
                    if ((this.getElmt(rightPart).getPrio() < prio && idxswap === null) ||
                    (this.getElmt(rightPart).getPrio() < this.getElmt(leftPart).getPrio() && idxswap !== null)) {
                        idxswap = rightPart
                    }
                }

                // Kalo sudah tiada
                if (idxswap === null) {
                    break;
                }

                this.swap(idxswap, predecessor);
                predecessor = idxswap;
            }

            return value;
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

// Fungsi AStar, menjalankan algoritma A*
// prioritas berdasarkan f(n) = g(n) + h(n)
// dengan g(n) adalah jarak dari start ke n
// h(n) adalah straight line distance dari simpul n ke finish
function AStar (start, finish, adjMatrix, posList) {
    // Inisiasi
    gVals = new Map();          // Nilai g(n) dari semua simpul yang hidup
    pred = new Map();           // Simpul yang terhubung dengan n
    fVals = new Map();          // Nilai f(n), yaitu g(n) + h(n)
    listActiveNode = new PQ();  // Simpul aktif kemudian disimpan dalam PriorityQueue untuk diatur prioritasnya

    // Karena proses dimulai dari awal, maka jarak semua simpul dari start takhingga
    for (let i = 0; i < adjMatrix.length; i++) {
        gVals.set((i + 1).toString(), INF);
        fVals.set((i + 1).toString(), INF);
    }
    // Kecuali simpul awal
    gVals.set(start, 0);
    fVals.set(start, heuristics(posList, finish, start)); // fungsi heuristics blom dibuat
    console.log(gVals);
    console.log(fVals);

    // Simpul awal akan dimasukkan dalam antrian prioritas fVals
    listActiveNode.enqueue(new Node(start, 0 + heuristics(posList, finish, start)));

    // Selama masih ada simpul aktif
    console.log(listActiveNode.getLength());
    console.log(listActiveNode.getElmt(0));
    while (listActiveNode.getLength() != 0) {
        let current = listActiveNode.getElmt(0);

        // Kalo path sedang ada di simpul hidup, buat grafnya
        if (current.getNilai() == finish) {
            console.log("Masuk sini");
            let dist = gVals.get(current);
            let finalPath = [current];

            /* console.log(finalPath);
            console.log(dist); */

            // Proses rekonstruksi graf hasil
            while (pred.has(current)) {
                current = pred.get(current);
                finalPath.unshift(current); // unshift == insert first
            }

            // distance yang dikembalikan sudah pasti jarak total
            return [finalPath, dist];
        }
        listActiveNode.dequeue();

        // Jika tidak, maka siap untuk pemrosesan simpul
        // Pemrosesan dilakukan terhadap tetangganya
        let neighbors = adjMatrix[parseInt(current.getNilai()) - 1]
        console.log(neighbors);
        for (let i = 0; i < neighbors.length; i++) {
            // Kalo bertetangga
            console.log("Masuk sini2");
            if (neighbors[i] != -1) {
                let neighbor = (i + 1).toString();

                // Kalo g(n) lebih besar dari cost ke tetangga, switch ke tetangga
                let gValsNow = gVals.get(current.getNilai()) + neighbors[i];
                if (gValsNow < gVals.get(neighbor)) {
                    pred.set(neighbor, current.getNilai());
                    gVals.set(neighbor, gValsNow);
                    fVals.set(neighbor, gValsNow + heuristics(posList, finish, start));
                    listActiveNode.enqueue(new Node(neighbor, gValsNow + heuristics(posList, finish, start)));
                }
                console.log(gVals);
                console.log(fVals);
            }
        }
    }

    // Penanganan jika tidak ada jalur yang menghubungkan
    return [];
}