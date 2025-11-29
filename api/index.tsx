import { Frog } from 'frog'

export const config = { runtime: 'edge' }

export const app = new Frog({
  basePath: '/',
  dev: { devtools: false } 
})

app.hono.get('/.well-known/farcaster.json', (c) => {
  return c.json({
    "frame": {
      "version": "1",
      "name": "Neon Oracle",
      "iconUrl": "https://neon-oracle.vercel.app/icon.png",
      "homeUrl": "https://neon-oracle.vercel.app",
      "imageUrl": "https://neon-oracle.vercel.app/image.png",
      "splashImageUrl": "https://neon-oracle.vercel.app/splash.png",
      "splashBackgroundColor": "#000000",
      "webhookUrl": "https://neon-oracle.vercel.app/api/webhook",
      "subtitle": "Daily Prediction",
      "description": "Predict your daily crypto luck.",
      "primaryCategory": "utility"
    },
    "accountAssociation": {
      "header": "eyJmaWQiOjIxNDgwLCJ0eXBlIjoiYXV0aCIsImtleSI6IjB4ODcxN2ZDMEY2ZjllNjdkMzhmQTc1NzFjNTUwMWRmNzA3QTIzQzFBNiJ9",
      "payload": "eyJkb21haW4iOiJuZW9uLW9yYWNsZS52ZXJjZWwuYXBwIn0",
      "signature": "MHhk..." 
    }
  })
})

