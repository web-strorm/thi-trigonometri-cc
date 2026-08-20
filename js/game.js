/**
 * Main Game Controller for Crane Challenge
 */
class CraneGame {
    constructor() {
        this.mode = 'campaign'; // 'campaign' | 'sandbox' | 'timeattack'
        this.currentLevelIndex = 0;
        this.score = 0;
        this.combo = 1;
        this.maxCombo = 1;
        this.levelStars = JSON.parse(localStorage.getItem('crane_stars') || '{}');
        this.highScore = parseInt(localStorage.getItem('crane_highscore') || '0', 10);
        
        // Time attack
        this.timeRemaining = 60;
        this.timerInterval = null;
        this.timeAttackSolved = 0;
        
        // Active problem
        this.currentProblem = null;
        this.inputMode = 'choice'; // 'choice' or 'direct'
        
        // Renderer & Audio
        this.renderer = new CraneRenderer('gameCanvas');
        this.sound = window.soundEngine;
        
        // Loop
        this.lastTime = performance.now();
        this.initUI();
        this.bindEvents();
        this.loadLevel(this.currentLevelIndex);
        
        requestAnimationFrame((t) => this.gameLoop(t));
    }

    initUI() {
        this.updateHeaderStats();
        this.renderLevelSelectModal();
        this.renderSpecialAnglesTable();
    }

    bindEvents() {
        // Navigation / Tabs
        document.getElementById('btnModeCampaign').addEventListener('click', () => this.switchMode('campaign'));
        document.getElementById('btnModeSandbox').addEventListener('click', () => this.switchMode('sandbox'));
        document.getElementById('btnModeTimeAttack').addEventListener('click', () => this.switchMode('timeattack'));
        
        // Sound toggle
        const btnMute = document.getElementById('btnToggleSound');
        btnMute.addEventListener('click', () => {
            const isMuted = this.sound.toggleMute();
            btnMute.innerHTML = isMuted ? '🔇 Bisu' : '🔊 Suara';
        });

        // Overlay Toggle
        const btnOverlay = document.getElementById('btnToggleOverlay');
        btnOverlay.addEventListener('click', () => {
            this.renderer.showTriangleOverlay = !this.renderer.showTriangleOverlay;
            btnOverlay.classList.toggle('active', this.renderer.showTriangleOverlay);
        });

        // Modals
        document.getElementById('btnCheatsheet').addEventListener('click', () => this.openModal('cheatsheetModal'));
        document.getElementById('btnCloseCheatsheet').addEventListener('click', () => this.closeModal('cheatsheetModal'));
        
        document.getElementById('btnLevelSelect').addEventListener('click', () => {
            this.renderLevelSelectModal();
            this.openModal('levelSelectModal');
        });
        document.getElementById('btnCloseLevelSelect').addEventListener('click', () => this.closeModal('levelSelectModal'));

        document.getElementById('btnCloseExplanation').addEventListener('click', () => this.closeModal('explanationModal'));
        document.getElementById('btnShowHint').addEventListener('click', () => this.showHint());
        document.getElementById('btnShowExplanation').addEventListener('click', () => this.showStepByStep());

        // Input type toggle (Pilihan Ganda vs Input Angka)
        document.getElementById('btnModeChoice').addEventListener('click', () => this.setInputMode('choice'));
        document.getElementById('btnModeDirect').addEventListener('click', () => this.setInputMode('direct'));

        // Direct answer submission
        document.getElementById('btnSubmitDirect').addEventListener('click', () => this.submitDirectAnswer());
        document.getElementById('directInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.submitDirectAnswer();
        });

        // Next level button on celebration dialog
        document.getElementById('btnNextLevel').addEventListener('click', () => {
            this.closeModal('resultModal');
            if (this.currentLevelIndex < GAME_LEVELS.length - 1) {
                this.loadLevel(this.currentLevelIndex + 1);
            } else {
                this.switchMode('campaign');
                this.loadLevel(0);
            }
        });
        document.getElementById('btnRetryLevel').addEventListener('click', () => {
            this.closeModal('resultModal');
            this.loadLevel(this.currentLevelIndex);
        });

        // Sandbox Sliders
        const angleSlider = document.getElementById('sandboxAngle');
        const ropeSlider = document.getElementById('sandboxRope');
        
