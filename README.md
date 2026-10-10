# Google Meet Clone (Next.js & Material 3 Expressive)

A pixel-perfect clone of Google Meet (`meet.google.com/home` and `meet.google.com/sen-mvwh-cyc`) re-architected with **Next.js 16 (App Router)** and **Material 3 Expressive (M3 Expressive)** motion, tactile feedback, and tonal elevation.

## 🚀 What makes it M3 Expressive & Ultra-Smooth?

- **Material 3 Expressive Motion**:
  - Overshoot spring curves (`cubic-bezier(0.34, 1.45, 0.64, 1.0)`) for popovers, drawers, and active button states.
  - Tactile scale responses on press (`active { transform: scale(0.94); }`).
  - Fluid drawer slide-in with spring physics and auto-resizing center stage.
- **M3 Corner Tokens**:
  - Full pill curves (`9999px`) for docks, search bars, and badges.
  - Large rounded corners (`16px`) for video tiles and drawers.
- **Pixel-Perfect Screenshot Accuracy**:
  - **Screenshot 1 (`/home`)**: Light theme, Meet yellow video camera, center pill input bar with keyboard icon, mint-green `+ New` button, left rail (`Meetings` / `Calls`), weekday strip navigator `< MON 28 ... SUN 4 >`, security banner, and coffee mug doodle.
  - **Screenshots 2 & 3 (`/sen-mvwh-cyc`)**: Top header `00:34 | sen-mvwh-cyc ⓘ` and `[laptop 1]`, slate gradient tile with center white circle avatar `NINEONE 152`, blue muted mic badge, `NineOne152` name tag, and live webcam feed toggle.
  - **Screenshot 4**: Quick video controls popover floating right above the dock (`FaceTime HD Camera...`, `Blur background`, `Backgrounds and effects`, settings gear).
  - **Screenshot 5**: Right side drawer with "Tools" (Speech translation, Countdown timer) and "Unavailable or premium" (Record, Transcribe, Live streaming, Breakout rooms).

## 🏃 Running the Application

In your terminal:

```bash
cd /Users/ayushmaansoni/.gemini/antigravity/scratch/google-meet-clone
npm run dev
```

Then open your browser:
- 🏠 **Home Page (Screenshot 1):** [http://localhost:3000/home](http://localhost:3000/home) or [http://localhost:3000/](http://localhost:3000/)
- 🎥 **Live In-Call Stage (Screenshots 2-5):** [http://localhost:3000/sen-mvwh-cyc](http://localhost:3000/sen-mvwh-cyc)
