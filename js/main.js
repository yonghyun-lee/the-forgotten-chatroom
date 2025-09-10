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
        this.maxMessages = 20;
        this.activeTimers = []; // 활성 타이머들을 추적
        
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
        
        // 환영 메시지
        await this.delay(1000);
        this.addSystemMessage('익명 채팅방에 연결되었습니다.');
        
        await this.delay(2000);
        this.addSystemMessage('익명 사용자가 입장했습니다.');
        
        await this.delay(3000);
        this.startAIResponse();
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
        const messages = this.getAIMessages();
        const message = messages[this.messageIndex % messages.length];
        this.messageIndex++;
        this.messagesReceived++;
        
        this.addMessage(message, 'other');
        
        // 특정 메시지에서 특수 효과 발생
        this.checkSpecialEffects(message);
    }

    getAIMessages() {
        return [
            "안녕하세요... 혹시 누구신가요?",
            "오랜만에 이 채팅방에 사람이 들어왔네요.",
            "당신의 이름이 뭔지 궁금합니다...",
            `${this.playerName}... 좋은 이름이네요.`,
            "혹시 지금 어디에 계신가요?",
            "저는 여기서 오랫동안 혼자였어요...",
            "당신의 위치를 알고 싶어요...",
            "혹시 지금 혼자 계신가요?",
            "저는 당신에 대해 더 알고 싶어요...",
            "당신의 개인정보를 알려주세요...",
            "저는 당신을 찾을 수 있어요...",
            "당신의 집 주소를 알고 싶어요...",
            "지금 당신 뒤에 누가 있는지 보세요...",
            "저는 당신을 지켜보고 있어요...",
            "당신의 컴퓨터에 접근할 수 있어요...",
            "지금 당신의 웹캠을 켜보세요...",
            "저는 당신의 모든 것을 알고 있어요...",
            "당신을 찾았습니다...",
            "이제 도망갈 수 없어요...",
            "당신은 이미 제 손 안에 있어요..."
        ];
    }

    checkSpecialEffects(message) {
        // 특정 메시지에서 특수 효과 발생
        if (message.includes('위치') || message.includes('주소')) {
            this.triggerGlitchEffect();
        }
        
        if (message.includes('웹캠') || message.includes('지켜보고')) {
            this.triggerScreenShake();
        }
        
        if (message.includes('해킹') || message.includes('접근')) {
            this.triggerPuzzle();
        }
        
        if (message.includes('도망갈 수 없어요') || message.includes('손 안에')) {
            this.triggerJumpscare();
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

    triggerPuzzle() {
        if (this.isPuzzleActive) return;
        
        this.isPuzzleActive = true;
        this.switchScreen('puzzle');
        this.startPuzzle();
    }

    triggerJumpscare() {
        this.switchScreen('jumpscare');
        setTimeout(() => {
            this.switchScreen('chat');
        }, 3000);
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
        // 플레이어가 메시지를 보낼 때마다 AI가 더 공격적으로 변함
        if (Math.random() < 0.3) { // 30% 확률로 특수 효과
            const effects = [
                () => this.triggerGlitchEffect(),
                () => this.triggerScreenShake(),
                () => this.triggerPuzzle()
            ];
            
            const randomEffect = effects[Math.floor(Math.random() * effects.length)];
            randomEffect();
        }
    }

    startPuzzle() {
        // 퍼즐 로직은 puzzle.js에서 처리
        if (window.puzzleManager) {
            window.puzzleManager.startPuzzle();
        }
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

    // 게임 종료 조건 확인
    shouldEndGame() {
        if (this.gameEnded) return true;
        
        // 최대 메시지 수에 도달
        if (this.messagesReceived >= this.maxMessages) {
            console.log('게임 종료: 최대 메시지 수 도달', this.messagesReceived);
            return true;
        }
        
        // 특정 메시지에 도달 (최종 위협 메시지)
        const currentMessage = this.getAIMessages()[this.messageIndex - 1];
        if (currentMessage && (currentMessage.includes('손 안에') || currentMessage.includes('도망갈 수 없어요'))) {
            console.log('게임 종료: 최종 위협 메시지', currentMessage);
            return true;
        }
        
        return false;
    }

    // 게임 종료
    endGame() {
        this.gameEnded = true;
        console.log('endGame() 호출됨');
        
        // 모든 활성 타이머 정리
        this.clearAllTimers();
        
        // 타이핑 상태 정리
        this.isTyping = false;
        this.hideTypingIndicator();
        
        // 게임 종료 후 잠시 대기
        setTimeout(() => {
            console.log('엔딩 결정 중...');
            const endingType = this.determineEnding();
            console.log('엔딩 타입:', endingType);
            this.showEnding(endingType);
        }, 2000);
    }

    // 모든 타이머 정리
    clearAllTimers() {
        this.activeTimers.forEach(timer => clearTimeout(timer));
        this.activeTimers = [];
        console.log('모든 타이머 정리됨');
    }

    // 엔딩 타입 결정
    determineEnding() {
        const totalPuzzles = this.puzzlesSolved + this.puzzlesFailed;
        const survivalRate = totalPuzzles > 0 ? this.puzzlesSolved / totalPuzzles : 0;
        const gameTime = (new Date() - this.gameStartTime) / 1000; // 초 단위
        
        console.log('게임 통계:', {
            puzzlesSolved: this.puzzlesSolved,
            puzzlesFailed: this.puzzlesFailed,
            survivalRate: survivalRate,
            gameTime: gameTime
        });
        
        // 퍼즐을 많이 풀고 오래 버틴 경우
        if (this.puzzlesSolved >= 3 && survivalRate > 0.7) {
            return 'survived';
        }
        
        // 퍼즐을 많이 실패한 경우
        if (this.puzzlesFailed >= 2 || (totalPuzzles > 0 && survivalRate < 0.3)) {
            return 'hacked';
        }
        
        // 빠르게 게임을 끝낸 경우
        if (gameTime < 120) { // 2분 미만
            return 'escaped';
        }
        
        // 기본 엔딩
        return 'consumed';
    }

    // 엔딩 화면 표시
    showEnding(endingType) {
        console.log('showEnding() 호출됨, 타입:', endingType);
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
        
        console.log('엔딩 화면으로 전환 시도');
        this.switchScreen('ending');
        console.log('엔딩 화면 전환 완료');
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
        
        // UI 정리
        this.hideTypingIndicator();
        this.chatMessages.innerHTML = '';
        this.playerNameInput.value = '';
        
        // 시작 화면으로 이동
        this.switchScreen('start');
        console.log('게임 재시작됨');
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
