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
            questionsAsked: [], // 질문한 횟수 추적 {type: 'name', count: 2}
            evidenceFound: [],
            seoyeonTrust: 50, // 0-100
            mysteryLevel: 0, // 0: 모름, 1: 의심, 2: 확신, 3: 진실
            nameRevealed: false // 서연이 자신의 이름을 밝혔는지
        };

        // 질문별 응답 데이터
        this.questionResponses = {
            'name': {
                responses: [
                    '이름... 이름이 뭐였지... 기억이 안 나',
                    '왜 자꾸 그런 걸 묻는 거야? 그 사람처럼...',
                    '말하고 싶지 않아. 절대로.'
                ],
                specialResponse: {
                    trigger: 3, // 3번째 질문 후
                    messages: [
                        '그 사람도... 처음엔 친절했어...',
                        '이름을 물어보고... 집까지 찾아왔어...',
                        '더 이상... 말하고 싶지 않아'
                    ]
                },
                evidence: {
                    id: 'name_trauma',
                    description: '익명 사용자는 이름과 관련된 트라우마가 있다'
                },
                keywords: ['이름']
            },
            'location': {
                responses: [],
                specialResponse: {
                    trigger: 1, // 첫 질문 후 바로
                    messages: [],
                    showPhoto: true,
                    afterPhotoMessages: [
                        '여기... 여기에 있어'
                    ]
                },
                evidence: {
                    id: 'basement_location',
                    description: '익명 사용자는 어둡고 음침한 지하실에 있다'
                },
                keywords: ['어디', '위치', '장소', '있어']
            }
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
            { text: '안녕', delay: 2000 },
            { text: '반가워 이름이 뭐야?', delay: 3000 },
            { text: '이름 한번만 말해줘', delay: 2000 }
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


    async processInvestigationMessage(message) {
        // 질문 분석
        const questionType = this.analyzeQuestion(message);
        
        if (questionType) {
            await this.handleQuestion(questionType, message);
        } else {
            // 허용되지 않은 질문
            const responses = [
                '그런 건... 말하고 싶지 않아',
                '다른 걸 물어봐...',
                '그건... 중요하지 않아',
                '다른 게 궁금하지 않아?'
            ];
            
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            await this.sendSeoyeonMessage(randomResponse, 1500);
        }
    }

    // 질문 분석 함수
    analyzeQuestion(message) {
        const lowerMessage = message.toLowerCase();
        
        // 각 질문 타입의 키워드 확인
        for (const [questionType, data] of Object.entries(this.questionResponses)) {
            const hasKeywords = data.keywords.some(keyword => 
                lowerMessage.includes(keyword.toLowerCase())
            );
            
            if (hasKeywords) {
                return questionType;
            }
        }
        
        return null;
    }

    // 질문 처리 함수
    async handleQuestion(questionType, message) {
        const questionData = this.questionResponses[questionType];
        
        // 질문 횟수 추적
        let questionRecord = this.gameState.questionsAsked.find(q => q.type === questionType);
        if (!questionRecord) {
            questionRecord = { type: questionType, count: 0 };
            this.gameState.questionsAsked.push(questionRecord);
        }
        questionRecord.count++;
        
        // 증거 발견은 특별 응답에서 처리
        
        // 응답 선택
        const responseIndex = Math.min(questionRecord.count - 1, questionData.responses.length - 1);
        const response = questionData.responses[responseIndex];
        
        await this.sendSeoyeonMessage(response, 2000);
        
        // 특별 응답 체크
        if (questionData.specialResponse && questionRecord.count >= questionData.specialResponse.trigger) {
            await this.handleSpecialResponse(questionType, questionData.specialResponse);
        }
        
        // 신뢰도 증가
        this.gameState.seoyeonTrust = Math.min(100, this.gameState.seoyeonTrust + 5);
    }

    // 증거 발견 처리
    async discoverEvidence(evidence) {
        if (!this.gameState.evidenceFound.includes(evidence.id)) {
            this.gameState.evidenceFound.push(evidence.id);
            
            setTimeout(() => {
                this.sendSystemMessage(`💡 새로운 증거 발견: ${evidence.description}`);
            }, 1000);
        }
    }

    // 특별 응답 처리
    async handleSpecialResponse(questionType, specialResponse) {
        if (questionType === 'name' && !this.gameState.nameRevealed) {
            // 트라우마 공개 특별 이벤트
            for (let i = 0; i < specialResponse.messages.length; i++) {
                const delay = i === 0 ? 2500 : 3000; // 첫 메시지는 조금 더 빨리
                await this.sendSeoyeonMessage(specialResponse.messages[i], delay);
            }
            
            this.gameState.nameRevealed = true; // 트라우마 공개 완료
            this.gameState.mysteryLevel = Math.max(this.gameState.mysteryLevel, 1); // 의심 단계
            
            // 글리치 효과 먼저 실행
            if (window.effectsManager) {
                window.effectsManager.triggerGlitch(document.querySelector('.chat-messages'));
            }
            
            // 글리치 효과 후 증거 발견 및 조사 계속
            setTimeout(async () => {
                const questionData = this.questionResponses[questionType];
                await this.discoverEvidence(questionData.evidence);
                
                // 잠시 후 조사 단계 계속
                setTimeout(() => {
                    this.sendSystemMessage('💡 다른 질문으로 더 자세히 알아보세요.');
                }, 2000);
                
            }, 1500); // 글리치 효과 후 1.5초 뒤
            
        } else if (questionType === 'location' && specialResponse.showPhoto) {
            // 위치 질문 - 사진 먼저 보여주기
            // 바로 사진 표시
            setTimeout(() => {
                this.showLocationPhoto();
                
                // 사진 표시 후 메시지들 전송
                if (specialResponse.afterPhotoMessages && specialResponse.afterPhotoMessages.length > 0) {
                    setTimeout(async () => {
                        for (let i = 0; i < specialResponse.afterPhotoMessages.length; i++) {
                            const delay = i === 0 ? 2000 : 2500;
                            await this.sendSeoyeonMessage(specialResponse.afterPhotoMessages[i], delay);
                        }
                    }, 1500); // 사진 표시 후 1.5초 뒤
                }
            }, 1000);
        }
    }

    // 위치 사진 표시
    showLocationPhoto() {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;

        const photoDiv = document.createElement('div');
        photoDiv.className = 'message other photo-message';
        
        const timestamp = new Date().toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        photoDiv.innerHTML = `
            <div class="fake-photo" onclick="game.startLocationPuzzle()">
                <img src="assets/location.png" alt="어둠 속 지하실" class="blurred-preview">
                <div class="photo-overlay">
                    <div class="photo-hint">클릭해서 자세히 보기</div>
                </div>
            </div>
            <div class="message-time">${timestamp}</div>
        `;
        
        messagesContainer.appendChild(photoDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // 위치 퍼즐 게임 시작
    startLocationPuzzle() {
        // 퍼즐 오버레이 생성
        const puzzleOverlay = document.createElement('div');
        puzzleOverlay.className = 'puzzle-overlay';
        puzzleOverlay.innerHTML = `
            <div class="puzzle-container">
                <div class="puzzle-header">
                    <h3>📸 사진 퍼즐</h3>
                    <p>조각들을 드래그해서 원래 모습을 복원하세요</p>
                    <button class="puzzle-close" onclick="game.closePuzzle()">×</button>
                </div>
                <div class="puzzle-board" id="puzzle-board">
                    <!-- 퍼즐 조각들이 여기에 생성됨 -->
                </div>
                <div class="puzzle-footer">
                    <div class="puzzle-progress">진행률: <span id="puzzle-progress">0%</span></div>
                    <button class="puzzle-hint" onclick="game.showPuzzleHint()">💡 힌트</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(puzzleOverlay);
        
        // 퍼즐 조각 생성
        this.createPuzzlePieces();
        
        // 배경음 효과
        if (window.effectsManager) {
            window.effectsManager.playTensionSound();
        }
    }

    // 퍼즐 조각 생성
    createPuzzlePieces() {
        const puzzleBoard = document.getElementById('puzzle-board');
        if (!puzzleBoard) return;

        // 3x3 퍼즐 조각 생성
        const pieces = [];
        for (let i = 0; i < 9; i++) {
            const piece = document.createElement('div');
            piece.className = 'puzzle-piece';
            piece.draggable = true;
            piece.dataset.correctPosition = i;
            piece.dataset.currentPosition = i;
            
            // 추상적인 퍼즐 조각 패턴 (실제 이미지 대신)
            const patterns = [
                'linear-gradient(45deg, #333, #111)',
                'linear-gradient(135deg, #444, #222)',
                'radial-gradient(circle, #333, #111)',
                'linear-gradient(90deg, #222, #444)',
                'linear-gradient(180deg, #333, #222)',
                'conic-gradient(from 45deg, #444, #111, #333)',
                'linear-gradient(225deg, #333, #444)',
                'radial-gradient(ellipse, #222, #333)',
                'linear-gradient(270deg, #444, #111)'
            ];
            piece.style.background = patterns[i];
            
            // 조각에 미스터리한 기호 표시
            const symbols = ['?', '⚫', '▲', '◆', '★', '●', '▼', '◇', '☆'];
            piece.innerHTML = `<span class="piece-symbol">${symbols[i]}</span>`;
            
            // 드래그 이벤트
            piece.addEventListener('dragstart', this.handleDragStart.bind(this));
            piece.addEventListener('dragover', this.handleDragOver.bind(this));
            piece.addEventListener('drop', this.handleDrop.bind(this));
            
            pieces.push(piece);
        }
        
        // 조각들을 섞어서 배치
        this.shufflePieces(pieces);
        
        pieces.forEach(piece => puzzleBoard.appendChild(piece));
    }

    // 퍼즐 조각 섞기
    shufflePieces(pieces) {
        for (let i = pieces.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            // 위치 데이터 교환
            const tempPosition = pieces[i].dataset.currentPosition;
            pieces[i].dataset.currentPosition = pieces[j].dataset.currentPosition;
            pieces[j].dataset.currentPosition = tempPosition;
        }
    }

    // 드래그 이벤트 핸들러들
    handleDragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.dataset.currentPosition);
        e.target.classList.add('dragging');
    }

    handleDragOver(e) {
        e.preventDefault();
    }

    handleDrop(e) {
        e.preventDefault();
        const draggedPosition = e.dataTransfer.getData('text/plain');
        const targetPosition = e.target.dataset.currentPosition;
        
        // 위치 교환
        this.swapPieces(draggedPosition, targetPosition);
        
        // 드래그 스타일 제거
        document.querySelector('.dragging')?.classList.remove('dragging');
        
        // 퍼즐 완성 체크
        this.checkPuzzleCompletion();
    }

    // 퍼즐 조각 위치 교환
    swapPieces(pos1, pos2) {
        const pieces = document.querySelectorAll('.puzzle-piece');
        const piece1 = Array.from(pieces).find(p => p.dataset.currentPosition === pos1);
        const piece2 = Array.from(pieces).find(p => p.dataset.currentPosition === pos2);
        
        if (piece1 && piece2) {
            const temp = piece1.dataset.currentPosition;
            piece1.dataset.currentPosition = piece2.dataset.currentPosition;
            piece2.dataset.currentPosition = temp;
        }
    }

    // 퍼즐 완성 체크
    checkPuzzleCompletion() {
        const pieces = document.querySelectorAll('.puzzle-piece');
        let correctPieces = 0;
        
        pieces.forEach(piece => {
            if (piece.dataset.correctPosition === piece.dataset.currentPosition) {
                piece.classList.add('correct');
                correctPieces++;
                
                // 올바른 위치에 놓인 조각에 실제 이미지 표시
                const correctPos = parseInt(piece.dataset.correctPosition);
                piece.style.backgroundImage = 'url("assets/location.png")';
                piece.style.backgroundSize = '300px 300px';
                piece.style.backgroundPosition = `${-(correctPos % 3) * 100}px ${-Math.floor(correctPos / 3) * 100}px`;
                
                // 기호를 반투명하게
                const symbol = piece.querySelector('.piece-symbol');
                if (symbol) symbol.style.opacity = '0.2';
            } else {
                piece.classList.remove('correct');
                // 잘못된 위치면 원래 패턴으로 되돌리기
                const patterns = [
                    'linear-gradient(45deg, #333, #111)',
                    'linear-gradient(135deg, #444, #222)',
                    'radial-gradient(circle, #333, #111)',
                    'linear-gradient(90deg, #222, #444)',
                    'linear-gradient(180deg, #333, #222)',
                    'conic-gradient(from 45deg, #444, #111, #333)',
                    'linear-gradient(225deg, #333, #444)',
                    'radial-gradient(ellipse, #222, #333)',
                    'linear-gradient(270deg, #444, #111)'
                ];
                const originalPos = parseInt(piece.dataset.correctPosition);
                piece.style.background = patterns[originalPos];
                piece.style.backgroundImage = '';
                
                // 기호 다시 보이게
                const symbol = piece.querySelector('.piece-symbol');
                if (symbol) symbol.style.opacity = '1';
            }
        });
        
        const progress = Math.round((correctPieces / 9) * 100);
        const progressElement = document.getElementById('puzzle-progress');
        if (progressElement) {
            progressElement.textContent = `${progress}%`;
        }
        
        // 퍼즐 완성 체크
        console.log(`퍼즐 진행률: ${correctPieces}/9 (${progress}%)`);
        if (correctPieces === 9) {
            console.log('퍼즐 완성! completePuzzle 호출');
            setTimeout(() => {
                this.completePuzzle();
            }, 500);
        }
    }

    // 퍼즐 완성
    async completePuzzle() {
        console.log('completePuzzle 함수 실행됨');
        
        // 성공 효과
        if (window.effectsManager) {
            window.effectsManager.playTone(800, 0.3);
        }
        
        // 완성된 사진 보여주기
        this.showCompletedPuzzlePhoto();
        
        // 증거 발견
        setTimeout(async () => {
            const questionData = this.questionResponses['location'];
            await this.discoverEvidence(questionData.evidence);
        }, 3000);
        
        // 퍼즐 닫기
        setTimeout(() => {
            this.closePuzzle();
            
            // 성공 메시지
            setTimeout(async () => {
                await this.sendSeoyeonMessage('난 계속 여기에 있었어. 그가 나를 이곳으로 끌고 온 뒤로 계속...', 2000);
                await this.sendSeoyeonMessage('이제 이번엔 너의 이름을 알려줘', 2500);
            }, 1000);
            
        }, 5000); // 사진을 더 오래 보여주기 위해 시간 연장
    }

    // 완성된 퍼즐 사진 표시
    showCompletedPuzzlePhoto() {
        const puzzleContainer = document.querySelector('.puzzle-container');
        if (!puzzleContainer) {
            console.error('puzzle-container를 찾을 수 없습니다');
            return;
        }
        
        // 이미 완성된 사진이 있다면 제거
        const existingPhoto = puzzleContainer.querySelector('.completed-puzzle-photo');
        if (existingPhoto) {
            existingPhoto.remove();
        }
        
        // 기존 퍼즐 보드 숨기기
        const puzzleBoard = document.getElementById('puzzle-board');
        const puzzleFooter = document.querySelector('.puzzle-footer');
        
        if (puzzleBoard) puzzleBoard.style.display = 'none';
        if (puzzleFooter) puzzleFooter.style.display = 'none';
        
        // 완성된 사진 컨테이너 생성
        const completedPhotoDiv = document.createElement('div');
        completedPhotoDiv.className = 'completed-puzzle-photo';
        completedPhotoDiv.innerHTML = `
            <div class="completed-photo-container">
                <img src="assets/location.png" alt="지하실의 모습" class="completed-photo">
                <div class="photo-reveal-text">진실이 드러났습니다...</div>
            </div>
        `;
        
        // 안전하게 추가
        try {
            puzzleContainer.appendChild(completedPhotoDiv);
            console.log('완성된 사진이 성공적으로 추가되었습니다');
        } catch (error) {
            console.error('사진 추가 중 오류:', error);
        }
        
        // 페이드인 효과
        setTimeout(() => {
            completedPhotoDiv.style.opacity = '1';
        }, 100);
    }

    // 퍼즐 힌트 표시
    showPuzzleHint() {
        const pieces = document.querySelectorAll('.puzzle-piece');
        pieces.forEach(piece => {
            piece.classList.add('show-hint');
        });
        
        setTimeout(() => {
            pieces.forEach(piece => {
                piece.classList.remove('show-hint');
            });
        }, 3000);
    }

    // 퍼즐 닫기
    closePuzzle() {
        const puzzleOverlay = document.querySelector('.puzzle-overlay');
        if (puzzleOverlay) {
            puzzleOverlay.remove();
        }
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
