// File javascript yang menjalankan fungsionalitas algoritma
/**
 * Fungsi heuristics, untuk melakukan kalkulasi nilai h(n)
 * Yaitu straight line distance dari simpul n ke finish
 * Proses perhitungan dilakukan menggunakan Persamaan Haversine
 * 
 * @function heuristics
 * @param {Array} posList - Array yang berisi informasi posisi simpul
 * @param {Number} final - Indeks simpul tujuan 
 * @param {Number} initial - Indeks simpul awal
 */
function heuristics (posList, final, initial) {
    // Mengambil informasi dari masukan
    // Simpul awal
    let lintang1 = posList[initial - 1].lintang * Math.PI / 180;
    let bujur1 = posList[initial - 1].bujur * Math.PI / 180;
    // Simpul tujuan
    let lintang2 = posList[final - 1].lintang * Math.PI / 180;
    let bujur2 = posList[final - 1].bujur * Math.PI / 180;

    // Perhitungan inisiasi
    let r = 6371
    let dLintang = lintang2 - lintang1
    let dBujur = bujur2 - bujur1

    // Perhitungan dengan Persamaan Haversine
    let a = Math.pow(Math.sin(dLintang / 2), 2)
            + Math.cos(lintang1) * Math.cos(lintang2)
            * Math.pow(Math.sin(dBujur / 2),2);
    let c = 2 * Math.asin(Math.sqrt(a));

    return r * c;
}

/**
 * Fungsi isAStarDone, untuk mengecek apakah proses pencarian A* sudah selesai dilaksanakan
 * Simpul tujuan yang sedang dianalisis sudah ada di listActiveNode
 * 
 * @function isAStarDone
 * @param {PQ} listActiveNode - List simpul yang masih aktif
 * @param {Number} finish - Simpul tujuan
 * @returns {Boolean} - Mengembalikan true jika simpul finish sudah ada di listActiveNode
 */
function isAStarDone (listActiveNode, finish) {
    // Inisiasi nilai
    let temp = false;
    // Melakukan traversal terhadap isi antrian
    for (var i = 0; i < listActiveNode.getLength(); i++) {
        // Jika sudah ada yang membuat simpul tujuan
        if (listActiveNode.getElmt(i).currentPos == finish) {
            temp = true;                            // Ubah nilai kiriman
            finalPath = listActiveNode.getElmt(i);  // Masukan dalam jalur solusi akhir
            break;                                  // Selesaikan pencarian
        }
    }

    // Kembalikan kondisi akhir pencarian kondisi pada antrian
    return temp;
}

/**
 * Fungsi getExpand, untuk mendapatkan simpul jelajah berdasarkan titik saat ini
 * 
 * @function getExpand
 * @param {Number} position - Simpul saat ini yang akan dicek
 * @param {Number[][]} adjMatrix - Matriks ketetanggaan yang telah terdefinisi
 * @param {Number[]} cek - Senarai simpul yang sudah pernah dianalisis
 * @returns {Number[]} - ID dari simpul jelajah
 */
function getExpand (position, adjMatrix, cek) {
    // Inisiasi senarai penampung simpul jelajah
    let expandNode = [];
    // Melakukan traversal terhadap isi matriks ketetanggaan
    for (var i = 0; i < adjMatrix[0].length; i++) {
        // Jika terdapat relasi simpul dan belum pernah dijelajahi
        if (adjMatrix[position - 1][i] != -1 && !cek.includes(i + 1)) {
            // Tambahkan dalam daftar simpul jelajah
            expandNode.push(i);
        }
    }

    // Kembalikan daftar simpul jelajah
    return expandNode;
}

/**
 * Fungsi AStar, menjalankan algoritma A*.
 * prioritas berdasarkan f(n) = g(n) + h(n)
 * dengan g(n) adalah jarak dari simpul awal ke simpul n,
 * h(n) adalah jarak garis lurus dari simpul n ke ke simpul tujuan
 * 
 * @function AStar
 * @param {Number} start simpul awal
 * @param {Number} finish simpul tujuan
 * @param {Number[][]} adjMatrix matriks ketetanggaan
 * @param {Number[]} posList daftar posisi
 */
