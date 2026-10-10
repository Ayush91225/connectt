// Side Drawers: Chat, People, Details, Activities, Host Controls

export class DrawersManager {
  constructor(container, actions) {
    this.container = container;
    this.actions = actions;
    this.currentDrawer = null; // 'chat', 'people', 'details', 'activities', 'host' or null
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <!-- Chat Drawer -->
      <aside class="side-drawer" id="drawer-chat">
        <div class="drawer-header">
          <h2 class="drawer-title">In-call messages</h2>
          <button class="drawer-close-btn" data-close="chat">
            <span class="icon">close</span>
          </button>
        </div>
        <div class="drawer-body">
          <div class="chat-banner">
            Messages can only be seen by people in the call and are deleted when the call ends.
          </div>
          <div class="chat-messages-container" id="chat-messages-list">
            <!-- Messages dynamic -->
          </div>
          <div class="chat-input-row">
            <input type="text" class="chat-text-input" id="chat-input-field" placeholder="Send a message to everyone" />
            <button class="chat-send-btn" id="btn-send-chat" data-tooltip="Send message">
              <span class="icon">send</span>
            </button>
          </div>
        </div>
      </aside>

      <!-- People Drawer -->
      <aside class="side-drawer" id="drawer-people">
        <div class="drawer-header">
          <h2 class="drawer-title">People</h2>
          <button class="drawer-close-btn" data-close="people">
            <span class="icon">close</span>
          </button>
        </div>
        <div class="drawer-body">
          <div class="people-actions-row">
            <button class="btn-add-people" id="btn-add-people-action">
              <span class="icon">person_add</span>
              <span>Add people</span>
            </button>
          </div>
          <div style="padding: 4px 16px; font-size: 12px; color: var(--text-tertiary); font-weight: 500;">
            IN CALL (<span id="people-count-header">4</span>)
          </div>
          <div class="participant-list-container" id="people-list">
            <!-- Participant items dynamic -->
          </div>
        </div>
      </aside>

      <!-- Details Drawer -->
      <aside class="side-drawer" id="drawer-details">
        <div class="drawer-header">
          <h2 class="drawer-title">Meeting details</h2>
          <button class="drawer-close-btn" data-close="details">
            <span class="icon">close</span>
          </button>
        </div>
        <div class="drawer-body">
          <div class="details-section">
            <div class="details-title">Joining info</div>
            <div class="joining-info-box">
              <p style="margin-bottom: 8px;"><strong>meet.google.com/eps-kziz-mfv</strong></p>
              <p style="font-size: 12px; color: var(--text-tertiary);">Dial-in: (US) +1 415-555-0199</p>
              <p style="font-size: 12px; color: var(--text-tertiary);">PIN: 849 203 118#</p>
            </div>
            <button class="btn-copy-code" id="btn-drawer-copy-info" style="align-self: flex-start; padding: 8px 14px; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-pill);">
              <span class="icon">content_copy</span>
              <span>Copy joining info</span>
            </button>
          </div>
        </div>
      </aside>

      <!-- Activities Drawer -->
      <aside class="side-drawer" id="drawer-activities">
        <div class="drawer-header">
          <h2 class="drawer-title">Activities</h2>
          <button class="drawer-close-btn" data-close="activities">
            <span class="icon">close</span>
          </button>
        </div>
        <div class="drawer-body" style="padding: 16px;">
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div class="activity-card" style="display:flex; align-items:center; gap:16px; padding:14px; background:var(--bg-primary); border-radius:var(--radius-md); border:1px solid var(--border-color); cursor:pointer;">
              <span class="icon" style="color:var(--google-blue-light); font-size:24px;">draw</span>
              <div>
                <div style="font-size:14px; font-weight:500;">Whiteboarding</div>
                <div style="font-size:12px; color:var(--text-tertiary);">Collaborate on a digital whiteboard</div>
              </div>
            </div>
            <div class="activity-card" style="display:flex; align-items:center; gap:16px; padding:14px; background:var(--bg-primary); border-radius:var(--radius-md); border:1px solid var(--border-color); cursor:pointer;">
              <span class="icon" style="color:var(--google-green); font-size:24px;">poll</span>
              <div>
                <div style="font-size:14px; font-weight:500;">Polls</div>
                <div style="font-size:12px; color:var(--text-tertiary);">Get instant team feedback</div>
              </div>
            </div>
            <div class="activity-card" style="display:flex; align-items:center; gap:16px; padding:14px; background:var(--bg-primary); border-radius:var(--radius-md); border:1px solid var(--border-color); cursor:pointer;">
              <span class="icon" style="color:var(--google-yellow); font-size:24px;">quiz</span>
              <div>
                <div style="font-size:14px; font-weight:500;">Q&amp;A</div>
                <div style="font-size:12px; color:var(--text-tertiary);">Ask and upvote questions</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Host Controls Drawer -->
      <aside class="side-drawer" id="drawer-host">
        <div class="drawer-header">
          <h2 class="drawer-title">Host controls</h2>
          <button class="drawer-close-btn" data-close="host">
            <span class="icon">close</span>
          </button>
        </div>
        <div class="drawer-body" style="padding: 16px;">
          <div style="display: flex; flex-direction: column; gap: 16px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="font-size:14px; font-weight:500;">Host management</div>
                <div style="font-size:12px; color:var(--text-tertiary);">Control what participants can do</div>
              </div>
              <input type="checkbox" checked style="accent-color:var(--google-blue);" />
            </div>
            <hr style="border:none; border-top:1px solid var(--border-color);" />
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div style="font-size:13px;">Share their screen</div>
              <input type="checkbox" checked style="accent-color:var(--google-blue);" />
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div style="font-size:13px;">Send chat messages</div>
              <input type="checkbox" checked style="accent-color:var(--google-blue);" />
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div style="font-size:13px;">Turn on their microphone</div>
              <input type="checkbox" checked style="accent-color:var(--google-blue);" />
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div style="font-size:13px;">Turn on their video</div>
              <input type="checkbox" checked style="accent-color:var(--google-blue);" />
            </div>
          </div>
        </div>
      </aside>
    `;

    this.attachEvents();
  }

  attachEvents() {
    // Close buttons
    this.container.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.close();
      });
    });

    // Chat sending
    const input = this.container.querySelector('#chat-input-field');
    const sendBtn = this.container.querySelector('#btn-send-chat');

    const handleSend = () => {
      if (input && input.value.trim()) {
        this.actions.onSendMessage(input.value.trim());
        input.value = '';
      }
    };

    if (sendBtn) sendBtn.addEventListener('click', handleSend);
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSend();
      });
    }

    // Add people button
    const addBtn = this.container.querySelector('#btn-add-people-action');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const name = prompt('Enter guest name to invite:');
        if (name && name.trim()) {
          this.actions.onAddParticipant(name.trim());
        }
      });
    }

    // Copy info in details drawer
    const copyBtn = this.container.querySelector('#btn-drawer-copy-info');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText('https://meet.google.com/eps-kziz-mfv');
        this.actions.showToast('Meeting link copied to clipboard');
      });
    }
  }

  toggle(name) {
    if (this.currentDrawer === name) {
      this.close();
    } else {
      this.open(name);
    }
  }

  open(name) {
    this.close();
    this.currentDrawer = name;
    const drawer = this.container.querySelector(`#drawer-${name}`);
    if (drawer) {
      drawer.classList.add('open');
      if (name === 'chat') {
        this.actions.onChatOpened();
        const input = this.container.querySelector('#chat-input-field');
        if (input) setTimeout(() => input.focus(), 150);
      }
    }
  }

