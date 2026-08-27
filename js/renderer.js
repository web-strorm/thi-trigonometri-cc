/**
 * Crane Canvas 2D Renderer
 * Renders the construction site, tower crane, cargo, right triangle overlay, and particle effects.
 */
class CraneRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Logical coordinate system
        this.width = 900;
        this.height = 550;
        
        // Physics & Animation state
        this.craneBaseX = 180;
        this.groundY = 470;
        this.towerHeight = 360;
        this.jibLength = 620;
        
        // Dynamic variables
        this.currentAngle = 30;     // Angle in degrees
        this.currentRopeLength = 10; // in meters (logical unit)
        this.currentHeight = 5;     // in meters
        this.currentDistance = 8.66; // in meters
        
        // Animation positions
        this.hookProgress = 0;      // 0 = at ground, 1 = lifted to target height
        this.isLifting = false;
        this.isDropping = false;
        this.cargoSway = 0;
        this.cargoSwayVel = 0;
        this.clouds = [
            { x: 50, y: 60, speed: 0.15, scale: 1.2 },
            { x: 380, y: 110, speed: 0.25, scale: 0.8 },
            { x: 720, y: 70, speed: 0.18, scale: 1.0 }
        ];
        
        // Options
        this.showTriangleOverlay = true;
        this.showDimensions = true;
        this.targetCargo = 'crate';
        this.cargoWeight = '2.5 Ton';
        this.targetPlatformHeight = 5; // meters
        this.targetPlatformX = 0; // calculated dynamically
        
        // Particles
        this.particles = [];
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        if (!this.canvas) return;
        const rect = this.canvas.parentElement.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x for optimal mobile performance
        
        const isMobile = window.innerWidth <= 640;
        const displayWidth = rect.width || (isMobile ? window.innerWidth - 20 : 900);
        // On mobile, keep canvas height proportional (~60% of width or min 230px, max 320px) so problem card is visible
        const displayHeight = isMobile 
            ? Math.min(320, Math.max(220, displayWidth * 0.62))
            : Math.min(520, Math.max(340, window.innerHeight * 0.52));
        
        this.canvas.width = displayWidth * dpr;
        this.canvas.height = displayHeight * dpr;
        this.canvas.style.width = displayWidth + 'px';
        this.canvas.style.height = displayHeight + 'px';
        
        this.scaleX = (displayWidth * dpr) / this.width;
        this.scaleY = (displayHeight * dpr) / this.height;
    }

    setProblemData(problem) {
        const angle = problem.angle !== null ? problem.angle : (problem.correctAnswer && problem.targetVar === 'angle' ? problem.correctAnswer : 30);
        const rope = problem.rope !== null ? problem.rope : (problem.correctAnswer && problem.targetVar === 'rope' ? problem.correctAnswer : 12);
        const height = problem.height !== null ? problem.height : (problem.correctAnswer && problem.targetVar === 'height' ? problem.correctAnswer : rope * Math.sin((angle * Math.PI) / 180));
        const dist = problem.distance !== null ? problem.distance : rope * Math.cos((angle * Math.PI) / 180);

        this.currentAngle = angle;
        this.currentRopeLength = rope;
        this.currentHeight = height;
        this.currentDistance = dist;
        this.targetCargo = problem.cargoType || 'crate';
        this.cargoWeight = problem.cargoWeight || '2.0 Ton';
        this.targetPlatformHeight = height;
        this.targetProblem = problem;
        this.hookProgress = 0;
        this.isLifting = false;
        this.isDropping = false;
    }

    // Spawn Confetti Particles
    spawnConfetti(x, y) {
        const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#ef4444', '#fbbf24'];
        for (let i = 0; i < 70; i++) {
            this.particles.push({
                x: x || 500,
                y: y || 250,
                vx: (Math.random() - 0.5) * 14,
                vy: (Math.random() - 0.8) * 12 - 3,
                size: Math.random() * 8 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                rotSpeed: (Math.random() - 0.5) * 15,
                gravity: 0.28,
                life: 1.0,
                decay: Math.random() * 0.015 + 0.01
            });
        }
    }

    // Spawn Smoke / Dust
    spawnDust(x, y) {
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 30,
                y: y,
                vx: (Math.random() - 0.5) * 3,
                vy: -Math.random() * 2 - 0.5,
                size: Math.random() * 12 + 6,
                color: 'rgba(200, 200, 200, 0.4)',
                rotation: 0,
                rotSpeed: 0,
                gravity: -0.02,
                life: 1.0,
                decay: 0.03
            });
        }
    }

    update(dt) {
        // Clouds movement
        this.clouds.forEach(cloud => {
            cloud.x += cloud.speed;
            if (cloud.x > this.width + 100) cloud.x = -150;
        });

        // Lifting physics
        if (this.isLifting) {
            this.hookProgress += dt * 0.7; // Lift duration ~1.5s
            this.cargoSway = Math.sin(Date.now() * 0.006) * 0.05 * (1 - this.hookProgress * 0.5);
            if (this.hookProgress >= 1) {
                this.hookProgress = 1;
                this.isLifting = false;
                this.spawnConfetti(this.cargoRenderX, this.cargoRenderY);
                if (window.soundEngine) {
                    window.soundEngine.stopWinchSound();
                    window.soundEngine.playSuccess();
                }
            }
        } else if (this.isDropping) {
            this.hookProgress -= dt * 1.5;
            if (this.hookProgress <= 0) {
                this.hookProgress = 0;
                this.isDropping = false;
                this.spawnDust(this.cargoRenderX, this.groundY);
            }
        } else {
            // Gentle idle sway
            this.cargoSway = Math.sin(Date.now() * 0.003) * 0.02;
        }

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.rotation += p.rotSpeed;
            p.life -= p.decay;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    render() {
        this.ctx.save();
        this.ctx.scale(this.scaleX, this.scaleY);

        this.drawSkyAndBackdrop();
        this.drawTargetPlatform();
        this.drawGround();
        this.drawCrane();
        this.drawCableAndCargo();
        if (this.showTriangleOverlay) {
            this.drawTrigTriangleOverlay();
        }
        this.drawParticles();

        this.ctx.restore();
    }

    drawSkyAndBackdrop() {
        const ctx = this.ctx;
        // Sky Gradient
        const skyGrad = ctx.createLinearGradient(0, 0, 0, this.groundY);
        skyGrad.addColorStop(0, '#0f172a'); // Dark slate navy top
        skyGrad.addColorStop(0.5, '#1e293b');
        skyGrad.addColorStop(1, '#334155');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, this.width, this.height);

        // Distant Sun / Construction Spotlight glow
        const sunGlow = ctx.createRadialGradient(720, 100, 10, 720, 100, 220);
        sunGlow.addColorStop(0, 'rgba(245, 158, 11, 0.25)');
        sunGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = sunGlow;
        ctx.fillRect(500, 0, 400, 300);

        // Clouds
        ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
        this.clouds.forEach(c => {
            ctx.save();
            ctx.translate(c.x, c.y);
            ctx.scale(c.scale, c.scale);
            ctx.beginPath();
            ctx.arc(0, 0, 25, 0, Math.PI * 2);
            ctx.arc(20, -10, 30, 0, Math.PI * 2);
            ctx.arc(45, -5, 22, 0, Math.PI * 2);
            ctx.arc(60, 5, 18, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        // City Silhouette in background
        ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
        ctx.beginPath();
        ctx.rect(30, 320, 45, 150);
        ctx.rect(80, 280, 50, 190);
        ctx.rect(135, 340, 40, 130);
        ctx.rect(680, 310, 60, 160);
        ctx.rect(750, 260, 70, 210);
        ctx.rect(830, 330, 50, 140);
        ctx.fill();

        // Distant background crane silhouette
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.25)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(760, 470);
        ctx.lineTo(760, 200);
        ctx.lineTo(730, 200);
        ctx.lineTo(820, 200);
        ctx.moveTo(760, 180);
        ctx.lineTo(730, 200);
        ctx.lineTo(760, 180);
        ctx.lineTo(800, 200);
        ctx.stroke();
    }

    drawGround() {
        const ctx = this.ctx;
        // Concrete foundation
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, this.groundY, this.width, this.height - this.groundY);

        // Ground top edge line
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, this.groundY);
        ctx.lineTo(this.width, this.groundY);
        ctx.stroke();

        // Safety caution hazard stripes on bottom edge
        const stripeWidth = 24;
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, this.groundY + 4, this.width, 18);
        ctx.clip();
        for (let x = -30; x < this.width + 30; x += stripeWidth * 2) {
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.moveTo(x, this.groundY + 22);
            ctx.lineTo(x + stripeWidth, this.groundY + 22);
            ctx.lineTo(x + stripeWidth + 14, this.groundY + 4);
            ctx.lineTo(x + 14, this.groundY + 4);
            ctx.closePath();
            ctx.fill();
            
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.moveTo(x + stripeWidth, this.groundY + 22);
            ctx.lineTo(x + stripeWidth * 2, this.groundY + 22);
            ctx.lineTo(x + stripeWidth * 2 + 14, this.groundY + 4);
            ctx.lineTo(x + stripeWidth + 14, this.groundY + 4);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();

        // Safety Cones
        this.drawTrafficCone(this.craneBaseX - 70, this.groundY);
        this.drawTrafficCone(this.craneBaseX + 70, this.groundY);
    }

    drawTrafficCone(x, y) {
        const ctx = this.ctx;
        ctx.fillStyle = '#ea580c'; // Orange
        ctx.beginPath();
        ctx.moveTo(x, y - 24);
        ctx.lineTo(x - 9, y);
        ctx.lineTo(x + 9, y);
        ctx.closePath();
        ctx.fill();

        // White reflective band
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(x - 4, y - 14);
        ctx.lineTo(x + 4, y - 14);
        ctx.lineTo(x + 6, y - 8);
        ctx.lineTo(x - 6, y - 8);
        ctx.closePath();
        ctx.fill();

        // Black base
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x - 11, y - 3, 22, 3);
    }

    drawTargetPlatform() {
        const ctx = this.ctx;
        // Calculate pixel coordinates for target building/platform
        // Pixels per meter scale: 15px = 1 meter
        const PPM = 14;
        const targetHeightPx = this.targetPlatformHeight * PPM;
        const targetDistPx = Math.max(160, this.currentDistance * PPM);
        const platX = this.craneBaseX + targetDistPx;
        const platY = this.groundY - targetHeightPx;
        this.targetPlatformX = platX;

        // Platform building scaffolding / structure
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.roundRect(platX - 40, platY, 110, targetHeightPx, 4);
        ctx.fill();
        ctx.stroke();

        // Scaffolding diagonal cross lattice on building
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.lineWidth = 1.5;
        const step = 30;
        for (let y = platY; y < this.groundY; y += step) {
            ctx.beginPath();
            ctx.moveTo(platX - 40, y);
            ctx.lineTo(platX + 70, Math.min(y + step, this.groundY));
            ctx.moveTo(platX + 70, y);
            ctx.lineTo(platX - 40, Math.min(y + step, this.groundY));
            ctx.stroke();
        }

        // Landing Zone Pad on top of building
        ctx.fillStyle = '#0369a1';
        ctx.fillRect(platX - 42, platY - 8, 114, 8);
        ctx.strokeStyle = '#38bdf8';
        ctx.strokeRect(platX - 42, platY - 8, 114, 8);

        // Landing pad target bullseye / "TARGET ZONE" badge
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🎯 TARGET', platX + 15, platY - 14);

        // Target height line dashed
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(this.craneBaseX, platY);
        ctx.lineTo(platX - 42, platY);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    drawCrane() {
        const ctx = this.ctx;
        const bx = this.craneBaseX;
        const by = this.groundY;
        const topY = by - this.towerHeight;

        // 1. Concrete Crane Foundation
        ctx.fillStyle = '#475569';
        ctx.fillRect(bx - 36, by - 14, 72, 14);
        ctx.fillStyle = '#334155';
        ctx.fillRect(bx - 42, by - 4, 84, 4);

        // 2. Tower Lattice Mast
        const mastWidth = 26;
        ctx.fillStyle = '#f59e0b';
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 2;

        // Vertical legs
        ctx.fillRect(bx - mastWidth/2, topY, 4, this.towerHeight - 14);
        ctx.fillRect(bx + mastWidth/2 - 4, topY, 4, this.towerHeight - 14);

        // Cross truss braces
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        const trussStep = 22;
        for (let y = by - 14; y > topY; y -= trussStep) {
            ctx.beginPath();
            ctx.moveTo(bx - mastWidth/2, y);
            ctx.lineTo(bx + mastWidth/2, y - trussStep);
            ctx.moveTo(bx + mastWidth/2, y);
            ctx.lineTo(bx - mastWidth/2, y - trussStep);
            ctx.moveTo(bx - mastWidth/2, y);
            ctx.lineTo(bx + mastWidth/2, y);
            ctx.stroke();
        }

        // 3. Slewing Ring & Operator Cabin
        ctx.fillStyle = '#0284c7';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(bx - 8, topY - 24, 28, 22, 3);
        ctx.fill();
        ctx.stroke();

        // Cabin window
        ctx.fillStyle = '#7dd3fc';
        ctx.fillRect(bx + 4, topY - 20, 12, 14);

        // 4. Tower Top Peak (A-Frame)
        const peakY = topY - 55;
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(bx - 12, topY);
        ctx.lineTo(bx, peakY);
        ctx.lineTo(bx + 12, topY);
        ctx.stroke();

        // 5. Counter-Jib (Rear Arm) & Counterweight
        const rearX = bx - 140;
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(bx, topY);
        ctx.lineTo(rearX, topY);
        ctx.stroke();

        // Counter-jib guy wire to peak
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(bx, peakY);
        ctx.lineTo(rearX, topY);
        ctx.stroke();

        // Heavy concrete counterweights
        ctx.fillStyle = '#64748b';
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.fillRect(rearX - 10, topY - 14, 32, 28);
        ctx.strokeRect(rearX - 10, topY - 14, 32, 28);
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('12T', rearX + 6, topY + 4);

        // 6. Main Jib / Working Boom (Front Arm)
        const frontJibX = bx + 640;
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(bx, topY);
        ctx.lineTo(frontJibX, topY);
        ctx.stroke();

        // Jib internal lattice
        ctx.lineWidth = 1.2;
        for (let x = bx; x < frontJibX; x += 25) {
            ctx.beginPath();
            ctx.moveTo(x, topY);
            ctx.lineTo(x + 12, topY - 14);
            ctx.lineTo(x + 25, topY);
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(bx, topY - 14);
        ctx.lineTo(frontJibX, topY - 14);
        ctx.stroke();

        // Front guy wire from peak to jib
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(bx, peakY);
        ctx.lineTo(bx + 260, topY - 14);
        ctx.stroke();
    }

    drawCableAndCargo() {
        const ctx = this.ctx;
        const PPM = 14; // pixels per meter
        const targetDistPx = Math.max(160, this.currentDistance * PPM);
        const trolleyX = this.craneBaseX + targetDistPx;
        const trolleyY = this.groundY - this.towerHeight;

        // 1. Moving Trolley on the Jib
        ctx.fillStyle = '#dc2626';
        ctx.strokeStyle = '#991b1b';
        ctx.lineWidth = 2;
        ctx.fillRect(trolleyX - 12, trolleyY - 2, 24, 10);
        ctx.strokeRect(trolleyX - 12, trolleyY - 2, 24, 10);

        // Trolley wheels
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(trolleyX - 7, trolleyY - 3, 3, 0, Math.PI * 2);
        ctx.arc(trolleyX + 7, trolleyY - 3, 3, 0, Math.PI * 2);
        ctx.fill();

        // Calculate Cargo dynamic position
        const targetHeightPx = this.targetPlatformHeight * PPM;
        const groundCargoY = this.groundY - 24; // sitting on ground
        const liftedCargoY = this.groundY - targetHeightPx - 24; // lifted to target platform
        
        const currentCargoY = groundCargoY - (groundCargoY - liftedCargoY) * this.hookProgress;
        const swayOffset = Math.sin(this.cargoSway) * 18;
        const cargoX = trolleyX + swayOffset;

        this.cargoRenderX = cargoX;
        this.cargoRenderY = currentCargoY;

        // 2. Winch Steel Cables
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(trolleyX - 3, trolleyY + 8);
        ctx.lineTo(cargoX - 3, currentCargoY - 16);
        ctx.moveTo(trolleyX + 3, trolleyY + 8);
        ctx.lineTo(cargoX + 3, currentCargoY - 16);
        ctx.stroke();

        // 3. Pulley Hook Block
        ctx.fillStyle = '#f59e0b';
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1.5;
        ctx.fillRect(cargoX - 8, currentCargoY - 20, 16, 12);
        ctx.strokeRect(cargoX - 8, currentCargoY - 20, 16, 12);

        // Steel Hook
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cargoX, currentCargoY - 4, 6, 0, Math.PI * 0.9, false);
        ctx.stroke();

        // 4. Cargo / Beban Rendering
        ctx.save();
        ctx.translate(cargoX, currentCargoY);
        ctx.rotate(this.cargoSway);

        this.renderCargoGraphic(this.targetCargo, this.cargoWeight);

        ctx.restore();
    }

    renderCargoGraphic(type, weight) {
        const ctx = this.ctx;
        if (type === 'crate') {
            // Wooden Crate
            ctx.fillStyle = '#b45309';
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 2;
            ctx.fillRect(-22, 0, 44, 38);
            ctx.strokeRect(-22, 0, 44, 38);

            // Wood planks lines & X cross
            ctx.strokeStyle = '#92400e';
            ctx.beginPath();
            ctx.moveTo(-22, 0); ctx.lineTo(22, 38);
            ctx.moveTo(22, 0); ctx.lineTo(-22, 38);
            ctx.stroke();

            // Label
            ctx.fillStyle = '#fef3c7';
            ctx.font = 'bold 9px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('📦 ' + weight, 0, 22);
        } else if (type === 'steel') {
            // Steel I-Beams
            ctx.fillStyle = '#64748b';
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 2;
            for (let i = 0; i < 3; i++) {
                const y = i * 11;
                ctx.fillRect(-30, y, 60, 9);
                ctx.strokeRect(-30, y, 60, 9);
            }
            // Yellow lifting straps
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(-18, -3, 6, 36);
            ctx.fillRect(12, -3, 6, 36);

            ctx.fillStyle = '#f8fafc';
            ctx.font = 'bold 9px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('🏗️ ' + weight, 0, 20);
        } else if (type === 'container') {
            // Shipping Container
            ctx.fillStyle = '#2563eb';
            ctx.strokeStyle = '#1d4ed8';
            ctx.lineWidth = 2;
            ctx.fillRect(-34, 0, 68, 36);
            ctx.strokeRect(-34, 0, 68, 36);

            // Corrugated vertical ridges
            ctx.strokeStyle = '#1e40af';
            for (let x = -28; x <= 28; x += 8) {
                ctx.beginPath();
                ctx.moveTo(x, 2);
                ctx.lineTo(x, 34);
                ctx.stroke();
            }

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 9px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('CRANE CO ' + weight, 0, 21);
        } else if (type === 'concrete') {
            // Heavy Concrete Block
            ctx.fillStyle = '#94a3b8';
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 2;
            ctx.fillRect(-26, 0, 52, 36);
            ctx.strokeRect(-26, 0, 52, 36);

            // Rebar hooks on top
            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(-10, 0, 4, Math.PI, 0);
            ctx.arc(10, 0, 4, Math.PI, 0);
            ctx.stroke();

            ctx.fillStyle = '#0f172a';
            ctx.font = 'bold 9px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('BETON ' + weight, 0, 21);
        } else {
            // Turbine / Industrial
            ctx.fillStyle = '#0284c7';
            ctx.strokeStyle = '#0369a1';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(-30, 2, 60, 32, 8);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 9px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('⚡ ' + weight, 0, 20);
        }
    }

    drawTrigTriangleOverlay() {
        const ctx = this.ctx;
        const PPM = 14; // pixels per meter
        const targetDistPx = Math.max(160, this.currentDistance * PPM);
        const targetHeightPx = this.targetPlatformHeight * PPM;

        const originX = this.craneBaseX;
        const originY = this.groundY;
        const cornerX = this.craneBaseX + targetDistPx;
        const cornerY = this.groundY;
        const peakX = this.craneBaseX + targetDistPx;
        const peakY = this.groundY - targetHeightPx;

        // Semi-transparent triangle fill
        ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(cornerX, cornerY);
        ctx.lineTo(peakX, peakY);
        ctx.closePath();
        ctx.fill();

        // 1. Hypotenuse (Miring / Tali Derek)
        ctx.strokeStyle = '#38bdf8'; // Glowing sky blue
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(peakX, peakY);
        ctx.stroke();

        // 2. Opposite (Depan / Tinggi Angkat h)
        ctx.strokeStyle = '#10b981'; // Emerald Green
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cornerX, cornerY);
        ctx.lineTo(peakX, peakY);
        ctx.stroke();

        // 3. Adjacent (Samping / Jarak Horizontal x)
        ctx.strokeStyle = '#a855f7'; // Purple
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(cornerX, cornerY);
        ctx.stroke();

        // 4. Right angle square (Siku-siku 90°)
        const squareSize = 16;
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cornerX - squareSize, cornerY);
        ctx.lineTo(cornerX - squareSize, cornerY - squareSize);
        ctx.lineTo(cornerX, cornerY - squareSize);
        ctx.stroke();
        // Dot in right angle
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(cornerX - squareSize / 2, cornerY - squareSize / 2, 2, 0, Math.PI * 2);
        ctx.fill();

        // 5. Angle Arc (Sudut θ)
        const arcRadius = 45;
        const angleRad = (this.currentAngle * Math.PI) / 180;
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(originX, originY, arcRadius, -angleRad, 0, false);
        ctx.stroke();

        // Angle label badge
        const textAngle = -angleRad / 2;
        const labelRadius = arcRadius + 18;
        const angleLabelX = originX + Math.cos(textAngle) * labelRadius;
        const angleLabelY = originY + Math.sin(textAngle) * labelRadius;
        
        const angleText = (this.targetProblem && this.targetProblem.targetVar === 'angle') ? 'θ = ?°' : `θ = ${this.currentAngle}°`;
        this.drawTextBadge(angleText, angleLabelX, angleLabelY, '#fbbf24', '#0f172a');

        // Dimension labels along the sides
        if (this.showDimensions) {
            // Miring (Hypotenuse) label
            const midMiringX = (originX + peakX) / 2 - 18;
            const midMiringY = (originY + peakY) / 2 - 14;
            const ropeText = this.targetProblem && this.targetProblem.targetVar === 'rope' ? 'Tali = ? m' : `Tali (r) = ${Trig.round(this.currentRopeLength, 1)} m`;
            this.drawTextBadge(ropeText, midMiringX, midMiringY, '#38bdf8', '#0f172a');

            // Depan (Height) label
            const midDepanX = cornerX + 45;
            const midDepanY = (cornerY + peakY) / 2;
            const heightText = this.targetProblem && this.targetProblem.targetVar === 'height' ? 'Tinggi = ? m' : `Tinggi (h) = ${Trig.round(this.currentHeight, 1)} m`;
            this.drawTextBadge(heightText, midDepanX, midDepanY, '#10b981', '#0f172a');

            // Samping (Distance) label
            const midSampingX = (originX + cornerX) / 2;
            const midSampingY = cornerY + 28;
            const distText = this.targetProblem && this.targetProblem.targetVar === 'distance' ? 'Jarak = ? m' : `Jarak (x) = ${Trig.round(this.currentDistance, 1)} m`;
            this.drawTextBadge(distText, midSampingX, midSampingY, '#c084fc', '#0f172a');
        }
    }

    drawTextBadge(text, x, y, borderColor, bgColor) {
        const ctx = this.ctx;
        ctx.font = 'bold 12px system-ui, sans-serif';
        const width = ctx.measureText(text).width + 16;
        const height = 22;

        ctx.fillStyle = bgColor || 'rgba(15, 23, 42, 0.85)';
        ctx.strokeStyle = borderColor || '#38bdf8';
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.roundRect(x - width / 2, y - height / 2, width, height, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = borderColor || '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x, y);
    }

    drawParticles() {
        const ctx = this.ctx;
        this.particles.forEach(p => {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            ctx.restore();
        });
        ctx.globalAlpha = 1.0;
    }
}

window.CraneRenderer = CraneRenderer;
