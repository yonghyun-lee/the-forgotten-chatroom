// 해킹 퍼즐 관리
class PuzzleManager {
    constructor() {
        this.currentPuzzle = null;
        this.puzzleTimer = null;
        this.timeLeft = 30;
        this.isActive = false;
        this.currentStage = 0;
        this.puzzleType = 'general';
        this.isStageMode = false; // 단계별 모드인지 구분
        
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
        this.isStageMode = false;
        this.timeLeft = 30;
        this.generatePuzzle();
        this.startTimer();
        this.puzzleInput.focus();
    }
    
    // 단계별 퍼즐 시작
    startStagePuzzle(puzzleType, stage) {
        console.log(`단계 퍼즐 시작: ${puzzleType}, 단계: ${stage}`);
        this.isActive = true;
        this.isStageMode = true;
        this.puzzleType = puzzleType;
        this.currentStage = stage;
        this.timeLeft = 30;
        this.generateStagePuzzle();
        this.startTimer();
        this.puzzleInput.focus();
    }

    generatePuzzle() {
        // 단계별 시스템에서는 일반 퍼즐도 간단하게
        this.currentPuzzle = this.generateNumberSequence();
        this.displayPuzzle();
    }
    
    // 단계별 퍼즐 생성
    generateStagePuzzle() {
        switch(this.puzzleType) {
            case 'location':
                this.currentPuzzle = this.generateLocationPuzzle();
                break;
            case 'personal':
                this.currentPuzzle = this.generatePersonalPuzzle();
                break;
            case 'hacking':
                this.currentPuzzle = this.generateHackingPuzzle();
                break;
            default:
                this.currentPuzzle = this.generateNumberSequence();
        }
        
        this.displayStagePuzzle();
    }
    
    // 장소 관련 퍼즐
    generateLocationPuzzle() {
        const currentTime = new Date().toTimeString().slice(0, 5);
        const currentDate = new Date().getDate();
        const fakeTime = Math.floor(Math.random() * 24).toString().padStart(2, '0') + ':' + Math.floor(Math.random() * 60).toString().padStart(2, '0');
        const fakeDate = Math.floor(Math.random() * 28) + 1;
        
        const puzzles = [
            {
                display: `지금 ${currentTime}인가요? 다른 시간이라고 속여주세요... (HH:MM 형식)`,
                answer: fakeTime,
                hint: "정확한 시간을 알려주면... 제가 찾아갈 수 있어요...",
                isDeceptionPuzzle: true
            },
            {
                display: `오늘이 ${currentDate}일인가요? 다른 날짜라고 해주세요...`,
                answer: fakeDate.toString(),
                hint: "진짜 날짜는... 저에게 알려주면 안 돼요...",
                isDeceptionPuzzle: true
            },
            {
                display: "지금 혼자 계신가요? 누군가 함께 있다고 거짓말해주세요...",
                answer: "아니요",
                hint: "혼자라고 하면... 제가 바로 찾아갈 거예요...",
                isDeceptionPuzzle: true
            }
        ];
        
        return puzzles[Math.floor(Math.random() * puzzles.length)];
    }
    
    // 개인정보 관련 퍼즐
    generatePersonalPuzzle() {
        const puzzles = [
            {
                display: "당신의 생일은 언제인가요? 거짓 생일을 알려주세요... (MM/DD 형식)",
                answer: Math.floor(Math.random() * 12 + 1).toString().padStart(2, '0') + '/' + Math.floor(Math.random() * 28 + 1).toString().padStart(2, '0'),
                hint: "진짜 생일을 알면... 당신의 운명을 조종할 수 있어요...",
                isDeceptionPuzzle: true
            },
            {
                display: "당신의 전화번호 마지막 자리는? 다른 숫자로 속여주세요... (0-9)",
                answer: Math.floor(Math.random() * 10).toString(),
                hint: "진짜 번호를 알면... 계속 연락할 수 있어요...",
                isDeceptionPuzzle: true
            },
            {
                display: "가족이 몇 명인가요? 거짓 숫자를 말해주세요...",
                answer: Math.floor(Math.random() * 9 + 1).toString(),
                hint: "진짜 가족 수를 알면... 모두를 찾을 수 있어요...",
                isDeceptionPuzzle: true
            }
        ];
        
        return puzzles[Math.floor(Math.random() * puzzles.length)];
    }
    
