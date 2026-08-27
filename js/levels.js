/**
 * Level definitions for Crane Challenge (12 progressive curriculum levels)
 * All options have consistent and uniform formatting.
 */
const GAME_LEVELS = [
    {
        id: 1,
        title: "Level 1: Dasar Sinus (Sindemi)",
        category: "sin",
        cargoType: "crate",
        cargoWeight: "1.5 Ton",
        story: "Proyek Pergudangan: Derek crane harus mengangkat kotak peralatan konstruksi ke lantai 2.",
        question: "Tali crane panjangnya <b>10 m</b> dan membentuk sudut kemiringan (θ) <b>30°</b> terhadap tanah. Berapakah tinggi benda yang terangkat?",
        targetVar: "height",
        rope: 10,
        angle: 30,
        height: null,
        correctAnswer: 5,
        unit: "m",
        options: [
            { text: "5.0 m", value: 5, correct: true },
            { text: "8.66 m", value: 8.66, correct: false },
            { text: "7.07 m", value: 7.07, correct: false },
            { text: "10.0 m", value: 10, correct: false }
        ],
        hint: "Gunakan rumus <b>Sindemi</b> (Sinus = Depan / Miring):<br>Tinggi = Tali × sin(30°).<br>Nilai sin(30°) = 0.5."
    },
    {
        id: 2,
        title: "Level 2: Balok Baja Sudut 45°",
        category: "sin",
        cargoType: "steel",
        cargoWeight: "3.0 Ton",
        story: "Pembangunan Jembatan: Balok baja perlu diangkat ke rangka pilar penyangga.",
        question: "Tali derek memiliki panjang <b>14 m</b> dengan sudut kemiringan (θ) <b>45°</b>. Berapa tinggi balok baja saat terangkat penuh?",
        targetVar: "height",
        rope: 14,
        angle: 45,
        height: null,
        correctAnswer: 9.9,
        unit: "m",
        options: [
            { text: "7.0 m", value: 7.0, correct: false },
            { text: "9.9 m", value: 9.9, correct: true },
            { text: "12.1 m", value: 12.1, correct: false },
            { text: "14.0 m", value: 14.0, correct: false }
        ],
        hint: "Gunakan rumus: Tinggi = Tali × sin(45°).<br>Nilai sin(45°) = ½√2 ≈ 0.707."
    },
    {
        id: 3,
        title: "Level 3: Sudut Curam 60°",
        category: "sin",
        cargoType: "concrete",
        cargoWeight: "4.5 Ton",
        story: "Pondasi Gedung: Blok beton berat dinaikkan dengan sudut boom crane yang lebih tegak.",
        question: "Tali crane panjangnya <b>12 m</b> membentuk sudut kemiringan (θ) <b>60°</b> dengan tanah. Tentukan tinggi pengangkatan beban!",
        targetVar: "height",
        rope: 12,
        angle: 60,
        height: null,
        correctAnswer: 10.39,
        unit: "m",
        options: [
            { text: "6.0 m", value: 6.0, correct: false },
            { text: "8.48 m", value: 8.48, correct: false },
            { text: "10.39 m", value: 10.39, correct: true },
            { text: "11.5 m", value: 11.5, correct: false }
        ],
        hint: "Gunakan rumus: Tinggi = Tali × sin(60°).<br>Nilai sin(60°) = ½√3 ≈ 0.866."
    },
    {
        id: 4,
        title: "Level 4: Menentukan Panjang Tali (Sudut 30°)",
        category: "sin",
        cargoType: "container",
        cargoWeight: "5.0 Ton",
        story: "Pelabuhan Peti Kemas: Kontainer harus diangkat tepat setinggi 6 meter ke atas kapal kargo.",
        question: "Jika target tinggi adalah <b>6 m</b> dan sudut kemiringan tali (θ) ditetapkan <b>30°</b>, berapa meter panjang tali crane yang harus diulur?",
        targetVar: "rope",
        height: 6,
        angle: 30,
        rope: null,
        correctAnswer: 12,
        unit: "m",
        options: [
            { text: "3.0 m", value: 3.0, correct: false },
            { text: "8.48 m", value: 8.48, correct: false },
            { text: "12.0 m", value: 12.0, correct: true },
            { text: "15.0 m", value: 15.0, correct: false }
        ],
        hint: "Rumus: sin(θ) = Tinggi / Tali, maka:<br>Panjang Tali = Tinggi / sin(30°) = 6 / 0.5."
    },
    {
        id: 5,
        title: "Level 5: Menentukan Panjang Tali (Sudut 45°)",
        category: "sin",
        cargoType: "steel",
        cargoWeight: "4.0 Ton",
        story: "Pusat Industri: Pipa baja raksasa diangkat ke platform setinggi 10 meter.",
        question: "Target tinggi angkat adalah <b>10 m</b> pada sudut kemiringan (θ) <b>45°</b>. Berapa panjang tali miring yang dibutuhkan?",
        targetVar: "rope",
        height: 10,
        angle: 45,
        rope: null,
        correctAnswer: 14.14,
        unit: "m",
        options: [
            { text: "10.0 m", value: 10.0, correct: false },
            { text: "14.14 m", value: 14.14, correct: true },
            { text: "17.32 m", value: 17.32, correct: false },
            { text: "20.0 m", value: 20.0, correct: false }
        ],
        hint: "Panjang Tali = Tinggi / sin(45°) = 10 / 0.707 = 10√2 ≈ 14.14 m."
    },
    {
        id: 6,
        title: "Level 6: Menentukan Panjang Tali (Sudut 60°)",
        category: "sin",
        cargoType: "turbine",
        cargoWeight: "6.0 Ton",
        story: "Pembangkit Listrik: Komponen turbin harus ditempatkan pada dudukan setinggi 15 meter.",
        question: "Tinggi platform adalah <b>15 m</b> dengan sudut crane (θ) <b>60°</b>. Berapakah panjang tali yang diperlukan?",
        targetVar: "rope",
        height: 15,
        angle: 60,
        rope: null,
        correctAnswer: 17.32,
        unit: "m",
        options: [
            { text: "15.0 m", value: 15.0, correct: false },
            { text: "17.32 m", value: 17.32, correct: true },
            { text: "21.21 m", value: 21.21, correct: false },
            { text: "30.0 m", value: 30.0, correct: false }
        ],
        hint: "Panjang Tali = 15 / sin(60°) = 15 / 0.866 ≈ 17.32 m."
    },
    {
        id: 7,
        title: "Level 7: Jarak Horizontal (Cosinus / Cossami)",
        category: "cos",
        cargoType: "container",
        cargoWeight: "3.5 Ton",
        story: "Logistik Area Sempit: Operator harus memastikan jarak horizontal aman dari dasar tiang crane.",
        question: "Tali crane sepanjang <b>20 m</b> membentuk sudut (θ) <b>60°</b> terhadap tanah. Berapakah jarak horizontal (samping) dari pangkal crane ke posisi beban?",
        targetVar: "distance",
        rope: 20,
        angle: 60,
        distance: null,
        correctAnswer: 10,
        unit: "m",
        options: [
            { text: "10.0 m", value: 10.0, correct: true },
            { text: "14.14 m", value: 14.14, correct: false },
            { text: "17.32 m", value: 17.32, correct: false },
            { text: "20.0 m", value: 20.0, correct: false }
        ],
        hint: "Gunakan rumus <b>Cossami</b> (Cosinus = Samping / Miring):<br>Jarak Horizontal = Tali × cos(60°).<br>Nilai cos(60°) = 0.5."
    },
    {
        id: 8,
        title: "Level 8: Jangkauan Samping Sudut 30°",
        category: "cos",
        cargoType: "concrete",
        cargoWeight: "5.5 Ton",
        story: "Konstruksi Dermaga: Mengulur beban menjauh melintasi bibir dermaga.",
        question: "Tali derek berukuran <b>16 m</b> dengan sudut (θ) <b>30°</b>. Berapa jarak mendatar (horizontal) yang dicapai beban?",
        targetVar: "distance",
        rope: 16,
        angle: 30,
        distance: null,
        correctAnswer: 13.86,
        unit: "m",
        options: [
            { text: "8.0 m", value: 8.0, correct: false },
            { text: "11.31 m", value: 11.31, correct: false },
            { text: "13.86 m", value: 13.86, correct: true },
            { text: "16.0 m", value: 16.0, correct: false }
        ],
        hint: "Jarak Horizontal = 16 × cos(30°) = 16 × 0.866 ≈ 13.86 m."
    },
    {
        id: 9,
        title: "Level 9: Rasio Tangen (Tandesa)",
        category: "tan",
        cargoType: "crate",
        cargoWeight: "2.0 Ton",
        story: "Pusat Kota: Mengangkat muatan ke atap gedung yang memiliki tinggi 12 m dan jarak mendatar 12 m dari crane.",
        question: "Jika tinggi gedung <b>12 m</b> dan jarak horizontal <b>12 m</b>, berapakah sudut elevasi (θ) crane yang diperlukan?",
        targetVar: "angle",
        height: 12,
        distance: 12,
        rope: 16.97,
        angle: null,
        correctAnswer: 45,
        unit: "°",
        options: [
            { text: "30°", value: 30, correct: false },
            { text: "45°", value: 45, correct: true },
            { text: "60°", value: 60, correct: false },
            { text: "90°", value: 90, correct: false }
        ],
        hint: "Gunakan rumus <b>Tandesa</b>: tan(θ) = Depan / Samping = 12 / 12 = 1.<br>Sudut istimewa dengan tan(θ) = 1 adalah 45°."
    },
    {
        id: 10,
        title: "Level 10: Invers Sinus (Mencari Sudut Crane)",
        category: "inv",
        cargoType: "steel",
        cargoWeight: "4.2 Ton",
        story: "Pabrik Perakitan: Beban harus naik setinggi 8 meter menggunakan panjang tali 16 meter.",
        question: "Tinggi angkat adalah <b>8 m</b> dan panjang tali crane adalah <b>16 m</b>. Berapakah sudut kemiringan derek (θ)?",
        targetVar: "angle",
        height: 8,
        rope: 16,
        angle: null,
        correctAnswer: 30,
        unit: "°",
        options: [
            { text: "30°", value: 30, correct: true },
            { text: "45°", value: 45, correct: false },
            { text: "60°", value: 60, correct: false },
            { text: "75°", value: 75, correct: false }
        ],
        hint: "sin(θ) = Depan / Miring = 8 / 16 = 0.5.<br>Sudut dengan nilai sin = 0.5 adalah 30°."
    },
    {
        id: 11,
        title: "Level 11: Sudut Khusus 60° (Invers Sinus)",
        category: "inv",
        cargoType: "turbine",
        cargoWeight: "7.0 Ton",
        story: "Menara Telekomunikasi: Mengangkat antena parabola ke menara.",
        question: "Tali crane sepanjang <b>20 m</b> harus mengangkat muatan hingga ketinggian <b>17.32 m</b>. Tentukan sudut elevasi (θ) yang harus diatur!",
        targetVar: "angle",
        height: 17.32,
        rope: 20,
        angle: null,
        correctAnswer: 60,
        unit: "°",
        options: [
            { text: "30°", value: 30, correct: false },
            { text: "45°", value: 45, correct: false },
            { text: "60°", value: 60, correct: true },
            { text: "75°", value: 75, correct: false }
        ],
        hint: "sin(θ) = 17.32 / 20 = 0.866.<br>Sudut istimewa dengan sin = 0.866 (½√3) adalah 60°."
    },
    {
        id: 12,
        title: "Level 12: Master Crane Challenge (Gedung Pencakar Langit)",
        category: "master",
        cargoType: "container",
        cargoWeight: "10.0 Ton",
        story: "Megastruktur Sky Tower: Tantangan puncak! Derek harus menaikkan material konstruksi ke dek observasi.",
        question: "Ketinggian target adalah <b>24 m</b> dan sudut crane diatur pada (θ) <b>60°</b>. Berapakah panjang kabel derek (tali miring) yang harus disediakan operator?",
        targetVar: "rope",
        height: 24,
        angle: 60,
        rope: null,
        correctAnswer: 27.71,
        unit: "m",
        options: [
            { text: "24.0 m", value: 24.0, correct: false },
            { text: "27.71 m", value: 27.71, correct: true },
            { text: "33.94 m", value: 33.94, correct: false },
            { text: "48.0 m", value: 48.0, correct: false }
        ],
        hint: "Panjang Tali = 24 / sin(60°) = 24 / 0.866 ≈ 27.71 m."
    }
];

window.GAME_LEVELS = GAME_LEVELS;
