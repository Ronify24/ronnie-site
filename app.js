'use strict';
const sections = ['overview', 'skills', 'reel', 'projects'];
const sceneLabels = ['THE VISION', 'THE CRAFT', 'THE MOTION', 'THE WORK'];
const contactMenu = document.getElementById('contactMenu');
let activeScene = 'overview';
let reelRendered = false;
let currentReel = 0;
// Add MP4 or Vimeo entries here; the first entry is selected by default.
const videos = [
 { type: 'mp4', src: './assets/GenAI_Animation_HDR_v2.mp4', sources: { hdr: './assets/GenAI_Animation_HDR_v2.mp4', sdr: './assets/GenAI_Animation_SDR.mp4' }, poster: './assets/Ronnie Cleland Generative Media Studio.webp', title: 'Generative Media | Animation' },
 { type: 'placeholder', title: 'Generative Media | VFX' },
 { type: 'placeholder', title: 'Generative Media | Feature Film' },
 ...[
  'https://player.vimeo.com/video/1123301848',
  'https://player.vimeo.com/video/462445892?h=3cdd3f57a6',
  'https://player.vimeo.com/video/464816152?h=d1eb93eae4',
  'https://player.vimeo.com/video/70997907?h=29ee618e70',
  'https://player.vimeo.com/video/8502989?h=81ef88331d'
 ].map((src, index) => ({ type: 'vimeo', src, title: `Selected reel ${index + 1}` }))
];
let cleanupReelLayout = () => {};
function stopReel() {
 cleanupReelLayout(); cleanupReelLayout = () => {};
 const video = document.querySelector('#reel-slot video');
 if (video) { video.pause(); video.removeAttribute('src'); video.load(); }
 document.getElementById('reel-slot').replaceChildren();
}

function setActive(name, push = false) {
 if (!sections.includes(name)) name = 'overview';
 const leavingReel = activeScene === 'reel' && name !== 'reel';
 activeScene = name;
 sections.forEach(section => {
  const panel = document.getElementById('panel-' + section);
  panel.hidden = section !== name;
  panel.classList.toggle('active', section === name);
 });
 document.querySelectorAll('[data-tab]').forEach(link => {
  const selected = link.dataset.tab === name;
  link.classList.toggle('is-active', selected);
  if (selected) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
 });
 if (push && location.hash !== '#' + name) history.pushState(null, '', '#' + name);
 if (leavingReel) { stopReel(); reelRendered = false; }
 if (name === 'reel' && !reelRendered) { renderReel(); reelRendered = true; }
 document.getElementById('sceneNumber').textContent = String(sections.indexOf(name) + 1).padStart(2, '0');
 document.getElementById('sceneLabel').textContent = sceneLabels[sections.indexOf(name)];
 contactMenu.open = false;
 if (push) { document.getElementById('main').focus({preventScroll: true}); window.scrollTo(0, 0); }
}
document.querySelectorAll('[data-tab]').forEach(link => link.addEventListener('click', event => {
 event.preventDefault(); setActive(link.dataset.tab, true);
 if (link.dataset.projectTarget) document.getElementById('project-' + link.dataset.projectTarget + '-tab').click();
}));
document.querySelector('.skip-link').addEventListener('click', event => { event.preventDefault(); document.getElementById('main').focus(); });
window.addEventListener('hashchange', () => setActive(location.hash.slice(1).replace(/^panel-/, '')));
window.addEventListener('popstate', () => setActive(location.hash.slice(1).replace(/^panel-/, '')));
document.getElementById('scenePrev').addEventListener('click', () => setActive(sections[(sections.indexOf(activeScene) + 3) % 4], true));
document.getElementById('sceneNext').addEventListener('click', () => setActive(sections[(sections.indexOf(activeScene) + 1) % 4], true));
document.getElementById('year').textContent = new Date().getFullYear();
document.addEventListener('click', event => { if (!contactMenu.contains(event.target)) contactMenu.open = false; });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && contactMenu.open) { contactMenu.open = false; contactMenu.querySelector('summary').focus(); } });
contactMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => contactMenu.open = false));

