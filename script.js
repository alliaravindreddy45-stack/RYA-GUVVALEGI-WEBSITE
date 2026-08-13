// =========================================================
// MOBILE MENU
// =========================================================

const mobileMenuButton = document.getElementById("mobileMenuButton");
const mainNav = document.getElementById("mainNav");

mobileMenuButton.addEventListener("click", function () {

    const isOpen = mainNav.classList.toggle("mobile-open");

    mobileMenuButton.setAttribute(
        "aria-expanded",
        isOpen ? "true" : "false"
    );

    mobileMenuButton.setAttribute(
        "aria-label",
        isOpen ? "Close navigation" : "Open navigation"
    );

    mobileMenuButton.textContent = isOpen ? "×" : "☰";

});


/* Close mobile menu after selecting a section */

const navigationLinks = mainNav.querySelectorAll("a");

navigationLinks.forEach(function (link) {

    link.addEventListener("click", function () {

        mainNav.classList.remove("mobile-open");

        mobileMenuButton.setAttribute(
            "aria-expanded",
            "false"
        );

        mobileMenuButton.setAttribute(
            "aria-label",
            "Open navigation"
        );

        mobileMenuButton.textContent = "☰";

    });

});


// =========================================================
// SUPABASE CONFIGURATION
// =========================================================

// IMPORTANT: Replace with your actual Supabase credentials
const SUPABASE_URL = 'https://ymnmjosntkixqqeyekst.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_0QDZe1D94xwnDVwjg4vOXg__9th4tmI';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Gallery state
let galleryPhotos = [];
let galleryVideos = [];
let currentPhotoIndex = 0;
let adminPassword = null; // Will be set by user


// =========================================================
// GALLERY TAB SWITCHING
// =========================================================

const galleryTabs = document.querySelectorAll('.gallery-tab');
const galleryContents = document.querySelectorAll('.gallery-content');

galleryTabs.forEach(tab => {
    tab.addEventListener('click', function() {
        const tabName = this.getAttribute('data-tab');
        
        // Update active tab
        galleryTabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        
        // Update active content
        galleryContents.forEach(content => content.classList.remove('active'));
        document.getElementById(tabName + '-tab').classList.add('active');
    });
});


// =========================================================
// LOAD GALLERY FROM SUPABASE
// =========================================================

async function loadGalleryPhotos() {
    try {
        const { data, error } = await supabase.storage
            .from('gallery-photos')
            .list();
        
        if (error) {
            console.error('Error loading photos:', error);
            return;
        }
        
        galleryPhotos = data || [];
        renderPhotos();
    } catch (error) {
        console.error('Error loading photos:', error);
    }
}


async function loadGalleryVideos() {
    try {
        const { data, error } = await supabase.storage
            .from('gallery-videos')
            .list();
        
        if (error) {
            console.error('Error loading videos:', error);
            return;
        }
        
        galleryVideos = data || [];
        renderVideos();
    } catch (error) {
        console.error('Error loading videos:', error);
    }
}


function renderPhotos() {
    const grid = document.getElementById('photosGrid');
    grid.innerHTML = '';
    
    galleryPhotos.forEach((photo, index) => {
        const imageUrl = supabase.storage
            .from('gallery-photos')
            .getPublicUrl(photo.name).data.publicUrl;
        
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.innerHTML = `
            <img src="${imageUrl}" alt="Gallery photo">
            <div class="gallery-item-overlay">
                <span class="gallery-item-icon">🔍</span>
            </div>
        `;
        
        item.addEventListener('click', () => openPhotoLightbox(index));
        grid.appendChild(item);
    });
}


function renderVideos() {
    const grid = document.getElementById('videosGrid');
    grid.innerHTML = '';
    
    galleryVideos.forEach((video, index) => {
        const videoUrl = supabase.storage
            .from('gallery-videos')
            .getPublicUrl(video.name).data.publicUrl;
        
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.innerHTML = `
            <video style="width:100%; height:100%; object-fit:cover;">
                <source src="${videoUrl}" type="video/mp4">
            </video>
            <div class="gallery-item-overlay">
                <span class="gallery-item-icon">▶️</span>
            </div>
        `;
        
        item.addEventListener('click', () => openVideoLightbox(index));
        grid.appendChild(item);
    });
}


// =========================================================
// PHOTO LIGHTBOX
// =========================================================

