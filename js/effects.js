// 특수 효과 및 애니메이션 관리
class EffectsManager {
    constructor() {
        this.isGlitchActive = false;
        this.isScreenShakeActive = false;
        this.audioContext = null;
        this.initializeAudio();
    }

    initializeAudio() {
        // Web Audio API 초기화
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }

    // 글리치 효과
    triggerGlitch(element = document.body) {
        if (this.isGlitchActive) return;
        
        this.isGlitchActive = true;
        element.classList.add('glitch-effect');
        
        // 랜덤한 색상 변화
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        element.style.filter = `hue-rotate(${Math.random() * 360}deg) saturate(${Math.random() * 3 + 1})`;
        
        setTimeout(() => {
            element.classList.remove('glitch-effect');
            element.style.filter = '';
            this.isGlitchActive = false;
        }, 1000);
    }

    // 화면 흔들림 효과
    triggerScreenShake(element = document.body) {
        if (this.isScreenShakeActive) return;
        
        this.isScreenShakeActive = true;
        element.classList.add('screen-shake');
        
        setTimeout(() => {
            element.classList.remove('screen-shake');
            this.isScreenShakeActive = false;
        }, 500);
    }

    // 타이핑 효과
    typeText(element, text, speed = 50) {
        return new Promise((resolve) => {
            let index = 0;
            element.textContent = '';
            
            const typeInterval = setInterval(() => {
                if (index < text.length) {
                    element.textContent += text[index];
                    index++;
                } else {
                    clearInterval(typeInterval);
                    resolve();
                }
            }, speed);
        });
    }

    // 깜빡이는 효과
    blinkElement(element, duration = 1000) {
        const originalDisplay = element.style.display;
        let isVisible = true;
        
        const blinkInterval = setInterval(() => {
            element.style.display = isVisible ? 'none' : originalDisplay;
            isVisible = !isVisible;
        }, 100);
        
        setTimeout(() => {
            clearInterval(blinkInterval);
            element.style.display = originalDisplay;
        }, duration);
    }

    // 화면 왜곡 효과
    distortScreen() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '9999';
        canvas.style.pointerEvents = 'none';
        
        document.body.appendChild(canvas);
        
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // 왜곡 효과 그리기
            const time = Date.now() * 0.01;
            for (let i = 0; i < 100; i++) {
                const x = Math.sin(time + i) * 50 + canvas.width / 2;
                const y = Math.cos(time + i) * 50 + canvas.height / 2;
                const radius = Math.sin(time + i) * 20 + 10;
                
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 0, 0, ${Math.sin(time + i) * 0.1})`;
                ctx.fill();
            }
            
            requestAnimationFrame(animate);
        };
        
        animate();
        
        setTimeout(() => {
            document.body.removeChild(canvas);
        }, 3000);
    }

    // 사운드 효과 생성
    playTone(frequency, duration, type = 'sine') {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    // 공포 사운드 효과
    playHorrorSound() {
        if (!this.audioContext) return;
        
        // 저주파 사운드
        this.playTone(60, 0.5, 'sawtooth');
        
        setTimeout(() => {
            this.playTone(40, 0.3, 'triangle');
        }, 200);
        
        setTimeout(() => {
            this.playTone(30, 0.8, 'sine');
        }, 500);
    }

    // 긴장감 있는 사운드
    playTensionSound() {
        if (!this.audioContext) return;
        
        // 높은 주파수에서 낮은 주파수로
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                this.playTone(1000 - (i * 100), 0.1, 'sine');
            }, i * 100);
        }
    }

    // 글로우 효과
    addGlow(element, color = '#00ff00') {
        element.style.textShadow = `0 0 10px ${color}, 0 0 20px ${color}, 0 0 30px ${color}`;
        element.style.boxShadow = `0 0 20px ${color}`;
    }

    // 글로우 효과 제거
    removeGlow(element) {
        element.style.textShadow = '';
        element.style.boxShadow = '';
    }

    // 페이드 인 효과
    fadeIn(element, duration = 1000) {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        let opacity = 0;
        const fadeInterval = setInterval(() => {
            opacity += 0.02;
            element.style.opacity = opacity;
            
            if (opacity >= 1) {
                clearInterval(fadeInterval);
            }
        }, duration / 50);
    }

    // 페이드 아웃 효과
    fadeOut(element, duration = 1000) {
        let opacity = 1;
        const fadeInterval = setInterval(() => {
            opacity -= 0.02;
            element.style.opacity = opacity;
            
            if (opacity <= 0) {
                clearInterval(fadeInterval);
                element.style.display = 'none';
            }
        }, duration / 50);
    }

    // 랜덤한 화면 깜빡임
    randomFlicker() {
        const flickerInterval = setInterval(() => {
            document.body.style.opacity = Math.random() > 0.5 ? '0.8' : '1';
        }, 50);
        
        setTimeout(() => {
            clearInterval(flickerInterval);
            document.body.style.opacity = '1';
        }, 2000);
    }

    // 텍스트 왜곡 효과
    distortText(element) {
        const originalText = element.textContent;
        const distortedText = originalText.split('').map(char => {
            if (Math.random() < 0.3) {
                return String.fromCharCode(33 + Math.random() * 94);
            }
            return char;
        }).join('');
        
        element.textContent = distortedText;
        
        setTimeout(() => {
            element.textContent = originalText;
        }, 1000);
    }

    // 화면 전체를 어둡게 하는 효과
    darkenScreen() {
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.background = 'rgba(0, 0, 0, 0.8)';
        overlay.style.zIndex = '9998';
        overlay.style.pointerEvents = 'none';
        
        document.body.appendChild(overlay);
        
        setTimeout(() => {
            document.body.removeChild(overlay);
        }, 3000);
    }
}

// 효과 매니저 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.effectsManager = new EffectsManager();
});