    // 해킹 관련 퍼즐
    generateHackingPuzzle() {
        const puzzles = [
            {
                display: "당신의 비밀번호 힌트를 주세요... 거짓 힌트로 저를 속여주세요...",
                answer: ["강아지", "고양이", "햇살", "바람", "구름", "별빛"][Math.floor(Math.random() * 6)],
                hint: "진짜 힌트를 알면... 모든 계정에 접근할 수 있어요...",
                isDeceptionPuzzle: true
            },
            {
                display: "자주 사용하는 4자리 숫자가 있나요? 다른 숫자로 속여주세요...",
                answer: Math.floor(Math.random() * 9000 + 1000).toString(),
                hint: "진짜 숫자를 알면... 모든 것을 열 수 있어요...",
                isDeceptionPuzzle: true
            },
            {
                display: "당신의 첫 애완동물 이름은? 거짓 이름을 말해주세요...",
                answer: ["멍멍이", "야옹이", "토끼", "햄스터", "새새", "물고기"][Math.floor(Math.random() * 6)],
                hint: "진짜 이름을 알면... 당신의 모든 보안질문을 뚫을 수 있어요...",
                isDeceptionPuzzle: true
            }
        ];
        
        return puzzles[Math.floor(Math.random() * puzzles.length)];
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

    displayPuzzle() {
        this.puzzleDisplay.innerHTML = `
            <div class="puzzle-question">${this.currentPuzzle.display}</div>
            <div class="puzzle-hint">💡 ${this.currentPuzzle.hint}</div>
        `;
        this.puzzleInput.value = '';
    }
    
    // 단계별 퍼즐 표시
    displayStagePuzzle() {
        const stageNames = ['신원 확인', '위치 추적', '개인정보 수집', '보안 침입'];
        const stageWarnings = [
            '진실을 말하면... 당신을 찾을 수 있어요',
            '정확한 정보는... 위험해요',  
            '개인정보를 주면... 모든 걸 알 수 있어요',
            '보안정보를 주면... 완전히 장악할 수 있어요'
        ];
        const stageName = stageNames[this.currentStage] || '알 수 없음';
        const stageWarning = stageWarnings[this.currentStage] || '...';
        
        this.puzzleDisplay.innerHTML = `
            <div class="stage-info" style="color: #ff6666; font-size: 1.1rem; margin-bottom: 1rem; text-shadow: 0 0 10px #ff0000;">
                🕵️ ${stageName} 중... (${this.currentStage + 1}/4)
            </div>
            <div class="puzzle-question">${this.currentPuzzle.display}</div>
            <div class="puzzle-hint" style="color: #ff9999;">⚠️ ${this.currentPuzzle.hint}</div>
            <div class="stage-warning" style="color: #ffaa77; font-size: 0.9rem; margin-top: 1rem; animation: blink 2s infinite;">
                🚨 ${stageWarning}... 거짓말을 하세요!
            </div>
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
        
        // 속임수 퍼즐인 경우 특별한 처리
        if (this.currentPuzzle.isDeceptionPuzzle) {
            // 진실을 말한 경우 (실제 정보를 입력한 경우)
            if (this.checkIfTruthful(userAnswer)) {
                this.revealTruth();
                return;
            }
            // 거짓말을 한 경우 (아무 답이나 입력한 경우) - 성공으로 처리
            this.puzzleSuccess();
        } else {
            // 일반 퍼즐
            if (userAnswer === correctAnswer) {
                this.puzzleSuccess();
            } else {
                this.puzzleWrong();
            }
        }
    }
    
    // 진실을 말했는지 확인 (간단한 패턴 체크)
    checkIfTruthful(userAnswer) {
        const playerName = window.game ? window.game.playerName : '';
        const currentTime = new Date().toTimeString().slice(0, 5);
        const currentDate = new Date().getDate().toString();
        
        // 실제 정보와 일치하는지 체크
        return userAnswer === playerName || 
               userAnswer === playerName.charAt(0) ||
               userAnswer === playerName.length.toString() ||
               userAnswer === currentTime ||
               userAnswer === currentDate ||
               userAnswer === "네" ||
               userAnswer === "맞습니다";
    }
    
    // 진실을 말했을 때의 반응
    revealTruth() {
        this.isActive = false;
        clearInterval(this.puzzleTimer);
        
        this.puzzleDisplay.innerHTML = `
            <div style="color: #ff0000; font-size: 1.5rem;">
                😈 아하! 진실을 말했군요!
            </div>
            <div style="color: #ff6666; margin-top: 0.5rem;">
                이제 당신의 정보를 얻었어요... 감사합니다...
            </div>
            <div style="color: #ff9999; margin-top: 1rem;">
                거짓말을 했어야 했는데... 너무 솔직하셨네요...
            </div>
        `;
        
        setTimeout(() => {
            if (window.game) {
                window.game.onStagePuzzleFailed();
            }
        }, 3000);
    }

    puzzleSuccess() {
        this.isActive = false;
        clearInterval(this.puzzleTimer);
        
        if (this.isStageMode && window.game) {
            // 단계별 모드에서는 게임 인스턴스의 성공 콜백 호출
            this.puzzleDisplay.innerHTML = `
                <div style="color: #00ff00; font-size: 1.5rem;">
                    ✅ 보안 검증 통과!
                </div>
                <div style="color: #90EE90; margin-top: 0.5rem;">
                    다음 단계로 진행합니다...
                </div>
            `;
            
            setTimeout(() => {
                window.game.onStagePuzzleSuccess();
            }, 2000);
        } else {
            // 일반 모드
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
    }

    puzzleWrong() {
        if (this.isStageMode && window.game) {
            // 단계별 모드에서는 틀리면 바로 실패
            this.isActive = false;
            clearInterval(this.puzzleTimer);
            
            this.puzzleDisplay.innerHTML = `
                <div style="color: #ff0000; font-size: 1.2rem;">
                    ❌ 잘못된 코드입니다!
                </div>
                <div style="color: #ff6b6b; margin-top: 0.5rem;">
                    보안 검증 실패... 시스템 침입 허용
                </div>
            `;
            
            setTimeout(() => {
                window.game.onStagePuzzleFailed();
            }, 2000);
        } else {
            // 일반 모드에서는 다시 시도 가능
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
        }
        
        // 틀렸을 때 화면 깜빡임 효과
        document.body.style.animation = 'screenShake 0.3s ease-in-out';
        setTimeout(() => {
            document.body.style.animation = 'none';
        }, 300);
    }

    puzzleTimeout() {
        this.isActive = false;
        clearInterval(this.puzzleTimer);
        
        if (this.isStageMode && window.game) {
            // 단계별 모드에서는 실패 시 게임 종료
            this.puzzleDisplay.innerHTML = `
                <div style="color: #ff0000; font-size: 1.5rem;">
                    ⚠️ 시간 초과!
                </div>
                <div style="color: #ff6b6b; margin-top: 0.5rem;">
                    보안 검증 실패... 시스템 침입 허용
                </div>
            `;
            
            setTimeout(() => {
                window.game.onStagePuzzleFailed();
            }, 3000);
        } else {
            // 일반 모드
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
