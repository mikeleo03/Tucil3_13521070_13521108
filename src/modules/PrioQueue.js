// File javascript tempat untuk mendeklarasikan tipe data PrioQueue
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
    constructor () {
        this.queue = [];
    }

    /**
     * @method getLength - Getter panjang dari queue
     * @returns {Number}
     */
    getLength () {
        return this.queue.length;
    }

    /**
     * @method getElmt - Getter elemen queue pada indeks idx
     * @param {Number} idx
     * @returns {Path}
     */
    getElmt (idx) {
        return this.queue[idx];
    }

    /**
     * @method setElmt - Setter elemen queue pada indeks idx
     * @param {Number} idx
     * @param {Path} val
     */
    setElmt (idx, val) {
        this.queue[idx] = val;
    }

    /**
     * @method swap - Menukar posisi elemen pada indeks pos1 dan pos2
     * @param {Path} pos1
     * @param {Path} pos2
     * @returns {PQ} 
     */
    swap (pos1, pos2) {
        let val = this.queue[pos1];
        this.setElmt(pos1, this.getElmt(pos2));
        this.setElmt(pos2, val);
        // Mengembalikan isi queue setelah ditukar
        return this.queue;
    }

    /**
     * @returns {Boolean} - Mengembalikan true jika queue kosong
     */
    isEmpty () {
        return (this.getLength() == 0);
    }

    /**
     * @method enqueue - Menambahkan elemen ke dalam queue
     * Ingat perlu mempertimbangkan prioritas pada saat menambahkan elemen
     * 
     * @param {Path} newPath
     */
    enqueue (newPath) {
        var check = false; // Boolean validasi
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
    dequeue () {
        // Melakukan pengecekan apakah antrian kosong
        if (this.isEmpty()) {
            return "PrioQueue is empty";
        } else {
            return this.queue.shift();
        }
    }
}