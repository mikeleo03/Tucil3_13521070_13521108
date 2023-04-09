/* File untuk melakukan pemrosesan terhadap data simpul */
/* Berbagai deklarasi data dan algoritma solusi akan dijabarkan disini */

/**
 * Kelas Path, untuk melakukan pemrosesan terkait data simpul analisis
 * 
 * @class Path
 * @property {Array} listPath - Array yang berisi simpul yang telah dilewati
 * @property {Number} currentPos - Simpul yang sedang diperiksa
 * @property {Number} passedpath - Jarak yang telah ditempuh
 * @property {Number} priority - Bobot dari simpul yang sedang diperiksa
 */
class Path {
    /**
     * @constructor Konstruktor kelas Path
     * @param {Number} currentPos 
     * @param {Number} passedpath
     * @param {Number} priority
     */
    constructor(currentPos, passedpath, priority) {
        this.listPath = [];
        this.currentPos = currentPos;
        this.passedpath = passedpath;
        this.priority = priority;
    }

    /**
     * @method copyPath - Mengcopy isi dari path lain ke path ini
     * @param {Path} paths
     */
    copyPath(paths) {
        for (var i = 0; i < paths.listPath.length; i++) {
            this.listPath.push(paths.listPath[i]);
        }
    }

    /**
     * @method getPrio - Getter bobot dari simpul yang sedang diperiksa
     * @returns {Number}
     */
    getPrio() {
        return this.priority;
    }

    /**
     * @method printPath
     * @returns {String} - Mengembalikan string yang berisi jalur yang telah ditempuh
     */
    printPath() {
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

    /**
     * @method addPosition - Menambahkan simpul yang telah dilewati
     * @param {Number} pos
     */
    addPosition(pos) {
        this.listPath.push(pos);
        this.currentPos = pos;
    }
}

// Kelas PQ berupa priorityqueue, untuk melakukan pemilihan simpul dengan bobot terkecil
/**
 * Kelas PQ, untuk melakukan pemilihan simpul dengan bobot terkecil
 * 
 * @class PQ
 * @property {Array} queue - Array yang berisi simpul yang telah dilewati
 */
class PQ {
    /**
     * @constructor
     */
    constructor() {
        this.queue = [];
    }

    /**
     * @method getLength - Getter panjang dari queue
     * @returns {Number}
     */
    getLength() {
        return this.queue.length;
    }

    /**
     * @method getElmt - Getter elemen queue pada indeks idx
     * @param {Number} idx
     * @returns {Path}
     */
    getElmt(idx) {
        return this.queue[idx];
    }

    /**
     * @method setElmt - Setter elemen queue pada indeks idx
     * @param {Number} idx
     * @param {Path} val
     */
    setElmt(idx, val) {
        this.queue[idx] = val;
    }

    // 5. Swap, untuk menukar posisi
    /**
     * @method swap - Menukar posisi elemen pada indeks pos1 dan pos2
     * @param {Path} pos1
     * @param {Path} pos2
     * @returns {PQ} 
     */
    swap(pos1, pos2) {
        let val = this.queue[pos1];
        this.setElmt(pos1, this.getElmt(pos2));
        this.setElmt(pos2, val);
        // Mengembalikan isi queue setelah ditukar
        return this.queue;
    }

    /**
     * @returns {Boolean} - Mengembalikan true jika queue kosong
     */
    isEmpty() {
        return (this.getLength() == 0);
    }

    /**
     * @method enqueue - Menambahkan elemen ke dalam queue
     * 
     * Ingat perlu mempertimbangkan prioritas
     * @param {Path} newPath
     */
    enqueue(newPath) {
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

    /**
     * @method dequeue - Menghapus elemen dengan bobot terkecil
     * 
     * Ingat perlu mempertimbangkan prioritas
     * @returns {Path} - Mengembalikan simpul dengan bobot terkecil
     */
    dequeue() {
        if (this.isEmpty()) {
            return "PrioQueue kosong";
        } else {
            return this.queue.shift();
        }
    }
}

/**
 * Fungsi heuristics, untuk melakukan kalkulasi nilai h(n)
 * Yaitu straight line distance dari simpul n ke finish
 * Inspired by https://www.geeksforgeeks.org/program-distance-two-points-earth/
 * 
 * @function heuristics
 * @param {Array} posList - Array yang berisi informasi posisi
 * @param {Number} final - Indeks posisi akhir
 * @param {Number} initial - Indeks posisi awal
 */
function heuristics(posList, final, initial) {
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
        * Math.pow(Math.sin(dBujur / 2), 2);
    let c = 2 * Math.asin(Math.sqrt(a));

    return r * c;
}

/**
 * Fungsi isAStarDone, untuk mengecek apakah simpul finish sudah ada di listActiveNode
 * 
 * @function isAStarDone
 * @param {PQ} listActiveNode - List simpul yang masih aktif
 * @param {Number} finish - Indeks posisi akhir
 * @returns {Boolean} - Mengembalikan true jika simpul finish sudah ada di listActiveNode
 */
function isAStarDone(listActiveNode, finish) {
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

/**
 * Fungsi getExpand, untuk mendapatkan simpul yang dapat di-expand
 * 
 * @function getExpand
 * @param {Number} position - Indeks posisi yang akan dicek
 * @param {Number[][]} adjMatrix - Matriks adjacency
 * @param {Number[]} cek - List simpul yang sudah dicek
 */
function getExpand(position, adjMatrix, cek) {
    let expandNode = [];
    for (var i = 0; i < adjMatrix[0].length; i++) {
        if (adjMatrix[position - 1][i] != -1 && !cek.includes(i + 1)) {
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
function AStar(start, finish, adjMatrix, posList) {
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