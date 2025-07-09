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
    const typingIndicator = document.getElementById('typing-indicator');
    const themeToggle = document.getElementById('theme-toggle');
    const emojiButton = document.getElementById('emoji-btn');
    const emojiPicker = document.getElementById('emoji-picker');
    const fileButton = document.getElementById('file-btn');
    const fileModal = document.getElementById('file-modal');
    const closeFileModal = document.getElementById('close-file-modal');
    const fileDropzone = document.getElementById('file-dropzone');
    const fileInput = document.getElementById('file-input');
    const filePreview = document.getElementById('file-preview');
    const sendFilesButton = document.getElementById('send-files-btn');
    const avatarOptions = document.querySelectorAll('.avatar-option');
    const contactModal = document.getElementById('contact-modal');
    const contactList = document.getElementById('contact-list');
    const contactsSidebar = document.getElementById('contacts-sidebar');
    const newChatBtn = document.getElementById('new-chat-btn');
    const cancelContactBtn = document.getElementById('cancel-contact');
    const contactSearch = document.getElementById('contact-search');
    const chatPartnerName = document.getElementById('chat-partner-name');
    const partnerAvatar = document.getElementById('partner-avatar');
    const startChatPlaceholder = document.getElementById('start-chat-placeholder');

    // State
    let currentUser = {
        id: '',
        username: '',
        avatar: '👨',
        isOnline: true
    };

    let contacts = [];
    let currentChatPartner = null;
    let selectedFiles = [];
    let selectedAvatar = '1';
    let isTyping = false;
    let typingTimeout;
    let conversations = {};

    // Initialize
    initTheme();
    setupEventListeners();
    showUserModal();
    loadSampleContacts();

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
            document.getElementById('exit-btn').addEventListener('click', () => {
    if (confirm('Are you sure you want to exit the chat?')) {
        window.close(); // or your preferred exit method
    }
});
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

        // File handling
        fileButton.addEventListener('click', () => fileModal.classList.add('active'));
        closeFileModal.addEventListener('click', () => fileModal.classList.remove('active'));
        fileDropzone.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', handleFileSelect);
        sendFilesButton.addEventListener('click', sendFiles);

        // Contact management
        newChatBtn.addEventListener('click', () => contactModal.style.display = 'flex');
        cancelContactBtn.addEventListener('click', () => contactModal.style.display = 'none');
        contactSearch.addEventListener('input', filterContacts);
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

        userModal.style.display = 'none';
        chatContainer.style.display = 'flex';
    }

    function loadSampleContacts() {
        contacts = [
            { id: generateId(), username: 'Alex', avatar: '👩', isOnline: true },
            { id: generateId(), username: 'Sam', avatar: '🧑', isOnline: true },
            { id: generateId(), username: 'Taylor', avatar: '👨‍💻', isOnline: false },
            { id: generateId(), username: 'Jordan', avatar: '👩‍💻', isOnline: true },
            { id: generateId(), username: 'Casey', avatar: '👦', isOnline: false },
            { id: generateId(), username: 'Riley', avatar: '👧', isOnline: true }
        ];

        updateContactLists();
    }

    function updateContactLists() {
        // Update main contact list in modal
        contactList.innerHTML = '';
        contacts.forEach(contact => {
            const contactItem = createContactItem(contact);
            contactItem.addEventListener('click', () => startConversation(contact));
            contactList.appendChild(contactItem);
        });

        // Update sidebar contact list
        contactsSidebar.innerHTML = '';
        contacts.forEach(contact => {
            const contactItem = createContactItem(contact);
            contactItem.addEventListener('click', () => startConversation(contact));
            contactsSidebar.appendChild(contactItem);
        });
    }

    function createContactItem(contact) {
        const contactItem = document.createElement('li');
        
        const userAvatar = document.createElement('div');
        userAvatar.className = 'user-avatar';
        userAvatar.textContent = contact.avatar;
        contactItem.appendChild(userAvatar);
        
        const userInfo = document.createElement('div');
        userInfo.className = 'user-info';
        
        const userName = document.createElement('span');
        userName.className = 'user-name';
        userName.textContent = contact.username;
        userInfo.appendChild(userName);
        
        const userStatus = document.createElement('span');
        userStatus.className = `user-status ${contact.isOnline ? 'online' : 'offline'}`;
        userStatus.textContent = contact.isOnline ? 'Online' : 'Offline';
        userInfo.appendChild(userStatus);
        
        contactItem.appendChild(userInfo);
        return contactItem;
    }

    function startConversation(contact) {
        currentChatPartner = contact;
        chatPartnerName.textContent = contact.username;
        partnerAvatar.textContent = contact.avatar;
        startChatPlaceholder.style.display = 'none';
        messagesContainer.style.display = 'block';
        messageInput.disabled = false;
        sendButton.disabled = false;
        contactModal.style.display = 'none';

        // Initialize conversation if it doesn't exist
        if (!conversations[contact.id]) {
            conversations[contact.id] = [];
            
            // Add welcome message if it's the first conversation
            if (Object.keys(conversations).length === 1) {
                addSystemMessage(`You started a conversation with ${contact.username}`);
                
                // Simulate initial message from contact
                setTimeout(() => {
                    addMessage({
                        sender: contact.username,
                        avatar: contact.avatar,
                        content: 'Hi there! 👋',
                        timestamp: new Date(),
                        isCurrentUser: false
                    }, contact.id);
                }, 1000);
            }
        }

        // Load messages for this conversation
        loadMessages(contact.id);
    }

    function loadMessages(contactId) {
        messagesContainer.innerHTML = '';
        const messages = conversations[contactId] || [];
        
        messages.forEach(msg => {
            if (msg.isSystem) {
                addSystemMessage(msg.content);
            } else {
                addMessage(msg, contactId, false);
            }
        });
        
        scrollToBottom();
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
        if (!content || !currentChatPartner) return;

        addMessage({
            sender: currentUser.username,
            avatar: currentUser.avatar,
            content: content,
            timestamp: new Date(),
            isCurrentUser: true
        }, currentChatPartner.id);

        messageInput.value = '';
        resetTyping();

        // Simulate response
        if (currentChatPartner.isOnline && Math.random() > 0.3) {
            const responses = [
                `Hello ${currentUser.username}!`,
                `How are you doing?`,
                `Thanks for your message!`,
                `I'll get back to you soon.`,
                `Interesting point!`,
                `Let me think about that...`
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];

            setTimeout(() => {
                addMessage({
                    sender: currentChatPartner.username,
                                        avatar: currentChatPartner.avatar,
                    content: randomResponse,
                    timestamp: new Date(),
                    isCurrentUser: false
                }, currentChatPartner.id);
            }, 1000 + Math.random() * 2000);
        }
    }

    function addMessage(message, contactId, save = true) {
        if (save) {
            if (!conversations[contactId]) {
                conversations[contactId] = [];
            }
            conversations[contactId].push(message);
        }

        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.isCurrentUser ? 'sent' : 'received'}`;
        
        const messageHeader = document.createElement('div');
        messageHeader.className = 'message-header';
        
        if (!message.isCurrentUser) {
            const senderName = document.createElement('span');
            senderName.className = 'sender-name';
            senderName.textContent = message.sender;
            messageHeader.appendChild(senderName);
        }
        
        const timestamp = document.createElement('span');
        timestamp.className = 'timestamp';
        timestamp.textContent = formatTime(message.timestamp);
        messageHeader.appendChild(timestamp);
        
        messageElement.appendChild(messageHeader);
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = message.content;
        messageElement.appendChild(messageContent);
        
        if (message.isCurrentUser) {
            const messageFooter = document.createElement('div');
            messageFooter.className = 'message-footer';
            
            const readReceipt = document.createElement('span');
            readReceipt.className = 'read-receipt';
            readReceipt.innerHTML = '✓✓';
            messageFooter.appendChild(readReceipt);
            
            messageElement.appendChild(messageFooter);
        }
        
        messagesContainer.appendChild(messageElement);
        scrollToBottom();
    }

    function addSystemMessage(content) {
        const systemMessage = document.createElement('div');
        systemMessage.className = 'system-message';
        systemMessage.textContent = content;
        messagesContainer.appendChild(systemMessage);
        scrollToBottom();
    }

    function handleTyping() {
        if (!isTyping) {
            isTyping = true;
            // In a real app, you would send a typing indicator to the other user
        }
        
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(resetTyping, 2000);
    }

    function resetTyping() {
        isTyping = false;
        // In a real app, you would send a stop typing indicator
    }

    function toggleEmojiPicker() {
        emojiPicker.classList.toggle('active');
        if (emojiPicker.classList.contains('active')) {
            loadEmojis();
        }
    }

    function loadEmojis() {
        if (emojiPicker.innerHTML) return; // Already loaded
        
        const emojiCategories = {
            'Smileys & People': ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇'],
            'Animals & Nature': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯'],
            'Food & Drink': ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🍑'],
            'Activities': ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸'],
            'Travel & Places': ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎', '🚓', '🚑', '🚒', '🚐'],
            'Objects': ['⌚', '📱', '💻', '⌨️', '🖥', '🖨', '🖱', '🖲', '💽', '💾'],
            'Symbols': ['❤️', '💛', '💚', '💙', '💜', '🖤', '💔', '❣️', '💕', '💞']
        };
        
        for (const [category, emojis] of Object.entries(emojiCategories)) {
            const categoryElement = document.createElement('div');
            categoryElement.className = 'emoji-category';
            
            const categoryTitle = document.createElement('h4');
            categoryTitle.textContent = category;
            categoryElement.appendChild(categoryTitle);
            
            const emojiGrid = document.createElement('div');
            emojiGrid.className = 'emoji-grid';
            
            emojis.forEach(emoji => {
                const emojiElement = document.createElement('div');
                emojiElement.className = 'emoji';
                emojiElement.textContent = emoji;
                emojiElement.addEventListener('click', () => {
                    messageInput.value += emoji;
                    messageInput.focus();
                });
                emojiGrid.appendChild(emojiElement);
            });
            
            categoryElement.appendChild(emojiGrid);
            emojiPicker.appendChild(categoryElement);
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

    function handleFileSelect(e) {
        const files = e.target.files || e.dataTransfer.files;
        selectedFiles = Array.from(files);
        updateFilePreview();
    }

    function updateFilePreview() {
        filePreview.innerHTML = '';
        
        if (selectedFiles.length === 0) {
            sendFilesButton.disabled = true;
            return;
        }
        
        sendFilesButton.disabled = false;
        
        selectedFiles.forEach((file, index) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'file-preview-item';
            
            const fileIcon = document.createElement('span');
            fileIcon.className = 'file-icon';
            fileIcon.innerHTML = getFileIcon(file.type);
            previewItem.appendChild(fileIcon);
            
            const fileName = document.createElement('span');
            fileName.textContent = file.name.length > 15 
                ? `${file.name.substring(0, 12)}...${file.name.split('.').pop()}`
                : file.name;
            previewItem.appendChild(fileName);
            
            const removeFile = document.createElement('span');
            removeFile.className = 'remove-file';
            removeFile.innerHTML = '&times;';
            removeFile.addEventListener('click', () => {
                selectedFiles.splice(index, 1);
                updateFilePreview();
            });
            previewItem.appendChild(removeFile);
            
            filePreview.appendChild(previewItem);
        });
    }

    function getFileIcon(fileType) {
        if (fileType.startsWith('image/')) return '<i class="fas fa-image"></i>';
        if (fileType.startsWith('video/')) return '<i class="fas fa-video"></i>';
        if (fileType.startsWith('audio/')) return '<i class="fas fa-music"></i>';
        if (fileType === 'application/pdf') return '<i class="fas fa-file-pdf"></i>';
        if (fileType === 'application/zip') return '<i class="fas fa-file-archive"></i>';
        if (fileType.includes('document') || fileType.includes('word')) return '<i class="fas fa-file-word"></i>';
        if (fileType.includes('spreadsheet') || fileType.includes('excel')) return '<i class="fas fa-file-excel"></i>';
        return '<i class="fas fa-file"></i>';
    }

    function sendFiles() {
        if (selectedFiles.length === 0 || !currentChatPartner) return;
        
        selectedFiles.forEach(file => {
            addMessage({
                sender: currentUser.username,
                avatar: currentUser.avatar,
                content: `[File: ${file.name}]`,
                timestamp: new Date(),
                isCurrentUser: true,
                isFile: true,
                file: file
            }, currentChatPartner.id);
        });
        
        // Simulate file download in UI
        setTimeout(() => {
            addSystemMessage(`${currentChatPartner.username} received your files`);
        }, 1000);
        
        // Reset file selection
        selectedFiles = [];
        fileInput.value = '';
        updateFilePreview();
        fileModal.classList.remove('active');
    }

    function filterContacts() {
        const searchTerm = contactSearch.value.toLowerCase();
        const contactItems = contactList.querySelectorAll('li');
        
        contactItems.forEach(item => {
            const name = item.querySelector('.user-name').textContent.toLowerCase();
            item.style.display = name.includes(searchTerm) ? 'flex' : 'none';
        });
    }

    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function formatTime(date) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function generateId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    // Drag and drop for files
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        fileDropzone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        fileDropzone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        fileDropzone.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        fileDropzone.classList.add('highlight');
    }

    function unhighlight() {
        fileDropzone.classList.remove('highlight');
    }

    fileDropzone.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        selectedFiles = Array.from(files);
        updateFilePreview();
    }
});
