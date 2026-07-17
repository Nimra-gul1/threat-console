# 🛡️ Threat Console — Live Security Lab

> A hands-on, interactive cybersecurity lab built by software engineering students at **Riphah International University, Islamabad**. Everything runs live in the browser — no mockups, no fake data.

---

## 📌 Overview

**Threat Console** is a full-stack web application that brings cybersecurity concepts to life through real, working tools. Built as a portfolio-grade project, it demonstrates practical knowledge of network security, cryptography, vulnerability analysis, and Capture-the-Flag (CTF) challenges — all accessible directly from the browser.

Whether you're a recruiter, a fellow developer, or a security enthusiast, this project showcases what it means to *build* security rather than just study it.

---

## ✨ Features

### 🔧 Security Toolkit
| Tool | Description |
|------|-------------|
| **Password Strength Analyzer** | Real-time analysis against length, character classes, and common password lists |
| **Hash Generator** | Client-side SHA-256 and SHA-1 hash generation using the Web Crypto API |
| **Port Scan Simulator** | Live TCP port sweep against any IP/hostname via Server-Sent Events (SSE), scanning 15 common ports |

### 🚩 Mini CTF Challenges
Three self-contained Capture-The-Flag challenges embedded directly in the page:
- **Easy — Encoding:** Decode a Base64-encoded flag
- **Medium — Classical Cipher:** Crack a Caesar cipher (ROT-3)
- **Hard — Spot the Vulnerability:** Identify a reflected XSS vulnerability from a code snippet

### 📡 Network Radar
A live animated radar visualization that discovers devices on the local network using ARP table lookups and classifies them (router, workstation, web server, IoT device, etc.).

### 🧠 Core Security Concepts
Illustrated, interactive cards covering:
- **CIA Triad** — Confidentiality, Integrity, Availability
- **Attack Vectors** — Phishing, XSS, SQL Injection, MitM, DDoS, Social Engineering

---

## 🗂️ Project Structure

```
threat-console/
├── public/
│   ├── index.html      # Single-page application — all UI lives here
│   ├── style.css       # Dark-themed, animated CSS (glassmorphism, radar, flip cards)
│   └── main.js         # Client-side logic — hash gen, password analyzer, CTF, radar
├── api/
│   └── index.js        # Vercel serverless entry point
├── server.js           # Express server — port scan SSE endpoint, radar-nodes API
├── vercel.json         # Vercel routing config (API rewrites + static asset mapping)
├── package.json        # Node.js project manifest
└── README.md           # You are here
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | HTML5, Vanilla CSS, Vanilla JavaScript |
| **Backend** | Node.js, Express 5 |
| **APIs** | Server-Sent Events (SSE) for live scan streaming |
| **Deployment** | Vercel (serverless functions + static hosting) |
| **Fonts** | Space Grotesk, Inter, JetBrains Mono (Google Fonts) |
| **Security APIs** | Web Crypto API (SHA-256 / SHA-1), Node.js `net` module (TCP), OS ARP table |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node.js)

### 1. Clone the Repository

```bash
git clone https://github.com/Nimra-gul1/threat-console.git
cd threat-console
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Locally

```bash
npm run dev
```

The app will start at **http://localhost:3000**

### 4. Deploy to Vercel

```bash
npx vercel --prod
```

> The `vercel.json` config handles all routing — API calls go to `/api/index.js` and everything else is served from `/public/`.

---

## 🔌 API Endpoints

### `GET /api/scan-ports?target=<ip>`
Performs a live TCP port sweep on the specified target.  
**Response:** Server-Sent Events (SSE) stream — each event is a JSON object:
```json
{ "port": "80/tcp", "status": "open", "service": "http" }
```
Final event:
```json
{ "done": true, "summary": "Scan complete — 2 open, 3 filtered, 10 closed." }
```

### `GET /api/radar-nodes`
Returns a list of network devices discovered via the local ARP table.  
**Response:**
```json
{
  "success": true,
  "devices": [
    { "host": "192.168.1.1", "tag": "router" },
    { "host": "192.168.1.5", "tag": "workstation" }
  ]
}
```

---

## 🎨 Design Highlights

- **Dark theme** with a deep charcoal/navy base and neon-green (`#7FFF7F`) accent
- **Animated SVG radar** with rotating sweep and live node blips
- **Glassmorphism panels** with subtle blur and border effects
- **Flip cards** for the attack vector section
- **Smooth micro-animations** on all interactive elements
- Fully **responsive** layout for desktop and tablet

---

## 👥 Team

- **Nimra Gul**
- **Jaweria Khan**

> 📍 Riphah International University — Software Engineering, Islamabad, Pakistan

---

## 📄 License

This project is open source under the [ISC License](https://opensource.org/licenses/ISC).

---

## 🙏 Acknowledgements

- [MDN Web Docs](https://developer.mozilla.org/) — Web Crypto API & SSE reference
- [Vercel](https://vercel.com/) — Seamless serverless deployment
- [Google Fonts](https://fonts.google.com/) — Space Grotesk & JetBrains Mono
- Riphah International University faculty for guidance

---

<p align="center">
  Built with ❤️ by <strong>Nimra Gul</strong> &amp; <strong>Jaweria Khan</strong>
</p>
