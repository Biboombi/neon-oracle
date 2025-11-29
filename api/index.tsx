import { Frog } from 'frog'

export const config = { runtime: 'edge' }

export const app = new Frog({
  basePath: '/',
  title: 'Neon Oracle',
})

const getBaseUrl = (c: any) => {
  const host = c.req.header('host') || 'neon-oracle.vercel.app'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  return `${protocol}://${host}`
}

app.hono.get('/.well-known/farcaster.json', (c) => {
  const baseUrl = getBaseUrl(c)
  return c.json({
    "frame": {
      "version": "1",
      "name": "Neon Oracle",
      "iconUrl": `${baseUrl}/icon.png`, 
      "homeUrl": baseUrl,
      "imageUrl": `${baseUrl}/image.png`, 
      "splashImageUrl": `${baseUrl}/splash.png`, 
      "splashBackgroundColor": "#050505",
      "webhookUrl": `${baseUrl}/api/webhook`,
      "subtitle": "Daily Prediction",
      "description": "Predict your daily crypto luck.",
      "primaryCategory": "utility"
    },
    "accountAssociation": {
      "header": "eyJmaWQiOjIxNTYzLCJ0eXBlIjoiY3VzdG9keSIsImtleSI6IjB4QzBBRGVGZUY4NGFlQTJDQTA4QTEyNWFCRUExNDdEMTA5ZDFEMjFDOSJ9",
      "payload": "eyJkb21haW4iOiJuZW9uLW9yYWNsZS52ZXJjZWwuYXBwIn0",
      "signature": "WHdZf8VGTlGuzgVzvJqRiurrjpiNyXBxwEEsIZrEEeQYOvamPMew3yGZVZG9tsOTq9dRN6RVNYmHADGmvZ6kcxs="
    }
  })
})

