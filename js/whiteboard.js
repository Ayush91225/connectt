// Interactive Google Meet Whiteboard (Jamboard Canvas)

export class WhiteboardModal {
  constructor(container, actions) {
    this.container = container;
    this.actions = actions;
    this.isDrawing = false;
    this.currentColor = '#1a73e8';
    this.currentSize = 4;
    this.isEraser = false;
    this.canvas = null;
    this.ctx = null;
    this.render();
  }

  render() {
    const modalEl = document.createElement('div');
    modalEl.id = 'whiteboard-modal';
    modalEl.className = 'modal-backdrop';
    modalEl.innerHTML = `
      <div class="whiteboard-dialog">
        <div class="whiteboard-header">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span class="icon" style="color: #ffba00; font-size: 26px;">draw</span>
            <div>
              <h2 style="font-size: 16px; font-weight: 500; color: #fff;">Meeting Whiteboard (Jam)</h2>
              <span style="font-size: 11px; color: #9aa0a6;">Live collaboration • eps-kziz-mfv</span>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <button class="pill-action-btn" id="btn-clear-board" style="padding: 6px 12px; font-size: 12px;">
              <span class="icon" style="font-size: 16px;">delete</span>
              <span>Clear</span>
            </button>
            <button class="drawer-close-btn" id="btn-close-whiteboard">
              <span class="icon">close</span>
            </button>
          </div>
        </div>

        <div class="whiteboard-body">
          <!-- Canvas Tools Left Bar -->
          <div class="whiteboard-toolbar">
            <button class="wb-tool-btn active" id="tool-pen" data-tooltip="Pen">
              <span class="icon">edit</span>
            </button>
            <button class="wb-tool-btn" id="tool-eraser" data-tooltip="Eraser">
              <span class="icon">ink_eraser</span>
            </button>
            <div style="width: 24px; height: 1px; background: #3c4043; margin: 4px 0;"></div>
            <!-- Color swatches -->
            <div class="wb-color-dot selected" data-color="#ffffff" style="background: #ffffff;" data-tooltip="White"></div>
            <div class="wb-color-dot" data-color="#1a73e8" style="background: #1a73e8;" data-tooltip="Blue"></div>
            <div class="wb-color-dot" data-color="#ea4335" style="background: #ea4335;" data-tooltip="Red"></div>
            <div class="wb-color-dot" data-color="#34a853" style="background: #34a853;" data-tooltip="Green"></div>
            <div class="wb-color-dot" data-color="#fbbc04" style="background: #fbbc04;" data-tooltip="Yellow"></div>
          </div>

          <!-- Drawing Surface -->
          <div class="whiteboard-canvas-wrapper">
            <canvas id="wb-canvas" width="860" height="520"></canvas>
          </div>
        </div>
      </div>
    `;

    this.container.appendChild(modalEl);
    this.attachEvents(modalEl);
  }

  attachEvents(modalEl) {
    this.canvas = modalEl.querySelector('#wb-canvas');
    this.ctx = this.canvas.getContext('2d');

    // Fill dark background
    this.ctx.fillStyle = '#1e1f22';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const closeBtn = modalEl.querySelector('#btn-close-whiteboard');
    closeBtn.addEventListener('click', () => this.close());

    modalEl.addEventListener('click', (e) => {
      if (e.target === modalEl) this.close();
    });

    const penBtn = modalEl.querySelector('#tool-pen');
    const eraserBtn = modalEl.querySelector('#tool-eraser');

    penBtn.addEventListener('click', () => {
      this.isEraser = false;
      penBtn.classList.add('active');
      eraserBtn.classList.remove('active');
    });

    eraserBtn.addEventListener('click', () => {
      this.isEraser = true;
      eraserBtn.classList.add('active');
      penBtn.classList.remove('active');
    });

    // Colors
    modalEl.querySelectorAll('.wb-color-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        modalEl.querySelectorAll('.wb-color-dot').forEach(d => d.classList.remove('selected'));
        dot.classList.add('selected');
        this.currentColor = dot.getAttribute('data-color');
        this.isEraser = false;
        penBtn.classList.add('active');
        eraserBtn.classList.remove('active');
      });
    });

    // Clear
    modalEl.querySelector('#btn-clear-board').addEventListener('click', () => {
      this.ctx.fillStyle = '#1e1f22';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.actions.showToast('Whiteboard cleared');
    });

    // Drawing coordinates
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    };

    const startDraw = (e) => {
      this.isDrawing = true;
      const pos = getPos(e);
      this.ctx.beginPath();
      this.ctx.moveTo(pos.x, pos.y);
    };

    const draw = (e) => {
      if (!this.isDrawing) return;
      const pos = getPos(e);
      this.ctx.lineWidth = this.isEraser ? 24 : this.currentSize;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.ctx.strokeStyle = this.isEraser ? '#1e1f22' : this.currentColor;
      this.ctx.lineTo(pos.x, pos.y);
      this.ctx.stroke();
    };

    const stopDraw = () => {
      this.isDrawing = false;
      this.ctx.closePath();
    };

    this.canvas.addEventListener('mousedown', startDraw);
    this.canvas.addEventListener('mousemove', draw);
    window.addEventListener('mouseup', stopDraw);
  }

  open() {
    const modalEl = this.container.querySelector('#whiteboard-modal');
    if (modalEl) modalEl.classList.add('show');
  }

  close() {
    const modalEl = this.container.querySelector('#whiteboard-modal');
    if (modalEl) modalEl.classList.remove('show');
  }
}
