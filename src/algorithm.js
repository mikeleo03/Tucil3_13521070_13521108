/* File untuk melakukan pemrosesan terhadap simpul */
/* Berbagai deklarasi data akan dijabarkan disini */

// Inisiasi konstanta tak hingga
// Fun-fact : jarak 2 titik terjauh di bumi 7590 km, jadi ga akan mungkin ada yang 10000
const INF = 10000; // dalam km

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
}

// Kelas Node, untuk inisiasi sebuah simpul yang akan dianalisis
class Path {
    // 1. Konstruktor
    constructor (priority) {
        this.route = new Route();
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
            return "Queue kosong";
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

    // Simpul awal akan dimasukkan dalam antrian prioritas fVals
    listActiveNode.enqueue(new Node(start, 0 + heuristics(posList, finish, start)));

    // Selama masih ada simpul aktif
    while (listActiveNode.getLength() > 0) {
        let current = listActiveNode.getElmt(0);

        // Kalo path sedang ada di simpul hidup, buat grafnya
        if (current.getNilai() == finish) {
            let dist = gVals.get(current);
            let finalPath = [current];

            // Proses rekonstruksi graf hasil
            while (pred.has(current)) {
                current = pred.get(current);
                finalPath.unshift(current); // unshift == insert first
            }

            // distance yang dikembalikan sudah pasti jarak total
            return [finalPath, dist];
        }

        // Jika tidak, maka siap untuk pemrosesan simpul
        // Pemrosesan dilakukan terhadap tetangganya
        let neighbors = parseInt(current.getNilai()) - 1
        for (let i = 0; i < neighbor.length; i++) {
            // Kalo bertetangga
            if (neighbors[i] == 1) {
                let neighbor = (i + 1).toString();

                // Kalo g(n) lebih besar dari cost ke tetangga, switch ke tetangga
                let gValsNow = gVals.get(current.getNilai()) + adjMatrix[neighbors][i];
                if (gValsNow < gVals.get(neighbor)) {
                    pred.set(neighbor, current.getNilai());
                    gVals.set(neighbor, gValsNow);
                    fVals.set(neighbor, gValsNow + heuristics(posList, finish, start));
                    listActiveNode.enqueue(new Node(neighbor, gValsNow + heuristics(posList, finish, start)));
                }
            }
        }
    }

    // Penanganan jika tidak ada jalur yang menghubungkan
    return [];
}