        const updateSandbox = () => {
            if (this.mode !== 'sandbox') return;
            const angle = parseFloat(angleSlider.value);
            const rope = parseFloat(ropeSlider.value);
            
            document.getElementById('sandboxAngleVal').textContent = angle + '°';
            document.getElementById('sandboxRopeVal').textContent = rope + ' m';
            
            const height = Trig.calculateHeight(rope, angle);
            const dist = Trig.calculateAdjacent(rope, angle);
            
            document.getElementById('sandboxHeightVal').textContent = Trig.round(height, 2) + ' m';
            document.getElementById('sandboxDistVal').textContent = Trig.round(dist, 2) + ' m';
            document.getElementById('sandboxSinVal').textContent = Trig.round(Trig.getSin(angle), 3);
            document.getElementById('sandboxCosVal').textContent = Trig.round(Trig.getCos(angle), 3);
            document.getElementById('sandboxTanVal').textContent = Trig.round(Trig.getTan(angle), 3);
            
            this.renderer.setProblemData({
                angle: angle,
                rope: rope,
                height: height,
                distance: dist,
                cargoType: 'container',
                cargoWeight: '3.0 Ton',
                targetVar: null
            });
        };

        if (angleSlider && ropeSlider) {
            angleSlider.addEventListener('input', updateSandbox);
            ropeSlider.addEventListener('input', updateSandbox);
            document.getElementById('btnSandboxLift').addEventListener('click', () => {
                this.sound.startWinchSound();
                this.renderer.isLifting = true;
                this.renderer.hookProgress = 0;
            });
        }

        // Time Attack Start Button
        document.getElementById('btnStartTimeAttack').addEventListener('click', () => this.startTimeAttack());

