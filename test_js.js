
/* ===================================================
   PETALS ANIMATION — cánh hoa + bông hoa + trái tim
=================================================== */
(function() {
  const canvas = document.getElementById('petals-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  const petalColors = [
    ['#ff6b9d','#ff8fab'], ['#ffb3c6','#ffd6e0'],
    ['#ff4d88','#ff8fab'], ['#ffc2d1','#ffb3c6'], ['#ff85a1','#ff6b9d'],
  ];

  // Các loại: 0=cánh hoa, 1=bông hoa emoji, 2=trái tim emoji
  const EMOJIS = ['🌸','🌺','🌷','💕','💖','❤️','🩷'];

  class Particle {
    constructor(init) { this.reset(init); }
    reset(init) {
      this.x     = Math.random() * (W || window.innerWidth);
      this.y     = init ? Math.random() * -(H || window.innerHeight) : -30;
      this.speed = 1.4 + Math.random() * 2.4;
      this.wind  = (Math.random() - 0.4) * 1.1;
      this.sway  = 0;
      this.swayS = 0.008 + Math.random() * 0.018;
      this.swayA = 0.4 + Math.random() * 1.3;
      this.rot   = Math.random() * Math.PI * 2;
      this.rotS  = (Math.random() - 0.5) * 0.05;
      this.alpha = 0.55 + Math.random() * 0.4;

      // Xác suất: 55% cánh hoa, 25% bông hoa, 20% trái tim
      const r = Math.random();
      if (r < 0.55) {
        this.type  = 'petal';
        this.size  = 6 + Math.random() * 13;
        const c    = petalColors[Math.floor(Math.random() * petalColors.length)];
        this.c1 = c[0]; this.c2 = c[1];
      } else {
        this.type  = 'emoji';
        this.emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
        this.size  = 10 + Math.random() * 14;
      }
    }
    update() {
      this.sway += this.swayS;
      this.x    += this.wind + Math.sin(this.sway) * this.swayA;
      this.y    += this.speed;
      this.rot  += this.rotS;
      if (this.y > (H || window.innerHeight) + 30) this.reset(false);
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);

      if (this.type === 'petal') {
        const g = ctx.createRadialGradient(0,0,0, 0,0,this.size);
        g.addColorStop(0, this.c1);
        g.addColorStop(1, this.c2);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.bezierCurveTo( this.size*.8, -this.size*.5,  this.size*.8,  this.size*.5, 0,  this.size);
        ctx.bezierCurveTo(-this.size*.8,  this.size*.5, -this.size*.8, -this.size*.5, 0, -this.size);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.font = `${this.size * 2}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.emoji, 0, 0);
      }
      ctx.restore();
    }
  }

  const particles = Array.from({length: 40}, (_, i) => new Particle(true));

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ===================================================
   MUSIC PLAYER
=================================================== */
const audio    = document.getElementById('bg-music');
const musicBar = document.getElementById('music-bar');
const musicIcon= document.getElementById('music-icon');
const musicLabel=document.getElementById('music-label');
let musicPlaying = false;

// Tự động load & phát nhạc ngay khi user tương tác lần đầu
(function autoLoadMusic() {
  const firstTrack = 'music/có hẹn với thanh xuân.mp3';
  audio.src = firstTrack;
  audio.volume = 0.75;

  // Phát ngay khi mở (nếu trình duyệt cho phép)
  audio.play().then(() => {
    musicPlaying = true;
    musicBar.classList.remove('paused');
    musicIcon.textContent = '🎵';
  }).catch(() => {
    // Trình duyệt chặn → chờ user chạm/click lần đầu rồi tự phát
    const startOnInteraction = () => {
      audio.play().then(() => {
        musicPlaying = true;
        musicBar.classList.remove('paused');
        musicIcon.textContent = '🎵';
      }).catch(() => {});
      document.removeEventListener('click',   startOnInteraction);
      document.removeEventListener('keydown', startOnInteraction);
      document.removeEventListener('scroll',  startOnInteraction);
      document.removeEventListener('touchstart', startOnInteraction);
    };
    document.addEventListener('click',      startOnInteraction, { once: true });
    document.addEventListener('keydown',    startOnInteraction, { once: true });
    document.addEventListener('scroll',     startOnInteraction, { once: true });
    document.addEventListener('touchstart', startOnInteraction, { once: true });
  });
})();

const tracks = [
  { src: 'music/có hẹn với thanh xuân.mp3', name: 'Có Hẹn Với Thanh Xuân' },
  { src: 'music/Năm Tháng Ấy.mp3',           name: 'Năm Tháng Ấy' },
  { src: 'music/Nụ Cười 18 20.mp3',          name: 'Nụ Cười 18-20' },
  { src: 'music/Tháng 5 không trở lại.mp3',  name: 'Tháng 5 Không Trở Lại' },
];
let trackIndex = 0;
let dropdownOpen = false;

const dropdown = document.getElementById('music-dropdown');
const arrow    = document.getElementById('music-arrow');

// Build danh sách bài
function buildTrackList() {
  dropdown.innerHTML = tracks.map((t, i) => `
    <div class="music-track-item ${i === trackIndex ? 'active' : ''}" onclick="event.stopPropagation(); selectTrack(${i})">
      <span class="track-icon">${i === trackIndex ? '♪' : '♩'}</span>
      <span>${t.name}</span>
    </div>`).join('');
}

function toggleTrackList() {
  dropdownOpen = !dropdownOpen;
  if (dropdownOpen) {
    buildTrackList();
    dropdown.classList.add('open');
    arrow.style.transform = 'rotate(180deg)';
    // Đóng khi click ra ngoài
    setTimeout(() => document.addEventListener('click', closeDropdown, { once: true }), 10);
  } else {
    closeDropdown();
  }
}

function closeDropdown() {
  dropdownOpen = false;
  dropdown.classList.remove('open');
  arrow.style.transform = 'rotate(0deg)';
}

function selectTrack(i) {
  trackIndex = i;
  const t = tracks[i];
  audio.src = t.src;
  musicLabel.textContent = t.name;
  audio.play().then(() => {
    musicPlaying = true;
    musicBar.classList.remove('paused');
    musicIcon.textContent = '🎵';
  }).catch(e => console.log(e));
  closeDropdown();
}

// Tự động chuyển bài kế tiếp khi hết bài
audio.addEventListener('ended', () => {
  trackIndex = (trackIndex + 1) % tracks.length;
  const t = tracks[trackIndex];
  audio.src = t.src;
  musicLabel.textContent = t.name;
  audio.play().then(() => {
    musicPlaying = true;
    musicBar.classList.remove('paused');
    musicIcon.textContent = '🎵';
  }).catch(e => console.log(e));
});

function toggleMusic() {
  if (!audio.src) return;
  if (musicPlaying) {
    audio.pause();
    musicPlaying = false;
    musicBar.classList.add('paused');
    musicIcon.textContent = '⏸';
  } else {
    audio.play().then(() => {
      musicPlaying = true;
      musicBar.classList.remove('paused');
      musicIcon.textContent = '🎵';
    }).catch(e => console.log(e));
  }
}

/* ===================================================
   GALLERY — tự động load từ images/ nếu có
=================================================== */
// Đường dẫn ảnh mặc định từ thư mục images/
// Nếu file tồn tại sẽ hiển thị, nếu không sẽ hiển thị placeholder
const galleryPhotos = new Array(18).fill(null);

(function preloadFromFolder() {
  // Tên file ảnh thực tế trong thư mục images/
  const fileNames = [
    'ngoc0.jpg','ngoc1.jpg','ngoc2.jpg','ngoc3.jpg','ngoc4.jpg','ngoc5.jpg',
    'ngoc6.jpg','ngoc7.jpg','ngoc8.jpg','ngoc9.jpg','ngoc10.jpg','ngoc11.jpg',
    'ngoc12.jpg','ngoc13.jpg','ngoc14.jpg','ngoc15.jpg','ngoc16.jpg','ngoc17.jpg'
  ];
  fileNames.forEach((name, i) => {
    const src = `images/${name}`;
    const img = new Image();
    img.onload = () => {
      galleryPhotos[i] = src;
      buildGallery();
    };
    img.src = src;
  });
})();
let   lightboxIndex  = 0;

const labels = [
  'Khoảnh khắc đầu năm','Giờ ra chơi','Tiết thể dục','Ngày lễ 20/11',
  'Cắm trại','Đêm hội trường','Tiết học vui','Bữa ăn cùng nhau',
  'Hoạt động ngoại khóa','Chuyến dã ngoại','Khoảnh khắc hài hước','Thi cuối kỳ',
  'Liên hoan lớp','Ngày chia tay','Nhóm bạn thân','Thầy cô yêu quý',
  'Giải thưởng','Kỷ niệm cuối cùng'
];

function buildGallery() {
  const grid = document.getElementById('gallery-grid');
  grid.innerHTML = '';
  for (let i = 0; i < 18; i++) {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.dataset.index = i;
    item.addEventListener('click', () => openLightbox(i));

    if (galleryPhotos[i]) {
      item.innerHTML = `
        <img src="${galleryPhotos[i]}" alt="${labels[i]}">
        <div class="gallery-number">${i+1}</div>
        <div class="gallery-upload-overlay">
          <span class="gallery-upload-icon">🔄</span>
          <span>Đổi ảnh</span>
        </div>`;
    } else {
      item.innerHTML = `
        <div class="gallery-placeholder">
          <span class="ph-icon">🌸</span>
          <span>${labels[i]}</span>
          <span style="font-size:0.75rem;opacity:0.7">Click để tải ảnh</span>
        </div>
        <div class="gallery-number">${i+1}</div>`;
    }

    // File input for upload
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'image/*';
    inp.className = 'gallery-input';
    inp.addEventListener('change', (e) => {
      e.stopPropagation();
      const f = e.target.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = ev => {
        galleryPhotos[i] = ev.target.result;
        buildGallery();
      };
      reader.readAsDataURL(f);
    });
    item.appendChild(inp);

    item.addEventListener('click', (e) => {
      if (e.target.closest('.gallery-placeholder') || e.target.closest('.gallery-upload-overlay')) {
        e.stopPropagation();
        inp.click();
      } else if (galleryPhotos[i]) {
        openLightbox(i);
      } else {
        inp.click();
      }
    });

    grid.appendChild(item);
  }
  // Gọi lại animation sau mỗi lần render
  setTimeout(() => {
    if (typeof initGalleryItems === 'function') initGalleryItems();
    if (typeof observeGalleryItems === 'function') observeGalleryItems();
  }, 0);
}
buildGallery();

function openLightbox(idx) {
  if (!galleryPhotos[idx]) return;
  lightboxIndex = idx;
  document.getElementById('lb-img').src = galleryPhotos[idx];
  document.getElementById('lightbox').classList.add('open');
}
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
}
function lbNav(dir) {
  let next = lightboxIndex + dir;
  // find next with photo
  for (let t = 0; t < 18; t++) {
    next = ((next % 18) + 18) % 18;
    if (galleryPhotos[next]) break;
    next += dir;
  }
  if (galleryPhotos[next]) openLightbox(next);
}
document.getElementById('lightbox').addEventListener('click', function(e){
  if (e.target === this) closeLightbox();
});

/* ===================================================
   RSVP
=================================================== */
// Load từ localStorage khi mở trang
const rsvpData = JSON.parse(localStorage.getItem('rsvpData') || '[]');
// Khôi phục time thành Date object
rsvpData.forEach(r => r.time = new Date(r.time));
// Hiển thị ngay nếu đã có dữ liệu
if (rsvpData.length) renderRsvpList();

function submitRsvp(e) {
  e.preventDefault();
  const name    = document.getElementById('rsvp-name').value.trim();
  const attend  = document.querySelector('input[name="attend"]:checked')?.value;
  const guests  = document.getElementById('rsvp-guests').value;
  const msg     = document.getElementById('rsvp-msg').value.trim();
  if (!name || !attend) return;
  const entry = { name, attend, guests, msg, time: new Date().toISOString() };
  rsvpData.push(entry);
  // Lưu localStorage (backup)
  localStorage.setItem('rsvpData', JSON.stringify(rsvpData));
  // Ghi lên Firebase
  if (typeof window.submitRsvpFirebase === 'function') {
    window.submitRsvpFirebase(entry);
  }

  document.getElementById('rsvp-form-wrap').style.display = 'none';
  document.getElementById('rsvp-success').style.display = 'block';
  renderRsvpList();
}

function resetRsvp() {
  document.getElementById('rsvp-form').reset();
  document.getElementById('rsvp-form-wrap').style.display = 'block';
  document.getElementById('rsvp-success').style.display = 'none';
}

function renderRsvpList() {
  // Danh sách ở sổ lưu bút
  const bookList = document.getElementById('rsvp-book-list');
  if (!bookList) return;
  if (!rsvpData.length) {
    bookList.innerHTML = '<p style="text-align:center;color:#c77daa;font-style:italic;padding:20px">Chưa có lời nhắn nào. Hãy điền vào <a href="#rsvp" style="color:var(--pink1);font-weight:700">Tham Dự Nhé?</a> 🌸</p>';
    return;
  }
  bookList.innerHTML = rsvpData.map((r, i) => {
    const icon  = r.attend === 'yes' ? '🌸' : r.attend === 'no' ? '😢' : '🤔';
    const label = r.attend === 'yes' ? 'Có tham dự' : r.attend === 'no' ? 'Tiếc quá, bận mất rồi' : 'Có thể tham dự';
    const color = r.attend === 'yes' ? '#2d9e3a' : r.attend === 'no' ? '#c9184a' : '#f4a261';
    return `<div style="background:#fff;border-radius:4px 12px 12px 4px;
        box-shadow:-4px 0 0 ${color},0 3px 12px rgba(255,107,157,0.1);
        padding:14px 18px;display:flex;justify-content:space-between;align-items:flex-start;
        gap:12px;animation:fadeSlideUp .4s ease both;animation-delay:${i*0.06}s;
        background-image:repeating-linear-gradient(transparent,transparent 24px,#ffeef4 24px,#ffeef4 25px);">
      <div style="flex:1">
        <div style="font-family:'Dancing Script',cursive;font-size:1.1rem;color:var(--pink1);font-weight:700">${r.name}</div>
        ${r.msg ? `<div style="font-size:0.88rem;color:#7a3a5a;margin-top:4px;line-height:1.5">"${r.msg}"</div>` : ''}
        ${parseInt(r.guests) > 0 ? `<div style="font-size:0.78rem;color:#c77daa;margin-top:3px">+${r.guests} người đi cùng</div>` : ''}
      </div>
      <div style="text-align:right;white-space:nowrap">
        <div style="font-size:1.2rem">${icon}</div>
        <div style="font-size:0.72rem;color:${color};font-weight:700;margin-top:2px">${label}</div>
      </div>
    </div>`;
  }).join('');
}

/* ===================================================
   INTRO PETALS — cánh hoa + bông hoa + trái tim
=================================================== */
(function() {
  const canvas = document.getElementById('intro-petals');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = canvas.offsetWidth  || window.innerWidth;
    H = canvas.height = canvas.offsetHeight || window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const colors = [
    ['#ff6b9d','#ffb3c6'], ['#ff4d88','#ff8fab'],
    ['#ffc2d1','#ffd6e0'], ['#e05c8a','#ff6b9d'], ['#ffadc7','#fff0f3'],
  ];
  const EMOJIS = ['🌸','🌺','🌷','💕','💖','🩷','❤️'];

  class IntroParticle {
    constructor(init) { this.reset(init); }
    reset(init) {
      this.x     = Math.random() * (W || window.innerWidth);
      this.y     = init ? Math.random() * -(H || window.innerHeight) : -30;
      this.speed = 1.8 + Math.random() * 2.8;
      this.wind  = (Math.random() - 0.4) * 1.5;
      this.rot   = Math.random() * Math.PI * 2;
      this.rotS  = (Math.random() - 0.5) * 0.07;
      this.sway  = 0; this.swayS = 0.015 + Math.random() * 0.025;
      this.swayA = 0.6 + Math.random() * 1.4;
      this.alpha = 0.55 + Math.random() * 0.4;
      const r = Math.random();
      if (r < 0.55) {
        this.type = 'petal';
        this.size = 5 + Math.random() * 12;
        const c = colors[Math.floor(Math.random() * colors.length)];
        this.c1 = c[0]; this.c2 = c[1];
      } else {
        this.type  = 'emoji';
        this.emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
        this.size  = 9 + Math.random() * 12;
      }
    }
    update() {
      this.sway += this.swayS;
      this.x    += this.wind + Math.sin(this.sway) * this.swayA;
      this.y    += this.speed;
      this.rot  += this.rotS;
      if (this.y > (H || window.innerHeight) + 30) this.reset(false);
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);
      if (this.type === 'petal') {
        const g = ctx.createRadialGradient(0,0,0, 0,0,this.size);
        g.addColorStop(0, this.c1); g.addColorStop(1, this.c2);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.bezierCurveTo( this.size*.8, -this.size*.5,  this.size*.8,  this.size*.5, 0,  this.size);
        ctx.bezierCurveTo(-this.size*.8,  this.size*.5, -this.size*.8, -this.size*.5, 0, -this.size);
        ctx.closePath(); ctx.fill();
      } else {
        ctx.font = `${this.size * 2}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.emoji, 0, 0);
      }
      ctx.restore();
    }
  }

  const particles = Array.from({length: 45}, (_, i) => new IntroParticle(true));

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    if (document.getElementById('intro-petals')) requestAnimationFrame(loop);
  }
  loop();
})();