// Every original skill remains available within a focused discipline view.
const disciplineDescriptions = [
 'Shape images, motion, and worlds with guided model workflows. Model availability varies by workspace and provider connection.',
 'Find the rhythm of a story. Bring image, sound, timing, and color together through editorial and finishing.',
 'Build worlds that hold up to a closer look. Light, surface, sculpt, and assemble assets for real-time and production workflows.',
 'Make experimentation repeatable. Connect model behavior, visual understanding, and reliable evaluation to creative workflows.',
 'Keep the creative process connected. Coordinate jobs, assets, cost, and model capabilities without losing the artist’s decisions.',
 'Give the creative work room to run. Design local and cloud inference around available hardware, predictable loading, and runtime health.',
 'Carry a project from approved references to saved shots and a selected Cut. Review costs, compare takes, and keep selection in the artist’s hands.'
];
const disciplineIcons = ['wand-magic-sparkles','film','cube','brain','diagram-project','microchip','share-nodes'];
const disciplineArtwork = {
  1: ['video-post.webp', 'Smoked-glass cinema frames connected by a flowing amber ribbon of light'],
  0: ['generative-vision.webp', 'Sculptural optical glass planes with cyan edges and warm refracted light'],
  2: ['3d-real-time.webp', 'Faceted stone arch and smoked-glass sphere on sculptural stepped plinths'],
  3: ['data-science.webp', 'Ordered glass rods form a wave around a warm amber sphere'],
  4: ['pipeline-backend.webp', 'Connected glass modules carrying a warm light pulse through cyan channels'],
  5: ['compute-ops.webp', 'Layered charcoal computing sculptures with glass spacers and an amber core'],
  6: ['workflow-orchestration.webp', 'Translucent glass ribbons converge through a sculptural gate into one aligned path']
 };
portfolioContent.skills.forEach((skill, index) => {
 const option = document.createElement('option'); option.value = index; option.textContent = skill.title; document.getElementById('disciplineSelect').append(option);
 const button = document.createElement('button');
 button.type = 'button'; button.dataset.discipline = index;
 button.style.setProperty('--discipline-art', `url("./assets/${disciplineArtwork[index][0]}")`);
 button.innerHTML = `<span class="discipline-index">0${index + 1}</span><i class="fa-solid fa-${disciplineIcons[index]}" aria-hidden="true"></i><span>${skill.title}</span><i class="fa-solid fa-chevron-right" aria-hidden="true"></i>`;
 button.addEventListener('click', () => showDiscipline(index));
 document.getElementById('disciplineNav').append(button);
});
document.getElementById('disciplineSelect').addEventListener('change', event => showDiscipline(Number(event.target.value)));
function showDiscipline(index) {
 const art = document.querySelector('.discipline-art img');

 const [file, description] = disciplineArtwork[index] || ['cinematic-world.webp', 'Cinematic light and material study'];
 art.src = './assets/' + file;
 art.alt = description;
 document.getElementById('disciplineSelect').value = index;
 const skill = portfolioContent.skills[index];
 document.querySelectorAll('[data-discipline]').forEach(button => {
  button.classList.toggle('is-active', Number(button.dataset.discipline) === index);
  button.setAttribute('aria-pressed', String(Number(button.dataset.discipline) === index));
 });
 document.getElementById('disciplineKicker').textContent = `DISCIPLINE 0${index + 1} / 07`;
 document.getElementById('disciplineTitle').textContent = skill.title;
 document.getElementById('disciplineDescription').textContent = disciplineDescriptions[index];
 const list = document.getElementById('capabilityList'); list.replaceChildren();
 skill.items.forEach(item => { const li = document.createElement('li'); li.textContent = item; list.append(li); });
}
showDiscipline(0);

function renderReelPlacard(slot, reel) {
   const placard = document.createElement('div');
   placard.className = 'reel-placard';
   const kicker = document.createElement('p');
   kicker.className = 'eyebrow'; kicker.textContent = 'RONNIE CLELAND / SELECTED MOTION';
   const title = document.createElement('h2'); title.textContent = reel.title;
   const detail = document.createElement('p');
   detail.className = 'reel-placard-detail'; detail.textContent = 'A new reel is taking shape.';
   placard.append(kicker, title, detail);
   slot.replaceChildren(placard);
   document.querySelector('.reel-note').textContent = reel.title;
}

