// Generate a random room ID
function generateRoomId() {
    return Math.random().toString(36).substring(2, 8);
}

// Get URL parameters
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return params;
}

// Format timestamp
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Copy text to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Link copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

export { generateRoomId, getUrlParams, formatTimestamp, copyToClipboard, debounce };