/* ===================================================
   INTRO — ENVELOPE
=================================================== */
let envelopeOpened = false;

function openEnvelope() {
  if (envelopeOpened) return;
  envelopeOpened = true;

  const wrap = document.getElementById('envelope-wrap');
  const seal = document.getElementById('env-seal');
  wrap.style.animation = 'none';
  if (seal) seal.style.animation = 'none';
  wrap.classList.add('opening');

  // 600ms: phong bì đang mở → hiện màn hình lá thư
  setTimeout(() => {
    // Đồng bộ ảnh AVT
    const src = document.getElementById('profile-img')?.src;
    if (src && document.getElementById('profile-img')?.style.display !== 'none') {
      document.getElementById('letter-avatar').src = src;
      document.getElementById('letter-avatar').style.display = 'block';
      document.getElementById('letter-avatar-ph').style.display = 'none';
    }

    const reveal = document.getElementById('letter-reveal');
    const card   = document.getElementById('letter-card');
    reveal.style.opacity = '1';
    reveal.style.pointerEvents = 'all';

    // Lá thư trượt lên sau 80ms
    setTimeout(() => {
      card.style.transform = 'translateY(0)';
    }, 80);

    // Ẩn intro
    document.getElementById('intro').classList.add('hide');

    // 2.5s sau → fade out lá thư, vào trang chính
    setTimeout(() => {
      reveal.style.opacity = '0';
      reveal.style.pointerEvents = 'none';
      // Phát nhạc
      if (!musicPlaying && audio.src) {
        audio.play().then(() => {
          musicPlaying = true;
          musicBar.classList.remove('paused');
          musicIcon.textContent = '🎵';
        }).catch(() => {});
      }
      setTimeout(() => {
        reveal.remove();
        const intro = document.getElementById('intro');
        if (intro) intro.remove();
      }, 500);
    }, 2500);

  }, 600);
}

