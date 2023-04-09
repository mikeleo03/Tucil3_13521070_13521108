// File javascript yang menjalankan fungsionalitas web
// Impor fungsi dari file algorithm

// Deklarasi variabel global yang akan digunakan pada saat eksekusi program
let maps;
let newNodecount = 0;
let finalPath = [];
let adjMatrix = [];
let posList = [];
let markers = [];
let lines = [];

// Berkaitan dengan setup awal web
window.onload = function() {
    // Intansiasi tidak menampilkan peta pada HTML
    document.getElementsByClassName('map')[0].style.display = 'block';
    maps = L.map('map').setView([0, 0], 1);

    // Memberikan instansiasi peta kosong
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(maps);

    // Penanganan terhadap penambahan simpul peta dengan event double klik
    // Melakukan disable pada double click dengan zoom
    maps.doubleClickZoom.disable();
    
    // Melakukan penambahan simpul dengan melakukan double click
    maps.on('dblclick', function(e) {
        // Melakukan penanganan terhadap marker yang digunakan pada peta
        let marker = L.marker(e.latlng, {draggable: 'true'});
        // Meminta nama simpul
        var nodeName = prompt("What is the node name?");  
        while (nodeName == "") {  
            var nodeName = prompt("What is the node name?"); 
        } 
        // Membuat sebuah simpul baru dalam JSON dengan data baru
        let newNode = {
            "id": (posList.length + 1).toString(), 
            "nama": nodeName, 
            "lintang": e.latlng.lat, 
            "bujur": e.latlng.lng};
        marker.id = newNode.id;                              // Memperbaharui ID Marker
        marker.bindPopup(`${newNode.id} - ${newNode.nama}`); // Melakukan penanganan popup menampilkan simpul
        maps.addLayer(marker);
        
        // Penanganan terhadap event dragend pada HTML
        marker.on('dragend', function() {
            // Merubah posisi sesuai koordinat akhir drag
            posList[marker.id - 1].lintang = marker.getLatLng().lat;
            posList[marker.id - 1].bujur = marker.getLatLng().lng;
            drawPathLine();         // Gambar ulang petak yang baru
            tablePathControl();     // Perbaharui nilai data simpul
        });
        
        // Memasukkan elemen baru pada variabel global
        markers.push(marker);
        posList.push(newNode);

        // Penanganan terhadap matriks ketetanggaan
        // Instansiasi matriks elemen baru, baris matriks ketetanggan
        let newRow = [];
        // Menambahkan elemen secara row-wise
        for (var i = 0; i < adjMatrix.length; i++) {
            adjMatrix[i].push(-1);      // instansiasi tidak terhubung
            newRow.push(-1);            // Menambah row baru dengan elemen -1 semua sebanyak kolom
        }
        // Menambah elemen column-wise
        newRow.push(0);             // Ingat, elemen baru pasti bertemu elemen baru
        adjMatrix.push(newRow);     // Menambahkan instansasi baris baru matriks ketetangaan

        // Tangani untuk masukan
        chooseNode();

        // Tambah jumlah simpul baru
        newNodecount += 1;
        return e;
    })
}

/**
 * Fungsi readFile, menjalankan mekanisme pembacaan file dengan masukan JSON
 * 
 * @function readFile
 */
function readFile () {
    // Menerima elemen yang dikirimkan dari id inputFile pada HTML
    let input = document.getElementById('inputFile');

    // Penanganan terhadap kasus ujung yang mungkin dimiliki masukan
    // Jika masukan belum terdefinisi, keluarkan alert
    if (!input.files[0]) {
        alert("Please select a file!");
    } 
    // Jika tidak, maka ambil nilai, baca file
    else {
        let file = input.files[0];
        let reader = new FileReader();
        reader.onload = initiateSearch; // Lakukan pembacaan dengan mengirim event
        reader.readAsText(file);        // Baca sebagai teks
    }

    // Instansiasi pembacaan file dengan JSON
    function initiateSearch (e) {
        // Informasi dari masukan
        infoParsed = JSON.parse(e.target.result.toString());
        // Menangkap nilai dari masukan JSON
        posList = infoParsed.posList;
        adjMatrix = infoParsed.adjMatrix;

        startMapSearch();   // Inisiasi penandaan posisi koordinat pada peta
        drawPathLine();     // Menggambar petak path
        tablePathControl(); // Menangani tabel daftar simpul dan jaraknya
        chooseNode();       // Melakukan penanganan terhadap pengisian simpul yang akan dijelajah
    }
}

/**
 * Fungsi startMapSearch, inisiasi melakukan ilustrasi
 * Dilakukan dengan "terbang" menuju lokasi lintang dan bujur koordinat pertama masukan
 * 
 * @function startMapSearch
 */
