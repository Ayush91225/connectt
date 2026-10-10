// Google Meet In-Meeting View Component (Exact Match for Screenshots 2, 3, 4, 5)

export function renderMeeting(container, state, actions) {
  const meetingCode = state.meetingCode || 'sen-mvwh-cyc';

  container.innerHTML = `
    <div class="call-page-container">
      <!-- Top Minimal Info Header (00:33 | sen-mvwh-cyc ⓘ  and  [laptop 1]) -->
      <header class="gm-call-top-bar">
        <div class="gm-call-top-left">
          <span class="gm-call-time" id="call-clock-display">00:34</span>
          <span style="color: #727775;">|</span>
          <span class="gm-call-code" id="btn-copy-meeting-code" data-tooltip="Copy meeting info">${meetingCode}</span>
          <span class="icon gm-call-info-icon" id="btn-meeting-info-top" data-tooltip="Meeting details">info</span>
        </div>

        <div class="gm-call-top-right">
          <!-- White Pill Device / Participant Indicator (Screenshot 2-5) -->
          <div class="gm-device-count-pill" data-tooltip="Participants">
            <span class="icon" style="font-size: 16px;">laptop</span>
            <span id="call-participant-count-badge">1</span>
          </div>
        </div>
      </header>

      <!-- Main Stage Area -->
      <div class="gm-call-main-stage">
        <!-- Main Video Container -->
        <div class="gm-video-stage-wrapper">
          <div class="gm-main-video-tile ${state.activeEffect ? 'effect-' + state.activeEffect : ''}" id="main-video-tile">
            <!-- Real Live Webcam Feed -->
            <video id="live-call-video" autoplay playsinline muted style="display: ${state.isCameraOn && state.stream ? 'block' : 'none'};"></video>

            <!-- Camera Off Center Avatar (Screenshot 2: White circle with text NINEONE 152) -->
            <div class="gm-tile-avatar-center" id="cam-off-avatar" style="display: ${state.isCameraOn && state.stream ? 'none' : 'flex'};">
              <span class="gm-avatar-badge-text">NINEONE<br/>152</span>
            </div>

            <!-- Top Right Mic Status Badge (Screenshot 2: blue circle with mic_off) -->
            <div class="gm-tile-mic-badge ${state.isCameraOn ? 'translucent' : 'muted'}" id="tile-mic-status-badge">
              <span class="icon">${state.isMicOn ? 'mic' : 'mic_off'}</span>
            </div>

            <!-- Bottom Left Name Label (Screenshot 2 & 3: NineOne152) -->
            <div class="gm-tile-name-label">NineOne152</div>
          </div>
        </div>

        <!-- Meeting Tools / Chat / Host Controls Side Drawer (Screenshot 5) -->
        <aside class="gm-side-drawer-container" id="call-side-drawer" style="display: none;">
          <!-- Meeting Tools Header -->
          <div class="gm-drawer-header">
            <h3 class="gm-drawer-title" id="drawer-title-heading">Meeting tools</h3>
            <button class="gm-icon-circle-btn" id="btn-close-call-drawer" style="width: 32px; height: 32px;">
              <span class="icon" style="font-size: 18px; color: #c4c7c5;">close</span>
            </button>
          </div>

          <!-- Dynamic Drawer Content Mount -->
          <div id="drawer-dynamic-content" style="display: flex; flex-direction: column; flex: 1; overflow: hidden;">
            <!-- Rendered by switchDrawerContent() -->
          </div>
        </aside>
      </div>

      <!-- Quick Video Controls Popover Pill (Screenshot 4: Camera select, Blur, Effects, Settings) -->
      <div class="gm-quick-video-pill-bar" id="quick-video-popover">
        <div class="gm-quick-cam-selector" id="btn-quick-cam-device">
          <span class="icon" style="font-size: 18px;">videocam</span>
          <span>FaceTime HD Camera (Built-in)</span>
          <span class="icon" style="font-size: 16px;">expand_more</span>
        </div>
        <button class="gm-quick-blur-btn" id="btn-quick-blur">
          <span class="icon" style="font-size: 18px;">blur_on</span>
          <span>Blur background</span>
        </button>
        <button class="gm-quick-effects-btn" id="btn-quick-effects">
          <span>Backgrounds and effects</span>
        </button>
        <button class="gm-icon-circle-btn" id="btn-quick-settings" style="width: 32px; height: 32px;" data-tooltip="Settings">
          <span class="icon" style="font-size: 18px; color: #c4c7c5;">settings</span>
        </button>
      </div>

      <!-- Floating Reactions Picker -->
      <div class="gm-reactions-popup" id="call-reactions-popup">
        <button class="gm-emoji-item-btn" data-emoji="💖">💖</button>
        <button class="gm-emoji-item-btn" data-emoji="👍">👍</button>
        <button class="gm-emoji-item-btn" data-emoji="🎉">🎉</button>
        <button class="gm-emoji-item-btn" data-emoji="👏">👏</button>
        <button class="gm-emoji-item-btn" data-emoji="😂">😂</button>
        <button class="gm-emoji-item-btn" data-emoji="😮">😮</button>
        <button class="gm-emoji-item-btn" data-emoji="😢">😢</button>
        <button class="gm-emoji-item-btn" data-emoji="🤔">🤔</button>
        <button class="gm-emoji-item-btn" data-emoji="👎">👎</button>
      </div>

      <!-- Floating Reaction Particle Area -->
      <div id="reactions-particle-container" style="position: absolute; inset: 0; pointer-events: none; z-index: 150;"></div>

      <!-- Bottom Bar Row: Floating Center Dock + Right Dock (Screenshots 2-5) -->
      <footer class="gm-call-bottom-bar-row">
        <!-- Center Floating Rounded Pill Dock -->
        <div class="gm-center-dock">
          <!-- Split Mic Button (with ^ and yellow ! warning dot) -->
          <div class="gm-dock-split-group" id="group-mic-btn">
            <button class="gm-dock-chevron-btn" id="btn-mic-chevron"><span class="icon">keyboard_arrow_up</span></button>
            <button class="gm-dock-btn" id="btn-dock-mic" style="background: transparent;" data-tooltip="Turn on microphone">
              <span class="icon">${state.isMicOn ? 'mic' : 'mic_off'}</span>
              <span class="gm-alert-badge-dot">!</span>
            </button>
          </div>

          <!-- Split Camera Button (with ^ and yellow ! warning dot) -->
          <div class="gm-dock-split-group" id="group-cam-btn">
            <button class="gm-dock-chevron-btn" id="btn-cam-chevron"><span class="icon">keyboard_arrow_up</span></button>
            <button class="gm-dock-btn" id="btn-dock-cam" style="background: transparent;" data-tooltip="Turn on camera">
              <span class="icon">${state.isCameraOn ? 'videocam' : 'videocam_off'}</span>
              <span class="gm-alert-badge-dot">!</span>
            </button>
          </div>

          <!-- Screen Share Button -->
          <button class="gm-dock-btn ${state.isScreenSharing ? 'active-blue' : ''}" id="btn-dock-share" data-tooltip="Present now">
            <span class="icon">present_to_all</span>
          </button>

          <!-- Emoji Reactions Button -->
          <button class="gm-dock-btn" id="btn-dock-reactions" data-tooltip="Send a reaction">
            <span class="icon">sentiment_satisfied</span>
          </button>

          <!-- Closed Captions Button -->
          <button class="gm-dock-btn ${state.isCaptionsOn ? 'active-blue' : ''}" id="btn-dock-captions" data-tooltip="Turn on captions">
            <span class="icon">closed_caption</span>
          </button>

          <!-- Raise Hand Button -->
          <button class="gm-dock-btn ${state.isHandRaised ? 'active-blue' : ''}" id="btn-dock-hand" data-tooltip="Raise hand">
            <span class="icon">back_hand</span>
          </button>

          <!-- 3-Dots More Options Button -->
          <button class="gm-dock-btn" id="btn-dock-more" data-tooltip="More options">
            <span class="icon">more_vert</span>
          </button>

          <!-- Red End Call Pill -->
          <button class="gm-btn-end-call-pill" id="btn-dock-end-call" data-tooltip="Leave call">
            <span class="icon">call_end</span>
          </button>
        </div>

        <!-- Floating Bottom Right Pill (Chat, Activities, Host Controls - Screenshot 2-5) -->
        <div class="gm-right-floating-dock">
          <!-- Chat Button -->
          <button class="gm-right-dock-btn" id="btn-right-chat" data-tooltip="Chat with everyone">
            <span class="icon">chat</span>
          </button>

          <!-- Activities / Meeting Tools Button (9 dots) -->
          <button class="gm-right-dock-btn" id="btn-right-tools" data-tooltip="Activities">
            <span class="icon">apps</span>
          </button>

          <!-- Host Controls Button (Shield with lock) -->
          <button class="gm-right-dock-btn" id="btn-right-host" data-tooltip="Host controls">
            <span class="icon">security</span>
          </button>
        </div>
      </footer>
    </div>
  `;

  // Attach elements
  const videoEl = container.querySelector('#live-call-video');
  const avatarEl = container.querySelector('#cam-off-avatar');
  const micBadge = container.querySelector('#tile-mic-status-badge');
  const micBtn = container.querySelector('#btn-dock-mic');
  const camBtn = container.querySelector('#btn-dock-cam');
  const shareBtn = container.querySelector('#btn-dock-share');
  const reactionsBtn = container.querySelector('#btn-dock-reactions');
  const reactionsPopup = container.querySelector('#call-reactions-popup');
  const captionsBtn = container.querySelector('#btn-dock-captions');
  const handBtn = container.querySelector('#btn-dock-hand');
  const moreBtn = container.querySelector('#btn-dock-more');
  const endCallBtn = container.querySelector('#btn-dock-end-call');
  const quickPopover = container.querySelector('#quick-video-popover');
  const sideDrawer = container.querySelector('#call-side-drawer');
  const drawerHeading = container.querySelector('#drawer-title-heading');
  const drawerContent = container.querySelector('#drawer-dynamic-content');
  const btnCloseDrawer = container.querySelector('#btn-close-call-drawer');
  const btnRightChat = container.querySelector('#btn-right-chat');
  const btnRightTools = container.querySelector('#btn-right-tools');
  const btnRightHost = container.querySelector('#btn-right-host');

  let activeDrawer = null; // 'tools', 'chat', 'host', or null

  // Clock
  function updateClock() {
    const clockEl = container.querySelector('#call-clock-display');
    if (clockEl) {
      const now = new Date();
      const h = now.getHours().toString().padStart(2, '0');
      const m = now.getMinutes().toString().padStart(2, '0');
      clockEl.textContent = `${h}:${m}`;
    }
  }
  updateClock();
  setInterval(updateClock, 1000);

  // Video stream attach
  if (state.stream && state.isCameraOn) {
    videoEl.srcObject = state.stream;
    videoEl.style.display = 'block';
    avatarEl.style.display = 'none';
    micBadge.className = 'gm-tile-mic-badge translucent';
  } else {
    videoEl.style.display = 'none';
    avatarEl.style.display = 'flex';
    micBadge.className = 'gm-tile-mic-badge muted';
  }

  // Copy meeting link
  container.querySelector('#btn-copy-meeting-code').addEventListener('click', () => {
    navigator.clipboard.writeText(`https://meet.google.com/${meetingCode}`);
    actions.showToast('Meeting link copied to clipboard');
  });

  // Mic toggle
  micBtn.addEventListener('click', () => {
    const isNowOn = state.mediaManager.toggleMic();
    actions.setMicState(isNowOn);
    micBtn.querySelector('.icon').textContent = isNowOn ? 'mic' : 'mic_off';
    micBadge.querySelector('.icon').textContent = isNowOn ? 'mic' : 'mic_off';
    actions.sfx.playToggle(isNowOn);
    actions.showToast(isNowOn ? 'Microphone on' : 'Microphone off');
  });

  // Camera toggle
  camBtn.addEventListener('click', () => {
    const isNowOn = state.mediaManager.toggleCamera();
    actions.setCameraState(isNowOn);
    camBtn.querySelector('.icon').textContent = isNowOn ? 'videocam' : 'videocam_off';
    if (isNowOn && state.stream) {
      videoEl.srcObject = state.stream;
      videoEl.style.display = 'block';
      avatarEl.style.display = 'none';
      micBadge.className = 'gm-tile-mic-badge translucent';
    } else {
      videoEl.style.display = 'none';
      avatarEl.style.display = 'flex';
      micBadge.className = 'gm-tile-mic-badge muted';
    }
    actions.sfx.playToggle(isNowOn);
    actions.showToast(isNowOn ? 'Camera on' : 'Camera off');
  });

  // Chevrons toggle quick video popover (Screenshot 4)
  container.querySelector('#btn-cam-chevron').addEventListener('click', (e) => {
    e.stopPropagation();
    quickPopover.classList.toggle('show');
    reactionsPopup.classList.remove('show');
  });

  container.querySelector('#btn-quick-blur').addEventListener('click', () => {
    actions.onApplyEffect('blur-heavy');
    quickPopover.classList.remove('show');
  });

  container.querySelector('#btn-quick-effects').addEventListener('click', () => {
    actions.openEffectsModal();
    quickPopover.classList.remove('show');
  });

  container.querySelector('#btn-quick-settings').addEventListener('click', () => {
    actions.openSettingsModal();
    quickPopover.classList.remove('show');
  });

  // Screen share
  shareBtn.addEventListener('click', async () => {
    if (!state.isScreenSharing) {
      const success = await actions.startScreenShare();
      if (success) {
        shareBtn.classList.add('active-blue');
        actions.showToast('You are presenting to everyone');
      }
    } else {
      actions.stopScreenShare();
      shareBtn.classList.remove('active-blue');
      actions.showToast('You stopped presenting');
    }
  });

  // Reactions
  reactionsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    reactionsPopup.classList.toggle('show');
    quickPopover.classList.remove('show');
  });

  document.addEventListener('click', (e) => {
    if (!reactionsPopup.contains(e.target) && e.target !== reactionsBtn) {
      reactionsPopup.classList.remove('show');
    }
    if (!quickPopover.contains(e.target) && !e.target.closest('#group-cam-btn')) {
      quickPopover.classList.remove('show');
    }
  });

  reactionsPopup.querySelectorAll('[data-emoji]').forEach(btn => {
    btn.addEventListener('click', () => {
      const emoji = btn.getAttribute('data-emoji');
      actions.sendReaction(emoji);
      reactionsPopup.classList.remove('show');
    });
  });

  // Captions
  captionsBtn.addEventListener('click', () => {
    const isOn = actions.toggleCaptions();
    captionsBtn.className = `gm-dock-btn ${isOn ? 'active-blue' : ''}`;
    actions.showToast(isOn ? 'Captions turned on' : 'Captions turned off');
  });

  // Hand raise
  handBtn.addEventListener('click', () => {
    const raised = actions.toggleHandRaise();
    handBtn.className = `gm-dock-btn ${raised ? 'active-blue' : ''}`;
    actions.sfx.playHandRaise();
    actions.showToast(raised ? 'You raised your hand' : 'You lowered your hand');
  });

  // More options
  moreBtn.addEventListener('click', () => {
    actions.openEffectsModal();
  });

  // Leave call
  endCallBtn.addEventListener('click', () => {
    actions.leaveMeeting();
  });

  // Drawer Drawer switching
  function openDrawer(type) {
    if (activeDrawer === type) {
      closeDrawer();
      return;
    }
    activeDrawer = type;
    sideDrawer.style.display = 'flex';

    btnRightTools.classList.toggle('active', type === 'tools');
    btnRightChat.classList.toggle('active', type === 'chat');
    btnRightHost.classList.toggle('active', type === 'host');

    if (type === 'tools') {
      drawerHeading.textContent = 'Meeting tools';
      drawerContent.innerHTML = `
        <div class="gm-drawer-tabs-row">
          <div class="gm-drawer-tab-btn active">Tools</div>
          <div class="gm-drawer-tab-btn">Add-ons</div>
        </div>
        <div class="gm-drawer-content-scroll">
          <div class="gm-tool-list-item" id="tool-speech-trans">
            <div class="gm-tool-item-left">
              <span class="icon gm-tool-item-icon">auto_awesome</span>
              <div>
                <div class="gm-tool-item-title">Speech translation</div>
                <div class="gm-tool-item-desc">Limited access</div>
              </div>
            </div>
            <span class="icon" style="color:#8e918f;">chevron_right</span>
          </div>

          <div class="gm-tool-list-item" id="tool-timer">
            <div class="gm-tool-item-left">
              <span class="icon gm-tool-item-icon">timer</span>
              <div>
                <div class="gm-tool-item-title">Timer</div>
                <div class="gm-tool-item-desc">Show a countdown timer</div>
              </div>
            </div>
            <span class="icon" style="color:#8e918f;">chevron_right</span>
          </div>

          <div class="gm-unavailable-section">
            <div class="gm-unavailable-heading">Unavailable or premium</div>
            <div class="gm-unavailable-sub">
              <a href="#">Learn more about our premium meeting tools</a>, their settings, and how to gain access in future calls
            </div>

            <div class="gm-premium-item">
              <span class="icon">radio_button_checked</span>
              <div>
                <div style="font-size:14px; color:#fff;">Record</div>
                <div style="font-size:12px; color:#8e918f;">Capture the meeting</div>
              </div>
            </div>

            <div class="gm-premium-item">
              <span class="icon">description</span>
              <div>
                <div style="font-size:14px; color:#fff;">Transcribe</div>
                <div style="font-size:12px; color:#8e918f;">Capture the conversation</div>
              </div>
            </div>

            <div class="gm-premium-item">
              <span class="icon">podcasts</span>
              <div>
                <div style="font-size:14px; color:#fff;">Live streaming</div>
                <div style="font-size:12px; color:#8e918f;">Stream to view-only users</div>
              </div>
            </div>

            <div class="gm-premium-item">
              <span class="icon">dashboard</span>
              <div>
                <div style="font-size:14px; color:#fff;">Breakout rooms</div>
                <div style="font-size:12px; color:#8e918f;">Break into smaller groups</div>
              </div>
            </div>
          </div>
        </div>
      `;
    } else if (type === 'chat') {
      drawerHeading.textContent = 'In-call messages';
      drawerContent.innerHTML = `
        <div style="padding: 12px 20px; font-size: 12px; color: #8e918f; background: rgba(255,255,255,0.03); margin: 12px 16px; border-radius: 8px;">
          Messages can only be seen by people in the call and are deleted when the call ends.
        </div>
        <div id="chat-stream-box" style="flex: 1; overflow-y: auto; padding: 0 20px; display: flex; flex-direction: column; gap: 14px;">
          <div style="display:flex; flex-direction:column; gap:4px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:13px; font-weight:500; color:#fff;">Sarah Chen</span>
              <span style="font-size:11px; color:#8e918f;">00:30</span>
            </div>
            <div style="font-size:13px; color:#e3e3e3;">Welcome to meeting ${meetingCode}! Ready for the review.</div>
          </div>
        </div>
        <div style="padding: 16px 20px; border-top: 1px solid rgba(255,255,255,0.08); display:flex; gap:10px;">
          <input type="text" id="chat-msg-input" placeholder="Send a message to everyone" style="flex:1; background:#131314; border:1px solid rgba(255,255,255,0.1); border-radius:24px; padding:10px 16px; color:#fff; font-size:13px; outline:none;" />
          <button id="btn-send-msg" style="width:36px; height:36px; border-radius:50%; background:#a8c7fa; color:#041e49; display:flex; align-items:center; justify-content:center;">
            <span class="icon">send</span>
          </button>
        </div>
      `;

      const input = drawerContent.querySelector('#chat-msg-input');
      const send = drawerContent.querySelector('#btn-send-msg');
      const box = drawerContent.querySelector('#chat-stream-box');

      const sendMsg = () => {
        if (!input.value.trim()) return;
        const msg = input.value.trim();
        input.value = '';
        const item = document.createElement('div');
        item.style.display = 'flex';
        item.style.flexDirection = 'column';
        item.style.gap = '4px';
        item.innerHTML = `
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:13px; font-weight:500; color:#a8c7fa;">NineOne152 (You)</span>
            <span style="font-size:11px; color:#8e918f;">Now</span>
          </div>
          <div style="font-size:13px; color:#ffffff;">${msg}</div>
        `;
        box.appendChild(item);
        box.scrollTop = box.scrollHeight;
      };

      send.addEventListener('click', sendMsg);
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMsg(); });
    } else if (type === 'host') {
      drawerHeading.textContent = 'Host controls';
      drawerContent.innerHTML = `
        <div style="padding: 20px; display:flex; flex-direction:column; gap:16px;">
          <div style="font-size:13px; color:#8e918f;">Use these host settings to keep control of your meeting.</div>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:14px; color:#fff; font-weight:500;">Host management</div>
              <div style="font-size:12px; color:#8e918f;">Control what participants can do</div>
            </div>
            <input type="checkbox" checked style="accent-color:#a8c7fa;" />
          </div>
          <hr style="border:none; border-top:1px solid rgba(255,255,255,0.08);" />
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:13px; color:#fff;">Share their screen</span>
            <input type="checkbox" checked style="accent-color:#a8c7fa;" />
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:13px; color:#fff;">Send chat messages</span>
            <input type="checkbox" checked style="accent-color:#a8c7fa;" />
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:13px; color:#fff;">Turn on their microphone</span>
            <input type="checkbox" checked style="accent-color:#a8c7fa;" />
          </div>
        </div>
      `;
    }
  }

  function closeDrawer() {
    activeDrawer = null;
    sideDrawer.style.display = 'none';
    btnRightTools.classList.remove('active');
    btnRightChat.classList.remove('active');
    btnRightHost.classList.remove('active');
  }

  btnCloseDrawer.addEventListener('click', closeDrawer);
  btnRightTools.addEventListener('click', () => openDrawer('tools'));
  btnRightChat.addEventListener('click', () => openDrawer('chat'));
  btnRightHost.addEventListener('click', () => openDrawer('host'));
  container.querySelector('#btn-meeting-info-top').addEventListener('click', () => openDrawer('tools'));
}
