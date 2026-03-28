# Ular Tangga — Truth or Dare

Permainan papan ular tangga berbasis browser untuk dua pemain, dengan kartu Truth or Dare (bahasa Indonesia). Buka **`index.html`** langsung di browser — tidak perlu build atau server.

## Struktur

| File | Isi |
|------|-----|
| `index.html` | UI, overlay |
| `style.css` | Tema & layout |
| `game.js` | Logika permainan, audio, penyimpanan lokal |
| `challenges-romantis.js` | Bank tantangan mode Romantis (`window.CHALLENGES_ROMANTIS`) |
| `challenges-playful.js` | Mode Playful |
| `challenges-liar.js` | Mode Liar + kartu Berani |

## Menambah tantangan

1. Edit objek di file mode yang sesuai (`truth` / `dare` / `duo` / `berani` untuk Liar).
2. Gunakan placeholder `{AKU}` (pemain giliran) dan `{KAMU}` (pasangan).

Atau gunakan **Tantangan Kustom** dari layar awal — teks disimpan di perangkat dan muncul saat permainan.

## Mode santai

Centang **Mode santai saja** di layar awal untuk menyembunyikan mode Liar dan mengubah kotak Berani menjadi Dare biasa.

## Lisensi / tanggung jawab

Konten dewasa 17+. Tantangan bawaan dan kustom menjadi tanggung jawab pemain; gunakan hanya dalam konteks aman dan konsensual.