  close() {
    this.container.querySelectorAll('.side-drawer').forEach(d => d.classList.remove('open'));
    this.currentDrawer = null;
    this.actions.onDrawerClosed();
  }

  isOpen(name) {
    return this.currentDrawer === name;
  }

  updateChatMessages(messages) {
    const list = this.container.querySelector('#chat-messages-list');
    if (!list) return;

    list.innerHTML = messages.map(m => `
      <div class="chat-message-item">
        <div class="message-sender-row">
          <span class="message-sender-name">${m.sender}</span>
          <span class="message-time">${m.time}</span>
        </div>
        <div class="message-bubble">${m.text}</div>
      </div>
    `).join('');

    list.scrollTop = list.scrollHeight;
  }

  updateParticipants(participants) {
    const list = this.container.querySelector('#people-list');
    const countHeader = this.container.querySelector('#people-count-header');
    if (countHeader) countHeader.textContent = participants.length;
    if (!list) return;

    list.innerHTML = participants.map(p => `
      <div class="participant-list-item">
        <div class="p-item-left">
          <div class="p-item-avatar" style="background-color: ${p.avatarColor};">
            ${p.name.charAt(0).toUpperCase()}
          </div>
          <div class="p-item-info">
            <span class="p-item-name">${p.name} ${p.isSelf ? '(You)' : ''}</span>
            <span class="p-item-role">${p.role || (p.isHost ? 'Meeting host' : 'Participant')}</span>
          </div>
        </div>
        <div class="p-item-actions">
          ${p.isHandRaised ? '<span class="icon" style="color:var(--google-blue-light); font-size:18px;">back_hand</span>' : ''}
          <button class="tile-btn-action" data-mute-id="${p.id}" style="width:30px; height:30px;" data-tooltip="${p.isMuted ? 'Muted' : 'Mute'}">
            <span class="icon" style="font-size:16px;">${p.isMuted ? 'mic_off' : 'mic'}</span>
          </button>
          <button class="tile-btn-action" data-pin-id="${p.id}" style="width:30px; height:30px;" data-tooltip="${p.isPinned ? 'Unpin' : 'Pin to screen'}">
            <span class="icon" style="font-size:16px;">${p.isPinned ? 'keep_off' : 'keep'}</span>
          </button>
        </div>
      </div>
    `).join('');

    // Attach mute & pin buttons inside people list
    list.querySelectorAll('[data-mute-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-mute-id');
        this.actions.onToggleParticipantMute(id);
      });
    });

    list.querySelectorAll('[data-pin-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-pin-id');
        this.actions.onTogglePin(id);
      });
    });
  }
}