let reelRangePreference = 'auto';
const hdrDisplay = window.matchMedia('(dynamic-range: high)');
function resolveReelRange(reel) {
 if (!reel.sources) return null;
 if (reelRangePreference !== 'auto' && reel.sources[reelRangePreference]) return reelRangePreference;
 const hevc = document.createElement('video').canPlayType('video/mp4; codecs="hvc1"');
 if (hdrDisplay.matches && hevc && reel.sources.hdr) return 'hdr';
 return reel.sources.sdr ? 'sdr' : 'hdr';
}
const pendingReelResume = new WeakMap();
function switchReelRange() {
 const previous = document.querySelector('#reel-slot video');
 const state = previous ? pendingReelResume.get(previous) || { time: previous.currentTime, playing: !previous.paused, volume: previous.volume, muted: previous.muted, rate: previous.playbackRate } : null;
 renderReel(state);
}
function renderRangeControls(reel) {
 document.getElementById('reel-range-controls')?.remove();
 const group = document.createElement('div');
 group.id = 'reel-range-controls'; group.className = 'reel-range-controls';
 if (!reel.sources) {
  group.classList.add('reel-range-reserved'); group.setAttribute('aria-hidden', 'true');
  document.querySelector('.reel-label').after(group); return;
 }
 group.setAttribute('role', 'group'); group.setAttribute('aria-label', 'Video dynamic range');
 ['auto', 'hdr', 'sdr'].forEach(mode => {
  const button = document.createElement('button'); button.type = 'button';
  button.textContent = mode === 'auto' ? 'Auto' : mode.toUpperCase();
  button.disabled = mode !== 'auto' && !reel.sources[mode];
  button.title = button.disabled ? mode.toUpperCase() + ' version coming soon' : 'Use ' + button.textContent;
  button.setAttribute('aria-pressed', String(reelRangePreference === mode));
  button.addEventListener('click', () => { reelRangePreference = mode; switchReelRange(); document.querySelector(`#reel-range-controls button[aria-pressed="true"]`)?.focus(); });
  group.append(button);
 });
 const status = document.createElement('span');
 status.textContent = reel.sources.sdr ? resolveReelRange(reel).toUpperCase() + ' source' : 'HDR source · SDR coming soon';
 group.append(status);
 document.querySelector('.reel-label').after(group);
}
hdrDisplay.addEventListener('change', () => {
 if (activeScene === 'reel' && reelRangePreference === 'auto' && videos[currentReel].sources) switchReelRange();
});

