# 🏗️ Crane Challenge — Angkat Beban (Game Edukasi Trigonometri)

Sebuah game edukasi web interaktif berbasis HTML5 Canvas dan Web Audio API untuk mempelajari konsep trigonometri dasar (Sinus, Cosinus, Tangen, Sudut Istimewa, dan Invers Trigonometri) melalui simulasi realistis pengoperasian derek konstruksi (*Tower Crane*).

---

## 🎯 Gambaran Permainan & Konsep Trigonometri

Crane konstruksi membentuk segitiga siku-siku antara kabel pengangkat (*hipotenusa/miring*), tiang derek (*tinggi/depan*), dan tanah datar (*alas/samping*).

1. **Sinus (Sindemi)**:
   $$\sin(\theta) = \frac{\text{Depan (Tinggi)}}{\text{Miring (Tali)}} \implies \text{Tinggi} = \text{Panjang Tali} \times \sin(\theta)$$
2. **Cosinus (Cossami)**:
   $$\cos(\theta) = \frac{\text{Samping (Jarak)}}{\text{Miring (Tali)}} \implies \text{Jarak Horizontal} = \text{Panjang Tali} \times \cos(\theta)$$
3. **Tangen (Tandesa)**:
   $$\tan(\theta) = \frac{\text{Depan (Tinggi)}}{\text{Samping (Jarak)}} \implies \text{Tinggi} = \text{Jarak} \times \tan(\theta)$$
4. **Invers Trigonometri**:
   $$\theta = \arcsin\left(\frac{h}{r}\right) \quad \text{atau} \quad \theta = \arctan\left(\frac{h}{x}\right)$$

---

## ✨ Fitur-Fitur Utama

- 🎮 **12 Level Kurikulum Terstruktur**:
  - Level 1-3: Dasar Sinus (Menghitung tinggi angkat benda)
  - Level 4-6: Menentukan Panjang Tali yang Dibutuhkan
  - Level 7-8: Cosinus & Jarak Samping Horizontal Crane
  - Level 9: Rasio Tangen
  - Level 10-11: Mencari Sudut Derek (Invers Trigonometri)
  - Level 12: Tantangan Gedung Pencakar Langit
- 🔬 **Mode Sandbox Interaktif**:
  - Geser slider sudut elevasi ($\theta$) dan panjang tali derek ($r$) secara dinamis. Nilai $\sin, \cos, \tan$, tinggi, dan jarak samping langsung terhitung secara real-time pada segitiga siku-siku!
- ⚡ **Mode Time Attack (60 Detik)**:
  - Latihan cepat menyelesaikan soal acak dengan combo score.
- 📐 **Visual Overlay Segitiga Trigonometri**:
  - Garis Miring (Biru), Sisi Depan (Hijau), Sisi Samping (Ungu), Busur Sudut ($\theta$), dan tanda Siku-siku ($90^\circ$).
- 🧮 **Kalkulator Trigonometri Bawaan**:
  - Tombol $\sin, \cos, \tan, \sqrt{}, \div, \times$ untuk menghitung tanpa kalkulator fisik.
- 📖 **Cheatsheet & Tabel Sudut Istimewa**:
  - Panduan nilai $0^\circ, 30^\circ, 45^\circ, 60^\circ, 90^\circ$ (eksak akar dan desimal).
- 🔊 **Efek Suara Sintetis (Web Audio API)**:
  - Suara mesin derek, katrol kabel, denting sukses, dan buzzer peringatan tanpa file MP3 eksternal.

---

## 🚀 Cara Menjalankan Game

1. Buka file `index.html` langsung di browser web apa saja (Google Chrome, Microsoft Edge, Firefox, Safari).
   - Jalur lokal: `C:\Users\HP\.gemini\antigravity\scratch\crane-challenge\index.html`
2. Atau jalankan server lokal sederhana:
   ```bash
   # Menggunakan Python
   python -m http.server 8080
   # Buka http://localhost:8080 di browser
   ```

---

## 📁 Struktur File Proyek

```
crane-challenge/
├── index.html            # Antarmuka web utama
├── css/
│   └── styles.css        # Desain visual modern tema konstruksi
├── js/
│   ├── audio.js          # Web Audio API synthesizer
│   ├── trig.js           # Engine matematika & generator solusi
│   ├── renderer.js       # Engine grafis Canvas 2D
│   ├── levels.js         # Data 12 level edukasi
│   └── game.js           # Controller & logika alur game
└── README.md             # Dokumentasi proyek
```
