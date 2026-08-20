/**
 * Trigonometry Math Engine & Helpers
 * Handles degree/radian conversions, special angle tables, clean step-by-step formula explanations,
 * and answer validation.
 */
const Trig = {
    degToRad(deg) {
        return (deg * Math.PI) / 180;
    },

    radToDeg(rad) {
        return (rad * 180) / Math.PI;
    },

    round(val, decimals = 2) {
        const factor = Math.pow(10, decimals);
        return Math.round(val * factor) / factor;
    },

    // Special angles lookup table
    specialAngles: {
        0: { sin: 0, cos: 1, tan: 0, sinStr: '0', cosStr: '1', tanStr: '0' },
        30: { sin: 0.5, cos: Math.sqrt(3)/2, tan: 1/Math.sqrt(3), sinStr: '½ (0.5)', cosStr: '½√3 (≈0.866)', tanStr: '⅓√3 (≈0.577)' },
        45: { sin: Math.sqrt(2)/2, cos: Math.sqrt(2)/2, tan: 1, sinStr: '½√2 (≈0.707)', cosStr: '½√2 (≈0.707)', tanStr: '1' },
        60: { sin: Math.sqrt(3)/2, cos: 0.5, tan: Math.sqrt(3), sinStr: '½√3 (≈0.866)', cosStr: '½ (0.5)', tanStr: '√3 (≈1.732)' },
        90: { sin: 1, cos: 0, tan: Infinity, sinStr: '1', cosStr: '0', tanStr: '∞ (Tak terdefinisi)' }
    },

    getSin(deg) {
        return Math.sin(this.degToRad(deg));
    },

    getCos(deg) {
        return Math.cos(this.degToRad(deg));
    },

    getTan(deg) {
        return Math.tan(this.degToRad(deg));
    },

    // Calculate height (depan) given rope (miring) & angle
    calculateHeight(ropeLength, angleDeg) {
        return ropeLength * this.getSin(angleDeg);
    },

    // Calculate rope length (miring) given height (depan) & angle
    calculateRopeLength(height, angleDeg) {
        const sinVal = this.getSin(angleDeg);
        if (sinVal === 0) return 0;
        return height / sinVal;
    },

    // Calculate horizontal distance (samping) given rope (miring) & angle
    calculateAdjacent(ropeLength, angleDeg) {
        return ropeLength * this.getCos(angleDeg);
    },

    // Calculate angle given height & rope length (arcsin)
    calculateAngleFromSin(height, ropeLength) {
        if (ropeLength === 0) return 0;
        const ratio = Math.min(1, Math.max(-1, height / ropeLength));
        return this.radToDeg(Math.asin(ratio));
    },

    // Calculate angle given height & base distance (arctan)
    calculateAngleFromTan(height, baseDist) {
        if (baseDist === 0) return 90;
        return this.radToDeg(Math.atan(height / baseDist));
    },

    // Validate user numeric input with tolerance
    validateAnswer(userVal, correctVal, tolerance = 0.25) {
        if (isNaN(userVal)) return false;
        const diff = Math.abs(userVal - correctVal);
        return diff <= tolerance || (correctVal !== 0 && (diff / Math.abs(correctVal)) <= 0.03);
    },

    /**
     * Generate step-by-step solution derivation in clean, easily readable HTML
     */
    generateExplanation(problem) {
        const { angle, rope, height, distance, targetVar } = problem;
        const steps = [];

        if (targetVar === 'height') {
            const sinVal = this.round(this.getSin(angle), 3);
            const res = this.round(rope * this.getSin(angle), 2);
            steps.push({
                label: '📌 Langkah 1: Catat Nilai yang Diketahui & Ditanyakan',
                text: `• <b>Panjang Tali Derek (r)</b> = <span style="color: #38bdf8; font-weight: bold;">${rope} m</span> (Sisi Miring)<br>• <b>Sudut Kemiringan (θ)</b> = <span style="color: #fbbf24; font-weight: bold;">${angle}°</span><br>• <b>Ditanyakan:</b> Tinggi Pengangkatan Beban (h) / Sisi Depan`
            });
            steps.push({
                label: '📐 Langkah 2: Pilih Rumus Trigonometri yang Sesuai',
                text: `Gunakan rumus <b>Sinus (Sindemi = Depan / Miring)</b>:<br><div class="math-box">sin(θ) = <sup>Tinggi (h)</sup>/<sub>Panjang Tali (r)</sub> &nbsp;➔&nbsp; <b>Tinggi (h) = r × sin(θ)</b></div>`
            });
            steps.push({
                label: '🧮 Langkah 3: Masukkan Angka dan Lakukan Perhitungan',
                text: `Tinggi (h) = ${rope} × sin(${angle}°)<br>Tinggi (h) = ${rope} × ${sinVal}<br><div class="result-highlight"><b>Hasil Akhir:</b> Tinggi Beban = <span class="highlight-val">${res} meter</span></div>`
            });
        } else if (targetVar === 'rope') {
            const sinVal = this.round(this.getSin(angle), 3);
            const res = this.round(height / this.getSin(angle), 2);
            steps.push({
                label: '📌 Langkah 1: Catat Nilai yang Diketahui & Ditanyakan',
                text: `• <b>Tinggi Target (h)</b> = <span style="color: #10b981; font-weight: bold;">${height} m</span> (Sisi Depan)<br>• <b>Sudut Derek (θ)</b> = <span style="color: #fbbf24; font-weight: bold;">${angle}°</span><br>• <b>Ditanyakan:</b> Panjang Tali Crane (r) / Sisi Miring`
            });
            steps.push({
                label: '📐 Langkah 2: Pilih Rumus Trigonometri yang Sesuai',
                text: `Gunakan rumus <b>Sinus (Sindemi)</b>:<br><div class="math-box">sin(θ) = <sup>Tinggi (h)</sup>/<sub>Panjang Tali (r)</sub> &nbsp;➔&nbsp; <b>Panjang Tali (r) = <sup>Tinggi (h)</sup>/<sub>sin(θ)</sub></b></div>`
            });
            steps.push({
                label: '🧮 Langkah 3: Masukkan Angka dan Lakukan Perhitungan',
                text: `Panjang Tali (r) = <sup>${height}</sup>/<sub>sin(${angle}°)</sub><br>Panjang Tali (r) = <sup>${height}</sup>/<sub>${sinVal}</sub><br><div class="result-highlight"><b>Hasil Akhir:</b> Panjang Tali = <span class="highlight-val">${res} meter</span></div>`
            });
        } else if (targetVar === 'distance') {
            const cosVal = this.round(this.getCos(angle), 3);
            const res = this.round(rope * this.getCos(angle), 2);
            steps.push({
                label: '📌 Langkah 1: Catat Nilai yang Diketahui & Ditanyakan',
                text: `• <b>Panjang Tali Derek (r)</b> = <span style="color: #38bdf8; font-weight: bold;">${rope} m</span> (Sisi Miring)<br>• <b>Sudut (θ)</b> = <span style="color: #fbbf24; font-weight: bold;">${angle}°</span><br>• <b>Ditanyakan:</b> Jarak Mendatar (x) / Sisi Samping`
            });
            steps.push({
                label: '📐 Langkah 2: Pilih Rumus Trigonometri yang Sesuai',
                text: `Gunakan rumus <b>Cosinus (Cossami = Samping / Miring)</b>:<br><div class="math-box">cos(θ) = <sup>Jarak (x)</sup>/<sub>Panjang Tali (r)</sub> &nbsp;➔&nbsp; <b>Jarak (x) = r × cos(θ)</b></div>`
            });
            steps.push({
                label: '🧮 Langkah 3: Masukkan Angka dan Lakukan Perhitungan',
                text: `Jarak (x) = ${rope} × cos(${angle}°)<br>Jarak (x) = ${rope} × ${cosVal}<br><div class="result-highlight"><b>Hasil Akhir:</b> Jarak Horizontal = <span class="highlight-val">${res} meter</span></div>`
            });
        } else if (targetVar === 'angle') {
            const ratio = height && rope ? this.round(height / rope, 3) : (height && distance ? this.round(height / distance, 3) : 0);
            const isSin = !!rope;
            const res = isSin ? this.round(this.calculateAngleFromSin(height, rope), 1) : this.round(this.calculateAngleFromTan(height, distance), 1);
            
            steps.push({
                label: '📌 Langkah 1: Catat Nilai yang Diketahui & Ditanyakan',
                text: isSin 
                    ? `• <b>Tinggi Angkat (h)</b> = <span style="color: #10b981; font-weight: bold;">${height} m</span> (Sisi Depan)<br>• <b>Panjang Tali (r)</b> = <span style="color: #38bdf8; font-weight: bold;">${rope} m</span> (Sisi Miring)<br>• <b>Ditanyakan:</b> Sudut Derek (θ)`
                    : `• <b>Tinggi (h)</b> = <span style="color: #10b981; font-weight: bold;">${height} m</span> (Sisi Depan)<br>• <b>Jarak (x)</b> = <span style="color: #c084fc; font-weight: bold;">${distance} m</span> (Sisi Samping)<br>• <b>Ditanyakan:</b> Sudut Derek (θ)`
            });
            steps.push({
                label: '📐 Langkah 2: Pilih Rumus Invers Trigonometri',
                text: isSin
                    ? `Gunakan perbandingan <b>Sinus</b>:<br><div class="math-box">sin(θ) = <sup>Tinggi (h)</sup>/<sub>Panjang Tali (r)</sub> = <sup>${height}</sup>/<sub>${rope}</sub> = <b>${ratio}</b></div>`
                    : `Gunakan perbandingan <b>Tangen</b>:<br><div class="math-box">tan(θ) = <sup>Tinggi (h)</sup>/<sub>Jarak (x)</sub> = <sup>${height}</sup>/<sub>${distance}</sub> = <b>${ratio}</b></div>`
            });
            steps.push({
                label: '🧮 Langkah 3: Cari Sudut yang Memiliki Nilai Tersebut',
                text: isSin
                    ? `Nilai sin(θ) = ${ratio}.<br>Berdasarkan tabel sudut istimewa, sudut yang memiliki nilai sin = ${ratio} adalah <b>${res}°</b>.<br><div class="result-highlight"><b>Hasil Akhir:</b> Sudut Derek (θ) = <span class="highlight-val">${res}°</span></div>`
                    : `Nilai tan(θ) = ${ratio}.<br>Berdasarkan tabel sudut istimewa, sudut yang memiliki nilai tan = ${ratio} adalah <b>${res}°</b>.<br><div class="result-highlight"><b>Hasil Akhir:</b> Sudut Derek (θ) = <span class="highlight-val">${res}°</span></div>`
            });
        }

        return steps;
    }
};

window.Trig = Trig;