function addReelScrubber(video, slot) {
 const bar = document.createElement('div'); bar.id = 'reel-scrubber';
 const range = document.createElement('input'); range.type = 'range'; range.min = '0'; range.max = '0'; range.step = '.1'; range.value = '0'; range.disabled = true;
 range.setAttribute('aria-label', 'Seek video');
 const time = document.createElement('span'); time.textContent = '0:00 / 0:00';
 const stamp = seconds => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
 const update = () => {
  if (!Number.isFinite(video.duration)) return;
  range.max = video.duration; range.disabled = false; range.value = video.currentTime;
  time.textContent = `${stamp(video.currentTime)} / ${stamp(video.duration)}`;
  range.setAttribute('aria-valuetext', time.textContent);
 };
 range.addEventListener('input', () => { pendingReelResume.delete(video); video.currentTime = Number(range.value); update(); });
 ['loadedmetadata', 'durationchange', 'timeupdate', 'seeked'].forEach(event => video.addEventListener(event, update));
 const makeButton = (label, icon, action) => {
  const button = document.createElement('button'); button.type = 'button';
  button.setAttribute('aria-label', label); button.title = label;
  button.innerHTML = `<i class="fa-solid ${icon}" aria-hidden="true"></i>`;
  button.addEventListener('click', action); return button;
 };
 const togglePlay = () => { if (video.paused) video.play().catch(() => {}); else video.pause(); };
 const play = makeButton('Play', 'fa-play', togglePlay);
 const syncPlay = () => {
  const label = video.paused ? 'Play' : 'Pause';
  play.setAttribute('aria-label', label); play.title = label;
  play.firstElementChild.className = 'fa-solid ' + (video.paused ? 'fa-play' : 'fa-pause');
 };
 ['play','pause','ended'].forEach(event => video.addEventListener(event, syncPlay));
 video.addEventListener('click', togglePlay);
 const audio = document.createElement('div'); audio.className = 'reel-audio';
 const popup = document.createElement('div'); popup.className = 'reel-volume-popup'; popup.id = 'reel-volume-popup'; popup.hidden = true;
 const audioButton = makeButton('Audio controls', 'fa-volume-high', () => { popup.hidden = !popup.hidden; audioButton.setAttribute('aria-expanded', String(!popup.hidden)); });
 audioButton.setAttribute('aria-expanded', 'false'); audioButton.setAttribute('aria-controls', popup.id);
 const closeAudio = () => { popup.hidden = true; audioButton.setAttribute('aria-expanded','false'); };
 audio.addEventListener('keydown', event => { if (event.key === 'Escape') { closeAudio(); audioButton.focus(); } });
 audio.addEventListener('focusout', event => { if (!audio.contains(event.relatedTarget)) closeAudio(); });
 bar.addEventListener('click', event => { if (!audio.contains(event.target)) closeAudio(); });
 const mute = makeButton('Mute', 'fa-volume-high', () => { video.muted = !video.muted; });
 const volume = document.createElement('input'); volume.type = 'range'; volume.min = '0'; volume.max = '1'; volume.step = '.05'; volume.className = 'reel-volume'; volume.setAttribute('aria-label','Volume');
 volume.addEventListener('input', () => { video.volume = Number(volume.value); video.muted = video.volume === 0; });
 const syncVolume = () => {
  const silent = video.muted || video.volume === 0;
  mute.setAttribute('aria-label', silent ? 'Unmute' : 'Mute'); mute.title = silent ? 'Unmute' : 'Mute';
  mute.firstElementChild.className = 'fa-solid ' + (silent ? 'fa-volume-xmark' : 'fa-volume-high');
  audioButton.firstElementChild.className = mute.firstElementChild.className;
  volume.value = video.muted ? 0 : video.volume;
 };
 video.addEventListener('volumechange', syncVolume); syncVolume();
 popup.append(mute, volume); audio.append(audioButton, popup);
 const speed = document.createElement('select'); speed.setAttribute('aria-label','Playback speed');
 [.5,.75,1,1.25,1.5,2].forEach(rate => { const option = document.createElement('option'); option.value = rate; option.textContent = rate + '×'; speed.append(option); });
 speed.value = video.playbackRate;
 speed.addEventListener('change', () => { video.playbackRate = Number(speed.value); });
 let stage = slot.parentElement;
 if (!stage.classList.contains('reel-stage')) {
  stage = document.createElement('div'); stage.className = 'reel-stage'; slot.before(stage); stage.append(slot);
 }
 const fullscreen = makeButton('Toggle fullscreen', 'fa-expand', async () => {
  try {
   if (document.fullscreenElement) await document.exitFullscreen();
   else if (stage.requestFullscreen) await stage.requestFullscreen();
   else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
  } catch (_) { /* Keep playback available if fullscreen is denied. */ }
 });
 const timeline = document.createElement('div'); timeline.className = 'reel-timeline'; timeline.append(range,time);
 speed.title = 'Playback speed';
 const actions = document.createElement('div'); actions.className = 'reel-playback-actions'; actions.append(fullscreen,play,audio,speed);
 if (document.pictureInPictureEnabled && video.requestPictureInPicture) {
  const pip = makeButton('Picture in picture', 'fa-clone', async () => {
   try { if (document.pictureInPictureElement) await document.exitPictureInPicture(); else await video.requestPictureInPicture(); } catch (_) {}
  });
  actions.append(pip);
 }
 bar.append(actions); slot.after(bar); slot.append(timeline);
 stage.classList.add('has-native-hub');
 video.tabIndex = 0;
 const events = new AbortController(); const opts = { signal: events.signal };
 const reveal = () => slot.classList.add('show-timeline');
 const conceal = () => slot.classList.remove('show-timeline');
 slot.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') reveal(); }, opts);
 stage.addEventListener('pointerleave', conceal, opts);
 slot.addEventListener('pointerdown', reveal, opts);
 slot.addEventListener('focusin', reveal, opts);
 stage.addEventListener('focusout', event => { if (!stage.contains(event.relatedTarget)) conceal(); }, opts);
 document.addEventListener('pointerdown', event => { if (!stage.contains(event.target)) { conceal(); closeAudio(); } }, opts);
 video.addEventListener('keydown', event => { if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); togglePlay(); reveal(); } }, opts);
 const fit = () => {
  const ratio = video.videoWidth && video.videoHeight ? video.videoWidth / video.videoHeight : 16/9;
  const horizontal = window.matchMedia('(max-width:999px) and (orientation:portrait)').matches;
  const landscapePhone = window.matchMedia('(max-width:999px) and (orientation:landscape)').matches;
  const inset = document.fullscreenElement === stage ? 24 : 0;
  const availableWidth = Math.max(1, stage.clientWidth - inset - (horizontal ? 0 : bar.offsetWidth + 12));
  const availableHeight = Math.max(1, stage.clientHeight - inset - (horizontal ? (landscapePhone ? 44 : bar.offsetHeight + 8) : 0));
  if (stage.clientWidth < 2 || stage.clientHeight < 54) return;
  const width = Math.min(availableWidth, availableHeight * ratio);
  slot.style.width = width + 'px'; slot.style.height = width / ratio + 'px';
  stage.style.setProperty('--video-fit-width', width + 'px');
  stage.parentElement.style.setProperty('--fitted-player-width', (horizontal ? width : width + bar.offsetWidth + 12) + 'px');
 };
 const observer = new ResizeObserver(fit); observer.observe(stage);
 video.addEventListener('loadedmetadata', fit, opts);
 document.addEventListener('fullscreenchange', fit, opts); fit();
 cleanupReelLayout = () => { observer.disconnect(); events.abort(); stage.classList.remove('has-native-hub'); stage.style.removeProperty('--video-fit-width'); stage.parentElement.style.removeProperty('--fitted-player-width'); slot.style.removeProperty('width'); slot.style.removeProperty('height'); conceal(); };

}

