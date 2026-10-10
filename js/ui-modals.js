// Audio/Video Settings Modal and Visual Effects Modal

export class ModalsManager {
  constructor(container, actions) {
    this.container = container;
    this.actions = actions;
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <!-- Backdrop -->
      <div class="modal-backdrop" id="modal-backdrop">
        <!-- Settings Modal -->
        <div class="modal-dialog" id="modal-settings" style="display: none;">
          <div class="modal-header">
            <h2 class="modal-title">Settings</h2>
            <button class="drawer-close-btn" id="btn-close-settings">
              <span class="icon">close</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="setting-group">
              <label class="setting-label">Microphone</label>
              <select class="setting-select" id="mic-select">
                <option value="default">Default - Built-in Microphone (Internal Mic)</option>
              </select>
            </div>

            <div class="setting-group">
              <label class="setting-label">Speakers</label>
              <div style="display: flex; gap: 10px;">
                <select class="setting-select" id="speaker-select" style="flex: 1;">
                  <option value="default">Default - Built-in Output (Internal Speakers)</option>
                </select>
                <button class="pill-action-btn" id="btn-test-speakers">
                  <span class="icon">volume_up</span>
                  <span>Test</span>
                </button>
              </div>
            </div>

            <div class="setting-group">
              <label class="setting-label">Camera</label>
              <select class="setting-select" id="camera-select">
                <option value="default">FaceTime HD Camera (Built-in)</option>
              </select>
            </div>

            <div class="setting-group">
              <label class="setting-label">Send resolution (maximum)</label>
              <select class="setting-select">
                <option value="720">High definition (720p)</option>
                <option value="360">Standard definition (360p)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Visual Effects Modal -->
        <div class="modal-dialog" id="modal-effects" style="display: none;">
          <div class="modal-header">
            <h2 class="modal-title">Effects</h2>
            <button class="drawer-close-btn" id="btn-close-effects">
              <span class="icon">close</span>
            </button>
          </div>
          <div class="modal-body">
            <div style="font-size: 13px; color: var(--text-tertiary); font-weight: 500;">BACKGROUNDS</div>
            <div class="effects-grid">
              <!-- None -->
              <div class="effect-option-card selected" data-effect="none">
                <div class="effect-preview-box">
                  <span class="icon">block</span>
                </div>
                <span class="effect-name">No effect</span>
              </div>

              <!-- Blur Light -->
              <div class="effect-option-card" data-effect="blur-light">
                <div class="effect-preview-box" style="filter: blur(2px);">
                  <span class="icon">blur_on</span>
                </div>
                <span class="effect-name">Slight blur</span>
              </div>

              <!-- Blur Heavy -->
              <div class="effect-option-card" data-effect="blur-heavy">
                <div class="effect-preview-box" style="filter: blur(5px);">
                  <span class="icon">blur_linear</span>
                </div>
                <span class="effect-name">Blur background</span>
              </div>

              <!-- Virtual Office -->
              <div class="effect-option-card" data-effect="virtual-office">
                <div class="effect-preview-box" style="background: url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=300&q=80') center/cover;">
                </div>
                <span class="effect-name">Modern Office</span>
              </div>

              <!-- Virtual Bookshelf -->
              <div class="effect-option-card" data-effect="virtual-bookshelf">
                <div class="effect-preview-box" style="background: url('https://images.unsplash.com/photo-1507842229451-7f01be7fb896?auto=format&fit=crop&w=300&q=80') center/cover;">
                </div>
                <span class="effect-name">Library</span>
              </div>

              <!-- Virtual Beach -->
              <div class="effect-option-card" data-effect="virtual-beach">
                <div class="effect-preview-box" style="background: url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80') center/cover;">
                </div>
                <span class="effect-name">Sunny Beach</span>
              </div>
            </div>

            <div style="font-size: 13px; color: var(--text-tertiary); font-weight: 500; margin-top: 10px;">LIGHTING &amp; APPEARANCE</div>
            <div class="effects-grid">
              <div class="effect-option-card" data-effect="studio-light">
                <div class="effect-preview-box" style="background: linear-gradient(135deg, #ffd194 0%, #70e1f5 100%);">
                  <span class="icon">wb_incandescent</span>
                </div>
                <span class="effect-name">Studio lighting</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const backdrop = this.container.querySelector('#modal-backdrop');
    const closeSettings = this.container.querySelector('#btn-close-settings');
    const closeEffects = this.container.querySelector('#btn-close-effects');

    const hideAll = () => {
      backdrop.classList.remove('show');
      this.container.querySelector('#modal-settings').style.display = 'none';
      this.container.querySelector('#modal-effects').style.display = 'none';
    };

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) hideAll();
    });

    closeSettings.addEventListener('click', hideAll);
    closeEffects.addEventListener('click', hideAll);

    // Test speakers chime
    const testBtn = this.container.querySelector('#btn-test-speakers');
    if (testBtn) {
      testBtn.addEventListener('click', () => {
        this.actions.sfx.playJoin();
        this.actions.showToast('Playing speaker test sound...');
      });
    }

    // Effect selection
    this.container.querySelectorAll('[data-effect]').forEach(card => {
      card.addEventListener('click', () => {
        this.container.querySelectorAll('[data-effect]').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        const effectName = card.getAttribute('data-effect');
        this.actions.onApplyEffect(effectName);
      });
    });
  }

  openSettings(devices) {
    const backdrop = this.container.querySelector('#modal-backdrop');
    const modal = this.container.querySelector('#modal-settings');
    this.container.querySelector('#modal-effects').style.display = 'none';
    
    // populate device dropdowns if available
    if (devices) {
      if (devices.audioInputs && devices.audioInputs.length > 0) {
        const micSelect = this.container.querySelector('#mic-select');
        micSelect.innerHTML = devices.audioInputs.map(d => `<option value="${d.deviceId}">${d.label || 'Microphone'}</option>`).join('');
      }
      if (devices.videoInputs && devices.videoInputs.length > 0) {
        const camSelect = this.container.querySelector('#camera-select');
        camSelect.innerHTML = devices.videoInputs.map(d => `<option value="${d.deviceId}">${d.label || 'Camera'}</option>`).join('');
      }
    }

    modal.style.display = 'flex';
    backdrop.classList.add('show');
  }

  openEffects() {
    const backdrop = this.container.querySelector('#modal-backdrop');
    const modal = this.container.querySelector('#modal-effects');
    this.container.querySelector('#modal-settings').style.display = 'none';
    modal.style.display = 'flex';
    backdrop.classList.add('show');
  }
}
