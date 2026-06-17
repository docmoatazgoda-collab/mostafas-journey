# رحلة مصطفى — Mostafa's Journey PWA

An Arabic RTL educational Progressive Web App (PWA) designed to prepare 3-year-olds for KG1 and the UCMAS mental math program through daily interactive play.

---

## 🌟 Key Features

1. **RTL Arabic First Design**: Curated layout in Egyptian Arabic dialect, with Claude-inspired premium warm palette (Toffee accent `#D97706` / Dark Mode responsive).
2. **30-Day Guided Curriculum**:
   - **Letters**: Custom pedagogical sequence separating visually similar characters (أ, ب, د, ر, س, ع, م...).
   - **Numbers**: 1-10 counting, repeating with visual objects and interactive hops.
   - **Colors & Animals**: Multi-sensory associations (color swatches, sound facts).
   - **Quran**: Short surahs and verses (Al-Fatiha, Al-Ikhlas, Al-Falaq, An-Nas, Ayat Al-Kursi) segmented for easy repetition.
   - **Behavior Skills**: Practical scenarios (saying Salam, sharing toys, cleanup).
3. **Extra 40 Standalone Offline Activities**: Screen-free, structured household play ideas categorized into letters, numbers, colors, motor, sensory, and social skills.
4. **15-Minute Phase Timer**: Flexible guided play divided into 5 phases (Warmup, Main, Behavior, Quran, Closing) with parent-guided next buttons.
5. **Speech Engine**: Arabic Text-to-Speech (TTS) pronunciation of letters, numbers, Quran, and animal sounds.
6. **Printable Worksheets (PDF)**: Automated generation of letter tracing/coloring guides for offline screen-free learning.
7. **Graduation & Gamification**: Locally tracked achievement badges (confetti celebrations) and printable graduation certificate PDF.
8. **Offline Capable PWA**: Runs entirely without internet after first load using Service Workers.

---

## 🛠️ Technology Stack

- **HTML5 / CSS3**: Vanilla, responsive layout with animations and dark mode toggle.
- **JavaScript (Vanilla)**: LocalStorage persistence, Web Speech API integration, and hash-based routing.
- **jsPDF**: CDN dependency for printable material creation.
- **Service Worker**: PWA offline caching layer.

---

## 🚀 Running Locally

The app uses standard static file structures. You can run it with any local web server.

Using Node.js:
1. Clone this repository.
2. Run the local development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:8080/](http://localhost:8080/) in your browser.