app.hono.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Neon Oracle</title>
      <script src="https://cdn.jsdelivr.net/npm/@farcaster/frame-sdk/dist/index.min.js"></script>
      <style>
        :root { --bg-color: #050505; --neon-cyan: #00f3ff; --neon-pink: #bc13fe; }
        body { margin: 0; font-family: 'Courier New', Courier, monospace; background-color: var(--bg-color); color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; overflow: hidden; }
        
        /* 背景动画 */
        .grid-bg { position: fixed; top: 0; left: 0; width: 200%; height: 200%; background-image: linear-gradient(rgba(0, 243, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 243, 255, 0.1) 1px, transparent 1px); background-size: 40px 40px; transform: perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px); z-index: -1; animation: grid-move 20s linear infinite; }
        @keyframes grid-move { 0% { transform: perspective(500px) rotateX(60deg) translateY(0) translateZ(-200px); } 100% { transform: perspective(500px) rotateX(60deg) translateY(40px) translateZ(-200px); } }
        
        .container { width: 90%; max-width: 380px; text-align: center; position: relative; z-index: 10; display: flex; flex-direction: column; align-items: center; }
        h1 { font-size: 2.5rem; margin-bottom: 10px; text-shadow: 0 0 10px var(--neon-cyan), 0 0 20px var(--neon-cyan); letter-spacing: 2px; }
        
        /* 水晶球 */
        .oracle-display { width: 200px; height: 200px; margin: 30px auto; border-radius: 50%; background: radial-gradient(circle, #222, #000); border: 2px solid var(--neon-pink); box-shadow: 0 0 20px var(--neon-pink), inset 0 0 30px var(--neon-pink); display: flex; flex-direction: column; align-items: center; justify-content: center; transition: all 0.5s ease; }
        .oracle-display.active { box-shadow: 0 0 50px var(--neon-cyan), inset 0 0 50px var(--neon-cyan); border-color: var(--neon-cyan); transform: scale(1.05); }
        
        .score-text { font-size: 4rem; font-weight: bold; margin: 0; opacity: 0; transition: opacity 0.5s; }
        .predict-text { font-size: 1rem; color: var(--neon-cyan); margin-top: 5px; opacity: 0; text-transform: uppercase; }
        .visible { opacity: 1 !important; }
        
        /* 预测按钮 */
        .btn-predict { background: transparent; color: var(--neon-cyan); border: 2px solid var(--neon-cyan); padding: 15px 40px; font-size: 1.2rem; font-family: inherit; font-weight: bold; cursor: pointer; text-transform: uppercase; box-shadow: 0 0 10px var(--neon-cyan); transition: 0.3s; margin-top: 20px; width: 100%; max-width: 300px; }
        .btn-predict:hover { background: var(--neon-cyan); color: black; box-shadow: 0 0 30px var(--neon-cyan); }
        .btn-predict:disabled { border-color: #555; color: #555; box-shadow: none; cursor: not-allowed; }

        /* Twitter 按钮 (新增) */
        .btn-twitter { 
            margin-top: 20px; 
            text-decoration: none; 
            color: var(--neon-pink); 
            border: 1px solid var(--neon-pink); 
            padding: 12px 30px; 
            font-size: 1rem; 
            text-transform: uppercase; 
            font-weight: bold; 
            transition: 0.3s; 
            display: inline-block; 
            box-shadow: 0 0 5px var(--neon-pink);
            width: 100%;
            max-width: 300px;
            box-sizing: border-box;
        }
        .btn-twitter:hover { background: var(--neon-pink); color: white; box-shadow: 0 0 20px var(--neon-pink); }

      </style>
    </head>
    <body>
      <div class="grid-bg"></div>
      
      <div class="container">
        <h1>NEON ORACLE</h1>
        <p style="color: #aaa; font-size: 0.9rem;">What is your luck today?</p>
        
        <div class="oracle-display" id="oracle-ball">
          <div class="score-text" id="score">?</div>
          <div class="predict-text" id="keywords">WAITING...</div>
        </div>
        
        <button class="btn-predict" id="predict-btn" onclick="revealDestiny()">REVEAL DESTINY</button>

        <a href="https://twitter.com/biboombii" target="_blank" class="btn-twitter">
            Follow Twitter
        </a>
      </div>

      <script>
        const WORDS = ["BULLISH", "MOON", "HODL", "DUMP", "DEGEN", "WAGMI", "REKT", "ALPHA"];
        const STORAGE_KEY = 'neon_oracle_data';
        function revealDestiny() {
          const btn = document.getElementById('predict-btn');
          const ball = document.getElementById('oracle-ball');
          const scoreEl = document.getElementById('score');
          const interval = setInterval(() => {
            scoreEl.innerText = Math.floor(Math.random() * 99);
            scoreEl.classList.add('visible');
            if (btn.innerText !== "CALCULATING...") { btn.innerText = "CALCULATING..."; btn.disabled = true; ball.classList.add('active'); }
          }, 100);
          setTimeout(() => {
            clearInterval(interval);
            const score = Math.floor(Math.random() * 100);
            const word = WORDS[Math.floor(Math.random() * WORDS.length)];
            const data = { date: new Date().toDateString(), score, word };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            renderResult(data);
          }, 1500);
        }
        function renderResult(data) {
          document.getElementById('score').innerText = data.score;
          document.getElementById('keywords').innerText = data.word;
          document.getElementById('score').classList.add('visible');
          document.getElementById('keywords').classList.add('visible');
          document.getElementById('oracle-ball').classList.add('active');
          const btn = document.getElementById('predict-btn');
          btn.innerText = "COME BACK TOMORROW";
          btn.disabled = true;
          btn.style.borderColor = "#555";
          btn.style.color = "#555";
          btn.style.boxShadow = "none";
        }
        document.addEventListener("DOMContentLoaded", async () => {
          const savedData = localStorage.getItem(STORAGE_KEY);
          if (savedData && JSON.parse(savedData).date === new Date().toDateString()) renderResult(JSON.parse(savedData));
          if (window.farcaster && window.farcaster.sdk) { try { await window.farcaster.sdk.context; window.farcaster.sdk.actions.ready(); } catch (e) {} }
        });
      </script>
    </body>
    </html>
  `)
})

export const GET = app.fetch
export const POST = app.fetch