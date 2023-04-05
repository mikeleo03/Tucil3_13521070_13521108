/* File untuk melakukan pemrosesan terhadap node */
/* Berbagai deklarasi data akan dijabarkan disini */

// Kelas Node, untuk inisiasi sebuah simpul yang akan dianalisis
class Node {
    // 1. Konstruktor
    constructor(nilai, priority) {
        this.nilai = nilai
        this.priority = priority
    }
}

// Kelas PQ berupa priorityqueue, untuk melakukan pemilihan node dengan bobot terkecil
class PQ {
    // 1. Konstruktor
    constructor() {
        this.queue = [];
    }

    // 2. Swap, untuk menukar posisi
    swap(pos1, pos2) {
        let val = this.queue[pos1];
        this.queue[pos1] = this.queue[pos2];
        this.queue[pos2] = val;
        // Mengembalikan isi queue setelah ditukar
        return this.queue;
    }

    // 3. Enquque, prosedur untuk menambahkan antrian
    // Ingat perlu juga untuk mempertimbangkan prioritas
    enqueue(nilai) {
        this.queue.push(nilai);
        // Melakukan pemrosesan pemasukan
        let idx = this.queue.length - 1
        while(idx > 0) {
            let predecessor = Math.floor((idx - 1)/2);
            if (this.queue[predecessor].priority > this.queue[idx].priority) {
                this.swap(idx, predecessor);
                idx = predecessor;
            } else {
                break;
            }
        }
        return this.queue;
    }

    // 4. Dequeue, prosedur untuk menghapus elemen dari antrian prioritas
    // Ingat perlu mempertimbangkan prioritas
    dequeue() {
        // Pop di js unik, jadi harus pindah ke depan
        const length = this.queue.length;
        const prio = this.queue[0].priority;
        this.swap(length - 1, 0);

        let value = this.queue.pop();
        // Perhatikan solusi pop
        if (this.queue.length > 1) {
            let predecessor = 0;
            while (idxswap !== null) {
                let leftPart = 2 * predecessor;
                let rightPart = 2 * predecessor;
                idxswap = null;
                // Penanganan untuk sisi partisi kiri
                if (leftPart < length) {
                    if (this.queue[leftPart].priority < prio) {
                        idxswap = leftPart;
                    }
                }

                // Penanganan untuk sisi partisi kanan
                if (rightPart < length) {
                    if ((this.queue[rightPart].priority < prio && idxswap === null) ||
                    (this.queue[rightPart].priority < this.queue[leftPart].priority && idxswap !== null)) {
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