import { Frog } from 'frog'

export const config = { runtime: 'edge' }

export const app = new Frog({
  basePath: '/',
  title: 'Neon Oracle',
})

// 🔧 修改点：直接把网址写死，确保万无一失
const SITE_URL = "https://neon-oracle.vercel.app";

app.hono.get('/.well-known/farcaster.json', (c) => {
  return c.json({
    "frame": {
      "version": "1",
      "name": "Neon Oracle",
      "iconUrl": `${SITE_URL}/icon.png`, 
      "homeUrl": SITE_URL,
      "imageUrl": `${SITE_URL}/image.png`, 
      "splashImageUrl": `${SITE_URL}/splash.png`, 
      "splashBackgroundColor": "#050505",
      "webhookUrl": `${SITE_URL}/api/webhook`,
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
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0"> 
      
      <meta property="og:title" content="Neon Oracle">
      <meta property="og:image" content="${SITE_URL}/image.png?v=4">
      
      <meta property="fc:frame" content="vNext">
      <meta property="fc:frame:image" content="${SITE_URL}/image.png?v=4">
      <meta property="fc:frame:button:1" content="🔮 Reveal & Check-In">
      <meta property="fc:frame:button:1:action" content="link">
      <meta property="fc:frame:button:1:target" content="${SITE_URL}">

      <title>Neon Oracle</title>
      <style>
        :root { --bg-color: #050505; --neon-cyan: #00f3ff; --neon-pink: #bc13fe; --neon-gold: #ffd700; }
        body { margin: 0; font-family: 'Courier New', Courier, monospace; background-color: var(--bg-color); color: white; display: flex; flex-direction: column; align-items: center; min-height: 100vh; overflow: hidden; }
        .grid-bg { position: fixed; top: 0; left: 0; width: 200%; height: 200%; background-image: linear-gradient(rgba(0, 243, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 243, 255, 0.1) 1px, transparent 1px); background-size: 40px 40px; transform: perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px); z-index: -1; animation: grid-move 20s linear infinite; }
        @keyframes grid-move { 0% { transform: perspective(500px) rotateX(60deg) translateY(0) translateZ(-200px); } 100% { transform: perspective(500px) rotateX(60deg) translateY(40px) translateZ(-200px); } }
        .container { width: 90%; max-width: 380px; text-align: center; position: relative; z-index: 10; display: flex; flex-direction: column; align-items: center; padding-top: 20px; }
        .stats-bar {
            display: flex;
            justify-content: space-between;
            width: 100%;
            background: rgba(255, 255, 255, 0.1);
            padding: 10px 15px;
            border-radius: 12px;
            margin-bottom: 20px;
            box-sizing: border-box;
            border: 1px solid #333;
        }
        .stat-item { display: flex; flex-direction: column; align-items: center; }
        .stat-label { font-size: 0.7rem; color: #aaa; text-transform: uppercase; }
        .stat-value { font-size: 1.2rem; font-weight: bold; color: var(--neon-gold); text-shadow: 0 0 5px var(--neon-gold); }
        h1 { font-size: 2.2rem; margin: 10px 0; text-shadow: 0 0 10px var(--neon-cyan); letter-spacing: 2px; }
        .oracle-display { width: 180px; height: 180px; margin: 20px auto; border-radius: 50%; background: radial-gradient(circle, #222, #000); border: 2px solid var(--neon-pink); box-shadow: 0 0 20px var(--neon-pink), inset 0 0 30px var(--neon-pink); display: flex; flex-direction: column; align-items: center; justify-content: center; transition: all 0.5s ease; position: relative; }
        .oracle-display.active { box-shadow: 0 0 50px var(--neon-cyan), inset 0 0 50px var(--neon-cyan); border-color: var(--neon-cyan); transform: scale(1.05); }
        .score-text { font-size: 3.5rem; font-weight: bold; margin: 0; opacity: 0; transition: opacity 0.5s; }
        .predict-text { font-size: 0.9rem; color: var(--neon-cyan); margin-top: 5px; opacity: 0; text-transform: uppercase; }
        .visible { opacity: 1 !important; }
        .reward-popup {
            position: absolute;
            top: 40%;
            font-size: 1.5rem;
            color: var(--neon-gold);
            font-weight: bold;
            opacity: 0;
            transform: translateY(0);
            pointer-events: none;
        }
        .reward-popup.animate { animation: floatUp 1.5s ease-out forwards; }
        @keyframes floatUp { 0% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(-50px); } }
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
        <div class="stats-bar">
            <div class="stat-item">
                <div class="stat-label">Total Points</div>
                <div class="stat-value" id="total-points">0</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Day Streak</div>
                <div class="stat-value" id="day-streak">1</div>
            </div>
        </div>
        <h1>NEON ORACLE</h1>
        <p style="color: #aaa; font-size: 0.9rem;">Check-in daily for bonus points!</p>
        <div class="oracle-display" id="oracle-ball">
          <div class="score-text" id="score">?</div>
          <div class="predict-text" id="keywords">WAITING...</div>
        </div>
        <div id="reward-popup" class="reward-popup"></div>
        <button class="btn btn-predict" id="predict-btn">REVEAL DESTINY</button>
        <button class="btn btn-share" id="share-btn">SHARE RESULT</button>
        <a href="https://twitter.com/biboombii" target="_blank" class="btn-twitter">@biboombii</a>
      </div>

      <script type="module">
        import { sdk } from 'https://esm.sh/@farcaster/frame-sdk';

        const WORDS = ["BULLISH", "MOON", "HODL", "DUMP", "DEGEN", "WAGMI", "REKT", "ALPHA", "PEPE", "WHALE"];
        const STORAGE_KEY = 'neon_oracle_v2_stats'; 
        const REWARDS = [1, 2, 5, 6, 8, 10, 12, 15, 18, 20];
        const SITE_URL = "https://neon-oracle.vercel.app"; // JS 里也用这个写死的地址

        let gameState = { points: 0, streak: 0, lastCheckInDate: "", todayLuck: null, todayWord: null };

        function loadGame() {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) { gameState = JSON.parse(saved); }
            updateStatsUI();
            if (gameState.lastCheckInDate === new Date().toDateString()) { showAlreadyPlayedUI(); }
        }

        function updateStatsUI() {
            document.getElementById('total-points').innerText = gameState.points;
            document.getElementById('day-streak').innerText = gameState.streak + " Days";
        }

        function handleCheckIn() {
            const today = new Date().toDateString();
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toDateString();
            let earnedPoints = 0;
            if (gameState.lastCheckInDate === yesterdayStr) { gameState.streak += 1; } else { gameState.streak = 1; }
            if (gameState.streak > 10) { gameState.streak = 1; }
            earnedPoints = REWARDS[gameState.streak - 1] || 1; 
            gameState.points += earnedPoints;
            gameState.lastCheckInDate = today;
            showRewardAnim(earnedPoints);
        }

        function showRewardAnim(amount) {
            const popup = document.getElementById('reward-popup');
            popup.innerText = "+" + amount + " PTS!";
            popup.classList.add('animate');
            setTimeout(() => popup.classList.remove('animate'), 2000);
        }

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
            handleCheckIn();
            const score = Math.floor(Math.random() * 100);
            const word = WORDS[Math.floor(Math.random() * WORDS.length)];
            gameState.todayLuck = score;
            gameState.todayWord = word;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
            renderResult(score, word);
            updateStatsUI();
          }, 2000);
        }

        function renderResult(score, word) {
          document.getElementById('score').innerText = score;
          document.getElementById('keywords').innerText = word;
          document.getElementById('score').classList.add('visible');
          document.getElementById('keywords').classList.add('visible');
          document.getElementById('oracle-ball').classList.add('active');
          showAlreadyPlayedUI();
        }

        function showAlreadyPlayedUI() {
            const predictBtn = document.getElementById('predict-btn');
            predictBtn.innerText = "COME BACK TOMORROW";
            predictBtn.disabled = true;
            predictBtn.style.display = "none"; 
            const shareBtn = document.getElementById('share-btn');
            shareBtn.style.display = "block"; 
            if(gameState.todayLuck) {
                 document.getElementById('score').innerText = gameState.todayLuck;
                 document.getElementById('keywords').innerText = gameState.todayWord;
                 document.getElementById('score').classList.add('visible');
                 document.getElementById('keywords').classList.add('visible');
                 document.getElementById('oracle-ball').classList.add('active');
            }
        }

        function shareDestiny() {
           const text = \`🔮 NEON ORACLE 🔮\\n\\n🔥 Streak: \${gameState.streak} Days\\n🏆 Points: \${gameState.points}\\n✨ Luck: \${gameState.todayLuck}/100\\n🚀 Mood: \${gameState.todayWord}\\n\\nReveal yours 👇\`;
           const embedUrl = SITE_URL; 
           sdk.actions.openUrl(\`https://warpcast.com/~/compose?text=\${encodeURIComponent(text)}&embeds[]=\${encodeURIComponent(embedUrl)}\`);
        }

        document.getElementById('predict-btn').addEventListener('click', revealDestiny);
        document.getElementById('share-btn').addEventListener('click', shareDestiny);

        loadGame(); 

        const checkReady = setInterval(() => {
            if (sdk && sdk.actions) {
                sdk.actions.ready();
                clearInterval(checkReady);
            }
        }, 100);
        setTimeout(() => { if (sdk && sdk.actions) sdk.actions.ready(); }, 3000);
      </script>
    </body>
    </html>
  `)
})

export const GET = app.fetch
export const POST = app.fetch