function startMapSearch (){
    // Tahap inisialisasi
    // Melakukan pembersihan terhadap layer peta yang mungkin sebelumnya diload
    for (var j = 0; j < markers.length; j++) {
        maps.removeLayer(markers[j]);
    }
    // Mengosongkan isi marker yang mungkin terisi dari sebelumnya
    markers = [];

    // Penampilan
    // Melakukan zoom-in ke lokasi koordinat pertam masukan, bilai perbesaran = 17
    maps.flyTo([parseFloat(posList[0].lintang), parseFloat(posList[0].bujur)], 17);

    // Melakukan pemosisisan terhadap kondisi peta setiap koordinat masukan
    let i = 1;
    // Melakukan parsing terhadap semua koordinat
    posList.forEach(function(info) {
        // Mendefinisikan isi marker dan id
        let marker = L.marker([parseFloat(info.lintang), parseFloat(info.bujur)], {draggable: 'true'});
        marker.id = i;
        i++;

        // Mendefisikan isi pop-up peta dan menambah layer ke peta
        marker.bindPopup(`${info.id} - ${info.nama}`);
        maps.addLayer(marker);

        // Melakukan penanganan terhadap event dragend dari HTML
        marker.on('dragend', function() {
            posList[marker.id - 1].lintang = marker.getLatLng().lat;
            posList[marker.id - 1].bujur = marker.getLatLng().lng;
            drawPathLine();
            tablePathControl();
        });

        // Menambah marker yang telah didefinisikan
        markers.push(marker);
    });
}

/**
 * Fungsi drawPathLine, menggambar "graf" pada peta
 * Pengambaran dilakukan dengan nilai marker yang menjadi masukan sebelumnya
 * 
 * @function drawPathLine
 */
function drawPathLine () {
    // Tahap inisialisasi
    // Melakukan pembersihan terhadap layer peta yang mungkin sebelumnya diload
    for(var i = 0; i < lines.length; i++) {
        maps.removeLayer(lines[i]);
    }
    // Mengosongkan isi lines yang mungkin terisi dari sebelumnya
    lines = [];

    // Melakukan traversal terhadap isi matriks ketetangaan
    for (var i = 0; i < adjMatrix.length; i++) {
        for (var j = 0; j < i; j++) {
            // Jika simpul memiliki relasi (tidak bernilai -1)
            if (adjMatrix[i][j] != -1) {
                // Mengambil nilai lintang dan bujur dari marker
                let latlons = [markers[i].getLatLng(), markers[j].getLatLng()];
                
                // Menggambar polyline untuk membuat graf pada peta (berwarna hijau)
                let line = L.polyline(latlons, {color: 'green'});
                // Melempar nilai ke peta untuk ditampilkan
                lines.push(line);
                maps.addLayer(line);
            }
        }
    }
}

/**
 * Fungsi tablePathControl, melakukan pengendalian terhadap nilai yang terdapat
 * pada tabel jarak antar simpul, melakukan penanganan juga terhadap event pergeseran simpul
 * 
 * @function tablePathControl
 */