/* ===================================================
   SCROLL ANIMATIONS
=================================================== */
const observer = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('visible'); }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-in-section').forEach(s => observer.observe(s));

/* ===================================================
   GALLERY SCROLL ANIMATION — bay từ 2 bên + scale
=================================================== */
function initGalleryItems() {
  const items = document.querySelectorAll('.gallery-item');
  items.forEach((item, i) => {
    const fromLeft = i % 2 === 0;
    item.style.opacity = '0';
    item.style.transform = fromLeft
      ? 'translateX(-60px) scale(0.92)'
      : 'translateX(60px) scale(0.92)';
    item.style.transition = 'none';
  });
}

const galObserver = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting) {
      const item  = en.target;
      const idx   = parseInt(item.dataset.index) || 0;
      const delay = (idx % 2) * 180;
      setTimeout(() => {
        item.style.transition = 'opacity 1.1s cubic-bezier(.25,.8,.25,1), transform 1.1s cubic-bezier(.25,.8,.25,1)';
        item.style.opacity    = '1';
        item.style.transform  = 'translateX(0) scale(1)';
      }, delay);
      galObserver.unobserve(item);
    }
  });
}, { threshold: 0.12 });

function observeGalleryItems() {
  document.querySelectorAll('.gallery-item').forEach(item => {
    galObserver.observe(item);
  });
}

