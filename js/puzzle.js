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
            case 'name':
                this.currentPuzzle = this.generateNamePuzzle();
                break;
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
    
    // 이름 관련 퍼즐
    generateNamePuzzle() {
        const puzzles = [
            {
                display: `${window.game ? window.game.playerName : 'ERROR'}를 거꾸로 쓰면? (당신의 이름을 역순으로...)`,
                answer: window.game ? window.game.playerName.split('').reverse().join('') : "ERROR",
                hint: "당신의 이름이... 뒤바뀌고 있어요"
            },
            {
                display: `${window.game ? window.game.playerName : 'ERROR'}... 이 이름의 글자 수를 세어보세요.`,
                answer: window.game ? window.game.playerName.length.toString() : "0",
                hint: "하나씩... 천천히... 세어보세요"
            },
            {
                display: `"${window.game ? window.game.playerName : 'ERROR'}"... 이 아름다운 이름의 첫 글자는?`,
                answer: window.game ? window.game.playerName.charAt(0) : "E",
                hint: "당신의 이름을... 계속 중얼거리고 있어요"
            }
        ];
        
        return puzzles[Math.floor(Math.random() * puzzles.length)];
    }
    
    // 장소 관련 퍼즐
    generateLocationPuzzle() {
        const puzzles = [
            {
                display: "지금 몇 시인가요? (HH:MM 형식) 시간이... 멈춘 것 같지 않나요?",
                answer: new Date().toTimeString().slice(0, 5),
                hint: "창문 밖이 너무 조용해요..."
            },
            {
                display: "오늘이 며칠인지... 기억하시나요? 시간이 흐르고 있는 걸까요?",
                answer: new Date().getDate().toString(),
                hint: "날짜가... 의미가 있을까요?"
            },
            {
                display: "지금 당신이 있는 곳... 정말 안전한가요?",
                answer: "아니요",
                hint: "안전한 곳은... 없어요"
            }
        ];
        
        return puzzles[Math.floor(Math.random() * puzzles.length)];
    }
    
    // 개인정보 관련 퍼즐
    generatePersonalPuzzle() {
        const puzzles = [
            {
                display: "당신이 가장 두려워하는 숫자는? (0-9) 이미 알고 있어요...",
                answer: Math.floor(Math.random() * 10).toString(),
                hint: "당신의 모든 것을... 보고 있어요"
            },
            {
                display: "휴대폰 번호 마지막 자리... 맞혀볼까요?",
                answer: Math.floor(Math.random() * 10).toString(),
                hint: "당신의 연락처는... 이미 저장했어요"
            }
        ];
        
        return puzzles[Math.floor(Math.random() * puzzles.length)];
    }
    
    // 해킹 관련 퍼즐
    generateHackingPuzzle() {
        const puzzles = [
            {
                display: "마지막 방어 코드... 1234 + 5678 = ? 저항해봐도 소용없어요.",
                answer: "6912",
                hint: "계산해도... 이미 늦었어요"
            },
            {
                display: "당신의 시스템 코드: 1010 (10진수로) 이미 침입했어요...",
                answer: "10",
                hint: "모든 것이... 제 손 안에 있어요"
            },
            {
                display: "최종 암호: A, C, E, G, ? 당신은 이미... 제 것이에요.",
                answer: "I",
                hint: "끝이에요... 영원히 함께해요"
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
        const stageNames = ['당신의 이름', '당신의 위치', '당신의 비밀', '당신의 영혼'];
        const stageWarnings = [
            '이름을... 알고 싶어요',
            '어디 있는지... 찾고 있어요',  
            '모든 것을... 보고 있어요',
            '이제... 함께해요'
        ];
        const stageName = stageNames[this.currentStage] || '알 수 없음';
        const stageWarning = stageWarnings[this.currentStage] || '...';
        
        this.puzzleDisplay.innerHTML = `
            <div class="stage-info" style="color: #ff3333; font-size: 1.1rem; margin-bottom: 1rem; text-shadow: 0 0 10px #ff0000;">
                👁️ ${stageName} 침입 중... (${this.currentStage + 1}/4)
            </div>
            <div class="puzzle-question">${this.currentPuzzle.display}</div>
            <div class="puzzle-hint" style="color: #ff6666;">🔥 ${this.currentPuzzle.hint}</div>
            <div class="stage-warning" style="color: #ff0000; font-size: 0.9rem; margin-top: 1rem; animation: blink 2s infinite;">
                💀 ${stageWarning}... 실패하면 끝이에요.
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
        
        if (userAnswer === correctAnswer) {
            this.puzzleSuccess();
        } else {
            this.puzzleWrong();
        }
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