function tablePathControl () {
    // Mengambil elemen id pada HTML untuk disimpan, inisiasi penampilan
    let tableContents = document.getElementById('pathContent');
    tableContents.innerHTML = '';

    // Membuat tabel list simpul dari masukan
    let count = 1;
    // Melakukan traversal terhadap isi matriks ketetangaan
    for (var i = 0; i < adjMatrix.length; i++) {
        for (var j = 0; j < i; j++) {
            // Jika simpul memiliki relasi (tidak bernilai -1)
            if (adjMatrix[i][j] != -1) {
                // Tambahkan data setiap simpul pada elemen id HTML yang ditangkap 
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

/**
 * Fungsi chooseNode, melakukan penanganan terhadap pilihan simpul yang akan dianalisis
 * dilakukan dengan melakukan traversal terhadap isi matriks ketetangaan
 * 
 * @function chooseNode
 */
function chooseNode () {
    // Instansiasi konstanta dengan mengemabil nilai elemen pada id HTML
    let pilAwal = document.getElementsByClassName('init-pos')[0];
    let pilAkhir = document.getElementsByClassName('final-pos')[0];
    let relAwal = document.getElementsByClassName('init-rels')[0];
    let relAkhir = document.getElementsByClassName('final-rels')[0];

    // Instansiasi elemen awal kosong tanpa pemilihan
    pilAwal.innerHTML = '';
    pilAkhir.innerHTML = '';
    relAwal.innerHTML = '';
    relAkhir.innerHTML = '';

    // Menambahkan nilai opsi untuk setiap id pada matriks ketetangaan
    for (var i = 0; i < adjMatrix.length; i++){
        pilAwal.innerHTML += `<option value="${i}">${(i + 1).toString()} - ${posList[i].nama}</option>`
        pilAkhir.innerHTML += `<option value="${i}">${(i + 1).toString()} - ${posList[i].nama}</option>`
        relAwal.innerHTML += `<option value="${i}">${(i + 1).toString()} - ${posList[i].nama}</option>`
        relAkhir.innerHTML += `<option value="${i}">${(i + 1).toString()} - ${posList[i].nama}</option>`
    }
}

/**
 * Fungsi addRelation, melakukan penambahan relasi antar simpul
 * Melakukan penanganan terhadap semua kasus penambahan simpul yang mungkin
 * 
 * @function addRelation
 */
function addRelation () {
    // Penanganan jika peta belum terload, sehingga belum ada data yang terbaca
    if (adjMatrix.length == 0 && posList.length == 0) {
        alert("You haven't load any map yet!");
    } else {
        // Ambil nilai dari masukan pengguna melalui elemen pada kelas di HTML
        let init_rels = document.getElementsByClassName('init-rels')[0].value;
        let final_rels = document.getElementsByClassName('final-rels')[0].value;
        
        // Penanganan kasus penambahan relasi
        // Tidak dapat menambah relasi pada simpul itu sendiri
        if (init_rels == final_rels) {
            alert("You can't add a relation to node itself");
        } 
        // Tidak bisa menambah relasi pada simpul yang seudah terhubung sebelumnya
        else if (adjMatrix[init_rels][final_rels] != -1) {
            alert("The relation already exist");
        }
        // Jika kasus sudah valid 
        else {
            // Gunakan fungsi heuristics untuk mengambil nilai jarak garis lurus
            let distance = heuristics(posList, parseInt(final_rels) + 1, parseInt(init_rels) + 1).toFixed(3);

            // Isi matriks ketetanggan dengan angka jarak
            adjMatrix[init_rels][final_rels] = Number(distance);
            adjMatrix[final_rels][init_rels] = Number(distance);

            // Melakukan penanganan terhadap nilai jarak simpul pada tabel dan tampilan peta
            tablePathControl();
            drawPathLine();
        }
    }
}

/**
 * Fungsi saveFile, melakukan penanganan terhadap opsi penyimpanan hasil
 * perubahan terhadap peta pada sebuah file JSON
 * 
 * @function saveFile
 */
function saveFile() {
    // Penanganan jika peta belum terload, sehingga belum ada data yang terbaca
    if (adjMatrix.length == 0 && posList.length == 0) {
        alert("You haven't load any map yet!");
    } else {
        // Instansiasi objek yang akan disimpan dalam JSON
        let saveObject = {posList: posList, adjMatrix: adjMatrix};

        // Melakukan konversi balik masukan ke JSON
        let dataHref = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(saveObject)); 
        let downloader = document.createElement('a');  // Membuat elemen instansiasi

        // Menyimpan file dalam default map.JSON
        downloader.setAttribute("href", dataHref);
        downloader.setAttribute("download", "map.json");
        downloader.click();
        downloader.remove();
    }
}

/**
 * Fungsi doAlgo, melakukan pemrosesan algoritma berdasarkan nilai flag masukan
 * 
 * @function UCS
 * @param {Number} flag - 1 untuk A*, 2 untuk UCS
 */
function doAlgo (flag) {
    // Inisialisasi
    // Jika sebelumnya telah terdefinisi sebuah peta solusi, ubah kembali menjadi warna hijau
    // Ilustrasikan dalam peta masukan
    if (finalPath.length != 0) {
        // Instansiasi objek perubahan nilai
        let pointPos = [];
        for(let i = 0; i < finalPath.listPath.length; i++) {
            pointPos.push(markers[finalPath.listPath[i] - 1].getLatLng());
        }

        // Gambar polyline berwarna hijau untuk "menghapus" petak sebelumnya
        let line = L.polyline(pointPos, {color: 'green'});
        lines.push(line);
        maps.addLayer(line);
    }
    // Kosongkan dulu isi finalPath sebelum proses selanjutnya
    finalPath = [];

    // Baru mulai proses
    // Validasi apakah peta sudah diload
    if (adjMatrix.length == 0 && posList.length == 0) {
        alert("You haven't load any map yet!");
    } else {
        // Inisiasi posisi
        initialPosition = document.getElementsByClassName('init-pos')[0].value;
        finalPosition = document.getElementsByClassName('final-pos')[0].value;

        if (flag == 1) {
        // Melakukan pemrosesan menggunakan A*
        AStar(parseInt(initialPosition) + 1, parseInt(finalPosition) + 1, adjMatrix, posList);
        } else {
        // Melakukan pemrosesan menggunakan UCS
        UCS(parseInt(initialPosition) + 1, parseInt(finalPosition) + 1, adjMatrix); 
        }
        // Mencetak hasil pada layar, lakukan pemrosesan pada kelas tertentu
        elmtPath = document.getElementsByClassName('path')[0];
        if (finalPath.length == 0) {
        // Jika panjang path kosong, maka tidak ada jalur
        elmtPath.innerHTML = '<p>Path not found!</p>';
        } else {
        // Jika ada, cetak path
        if (flag == 1) {
            elmtPath.innerHTML = `<h4>Result using A* Algorithm</h4>`;
            elmtPath.innerHTML += `<p>Path : ${finalPath.printPath()}     |     Distance : ${finalPath.getPrio().toFixed(3)} km</p>`;
        } else {
            elmtPath.innerHTML = `<h4>Result using UCS Algorithm</h4>`;  
            elmtPath.innerHTML += `<p>Path : ${finalPath.printPath()}     |     Distance : ${finalPath.getPrio().toFixed(3)} km</p>`;  
        }  

        // Ilustrasikan dalam peta masukan
        let pointPos = [];
        drawPathLine(); // jangan lupa redraw buat tiap ganti masukan
        for(let i = 0; i < finalPath.listPath.length; i++) {
            pointPos.push(markers[finalPath.listPath[i] - 1].getLatLng());
        }

        let line = L.polyline(pointPos, {color: 'red'});
        lines.push(line);
        maps.addLayer(line);
        }
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
        for (var i = 0; i < this.listPath.length; i++) {
            if (i != this.listPath.length - 1) {
            Path = Path + this.listPath[i] + " > ";
            } else {
            Path = Path + this.listPath[i];
            }
        }
        return Path;
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
    let lintang1 = posList[initial - 1].lintang * Math.PI / 180;
    let bujur1 = posList[initial - 1].bujur * Math.PI / 180;
    // Posisi akhir
    let lintang2 = posList[final - 1].lintang * Math.PI / 180;
    let bujur2 = posList[final - 1].bujur * Math.PI / 180;

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

// Untuk mengecek apakah simpul terubung atau tidak
function isNodeNotConnected (expandNode, sudahdicek, adjMatrix, newNodecount) {
    console.log(expandNode);
    console.log(sudahdicek);
    console.log(adjMatrix);
    console.log(newNodecount);
    return expandNode.length == 0 && 
    ((adjMatrix.length == sudahdicek.length + 1 || adjMatrix.length <= sudahdicek.length + newNodecount)
    || sudahdicek.length == 1);
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
    initialPath.listPath.push(current);
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
        console.log(current);
        let expandNode = getExpand(current, adjMatrix, sudahdicek);
        if (isNodeNotConnected(expandNode, sudahdicek, adjMatrix, newNodecount)) {
            alert("There's no path to that node");
            break;
        } else {
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
}

/**
 * Fungsi UCS, menjalankan algoritma UCS.
 * 
 * @function UCS
 * @param {Number} start - posisi awal
 * @param {Number} finish - posisi akhir
 * @param {Number[][]} adjMatrix - matriks adjacency
 */
function UCS(start, finish, adjMatrix) {
    // Instansiasi simpul yang udah pernah kena ekspan
    let sudahdicek = [];
    sudahdicek.push(start);
    // Inisiasi posisi awal
    let current = start;
    // Membuat sebuah jalur awal, inisiasi peta
    let initialPath = new Path(current, 0, 0);
    initialPath.listPath.push(current);
    // Memasukkan jalur awal ke antrian simpul aktif
    let listActiveNode = new PQ();
    listActiveNode.enqueue(initialPath);

    // Selama belum ada rute yang mencapai finish
    while (true) {
        // Dequeue untuk ambil rute paling depan
        let Paths = listActiveNode.dequeue();
        // Ubah posisi titik analisis saat ini
        current = Paths.currentPos;
        if (!sudahdicek.includes(current)) {
            sudahdicek.push(current);
        }
        // Cek apakah sudah sampai finish
        if (current == finish) {
            finalPath = Paths;
            break;
        }
        // Cari semua ekspan dari titik ini
        let expandNode = getExpand(current, adjMatrix, sudahdicek);
        if (expandNode.length == 0 && (adjMatrix.length <= sudahdicek.length + newNodecount || sudahdicek.length == 1)) {
            alert("There's no path to that node");
            break;
        } else {
            for (var i = 0; i < expandNode.length; i++) {
                // Insiasi path baru yang ditambahkan rute sebelumnya
                gn = Paths.passedpath + adjMatrix[current - 1][expandNode[i]];
                let newPath = new Path(expandNode[i] + 1, gn, gn);
                newPath.copyPath(Paths);
                newPath.addPosition(expandNode[i] + 1);
                listActiveNode.enqueue(newPath);
            }
        }
    }
}