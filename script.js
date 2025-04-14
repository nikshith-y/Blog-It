// DOM Elements
const postsContainer = document.getElementById('posts-container');
const postForm = document.getElementById('post-form');
const newPostBtn = document.getElementById('new-post-btn');
const cancelBtn = document.getElementById('cancel-btn');
const saveBtn = document.getElementById('save-btn');
const noPostsMessage = document.getElementById('no-posts-message');
const toast = document.getElementById('toast');
const themeToggle = document.getElementById('theme-toggle');
const downloadBtn = document.getElementById('download-btn');

// State
let posts = JSON.parse(localStorage.getItem('posts')) || [];
let isEditing = false;
let currentPostId = null;
let isDarkMode = localStorage.getItem('darkMode') === 'true';

// Initialize
function init() {
    setTheme();
    renderPosts();
    setupEventListeners();
}

// Event Listeners
function setupEventListeners() {
    newPostBtn.addEventListener('click', showPostForm);
    cancelBtn.addEventListener('click', hidePostForm);
    postForm.addEventListener('submit', handleSubmit);
    themeToggle.addEventListener('click', toggleTheme);
    downloadBtn.addEventListener('click', downloadAllNotes);
}

// Theme Management
function setTheme() {
    document.body.classList.toggle('dark-mode', isDarkMode);
    themeToggle.innerHTML = `<i class="fas fa-${isDarkMode ? 'sun' : 'moon'}"></i>`;
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    localStorage.setItem('darkMode', isDarkMode);
    setTheme();
}

// Download Notes
function downloadAllNotes() {
    if (posts.length === 0) {
        showToast('No notes to download', 'error');
        return;
    }

    const notesText = posts.map(post => {
        return `Title: ${post.title}\nDate: ${new Date(post.timestamp).toLocaleDateString()}\n\n${post.content}\n\n---\n\n`;
    }).join('\n');

    downloadFile(notesText, `all-notes-${new Date().toISOString().split('T')[0]}.txt`);
    showToast('All notes downloaded successfully!', 'success');
}

function downloadPost(post) {
    const noteText = `Title: ${post.title}\nDate: ${new Date(post.timestamp).toLocaleDateString()}\n\n${post.content}`;
    downloadFile(noteText, `note-${post.title.toLowerCase().replace(/\s+/g, '-')}.txt`);
    showToast('Note downloaded successfully!', 'success');
}

function downloadFile(content, filename) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Post Form
function showPostForm() {
    postForm.classList.remove('hidden');
    newPostBtn.classList.add('hidden');
    document.getElementById('post-title').focus();
}

function hidePostForm() {
    postForm.classList.add('hidden');
    newPostBtn.classList.remove('hidden');
    postForm.reset();
    isEditing = false;
    currentPostId = null;
}

// Post Management
function handleSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;
    const timestamp = new Date().toISOString();

    if (isEditing) {
        updatePost(title, content);
    } else {
        createPost(title, content, timestamp);
    }

    hidePostForm();
    showToast('Post saved successfully!', 'success');
}

function createPost(title, content, timestamp) {
    const post = {
        id: Date.now(),
        title,
        content,
        timestamp
    };

    posts.unshift(post);
    savePosts();
    renderPosts();
}

function updatePost(title, content) {
    const postIndex = posts.findIndex(post => post.id === currentPostId);
    if (postIndex !== -1) {
        posts[postIndex].title = title;
        posts[postIndex].content = content;
        posts[postIndex].timestamp = new Date().toISOString();
        savePosts();
        renderPosts();
    }
}

function editPost(id) {
    const post = posts.find(post => post.id === id);
    if (post) {
        isEditing = true;
        currentPostId = id;
        document.getElementById('post-title').value = post.title;
        document.getElementById('post-content').value = post.content;
        showPostForm();
    }
}

function deletePost(id) {
    posts = posts.filter(post => post.id !== id);
    savePosts();
    renderPosts();
    showToast('Post deleted successfully!', 'success');
}

// Rendering
function renderPosts() {
    if (posts.length === 0) {
        noPostsMessage.classList.remove('hidden');
        postsContainer.innerHTML = '';
        return;
    }

    noPostsMessage.classList.add('hidden');
    postsContainer.innerHTML = posts.map(post => `
        <article class="post" data-id="${post.id}">
            <div class="post-header">
                <h2>${post.title}</h2>
                <div class="post-actions">
                    <button class="btn" onclick="editPost(${post.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn" onclick="downloadPost(${JSON.stringify(post).replace(/"/g, '&quot;')})">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="btn danger" onclick="deletePost(${post.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="post-content">
                <p>${post.content}</p>
            </div>
            <div class="post-footer">
                <time datetime="${post.timestamp}">
                    ${new Date(post.timestamp).toLocaleDateString()}
                </time>
            </div>
        </article>
    `).join('');
}

// Storage
function savePosts() {
    localStorage.setItem('posts', JSON.stringify(posts));
}

// Toast Notifications
function showToast(message, type = 'info') {
    const icon = toast.querySelector('i');
    const span = toast.querySelector('span');
    
    icon.className = `fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}`;
    span.textContent = message;
    
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// Initialize the app
init();