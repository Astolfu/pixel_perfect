// ===================================
// Global State
// ===================================
const state = {
    image1: null,
    image2: null,
    comparisonData: null,
    currentView: 'overlay'
};

// ===================================
// DOM Elements
// ===================================
const elements = {
    // Upload boxes
    uploadBox1: document.getElementById('uploadBox1'),
    uploadBox2: document.getElementById('uploadBox2'),
    fileInput1: document.getElementById('fileInput1'),
    fileInput2: document.getElementById('fileInput2'),
    preview1: document.getElementById('preview1'),
    preview2: document.getElementById('preview2'),
    remove1: document.getElementById('remove1'),
    remove2: document.getElementById('remove2'),
    
    // Buttons
    compareBtn: document.getElementById('compareBtn'),
    resetBtn: document.getElementById('resetBtn'),
    downloadBtn: document.getElementById('downloadBtn'),
    newComparisonBtn: document.getElementById('newComparisonBtn'),
    
    // Sections
    uploadSection: document.getElementById('uploadSection'),
    resultsSection: document.getElementById('resultsSection'),
    actionButtons: document.getElementById('actionButtons'),
    loadingOverlay: document.getElementById('loadingOverlay'),
    
    // Results
    scoreValue: document.getElementById('scoreValue'),
    scoreStatus: document.getElementById('scoreStatus'),
    
    // Canvases
    overlayCanvas: document.getElementById('overlayCanvas'),
    sideCanvas1: document.getElementById('sideCanvas1'),
    sideCanvas2: document.getElementById('sideCanvas2'),
    differenceCanvas: document.getElementById('differenceCanvas'),
    
    // View controls
    overlaySlider: document.getElementById('overlaySlider'),
    viewTabs: document.querySelectorAll('.view-tab'),
    viewPanels: document.querySelectorAll('.view-panel'),
    
    // GitHub
    githubBtn: document.getElementById('githubBtn'),
    starCount: document.getElementById('starCount')
};

// ===================================
// Initialize App
// ===================================
function init() {
    setupEventListeners();
    fetchGitHubStars();
}

// ===================================
// Event Listeners Setup
// ===================================
function setupEventListeners() {
    // Upload box 1
    elements.uploadBox1.addEventListener('click', () => elements.fileInput1.click());
    elements.fileInput1.addEventListener('change', (e) => handleFileSelect(e, 1));
    elements.uploadBox1.addEventListener('dragover', handleDragOver);
    elements.uploadBox1.addEventListener('dragleave', handleDragLeave);
    elements.uploadBox1.addEventListener('drop', (e) => handleDrop(e, 1));
    elements.remove1.addEventListener('click', (e) => removeImage(e, 1));
    
    // Upload box 2
    elements.uploadBox2.addEventListener('click', () => elements.fileInput2.click());
    elements.fileInput2.addEventListener('change', (e) => handleFileSelect(e, 2));
    elements.uploadBox2.addEventListener('dragover', handleDragOver);
    elements.uploadBox2.addEventListener('dragleave', handleDragLeave);
    elements.uploadBox2.addEventListener('drop', (e) => handleDrop(e, 2));
    elements.remove2.addEventListener('click', (e) => removeImage(e, 2));
    
    // Buttons
    elements.compareBtn.addEventListener('click', compareImages);
    elements.resetBtn.addEventListener('click', resetAll);
    elements.downloadBtn.addEventListener('click', downloadComparison);
    elements.newComparisonBtn.addEventListener('click', resetAll);
    
    // View tabs
    elements.viewTabs.forEach(tab => {
        tab.addEventListener('click', () => switchView(tab.dataset.view));
    });
    
    // Overlay slider
    elements.overlaySlider.addEventListener('input', updateOverlay);
}

// ===================================
// File Upload Handlers
// ===================================
function handleFileSelect(event, imageNum) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        loadImage(file, imageNum);
    }
}

function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('dragging');
}

function handleDragLeave(event) {
    event.currentTarget.classList.remove('dragging');
}

function handleDrop(event, imageNum) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('dragging');
    
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        loadImage(file, imageNum);
    }
}

