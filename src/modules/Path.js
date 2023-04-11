// File javascript tempat untuk mendeklarasikan tipe data Path
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