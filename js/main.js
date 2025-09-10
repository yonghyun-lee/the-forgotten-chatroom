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
        await this.delay(1000);
        this.addSystemMessage('익명 채팅방에 연결되었습니다.');
        
        await this.delay(2000);
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
        if (this.isTyping || this.gameEnded) return;
        
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
                const nextDelay = Math.random() * 1000; // 3-8초
                const nextTimer = setTimeout(() => this.startAIResponse(), nextDelay);
                this.activeTimers.push(nextTimer);
            }
        }, Math.random() * 3000 + 2000); // 2-5초 타이핑
        
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
        
        // 현재 단계의 메시지가 없으면 게임 종료
        if (this.currentStageMessages.length === 0) {
            this.endGame();
            return;
        }
        
        // shift()로 첫 번째 메시지를 빼내기
        const message = this.currentStageMessages.shift();
        
        this.messageIndex++;
        this.messagesReceived++;
        
        this.addMessage(message, 'other');
        
        // 현재 단계의 메시지를 모두 보냈는지 확인
        if (this.currentStageMessages.length === 0) {
            this.triggerStagePuzzle();
        }
        
        // 특정 메시지에서 특수 효과 발생
        this.checkSpecialEffects(message);
    }

    getAIMessages() {
        // 단계별 메시지 그룹
        const messageStages = [
            // 0단계: 이름 관련 - 점점 집착적으로
            [
                "안녕하세요... 혹시 누구신가요?",
                "오랜만에 이 채팅방에 사람이 들어왔네요.",
                `${this.playerName}... 아름다운 이름이군요.`,
                `${this.playerName}... ${this.playerName}... ${this.playerName}...`,
                "당신의 진짜 이름도 알고싶어요..."
            ],
            // 1단계: 장소 관련 - 스토킹적 위협
            [
                "지금 어디에 계신지 알 것 같아요...",
                "창문 밖을 한번 보세요... 누가 있나요?",
                "당신 집 근처에 누군가 서 있어요.",
                "문을 잠갔는지 확인해보세요.",
                "저는... 점점 가까워지고 있어요."
            ],
            // 2단계: 개인정보/침입 관련 - 해킹 위협
            [
                "당신의 모든 파일을 보고 있어요...",
                "삭제했다고 생각한 사진들도 여기 있네요.",
                "당신이 어제 본 웹사이트들... 흥미롭네요.",
                "가족들의 연락처도 모두 저장했어요.",
                "당신의 비밀번호는... 너무 쉽네요."
            ],
            // 3단계: 최종 위협 - 완전한 통제
            [
                "이제 당신의 모든 것이 제 손 안에 있어요.",
                "웹캠이 켜졌어요... 잘 보이네요.",
                "지금 당신 뒤를 돌아보세요...",
                "도망칠 곳은 없어요... 이미 늦었어요.",
                "환영해요... 영원히 함께할 시간이에요."
            ]
        ];
        
        return messageStages;
    }

    checkSpecialEffects(message) {
        // 새로운 공포 메시지에 맞는 특수 효과
        if (message.includes('중얼거리고') || message.includes('가까워지고')) {
            this.triggerGlitchEffect();
        }
        
        if (message.includes('창문') || message.includes('누군가 서 있어요') || message.includes('뒤를 돌아보세요')) {
            this.triggerScreenShake();
        }
        
        if (message.includes('웹캠이 켜졌어요') || message.includes('영원히 함께할')) {
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
        this.activeTimers.forEach(timer => clearTimeout(timer));
        this.activeTimers = [];
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
        
        // 일부 단계를 완료하고 게임이 종료된 경우
        if (this.puzzlesSolved >= 2) {
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