function renderReel(resume = null) {
 stopReel();
 document.getElementById('reel-scrubber')?.remove();
 const slot = document.getElementById('reel-slot');
 const reel = videos[currentReel];
 if (!slot.parentElement.classList.contains('reel-stage')) {
  const stage = document.createElement('div'); stage.className = 'reel-stage'; slot.before(stage); stage.append(slot);
 }
 renderRangeControls(reel);
 if (reel.type === 'placeholder') {
  renderReelPlacard(slot, reel);
 } else if (reel.type === 'mp4') {
  const video = document.createElement('video');
  video.controls = false; video.playsInline = true; video.preload = 'metadata';
  video.setAttribute('aria-label', reel.title);
  if (reel.poster) video.poster = reel.poster;
  video.setAttribute('controlslist', 'nodownload');
  video.addEventListener('contextmenu', event => event.preventDefault());
  video.src = reel.sources ? reel.sources[resolveReelRange(reel)] : reel.src;
  if (resume) {
   pendingReelResume.set(video, resume);
   video.volume = resume.volume; video.muted = resume.muted; video.playbackRate = resume.rate;
   video.addEventListener('loadedmetadata', () => {
    if (!slot.contains(video)) return;
    const target = Math.min(resume.time, Number.isFinite(video.duration) ? video.duration : resume.time);
    const restored = () => {
     pendingReelResume.delete(video);
     if (slot.contains(video) && resume.playing) video.play().catch(() => {});
    };
    if (Math.abs(video.currentTime - target) > .01) {
     video.addEventListener('seeked', restored, { once: true });
     video.currentTime = target;
    } else restored();
   }, { once: true });
  }
  video.addEventListener('error', () => {
   if (!slot.contains(video)) return;
   renderReelPlacard(slot, reel);
  }, { once: true });
  slot.append(video);
  addReelScrubber(video, slot);
 } else {
  const frame = document.createElement('iframe');
  const url = new URL(reel.src); url.searchParams.set('playsinline','1'); url.searchParams.set('dnt','1'); url.searchParams.set('transparent','0'); url.searchParams.set('color','34dce4');
  frame.src = url.toString(); frame.title = reel.title;
  frame.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media'; frame.allowFullscreen = true;
  frame.referrerPolicy = 'strict-origin-when-cross-origin'; slot.append(frame);
 }
 if (reel.type !== 'mp4') {
  const stage = slot.parentElement;
  stage.classList.add('has-passive-frame');
  const fit = () => {
   const horizontal = window.matchMedia('(max-width:999px) and (orientation:portrait)').matches;
   // Wait for the portrait flex layout to settle before sizing the embed.
   // Never let a transient zero-height stage collapse the navigation width.
   if (stage.clientWidth < 2 || stage.clientHeight < 54) return;
   const width = Math.min(stage.clientWidth - (horizontal ? 0 : 64), (stage.clientHeight - (horizontal ? (window.matchMedia('(orientation:landscape)').matches ? 44 : 52) : 0)) * 16 / 9);
   slot.style.width = width + 'px'; slot.style.height = width * 9 / 16 + 'px';
   stage.parentElement.style.setProperty('--fitted-player-width', (width + (horizontal ? 0 : 64)) + 'px');
  };
  const observer = new ResizeObserver(fit); observer.observe(stage);
  const layoutFrame = requestAnimationFrame(fit);
  cleanupReelLayout = () => { cancelAnimationFrame(layoutFrame); observer.disconnect(); stage.classList.remove('has-passive-frame'); slot.style.removeProperty('width'); slot.style.removeProperty('height'); stage.parentElement.style.removeProperty('--fitted-player-width'); };
 }
 document.querySelector('.reel-note').textContent = reel.type === 'placeholder' ? reel.title : reel.title + ' · Press play. Let the work speak.';
 document.getElementById('reelCount').textContent = `${String(currentReel + 1).padStart(2,'0')} / ${String(videos.length).padStart(2,'0')}`;
 const dots = document.getElementById('dots'); dots.replaceChildren();
 videos.forEach((_, index) => { const button = document.createElement('button'); button.type = 'button'; button.className = 'dot'; button.setAttribute('aria-label', `Show ${videos[index].title}`); button.setAttribute('aria-pressed', String(index === currentReel)); button.textContent = String(index + 1).padStart(2,'0'); button.addEventListener('click', () => { currentReel = index; renderReel(); }); dots.append(button); });
}
document.getElementById('prevBtn').addEventListener('click', () => { currentReel = (currentReel + videos.length - 1) % videos.length; renderReel(); });
document.getElementById('nextBtn').addEventListener('click', () => { currentReel = (currentReel + 1) % videos.length; renderReel(); });

