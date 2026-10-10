// Google Meet Lobby (Green Room) View Component with Exact Live Details

export function renderLobby(container, state, actions) {
  const meetingCode = state.meetingCode || 'eps-kziz-mfv';
  const meetingUrl = `meet.google.com/${meetingCode}`;

  container.innerHTML = `
    <div class="lobby-screen">
      <!-- Header -->
      <header class="lobby-header">
        <div class="lobby-logo-wrapper" id="btn-lobby-logo">
          <!-- Authentic Google Meet SVG Logo -->
          <svg class="meet-icon-svg" viewBox="0 0 192 192" fill="none">
            <path d="M120 48L96 68V124L120 144V48Z" fill="#00832D"/>
            <path d="M144 68L120 48V144L144 124V68Z" fill="#0066DA"/>
            <path d="M120 144H32C23.1634 144 16 136.837 16 128V64C16 55.1634 23.1634 48 32 48H120V144Z" fill="#00AC47"/>
            <path d="M16 64C16 55.1634 23.1634 48 32 48H72L16 104V64Z" fill="#EA4335"/>
            <path d="M120 144L72 96L16 144H120Z" fill="#2684FC"/>
            <path d="M144 68L176 44V148L144 124V68Z" fill="#FFBA00"/>
          </svg>
          <div class="logo-text">Google <span>Meet</span></div>
        </div>

        <div class="lobby-header-right">
          <span class="header-time" id="lobby-clock">12:00 AM</span>
          <button class="header-icon-btn" data-tooltip="Support" id="btn-support">
            <span class="icon">help_outline</span>
          </button>
          <button class="header-icon-btn" data-tooltip="Feedback" id="btn-feedback">
            <span class="icon">feedback</span>
          </button>
          <button class="header-icon-btn" data-tooltip="Settings" id="btn-lobby-settings">
            <span class="icon">settings</span>
          </button>
          <div class="user-avatar-circle" data-tooltip="Google Account: Ayushmaan Soni">A</div>
        </div>
      </header>

      <!-- Main Section -->
      <main class="lobby-content">
        <!-- Preview Left Column -->
        <div class="lobby-preview-column">
          <div class="video-preview-wrapper ${state.activeEffect ? 'effect-' + state.activeEffect : ''}" id="preview-video-container">
            <video id="lobby-video" autoplay playsinline muted></video>
            
            <!-- Fallback Avatar when camera is off -->
            <div class="preview-avatar-placeholder" id="lobby-avatar-fallback" style="display: none;">
              <div class="preview-avatar" id="lobby-avatar-circle">A</div>
              <span class="camera-off-label">Camera is off</span>
            </div>

            <!-- Code Badge -->
            <div class="preview-code-badge">
              <span class="icon" style="font-size: 16px;">lock</span>
              <span>${meetingCode}</span>
            </div>

            <!-- Audio Meter Indicator in preview corner -->
            <div class="preview-audio-meter-corner" id="preview-vu-meter">
              <span class="vu-bar" id="vu-bar-1"></span>
              <span class="vu-bar" id="vu-bar-2"></span>
              <span class="vu-bar" id="vu-bar-3"></span>
            </div>

            <!-- Center/Bottom Preview Control Buttons -->
            <div class="preview-controls">
              <button class="preview-ctrl-btn ${!state.isMicOn ? 'off' : ''}" id="lobby-mic-btn" data-tooltip="${state.isMicOn ? 'Turn off microphone' : 'Turn on microphone'}">
                <span class="icon">${state.isMicOn ? 'mic' : 'mic_off'}</span>
                <div class="mic-wave-indicator" id="lobby-mic-wave"></div>
              </button>
              <button class="preview-ctrl-btn ${!state.isCameraOn ? 'off' : ''}" id="lobby-cam-btn" data-tooltip="${state.isCameraOn ? 'Turn off camera' : 'Turn on camera'}">
                <span class="icon">${state.isCameraOn ? 'videocam' : 'videocam_off'}</span>
              </button>
            </div>
          </div>

          <!-- Bottom Actions for Preview -->
          <div class="preview-footer-actions">
            <button class="pill-action-btn" id="btn-check-devices">
              <span class="icon">graphic_eq</span>
              <span>Check your audio and video</span>
            </button>
            <button class="pill-action-btn" id="btn-visual-effects">
              <span class="icon">auto_fix_high</span>
              <span>Apply visual effects</span>
            </button>
          </div>
        </div>

        <!-- Join Actions Right Column -->
        <div class="lobby-join-column">
          <h1 class="ready-title">Ready to join?</h1>
          <div class="ready-subtitle">
            <div class="active-participant-dots">
              <div class="mini-dot" style="background:#0d904f;">S</div>
              <div class="mini-dot" style="background:#e37400;">D</div>
              <div class="mini-dot" style="background:#a142f4;">E</div>
            </div>
            <span style="margin-left: 10px;">Sarah Chen, David Miller, and Elena are in this call</span>
          </div>

          <div class="lobby-buttons-row">
            <button class="btn-join-now" id="btn-join-now">Join now</button>
            <button class="btn-present-now" id="btn-present-lobby">
              <span class="icon">present_to_all</span>
              <span>Present</span>
            </button>
          </div>

          <div class="other-joining-options">
            <div class="join-option-item" id="opt-join-phone">
              <span class="icon">phone</span>
              <span>Join and use a phone for audio</span>
            </div>
          </div>

          <div class="meeting-info-box">
            <span class="meeting-code-text"><strong>Meeting link:</strong> ${meetingUrl}</span>
            <button class="btn-copy-code" id="btn-copy-link" data-tooltip="Copy joining info">
              <span class="icon">content_copy</span>
              <span>Copy</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  `;

  // Attach elements & listeners
  const videoEl = container.querySelector('#lobby-video');
  const avatarFallback = container.querySelector('#lobby-avatar-fallback');
  const micBtn = container.querySelector('#lobby-mic-btn');
  const camBtn = container.querySelector('#lobby-cam-btn');
  const micWave = container.querySelector('#lobby-mic-wave');
  const avatarCircle = container.querySelector('#lobby-avatar-circle');
  const vuBar1 = container.querySelector('#vu-bar-1');
  const vuBar2 = container.querySelector('#vu-bar-2');
  const vuBar3 = container.querySelector('#vu-bar-3');

  // Return home on logo click
  container.querySelector('#btn-lobby-logo').addEventListener('click', () => {
    actions.goHome();
  });

  // Clock
  function updateClock() {
    const clockEl = container.querySelector('#lobby-clock');
    if (clockEl) {
      const d = new Date();
      let h = d.getHours();
      const m = d.getMinutes().toString().padStart(2, '0');
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      clockEl.textContent = `${h}:${m} ${ampm}`;
    }
  }
  updateClock();
  setInterval(updateClock, 1000);

  // Video stream attach
  if (state.stream && state.isCameraOn) {
    videoEl.srcObject = state.stream;
    videoEl.style.display = 'block';
    avatarFallback.style.display = 'none';
  } else {
    videoEl.style.display = 'none';
    avatarFallback.style.display = 'flex';
  }

  // Audio level callback
  state.mediaManager.onVolumeChange = (vol) => {
    if (micWave) {
      if (vol > 15 && state.isMicOn) {
        micWave.classList.add('active');
        if (avatarCircle) avatarCircle.classList.add('speaking');
        const scale = Math.max(0.2, vol / 80);
        if (vuBar1) vuBar1.style.transform = `scaleY(${scale * 0.7})`;
        if (vuBar2) vuBar2.style.transform = `scaleY(${scale})`;
        if (vuBar3) vuBar3.style.transform = `scaleY(${scale * 0.8})`;
      } else {
        micWave.classList.remove('active');
        if (avatarCircle) avatarCircle.classList.remove('speaking');
        if (vuBar1) vuBar1.style.transform = 'scaleY(0.2)';
        if (vuBar2) vuBar2.style.transform = 'scaleY(0.2)';
        if (vuBar3) vuBar3.style.transform = 'scaleY(0.2)';
      }
    }
  };

  // Button clicks
  micBtn.addEventListener('click', () => {
    const isNowOn = state.mediaManager.toggleMic();
    actions.setMicState(isNowOn);
    micBtn.className = `preview-ctrl-btn ${!isNowOn ? 'off' : ''}`;
    micBtn.querySelector('.icon').textContent = isNowOn ? 'mic' : 'mic_off';
    micBtn.setAttribute('data-tooltip', isNowOn ? 'Turn off microphone' : 'Turn on microphone');
    actions.sfx.playToggle(isNowOn);
  });

  camBtn.addEventListener('click', () => {
    const isNowOn = state.mediaManager.toggleCamera();
    actions.setCameraState(isNowOn);
    camBtn.className = `preview-ctrl-btn ${!isNowOn ? 'off' : ''}`;
    camBtn.querySelector('.icon').textContent = isNowOn ? 'videocam' : 'videocam_off';
    camBtn.setAttribute('data-tooltip', isNowOn ? 'Turn off camera' : 'Turn on camera');
    if (isNowOn && state.stream) {
      videoEl.srcObject = state.stream;
      videoEl.style.display = 'block';
      avatarFallback.style.display = 'none';
    } else {
      videoEl.style.display = 'none';
      avatarFallback.style.display = 'flex';
    }
    actions.sfx.playToggle(isNowOn);
  });

  // Join now
  container.querySelector('#btn-join-now').addEventListener('click', () => {
    actions.joinMeeting();
  });

  // Present
  container.querySelector('#btn-present-lobby').addEventListener('click', async () => {
    await actions.joinAndPresent();
  });

  // Copy code
  container.querySelector('#btn-copy-link').addEventListener('click', () => {
    navigator.clipboard.writeText(`https://${meetingUrl}`);
    actions.showToast('Meeting link copied to clipboard');
  });

  // Modals
  container.querySelector('#btn-lobby-settings').addEventListener('click', () => {
    actions.openSettingsModal();
  });
  container.querySelector('#btn-check-devices').addEventListener('click', () => {
    actions.openSettingsModal();
  });
  container.querySelector('#btn-visual-effects').addEventListener('click', () => {
    actions.openEffectsModal();
  });
}
