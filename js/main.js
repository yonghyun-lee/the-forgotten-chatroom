// 잊혀진 채팅방 - 서연의 이야기
// 메인 게임 로직

class ForgottenChatroom {
    constructor() {
        this.playerName = '';
        this.currentStage = 'start'; // start, tutorial, investigation, final
        this.messageHistory = [];
        this.isTyping = false;
        
        // 게임 상태
        this.gameState = {
            tutorialComplete: false,
            questionsAsked: [],
            evidenceFound: [],
            seoyeonTrust: 50, // 0-100
            mysteryLevel: 0 // 0: 모름, 1: 의심, 2: 확신, 3: 진실
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showStartScreen();
    }

    setupEventListeners() {
        // 시작 버튼
        const startBtn = document.getElementById('start-btn');
        const playerNameInput = document.getElementById('player-name');
        
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startGame());
        }
        
        if (playerNameInput) {
            playerNameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.startGame();
            });
        }

        // 채팅 입력
        const chatInput = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-btn');
        
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendPlayerMessage());
        }
        
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendPlayerMessage();
            });
        }

        // 재시작 버튼
        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => this.restartGame());
        }
    }

    // ===============================
    // 화면 관리 함수들
    // ===============================
    
    showStartScreen() {
        this.hideAllScreens();
        const startScreen = document.getElementById('start-screen');
        if (startScreen) {
            startScreen.classList.add('active');
        }
    }

    showChatScreen() {
        this.hideAllScreens();
        const chatScreen = document.getElementById('chat-screen');
        if (chatScreen) {
            chatScreen.classList.add('active');
        }
        
        // 채팅 입력 활성화
        this.enableChatInput();
        this.updateConnectionStatus('연결됨');
    }

    hideAllScreens() {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => screen.classList.remove('active'));
    }

    enableChatInput() {
        const chatInput = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-btn');
        
        if (chatInput) chatInput.disabled = false;
        if (sendBtn) sendBtn.disabled = false;
    }

    disableChatInput() {
        const chatInput = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-btn');
        
        if (chatInput) chatInput.disabled = true;
        if (sendBtn) sendBtn.disabled = true;
    }

    updateConnectionStatus(status) {
        const statusText = document.getElementById('status-text');
        if (statusText) {
            statusText.textContent = status;
        }
        
        const statusDot = document.querySelector('.status-dot');
        if (statusDot) {
            statusDot.className = `status-dot ${status === '연결됨' ? 'online' : 'offline'}`;
        }
    }

    // ===============================
    // 메시지 시스템
    // ===============================

    // 채팅 메시지 추가 (기존 CSS 스타일에 맞춤)
    addMessage(sender, text, type = 'normal') {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        
        // 기존 CSS 클래스에 맞춰 설정
        let messageClass = 'message';
        if (type === 'player') {
            messageClass += ' user';
        } else if (type === 'stranger') {
            messageClass += ' other';
        } else if (type === 'system') {
            messageClass += ' system';
        }
        
        messageDiv.className = messageClass;
        
        const timestamp = new Date().toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // 기존 CSS 구조에 맞춰 수정
        messageDiv.innerHTML = `
            <div>${text}</div>
            <div class="message-time">${timestamp}</div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // 메시지 히스토리에 저장
        this.messageHistory.push({
            sender,
            text,
            type,
            timestamp: new Date()
        });
    }

    // 익명 사용자(서연) 메시지 보내기
    sendSeoyeonMessage(text, delay = 1000) {
        return new Promise((resolve) => {
            // 타이핑 인디케이터 표시
            this.showTypingIndicator();
            
            setTimeout(() => {
                this.hideTypingIndicator();
                this.addMessage('익명 사용자', text, 'stranger');
                
                // 사운드 효과
                if (window.effectsManager) {
                    window.effectsManager.playTone(200, 0.1);
                }
                
                resolve();
            }, delay);
        });
    }

    // 여러 메시지를 순차적으로 보내기
    async sendSeoyeonMessages(messages, baseDelay = 2000) {
        for (let i = 0; i < messages.length; i++) {
            const message = messages[i];
            const delay = typeof message === 'object' ? message.delay : baseDelay;
            const text = typeof message === 'object' ? message.text : message;
            
            await this.sendSeoyeonMessage(text, delay);
        }
    }

    // 시스템 메시지 보내기
    sendSystemMessage(text) {
        this.addMessage('시스템', text, 'system');
    }

    // 플레이어 메시지 보내기
    sendPlayerMessage() {
        const chatInput = document.getElementById('chat-input');
        if (!chatInput) return;
        
        const message = chatInput.value.trim();
        if (!message) return;
        
        chatInput.value = '';
        this.addMessage(this.playerName, message, 'player');
        
        // 메시지 처리
        this.processPlayerMessage(message);
    }

    // 타이핑 인디케이터 관리
    showTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.style.display = 'flex';
        }
        this.isTyping = true;
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
        this.isTyping = false;
    }

    // ===============================
    // 게임 진행 함수들
    // ===============================

    startGame() {
        const playerNameInput = document.getElementById('player-name');
        if (!playerNameInput) return;
        
        this.playerName = playerNameInput.value.trim();
        
        if (!this.playerName) {
            alert('이름을 입력해주세요.');
            return;
        }

        this.showChatScreen();
        this.startTutorial();
    }

    async startTutorial() {
        this.sendSystemMessage('익명 사용자가 채팅방에 입장했습니다.');
        
        // 서연의 첫 메시지들 (이름을 모르는 상태)
        const introMessages = [
            { text: '안녕...', delay: 2000 },
            { text: '혼자야?', delay: 3000 },
            { text: '나도... 이름이 있었는데...', delay: 3000 },
            { text: '이름을 말해줘... 제발...', delay: 2000 }
        ];
        
        await this.sendSeoyeonMessages(introMessages);
        
        // 튜토리얼 경고 표시
        this.showTutorialWarning();
    }

    showTutorialWarning() {
        this.sendSystemMessage('⚠️ 10초 안에 적절한 응답을 하세요!');
        
        // 10초 타이머 시작
        this.startTutorialTimer();
        this.currentStage = 'tutorial';
    }

    startTutorialTimer() {
        let timeLeft = 10;
        
        const timer = setInterval(() => {
            timeLeft--;
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                this.tutorialFailed();
            } else if (timeLeft <= 3) {
                // 마지막 10초 경고
                if (timeLeft % 2 === 0) {
                    this.sendSystemMessage(`⚠️ ${timeLeft}초 남음!`);
                }
            }
        }, 1000);
        
        this.tutorialTimer = timer;
    }

    async tutorialFailed() {
        await this.sendSeoyeonMessage('시간이 다 됐어...', 1000);
        await this.sendSeoyeonMessage('너도... 나처럼 될 거야...', 2000);
        
        this.showBadEnding('soul_consumed');
    }

    // 플레이어 메시지 처리
    processPlayerMessage(message) {
        if (this.currentStage === 'tutorial') {
            this.processTutorialMessage(message);
        } else if (this.currentStage === 'investigation') {
            this.processInvestigationMessage(message);
        } else {
            // 예상치 못한 스테이지에서의 메시지 처리
            console.log(`Unexpected message in stage: ${this.currentStage}`);
        }
    }

    async processTutorialMessage(message) {
        const lowerMessage = message.toLowerCase();
        
        // "그만" 관련 메시지 체크
        if (lowerMessage.includes('그만') || lowerMessage.includes('stop') || 
            lowerMessage.includes('하지마') || lowerMessage.includes('싫어')) {
            
            // 튜토리얼 성공
            if (this.tutorialTimer) {
                clearInterval(this.tutorialTimer);
                this.tutorialTimer = null;
            }
            
            await this.sendSeoyeonMessage('...', 1500);
            await this.sendSeoyeonMessage('이름을 말하지 않으면 어차피 넌 여기서 못 나가', 2000);
            
            this.startInvestigation();
            return;
        }

        // 이름을 말하는 경우
        if (this.isNameReveal(message)) {
            // 서연이 플레이어 이름을 알게 됨
            await this.sendSeoyeonMessage(`${this.playerName}... 고마워...`, 1500);
            await this.sendSeoyeonMessage('이제 너도 나와 함께...', 2000);
            this.showBadEnding('name_revealed');
            return;
        }

        // 일반적인 응답
        await this.sendSeoyeonMessage('이름... 이름을 말해줘...', 1500);
    }

    isNameReveal(message) {
        // 플레이어가 자신의 이름이나 "서연"을 말하는 경우
        return message.includes(this.playerName) || 
               message.includes('서연') || 
               message.includes('seoyeon');
    }

    async startInvestigation() {
        this.currentStage = 'investigation';
        this.gameState.tutorialComplete = true;
        
        await this.sendSeoyeonMessage('궁금한 게 있으면... 물어봐도 돼', 2000);
        
        // 질문 툴팁 표시
        setTimeout(() => {
            this.showQuestionTooltip();
        }, 1000);
    }

    // 질문 툴팁 표시
    showQuestionTooltip() {
        // 기존 툴팁이 있다면 제거
        const existingTooltip = document.querySelector('.question-tooltip');
        if (existingTooltip) {
            existingTooltip.remove();
        }

        const tooltip = document.createElement('div');
        tooltip.className = 'question-tooltip';
        
        const allowedQuestions = [
            '너는 이름이 뭔데?',
            '이 채팅방은 대체 뭐야?',
            '너 지금 어디에 있어?',
            '너 몇 살이야?',
            '너에게 무슨 일이 일어났어?',
            '왜 혼자였어?'
        ];
        
        tooltip.innerHTML = `
            <div class="tooltip-header">💡 사용 가능한 질문들</div>
            <div class="tooltip-content">
                ${allowedQuestions.map(question => 
                    `<div class="tooltip-question" onclick="game.selectQuestion('${question}')">${question}</div>`
                ).join('')}
            </div>
            <div class="tooltip-footer">질문을 클릭하거나 직접 입력하세요!</div>
            <button class="tooltip-close" onclick="game.closeQuestionTooltip()">×</button>
        `;
        
        // 입력창 컨테이너에 상대적으로 위치
        const chatInputContainer = document.querySelector('.chat-input-container');
        if (chatInputContainer) {
            chatInputContainer.style.position = 'relative';
            chatInputContainer.appendChild(tooltip);
            
            // 도움말 버튼이 없다면 추가
            this.addHelpButton(chatInputContainer);
        } else {
            document.body.appendChild(tooltip);
        }
        
        // 10초 후 자동으로 사라짐
        setTimeout(() => {
            if (tooltip.parentNode) {
                tooltip.remove();
            }
        }, 10000);
    }

    // 질문 선택 (클릭 시)
    selectQuestion(question) {
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.value = question;
            chatInput.focus();
        }
        this.closeQuestionTooltip();
    }

    // 툴팁 닫기
    closeQuestionTooltip() {
        const tooltip = document.querySelector('.question-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }

    // 도움말 버튼 추가
    addHelpButton(container) {
        // 이미 버튼이 있다면 추가하지 않음
        if (container.querySelector('.help-button')) {
            return;
        }

        const helpButton = document.createElement('button');
        helpButton.className = 'help-button';
        helpButton.innerHTML = '💡';
        helpButton.title = '질문 목록 보기';
        helpButton.onclick = () => this.showQuestionTooltip();
        
        container.appendChild(helpButton);
    }

    processInvestigationMessage(message) {
        // 질문 처리 로직 (나중에 구현)
        this.sendSeoyeonMessage('흥미로운 질문이네... 하지만 아직 구현되지 않았어', 1000);
    }

    // ===============================
    // 엔딩 시스템
    // ===============================

    showBadEnding(type) {
        this.disableChatInput();
        
        let title, description;
        
        switch (type) {
            case 'soul_consumed':
                title = '영혼 잠식';
                description = '시간 안에 올바른 선택을 하지 못했습니다. 당신의 영혼이 서연에게 잠식되었습니다.';
                break;
            case 'name_revealed':
                title = '영혼 잠식';
                description = '이름을 말하는 순간, 서연과 영원히 함께하게 되었습니다.';
                break;
        }
        
        setTimeout(() => {
            this.showEndingScreen(title, description, 'bad');
        }, 3000);
    }

    showEndingScreen(title, description, type) {
        this.hideAllScreens();
        const endingScreen = document.getElementById('ending-screen');
        if (!endingScreen) return;
        
        endingScreen.classList.add('active');
        
        const endingContent = document.getElementById('ending-content');
        if (endingContent) {
            endingContent.innerHTML = `
                <div class="ending-title ${type}">${title}</div>
                <div class="ending-description">${description}</div>
            `;
        }
    }

    // ===============================
    // 유틸리티 함수들
    // ===============================

    restartGame() {
        // 게임 상태 초기화
        this.playerName = '';
        this.currentStage = 'start';
        this.messageHistory = [];
        this.isTyping = false;
        
        this.gameState = {
            tutorialComplete: false,
            questionsAsked: [],
            evidenceFound: [],
            seoyeonTrust: 50,
            mysteryLevel: 0
        };

        // 타이머 정리
        if (this.tutorialTimer) {
            clearInterval(this.tutorialTimer);
            this.tutorialTimer = null;
        }

        // 채팅 메시지 초기화
        const messagesContainer = document.getElementById('chat-messages');
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
        }

        // 입력창 초기화
        const chatInput = document.getElementById('chat-input');
        const playerNameInput = document.getElementById('player-name');
        
        if (chatInput) chatInput.value = '';
        if (playerNameInput) playerNameInput.value = '';

        this.showStartScreen();
    }
}

// 게임 인스턴스 생성
let game;

document.addEventListener('DOMContentLoaded', () => {
    game = new ForgottenChatroom();
});