function AStar (start, finish, adjMatrix, posList) {
    // Instansiasi simpul yang udah pernah dijelajahi
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
        // hapus dan ambil rute paling depan dari antrian prioritas
        let Paths = listActiveNode.dequeue();
        // Ubah posisi titik analisis saat ini
        current = Paths.currentPos;
        if (!sudahdicek.includes(current)) {
            sudahdicek.push(current);
        }

        // Cari semua simpul jelajah dari titik saat ini
        let expandNode = getExpand(current, adjMatrix, sudahdicek);
        // Jika simpul tidak lagi memiliki ekspan karena tidak terhubung dengan tujuan
        if (expandNode.length == 0 && listActiveNode.isEmpty()) {
            // Keluarkan tanggapan dan keluar dari kalang
            alert("There's no path to that node");
            break;
        } else {
            // Jika tidak, lakukan iterasi terhadap semua simpul jelajah
            for (var i = 0; i < expandNode.length; i++) {
                // Inisiasi path baru yang ditambahkan rute sebelumnya
                // Ambil nilai gn dan hn
                gn = Paths.passedpath + adjMatrix[current - 1][expandNode[i]];
                hn = heuristics(posList, finish, expandNode[i] + 1);
                
                // Buat sebuah jalur baru
                let newPath = new Path(expandNode[i] + 1, gn, gn + hn);
                // Salin nilai jalur sebelumnya
                newPath.copyPath(Paths);
                // Tambahkan simpul ekspan dalam jalur baru
                newPath.addPosition(expandNode[i] + 1);
                // Masukkan jalur baru dalam antrian prioritas
                listActiveNode.enqueue(newPath);
            }
        }
    }
}

/**
 * Fungsi UCS, menjalankan algoritma UCS.
 * prioritas berdasarkan g(n)
 * dengan g(n) adalah jarak dari simpul awal ke simpul n
 * 
 * @function UCS
 * @param {Number} start - simpul awal
 * @param {Number} finish - simpul tujuan
 * @param {Number[][]} adjMatrix - matriks ketetanggaan
 */
function UCS(start, finish, adjMatrix) {
    // Instansiasi simpul yang udah pernah dijelajahi
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
        // Jika tidak ada jalur yang tersedia || semua sudah di cek
        if (listActiveNode.isEmpty()) {
            alert("There's no path to that node");
            break;
        }

        // hapus dan ambil rute paling depan dari antrian prioritas
        let Paths = listActiveNode.dequeue();
        // Ubah posisi titik analisis saat ini
        current = Paths.currentPos;
        if (!sudahdicek.includes(current)) {
            sudahdicek.push(current);
        }

        // Jika sudah mencapai tujuan, keluarkan jalur
        if(current == finish) {
            finalPath = Paths;
            break;
        }

        // Cari semua simpul jelajah dari titik saat ini
        let expandNode = getExpand(current, adjMatrix, sudahdicek);

        // lakukan iterasi terhadap semua simpul jelajah
        for (var i = 0; i < expandNode.length; i++) {
            // Inisiasi path baru yang ditambahkan rute sebelumnya
            // Ambil nilai gn dan
            gn = Paths.passedpath + adjMatrix[current - 1][expandNode[i]];
            
            // Buat sebuah jalur baru
            let newPath = new Path(expandNode[i] + 1, gn, gn)
            // Salin nilai jalur sebelumnya
            newPath.copyPath(Paths);
            // Tambahkan simpul ekspan dalam jalur baru
            newPath.addPosition(expandNode[i] + 1);
            // Masukkan jalur baru dalam antrian prioritas
            listActiveNode.enqueue(newPath);
        }
    }
}