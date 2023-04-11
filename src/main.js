// File javascript yang menjalankan fungsionalitas web
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
        
        while (nodeName === "") {
            var nodeName = prompt("What is the node name? (name cannot be empty)"); 
        }

        // Pengguna mengklik tombol cancel
        if (nodeName === null) return;

        // Membuat sebuah simpul baru dalam JSON dengan data baru
        let newNode = {
            "id": (posList.length + 1).toString(), 
            "nama": nodeName, 
            "lintang": e.latlng.lat, 
            "bujur": e.latlng.lng};
        marker.id = newNode.id;
        // Memperbaharui ID Marker
        const popUpContent = 
            `<div class="popup-content">
                <p>${newNode.id} - ${newNode.nama}</p>
                <input type="button" class="delete-button" value="Delete Node" onclick="deleteNode(${newNode.id});">
            </div>`;
        marker.bindPopup(popUpContent); // Melakukan penanganan popup menampilkan simpul
        maps.addLayer(marker);
        
        // Penanganan terhadap event dragend pada HTML
        marker.on('dragend', function() {
            // Ambil nilai lintang dan bujur, perbaharui
            posList[marker.id - 1].lintang = marker.getLatLng().lat;
            posList[marker.id - 1].bujur = marker.getLatLng().lng;
            // Mengganti nilai matriks ketetangaan
            for (var i = 0; i < adjMatrix.length; i++) {
                if (adjMatrix[i][marker.id - 1] != -1) {
                    let distance = heuristics(posList, i + 1, marker.id).toFixed(3)
                    // Perbaharui nilai jaraknya
                    adjMatrix[i][marker.id - 1] = Number(distance);
                    adjMatrix[marker.id - 1][i] = Number(distance);
                }
            }
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
        let value = e.target.result;
        // Melakukan berbagai skema validasi
        try {
            // Validasi apakah file masukan kosong
            if (value === "") {
                throw "Your file input is empty! ";
            }
            // Proses informasi berdasar JSON
            infoParsed = JSON.parse(value.toString());
            // Menangkap nilai dari masukan JSON
            posList = infoParsed.posList;
            adjMatrix = infoParsed.adjMatrix;

            // Validasi apakah masukan sesuai dengan format
            if (posList === null) {
                throw "`posList` value is not defined! ";
            } else if (adjMatrix === null) {
                throw "`adjMatrix` value is not defined! ";
            } 

            // Validasi terhadap isi file
            // Jumlah elemen posList dan adjMatrix beda
            if (posList.length != adjMatrix.length) {
                throw "There's might be inconsistency between the `posList` and `adjMatrix` data! ";
            }

            // Isi posList
            for (var i = 0; i < posList.length; i++) {
                if (posList[i].id === "" || posList[i].id === null) {
                    throw "There's ID value in `posList` that not well defined! ";
                } else if (typeof posList[i].lintang !== "number" || typeof posList[i].bujur !== "number") {
                    throw "There's lintang or bujur value in `posList` that not well defined! ";
                }
            }

            // Isi adjMatrix
            for (var i = 0; i < adjMatrix.length; i++) {
                // Cek apakah jumlah kolom dari setiap baris sama
                if (adjMatrix.length != adjMatrix[i].length) {
                    throw "The number of row and column in `AdjMatrix` is different! ";
                }
                // Uji isi matriks ketetanggaan
                for (var j = 0; j < adjMatrix.length; j++) {
                    if (i === j && adjMatrix[i][j] !== 0) {
                        throw "The same node must be connected to one another! ";
                    } else if (adjMatrix[i][j] !== adjMatrix[j][i]) {
                        throw "There must be inconsistency value for distance in `adjMatrix`! ";
                    }
                }
            }

            // Jika sampai pada tahap ini, maka peta yang terbaca sudah pasti valid
            startMapSearch();   // Inisiasi penandaan posisi koordinat pada peta
            drawPathLine();     // Menggambar petak path
            tablePathControl(); // Menangani tabel daftar simpul dan jaraknya
            chooseNode();       // Melakukan penanganan terhadap pengisian simpul yang akan dijelajah

        } catch (err) {
            if (err instanceof SyntaxError) {
                alert("There's syntax error in your input, Please check your file!");
            } else if (err instanceof TypeError) {
                alert("Your input might not in array, Please check your file!");
            } else {
                alert(err + "Please check your file");
            }
        }
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
    // Melakukan zoom-in ke lokasi koordinat pertam masukan, nilai perbesaran = 16
    maps.flyTo([parseFloat(posList[0].lintang), parseFloat(posList[0].bujur)], 16);

    // Melakukan pemosisisan terhadap kondisi peta setiap koordinat masukan
    let i = 1;
    // Melakukan parsing terhadap semua koordinat
    posList.forEach (function(info) {
        // Mendefinisikan isi marker dan id
        let marker = L.marker([parseFloat(info.lintang), parseFloat(info.bujur)], {draggable: 'true'});
        marker.id = i;
        i++;

        // Mendefisikan isi pop-up peta dan menambah layer ke peta
        const popUpContent = 
            `<div class="popup-content">
                <p>${info.id} - ${info.nama}</p>
                <input type="button" class="delete-button" value="Delete Node" onclick="deleteNode(${info.id});">
            </div>`;
        marker.bindPopup(popUpContent); // Melakukan penanganan popup menampilkan simpul
        maps.addLayer(marker);

        // Melakukan penanganan terhadap event dragend dari HTML
        marker.on('dragend', function() {
            // Ambil nilai lintang dan bujur, perbaharui
            posList[marker.id - 1].lintang = marker.getLatLng().lat;
            posList[marker.id - 1].bujur = marker.getLatLng().lng;
            // Mengganti nilai matriks ketetangaan
            for (var i = 0; i < adjMatrix.length; i++) {
                if (adjMatrix[i][marker.id - 1] != -1) {
                    let distance = heuristics(posList, i + 1, marker.id).toFixed(3)
                    // Perbaharui nilai jaraknya
                    adjMatrix[i][marker.id - 1] = Number(distance);
                    adjMatrix[marker.id - 1][i] = Number(distance);
                }
            }
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
        pilAwal.innerHTML += `<option value="${i}">${posList[i].id} - ${posList[i].nama}</option>`
        pilAkhir.innerHTML += `<option value="${i}">${posList[i].id} - ${posList[i].nama}</option>`
        relAwal.innerHTML += `<option value="${i}">${posList[i].id} - ${posList[i].nama}</option>`
        relAkhir.innerHTML += `<option value="${i}">${posList[i].id} - ${posList[i].nama}</option>`
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
    if (adjMatrix.length === 0 && posList.length === 0) {
        alert("You haven't load any map yet!");
    } else {
        // Ambil nilai dari masukan pengguna melalui elemen pada kelas di HTML
        let init_rels = document.getElementsByClassName('init-rels')[0].value;
        let final_rels = document.getElementsByClassName('final-rels')[0].value;
        
        // Penanganan kasus penambahan relasi
        // Tidak dapat menambah relasi pada simpul itu sendiri
        if (init_rels === final_rels) {
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
 * Fungsi deleteNode, melakukan penghapussan simpul dengan id tertentu
 * Melakukan pembaharuan terhadap nilai posList dan adjMatrix
 * 
 * @function deleteNode
 */
function deleteNode (NodeID) {
    var index = -1; // Inisiasi kosong
    // Melakukan pencarian index melalui data ID
    posList.find (function (item, i) { 
        if (item.id === NodeID.toString()) {
            index = i;
            return i;
        }
    });

    // Menghapus isi poslist dengan id terkait
    posList.splice(index, 1);
    // Menghapus baris pada adjMatrix
    adjMatrix.splice(index, 1);
    // Menghapus semua baris yang berhubungan dengan simpul ini
    for (var i = 0; i < adjMatrix.length; i++) {
        adjMatrix[i].splice(index, 1);
    }

    // Layering pada peta
    maps.removeLayer(markers[index]);
    markers.splice(index, 1);

    // Melakukan update pada kondisi peta
    drawPathLine();     // Menggambar petak path
    tablePathControl(); // Menangani tabel daftar simpul dan jaraknya
    chooseNode();       // Melakukan penanganan terhadap pengisian simpul yang akan dijelajah
}

/**
 * Fungsi saveFile, melakukan penanganan terhadap opsi penyimpanan hasil
 * perubahan terhadap peta pada sebuah file JSON
 * 
 * @function saveFile
 */
function saveFile() {
    // Penanganan jika peta belum terload, sehingga belum ada data yang terbaca
    if (adjMatrix.length === 0 && posList.length === 0) {
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
 * @function doAlgo
 * @param {Number} flag - 1 untuk A*, 2 untuk UCS
 */
function doAlgo (flag) {
    // Inisialisasi
    // Jika sebelumnya telah terdefinisi sebuah peta solusi, ubah kembali menjadi warna hijau
    // Ilustrasikan dalam peta masukan
    // Kosongkan dulu isi finalPath sebelum proses selanjutnya
    finalPath = [];

    // Pemrosesan algoritma
    // Penanganan jika peta belum terload, sehingga belum ada data yang terbaca
    if (adjMatrix.length === 0 && posList.length === 0) {
        alert("You haven't load any map yet!");
    } else {
        // Inisiasi posisi, mengambil nilai posisi awal dan akhir dari HTML
        initialPosition = document.getElementsByClassName('init-pos')[0].value;
        finalPosition = document.getElementsByClassName('final-pos')[0].value;

        // Pemrosesan berdasarkan flag masukan
        if (flag === 1) {
            // Melakukan pemrosesan menggunakan A*
            AStar(parseInt(initialPosition) + 1, parseInt(finalPosition) + 1, adjMatrix, posList);
        } else {
            // Melakukan pemrosesan menggunakan UCS
            UCS(parseInt(initialPosition) + 1, parseInt(finalPosition) + 1, adjMatrix); 
        }

        // Mencetak hasil pada layar, lakukan pemrosesan pada kelas tertentu di HTML
        elmtPath = document.getElementsByClassName('path')[0];

        // Penanganan terhadap seluruh kemungkinan penampilan grafik
        if (finalPath.length === 0) {
            // Jika panjang path kosong, maka tidak ada jalur
            elmtPath.innerHTML = '<p>Path not found!</p>';
        } else {
            // Jika ada, cetak path
            if (flag === 1) {
                // Cetak sebagai hasil algoritma A*
                elmtPath.innerHTML = `<h4>Result using A* Algorithm</h4>`;
                elmtPath.innerHTML += `<p>Path : ${finalPath.printPath()}     |     Distance : ${finalPath.getPrio().toFixed(3)} km</p>`;
            } else {
                // Cetak sebagai hasil algoritma UCS
                elmtPath.innerHTML = `<h4>Result using UCS Algorithm</h4>`;  
                elmtPath.innerHTML += `<p>Path : ${finalPath.printPath()}     |     Distance : ${finalPath.getPrio().toFixed(3)} km</p>`;  
            }  

            // Ilustrasikan dalam peta masukan
            let pointPos = [];
            // Lakukan redraw untuk setiap peta masukan
            drawPathLine();
            // Instansiasi objek perubahan nilai
            for(let i = 0; i < finalPath.listPath.length; i++) {
                pointPos.push(markers[finalPath.listPath[i] - 1].getLatLng());
            }

            // Buat sebuah polyline berdasarkan hasil pemrosesan algoritma dengan marker merah
            // Menandakan solusi pencarian
            let line = L.polyline(pointPos, {color: 'red'});
            // Lempar hasil ke peta untuk ditampilkan
            lines.push(line);
            maps.addLayer(line);
        }
    }
}