function loadImage(file, imageNum) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            if (imageNum === 1) {
                state.image1 = img;
                elements.preview1.src = e.target.result;
                elements.uploadBox1.classList.add('has-image');
            } else {
                state.image2 = img;
                elements.preview2.src = e.target.result;
                elements.uploadBox2.classList.add('has-image');
            }
            
            checkBothImagesLoaded();
        };
        img.src = e.target.result;
    };
    
    reader.readAsDataURL(file);
}

function removeImage(event, imageNum) {
    event.stopPropagation();
    
    if (imageNum === 1) {
        state.image1 = null;
        elements.preview1.src = '';
        elements.uploadBox1.classList.remove('has-image');
        elements.fileInput1.value = '';
    } else {
        state.image2 = null;
        elements.preview2.src = '';
        elements.uploadBox2.classList.remove('has-image');
        elements.fileInput2.value = '';
    }
    
    checkBothImagesLoaded();
}

function checkBothImagesLoaded() {
    if (state.image1 && state.image2) {
        elements.actionButtons.style.display = 'flex';
    } else {
        elements.actionButtons.style.display = 'none';
    }
}

// ===================================
// Image Comparison
// ===================================
async function compareImages() {
    if (!state.image1 || !state.image2) {
        alert('Please upload both images first');
        return;
    }
    
    showLoading(true);
    
    // Small delay to show loading animation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
        // Create canvases for comparison
        const canvas1 = createCanvasFromImage(state.image1);
        const canvas2 = createCanvasFromImage(state.image2);
        
        // Get data URLs
        const dataUrl1 = canvas1.toDataURL();
        const dataUrl2 = canvas2.toDataURL();
        
        // Use Resemble.js for comparison
        resemble(dataUrl1)
            .compareTo(dataUrl2)
            .onComplete((result) => {
                state.comparisonData = result;
                displayResults(result);
                showLoading(false);
            });
    } catch (error) {
        console.error('Comparison error:', error);
        alert('Error comparing images. Please try again.');
        showLoading(false);
    }
}

function createCanvasFromImage(img) {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return canvas;
}

// ===================================
// Display Results
// ===================================
function displayResults(comparisonData) {
    // Calculate similarity percentage
    const similarity = (100 - parseFloat(comparisonData.misMatchPercentage)).toFixed(2);
    
    // Update score
    elements.scoreValue.textContent = `${similarity}%`;
    
    // Update status
    updateScoreStatus(similarity);
    
    // Render all views
    renderOverlayView();
    renderSideBySideView();
    renderDifferenceView(comparisonData);
    
    // Show results section
    elements.uploadSection.style.display = 'none';
    elements.resultsSection.style.display = 'block';
    
    // Scroll to results
    elements.resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function updateScoreStatus(similarity) {
    let status = '';
    let className = '';
    
    if (similarity >= 99.5) {
        status = '✨ Perfect Match!';
        className = 'perfect';
    } else if (similarity >= 95) {
        status = '🎯 Excellent';
        className = 'excellent';
    } else if (similarity >= 85) {
        status = '👍 Good Match';
        className = 'good';
    } else {
        status = '⚠️ Significant Differences';
        className = 'different';
    }
    
    elements.scoreStatus.textContent = status;
    elements.scoreStatus.className = `score-status ${className}`;
}

// ===================================
// Render Views
// ===================================
function renderOverlayView() {
    const canvas = elements.overlayCanvas;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size based on first image
    canvas.width = state.image1.width;
    canvas.height = state.image1.height;
    
    // Initial overlay render (50/50)
    updateOverlay();
}

function updateOverlay() {
    const canvas = elements.overlayCanvas;
    const ctx = canvas.getContext('2d');
    const sliderValue = elements.overlaySlider.value / 100;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw second image fully
    ctx.drawImage(state.image2, 0, 0);
    
    // Draw first image with clip
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width * sliderValue, canvas.height);
    ctx.clip();
    ctx.drawImage(state.image1, 0, 0);
    ctx.restore();
    
    // Draw divider line
    const lineX = canvas.width * sliderValue;
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(lineX, 0);
    ctx.lineTo(lineX, canvas.height);
    ctx.stroke();
}