const photoLightbox = document.getElementById('photoLightbox');
const videoLightbox = document.getElementById('videoLightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxVideo = document.getElementById('lightboxVideo');
const lightboxCounter = document.getElementById('lightboxCounter');


function openPhotoLightbox(index) {
    currentPhotoIndex = index;
    const photo = galleryPhotos[index];
    const imageUrl = supabase.storage
        .from('gallery-photos')
        .getPublicUrl(photo.name).data.publicUrl;
    
    lightboxImage.src = imageUrl;
    lightboxCounter.textContent = `${index + 1} / ${galleryPhotos.length}`;
    photoLightbox.classList.add('active');
}


function openVideoLightbox(index) {
    const video = galleryVideos[index];
    const videoUrl = supabase.storage
        .from('gallery-videos')
        .getPublicUrl(video.name).data.publicUrl;
    
    lightboxVideo.src = videoUrl;
    videoLightbox.classList.add('active');
}


function closeLightbox() {
    photoLightbox.classList.remove('active');
    videoLightbox.classList.remove('active');
    lightboxVideo.pause();
}


document.querySelectorAll('.lightbox-close').forEach(btn => {
    btn.addEventListener('click', closeLightbox);
});


document.getElementById('photoLightbox').addEventListener('click', (e) => {
    if (e.target === photoLightbox) closeLightbox();
});

document.getElementById('videoLightbox').addEventListener('click', (e) => {
    if (e.target === videoLightbox) closeLightbox();
});


document.querySelector('.lightbox-prev').addEventListener('click', () => {
    currentPhotoIndex = (currentPhotoIndex - 1 + galleryPhotos.length) % galleryPhotos.length;
    openPhotoLightbox(currentPhotoIndex);
});


document.querySelector('.lightbox-next').addEventListener('click', () => {
    currentPhotoIndex = (currentPhotoIndex + 1) % galleryPhotos.length;
    openPhotoLightbox(currentPhotoIndex);
});


// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (!photoLightbox.classList.contains('active')) return;
    
    if (e.key === 'ArrowLeft') {
        currentPhotoIndex = (currentPhotoIndex - 1 + galleryPhotos.length) % galleryPhotos.length;
        openPhotoLightbox(currentPhotoIndex);
    } else if (e.key === 'ArrowRight') {
        currentPhotoIndex = (currentPhotoIndex + 1) % galleryPhotos.length;
        openPhotoLightbox(currentPhotoIndex);
    } else if (e.key === 'Escape') {
        closeLightbox();
    }
});


// =========================================================
// ADMIN PANEL
// =========================================================

const adminPanelOverlay = document.getElementById('adminPanelOverlay');
const adminTabs = document.querySelectorAll('.admin-tab');
const adminContents = document.querySelectorAll('.admin-content');
// =========================================================
// MANAGE GALLERY BUTTON
// =========================================================

const manageGalleryBtn = document.getElementById('manageGalleryBtn');
const passwordDialog = document.getElementById('passwordDialog');
const adminPasswordInput = document.getElementById('adminPassword');
const passwordSubmitBtn = document.getElementById('passwordSubmitBtn');
const passwordCancelBtn = document.getElementById('passwordCancelBtn');


// Open password dialog
manageGalleryBtn.addEventListener('click', function () {
    passwordDialog.classList.add('show');
    adminPasswordInput.value = '';
    adminPasswordInput.focus();
});


// Cancel password dialog
passwordCancelBtn.addEventListener('click', function () {
    passwordDialog.classList.remove('show');
    adminPasswordInput.value = '';
});


// Submit password
passwordSubmitBtn.addEventListener('click', function () {

    const password = adminPasswordInput.value.trim();

    if (!password) {
        alert('Please enter the admin password.');
        return;
    }

    adminPassword = password;

    passwordDialog.classList.remove('show');
    adminPanelOverlay.classList.add('show');

    loadAdminMedia();
});


// Enter key submits password
adminPasswordInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        passwordSubmitBtn.click();
    }
});

// Check for admin access (keyboard shortcut: Ctrl+Shift+A)
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        showAdminPanel();
    }
});


function showAdminPanel() {
    passwordDialog.classList.add('show');
    adminPasswordInput.value = '';
    adminPasswordInput.focus();
}


function closeAdminPanel() {
    adminPanelOverlay.classList.remove('show');
}


document.querySelector('.admin-close').addEventListener('click', closeAdminPanel);
document.getElementById('adminPanelOverlay').addEventListener('click', (e) => {
    if (e.target === adminPanelOverlay) closeAdminPanel();
});


// Admin tab switching
adminTabs.forEach(tab => {
    tab.addEventListener('click', function() {
        const tabName = this.getAttribute('data-admin-tab');
        
        adminTabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        
        adminContents.forEach(content => content.classList.remove('active'));
        document.getElementById(tabName + '-tab').classList.add('active');
    });
});


// =========================================================
// ADMIN UPLOAD
// =========================================================

const photoUploadBox = document.getElementById('photoUploadBox');
const videoUploadBox = document.getElementById('videoUploadBox');
const photoInput = document.getElementById('photoInput');
const videoInput = document.getElementById('videoInput');


