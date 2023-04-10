// File javascript tempat dideklarasikan struktur data yang digunakan
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
     * @method copyPath - Melakukan penyalinan isi dari jalur lain ke jalur ini
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
     * @returns {String} - Mengembalikan string yang berisi jalur yang menjadi masukan
     */
    printPath() {
        let Path = "";
        // Melakukan iterasi terhadap semua komponen penyusun jalur
        for (var i = 0; i < this.listPath.length; i++) {
            if (i != this.listPath.length - 1) {
                Path = Path + this.listPath[i] + " > ";
            } else {
                Path = Path + this.listPath[i];
            }
        }

        // Mengembalikan string hasil konversi jalur masukan
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

/**
 * Kelas PQ, untuk melakukan pemilihan simpul dengan bobot terkecil
 * Direpresentasikan sebagai antrain prioritas (PrioQueue)
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
     * Ingat perlu mempertimbangkan prioritas pada saat menambahkan elemen
     * 
     * @param {Path} newPath
     */
    enqueue(newPath) {
        var check = false; // Booelan validasi
        // Menemukan lokasi yang tepat untuk insert
        for (var i = 0; i < this.getLength(); i++) {
            if (this.getElmt(i).getPrio() > newPath.getPrio()) {
                // Menemukan lokasi yang tepat, masukkan elemen
                this.queue.splice(i, 0, newPath);
                check = true;
                break;
            }
        }

        // Kalo ternyata semua elemen pada antrian lebih kecil dari masukan
        // Maka tambahkan di akhir
        if (!check) {
            this.queue.push(newPath);
        }
    }

    /**
     * @method dequeue - Menghapus elemen pertama dengan bobot terkecil dalam antrian
     * 
     * @returns {Path} - Mengembalikan simpul dengan bobot terkecil
     */
    dequeue() {
        // Melakukan pengecekan apakah antrian kosong
        if (this.isEmpty()) {
            return "PrioQueue kosong";
        } else {
            return this.queue.shift();
        }
    }
}