function renderSideBySideView() {
    // Canvas 1
    const canvas1 = elements.sideCanvas1;
    const ctx1 = canvas1.getContext('2d');
    canvas1.width = state.image1.width;
    canvas1.height = state.image1.height;
    ctx1.drawImage(state.image1, 0, 0);
    
    // Canvas 2
    const canvas2 = elements.sideCanvas2;
    const ctx2 = canvas2.getContext('2d');
    canvas2.width = state.image2.width;
    canvas2.height = state.image2.height;
    ctx2.drawImage(state.image2, 0, 0);
}

function renderDifferenceView(comparisonData) {
    const canvas = elements.differenceCanvas;
    canvas.width = state.image1.width;
    canvas.height = state.image1.height;
    
    const ctx = canvas.getContext('2d');
    
    // Get the diff image from Resemble.js
    const diffImage = new Image();
    diffImage.onload = () => {
        ctx.drawImage(diffImage, 0, 0);
    };
    diffImage.src = comparisonData.getImageDataUrl();
}

// ===================================
// View Switching
// ===================================
function switchView(viewName) {
    state.currentView = viewName;
    
    // Update tabs
    elements.viewTabs.forEach(tab => {
        if (tab.dataset.view === viewName) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // Update panels
    elements.viewPanels.forEach(panel => {
        panel.classList.remove('active');
    });
    
    const viewMap = {
        'overlay': 'overlayView',
        'sidebyside': 'sideBySideView',
        'difference': 'differenceView'
    };
    
    document.getElementById(viewMap[viewName]).classList.add('active');
}

// ===================================
// Download Functionality
// ===================================
function downloadComparison() {
    let canvas;
    let filename;
    
    switch(state.currentView) {
        case 'overlay':
            canvas = elements.overlayCanvas;
            filename = 'pixelperfect-overlay.png';
            break;
        case 'sidebyside':
            // Create combined canvas for side by side
            canvas = createSideBySideCanvas();
            filename = 'pixelperfect-sidebyside.png';
            break;
        case 'difference':
            canvas = elements.differenceCanvas;
            filename = 'pixelperfect-difference.png';
            break;
    }
    
    // Trigger download
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL();
    link.click();
}

function createSideBySideCanvas() {
    const canvas = document.createElement('canvas');
    const padding = 20;
    const maxWidth = Math.max(state.image1.width, state.image2.width);
    
    canvas.width = (maxWidth * 2) + (padding * 3);
    canvas.height = Math.max(state.image1.height, state.image2.height) + (padding * 2);
    
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw images
    ctx.drawImage(state.image1, padding, padding);
    ctx.drawImage(state.image2, maxWidth + (padding * 2), padding);
    
    return canvas;
}

// ===================================
// Reset
// ===================================
function resetAll() {
    // Reset state
    state.image1 = null;
    state.image2 = null;
    state.comparisonData = null;
    
    // Reset UI
    elements.preview1.src = '';
    elements.preview2.src = '';
    elements.uploadBox1.classList.remove('has-image');
    elements.uploadBox2.classList.remove('has-image');
    elements.fileInput1.value = '';
    elements.fileInput2.value = '';
    
    // Hide buttons and results
    elements.actionButtons.style.display = 'none';
    elements.resultsSection.style.display = 'none';
    elements.uploadSection.style.display = 'block';
    
    // Reset slider
    elements.overlaySlider.value = 50;
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===================================
// Loading State
// ===================================
function showLoading(show) {
    elements.loadingOverlay.style.display = show ? 'flex' : 'none';
}

// ===================================
// GitHub Stars
// ===================================
async function fetchGitHubStars() {
    try {
        // Replace with your actual repo
        const response = await fetch('https://api.github.com/repos/yourusername/pixel-perfect');
        const data = await response.json();
        
        if (data.stargazers_count !== undefined) {
            elements.starCount.textContent = formatNumber(data.stargazers_count);
        }
    } catch (error) {
        console.log('Could not fetch GitHub stars');
        elements.starCount.textContent = '★';
    }
}

function formatNumber(num) {
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
}

// ===================================
// Initialize on page load
// ===================================
document.addEventListener('DOMContentLoaded', init);
