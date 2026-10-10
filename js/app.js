// Google Meet Web Application Controller & State Store
import { media } from './media.js';
import { sfx } from './audio-sfx.js';
import { participantManager } from './participants.js';
import { chat } from './chat.js';
import { captions } from './captions.js';
import { reactions } from './reactions.js';
import { renderHome } from './ui-home.js';
import { renderLobby } from './ui-lobby.js';
import { renderMeeting } from './ui-meeting.js';
import { DrawersManager } from './ui-drawers.js';
import { ModalsManager } from './ui-modals.js';
import { WhiteboardModal } from './whiteboard.js';

class GoogleMeetApp {
  constructor() {
    this.root = document.getElementById('app-root');
    this.toastContainer = document.getElementById('toast-root');
    this.modalsContainer = document.getElementById('modals-root');

    // Parse route from URL pathname
    const path = window.location.pathname;
    const cleanCode = path.replace(/^\/+|\/+$/g, '');

    // If path is empty or 'home', show home page; else if meeting code like 'eps-kziz-mfv', show lobby or meeting
    this.meetingCode = cleanCode && cleanCode !== 'home' ? cleanCode : 'eps-kziz-mfv';
    this.initialView = (cleanCode && cleanCode !== 'home') ? 'lobby' : 'home';

    this.state = {
      view: this.initialView, // 'home', 'lobby', 'meeting', 'ended'
      meetingCode: this.meetingCode,
      isMicOn: true,
      isCameraOn: true,
      isCaptionsOn: false,
      isScreenSharing: false,
      isHandRaised: false,
      activeEffect: 'none',
      stream: null,
      screenStream: null,
      devices: null,
      mediaManager: media
    };

    this.drawersManager = null;
    this.modalsManager = null;
    this.whiteboardModal = null;
    this.meetingUIHandles = null;

    this.init();
  }

  async init() {
    // Setup Modals
    this.modalsManager = new ModalsManager(this.modalsContainer, {
      sfx,
      showToast: (msg) => this.showToast(msg),
      onApplyEffect: (effectName) => this.applyVisualEffect(effectName)
    });

    // Setup Whiteboard
    this.whiteboardModal = new WhiteboardModal(this.modalsContainer, {
      showToast: (msg) => this.showToast(msg)
    });

    // Enumerate devices
    media.getDevices().then(devices => {
      this.state.devices = devices;
    });

    // Initialize media if not on home
    if (this.state.view !== 'home') {
      const res = await media.initMedia(this.state.isCameraOn, this.state.isMicOn);
      if (res.success) {
        this.state.stream = res.stream;
      }
    }

    // Attach shortcuts
    this.setupKeyboardShortcuts();

    // Render initial view
    this.renderCurrentView();
  }

  setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      const isModifier = e.metaKey || e.ctrlKey;
      
      // Cmd/Ctrl + D -> Toggle Mic
      if (isModifier && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        this.toggleMic();
      }

      // Cmd/Ctrl + E -> Toggle Camera
      if (isModifier && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        this.toggleCamera();
      }

