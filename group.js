document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const userModal = document.getElementById('user-modal');
    const usernameInput = document.getElementById('username-input');
    const joinButton = document.getElementById('join-button');
    const chatContainer = document.getElementById('chat-container');
    const currentUsername = document.getElementById('current-username');
    const currentUserAvatar = document.getElementById('current-user-avatar');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-btn');
    const messagesContainer = document.getElementById('messages');
    const userList = document.getElementById('user-list');
    const userCount = document.getElementById('user-count');
    const leaveButton = document.getElementById('leave-chat');
    const emojiButton = document.getElementById('emoji-btn');
    const emojiPicker = document.getElementById('emoji-picker');
    const themeToggle = document.getElementById('theme-toggle');
    const typingIndicator = document.getElementById('typing-indicator');
    const userSearch = document.getElementById('user-search');
    const fileButton = document.getElementById('file-btn');
    const fileModal = document.getElementById('file-modal');
    const closeFileModal = document.getElementById('close-file-modal');
    const fileDropzone = document.getElementById('file-dropzone');
    const fileInput = document.getElementById('file-input');
    const filePreview = document.getElementById('file-preview');
    const sendFilesButton = document.getElementById('send-files-btn');
    const avatarOptions = document.querySelectorAll('.avatar-option');

    // State
    let currentUser = {
        id: '',
        username: '',
        avatar: '👨',
        isOnline: true
    };

    let users = [];
    let selectedFiles = [];
    let selectedAvatar = '1';
    let isTyping = false;
    let typingTimeout;

    // Initialize
    initTheme();
    setupEventListeners();
    showUserModal();

    // Functions
    function initTheme() {
        const savedTheme = localStorage.getItem('chat-theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        const icon = themeToggle.querySelector('i');
        icon.className = savedTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    }

    function setupEventListeners() {
        // Join chat
        joinButton.addEventListener('click', joinChat);
        usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') joinChat();
        });

        // Avatar selection
        avatarOptions.forEach(option => {
            option.addEventListener('click', () => {
                avatarOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                selectedAvatar = option.dataset.avatar;
            });
        });

        // Message sending
        sendButton.addEventListener('click', sendMessage);
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        // Typing indicator
        messageInput.addEventListener('input', handleTyping);

        // Emoji picker
        emojiButton.addEventListener('click', toggleEmojiPicker);
        document.addEventListener('click', (e) => {
            if (!emojiButton.contains(e.target) && !emojiPicker.contains(e.target)) {
                emojiPicker.classList.remove('active');
            }
        });

        // Theme toggle
        themeToggle.addEventListener('click', toggleTheme);

        // Leave chat
        leaveButton.addEventListener('click', leaveChat);

        // User search
        userSearch.addEventListener('input', filterUsers);

        // File handling
        fileButton.addEventListener('click', () => fileModal.classList.add('active'));
        closeFileModal.addEventListener('click', () => fileModal.classList.remove('active'));
        fileDropzone.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', handleFileSelect);
        sendFilesButton.addEventListener('click', sendFiles);
    }

    function showUserModal() {
        userModal.style.display = 'flex';
        usernameInput.focus();
    }

    function joinChat() {
        const username = usernameInput.value.trim();
        if (!username) {
            alert('Please enter a username');
            return;
        }

        currentUser = {
            id: generateId(),
            username: username,
            avatar: getAvatarBySelection(selectedAvatar),
            isOnline: true
        };

        currentUsername.textContent = username;
        currentUserAvatar.textContent = getAvatarBySelection(selectedAvatar);

        // Simulate joining a chat room
        users = [
            currentUser,
            { id: generateId(), username: 'Alex', avatar: '👩', isOnline: true },
            { id: generateId(), username: 'Sam', avatar: '🧑', isOnline: true },
            { id: generateId(), username: 'Taylor', avatar: '👨‍💻', isOnline: false },
            { id: generateId(), username: 'Jordan', avatar: '👩‍💻', isOnline: true }
        ];

        updateUserList();
        userModal.style.display = 'none';
        chatContainer.style.display = 'flex';

        // Add welcome message
        addSystemMessage(`Welcome to the group chat, ${username}!`);
        
        // Simulate initial messages
        setTimeout(() => {
            addMessage({
                sender: 'Alex',
                avatar: '👩',
                content: 'Hey there! 👋',
                timestamp: new Date(),
                isCurrentUser: false
            });
        }, 1000);

        setTimeout(() => {
            addMessage({
                sender: 'Sam',
                avatar: '🧑',
                content: 'Welcome to the group!',
                timestamp: new Date(),
                isCurrentUser: false
            });
        }, 1500);
    }

    function getAvatarBySelection(selection) {
        const avatars = {
            '1': '👨',
            '2': '👩',
            '3': '🧑',
            '4': '👨‍💻',
            '5': '👩‍💻'
        };
        return avatars[selection] || '👤';
    }

    function sendMessage() {
        const content = messageInput.value.trim();
        if (!content) return;

        addMessage({
            sender: currentUser.username,
            avatar: currentUser.avatar,
            content: content,
            timestamp: new Date(),
            isCurrentUser: true
        });

        messageInput.value = '';
        resetTyping();

        // Simulate response
        if (Math.random() > 0.3) {
            const onlineUsers = users.filter(u => u.isOnline && u.id !== currentUser.id);
            if (onlineUsers.length > 0) {
                const randomUser = onlineUsers[Math.floor(Math.random() * onlineUsers.length)];
                const responses = [
                    `That's interesting!`,
                    `I agree with you.`,
                    `Thanks for sharing!`,
                    `What do others think about this?`,
                    `👍`,
                    `Let me think about that...`
                ];
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];

                setTimeout(() => {
                    addMessage({
                        sender: randomUser.username,
                        avatar: randomUser.avatar,
                        content: randomResponse,
                        timestamp: new Date(),
                        isCurrentUser: false
                    });
                }, 1000 + Math.random() * 3000);
            }
        }
    }

    function handleTyping() {
        if (!isTyping) {
            isTyping = true;
            // In a real app, you would send a "typing" event to the server
        }

        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(resetTyping, 2000);
    }

    function resetTyping() {
        isTyping = false;
        // In a real app, you would send a "stopped typing" event to the server
    }

    function toggleEmojiPicker() {
        emojiPicker.classList.toggle('active');
        if (emojiPicker.classList.contains('active')) {
            loadEmojis();
        }
    }

    function loadEmojis() {
        // Simplified emoji categories - in a real app you might use a library
        const emojiCategories = {
            'Smileys': ['😀', '😂', '😍', '🥰', '😎', '🤩', '😜', '🤔', '😴'],
            'Gestures': ['👍', '👎', '👋', '✌️', '🤟', '🙏', '👏', '🤝'],
            'Objects': ['⌚', '📱', '💻', '🎧', '📷', '🔑', '💡', '📚'],
            'Nature': ['🌞', '🌍', '🌻', '🐶', '🐱', '🦄', '🐳', '🌺'],
            'Food': ['🍎', '🍕', '🍔', '🍟', '🍩', '🍿', '🍣', '🍜']
        };

        emojiPicker.innerHTML = '';
        
        for (const [category, emojis] of Object.entries(emojiCategories)) {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'emoji-category';
            
            const categoryTitle = document.createElement('h4');
            categoryTitle.textContent = category;
            categoryDiv.appendChild(categoryTitle);
            
            const emojiGrid = document.createElement('div');
            emojiGrid.className = 'emoji-grid';
            
            emojis.forEach(emoji => {
                const emojiSpan = document.createElement('span');
                emojiSpan.className = 'emoji';
                emojiSpan.textContent = emoji;
                emojiSpan.addEventListener('click', () => {
                    messageInput.value += emoji;
                    messageInput.focus();
                });
                emojiGrid.appendChild(emojiSpan);
            });
            
            categoryDiv.appendChild(emojiGrid);
            emojiPicker.appendChild(categoryDiv);
        }
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('chat-theme', newTheme);
        
        const icon = themeToggle.querySelector('i');
        icon.className = newTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    }

    function leaveChat() {
        if (confirm('Are you sure you want to leave the chat?')) {
            // In a real app, you would send a "leave" event to the server
            users = users.filter(u => u.id !== currentUser.id);
            updateUserList();
            addSystemMessage(`${currentUser.username} has left the chat`);
            
            // Reset UI
            chatContainer.style.display = 'none';
            userModal.style.display = 'flex';
            usernameInput.value = '';
            messagesContainer.innerHTML = '';
        }
    }

    function filterUsers() {
        const searchTerm = userSearch.value.toLowerCase();
        const userItems = userList.querySelectorAll('li');
        
        userItems.forEach(item => {
            const username = item.querySelector('.user-name').textContent.toLowerCase();
            if (username.includes(searchTerm)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    function handleFileSelect(e) {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        
        selectedFiles = files;
        renderFilePreview();
    }

    function renderFilePreview() {
        filePreview.innerHTML = '';
        
        selectedFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-preview-item';
            
            const fileIcon = document.createElement('span');
            fileIcon.className = 'file-icon';
            fileIcon.innerHTML = getFileIcon(file.type);
            
            const fileName = document.createElement('span');
            fileName.textContent = file.name.length > 15 
                ? file.name.substring(0, 15) + '...' 
                : file.name;
            
            const removeFile = document.createElement('span');
            removeFile.className = 'remove-file';
            removeFile.innerHTML = '&times;';
            removeFile.addEventListener('click', () => {
                selectedFiles.splice(index, 1);
                renderFilePreview();
            });
            
            fileItem.appendChild(fileIcon);
            fileItem.appendChild(fileName);
            fileItem.appendChild(removeFile);
            filePreview.appendChild(fileItem);
        });
        
        sendFilesButton.disabled = selectedFiles.length === 0;
    }

    function getFileIcon(fileType) {
        if (fileType.startsWith('image/')) return '<i class="fas fa-image"></i>';
        if (fileType.startsWith('video/')) return '<i class="fas fa-video"></i>';
        if (fileType.startsWith('audio/')) return '<i class="fas fa-music"></i>';
        if (fileType.includes('pdf')) return '<i class="fas fa-file-pdf"></i>';
        if (fileType.includes('word')) return '<i class="fas fa-file-word"></i>';
        if (fileType.includes('excel')) return '<i class="fas fa-file-excel"></i>';
        if (fileType.includes('zip')) return '<i class="fas fa-file-archive"></i>';
        return '<i class="fas fa-file"></i>';
    }

    function sendFiles() {
        selectedFiles.forEach(file => {
            addMessage({
                sender: currentUser.username,
                avatar: currentUser.avatar,
                content: `[File: ${file.name}]`,
                timestamp: new Date(),
                isCurrentUser: true,
                isFile: true,
                file: file
            });
        });
        
        selectedFiles = [];
        filePreview.innerHTML = '';
        fileInput.value = '';
        sendFilesButton.disabled = true;
        fileModal.classList.remove('active');
    }

    function addMessage({ sender, avatar, content, timestamp, isCurrentUser, isFile = false, file = null }) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isCurrentUser ? 'sent' : 'received'}`;
        
        const messageHeader = document.createElement('div');
        messageHeader.className = 'message-header';
        
        if (!isCurrentUser) {
            const senderName = document.createElement('div');
                        senderName.textContent = sender;
            messageHeader.appendChild(senderName);
        }

        const timeStamp = document.createElement('div');
        timeStamp.className = 'timestamp';
        timeStamp.textContent = formatTime(timestamp);
        messageHeader.appendChild(timeStamp);

        messageDiv.appendChild(messageHeader);

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        if (isFile) {
            const fileLink = document.createElement('div');
            fileLink.className = 'file-message';
            fileLink.innerHTML = `
                <i class="fas ${getFileIcon(file.type)}"></i>
                <span>${file.name}</span>
                <small>(${formatFileSize(file.size)})</small>
            `;
            
            // In a real app, you would upload the file and create a download link
            fileLink.addEventListener('click', () => {
                // Simulate file download
                alert(`In a real app, this would download: ${file.name}`);
            });
            
            messageContent.appendChild(fileLink);
        } else {
            messageContent.textContent = content;
        }
        
        messageDiv.appendChild(messageContent);

        if (isCurrentUser) {
            const messageFooter = document.createElement('div');
            messageFooter.className = 'message-footer';
            
            const readReceipt = document.createElement('span');
            readReceipt.className = 'read-receipt';
            readReceipt.innerHTML = '<i class="fas fa-check-double"></i>';
            messageFooter.appendChild(readReceipt);
            
            messageDiv.appendChild(messageFooter);
        }

        messagesContainer.appendChild(messageDiv);
        scrollToBottom();
    }

    function addSystemMessage(content) {
        const systemMessage = document.createElement('div');
        systemMessage.className = 'system-message';
        systemMessage.textContent = content;
        messagesContainer.appendChild(systemMessage);
        scrollToBottom();
    }

    function updateUserList() {
        userList.innerHTML = '';
        userCount.textContent = users.filter(u => u.isOnline).length;
        
        users.forEach(user => {
            const userItem = document.createElement('li');
            
            const userAvatar = document.createElement('div');
            userAvatar.className = 'user-avatar';
            userAvatar.textContent = user.avatar;
            userItem.appendChild(userAvatar);
            
            const userInfo = document.createElement('div');
            userInfo.className = 'user-info';
            
            const userName = document.createElement('span');
            userName.className = 'user-name';
            userName.textContent = user.username;
            userInfo.appendChild(userName);
            
            const userStatus = document.createElement('span');
            userStatus.className = `user-status ${user.isOnline ? 'online' : 'offline'}`;
            userStatus.textContent = user.isOnline ? 'Online' : 'Offline';
            userInfo.appendChild(userStatus);
            
            userItem.appendChild(userInfo);
            userList.appendChild(userItem);
        });
    }

    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function formatTime(date) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat(bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
    }

    function generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    // Drag and drop file handling
    fileDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileDropzone.classList.add('dragover');
    });

    fileDropzone.addEventListener('dragleave', () => {
        fileDropzone.classList.remove('dragover');
    });

    fileDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        fileDropzone.classList.remove('dragover');
        
        if (e.dataTransfer.files.length) {
            selectedFiles = Array.from(e.dataTransfer.files);
            renderFilePreview();
        }
    });

    // Simulate user activity
    setInterval(() => {
        // Randomly change online status of other users
        if (users.length > 1 && Math.random() > 0.8) {
            const randomUser = users[Math.floor(Math.random() * users.length)];
            if (randomUser.id !== currentUser.id) {
                randomUser.isOnline = !randomUser.isOnline;
                updateUserList();
                
                if (!randomUser.isOnline) {
                    addSystemMessage(`${randomUser.username} has gone offline`);
                } else {
                    addSystemMessage(`${randomUser.username} is now online`);
                }
            }
        }
    }, 10000);
});