# TUBES IAE Kelompok 2 - SI4703

Project ini adalah aplikasi Microservice untuk Medihub (Admin & Pharmacy) yang menggunakan **Node.js**, **Express**, **GraphQL**, dan **MySQL**.

## Prasyarat (Prerequisites)

Orang lain yang ingin menjalankan project ini hanya perlu menginstall:

1.  **Docker Desktop**: [Download disini](https://www.docker.com/products/docker-desktop/)
    *   Pastikan Docker sudah berjalan (Running).

## Cara Menjalankan (How to Run)

1.  Buka terminal (CMD / PowerShell / Terminal) di dalam folder project ini.
2.  Jalankan perintah berikut:

    ```bash
    docker-compose up --build
    ```

    *   *Perintah ini akan mendownload MySQL, menginstall semua library, dan menjalankan aplikasi secara otomatis.*

3.  Tunggu sampai muncul tulisan di terminal:
    *   `✅ Database berhasil tersinkronisasi`
    *   `Service admin berjalan di...`

## Akses Aplikasi

Setelah berhasil dijalankan, buka browser dan akses link berikut:

*   **Web Admin**: http://localhost:4003/
*   **Web Farmasi**: http://localhost:4004/
*   **GraphQL Playground Admin**: http://localhost:4003/graphql
*   **GraphQL Playground Farmasi**: http://localhost:4004/graphql

## Cara Reset / Mematikan

Jika ingin mematikan aplikasi atau mereset database ke awal:

1.  Tekan `Ctrl + C` di terminal untuk stop.
2.  Jalankan perintah ini untuk menghapus container dan data lama:
    ```bash
    docker-compose down --volumes
    ```

## Melihat Isi Database (Cek Data)

Karena database ada di dalam Docker, Anda bisa mengecek isinya dengan 2 cara:

## Melihat Isi Database (Cek Data)

Database `tugas_medihub` dipakai bersama oleh Admin dan Farmasi.

**Cek Data Admin (Pasien & Dokter):**
```bash
docker exec -it mysql-db mysql -uroot -proot -D tugas_medihub -e "SELECT * FROM Patients; SELECT * FROM Doctors;"
```

**Cek Data Farmasi (Obat):**
```bash
docker exec -it mysql-db mysql -uroot -proot -D tugas_medihub -e "SELECT * FROM Medicines;"
```

**Atau Pakai Aplikasi Database (DBeaver / TablePlus)**
*   **Host**: localhost
*   **Port**: 3306
*   **Username**: root
*   **Password**: root
*   **Database**: tugas_medihub

## Contoh Pengujian GraphQL (Sesuai Syarat)

Berikut adalah kode yang bisa Anda copy-paste ke GraphQL Playground untuk memenuhi syarat:
*   **Skema Modular**: (Sudah terpenuhi di kodingan, karena kita pisah `typeDefs` dan `resolvers`).
*   **Kueri (Query)**: Minimal 1.
*   **Mutasi (Mutation)**: Minimal 2.

### 1. ADMIN SERVICE (http://localhost:4003/graphql)

**Mutation 1: Register Dokter**
```graphql
mutation {
  createDoctor(
    name: "Dr. Boyke",
    specialization: "Kandungan",
    phone: "081111111",
    email: "boyke@rs.com"
  ) {
    id
    name
    specialization
  }
}
```

**Mutation 2: Register Pasien**
```graphql
mutation {
  createPatient(
    name: "Ahmad Dani",
    age: 45,
    gender: "Laki-laki",
    address: "Pondok Indah",
    phone: "082222222",
    disease: "Pusing"
  ) {
    id
    name
  }
}
```

**Query 1: Lihat Semua Dokter**
```graphql
query {
  doctors {
    id
    name
    specialization
  }
}
```

### 2. PHARMACY SERVICE (http://localhost:4004/graphql)

**Mutation 1: Tambah Obat (Untuk Pasien ID 1)**
*(Pastikan Pasien ID 1 sudah dibuat di Admin)*
```graphql
mutation {
  createMedicine(
    patient_id: 1,
    name: "Amoxicillin",
    dosage: "500mg",
    instructions: "3x1 Habiskan",
    status: "Pending",
    notes: "Antibiotik"
  ) {
    id
    name
    status
  }
}
```

**Mutation 2: Update Status Obat (Misal ID 1)**
```graphql
mutation {
  updateMedicine(
    id: 1,
    status: "Completed"
  ) {
    id
    name
    status
  }
}
```

**Query 1: Lihat Semua Obat**
```graphql
query {
  medicines {
    id
    name
    patient {
      name
    }
  }
}
```
