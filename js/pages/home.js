/* ============================================================
   HOME PAGE
   Banner slider, notice text and the category grid.
   ============================================================ */

import { boot } from '../app.js';
import { state } from '../state.js';
import { onData } from '../firebase/listeners.js';
import { setText } from '../ui.js';

let slideIndex = 0;
let slideInterval = null;

/* ---------- categories (original markup, unchanged) ---------- */

function createCategoryCardHTML(key, value) {
    return `
    <div class="cat-card" onclick="window.openCategory('${key}')">
         <img src="${value.img}" class="cat-card-img">
         <div class="cat-card-info">
             <div class="cat-card-title">${value.name}</div>
             <div class="cat-card-count" id="count-${key}">0 Matches</div>
         </div>
    </div>`;
}

function renderCategories() {
    const c = document.getElementById('dynamic-category-list');
    if (!c) return;
    c.innerHTML = "";
    Object.entries(state.activeCategories).forEach(([k, v]) => {
        c.innerHTML += createCategoryCardHTML(k, v);
    });
    updateCounts();
}

function updateCounts() {
    Object.keys(state.activeCategories).forEach(k => {
        const n = state.rawMatches.filter(m => m.categoryId === k && m.status !== 'Finished').length;
        const el = document.getElementById(`count-${k}`);
        if (el) el.innerText = `${n} Matches Found`;
    });
}

/* ---------- banner slider ---------- */

function initSlider() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    if (slides.length === 0) return;
    if (slideInterval) clearInterval(slideInterval);
    slideInterval = setInterval(() => {
        slideIndex = (slideIndex + 1) % slides.length;
        const wrapper = document.getElementById('banner-slider-wrapper');
        if (wrapper) wrapper.style.transform = `translateX(-${slideIndex * 100}%)`;
        dots.forEach(d => d.classList.remove('active'));
        if (dots[slideIndex]) dots[slideIndex].classList.add('active');
    }, 3000);
}

/* ---------- app_settings driven pieces of this page ---------- */

function applySettings() {
    const d = state.settings;
    if (!d) return;

    if (d.notice) setText('dynamic-notice', d.notice);

    if (d.banners) {
        const w = document.getElementById('banner-slider-wrapper');
        const dots = document.getElementById('slider-dots');
        if (!w || !dots) return;
        w.innerHTML = "";
        dots.innerHTML = "";
        const banners = Object.values(d.banners);
        if (banners.length > 0) {
            banners.forEach((b, i) => {
                w.innerHTML += `<div class="slide"><img src="${b.img}"></div>`;
                dots.innerHTML += `<div class="dot ${i === 0 ? 'active' : ''}"></div>`;
            });
            initSlider();
        }
    }
}

/* ---------- boot ---------- */

boot({
    requiresAuth: true,
    onReady: () => {
        onData('categories', renderCategories);
        onData('matches', updateCounts);
        onData('settings', applySettings);
    }
});
