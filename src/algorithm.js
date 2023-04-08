/* File untuk melakukan pemrosesan terhadap simpul */
/* Berbagai deklarasi data akan dijabarkan disini */

// Kelas Route, untuk menyimpan peta yang sudah dilalui
class Route {
    // 1. Konstruktor
    constructor (currentPos) {
        this.listPath = [];
        this.currentPos = currentPos;
    }

    // 2. Getter listPath
    getListPath () {
        return this.listPath;
    }

    // 3. Getter currentPos
    getCurrentPos () {
        return this.currentPos;
    }

    // 4. Getter panjang rute
    getRouteLength () {
        return this.listPath.length;
    }

    // 5. Add new position to the path
    addPosition (pos) {
        this.listPath.push(pos);
        this.currentPos = pos;
    }
}

// Kelas Node, untuk inisiasi sebuah simpul yang akan dianalisis
class Path {
    // 1. Konstruktor
    constructor (route, priority) {
        this.route = route;
        this.priority = priority;
    }

    // 2. Getter nilai
    getRoute () {
        return this.route;
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

/**
 * @function isAStarDone 
 * @description Fungsi untuk mengecek apakah A* sudah selesai
 * @param {PQ} listActiveNode
 * @param {_} finish
 * @returns {boolean}
 */
function isAStarDone (listActiveNode, finish) {
    let temp = false;
    for (var i = 0; i < listActiveNode.getLength(); i++) {
        if (listActiveNode.getElmt(i).getRoute().getCurrentPos() == finish) {
            temp = true;
            finalPath = listActiveNode.getElmt(i);
            break;
        }
    }

    return temp;
}

/**
 * Fungsi untuk mendapatkan simpul yang akan diekspansi
 * 
 * @function getExpand
 * @param {int} position posisi simpul yang akan diekspansi
 * @param {int[][]} adjMatrix matriks adjacency
 * @param {int[]} expanded simpul yang sudah pernah diekspansi
 * @returns {int[]} simpul yang akan diekspansi
 */
function getExpand (position, adjMatrix, expanded) {
    let expandNode = [];
    for (var i = 0; i < adjMatrix[0].length; i++) {
        if (adjMatrix[position - 1][i] != -1 && !expanded.includes(adjMatrix[position - 1][i])) {
            expandNode.push(i);
        }
    }

    return expandNode;
}
/**
 * Fungsi AStar, menjalankan algoritma A*.
 * prioritas berdasarkan f(n) = g(n) + h(n)
 * dengan g(n) adalah jarak dari start ke n,
 * h(n) adalah straight line distance dari simpul n ke finish
 * 
 * @function AStar
 * @param {int} start simpul awal
 * @param {int} finish simpul akhir
 * @param {int[][]} adjMatrix matriks adjacency
 * @param {int[]} posList daftar posisi
 */
function AStar (start, finish, adjMatrix, posList) {
    // Instansiasi simpul yang udah pernah kena ekspan
    let expanded = [];
    expanded.push(start);
    // Inisiasi posisi awal
    let currentPos = start;
    // Memasukkan posisi awal ke rute baru
    let initialRoute = new Route();
    initialRoute.addPosition(currentPos);
    // Memasukkan rute baru ke jalur awal
    let initialPath = new Path(initialRoute, 0 + heuristics(posList, finish, start));
    // Memasukkan jalur awal ke antrian simpul aktif
    let listActiveNode = new PQ();
    listActiveNode.enqueue(initialPath);

    // Selama belum ada rute yang mencapai finish
    while (!isAStarDone(listActiveNode, finish)) {
        // Dequeue untuk ambil rute paling depan
        initialPath = listActiveNode.dequeue();
        // Ambil rute saat ini
        initialRoute = initialPath.getRoute();
        // Ubah posisi titik analisis saat ini
        currentPos = initialRoute.getCurrentPos();
        expanded.push(currentPos);
        // Cari semua ekspan dari titik ini
        let expandNode = getExpand(currentPos, adjMatrix, expanded);
        for (var i = 0; i < expandNode.length; i++) {
            // Instansiasi rute baru yang ditambahkan petak baru
            let newRoute = initialRoute;
            newRoute.addPosition(expandNode[i] + 1);
            // Insiasi path baru yang ditambahkan rute sebelumnya
            gn = adjMatrix[currentPos - 1][expandNode[i]];
            hn = heuristics(posList, finish, currentPos);
            let newPath = new Path(newRoute, gn + hn);
            listActiveNode.enqueue(newPath);
        }
    }
}


/**
 * Melakukan United Cost Search untuk mencari jalur terpendek dari start ke finish
 * prioritas berdasarkan g(n) = jarak dari start ke n
 * 
 * @function UCS : United Cost Search
 * @param {int} start simpul awal
 * @param {int} finish simpul akhir
 * @param {int[][]} adjMatrix matriks adjacency
 * @param {int[]} posList daftar posisi
 */
function UCS (start, finish, adjMatrix, posList) {
    // Inisiasi simpul yang udah pernah kena ekspan
    let expanded = [];
    // Inisiasi posisi awal
    let currentPos = start;
    // Inisiasi posisi awal ke rute baru
    let initialRoute = new Route();
    initialRoute.addPosition(currentPos);
    // Inisiasi rute baru ke jalur awal
    let initialPath = new Path(initialRoute, 0);
    // Inisiasi jalur awal ke antrian simpul aktif
    let listActiveNode = new PQ();
    listActiveNode.enqueue(initialPath);

    // Selama belum ada rute yang mencapai finish
    while (true) {
        // Dequeue untuk ambil rute paling depan
        initialPath = listActiveNode.dequeue();
        // Ambil rute saat ini
        initialRoute = initialPath.getRoute();
        // Ubah posisi titik analisis saat ini
        currentPos = initialRoute.getCurrentPos();
        expanded.push(currentPos);
        // Cek apakah sudah sampai finish
        if (currentPos == finish) {
            finalPath = initialPath;
            break;
        }
        // Cari semua ekspan dari titik ini
        let expandNode = getExpand(currentPos, adjMatrix, expanded);
        for (var i = 0; i < expandNode.length; i++) {
            // Instansiasi rute baru yang ditambahkan petak baru
            let newRoute = initialRoute;
            newRoute.addPosition(expandNode[i] + 1);
            // Insiasi path baru yang ditambahkan rute sebelumnya
            gn = adjMatrix[currentPos - 1][expandNode[i]];
            let newPath = new Path(newRoute, gn);
            listActiveNode.enqueue(newPath);
        }
    }
}