app.hono.get('/', (c) => {
  const baseUrl = getBaseUrl(c)
  
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0"> 
      
      <meta property="og:title" content="Neon Oracle">
      <meta property="og:image" content="${baseUrl}/image.png">
      <meta property="fc:frame" content="vNext">
      <meta property="fc:frame:image" content="${baseUrl}/image.png">
      <meta property="fc:frame:button:1" content="🔮 Reveal Destiny">
      <meta property="fc:frame:button:1:action" content="link">
      <meta property="fc:frame:button:1:target" content="${baseUrl}">

      <title>Neon Oracle</title>
      <script src="https://cdn.jsdelivr.net/npm/@farcaster/frame-sdk/dist/index.min.js"></script>
      <style>
        :root { --bg-color: #050505; --neon-cyan: #00f3ff; --neon-pink: #bc13fe; }
        body { margin: 0; font-family: 'Courier New', Courier, monospace; background-color: var(--bg-color); color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; overflow: hidden; }
        .grid-bg { position: fixed; top: 0; left: 0; width: 200%; height: 200%; background-image: linear-gradient(rgba(0, 243, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 243, 255, 0.1) 1px, transparent 1px); background-size: 40px 40px; transform: perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px); z-index: -1; animation: grid-move 20s linear infinite; }
        @keyframes grid-move { 0% { transform: perspective(500px) rotateX(60deg) translateY(0) translateZ(-200px); } 100% { transform: perspective(500px) rotateX(60deg) translateY(40px) translateZ(-200px); } }
        .container { width: 90%; max-width: 380px; text-align: center; position: relative; z-index: 10; display: flex; flex-direction: column; align-items: center; }
        h1 { font-size: 2.5rem; margin-bottom: 10px; text-shadow: 0 0 10px var(--neon-cyan), 0 0 20px var(--neon-cyan); letter-spacing: 2px; }
        .oracle-display { width: 200px; height: 200px; margin: 30px auto; border-radius: 50%; background: radial-gradient(circle, #222, #000); border: 2px solid var(--neon-pink); box-shadow: 0 0 20px var(--neon-pink), inset 0 0 30px var(--neon-pink); display: flex; flex-direction: column; align-items: center; justify-content: center; transition: all 0.5s ease; position: relative; }
        .oracle-display.active { box-shadow: 0 0 50px var(--neon-cyan), inset 0 0 50px var(--neon-cyan); border-color: var(--neon-cyan); transform: scale(1.05); }
        .score-text { font-size: 4rem; font-weight: bold; margin: 0; opacity: 0; transition: opacity 0.5s; }
        .predict-text { font-size: 1rem; color: var(--neon-cyan); margin-top: 5px; opacity: 0; text-transform: uppercase; }
        .visible { opacity: 1 !important; }
        .btn { background: transparent; padding: 15px 40px; font-size: 1.2rem; font-family: inherit; font-weight: bold; cursor: pointer; text-transform: uppercase; transition: 0.3s; margin-top: 15px; width: 100%; max-width: 300px; box-sizing: border-box; }
        .btn-predict { color: var(--neon-cyan); border: 2px solid var(--neon-cyan); box-shadow: 0 0 10px var(--neon-cyan); }
        .btn-predict:hover { background: var(--neon-cyan); color: black; box-shadow: 0 0 30px var(--neon-cyan); }
        .btn-predict:disabled { border-color: #555; color: #555; box-shadow: none; cursor: not-allowed; }
        .btn-share { display: none; color: var(--neon-pink); border: 2px solid var(--neon-pink); box-shadow: 0 0 10px var(--neon-pink); }
        .btn-share:hover { background: var(--neon-pink); color: white; box-shadow: 0 0 30px var(--neon-pink); }
        .btn-twitter { margin-top: 20px; text-decoration: none; color: #888; font-size: 0.8rem; }
        .btn-twitter:hover { color: var(--neon-cyan); }
      </style>
    </head>
    <body>
      <div class="grid-bg"></div>
      <div class="container">
        <h1>NEON ORACLE</h1>
        <p style="color: #aaa; font-size: 0.9rem;">Check your daily crypto luck</p>
        <div class="oracle-display" id="oracle-ball">
          <div class="score-text" id="score">?</div>
          <div class="predict-text" id="keywords">WAITING...</div>
        </div>
        <button class="btn btn-predict" id="predict-btn" onclick="revealDestiny()">REVEAL DESTINY</button>
        <button class="btn btn-share" id="share-btn" onclick="shareDestiny()">SHARE RESULT</button>
        <a href="https://twitter.com/biboombii" target="_blank" class="btn-twitter">@biboombii</a>
      </div>
      <script>
        const WORDS = ["BULLISH", "MOON", "HODL", "DUMP", "DEGEN", "WAGMI", "REKT", "ALPHA", "PEPE", "WHALE"];
        const STORAGE_KEY = 'neon_oracle_data_v1';
        let currentData = null;

        function revealDestiny() {
          const btn = document.getElementById('predict-btn');
          const ball = document.getElementById('oracle-ball');
          const scoreEl = document.getElementById('score');
          if (btn.disabled) return;
          let counter = 0;
          const interval = setInterval(() => {
            scoreEl.innerText = Math.floor(Math.random() * 99);
            scoreEl.classList.add('visible');
            if (btn.innerText !== "CALCULATING...") { btn.innerText = "CALCULATING..."; btn.disabled = true; ball.classList.add('active'); }
            counter++;
          }, 80);
          setTimeout(() => {
            clearInterval(interval);
            const score = Math.floor(Math.random() * 100);
            const word = WORDS[Math.floor(Math.random() * WORDS.length)];
            const data = { date: new Date().toDateString(), score, word };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            renderResult(data);
          }, 2000);
        }
        
        function renderResult(data) {
          currentData = data;
          document.getElementById('score').innerText = data.score;
          document.getElementById('keywords').innerText = data.word;
          document.getElementById('score').classList.add('visible');
          document.getElementById('keywords').classList.add('visible');
          document.getElementById('oracle-ball').classList.add('active');
          const predictBtn = document.getElementById('predict-btn');
          predictBtn.innerText = "COME BACK TOMORROW";
          predictBtn.disabled = true;
          predictBtn.style.display = "none"; 
          const shareBtn = document.getElementById('share-btn');
          shareBtn.style.display = "block"; 
        }

        function shareDestiny() {
           if (!currentData) return;
           var text = "🔮 NEON ORACLE PREDICTION 🔮\\n\\n✨ Luck Score: " + currentData.score + "/100\\n🚀 Sentiment: " + currentData.word + "\\n\\nCheck your destiny 👇";
           var embedUrl = "${baseUrl}"; 
           var shareUrl = "https://warpcast.com/~/compose?text=" + encodeURIComponent(text) + "&embeds[]=" + encodeURIComponent(embedUrl);
           if (window.farcaster && window.farcaster.sdk) {
               window.farcaster.sdk.actions.openUrl(shareUrl);
           } else {
               window.open(shareUrl, '_blank');
           }
        }

        // --- 连环夺命 Call (Polling Fix) ---
        // 这是解决 "Ready not called" 最稳健的方法
        const checkReady = setInterval(() => {
            if (window.farcaster && window.farcaster.sdk) {
                // 只要一发现 SDK 存在，立刻喊 Ready
                window.farcaster.sdk.actions.ready();
                
                // 并停止循环
                clearInterval(checkReady);
                console.log("Farcaster SDK Ready called successfully!");
            }
        }, 100); // 每 100 毫秒检查一次

        // 双重保险：5秒后无论如何再喊一次（防止上面的逻辑意外挂掉）
        setTimeout(() => {
             if (window.farcaster && window.farcaster.sdk) {
                 window.farcaster.sdk.actions.ready();
             }
        }, 5000);

        document.addEventListener("DOMContentLoaded", async () => {
          const savedData = localStorage.getItem(STORAGE_KEY);
          if (savedData) {
            const parsed = JSON.parse(savedData);
            if (parsed.date === new Date().toDateString()) {
                renderResult(parsed);
            } else {
                localStorage.removeItem(STORAGE_KEY);
            }
          }
        });
      </script>
    </body>
    </html>
  `)
})

export const GET = app.fetch
export const POST = app.fetch