// Gọi sau khi cả 2 hàm đã định nghĩa xong
// và sau buildGallery() đã chạy
initGalleryItems();
observeGalleryItems();

/* ===================================================
   FIREBASE RENDER — hiển thị danh sách từ Firebase
=================================================== */
window.renderRsvpBookFromFirebase = function(entries) {
  const bookList = document.getElementById('rsvp-book-list');
  if (!bookList) return;
  if (!entries || !entries.length) {
    bookList.innerHTML = '<p style="text-align:center;color:#c77daa;font-style:italic;padding:20px">Chưa có lời nhắn nào. Hãy điền vào <a href="#rsvp" style="color:var(--pink1);font-weight:700">Tham Dự Nhé?</a> 🌸</p>';
    return;
  }
  bookList.innerHTML = entries.map((r, i) => {
    const icon  = r.attend === 'yes' ? '🌸' : r.attend === 'no' ? '😢' : '🤔';
    const label = r.attend === 'yes' ? 'Có tham dự' : r.attend === 'no' ? 'Tiếc quá, bận mất rồi' : 'Có thể tham dự';
    const color = r.attend === 'yes' ? '#2d9e3a' : r.attend === 'no' ? '#c9184a' : '#f4a261';
    const time  = r.time ? new Date(r.time).toLocaleDateString('vi-VN',{day:'2-digit',month:'2-digit'}) + ' ' + new Date(r.time).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'}) : '';
    return `<div style="background:#fff;border-radius:4px 12px 12px 4px;
        box-shadow:-4px 0 0 ${color},0 3px 12px rgba(255,107,157,0.1);
        padding:14px 18px;display:flex;justify-content:space-between;align-items:flex-start;
        gap:12px;animation:fadeSlideUp .4s ease both;animation-delay:${i*0.06}s;
        background-image:repeating-linear-gradient(transparent,transparent 24px,#ffeef4 24px,#ffeef4 25px);">
      <div style="flex:1">
        <div style="font-family:'Dancing Script',cursive;font-size:1.1rem;color:var(--pink1);font-weight:700">${r.name}</div>
        ${r.msg ? `<div style="font-size:0.88rem;color:#7a3a5a;margin-top:4px;line-height:1.5">"${r.msg}"</div>` : ''}
        ${parseInt(r.guests) > 0 ? `<div style="font-size:0.78rem;color:#c77daa;margin-top:3px">+${r.guests} người đi cùng</div>` : ''}
        <div style="font-size:0.72rem;color:#dbb0c4;margin-top:3px">${time}</div>
      </div>
      <div style="text-align:right;white-space:nowrap">
        <div style="font-size:1.2rem">${icon}</div>
        <div style="font-size:0.72rem;color:${color};font-weight:700;margin-top:2px">${label}</div>
      </div>
    </div>`;
  }).join('');
/* ===================================================
   CROP ẢNH AVT
=================================================== */
let cropperInstance = null;

function loadProfileImg(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => { openCrop(e.target.result); };
  reader.readAsDataURL(file);
}

function openCrop(src) {
  const overlay = document.getElementById('crop-overlay');
  const cropImg = document.getElementById('crop-img');
  cropImg.src   = src;
  overlay.classList.add('open');
  cropImg.onload = () => {
    if (cropperInstance) cropperInstance.destroy();
    cropperInstance = new Cropper(cropImg, {
      aspectRatio: 1, viewMode: 1, dragMode: 'move',
      autoCropArea: 0.8, cropBoxResizable: true,
      cropBoxMovable: true, background: false, guides: false,
    });
  };
}

function closeCrop() {
  document.getElementById('crop-overlay').classList.remove('open');
  if (cropperInstance) { cropperInstance.destroy(); cropperInstance = null; }
}

function confirmCrop() {
  if (!cropperInstance) return;
  const canvas = cropperInstance.getCroppedCanvas({ width: 400, height: 400 });
  const src    = canvas.toDataURL('image/jpeg', 0.9);
  const img    = document.getElementById('profile-img');
  img.src = src; img.style.display = 'block';
  document.getElementById('profile-placeholder').style.display = 'none';
  closeCrop();
}


