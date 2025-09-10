// 해킹 퍼즐 관리
class PuzzleManager {
    constructor() {
        this.currentPuzzle = null;
        this.puzzleTimer = null;
        this.timeLeft = 30;
        this.isActive = false;
        
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.puzzleDisplay = document.getElementById('puzzle-display');
        this.puzzleInput = document.getElementById('puzzle-input');
        this.puzzleSubmit = document.getElementById('puzzle-submit');
        this.timerDisplay = document.getElementById('timer');
    }

    bindEvents() {
        this.puzzleSubmit.addEventListener('click', () => this.checkAnswer());
        this.puzzleInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.checkAnswer();
        });
    }

    startPuzzle() {
        this.isActive = true;
        this.timeLeft = 30;
        this.generatePuzzle();
        this.startTimer();
        this.puzzleInput.focus();
    }

    generatePuzzle() {
        const puzzleTypes = [
            this.generateNumberSequence,
            this.generateBinaryCode,
            this.generatePatternMatch,
            this.generateMathProblem
        ];
        
        const randomType = puzzleTypes[Math.floor(Math.random() * puzzleTypes.length)];
        this.currentPuzzle = randomType.call(this);
        
        this.displayPuzzle();
    }

    generateNumberSequence() {
        const sequence = [];
        const start = Math.floor(Math.random() * 10);
        const step = Math.floor(Math.random() * 5) + 1;
        
        for (let i = 0; i < 5; i++) {
            sequence.push(start + (i * step));
        }
        
        const answer = start + (5 * step);
        
        return {
            type: 'sequence',
            display: sequence.join(' → ?'),
            answer: answer.toString(),
            hint: `다음 숫자는? (규칙: +${step})`
        };
    }

    generateBinaryCode() {
        const binary = Math.floor(Math.random() * 100).toString(2);
        const decimal = parseInt(binary, 2);
        
        return {
            type: 'binary',
            display: `Binary: ${binary}`,
            answer: decimal.toString(),
            hint: '10진수로 변환하세요'
        };
    }

    generatePatternMatch() {
        const patterns = [
            { display: 'A B C D ?', answer: 'E', hint: '알파벳 순서' },
            { display: '1 4 9 16 ?', answer: '25', hint: '제곱수' },
            { display: '2 4 8 16 ?', answer: '32', hint: '2의 거듭제곱' },
            { display: '1 1 2 3 ?', answer: '5', hint: '피보나치 수열' }
        ];
        
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        return {
            type: 'pattern',
            display: pattern.display,
            answer: pattern.answer,
            hint: pattern.hint
        };
    }

    generateMathProblem() {
        const a = Math.floor(Math.random() * 20) + 1;
        const b = Math.floor(Math.random() * 20) + 1;
        const operation = Math.random() < 0.5 ? '+' : '*';
        
        let answer, display;
        if (operation === '+') {
            answer = a + b;
            display = `${a} + ${b} = ?`;
        } else {
            answer = a * b;
            display = `${a} × ${b} = ?`;
        }
        
        return {
            type: 'math',
            display: display,
            answer: answer.toString(),
            hint: '간단한 계산'
        };
    }

    displayPuzzle() {
        this.puzzleDisplay.innerHTML = `
            <div class="puzzle-question">${this.currentPuzzle.display}</div>
            <div class="puzzle-hint">💡 ${this.currentPuzzle.hint}</div>
        `;
        this.puzzleInput.value = '';
    }

    startTimer() {
        this.updateTimerDisplay();
        
        this.puzzleTimer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            
            if (this.timeLeft <= 0) {
                this.puzzleTimeout();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        this.timerDisplay.textContent = this.timeLeft;
        
        // 시간이 부족할 때 경고 효과
        if (this.timeLeft <= 10) {
            this.timerDisplay.style.color = '#ff0000';
            this.timerDisplay.style.animation = 'warningBlink 0.5s infinite';
        } else {
            this.timerDisplay.style.color = '#ffff00';
            this.timerDisplay.style.animation = 'none';
        }
    }

    checkAnswer() {
        if (!this.isActive) return;
        
        const userAnswer = this.puzzleInput.value.trim();
        const correctAnswer = this.currentPuzzle.answer;
        
        if (userAnswer === correctAnswer) {
            this.puzzleSuccess();
        } else {
            this.puzzleWrong();
        }
    }

    puzzleSuccess() {
        this.isActive = false;
        clearInterval(this.puzzleTimer);
        
        // 게임 인스턴스에 성공 카운트 추가
        if (window.game) {
            window.game.puzzlesSolved++;
        }
        
        this.puzzleDisplay.innerHTML = `
            <div style="color: #00ff00; font-size: 1.5rem;">
                ✅ 보안 코드가 확인되었습니다!
            </div>
        `;
        
        setTimeout(() => {
            this.returnToChat();
        }, 2000);
    }

    puzzleWrong() {
        this.puzzleDisplay.innerHTML = `
            <div style="color: #ff0000; font-size: 1.2rem;">
                ❌ 잘못된 코드입니다!
            </div>
            <div style="color: #ffff00; margin-top: 0.5rem;">
                다시 시도하세요...
            </div>
        `;
        
        this.puzzleInput.value = '';
        this.puzzleInput.focus();
        
        // 틀렸을 때 화면 깜빡임 효과
        document.body.style.animation = 'screenShake 0.3s ease-in-out';
        setTimeout(() => {
            document.body.style.animation = 'none';
        }, 300);
    }

    puzzleTimeout() {
        this.isActive = false;
        clearInterval(this.puzzleTimer);
        
        // 게임 인스턴스에 실패 카운트 추가
        if (window.game) {
            window.game.puzzlesFailed++;
        }
        
        this.puzzleDisplay.innerHTML = `
            <div style="color: #ff0000; font-size: 1.5rem;">
                ⚠️ 시간 초과!
            </div>
            <div style="color: #ffff00; margin-top: 0.5rem;">
                시스템이 차단되었습니다...
            </div>
        `;
        
        setTimeout(() => {
            this.returnToChat();
        }, 3000);
    }

    returnToChat() {
        if (window.game) {
            window.game.switchScreen('chat');
            window.game.isPuzzleActive = false;
        }
    }
}

// 퍼즐 매니저 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.puzzleManager = new PuzzleManager();
});