photoUploadBox.addEventListener('click', () => photoInput.click());
photoUploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    photoUploadBox.style.borderColor = 'var(--gold)';
});
photoUploadBox.addEventListener('dragleave', () => {
    photoUploadBox.style.borderColor = '';
});
photoUploadBox.addEventListener('drop', (e) => {
    e.preventDefault();
    photoUploadBox.style.borderColor = '';
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        uploadPhoto(files[0]);
    }
});


photoInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        uploadPhoto(e.target.files[0]);
    }
});


videoUploadBox.addEventListener('click', () => videoInput.click());
videoUploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    videoUploadBox.style.borderColor = 'var(--gold)';
});
videoUploadBox.addEventListener('dragleave', () => {
    videoUploadBox.style.borderColor = '';
});
videoUploadBox.addEventListener('drop', (e) => {
    e.preventDefault();
    videoUploadBox.style.borderColor = '';
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        uploadVideo(files[0]);
    }
});


videoInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        uploadVideo(e.target.files[0]);
    }
});


async function uploadPhoto(file) {
    const fileName = `photo_${Date.now()}_${file.name}`;
    const progressContainer = document.getElementById('photoProgress');
    const progressBar = document.getElementById('photoProgressBar');
    const progressText = document.getElementById('photoProgressText');
    
    progressContainer.style.display = 'block';
    
    try {
        const { error } = await supabase.storage
            .from('gallery-photos')
            .upload(fileName, file);
        
        if (error) {
            alert('Upload failed: ' + error.message);
            return;
        }
        
        progressText.textContent = '100%';
        progressBar.style.width = '100%';
        
        setTimeout(() => {
            progressContainer.style.display = 'none';
            photoInput.value = '';
            loadGalleryPhotos();
        }, 1000);
    } catch (error) {
        alert('Upload error: ' + error.message);
    }
}


async function uploadVideo(file) {
    const fileName = `video_${Date.now()}_${file.name}`;
    const progressContainer = document.getElementById('videoProgress');
    const progressBar = document.getElementById('videoProgressBar');
    const progressText = document.getElementById('videoProgressText');
    
    progressContainer.style.display = 'block';
    
    try {
        const { error } = await supabase.storage
            .from('gallery-videos')
            .upload(fileName, file);
        
        if (error) {
            alert('Upload failed: ' + error.message);
            return;
        }
        
        progressText.textContent = '100%';
        progressBar.style.width = '100%';
        
        setTimeout(() => {
            progressContainer.style.display = 'none';
            videoInput.value = '';
            loadGalleryVideos();
        }, 1000);
    } catch (error) {
        alert('Upload error: ' + error.message);
    }
}


// =========================================================
// ADMIN MANAGE MEDIA
// =========================================================

async function loadAdminMedia() {
    const photosList = document.getElementById('photosList');
    const videosList = document.getElementById('videosList');
    
    photosList.innerHTML = '';
    videosList.innerHTML = '';
    
    // Load photos
    galleryPhotos.forEach(photo => {
        const item = document.createElement('div');
        item.className = 'media-item';
        item.innerHTML = `
            <span class="media-item-name">${photo.name}</span>
            <button class="media-item-delete" data-type="photo" data-name="${photo.name}">Delete</button>
        `;
        photosList.appendChild(item);
    });
    
    // Load videos
    galleryVideos.forEach(video => {
        const item = document.createElement('div');
        item.className = 'media-item';
        item.innerHTML = `
            <span class="media-item-name">${video.name}</span>
            <button class="media-item-delete" data-type="video" data-name="${video.name}">Delete</button>
        `;
        videosList.appendChild(item);
    });
    
    // Add delete listeners
    document.querySelectorAll('.media-item-delete').forEach(btn => {
        btn.addEventListener('click', async function() {
            const type = this.getAttribute('data-type');
            const name = this.getAttribute('data-name');
            
            if (confirm(`Delete ${name}?`)) {
                await deleteMedia(type, name);
            }
        });
    });
}


async function deleteMedia(type, fileName) {
    const bucket = type === 'photo' ? 'gallery-photos' : 'gallery-videos';
    
    try {
        const { error } = await supabase.storage
            .from(bucket)
            .remove([fileName]);
        
        if (error) {
            alert('Delete failed: ' + error.message);
            return;
        }
        
        if (type === 'photo') {
            loadGalleryPhotos();
        } else {
            loadGalleryVideos();
        }
        
        loadAdminMedia();
    } catch (error) {
        alert('Delete error: ' + error.message);
    }
}


// =========================================================
// INIT: LOAD GALLERY ON PAGE LOAD
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
    loadGalleryPhotos();
    loadGalleryVideos();
});