        // Virtual Calculator Buttons
        this.bindCalculator();
    }

    bindCalculator() {
        const calcInput = document.getElementById('calcDisplay');
        const buttons = document.querySelectorAll('.calc-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.getAttribute('data-calc');
                if (!action) return;
                this.sound.playClick();
                
                if (action === 'clear') {
                    calcInput.value = '';
                } else if (action === 'backspace') {
                    calcInput.value = calcInput.value.slice(0, -1);
                } else if (action === '=') {
                    try {
                        let expr = calcInput.value
                            .replace(/sin\(([^)]+)\)/g, (_, deg) => Trig.getSin(parseFloat(deg)))
                            .replace(/cos\(([^)]+)\)/g, (_, deg) => Trig.getCos(parseFloat(deg)))
                            .replace(/tan\(([^)]+)\)/g, (_, deg) => Trig.getTan(parseFloat(deg)))
                            .replace(/√\(([^)]+)\)/g, (_, num) => Math.sqrt(parseFloat(num)))
                            .replace(/×/g, '*')
                            .replace(/÷/g, '/');
                        const res = eval(expr);
                        calcInput.value = Trig.round(res, 3);
                    } catch (e) {
                        calcInput.value = 'Error';
                    }
                } else if (action === 'sin' || action === 'cos' || action === 'tan' || action === '√') {
                    calcInput.value += action + '(';
                } else {
                    calcInput.value += action;
                }
            });
        });

        // Insert calc result into direct input
        document.getElementById('btnUseCalcResult').addEventListener('click', () => {
            const val = parseFloat(document.getElementById('calcDisplay').value);
            if (!isNaN(val)) {
                document.getElementById('directInput').value = val;
                this.sound.playClick();
            }
        });
    }

    switchMode(newMode) {
        this.sound.playClick();
        this.mode = newMode;
        
        document.getElementById('btnModeCampaign').classList.toggle('active-mode', newMode === 'campaign');
        document.getElementById('btnModeSandbox').classList.toggle('active-mode', newMode === 'sandbox');
        document.getElementById('btnModeTimeAttack').classList.toggle('active-mode', newMode === 'timeattack');
        
        document.getElementById('panelCampaign').classList.toggle('hidden', newMode !== 'campaign');
        document.getElementById('panelSandbox').classList.toggle('hidden', newMode !== 'sandbox');
        document.getElementById('panelTimeAttack').classList.toggle('hidden', newMode !== 'timeattack');

        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        if (newMode === 'campaign') {
            this.loadLevel(this.currentLevelIndex);
        } else if (newMode === 'sandbox') {
            document.getElementById('sandboxAngle').value = 30;
            document.getElementById('sandboxRope').value = 10;
            document.getElementById('sandboxAngle').dispatchEvent(new Event('input'));
        } else if (newMode === 'timeattack') {
            this.resetTimeAttackUI();
        }
    }

    setInputMode(mode) {
        this.inputMode = mode;
        this.sound.playClick();
        document.getElementById('btnModeChoice').classList.toggle('active-input-type', mode === 'choice');
        document.getElementById('btnModeDirect').classList.toggle('active-input-type', mode === 'direct');
        document.getElementById('choiceContainer').classList.toggle('hidden', mode !== 'choice');
        document.getElementById('directContainer').classList.toggle('hidden', mode !== 'direct');
    }

    loadLevel(index) {
        this.currentLevelIndex = index;
        const problem = GAME_LEVELS[index];
        this.currentProblem = problem;
        
        this.renderer.setProblemData(problem);
        
        // Update Level HUD
        document.getElementById('levelTitle').textContent = problem.title;
        document.getElementById('levelStory').textContent = problem.story;
        document.getElementById('levelQuestion').innerHTML = problem.question;
        document.getElementById('cargoWeightBadge').textContent = '⚖️ Beban: ' + problem.cargoWeight;
        
        // Reset Feedback
        document.getElementById('feedbackMessage').classList.add('hidden');
        document.getElementById('hintCard').classList.add('hidden');

        // Render Multiple Choice Options
        const optContainer = document.getElementById('choiceOptions');
        optContainer.innerHTML = '';
        problem.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.innerHTML = `<span class="choice-letter">${String.fromCharCode(65 + idx)}</span> <span class="choice-text">${opt.text}</span>`;
            btn.addEventListener('click', () => this.checkChoiceAnswer(opt, btn));
            optContainer.appendChild(btn);
        });

        // Reset Direct Input
        document.getElementById('directInput').value = '';
        document.getElementById('directInputUnit').textContent = problem.unit;

        this.updateHeaderStats();
    }

    checkChoiceAnswer(option, buttonEl) {
        this.sound.playClick();
        const isCorrect = option.correct;
        
        // Disable all buttons temporarily
        const allBtns = document.querySelectorAll('.choice-btn');
        allBtns.forEach(b => b.disabled = true);

        if (isCorrect) {
            buttonEl.classList.add('correct-choice');
            this.handleAnswerSuccess();
        } else {
            buttonEl.classList.add('wrong-choice');
            this.handleAnswerFail(option.value);
            setTimeout(() => {
                allBtns.forEach(b => b.disabled = false);
            }, 1200);
        }
    }

    submitDirectAnswer() {
        const inputVal = parseFloat(document.getElementById('directInput').value);
        if (isNaN(inputVal)) {
            alert('Masukkan angka yang valid!');
            return;
        }

        const isCorrect = Trig.validateAnswer(inputVal, this.currentProblem.correctAnswer);
        if (isCorrect) {
            this.handleAnswerSuccess();
        } else {
            this.handleAnswerFail(inputVal);
        }
    }

    handleAnswerSuccess() {
        this.sound.startWinchSound();
        this.renderer.isLifting = true;
        this.renderer.hookProgress = 0;

        // Scoring & Combos
        const basePoints = 150;
        const points = basePoints * this.combo;
        this.score += points;
        this.combo += 1;
        if (this.combo > this.maxCombo) this.maxCombo = this.combo;
        
        // Stars reward (1 to 3 stars based on hints used)
        const starsEarned = 3;
        this.levelStars[this.currentLevelIndex] = Math.max(this.levelStars[this.currentLevelIndex] || 0, starsEarned);
        localStorage.setItem('crane_stars', JSON.stringify(this.levelStars));
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('crane_highscore', this.highScore.toString());
        }

        this.updateHeaderStats();

        // Show Success Modal after lifting animation completes
        setTimeout(() => {
            this.sound.playLevelComplete();
            document.getElementById('resultModalTitle').textContent = '🎉 Pengangkatan Berhasil!';
            document.getElementById('resultModalMessage').innerHTML = `Luar biasa! Crane berhasil mengangkat beban dengan presisi.<br><br><b>Perhitungan Tepat:</b> ${this.currentProblem.correctAnswer} ${this.currentProblem.unit}<br><b>Skor Didapat:</b> +${points} pts (Combo x${this.combo - 1})`;
            document.getElementById('resultStars').textContent = '⭐⭐⭐';
            document.getElementById('btnNextLevel').textContent = this.currentLevelIndex < GAME_LEVELS.length - 1 ? 'Lanjut Level Berikutnya ➡️' : '🏆 Selesai Semua Level!';
            this.openModal('resultModal');
        }, 1800);
    }

    handleAnswerFail(userVal) {
        this.sound.playFail();
        this.combo = 1; // Reset combo
        this.updateHeaderStats();

        const feedback = document.getElementById('feedbackMessage');
        feedback.innerHTML = `⚠️ <b>Jawaban belum tepat (${userVal} ${this.currentProblem.unit}).</b> Crane tidak bisa mengangkat beban dengan seimbang. Coba periksa kembali rumus atau gunakan tombol Bantuan/Hint!`;
        feedback.className = 'feedback-banner feedback-error';
        feedback.classList.remove('hidden');
    }

    showHint() {
        this.sound.playClick();
        const hintCard = document.getElementById('hintCard');
        hintCard.innerHTML = `💡 <b>Petunjuk:</b> ${this.currentProblem.hint}`;
        hintCard.classList.remove('hidden');
    }

    showStepByStep() {
        this.sound.playClick();
        const steps = Trig.generateExplanation(this.currentProblem);
        const container = document.getElementById('explanationSteps');
        container.innerHTML = '';

        steps.forEach(step => {
            const card = document.createElement('div');
            card.className = 'step-card';
            card.innerHTML = `<div class="step-title">${step.label}</div><div class="step-body">${step.text}</div>`;
            container.appendChild(card);
        });

        this.openModal('explanationModal');
    }

    /* Time Attack Mode Logic */
    resetTimeAttackUI() {
        document.getElementById('timeAttackStartView').classList.remove('hidden');
        document.getElementById('timeAttackGameView').classList.add('hidden');
        document.getElementById('timeAttackTimer').textContent = '60s';
        document.getElementById('timeAttackScore').textContent = '0';
    }

    startTimeAttack() {
        this.sound.playClick();
        this.timeRemaining = 60;
        this.timeAttackSolved = 0;
        this.timeAttackScoreVal = 0;
        
        document.getElementById('timeAttackStartView').classList.add('hidden');
        document.getElementById('timeAttackGameView').classList.remove('hidden');
        
        this.generateRandomTimeAttackProblem();
        
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            document.getElementById('timeAttackTimer').textContent = this.timeRemaining + 's';
            if (this.timeRemaining <= 0) {
                clearInterval(this.timerInterval);
                this.endTimeAttack();
            }
        }, 1000);
    }

    generateRandomTimeAttackProblem() {
        const specialAngles = [30, 45, 60];
        const angle = specialAngles[Math.floor(Math.random() * specialAngles.length)];
        const rope = Math.floor(Math.random() * 8 + 4) * 2; // Even numbers 8 to 22
        const targetType = Math.random() > 0.5 ? 'height' : 'rope';

        let prob;
        if (targetType === 'height') {
            const h = Trig.calculateHeight(rope, angle);
            prob = {
                title: "Time Attack: Hitung Tinggi",
                story: "Angkat muatan secepat mungkin!",
                question: `Tali crane = <b>${rope} m</b>, Sudut = <b>${angle}°</b>. Berapakah tinggi benda?`,
                targetVar: 'height',
                rope: rope,
                angle: angle,
                height: null,
                correctAnswer: Trig.round(h, 2),
                unit: 'm',
                cargoType: 'container',
                cargoWeight: '3 Ton',
                options: this.generateRandomOptions(Trig.round(h, 2), 'm')
            };
        } else {
            const h = Math.floor(Math.random() * 6 + 4);
            const r = Trig.calculateRopeLength(h, angle);
            prob = {
                title: "Time Attack: Hitung Panjang Tali",
                story: "Ulur tali derek dengan panjang yang tepat!",
                question: `Target tinggi = <b>${h} m</b>, Sudut = <b>${angle}°</b>. Berapa panjang tali miring yang dibutuhkan?`,
                targetVar: 'rope',
                height: h,
                angle: angle,
                rope: null,
                correctAnswer: Trig.round(r, 2),
                unit: 'm',
                cargoType: 'steel',
                cargoWeight: '4 Ton',
                options: this.generateRandomOptions(Trig.round(r, 2), 'm')
            };
        }

        this.currentProblem = prob;
        this.renderer.setProblemData(prob);
        
        document.getElementById('taQuestion').innerHTML = prob.question;
        const optContainer = document.getElementById('taChoiceOptions');
        optContainer.innerHTML = '';
        prob.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.innerHTML = `<span class="choice-text">${opt.text}</span>`;
            btn.addEventListener('click', () => {
                if (opt.correct) {
                    this.sound.playSuccess();
                    this.timeAttackSolved++;
                    this.timeAttackScoreVal += 200;
                    document.getElementById('timeAttackScore').textContent = this.timeAttackScoreVal;
                    this.renderer.spawnConfetti();
                    this.generateRandomTimeAttackProblem();
                } else {
                    this.sound.playFail();
                    btn.classList.add('wrong-choice');
                }
            });
            optContainer.appendChild(btn);
        });
    }

    generateRandomOptions(correctVal, unit) {
        const deltas = [-3, -1.5, 1.5, 3];
        const shuffledDeltas = deltas.sort(() => Math.random() - 0.5).slice(0, 3);
        const options = [{ text: `${correctVal} ${unit}`, value: correctVal, correct: true }];
        shuffledDeltas.forEach(d => {
            const wrongVal = Trig.round(Math.max(1, correctVal + d), 2);
            options.push({ text: `${wrongVal} ${unit}`, value: wrongVal, correct: false });
        });
        return options.sort(() => Math.random() - 0.5);
    }

    endTimeAttack() {
        this.sound.playLevelComplete();
        document.getElementById('resultModalTitle').textContent = '⏱️ Waktu Habis!';
        document.getElementById('resultModalMessage').innerHTML = `Latihan Time Attack Selesai!<br><br><b>Soal Terpecahkan:</b> ${this.timeAttackSolved} soal<br><b>Total Skor:</b> ${this.timeAttackScoreVal} pts`;
        document.getElementById('resultStars').textContent = '⚡⚡⚡';
        document.getElementById('btnNextLevel').textContent = 'Main Lagi 🔄';
        this.openModal('resultModal');
    }

    /* Modal Handlers */
    openModal(modalId) {
        const m = document.getElementById(modalId);
        if (m) m.classList.remove('hidden');
    }

    closeModal(modalId) {
        const m = document.getElementById(modalId);
        if (m) m.classList.add('hidden');
    }

    renderLevelSelectModal() {
        const grid = document.getElementById('levelGrid');
        if (!grid) return;
        grid.innerHTML = '';
        
        GAME_LEVELS.forEach((lvl, idx) => {
            const card = document.createElement('div');
            const stars = this.levelStars[idx] || 0;
            const starText = '⭐'.repeat(stars) || '☆☆☆';
            
            card.className = `level-card ${idx === this.currentLevelIndex ? 'current-level' : ''}`;
            card.innerHTML = `
                <div class="level-card-num">${lvl.id}</div>
                <div class="level-card-title">${lvl.title}</div>
                <div class="level-card-stars">${starText}</div>
            `;
            card.addEventListener('click', () => {
                this.sound.playClick();
                this.closeModal('levelSelectModal');
                this.switchMode('campaign');
                this.loadLevel(idx);
            });
            grid.appendChild(card);
        });
    }

    renderSpecialAnglesTable() {
        const tbody = document.getElementById('specialAnglesBody');
        if (!tbody) return;
        tbody.innerHTML = '';
        
        const angles = [0, 30, 45, 60, 90];
        angles.forEach(deg => {
            const data = Trig.specialAngles[deg];
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="font-bold text-amber-400">${deg}°</td>
                <td>${data.sinStr}</td>
                <td>${data.cosStr}</td>
                <td>${data.tanStr}</td>
            `;
            tbody.appendChild(row);
        });
    }

    updateHeaderStats() {
        document.getElementById('hudScore').textContent = this.score;
        document.getElementById('hudCombo').textContent = 'x' + this.combo;
        document.getElementById('hudLevelNum').textContent = (this.currentLevelIndex + 1) + '/' + GAME_LEVELS.length;
    }

    gameLoop(timestamp) {
        const dt = Math.min(0.05, (timestamp - this.lastTime) / 1000);
        this.lastTime = timestamp;

        this.renderer.update(dt);
        this.renderer.render();

        requestAnimationFrame((t) => this.gameLoop(t));
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.game = new CraneGame();
});