      // 'c' -> Toggle Captions
      if (e.key.toLowerCase() === 'c' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        if (this.state.view === 'meeting') {
          e.preventDefault();
          this.toggleCaptions();
        }
      }
    });
  }

  toggleMic() {
    const isNowOn = media.toggleMic();
    this.setMicState(isNowOn);
    sfx.playToggle(isNowOn);
    this.showToast(isNowOn ? 'Microphone on' : 'Microphone off');
    if (this.state.view === 'lobby') {
      this.renderCurrentView();
    } else if (this.meetingUIHandles) {
      const micBtn = document.querySelector('#btn-call-mic');
      if (micBtn) {
        micBtn.className = `ctrl-btn ${!isNowOn ? 'danger-muted' : ''}`;
        micBtn.querySelector('.icon').textContent = isNowOn ? 'mic' : 'mic_off';
      }
      participantManager.updateSelf({ isMuted: !isNowOn });
    }
  }

  toggleCamera() {
    const isNowOn = media.toggleCamera();
    this.setCameraState(isNowOn);
    sfx.playToggle(isNowOn);
    this.showToast(isNowOn ? 'Camera on' : 'Camera off');
    if (this.state.view === 'lobby') {
      this.renderCurrentView();
    } else if (this.meetingUIHandles) {
      const camBtn = document.querySelector('#btn-call-cam');
      if (camBtn) {
        camBtn.className = `ctrl-btn ${!isNowOn ? 'danger-muted' : ''}`;
        camBtn.querySelector('.icon').textContent = isNowOn ? 'videocam' : 'videocam_off';
      }
      participantManager.updateSelf({ isVideoOn: isNowOn });
    }
  }

  setMicState(isOn) {
    this.state.isMicOn = isOn;
    participantManager.updateSelf({ isMuted: !isOn });
  }

  setCameraState(isOn) {
    this.state.isCameraOn = isOn;
    participantManager.updateSelf({ isVideoOn: isOn });
  }

  applyVisualEffect(effectName) {
    this.state.activeEffect = effectName;
    media.setEffect(effectName);
    this.showToast(effectName === 'none' ? 'Visual effects removed' : `Effect applied: ${effectName}`);
    if (this.state.view === 'lobby') {
      const preview = document.querySelector('#preview-video-container');
      if (preview) {
        preview.className = `video-preview-wrapper ${effectName ? 'effect-' + effectName : ''}`;
      }
    } else if (this.meetingUIHandles) {
      this.meetingUIHandles.updateGridTiles(
        participantManager.getParticipants(),
        this.state.activeEffect,
        this.state.isScreenSharing,
        this.state.screenStream
      );
    }
  }

  async startInstantMeeting(code = 'eps-kziz-mfv') {
    this.state.meetingCode = code;
    window.history.pushState({}, '', `/${code}`);
    if (!this.state.stream) {
      const res = await media.initMedia(this.state.isCameraOn, this.state.isMicOn);
      if (res.success) this.state.stream = res.stream;
    }
    await this.joinMeeting();
  }

  async goToLobby(code = 'eps-kziz-mfv') {
    this.state.meetingCode = code;
    window.history.pushState({}, '', `/${code}`);
    if (!this.state.stream) {
      const res = await media.initMedia(this.state.isCameraOn, this.state.isMicOn);
      if (res.success) this.state.stream = res.stream;
    }
    this.state.view = 'lobby';
    this.renderCurrentView();
  }

  goHome() {
    window.history.pushState({}, '', '/');
    this.state.view = 'home';
    this.renderCurrentView();
  }

  async joinMeeting() {
    sfx.playJoin();
    this.state.view = 'meeting';
    this.renderCurrentView();
    this.showToast(`Joined meeting ${this.state.meetingCode}`);
    participantManager.startSimulation();
  }

  async joinAndPresent() {
    await this.joinMeeting();
    await this.startScreenShare();
  }

  async startScreenShare() {
    const res = await media.startScreenShare();
    if (res.success) {
      this.state.isScreenSharing = true;
      this.state.screenStream = res.stream;
      if (this.meetingUIHandles) {
        this.meetingUIHandles.updateGridTiles(
          participantManager.getParticipants(),
          this.state.activeEffect,
          true,
          this.state.screenStream
        );
      }
      return true;
    }
    return false;
  }

  stopScreenShare() {
    media.stopScreenShare();
    this.state.isScreenSharing = false;
    this.state.screenStream = null;
    if (this.meetingUIHandles) {
      this.meetingUIHandles.updateGridTiles(
        participantManager.getParticipants(),
        this.state.activeEffect,
        false,
        null
      );
    }
  }

  toggleCaptions() {
    const isOn = captions.toggle(() => participantManager.getParticipants());
    this.state.isCaptionsOn = isOn;
    return isOn;
  }

  toggleHandRaise() {
    this.state.isHandRaised = !this.state.isHandRaised;
    participantManager.updateSelf({ isHandRaised: this.state.isHandRaised });
    return this.state.isHandRaised;
  }

  sendReaction(emoji) {
    reactions.spawnReaction(emoji, null, null, 'Ayushmaan Soni');
  }

  openWhiteboard() {
    if (this.whiteboardModal) {
      this.whiteboardModal.open();
    }
  }

  toggleLayout() {
    // Toggle between standard grid and spotlighting first peer
    const participants = participantManager.getParticipants();
    const isCurrentlyPinned = participants.some(p => p.isPinned);
    if (!isCurrentlyPinned) {
      const peer = participants.find(p => !p.isSelf);
      if (peer) participantManager.togglePin(peer.id);
    } else {
      participants.forEach(p => { p.isPinned = false; });
      participantManager.notify();
    }
    this.showToast(!isCurrentlyPinned ? 'Spotlight layout active' : 'Tiled layout active');
  }

  leaveMeeting() {
    sfx.playLeave();
    participantManager.stopSimulation();
    reactions.stopPeerReactions();
    captions.stop();
    this.stopScreenShare();
    this.state.view = 'ended';
    this.renderCurrentView();
  }

  rejoinMeeting() {
    this.joinMeeting();
  }

  toggleDrawer(name) {
    if (this.drawersManager) {
      this.drawersManager.toggle(name);
      if (this.meetingUIHandles) {
        this.meetingUIHandles.setDrawerActiveBtn(this.drawersManager.currentDrawer);
      }
    }
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-item';
    toast.innerHTML = `
      <span class="icon" style="font-size: 18px; color: #8ab4f8;">info</span>
      <span>${message}</span>
    `;
    this.toastContainer.appendChild(toast);
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 3200);
  }

  renderCurrentView() {
    this.root.innerHTML = '';

    if (this.state.view === 'home') {
      renderHome(this.root, {
        startInstantMeeting: (code) => this.startInstantMeeting(code),
        joinMeetingWithCode: (code) => this.startInstantMeeting(code),
        goToLobby: (code) => this.goToLobby(code),
        openSettings: () => this.modalsManager.openSettings(this.state.devices),
        showToast: (m) => this.showToast(m)
      });
    } else if (this.state.view === 'lobby') {
      renderLobby(this.root, this.state, {
        setMicState: (on) => this.setMicState(on),
        setCameraState: (on) => this.setCameraState(on),
        joinMeeting: () => this.joinMeeting(),
        joinAndPresent: () => this.joinAndPresent(),
        openSettingsModal: () => this.modalsManager.openSettings(this.state.devices),
        openEffectsModal: () => this.modalsManager.openEffects(),
        goHome: () => this.goHome(),
        showToast: (m) => this.showToast(m),
        sfx
      });
    } else if (this.state.view === 'meeting') {
      this.meetingUIHandles = renderMeeting(this.root, this.state, {
        setMicState: (on) => this.setMicState(on),
        setCameraState: (on) => this.setCameraState(on),
        toggleCaptions: () => this.toggleCaptions(),
        sendReaction: (emoji) => this.sendReaction(emoji),
        startScreenShare: () => this.startScreenShare(),
        stopScreenShare: () => this.stopScreenShare(),
        toggleHandRaise: () => this.toggleHandRaise(),
        openEffectsModal: () => this.modalsManager.openEffects(),
        openSettingsModal: () => this.modalsManager.openSettings(this.state.devices),
        openWhiteboard: () => this.openWhiteboard(),
        toggleLayout: () => this.toggleLayout(),
        leaveMeeting: () => this.leaveMeeting(),
        toggleDrawer: (name) => this.toggleDrawer(name),
        onTogglePin: (id) => participantManager.togglePin(id),
        onToggleParticipantMute: (id) => participantManager.togglePeerMute(id),
        showToast: (m) => this.showToast(m),
        sfx
      });

      // Setup Drawers
      const drawersMount = this.root.querySelector('#drawers-mount');
      this.drawersManager = new DrawersManager(drawersMount, {
        onSendMessage: (txt) => {
          chat.sendMessage(txt, 'Ayushmaan Soni', true, true);
        },
        onChatOpened: () => {
          chat.clearUnread();
          if (this.meetingUIHandles) this.meetingUIHandles.setUnreadBadge(false);
        },
        onDrawerClosed: () => {
          if (this.meetingUIHandles) this.meetingUIHandles.setDrawerActiveBtn(null);
        },
        onAddParticipant: (name) => {
          participantManager.addPeer(name);
          this.showToast(`${name} joined the meeting`);
          sfx.playJoin();
        },
        onTogglePin: (id) => participantManager.togglePin(id),
        onToggleParticipantMute: (id) => participantManager.togglePeerMute(id),
        showToast: (m) => this.showToast(m)
      });

      // Init Reactions Overlay
      const reactionsMount = this.root.querySelector('#reactions-container');
      reactions.init(reactionsMount);
      reactions.startPeerReactions(() => participantManager.getParticipants());

      // Subscribe to participants
      participantManager.subscribe((participants) => {
        if (this.meetingUIHandles) {
          this.meetingUIHandles.updateGridTiles(
            participants,
            this.state.activeEffect,
            this.state.isScreenSharing,
            this.state.screenStream
          );
        }
        if (this.drawersManager) {
          this.drawersManager.updateParticipants(participants);
        }
        const badge = this.root.querySelector('#people-count-badge');
        if (badge) badge.textContent = participants.length;
      });

      // Initial populate
      this.meetingUIHandles.updateGridTiles(
        participantManager.getParticipants(),
        this.state.activeEffect,
        this.state.isScreenSharing,
        this.state.screenStream
      );
      this.drawersManager.updateParticipants(participantManager.getParticipants());

      // Chat subscribe
      chat.subscribe((messages, unreadCount) => {
        if (this.drawersManager) {
          this.drawersManager.updateChatMessages(messages);
        }
        if (this.meetingUIHandles) {
          this.meetingUIHandles.setUnreadBadge(unreadCount > 0 && !this.drawersManager.isOpen('chat'));
        }
      });
      this.drawersManager.updateChatMessages(chat.getMessages());

      // Captions subscribe
      captions.subscribe((captionList) => {
        if (this.meetingUIHandles) {
          this.meetingUIHandles.updateCaptionsDisplay(captionList);
        }
      });

      // Audio volume analysis for self
      media.onVolumeChange = (vol) => {
        if (this.state.isMicOn && vol > 15) {
          participantManager.updateSelf({ isSpeaking: true, volume: vol });
        } else {
          participantManager.updateSelf({ isSpeaking: false, volume: 0 });
        }
      };

    } else if (this.state.view === 'ended') {
      this.renderCallEndedView();
    }
  }

  renderCallEndedView() {
    this.root.innerHTML = `
      <div class="call-ended-screen">
        <h1 class="ended-title">You left the meeting</h1>
        <div class="ended-actions">
          <button class="btn-rejoin" id="btn-rejoin">Rejoin</button>
          <button class="btn-return-home" id="btn-return-lobby">Return to home screen</button>
        </div>
        <div class="rating-prompt">How was the audio and video quality?</div>
        <div class="rating-stars" id="rating-stars">
          <span class="icon" data-star="1">star</span>
          <span class="icon" data-star="2">star</span>
          <span class="icon" data-star="3">star</span>
          <span class="icon" data-star="4">star</span>
          <span class="icon" data-star="5">star</span>
        </div>
      </div>
    `;

    this.root.querySelector('#btn-rejoin').addEventListener('click', () => {
      this.rejoinMeeting();
    });

    this.root.querySelector('#btn-return-lobby').addEventListener('click', () => {
      this.goHome();
    });

    const stars = this.root.querySelectorAll('#rating-stars .icon');
    stars.forEach(star => {
      star.addEventListener('click', () => {
        const val = parseInt(star.getAttribute('data-star'));
        stars.forEach((s, idx) => {
          if (idx < val) s.classList.add('active');
          else s.classList.remove('active');
        });
        this.showToast('Thank you for your feedback!');
      });
    });
  }
}

// Start application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new GoogleMeetApp();
});
