// Google Meet Home Landing Page Component (Exact Match for Screenshot 1: meet.google.com/home)

export function renderHome(container, actions) {
  const defaultCode = 'eps-kziz-mfv';

  container.innerHTML = `
    <div class="home-page-container">
      <!-- Top Navigation Header -->
      <header class="gm-home-header">
        <div class="gm-home-left-brand" id="btn-brand-home">
          <!-- Real Google Meet Yellow Video Icon -->
          <svg class="gm-brand-logo-img" viewBox="0 0 192 192" fill="none">
            <rect width="130" height="96" rx="20" x="12" y="48" fill="#FABB05" />
            <path d="M142 74L180 48V144L142 118V74Z" fill="#FABB05" />
            <circle cx="77" cy="96" r="16" fill="#ffffff" opacity="0.3"/>
          </svg>
          <span class="gm-brand-name">Google Meet</span>
        </div>

        <!-- Center Pill Search / Join & New Meeting -->
        <div class="gm-home-center-bar">
          <span class="icon gm-input-keyboard-icon">keyboard</span>
          <input type="text" class="gm-code-input" id="input-home-code" placeholder="Enter a code or link" value="${defaultCode}" />
          <button class="gm-btn-join-pill active" id="btn-home-join">Join</button>
          <button class="gm-btn-new-meeting-mint" id="btn-home-new-meeting">
            <span class="icon filled" style="font-size: 18px;">video_call</span>
            <span>New</span>
          </button>
        </div>

        <!-- Right Header Icons -->
        <div class="gm-home-right-actions">
          <button class="gm-icon-circle-btn" data-tooltip="Support"><span class="icon">help_outline</span></button>
          <button class="gm-icon-circle-btn" id="btn-home-settings" data-tooltip="Settings"><span class="icon">settings</span></button>
          <button class="gm-btn-upgrade-pill" id="btn-home-upgrade">Upgrade</button>
          <button class="gm-icon-circle-btn" data-tooltip="Google apps"><span class="icon">apps</span></button>
          <div class="gm-user-avatar" data-tooltip="Google Account">
            <span class="icon" style="font-size: 18px; color: #fff;">account_circle</span>
          </div>
        </div>
      </header>

      <!-- Main Body with Left Rail -->
      <div class="gm-home-body">
        <!-- Left Navigation Rail -->
        <aside class="gm-left-nav-rail">
          <div class="gm-rail-item active" id="rail-meetings">
            <div class="gm-rail-pill">
              <span class="icon filled" style="font-size: 20px;">event</span>
            </div>
            <span class="gm-rail-label">Meetings</span>
          </div>
          <div class="gm-rail-item" id="rail-calls">
            <div class="gm-rail-pill">
              <span class="icon" style="font-size: 20px;">call</span>
            </div>
            <span class="gm-rail-label">Calls</span>
          </div>
        </aside>

        <!-- Main Home Schedule Area -->
        <main class="gm-home-main">
          <!-- Date Header & Week Calendar Strip -->
          <div class="gm-date-strip-row">
            <div class="gm-date-header-left">
              <h2 class="gm-date-title" id="home-date-label">Mon 28 Sept</h2>
              <button class="gm-date-calendar-btn" data-tooltip="View calendar">
                <span class="icon">calendar_today</span>
              </button>
            </div>

            <!-- Mini Weekday Selector -->
            <div class="gm-mini-week-calendar">
              <button class="gm-icon-circle-btn" style="width: 28px; height: 28px;"><span class="icon">chevron_left</span></button>
              <div class="gm-week-day-col active">
                <span>MON</span>
                <span class="gm-day-num">28</span>
              </div>
              <div class="gm-week-day-col">
                <span>TUE</span>
                <span class="gm-day-num">29</span>
              </div>
              <div class="gm-week-day-col">
                <span>WED</span>
                <span class="gm-day-num">30</span>
              </div>
              <div class="gm-week-day-col">
                <span>THU</span>
                <span class="gm-day-num">1</span>
              </div>
              <div class="gm-week-day-col">
                <span>FRI</span>
                <span class="gm-day-num">2</span>
              </div>
              <div class="gm-week-day-col">
                <span>SAT</span>
                <span class="gm-day-num">3</span>
              </div>
              <div class="gm-week-day-col">
                <span>SUN</span>
                <span class="gm-day-num">4</span>
              </div>
              <button class="gm-icon-circle-btn" style="width: 28px; height: 28px;"><span class="icon">chevron_right</span></button>
            </div>
          </div>

          <!-- Blue Safe Meeting Security Banner -->
          <div class="gm-safe-banner">
            <div class="gm-safe-banner-left">
              <div class="gm-shield-icon-wrap">
                <span class="icon filled" style="font-size: 24px;">security</span>
              </div>
              <div>
                <div class="gm-safe-title">Your meeting is safe</div>
                <div class="gm-safe-subtitle">No one can join a meeting unless invited or admitted by the host</div>
              </div>
            </div>
            <button class="gm-btn-learn-more" id="btn-safe-learn-more">Learn more</button>
          </div>

          <!-- Center Doodle & Empty Schedule Area -->
          <div class="gm-empty-schedule-area">
            <!-- Exact Google Meet SVG Doodle (Coffee cup, pencil, tablet, sun) -->
            <svg class="gm-doodle-svg" viewBox="0 0 400 200" fill="none">
              <!-- Pink curved shape -->
              <path d="M70 120 C70 90 90 80 100 80 C110 80 120 100 120 130 H70 Z" fill="#FCE8E6" stroke="#444746" stroke-width="2"/>
              <!-- Yellow Coffee Mug -->
              <path d="M140 90 C140 125 155 135 180 135 C205 135 220 125 220 90 H140 Z" fill="#FBBC04" stroke="#444746" stroke-width="2.2"/>
              <path d="M220 95 C232 95 240 103 240 112 C240 120 230 125 220 122" stroke="#444746" stroke-width="2.2" stroke-linecap="round"/>
              <!-- Steam curves -->
              <path d="M165 80 C160 65 175 60 170 45" stroke="#444746" stroke-width="2" stroke-linecap="round"/>
              <!-- Yellow Sun -->
              <circle cx="310" cy="50" r="14" fill="#FBBC04" stroke="#444746" stroke-width="2"/>
              <!-- Gray loop doodle -->
              <path d="M230 70 C240 45 280 40 290 60 C298 75 310 90 320 100" stroke="#444746" stroke-width="2" stroke-linecap="round"/>
              <!-- Pencil -->
              <polygon points="215 135, 230 40, 240 42, 225 135" fill="#FEE75C" stroke="#444746" stroke-width="2"/>
              <polygon points="230 40, 235 28, 240 42" fill="#444746"/>
              <!-- White Tablet / Screen with Meet Video Icon -->
              <rect x="235" y="65" width="95" height="70" rx="8" transform="skewX(-10)" fill="#ffffff" stroke="#444746" stroke-width="2.2"/>
              <rect x="250" y="80" width="34" height="24" rx="4" stroke="#444746" stroke-width="2" fill="none"/>
              <polygon points="286 85, 300 78, 300 102, 286 95" stroke="#444746" stroke-width="2" fill="none"/>
            </svg>

            <h3 class="gm-no-meetings-title">No meetings scheduled for today</h3>
            <p class="gm-no-meetings-sub">Schedule a meeting or enjoy the free time</p>

            <button class="gm-btn-big-new" id="btn-big-new-meeting">
              <span class="icon filled" style="font-size: 20px;">video_call</span>
              <span>New</span>
            </button>
          </div>
        </main>
      </div>
    </div>
  `;

  // Attach events
  const codeInput = container.querySelector('#input-home-code');
  const joinBtn = container.querySelector('#btn-home-join');
  const newMeetingMint = container.querySelector('#btn-home-new-meeting');
  const bigNewBtn = container.querySelector('#btn-big-new-meeting');

  const handleJoin = () => {
    const val = codeInput.value.trim() || 'sen-mvwh-cyc';
    const cleanCode = val.replace(/^(https?:\/\/)?meet\.google\.com\//, '').replace(/\//g, '');
    actions.joinMeetingWithCode(cleanCode);
  };

  const handleStartInstant = () => {
    actions.startInstantMeeting('sen-mvwh-cyc');
  };

  joinBtn.addEventListener('click', handleJoin);
  newMeetingMint.addEventListener('click', handleStartInstant);
  bigNewBtn.addEventListener('click', handleStartInstant);

  codeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleJoin();
  });

  codeInput.addEventListener('input', () => {
    if (codeInput.value.trim().length > 0) {
      joinBtn.classList.add('active');
    } else {
      joinBtn.classList.remove('active');
    }
  });

  // Settings
  container.querySelector('#btn-home-settings').addEventListener('click', () => {
    actions.openSettings();
  });
}
