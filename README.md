# 🛡️ StealthSafe

> A personal safety app disguised as a weather app.

**StealthSafe** provides a covert safety toolkit behind a completely believable weather interface. Secret gestures unlock the vault. Silent SOS fires without changing the screen. A guardian can watch your breadcrumb trail live.

---

## 🚀 Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173

---

## 🔧 Firebase setup (required for Guardian View)

1. Go to https://console.firebase.google.com
2. Click **Add project** → name it `stealthsafe`
3. In the project: **Build → Realtime Database → Create database → Start in test mode**
4. Go to **Project Settings (gear icon) → Your apps → Add app → Web**
5. Copy the config object shown
6. Open `src/lib/firebase.js` and replace the placeholder values

---

## ▲ Vercel deployment

```bash
npm install -g vercel
vercel
```

Follow the prompts. Every `git push` to `main` after linking will auto-deploy.

---

## 🔐 How to use the app

| Gesture | What it does |
|---|---|
| Tap ☀️ Sun → ☁️ Cloud (within 1.5s) | Opens the safety vault |
| Tap ☁️ Cloud → ☀️ Sun | Silent SOS to trusted contact |
| Type safeword in search bar + Enter | Triggers mapped action |
| Keyboard S → C (desktop) | Opens vault |

### First setup
1. Open the app → complete the onboarding tour
2. Open the vault → go to **Settings (gear icon)**
3. Set your **trusted contact** name + phone (country code + number, no spaces)
4. Set up to **3 safewords** with mapped actions
5. Generate a **Guardian code** and share the `/watch/[code]` URL with a trusted person

---

## 🗂️ Feature list

| Feature | How |
|---|---|
| F-01 Decoy weather app | Static data, Recharts graph, 7-day forecast |
| F-02 Sun→Cloud unlock | Sequential tap with 1.5s window |
| F-03 Cloud→Sun→Cloud silent SOS | From weather layer, screen unchanged |
| F-04 Safeword listener | Weather search bar + Enter |
| F-05 6 preset tiles | Bad date, Unsafe commute, Domestic, Medical, Shady outing, Abduction |
| F-06 Fake call | Caller name, delay (now/30s/2min/custom), realistic UI |
| F-07 Loud alarm | Web Audio API 1000Hz sine wave |
| F-08 Alert contact | WhatsApp deep-link, pre-written message |
| F-09 Breadcrumb + Guardian View | localStorage + Firebase, live at /watch/[code] |
| F-10 Audio recorder | MediaRecorder, Web Share API on mobile |
| F-11 Dead man's switch | Timer + note, fires WhatsApp on expiry |
| F-12 Safe places | 5 Google Maps deep-links (police, hospital, mall, public, pharmacy) |
| F-13 Decoy news article | Realistic fake article, back → weather |
| F-14 Onboarding tour | 5-step spotlight, restartable from Settings |
| F-15 Settings | Contact, safewords, caller name, guardian code, demo mode |

---

## 📸 Screenshots to take for submission

- [ ] Desktop view — phone frame + QR code
- [ ] Weather decoy — convincing, no hint of vault
- [ ] Sun ripple — mid-animation screenshot
- [ ] Preset tiles grid
- [ ] Fake incoming call screen
- [ ] Dead man's switch — timer counting down
- [ ] Guardian View — two devices, live update visible
- [ ] Decoy news article
- [ ] Settings screen
- [ ] Onboarding tour step

---

## 🗓️ Git commit history

```
feat: project scaffold, phone frame, firebase init, vercel deploy
feat: decoy weather UI, recharts graph, sun-cloud unlock gesture
feat: vault dashboard, 6 preset tiles, fake call with delay options
feat: whatsapp alert, silent SOS gesture, 3 safewords in settings
feat: breadcrumb log, firebase guardian view, live sync demo
feat: alarm, audio recorder, dead mans switch, safe places map links
feat: decoy news article, 5-step onboarding spotlight tour
style: final polish, QR landing page, demo mode, production deploy
```

---

## ⚠️ Known limitations (honest)

- Dead man's switch requires the app to be open in the browser tab
- Audio recording requires microphone permission grant
- Web Share API (audio sharing) works on mobile only; desktop gets a download link
- Firebase requires internet connection for Guardian View sync; breadcrumbs save locally regardless
