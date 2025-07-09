// WebRTC Connection Manager
class ChatConnection {
  constructor() {
    this.peer = new Peer();
    this.connections = {};
    this.currentRoom = null;
    
    this.peer.on('open', (id) => {
      this.myPeerId = id;
      document.getElementById('invite-link').value = 
        `${window.location.origin}?room=${encodeURIComponent(id)}`;
      new QRCode(document.getElementById('qrcode'), {
        text: window.location.href,
        width: 128,
        height: 128
      });
    });

    this.peer.on('connection', (conn) => {
      this.setupConnection(conn);
    });
  }

  setupConnection(conn) {
    conn.on('data', (data) => {
      // Handle incoming messages
      if (data.type === 'message') {
        this.addMessage(data.content, false);
      }
    });
    this.connections[conn.peer] = conn;
  }

  joinRoom(hostId) {
    const conn = this.peer.connect(hostId);
    this.setupConnection(conn);
    this.currentRoom = hostId;
  }

  sendMessage(content) {
    Object.values(this.connections).forEach(conn => {
      conn.send({
        type: 'message',
        content: content
      });
    });
    this.addMessage(content, true);
  }

  addMessage(content, isSelf) {
    // Your existing message rendering logic
    const messageClass = isSelf ? 'sent' : 'received';
    const messagesContainer = document.getElementById('messages');
    
    const messageElement = document.createElement('div');
    messageElement.className = `message ${messageClass}`;
    messageElement.innerHTML = `
      <div class="message-content">${content}</div>
      <span class="timestamp">${new Date().toLocaleTimeString()}</span>
    `;
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  const chat = new ChatConnection();
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get('room');

  if (roomId) {
    chat.joinRoom(roomId);
    document.getElementById('invite-section').style.display = 'none';
  }

  // Send message handler
  document.getElementById('send-btn').addEventListener('click', () => {
    const input = document.getElementById('message-input');
    if (input.value.trim()) {
      chat.sendMessage(input.value.trim());
      input.value = '';
    }
  });
});