// Keyboard support for the two compact tab groups.
function wireTabs(selector, activate) {
 const tabs = [...document.querySelectorAll(selector)];
 tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activate(tab));
  tab.addEventListener('keydown', event => {
   let next;
   if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
   if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
   if (event.key === 'Home') next = 0;
   if (event.key === 'End') next = tabs.length - 1;
   if (next !== undefined) { event.preventDefault(); tabs[next].focus(); activate(tabs[next]); }
  });
 });
}
function selectTab(tab) {
 tab.parentElement.querySelectorAll('[role="tab"]').forEach(button => { const selected = button === tab; button.setAttribute('aria-selected', String(selected)); button.tabIndex = selected ? 0 : -1; });
}
wireTabs('[data-project]', tab => {
 selectTab(tab);
 ['lumify','credits'].forEach(name => document.getElementById('project-' + name).hidden = name !== tab.dataset.project);
});
let detailGroup = 'Core workflows';
function renderDetails() {
 const items = portfolioContent.groups[detailGroup];
 const list = document.getElementById('projectDetails'); list.replaceChildren();
 items.forEach(item => { const li = document.createElement('li'); li.textContent = item; list.append(li); });
}
wireTabs('[data-detail]', tab => { selectTab(tab); detailGroup = tab.dataset.detail; document.getElementById('projectDetails').setAttribute('aria-labelledby', tab.id); renderDetails(); });
renderDetails();
portfolioContent.credits.forEach(credit => { const li = document.createElement('li'); li.textContent = credit; document.getElementById('creditList').append(li); });

const resumeDialog = document.getElementById('resumeViewerDialog');
const resumeClose = document.getElementById('resumeViewerClose');
const resumeLaunchers = document.querySelectorAll('.resume-viewer-launch');
let resumeReturnFocus;
resumeLaunchers.forEach(link => link.addEventListener('click', event => {
 event.preventDefault(); resumeReturnFocus = event.currentTarget;
 resumeDialog.showModal(); resumeLaunchers.forEach(link => link.setAttribute('aria-expanded','true'));
 resumeClose.focus({preventScroll:true});
}));
resumeClose.addEventListener('click', () => resumeDialog.close());
resumeDialog.addEventListener('click', event => { if (event.target === resumeDialog) resumeDialog.close(); });
resumeDialog.addEventListener('close', () => {
 resumeLaunchers.forEach(link => link.setAttribute('aria-expanded','false'));
 if (resumeReturnFocus?.closest('#contactMenu')) contactMenu.open = true;
 resumeReturnFocus?.focus({preventScroll:true});
});
setActive(location.hash.slice(1).replace(/^panel-/, ''));
