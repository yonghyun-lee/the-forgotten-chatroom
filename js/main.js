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
        if (this.isTyping) return;
        
        this.isTyping = true;
        this.showTypingIndicator();
        
        setTimeout(() => {
            this.hideTypingIndicator();
            this.addAIMessage();
            this.isTyping = false;
            
            // 다음 AI 응답을 위한 랜덤 지연
            const nextDelay = Math.random() * 5000 + 3000; // 3-8초
            setTimeout(() => this.startAIResponse(), nextDelay);
        }, Math.random() * 3000 + 2000); // 2-5초 타이핑
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
}

// 게임 시작
document.addEventListener('DOMContentLoaded', () => {
    window.game = new HorrorChatGame();
});
