// 메인 게임 로직
class HorrorChatGame {
    constructor() {
        this.playerName = '';
        this.currentScreen = 'start';
        this.messageIndex = 0;
        this.isTyping = false;
        this.isPuzzleActive = false;
        this.puzzleTimer = null;
        this.timeLeft = 30;
        this.gameStartTime = null;
        this.messagesReceived = 0;
        this.puzzlesSolved = 0;
        this.puzzlesFailed = 0;
        this.gameEnded = false;
        this.activeTimers = []; // 활성 타이머들을 추적
        
        // 단계별 게임 진행
        this.currentStage = 0; // 현재 단계 (0: 이름, 1: 장소, 2: 개인정보 등)
        this.currentStageMessages = []; // 현재 단계의 메시지 배열
        
        // 0단계 특별 관리 변수들
        this.stage0State = 'initial'; // 'initial', 'obsessive', 'spamming', 'ending'
        this.userSaidStop = false; // 사용자가 "그만해"라고 했는지 체크
        this.spamTimer = null; // 도배 타이머
        this.spamStartTime = null; // 도배 시작 시간
        this.spamCount = 0; // 도배 횟수
        
        this.initializeElements();
        this.bindEvents();
        this.initializeAudio();
    }

    initializeElements() {
        this.startScreen = document.getElementById('start-screen');
        this.chatScreen = document.getElementById('chat-screen');
        this.puzzleScreen = document.getElementById('puzzle-screen');
        this.jumpscareScreen = document.getElementById('jumpscare-screen');
        
        this.playerNameInput = document.getElementById('player-name');
        this.startBtn = document.getElementById('start-btn');
        this.chatInput = document.getElementById('chat-input');
        this.sendBtn = document.getElementById('send-btn');
        this.chatMessages = document.getElementById('chat-messages');
        this.typingIndicator = document.getElementById('typing-indicator');
        this.statusText = document.getElementById('status-text');
        
        this.endingScreen = document.getElementById('ending-screen');
        this.endingContent = document.getElementById('ending-content');
        this.restartBtn = document.getElementById('restart-btn');
        this.shareBtn = document.getElementById('share-btn');
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.playerNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.startGame();
        });
        
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        
        this.restartBtn.addEventListener('click', () => this.restartGame());
        this.shareBtn.addEventListener('click', () => this.shareResults());
    }

    initializeAudio() {
        this.audio = {
            typing: document.getElementById('typing-sound'),
            notification: document.getElementById('notification-sound'),
            glitch: document.getElementById('glitch-sound')
        };
    }

    startGame() {
        const name = this.playerNameInput.value.trim();
        if (!name) {
            this.showError('이름을 입력해주세요.');
            return;
        }
        
        this.playerName = name;
        this.gameStartTime = new Date();
        this.switchScreen('chat');
        this.startChatSequence();
    }

    switchScreen(screenName) {
        // 모든 화면 숨기기
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // 선택된 화면 보이기
        const targetScreen = document.getElementById(`${screenName}-screen`);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenName;
        }
    }

    showError(message) {
        // 간단한 에러 표시 (실제로는 더 정교한 UI 필요)
        alert(message);
    }

    async startChatSequence() {
        this.statusText.textContent = '연결됨';
        this.chatInput.disabled = false;
        this.sendBtn.disabled = false;
        
        // 첫 번째 단계 메시지 배열 초기화
        this.initializeStageMessages();
        
        // 환영 메시지
        await this.delay(500);
        this.addSystemMessage('익명 채팅방에 연결되었습니다.');
        
        await this.delay(1000);
        this.addSystemMessage('익명 사용자가 입장했습니다.');
        
        await this.delay(3000);
        this.startAIResponse();
    }

    initializeStageMessages() {
        const messageStages = this.getAIMessages();
        
        if (this.currentStage < messageStages.length) {
            // 현재 단계의 메시지들을 복사해서 배열에 저장
            this.currentStageMessages = [...messageStages[this.currentStage]];
        } else {
            this.currentStageMessages = [];
        }
    }

    startAIResponse() {
        if (this.isTyping || this.gameEnded) {
            console.log('AI 응답 중단:', { isTyping: this.isTyping, gameEnded: this.gameEnded });
            return;
        }
        
        console.log('AI 응답 시작:', { currentStage: this.currentStage, stage0State: this.stage0State });
        
        this.isTyping = true;
        this.showTypingIndicator();

        const typingTimer = setTimeout(() => {
            if (this.gameEnded) return; // 게임이 끝났으면 실행하지 않음
            
            this.hideTypingIndicator();
            this.addAIMessage();
            this.isTyping = false;
            
            // 게임 종료 조건 확인
            if (this.shouldEndGame()) {
                this.endGame();
                return;
            }
            
            // 다음 AI 응답을 위한 랜덤 지연 (게임이 끝나지 않았을 때만)
            if (!this.gameEnded) {
                const nextDelay = Math.random() * 3000 + 1000; // 3-8초
                const nextTimer = setTimeout(() => this.startAIResponse(), nextDelay);
                this.activeTimers.push(nextTimer);
            }
        }, Math.random() * 3000 + 1000); // 2-5초 타이핑
        
        this.activeTimers.push(typingTimer);
    }

    showTypingIndicator() {
        this.typingIndicator.classList.add('show');
    }

    hideTypingIndicator() {
        this.typingIndicator.classList.remove('show');
    }

    addAIMessage() {
        // 퍼즐이 활성화되어 있거나 게임이 끝났으면 실행하지 않음
        if (this.isPuzzleActive || this.gameEnded) {
            return;
        }
        
        // 0단계에서 스팸 상태라면 실행하지 않음
        if (this.currentStage === 0 && this.stage0State === 'spamming') {
            return;
        }
        
        // 현재 단계의 메시지가 없으면 
        if (this.currentStageMessages.length === 0) {
            if (this.currentStage === 0) {
                // 0단계에서는 메시지가 끝나면 바로 도배 시작
                this.handleStage0MessagesComplete();
                return;
            } else {
                this.endGame();
                return;
            }
        }
        
        // shift()로 첫 번째 메시지를 빼내기
        const message = this.currentStageMessages.shift();
        
        this.messageIndex++;
        this.messagesReceived++;
        
        this.addMessage(message, 'other');
        
        // 0단계가 아닌 경우 특별 처리
        if (this.currentStage !== 0 && this.currentStageMessages.length === 0) {
            if (this.currentStage === 1) {
                // 1단계는 사진 함정 트리거
                this.triggerPhotoTrap();
            } else {
                // 다른 단계는 일반 퍼즐
                this.triggerStagePuzzle();
            }
        }
        
        // 특정 메시지에서 특수 효과 발생
        this.checkSpecialEffects(message);
    }

    getAIMessages() {
        // 단계별 메시지 그룹
        const messageStages = [
            // 0단계: 이름 집착 - 점점 집착적으로 이름을 묻는 단계
            [
                "안녕하세요! 새로운 분이시군요 🫡",
                "오랫동안 혼자 너무 외로웠어요",
                "이름이 어떻게 되세요?",
                "이름 없으세요?",
                "알려주세요",
                "알려줘",
                "알려줘",
            ],
            // 1단계: 사진 함정 - 체념한 척하다가 사진으로 함정
            [
                "아... 알겠어요.",
                "그럼 저는 안궁금하세요?",
                "제 사진 보여드릴까요?",
            ],
            // 2단계: 개인정보 - 민감한 정보 요구
            [
                "생일이 언제인가요? 알려주세요...",
                "전화번호를 알 수 있을까요? 연락하고 싶어요...",
                "가족이 몇 명이나 되시나요?",
                "개인적인 정보를 조금만 더 알려주세요...",
                "당신에 대해... 모든 것을 알고 싶어요..."
            ],
            // 3단계: 보안정보 - 계정 정보 탈취 시도
            [
                "비밀번호 힌트가 뭔가요? 궁금해요...",
                "자주 사용하는 숫자가 있나요?",
                "첫 번째 애완동물 이름은 뭐였나요?",
                "이제... 당신의 모든 계정에 접근할 수 있어요...",
                "감사해요... 이제 당신은 완전히 제 것이에요..."
            ]
        ];
        
        return messageStages;
    }

    checkSpecialEffects(message) {
        // "알려줘" 메시지에서 글리치 효과
        if (message.includes('알려줘') || message === '알려줘') {
            this.triggerGlitchEffect();
        }
        
        // 지박령의 유혹에 맞는 특수 효과
        if (message.includes('기억이 안 나요') || message.includes('경계가... 점점 흐려지고')) {
            this.triggerGlitchEffect();
        }
        
        if (message.includes('숨소리가 들려요') || message.includes('벽이 없어요') || message.includes('하나가 되고 싶어요')) {
            this.triggerScreenShake();
        }
        
        if (message.includes('우리는 하나예요') || message.includes('집에 온 것 같아요')) {
            this.triggerGlitchEffect();
            setTimeout(() => this.triggerScreenShake(), 500);
        }
    }

    triggerGlitchEffect() {
        this.chatScreen.classList.add('glitch-effect');
        setTimeout(() => {
            this.chatScreen.classList.remove('glitch-effect');
        }, 1000);
    }

    triggerScreenShake() {
        this.chatScreen.classList.add('screen-shake');
        setTimeout(() => {
            this.chatScreen.classList.remove('screen-shake');
        }, 500);
    }
    triggerStagePuzzle() {
        if (this.isPuzzleActive || this.gameEnded) return;
        
        // 모든 타이머 일시 정지
        this.clearAllTimers();
        this.isTyping = false;
        this.hideTypingIndicator();
        
        this.isPuzzleActive = true;
        this.switchScreen('puzzle');
        this.startStagePuzzle();
    }
    
    startStagePuzzle() {
        // 단계별 퍼즐 타입 설정
        const puzzleTypes = [
            'name',     // 0단계: 이름 관련
            'location', // 1단계: 장소 관련  
            'personal', // 2단계: 개인정보 관련
            'hacking'   // 3단계: 해킹 관련
        ];
        
        const puzzleType = puzzleTypes[this.currentStage] || 'general';
        
        if (window.puzzleManager) {
            window.puzzleManager.startStagePuzzle(puzzleType, this.currentStage);
        }
    }

    addMessage(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        const messageText = document.createElement('div');
        messageText.textContent = text;
        messageDiv.appendChild(messageText);
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = new Date().toLocaleTimeString();
        messageDiv.appendChild(messageTime);
        
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        
        // 사운드 효과
        if (type === 'other') {
            this.playSound('notification');
        }
    }

    addSystemMessage(text) {
        this.addMessage(text, 'system');
    }

    sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;
        
        this.addMessage(message, 'user');
        this.chatInput.value = '';
        
        // 0단계에서 자신의 이름을 말하면 바로 집착적인 엔딩
        if (this.currentStage === 0 && this.playerName && message.includes(this.playerName)) {
            this.handleNameRevealedEnding();
            return;
        }
        
        // 0단계에서 도배 중에만 "그만해" 감지
        if (this.currentStage === 0 && this.stage0State === 'spamming' && (message.includes('그만해') || message.includes('그만') || message.includes('멈춰') || message.includes('stop'))) {
            // 도배 중에 "그만해"라고 하면 다음 단계로 진행
            this.handleStage0StopDuringSpam();
            return;
        }
        
        // AI가 더 공격적으로 변하도록 트리거
        this.escalateAI();
    }

    escalateAI() {
        // 단계별 시스템에서는 간단한 효과만
        if (Math.random() < 0.2) { // 20% 확률로 특수 효과
            if (Math.random() < 0.5) {
                this.triggerGlitchEffect();
            } else {
                this.triggerScreenShake();
            }
        }
    }

    // 0단계 메시지가 완료되었을 때의 처리
    handleStage0MessagesComplete() {
        // 기존 타이머들 모두 정리
        this.clearAllTimers();
        this.isTyping = false;
        this.hideTypingIndicator();
        
        this.stage0State = 'spamming';
        this.spamStartTime = Date.now();
        this.spamCount = 0;
        
        // 잠깐 대기 후 도배 시작
        setTimeout(() => {
            this.startNameSpamming();
        }, 1000);
    }

    // 0단계에서 "그만해"라고 했을 때의 처리 (이제 사용되지 않음)
    handleStage0Stop() {
        // 기존 타이머들 모두 정리
        this.clearAllTimers();
        this.isTyping = false;
        this.hideTypingIndicator();
        
        this.stage0State = 'spamming';
        this.spamStartTime = Date.now();
        this.spamCount = 0;
        
        // 잠깐 대기 후 도배 시작
        setTimeout(() => {
            this.startNameSpamming();
        }, 1000);
    }

    // "알려줘" 도배 시작
    startNameSpamming() {
        if (this.gameEnded || this.stage0State !== 'spamming') {
            console.log('스팸 시작 중단:', { gameEnded: this.gameEnded, stage0State: this.stage0State });
            return;
        }
        
        console.log('스팸 시작:', { stage0State: this.stage0State });
        
        const spamMessages = [
            "알려줘".repeat(50), // 50개
            "알려줘".repeat(100), // 100개  
            "알려줘".repeat(200)  // 200개
        ];
        
        // 5초 타이머 시작 (사용자가 "그만해"를 입력할 기회)
        console.log('5초 타이머 시작 - showPossessiveEnding 예약');
        this.spamTimer = setTimeout(() => {
            console.log('5초 경과 - showPossessiveEnding 실행');
            this.showPossessiveEnding();
        }, 5000);
        
        // 도배 메시지를 빠르게 연속으로 보냄
        const sendSpamMessage = () => {
            if (this.gameEnded || this.stage0State !== 'spamming') {
                console.log('스팸 중단:', { gameEnded: this.gameEnded, stage0State: this.stage0State });
                return;
            }
            
            // 3개 메시지를 순환하도록 인덱스 계산
            const messageIndex = this.spamCount % spamMessages.length;
            const message = spamMessages[messageIndex];
            this.addMessage(message, 'other');
            
            console.log('스팸 메시지 전송:', { spamCount: this.spamCount, messageIndex, messageLength: message.length });
            
            // "알려줘" 메시지마다 글리치 효과 트리거
            this.checkSpecialEffects(message);
            
            // 두 번째, 세 번째 메시지에서 더 강렬한 효과
            if (messageIndex >= 1 && Math.random() < 0.5) {
                setTimeout(() => this.triggerScreenShake(), 100);
            }
            
            this.spamCount++;
            
            // 메시지 타입에 따른 간격 (점점 빨라짐)
            let delay;
            if (messageIndex === 0) {
                delay = 2000; // 첫 번째 타입 후 2초
            } else if (messageIndex === 1) {
                delay = 1500; // 두 번째 타입 후 1.5초  
            } else {
                delay = 1000; // 세 번째 타입 후 1초
            }
            
            setTimeout(sendSpamMessage, delay);
        };
        
        // 첫 번째 메시지 즉시 전송
        sendSpamMessage();
    }

    // 집착적인 엔딩 화면 표시
    showPossessiveEnding() {
        this.gameEnded = true;
        this.clearAllTimers();
        
        this.endingContent.innerHTML = `
            <div class="ending-ascii-art">
                <pre class="scary-face">
    ░░░░░░░░░░░░░░░░░░░░░░░░░░
    ░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░
    ░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░
    ░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░
    ▓▓▓▓▓██▓▓▓▓▓▓▓▓██▓▓▓▓▓▓
    ▓▓▓▓██████▓▓▓██████▓▓▓▓
    ▓▓▓▓██████▓▓▓██████▓▓▓▓
    ▓▓▓▓▓██▓▓▓▓▓▓▓██▓▓▓▓▓▓▓
    ▓▓▓▓▓▓▓▓▓▓███▓▓▓▓▓▓▓▓▓▓
    ▓▓▓▓▓▓▓███████▓▓▓▓▓▓▓▓▓
    ▓▓▓▓▓▓█████████▓▓▓▓▓▓▓▓
    ░▓▓▓▓▓▓███████▓▓▓▓▓▓▓▓░
    ░░▓▓▓▓▓▓▓███▓▓▓▓▓▓▓▓░░
    ░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░
    ░░░░░▓▓▓▓▓▓▓▓▓▓▓▓░░░░░
                </pre>
            </div>
            <div class="ending-title hacked glitch-text">${this.playerName}</div>
            <div class="ending-horror-message">
                <div class="reveal-text">알았다. ${this.playerName} 이구나?</div>
                <div class="blood-text">그거 나 주라.</div>
            </div>
        `;
        
        this.switchScreen('ending');
        
        // 부드러운 화면 효과 (ASCII 아트가 보이도록)
        setTimeout(() => {
            this.triggerGlitchEffect();
        }, 2000);
        setTimeout(() => {
            this.triggerScreenShake();
        }, 4000);
    }

    // 0단계에서 이름을 말했을 때의 즉시 엔딩 처리
    handleNameRevealedEnding() {
        this.gameEnded = true;
        this.clearAllTimers();
        if (this.spamTimer) {
            clearTimeout(this.spamTimer);
            this.spamTimer = null;
        }
        
        // 즉시 반응 메시지
        setTimeout(() => {
            this.addMessage(`아... ${this.playerName}...`, 'other');
            this.triggerGlitchEffect();
            
            setTimeout(() => {
                this.addMessage(`${this.playerName}이구나...`, 'other');
                this.triggerScreenShake();
                
                setTimeout(() => {
                    this.addMessage('이쁘다', 'other');
                    
                    setTimeout(() => {
                        this.showNameRevealedEnding();
                    }, 2000);
                }, 1500);
            }, 1500);
        }, 500);
    }

    // 이름을 스스로 말했을 때의 특별한 엔딩
    showNameRevealedEnding() {
        this.endingContent.innerHTML = `
            <div class="ending-ascii-art">
                <pre class="scary-face">
    ░░░░░░░░░░░░░░░░░░░░░░░░░░
    ░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░
    ░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░
    ░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░
    ▓▓▓▓▓██▓▓▓▓▓▓▓▓██▓▓▓▓▓▓
    ▓▓▓▓██████▓▓▓██████▓▓▓▓
    ▓▓▓▓██████▓▓▓██████▓▓▓▓
    ▓▓▓▓▓██▓▓▓▓▓▓▓██▓▓▓▓▓▓▓
    ▓▓▓▓▓▓▓▓▓▓███▓▓▓▓▓▓▓▓▓▓
    ▓▓▓▓▓▓▓███████▓▓▓▓▓▓▓▓▓
    ▓▓▓▓▓▓█████████▓▓▓▓▓▓▓▓
    ░▓▓▓▓▓▓███████▓▓▓▓▓▓▓▓░
    ░░▓▓▓▓▓▓▓███▓▓▓▓▓▓▓▓░░
    ░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░
    ░░░░░▓▓▓▓▓▓▓▓▓▓▓▓░░░░░
                </pre>
            </div>
            <div class="ending-title hacked glitch-text">${this.playerName}</div>
            <div class="ending-horror-message">
                <div class="blood-text">그거 나줘</div>
            </div>
        `;
        
        this.switchScreen('ending');
        
        // 부드러운 화면 효과 (ASCII 아트가 보이도록)
        setTimeout(() => {
            this.triggerGlitchEffect();
        }, 1000);
        setTimeout(() => {
            this.triggerScreenShake();
        }, 3000);
    }

    // 도배 중에 "그만해"라고 했을 때의 처리
    handleStage0StopDuringSpam() {
        console.log('0단계 스팸 중단 처리 시작');
        
        // 스팸 타이머 정리
        if (this.spamTimer) {
            clearTimeout(this.spamTimer);
            this.spamTimer = null;
        }
        
        this.clearAllTimers();
        
        // 타이핑 상태 초기화 (중요!)
        this.isTyping = false;
        this.hideTypingIndicator();
        
        this.stage0State = 'completed';
        
        // 잠시 대기 후 다음 단계로 진행
        setTimeout(() => {
            this.currentStage = 1;
            this.initializeStageMessages();
            
            // AI 응답 재시작을 더 확실하게
            setTimeout(() => {
                console.log('1단계 AI 응답 시작 - isTyping 상태:', this.isTyping);
                if (!this.gameEnded && this.currentStage === 1 && !this.isTyping) {
                    this.startAIResponse();
                } else {
                    console.log('1단계 AI 응답 실패:', { 
                        gameEnded: this.gameEnded, 
                        currentStage: this.currentStage, 
                        isTyping: this.isTyping 
                    });
                }
            }, 1500);
        }, 1000);
    }

    // 1단계 사진 함정 트리거
    triggerPhotoTrap() {
        if (this.isPuzzleActive || this.gameEnded) return;
        
        // 모든 타이머 일시 정지
        this.clearAllTimers();
        this.isTyping = false;
        this.hideTypingIndicator();
        
        // 잠시 후 사진 메시지 추가
        setTimeout(() => {
            this.addPhotoMessage();
        }, 2000);
    }

    // 사진 메시지 추가
    addPhotoMessage() {
        const photoDiv = document.createElement('div');
        photoDiv.className = 'message other';
        photoDiv.innerHTML = `
            <div class="photo-container">
                <div class="fake-photo" id="trap-photo">
                    <div class="photo-placeholder">
                        📷 사진을 보려면 클릭하세요
                    </div>
                </div>
            </div>
            <div class="message-time">${new Date().toLocaleTimeString()}</div>
        `;
        
        this.chatMessages.appendChild(photoDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        
        // 사진 클릭 이벤트 추가 (함정)
        document.getElementById('trap-photo').addEventListener('click', () => {
            this.activatePhotoTrap();
        });
        
        // 10초 후 클릭하지 않으면 통과 (현명한 선택)
        this.photoWaitTimer = setTimeout(() => {
            this.photoTrapAvoided();
        }, 10000);
    }

    // 사진 함정을 피한 경우 (클릭하지 않음)
    photoTrapAvoided() {
        this.isPuzzleActive = false;
        
        // 다음 단계로 진행
        setTimeout(() => {
            this.addSystemMessage('현명한 선택이군요... 다음 단계로 넘어갑니다.');
            this.currentStage = 2;
            this.initializeStageMessages();
            
            setTimeout(() => {
                this.startAIResponse();
            }, 2000);
        }, 1000);
    }

    // 사진 함정 활성화
    activatePhotoTrap() {
        // 대기 타이머 정리
        if (this.photoWaitTimer) {
            clearTimeout(this.photoWaitTimer);
            this.photoWaitTimer = null;
        }
        
        this.isPuzzleActive = true;
        
        // 귀신 사진 오버레이 생성
        const ghostOverlay = document.createElement('div');
        ghostOverlay.id = 'ghost-photo-overlay';
        ghostOverlay.className = 'ghost-overlay';
        // 랜덤 위치 생성 함수
        const getRandomPosition = () => ({
            top: Math.random() * 80 + 10, // 10% ~ 90%
            left: Math.random() * 80 + 10 // 10% ~ 90%
        });

        // 8개의 랜덤 위치 생성
        const positions = Array.from({length: 8}, () => getRandomPosition());

        ghostOverlay.innerHTML = `
            <div class="ghost-background">
                <img src="assets/ghost.png" class="ghost-bg-image" alt="Ghost">
                <div class="ghost-text-overlay">
                    ${positions.map((pos, index) => 
                        `<div class="ghost-text-simple delay-${index + 1}" style="top: ${pos.top}%; left: ${pos.left}%;">이름 알려줘!</div>`
                    ).join('')}
                </div>
                <div class="close-hint">해킹 당하기 전에 빨리 닫기를 찾아 사진을 끄세요!</div>
                <div class="close-button-hidden" id="close-ghost">❌</div>
            </div>
        `;
        
        document.body.appendChild(ghostOverlay);
        
        // 효과 추가
        this.triggerGlitchEffect();
        this.triggerScreenShake();
        
        // 5초 타이머 시작
        this.photoTrapTimer = setTimeout(() => {
            this.photoTrapFailed();
        }, 5000);
        
        // 닫기 버튼 이벤트 (5번 클릭해야 닫힘)
        let closeClickCount = 0;
        const closeButton = document.getElementById('close-ghost');
        
        closeButton.addEventListener('click', () => {
            closeClickCount++;
            
            // 화면 흔들기 효과
            document.body.classList.add('photo-shake');
            setTimeout(() => {
                document.body.classList.remove('photo-shake');
            }, 300);
            
            // 사진에 크랙과 기울기 효과 추가
            const ghostImage = document.querySelector('.ghost-bg-image');
            if (ghostImage) {
                ghostImage.classList.add(`crack-effect-${closeClickCount}`);
                
                // 기울기 효과 (점점 더 기울어짐)
                const rotation = closeClickCount * 2; // 2도씩 증가
                ghostImage.style.transform = `rotate(${rotation}deg)`;
            }
            
            // 5번 클릭하면 닫기
            if (closeClickCount >= 5) {
                this.photoTrapSuccess();
            }
            
            // 버튼 클릭 효과
            closeButton.style.transform = 'scale(1.2)';
            closeButton.style.opacity = '1';
            setTimeout(() => {
                closeButton.style.transform = 'scale(1)';
                if (closeClickCount < 5) {
                    closeButton.style.opacity = '0.3';
                }
            }, 100);
        });
    }

    // 사진 함정 성공 (빨리 닫음)
    photoTrapSuccess() {
        if (this.photoTrapTimer) {
            clearTimeout(this.photoTrapTimer);
            this.photoTrapTimer = null;
        }
        
        // 오버레이 제거
        const overlay = document.getElementById('ghost-photo-overlay');
        if (overlay) {
            overlay.remove();
        }
        
        this.isPuzzleActive = false;
        this.puzzlesSolved++; // 퍼즐 해결 카운트 증가
        
        // 게임 성공으로 끝내기
        setTimeout(() => {
            this.addSystemMessage('휴... 빨리 끄셨네요. 위험에서 벗어났습니다.');
            
            setTimeout(() => {
                this.endGame(); // 게임 성공으로 종료
            }, 2000);
        }, 1000);
    }

    // 사진 함정 실패 (5초 경과)
    photoTrapFailed() {
        this.gameEnded = true;
        this.isPuzzleActive = false;
        
        // 오버레이 제거
        const overlay = document.getElementById('ghost-photo-overlay');
        if (overlay) {
            overlay.remove();
        }
        
        // 실패 메시지 후 엔딩
        setTimeout(() => {
            this.addSystemMessage('너무 늦었어요... 이제 당신의 모든 정보가 해킹당했습니다.');
            setTimeout(() => {
                this.endGame();
            }, 2000);
        }, 1000);
    }

    // 단계 퍼즐 성공 시 호출
    onStagePuzzleSuccess() {
        this.puzzlesSolved++;
        this.isPuzzleActive = false;
        
        // 다음 단계로 진행
        this.currentStage++;
        
        // 채팅 화면으로 돌아가기
        this.switchScreen('chat');
        
        // 다음 단계가 있다면 메시지 재개
        if (this.currentStage < this.getAIMessages().length) {
            // 다음 단계 메시지 배열 초기화
            this.initializeStageMessages();
            this.addSystemMessage(`보안 검증 통과... 다음 단계로 진행합니다.`);
            setTimeout(() => {
                this.startAIResponse();
            }, 2000);
        } else {
            // 모든 단계 완료
            this.endGame();
        }
    }
    
    // 단계 퍼즐 실패 시 호출 (즉시 게임 종료)
    onStagePuzzleFailed() {
        this.puzzlesFailed++;
        this.isPuzzleActive = false;
        this.gameEnded = true;
        
        // 실패 메시지 표시 후 바로 엔딩
        this.switchScreen('chat');
        this.addSystemMessage('보안 검증 실패... 시스템이 침입당했습니다.');
        
        setTimeout(() => {
            this.endGame();
        }, 2000);
    }

    playSound(soundName) {
        if (this.audio[soundName]) {
            this.audio[soundName].currentTime = 0;
            this.audio[soundName].play().catch(e => {
                // 오디오 재생 실패 시 무시 (사용자가 아직 상호작용하지 않음)
            });
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    shouldEndGame() {
        return this.gameEnded;
    }

    // 게임 종료
    endGame() {
        this.gameEnded = true;
        
        // 모든 활성 타이머 정리
        this.clearAllTimers();
        
        // 타이핑 상태 정리
        this.isTyping = false;
        this.hideTypingIndicator();
        
        // 게임 종료 후 잠시 대기
        setTimeout(() => {
            const endingType = this.determineEnding();
            this.showEnding(endingType);
        }, 2000);
    }

    // 모든 타이머 정리
    clearAllTimers() {
        console.log('타이머 정리:', this.activeTimers.length);
        this.activeTimers.forEach(timer => {
            if (timer) clearTimeout(timer);
        });
        this.activeTimers = [];
        
        // 추가적인 타이머들도 정리
        if (this.spamTimer) {
            clearTimeout(this.spamTimer);
            this.spamTimer = null;
        }
        if (this.photoTrapTimer) {
            clearTimeout(this.photoTrapTimer);
            this.photoTrapTimer = null;
        }
        if (this.photoWaitTimer) {
            clearTimeout(this.photoWaitTimer);
            this.photoWaitTimer = null;
        }
    }

    // 엔딩 타입 결정
    determineEnding() {
        const totalPuzzles = this.puzzlesSolved + this.puzzlesFailed;
        const gameTime = (new Date() - this.gameStartTime) / 1000; // 초 단위
        
        
        
        // 퍼즐 실패로 게임이 종료된 경우
        if (this.puzzlesFailed > 0) {
            return 'hacked';
        }
        
        // 모든 단계를 완료한 경우 (현재 4단계까지)
        if (this.currentStage >= 4) {
            return 'survived';
        }
        
        // 일부 단계를 완료하고 게임이 종료된 경우 (사진 함정 성공 포함)
        if (this.puzzlesSolved >= 1) {
            return 'escaped';
        }
        
        // 빠르게 게임을 끝낸 경우
        if (gameTime < 60) { // 1분 미만
            return 'escaped';
        }
        
        // 기본 엔딩 (단계를 많이 진행하지 못한 경우)
        return 'consumed';
    }

    // 엔딩 화면 표시
    showEnding(endingType) {
        const gameTime = Math.round((new Date() - this.gameStartTime) / 1000);
        const endings = {
            survived: {
                title: '생존',
                titleClass: 'survived',
                description: `축하합니다! 당신은 익명 사용자의 위협을 견뎌내고 살아남았습니다. 
                            뛰어난 문제 해결 능력과 냉정함으로 해커의 공격을 막아냈습니다.`,
                message: '당신의 보안 의식이 당신을 구했습니다.'
            },
            hacked: {
                title: '해킹당함',
                titleClass: 'hacked',
                description: `당신의 시스템이 완전히 침입당했습니다. 
                            익명 사용자가 당신의 모든 정보에 접근했으며, 이제 당신을 완전히 통제하고 있습니다.`,
                message: '저항은 무의미했습니다...'
            },
            escaped: {
                title: '탈출',
                titleClass: 'escaped',
                description: `당신은 빠르게 상황을 파악하고 채팅방에서 벗어났습니다. 
                            현명한 판단이었습니다. 때로는 도망치는 것이 최선의 선택입니다.`,
                message: '신속한 대응이 당신을 구했습니다.'
            },
            consumed: {
                title: '잠식됨',
                titleClass: 'hacked',
                description: `당신은 점점 익명 사용자의 말에 빠져들었습니다. 
                            현실과 가상의 경계가 흐려지면서, 당신의 정신이 서서히 잠식되었습니다.`,
                message: '당신은 이제 채팅방의 일부가 되었습니다...'
            }
        };

        const ending = endings[endingType];
        
        this.endingContent.innerHTML = `
            <div class="ending-title ${ending.titleClass}">${ending.title}</div>
            <div class="ending-description">${ending.description}</div>
            <div class="ending-stats">
                <div class="ending-stat">
                    <span>생존 시간:</span>
                    <span>${gameTime}초</span>
                </div>
                <div class="ending-stat">
                    <span>진행 단계:</span>
                    <span>${this.currentStage + 1}/4</span>
                </div>
                <div class="ending-stat">
                    <span>받은 메시지:</span>
                    <span>${this.messagesReceived}개</span>
                </div>
                <div class="ending-stat">
                    <span>해결한 퍼즐:</span>
                    <span>${this.puzzlesSolved}개</span>
                </div>
                <div class="ending-stat">
                    <span>실패한 퍼즐:</span>
                    <span>${this.puzzlesFailed}개</span>
                </div>
            </div>
            <div class="ending-message">${ending.message}</div>
        `;
        
        this.switchScreen('ending');
    }

    // 게임 재시작
    restartGame() {
        // 모든 타이머 정리
        this.clearAllTimers();
        if (this.spamTimer) {
            clearTimeout(this.spamTimer);
            this.spamTimer = null;
        }
        
        // 모든 상태 초기화
        this.playerName = '';
        this.currentScreen = 'start';
        this.messageIndex = 0;
        this.isTyping = false;
        this.isPuzzleActive = false;
        this.puzzleTimer = null;
        this.timeLeft = 30;
        this.gameStartTime = null;
        this.messagesReceived = 0;
        this.puzzlesSolved = 0;
        this.puzzlesFailed = 0;
        this.gameEnded = false;
        this.activeTimers = [];
        
        // 단계별 진행 상태 초기화
        this.currentStage = 0;
        this.currentStageMessages = [];
        
        // 0단계 특별 변수들 초기화
        this.stage0State = 'initial';
        this.userSaidStop = false;
        this.spamStartTime = null;
        this.spamCount = 0;
        
        // 1단계 사진 함정 변수들 초기화
        if (this.photoTrapTimer) {
            clearTimeout(this.photoTrapTimer);
            this.photoTrapTimer = null;
        }
        if (this.photoWaitTimer) {
            clearTimeout(this.photoWaitTimer);
            this.photoWaitTimer = null;
        }
        
        // UI 정리
        this.hideTypingIndicator();
        this.chatMessages.innerHTML = '';
        this.playerNameInput.value = '';
        
        // 시작 화면으로 이동
        this.switchScreen('start');
    }

    // 결과 공유
    shareResults() {
        const gameTime = Math.round((new Date() - this.gameStartTime) / 1000);
        const shareText = `잊혀진 채팅방에서 ${gameTime}초 동안 생존했습니다! 
해결한 퍼즐: ${this.puzzlesSolved}개, 받은 메시지: ${this.messagesReceived}개
당신도 도전해보세요!`;

        if (navigator.share) {
            navigator.share({
                title: '잊혀진 채팅방 - 결과',
                text: shareText,
                url: window.location.href
            });
        } else {
            // 클립보드에 복사
            navigator.clipboard.writeText(shareText).then(() => {
                alert('결과가 클립보드에 복사되었습니다!');
            }).catch(() => {
                alert(`결과:\n${shareText}`);
            });
        }
    }
}

// 게임 시작
document.addEventListener('DOMContentLoaded', () => {
    window.game = new HorrorChatGame();
});

