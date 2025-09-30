const screens = {
    home: document.getElementById('screen-home'),
    game: document.getElementById('screen-game'),
    finish: document.getElementById('screen-finish')
  };
  const btnPlay = document.getElementById('btn-play');
  const btnExit = document.getElementById('btn-exit');
  const btnExit2 = document.getElementById('btn-exit-2');
  
  const btnHint = document.getElementById('btn-hint');
  const btnReplay = document.getElementById('btn-replay');
  const scoreEl = document.getElementById('score');
  const progressBar = document.getElementById('progress-bar');
  const questionText = document.getElementById('question-text');
  const answersEl = document.getElementById('answers');
  const freeform = document.getElementById('freeform');
  const answerInput = document.getElementById('answer-input');
  const submitInput = document.getElementById('submit-input');
  const finalSummary = document.getElementById('final-summary');
  const hintBox = document.getElementById('hint-box');

  const overlay = document.getElementById('overlay');
  const scareVideo = document.getElementById('scare-video');
  const scareFallback = document.getElementById('scare-fallback');
  const deviceGuard = document.getElementById('device-guard');
  
  // Chicken feeding interface
  let chickenFeedingInterface = null;
  let chickenToggleButton = null;

 
  const fixedQuestions = [
    { type: 'in', q: 'What is your name?', a: '', special: 'name-input' },
    { type: 'in', q: '1. justin?', a: 'nabunturan' },
    { type: 'in', q: '2. full name of justin?', a: 'justin morales mosqueda' },
    { type: 'hatch', q: '3. Wait for the egg to hatch!', a: '', special: 'hatch-game' },
    { type: 'mc', q: 'inheat man gud si justin diba?', options: ['yes', 'no'], a: 0, special: 'hatch-followup' },
    { type: 'in', q: '4. famous justin mosqueda\'s name sa super fam gc?', a: 'justin nabunturan' },
    { type: 'guessing', q: '5. Guess a number from 1 to 100!', a: '', special: 'number-guessing-game' },
    { type: 'memory', q: '6. Follow the glowing sequence!', a: '', special: 'memory-sequence-game' },
    { type: 'mc', q: '7. Unsay tawag sa justin na kalibangon?', options: ['inheat', 'kaguniton sa bunal', 'justinalibang', 'jacob solomon'], a: 0, special: 'shuffling-mc' },
    { type: 'video', q: '8. Watch the video till the end! :D', a: '', special: 'video-watch' },
    { type: 'in', q: '9. What did you learn from the video?', a: ['badbad uno', 'badbad dos', 'badbad tres', 'badbad kuatro'], special: 'video-answer' },
    { type: 'video', q: '10. name ng ex ni justin?', a: 'jenny', special: 'video-watch-edited' },
    { type: 'in', q: '11. Gigamit ni justin sa pag attempt ug suicide?', a: 'bakos' },
    { type: 'in', q: '12. another term for nabunturan?', a: 'nabuntagan' },
    { type: 'mc', q: '13. Unsay tawag sa gihimo ni jacob na school para kay justin?', options: ['justin nabunturan college of davao', 'justin nabuntagan college of davao', 'justin nabuntugan college of manila', 'justin morales college of nabunturan'], a: 1 },
    { type: 'mc', q: '14. unsay reaction ni justin pag makita si kuya jacob?', options: ['uy marcelita', 'uy naa si kuya!', 'bakos'], a: 0 },
    { type: 'redirect', q: '15. Final Challenge!', a: '', special: 'redirect-to-goodluck' },
  ];

  function shuffle(list) { return list.slice(); }

  const game = {
    questions: fixedQuestions,
    index: 0,
    score: 0,
    answered: false,
    hintUsed: false,
    userName: '',
    fireGameActive: false,
    captchaGameActive: false,
    memoryGameActive: false,
    videoWatchActive: false,
    guessingGameActive: false,
    captchaBoxes: [],
    fireText: '',
  };

  function showScreen(name) {
    Object.values(screens).forEach(el => el.classList.add('hidden'));
    screens[name].classList.remove('hidden');
  }

  function startGame() {
    // Clear any existing chicken feeding interface
    if (chickenFeedingInterface) {
      chickenFeedingInterface.remove();
      chickenFeedingInterface = null;
    }
    if (chickenToggleButton) {
      chickenToggleButton.remove();
      chickenToggleButton = null;
    }
    
    game.questions = fixedQuestions;
    game.index = 0;
    game.score = 0;
    game.userName = '';
    game.hatchGameActive = false;
    game.captchaGameActive = false;
    game.memoryGameActive = false;
    game.videoWatchActive = false;
    game.guessingGameActive = false;
    game.captchaBoxes = [];
    game.hatchTime = 0;
    game.chickenFeedTime = 30;
    game.maxFeedTime = 40;
    scoreEl.textContent = '0';
    game.hintUsed = false;
    btnHint.disabled = false;
    btnHint.textContent = 'Hint (1 left)';
    updateProgress();
    renderQuestion();
    showScreen('game');
  }

  function updateProgress() {
    const pct = game.questions.length ? (game.index / game.questions.length) * 100 : 0;
    progressBar.style.width = pct + '%';
  }

  function normalize(str) {
    return String(str).trim().toLowerCase();
  }

  function clearAnswers() {
    answersEl.innerHTML = '';
    freeform.classList.add('hidden');
    hintBox.classList.add('hidden');
    hintBox.textContent = '';
    game.answered = false;
  }

  function renderQuestion() {
    clearAnswers();
    const q = game.questions[game.index];
    if (!q) return finishGame();
    questionText.textContent = q.q;
    
    if (q.type === 'mc') {
      if (q.special === 'shuffling-mc') {
        startShufflingMC();
      } else {
      q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'btn answer-btn';
        btn.textContent = opt;
        btn.addEventListener('click', () => onAnswer(idx === q.a, btn));
        answersEl.appendChild(btn);
      });
      }
    } else if (q.type === 'hatch') {
      startHatchGame();
    } else if (q.type === 'captcha') {
      startCaptchaGame();
    } else if (q.type === 'memory') {
      startMemorySequenceGame();
    } else if (q.type === 'video') {
      if (q.special === 'video-watch-edited') {
        startVideoWatchEdited();
      } else {
        startVideoWatch();
      }
    } else if (q.type === 'guessing') {
      startNumberGuessingGame();
    } else if (q.type === 'redirect') {
      redirectToGoodluck();
    } else {
      freeform.classList.remove('hidden');
      answerInput.value = '';
      answerInput.focus();
    }
  }

  function onAnswer(correct, clickedBtn) {
    if (game.answered) return;
    game.answered = true;
    const q = game.questions[game.index];
    
    if (q.special === 'name-input') {
      game.userName = answerInput.value.trim();
      if (game.userName) {
        game.score += 1;
        scoreEl.textContent = String(game.score);
        setTimeout(() => { nextQuestion(); }, 500);
        return; // Exit early to prevent further processing
      } else {
        game.answered = false;
        return;
      }
    } else if (q.special === 'hatch-followup' && clickedBtn) {
      if (!correct) {
        showCorrectThenScareThenHome();
        return;
      }
    }
    
    if (q.type === 'mc') {
      const buttons = Array.from(document.querySelectorAll('.answer-btn'));
      buttons.forEach((b, i) => {
        if (i === q.a) b.classList.add('correct');
      });
      if (clickedBtn && !correct) clickedBtn.classList.add('wrong');
    }
    
    if (correct) {
      game.score += 1;
      scoreEl.textContent = String(game.score);
      setTimeout(() => { nextQuestion(); }, 500);
    } else {
      showCorrectThenScareThenHome();
    }
  }

  function submitFreeform() {
    const q = game.questions[game.index];
    if (!q || q.type !== 'in') return;
    
    if (q.special === 'name-input') {
      onAnswer(true, null); // Always correct for name input
    } else if (q.special === 'video-answer') {
      // Check if answer matches any of the valid video answers (array)
      const userAnswer = normalize(answerInput.value);
      const isCorrect = q.a.some(answer => normalize(answer) === userAnswer);
      onAnswer(isCorrect, null);
    } else {
      const ok = normalize(answerInput.value) === normalize(q.a);
      onAnswer(ok, null);
    }
  }

  function nextQuestion() {
    if (!game.answered) return;
    game.index += 1;
    updateProgress();
    if (game.index >= game.questions.length) return finishGame();
    renderQuestion();
  }

async function finishGame() {
  progressBar.style.width = '100%';
  finalSummary.textContent = `You scored ${game.score} / ${game.questions.length}.`;
  showScreen('finish');
  
  // Remove chicken feeding interface when game finishes
  if (chickenFeedingInterface) {
    chickenFeedingInterface.remove();
    chickenFeedingInterface = null;
  }
  if (chickenToggleButton) {
    chickenToggleButton.remove();
    chickenToggleButton = null;
  }
  
  if (game.score === game.questions.length) {
    await playSpecificJumpscare('justinCongrats.mp4');
    showCertificate();
  } else {
    await new Promise(r => setTimeout(r, 1200));
  }
  resetToStart();
}

  function playfulNudge(text) {
    const el = document.createElement('div');
    el.textContent = text;
    el.style.padding = '10px 12px';
    el.style.border = '1px dashed var(--border)';
    el.style.borderRadius = '10px';
    el.style.color = 'var(--danger)';
    el.style.background = '#fff1f2';
    answersEl.appendChild(el);
  }

function showCorrectThenScareThenHome() {
    const q = game.questions[game.index];
    const correctText = q.type === 'mc' ? (q.options[q.a]) : q.a;
    playfulNudge('Correct answer: ' + correctText);
    
    // Remove chicken feeding interface if it exists
    if (chickenFeedingInterface) {
      chickenFeedingInterface.remove();
      chickenFeedingInterface = null;
    }
    if (chickenToggleButton) {
      chickenToggleButton.remove();
      chickenToggleButton = null;
    }
    
    setTimeout(async () => {
      await playSpecificJumpscare('loservideo.mp4');
    showScreen('home');
    }, 700);
  }

async function playSpecificJumpscare(filename) {
  overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    const exists = await headOk(filename);
    if (exists) {
      scareFallback.classList.add('hidden');
      scareVideo.src = filename;
      scareVideo.currentTime = 0;
      scareVideo.muted = false;
      scareVideo.volume = 1.0;
    let played = false;
    try {
      await scareVideo.play();
      played = true;
    } catch (_) {
      played = false;
    }
    if (played) {

      await new Promise((resolve) => {
        const onEnded = () => {
          cleanup();
          resolve();
        };
        const cleanup = () => {
          scareVideo.removeEventListener('ended', onEnded);
        };
        scareVideo.addEventListener('ended', onEnded, { once: true });
        const durationMs = isFinite(scareVideo.duration) && scareVideo.duration > 0 ? (scareVideo.duration * 1000) : 6000;
        setTimeout(() => {
          cleanup();
          resolve();
        }, durationMs + 300);
      });
    } else {
    
      await new Promise(r => setTimeout(r, 1800));
    }
    } else {
      scareVideo.removeAttribute('src');
      scareFallback.classList.remove('hidden');
      scareFallback.src = fallbackImageData();
      flashAndScream();
    await new Promise(r => setTimeout(r, 1800));
    }
  overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  function headOk(url) {
    return fetch(url, { method: 'HEAD' }).then(r => r.ok).catch(() => false);
  }

  function resetToStart() {
    game.index = 0;
    game.score = 0;
    scoreEl.textContent = '0';
    updateProgress();
    renderQuestion();
    showScreen('game');
  }

  // Jumpscare flow
  async function triggerJumpscareAndExit() {
    // Remove chicken feeding interface if it exists
    if (chickenFeedingInterface) {
      chickenFeedingInterface.remove();
      chickenFeedingInterface = null;
    }
    if (chickenToggleButton) {
      chickenToggleButton.remove();
      chickenToggleButton = null;
    }
    
    try {
    await playSpecificJumpscare('loservideo.mp4');
    } catch (_) {

    }
    setTimeout(() => {
      location.href = 'https://www.google.com';
    }, 3500);
  }

async function playJumpscare() {
  overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    const source = await resolveJumpscareSource();
    if (source.kind === 'video') {
      scareFallback.classList.add('hidden');
      scareVideo.src = source.url;
      scareVideo.currentTime = 0;
      scareVideo.muted = false;
      scareVideo.volume = 1.0;
      try { await scareVideo.play(); } catch (_) {}
    } else {
      scareVideo.removeAttribute('src');
      scareFallback.classList.remove('hidden');
      scareFallback.src = source.url;
      flashAndScream();
    }
  }

  function resolveJumpscareSource() {
 
    return new Promise((resolve) => {
      const testUrl = 'jumpscare.mp4';
      fetch(testUrl, { method: 'HEAD' })
        .then(res => {
          if (res.ok) resolve({ kind: 'video', url: testUrl });
          else resolve({ kind: 'image', url: fallbackImageData() });
        })
        .catch(() => resolve({ kind: 'image', url: fallbackImageData() }));
    });
  }

  function fallbackImageData() {

    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';
  }

function flashAndScream() {
    let flashes = 0;
    const maxFlashes = 18;
    const interval = setInterval(() => {
      overlay.style.background = flashes % 2 === 0 ? '#fff' : '#000';
      flashes++;
      if (flashes > maxFlashes) {
        clearInterval(interval);
        overlay.style.background = '#000';
      }
    }, 80);
    try { synthScream(); } catch (_) {}
  }

  function synthScream() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.9, ctx.currentTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1.3);
  }

  // Device guard: block desktop/wide screens
  function isMobileLike() {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const narrow = Math.min(window.innerWidth, window.innerHeight) <= 480;
    return isTouch && narrow;
  }

  function updateDeviceGuard() {
    if (!deviceGuard) return;
    if (isMobileLike()) deviceGuard.classList.remove('active');
    else deviceGuard.classList.add('active');
  }

  updateDeviceGuard();
  window.addEventListener('resize', updateDeviceGuard);

  // Hatch Game
  function startHatchGame() {
    game.hatchGameActive = true;
    game.hatchTime = 0;
    game.chickenFeedTime = 30;
    game.maxFeedTime = 40;
    
    const hatchContainer = document.createElement('div');
    hatchContainer.id = 'hatch-container';
    hatchContainer.style.cssText = `
      padding: 20px;
      border: 2px solid #ffa500;
      border-radius: 10px;
      background: #fff8e1;
      margin: 10px 0;
      text-align: center;
    `;
    
    const eggDisplay = document.createElement('div');
    eggDisplay.id = 'egg-display';
    eggDisplay.style.cssText = `
      font-size: 48px;
      margin: 20px 0;
      min-height: 60px;
    `;
    eggDisplay.textContent = '🥚';
    
    const hatchProgress = document.createElement('div');
    hatchProgress.id = 'hatch-progress';
    hatchProgress.style.cssText = `
      margin: 10px 0;
      font-weight: bold;
      color: #333;
    `;
    hatchProgress.textContent = 'Hatching... 0/15 seconds';
    
    hatchContainer.appendChild(eggDisplay);
    hatchContainer.appendChild(hatchProgress);
    answersEl.appendChild(hatchContainer);
    
    // Hatching timer
    const hatchInterval = setInterval(() => {
      game.hatchTime++;
      hatchProgress.textContent = `Hatching... ${game.hatchTime}/15 seconds`;
      
      if (game.hatchTime >= 15) {
        clearInterval(hatchInterval);
        // Egg hatched!
        eggDisplay.textContent = '🐔';
        hatchProgress.textContent = 'Hatched! Justinamanok is ready!';
        
        // Show chicken feeding interface at bottom
        showChickenFeedingInterface();
        
        // Jump directly to level 4 when egg hatches
        setTimeout(() => {
          game.hatchGameActive = false;
          game.score += 1;
          scoreEl.textContent = String(game.score);
          // Jump to level 4 (question index 5)
          game.index = 5;
          renderQuestion();
        }, 2000);
      }
    }, 1000);
  }
  
  // Show chicken feeding interface at bottom
  function showChickenFeedingInterface() {
    if (chickenFeedingInterface) {
      chickenFeedingInterface.remove();
    }
    
    chickenFeedingInterface = document.createElement('div');
    chickenFeedingInterface.id = 'chicken-feeding-interface';
    chickenFeedingInterface.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: #f1f8e9;
      border-top: 3px solid #4CAF50;
      padding: 15px;
      z-index: 1000;
      box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
    `;
    
    const chickenHeader = document.createElement('div');
    chickenHeader.style.cssText = `
      text-align: center;
      margin-bottom: 10px;
    `;
    
    const chickenTitle = document.createElement('div');
    chickenTitle.style.cssText = `
      font-size: 18px;
      font-weight: bold;
      color: #8b4513;
      margin-bottom: 5px;
    `;
    chickenTitle.textContent = '🐔 Justinamanok needs feeding!';
    
    const feedControls = document.createElement('div');
    feedControls.style.cssText = `
      display: flex;
      gap: 10px;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
    `;
    
    const feedInput = document.createElement('input');
    feedInput.type = 'text';
    feedInput.placeholder = 'Type "feed" to feed the chicken!';
    feedInput.style.cssText = `
      flex: 1;
      min-width: 200px;
      padding: 8px 12px;
      border: 1px solid #ccc;
      border-radius: 5px;
      font-size: 14px;
    `;
    
    const feedSubmit = document.createElement('button');
    feedSubmit.textContent = 'Feed Chicken';
    feedSubmit.className = 'btn btn-primary';
    feedSubmit.style.cssText = `
      padding: 8px 16px;
      font-size: 14px;
    `;
    
    const feedTimeDisplay = document.createElement('div');
    feedTimeDisplay.id = 'feed-time';
    feedTimeDisplay.style.cssText = `
      font-size: 14px;
      color: #2e7d32;
      font-weight: bold;
      margin: 0 10px;
    `;
    feedTimeDisplay.textContent = 'Feed time: 30 seconds';
    
    const feedLimitDisplay = document.createElement('div');
    feedLimitDisplay.id = 'feed-limit';
    feedLimitDisplay.style.cssText = `
      font-size: 12px;
      color: #2e7d32;
      font-weight: bold;
      margin: 0 10px;
    `;
    feedLimitDisplay.textContent = 'Max: 40s';
    
    const toggleButton = document.createElement('button');
    toggleButton.textContent = 'Hide';
    toggleButton.className = 'btn';
    toggleButton.style.cssText = `
      padding: 6px 12px;
      font-size: 12px;
      background: #6b7280;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin: 0 5px;
    `;
    
    chickenHeader.appendChild(chickenTitle);
    feedControls.appendChild(feedInput);
    feedControls.appendChild(feedSubmit);
    feedControls.appendChild(feedTimeDisplay);
    feedControls.appendChild(feedLimitDisplay);
    feedControls.appendChild(toggleButton);
    
    chickenFeedingInterface.appendChild(chickenHeader);
    chickenFeedingInterface.appendChild(feedControls);
    document.body.appendChild(chickenFeedingInterface);
    
    // Start feeding timer
    startFeedingTimer(feedTimeDisplay);
    
    // Feed function
    const feedChicken = () => {
      const input = feedInput.value.toLowerCase().trim();
      
      if (input.includes('feed')) {
        // Add 10 seconds, but cap at maximum of 40 seconds
        game.chickenFeedTime = Math.min(game.chickenFeedTime + 10, game.maxFeedTime);
          feedInput.value = '';
      }
    };
    
    // Feed button click
    feedSubmit.addEventListener('click', feedChicken);
    
    // Enter key
    feedInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        feedChicken();
      }
    });
    
    // Toggle button functionality
    let isHidden = false;
    toggleButton.addEventListener('click', () => {
      if (isHidden) {
        // Show the interface
        chickenFeedingInterface.style.display = 'block';
        toggleButton.textContent = 'Confirm hide? :3';
        toggleButton.style.background = '#6b7280';
        // Remove the floating chicken button
        if (chickenToggleButton) {
          chickenToggleButton.remove();
          chickenToggleButton = null;
        }
        isHidden = false;
      } else {
        // Hide the interface
        chickenFeedingInterface.style.display = 'none';
        toggleButton.textContent = 'Hide?';
        toggleButton.style.background = '#10b981';
        // Create floating chicken button
        createFloatingChickenButton();
        isHidden = true;
      }
    });
  }
  
  function startFeedingTimer(feedTimeDisplay) {
    const feedInterval = setInterval(() => {
      game.chickenFeedTime--;
      feedTimeDisplay.textContent = `Feed time: ${game.chickenFeedTime} seconds`;
      
      if (game.chickenFeedTime <= 0) {
        clearInterval(feedInterval);
        // Time's up, user loses
        if (chickenFeedingInterface) {
          chickenFeedingInterface.remove();
          chickenFeedingInterface = null;
        }
        if (chickenToggleButton) {
          chickenToggleButton.remove();
          chickenToggleButton = null;
        }
        // User loses - play jumpscare and reset to level 1
        setTimeout(async () => {
          await playSpecificJumpscare('loservideo.mp4');
          // Reset to level 1 (question index 1)
          game.index = 1;
          renderQuestion();
        }, 1000);
      }
    }, 1000);
  }
  
  // Create floating chicken button
  function createFloatingChickenButton() {
    if (chickenToggleButton) {
      chickenToggleButton.remove();
    }
    
    chickenToggleButton = document.createElement('button');
    chickenToggleButton.innerHTML = '🐔';
    chickenToggleButton.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: #4CAF50;
      border: 2px solid #2e7d32;
      font-size: 24px;
      cursor: pointer;
      z-index: 1001;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      transition: transform 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    `;
    
    chickenToggleButton.addEventListener('mouseover', () => {
      chickenToggleButton.style.transform = 'scale(1.1)';
    });
    
    chickenToggleButton.addEventListener('mouseout', () => {
      chickenToggleButton.style.transform = 'scale(1)';
    });
    
    chickenToggleButton.addEventListener('click', () => {
      // Show the interface
      chickenFeedingInterface.style.display = 'block';
      // Remove the floating button
      chickenToggleButton.remove();
      chickenToggleButton = null;
    });
    
    document.body.appendChild(chickenToggleButton);
  }

  // Memory Sequence Game
  function startMemorySequenceGame() {
    game.memoryGameActive = true;
    
    const memoryContainer = document.createElement('div');
    memoryContainer.id = 'memory-container';
    memoryContainer.style.cssText = `
      padding: 20px;
      border: 2px solid #8B5CF6;
      border-radius: 10px;
      background: #f3f0ff;
      margin: 10px 0;
      text-align: center;
    `;
    
    const instruction = document.createElement('p');
    instruction.id = 'memory-instruction';
    instruction.textContent = 'Watch the sequence and repeat it!';
    instruction.style.cssText = `
      margin: 10px 0;
      font-weight: bold;
      color: #333;
      font-size: 18px;
    `;
    
    const statusText = document.createElement('p');
    statusText.id = 'memory-status';
    statusText.textContent = 'Round 1 of 8 - Watch the sequence...';
    statusText.style.cssText = `
      margin: 10px 0;
      color: #666;
      font-size: 16px;
    `;
    
    const grid = document.createElement('div');
    grid.id = 'memory-grid';
    grid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin: 20px auto;
      max-width: 300px;
    `;
    
    // Create 9 tiles (3x3 grid)
    const tiles = [];
    for (let i = 0; i < 9; i++) {
      const tile = document.createElement('div');
      tile.className = 'memory-tile';
      tile.dataset.index = i;
      tile.style.cssText = `
        width: 80px;
        height: 80px;
        border: 2px solid #8B5CF6;
        border-radius: 10px;
        background: #fff;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        font-weight: bold;
        transition: all 0.3s ease;
        user-select: none;
      `;
      tile.textContent = i + 1;
      tiles.push(tile);
      grid.appendChild(tile);
    }
    
    memoryContainer.appendChild(instruction);
    memoryContainer.appendChild(statusText);
    memoryContainer.appendChild(grid);
    answersEl.appendChild(memoryContainer);
    
    // Game state
    let currentSequence = [];
    let playerSequence = [];
    let currentRound = 1;
    let isShowingSequence = false;
    let isPlayerTurn = false;
    let maxRounds = 8;
    
    // Generate random sequence
    function generateSequence() {
      currentSequence = [];
      for (let i = 0; i < currentRound; i++) {
        currentSequence.push(Math.floor(Math.random() * 9));
      }
    }
    
    // Show the sequence to player
    function showSequence() {
      isShowingSequence = true;
      isPlayerTurn = false;
      statusText.textContent = `Round ${currentRound} of ${maxRounds} - Watch the sequence...`;
      
      let index = 0;
      const showNext = () => {
        if (index < currentSequence.length) {
          const tileIndex = currentSequence[index];
          const tile = tiles[tileIndex];
          
          // Glow the tile
          tile.style.background = '#8B5CF6';
          tile.style.color = '#fff';
          tile.style.transform = 'scale(1.1)';
          tile.style.boxShadow = '0 0 20px #8B5CF6';
          
          setTimeout(() => {
            // Remove glow
            tile.style.background = '#fff';
            tile.style.color = '#333';
            tile.style.transform = 'scale(1)';
            tile.style.boxShadow = 'none';
            index++;
            setTimeout(showNext, 300);
          }, 600);
        } else {
          // Sequence finished, now player's turn
          isShowingSequence = false;
          isPlayerTurn = true;
          playerSequence = [];
          statusText.textContent = `Round ${currentRound} of ${maxRounds} - Your turn! Click the tiles in order.`;
        }
      };
      
      showNext();
    }
    
    // Handle tile click
    function handleTileClick(tileIndex) {
      if (!isPlayerTurn || isShowingSequence) return;
      
      const tile = tiles[tileIndex];
      playerSequence.push(tileIndex);
      
      // Visual feedback
      tile.style.background = '#10B981';
      tile.style.color = '#fff';
      tile.style.transform = 'scale(1.1)';
      
      setTimeout(() => {
        tile.style.background = '#fff';
        tile.style.color = '#333';
        tile.style.transform = 'scale(1)';
      }, 200);
      
      // Check if sequence is correct so far
      const isCorrect = playerSequence.every((clickedIndex, i) => 
        clickedIndex === currentSequence[i]
      );
      
      if (!isCorrect) {
        // Wrong sequence - game over
            gameOver();
        return;
      }
      
      // Check if round is complete
      if (playerSequence.length === currentSequence.length) {
        if (currentRound >= maxRounds) {
          // Game completed successfully
            winGame();
        } else {
          // Move to next round
          currentRound++;
          setTimeout(() => {
            generateSequence();
            showSequence();
          }, 1000);
        }
      }
    }
    
    // Add click listeners to tiles
    tiles.forEach((tile, index) => {
      tile.addEventListener('click', () => handleTileClick(index));
    });
    
    // Game over function
    function gameOver() {
      game.memoryGameActive = false;
      setTimeout(async () => {
        await playSpecificJumpscare('loservideo.mp4');
        // Reset to level 1 (question index 1)
        game.index = 1;
        renderQuestion();
      }, 1000);
    }
    
    // Win game function
    function winGame() {
      game.memoryGameActive = false;
      game.answered = true;
      game.score += 1;
      scoreEl.textContent = String(game.score);
      statusText.textContent = 'Congratulations! You completed all 5 rounds!';
      setTimeout(() => {
        nextQuestion();
      }, 2000);
    }
    
    // Start the game
    generateSequence();
    showSequence();
  }

  // Shuffling Multiple Choice Game
  function startShufflingMC() {
    const q = game.questions[game.index];
    let shuffledOptions = [...q.options];
    let correctAnswerIndex = q.a;
    let shuffleInterval;
    
    function createButtons() {
      // Clear existing buttons
      answersEl.innerHTML = '';
      
      shuffledOptions.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'btn answer-btn';
        btn.textContent = opt;
        btn.addEventListener('click', () => {
          // Stop shuffling when answer is clicked
          clearInterval(shuffleInterval);
          onAnswer(idx === correctAnswerIndex, btn);
        });
        answersEl.appendChild(btn);
      });
    }
    
    function shuffleArray() {
      // Find where the correct answer currently is
      const currentCorrectIndex = shuffledOptions.findIndex(opt => opt === q.options[correctAnswerIndex]);
      
      // Shuffle the array
      for (let i = shuffledOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
      }
      
      // Update the correct answer index
      correctAnswerIndex = shuffledOptions.findIndex(opt => opt === q.options[q.a]);
      
      // Recreate buttons with new positions
      createButtons();
    }
    
    // Create initial buttons
    createButtons();
    
    // Start shuffling every 1 second
    shuffleInterval = setInterval(shuffleArray, 1000);
  }

  // Video Watch Game
  function startVideoWatch() {
    game.videoWatchActive = true;
    
    const videoContainer = document.createElement('div');
    videoContainer.id = 'video-container';
    videoContainer.style.cssText = `
      padding: 20px;
      border: 2px solid #FF6B6B;
      border-radius: 10px;
      background: #ffe8e8;
      margin: 10px 0;
      text-align: center;
    `;
    
    const video = document.createElement('video');
    video.src = 'badbaduno.mp4';
    video.controls = false;
    video.style.cssText = `
      width: 100%;
      max-width: 500px;
      height: auto;
      border-radius: 5px;
      margin: 10px 0;
      pointer-events: none;
    `;
    
    const instruction = document.createElement('p');
    instruction.textContent = 'Watch the video completely to proceed to the next question! (Video will play automatically)';
    instruction.style.cssText = `
      margin: 10px 0;
      font-weight: bold;
      color: #333;
    `;
    
    const progressText = document.createElement('p');
    progressText.id = 'video-progress';
    progressText.style.cssText = `
      margin: 10px 0;
      color: #666;
    `;
    progressText.textContent = 'Video not started yet';
    
    videoContainer.appendChild(instruction);
    videoContainer.appendChild(video);
    videoContainer.appendChild(progressText);
    answersEl.appendChild(videoContainer);
    
    video.addEventListener('timeupdate', () => {
      const progress = (video.currentTime / video.duration) * 100;
      progressText.textContent = `Progress: ${Math.round(progress)}%`;
    });
    
    // Prevent users from seeking/skipping the video
    video.addEventListener('seeked', () => {
      // Reset video to beginning if user tries to seek
      video.currentTime = 0;
    });
    
    video.addEventListener('seeking', () => {
      // Prevent seeking
      video.currentTime = 0;
    });
    
    video.addEventListener('ended', () => {
      game.videoWatchActive = false;
      game.answered = true;
      game.score += 1;
      scoreEl.textContent = String(game.score);
      progressText.textContent = 'Video completed! Proceeding to next question...';
      setTimeout(() => {
        nextQuestion();
      }, 1000);
    });
    
    // Auto-play the video
    video.play().catch(() => {
      progressText.textContent = 'Click play to start the video';
    });
  }

  function startVideoWatchEdited() {
    game.videoWatchActive = true;
    
    const videoContainer = document.createElement('div');
    videoContainer.id = 'video-container';
    videoContainer.style.cssText = `
      padding: 20px;
      border: 2px solid #FF6B6B;
      border-radius: 10px;
      background: #ffe8e8;
      margin: 10px 0;
      text-align: center;
    `;
    
    const instruction = document.createElement('p');
    instruction.textContent = 'Now watch the edited version:';
    instruction.style.cssText = `
      margin: 10px 0;
      font-weight: bold;
      color: #333;
      font-size: 18px;
    `;
    
    const video = document.createElement('video');
    video.src = 'justinCongrats.mp4';
    video.controls = false;
    video.style.cssText = `
      width: 100%;
      max-width: 500px;
      height: auto;
      border-radius: 5px;
      margin: 10px 0;
      pointer-events: none;
    `;
    
    const progressText = document.createElement('p');
    progressText.id = 'video-progress';
    progressText.style.cssText = `
      margin: 10px 0;
      color: #666;
    `;
    progressText.textContent = 'Video not started yet';
    
    videoContainer.appendChild(instruction);
    videoContainer.appendChild(video);
    videoContainer.appendChild(progressText);
    answersEl.appendChild(videoContainer);
    
    video.addEventListener('timeupdate', () => {
      const progress = (video.currentTime / video.duration) * 100;
      progressText.textContent = `Progress: ${Math.round(progress)}%`;
    });
    
    // Prevent users from seeking/skipping the video
    video.addEventListener('seeked', () => {
      // Reset video to beginning if user tries to seek
      video.currentTime = 0;
    });
    
    video.addEventListener('seeking', () => {
      // Prevent seeking
      video.currentTime = 0;
    });
    
    video.addEventListener('ended', () => {
      game.videoWatchActive = false;
      game.answered = true;
      game.score += 1;
      scoreEl.textContent = String(game.score);
      progressText.textContent = 'Video completed! Proceeding to next question...';
      setTimeout(() => {
        nextQuestion();
      }, 1000);
    });
    
    // Auto-play the video
    video.play().catch(() => {
      progressText.textContent = 'Click play to start the video';
    });
  }

  // Number Guessing Game
  function startNumberGuessingGame() {
    game.guessingGameActive = true;
    
    const guessingContainer = document.createElement('div');
    guessingContainer.id = 'guessing-container';
    guessingContainer.style.cssText = `
      padding: 20px;
      border: 2px solid #10B981;
      border-radius: 10px;
      background: #f0fdf4;
      margin: 10px 0;
      text-align: center;
    `;
    
    const instruction = document.createElement('p');
    instruction.textContent = 'Guess a number from 1 to 100! You have 10 guesses.';
    instruction.style.cssText = `
      margin: 10px 0;
      font-weight: bold;
      color: #333;
      font-size: 18px;
    `;
    
    const statusText = document.createElement('p');
    statusText.id = 'guessing-status';
    statusText.textContent = 'Enter your guess below!';
    statusText.style.cssText = `
      margin: 10px 0;
      color: #666;
      font-size: 16px;
    `;
    
    const guessInput = document.createElement('input');
    guessInput.type = 'number';
    guessInput.min = '1';
    guessInput.max = '100';
    guessInput.placeholder = 'Enter number (1-100)';
    guessInput.style.cssText = `
      width: 200px;
      padding: 10px;
      margin: 10px;
      border: 2px solid #10B981;
      border-radius: 5px;
      font-size: 16px;
      text-align: center;
    `;
    
    const guessButton = document.createElement('button');
    guessButton.textContent = 'Guess!';
    guessButton.className = 'btn btn-primary';
    guessButton.style.cssText = `
      padding: 10px 20px;
      font-size: 16px;
      margin: 10px;
    `;
    
    const guessesLeft = document.createElement('p');
    guessesLeft.id = 'guesses-left';
    guessesLeft.textContent = 'Guesses left: 10';
    guessesLeft.style.cssText = `
      margin: 10px 0;
      color: #10B981;
      font-weight: bold;
      font-size: 16px;
    `;
    
    guessingContainer.appendChild(instruction);
    guessingContainer.appendChild(statusText);
    guessingContainer.appendChild(guessInput);
    guessingContainer.appendChild(guessButton);
    guessingContainer.appendChild(guessesLeft);
    answersEl.appendChild(guessingContainer);
    
    // Game state
    const targetNumber = Math.floor(Math.random() * 100) + 1;
    let guessesRemaining = 10;
    let gameWon = false;
    
    // Update guesses display
    function updateGuessesDisplay() {
      guessesLeft.textContent = `Guesses left: ${guessesRemaining}`;
    }
    
    // Handle guess
    function handleGuess() {
      if (gameWon || guessesRemaining <= 0) return;
      
      const guess = parseInt(guessInput.value);
      
      if (isNaN(guess) || guess < 1 || guess > 100) {
        statusText.textContent = 'Please enter a valid number between 1 and 100!';
        statusText.style.color = '#ef4444';
        return;
      }
      
      guessesRemaining--;
      updateGuessesDisplay();
      
      if (guess === targetNumber) {
        // Correct guess - win!
        gameWon = true;
        statusText.textContent = `🎉 Correct! The number was ${targetNumber}!`;
        statusText.style.color = '#10B981';
        guessInput.disabled = true;
        guessButton.disabled = true;
        
        // Proceed to next question
        setTimeout(() => {
          game.guessingGameActive = false;
          game.answered = true;
          game.score += 1;
          scoreEl.textContent = String(game.score);
          nextQuestion();
        }, 2000);
        
      } else if (guessesRemaining <= 0) {
        // No more guesses - lose
        statusText.textContent = `Game Over! The number was ${targetNumber}.`;
        statusText.style.color = '#ef4444';
        guessInput.disabled = true;
        guessButton.disabled = true;
        
        // Play loser video and restart to level 1
        setTimeout(async () => {
          game.guessingGameActive = false;
          await playSpecificJumpscare('loservideo.mp4');
          // Reset to level 1 (question index 1)
          game.index = 1;
          renderQuestion();
        }, 2000);
        
      } else {
        // Wrong guess, give hint
        if (guess < targetNumber) {
          statusText.textContent = `Too low! Try a higher number.`;
        } else {
          statusText.textContent = `Too high! Try a lower number.`;
        }
        statusText.style.color = '#f59e0b';
        guessInput.value = '';
        guessInput.focus();
      }
    }
    
    // Event listeners
    guessButton.addEventListener('click', handleGuess);
    guessInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        handleGuess();
      }
    });
    
    // Focus on input
    guessInput.focus();
  }

  // Redirect to Good Luck page
  function redirectToGoodluck() {
    // Remove chicken feeding interface when reaching level 15
    if (chickenFeedingInterface) {
      chickenFeedingInterface.remove();
      chickenFeedingInterface = null;
    }
    if (chickenToggleButton) {
      chickenToggleButton.remove();
      chickenToggleButton = null;
    }
    
    // Redirect to goodluck.html with user name
    const userName = game.userName || 'Anonymous';
    window.location.href = `goodluck.html?name=${encodeURIComponent(userName)}`;
  }

  // Certificate Function
  function showCertificate() {
    const certificateContainer = document.createElement('div');
    certificateContainer.id = 'certificate-container';
    certificateContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10001;
    `;
    
    const certificate = document.createElement('div');
    certificate.style.cssText = `
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border: 8px solid #ffd700;
      border-radius: 20px;
      padding: 40px;
      max-width: 600px;
      width: 90%;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      position: relative;
    `;
    
    // Certificate header
    const header = document.createElement('div');
    header.style.cssText = `
      margin-bottom: 30px;
    `;
    
    const title = document.createElement('h1');
    title.textContent = 'CERTIFICATE OF COMPLETION';
    title.style.cssText = `
      font-size: 28px;
      font-weight: bold;
      color: #2c3e50;
      margin: 0 0 10px 0;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
    `;
    
    const subtitle = document.createElement('p');
    subtitle.textContent = 'Justin Challenge Mastery';
    subtitle.style.cssText = `
      font-size: 18px;
      color: #7f8c8d;
      margin: 0;
      font-style: italic;
    `;
    
    header.appendChild(title);
    header.appendChild(subtitle);
    
    // Certificate body
    const body = document.createElement('div');
    body.style.cssText = `
      margin: 30px 0;
    `;
    
    const awardedTo = document.createElement('p');
    awardedTo.textContent = 'This is to certify that';
    awardedTo.style.cssText = `
      font-size: 16px;
      color: #34495e;
      margin: 0 0 10px 0;
    `;
    
    const userName = document.createElement('h2');
    userName.textContent = game.userName || 'Anonymous';
    userName.style.cssText = `
      font-size: 32px;
      font-weight: bold;
      color: #e74c3c;
      margin: 0 0 20px 0;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
    `;
    
    const achievement = document.createElement('p');
    achievement.textContent = 'Congrats!!! nahuman nimo!!';
    achievement.style.cssText = `
      font-size: 16px;
      color: #2c3e50;
      line-height: 1.6;
      margin: 0 0 20px 0;
    `;
    
    const date = document.createElement('p');
    date.textContent = `Completed on: ${new Date().toLocaleDateString()}`;
    date.style.cssText = `
      font-size: 14px;
      color: #7f8c8d;
      margin: 0;
    `;
    
    body.appendChild(awardedTo);
    body.appendChild(userName);
    body.appendChild(achievement);
    body.appendChild(date);
    
    // Certificate footer
    const footer = document.createElement('div');
    footer.style.cssText = `
      margin-top: 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    
    const signature = document.createElement('div');
    signature.style.cssText = `
      text-align: center;
    `;
    
    const sigLine = document.createElement('div');
    sigLine.style.cssText = `
      border-top: 2px solid #34495e;
      width: 150px;
      margin: 0 auto 5px auto;
    `;
    
    const sigText = document.createElement('p');
    sigText.textContent = 'justin morales';
    sigText.style.cssText = `
      font-size: 14px;
      color: #2c3e50;
      margin: 0;
      font-weight: bold;
    `;
    
    signature.appendChild(sigLine);
    signature.appendChild(sigText);
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close Certificate';
    closeBtn.style.cssText = `
      background: linear-gradient(180deg, #8b5cf6, #7c3aed);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 25px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
      transition: transform 0.2s;
    `;
    
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(certificateContainer);
    });
    
    closeBtn.addEventListener('mouseover', () => {
      closeBtn.style.transform = 'translateY(-2px)';
    });
    
    closeBtn.addEventListener('mouseout', () => {
      closeBtn.style.transform = 'translateY(0)';
    });
    
    footer.appendChild(signature);
    footer.appendChild(closeBtn);
    
    // Assemble certificate
    certificate.appendChild(header);
    certificate.appendChild(body);
    certificate.appendChild(footer);
    certificateContainer.appendChild(certificate);
    
    // Add to page
    document.body.appendChild(certificateContainer);
    
    // Auto-close after 40 seconds
    setTimeout(() => {
      if (document.body.contains(certificateContainer)) {
        document.body.removeChild(certificateContainer);
      }
    }, 40000);
  }

  // Events
  btnPlay.addEventListener('click', () => {
    startGame();
  });
  btnExit.addEventListener('click', triggerJumpscareAndExit);
  if (btnExit2) btnExit2.addEventListener('click', triggerJumpscareAndExit);
  
  
  btnReplay.addEventListener('click', () => { showScreen('home'); });
  submitInput.addEventListener('click', submitFreeform);
  answerInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') submitFreeform(); });
  btnHint.addEventListener('click', () => {
    if (game.hintUsed) return;
    const q = game.questions[game.index];
    let text = '';
    
    if (q.type === 'mc') {
      text = q.options[q.a];
    } else if (q.type === 'in') {
      text = q.a;
    } else if (q.special === 'name-input') {
      text = 'Enter your name';
    } else if (q.special === 'hatch-game') {
      text = 'Wait 15 seconds for egg to hatch, then type "feed" to add time (max 40 seconds)!';
    } else if (q.special === 'captcha-game') {
      text = 'Click all 9 boxes';
    } else if (q.special === 'memory-sequence-game') {
      text = 'Watch the glowing sequence and repeat it in order for 8 rounds';
    } else if (q.special === 'shuffling-mc') {
      text = 'Options shuffle every second - choose "inheat"';
    } else if (q.special === 'video-watch') {
      text = 'Watch the entire video to proceed';
    } else if (q.special === 'video-watch-edited') {
      text = 'Watch the edited video to proceed';
    } else if (q.special === 'video-answer') {
      text = 'Answer: badbad uno, badbad dos, badbad tres, or badbad kuatro';
    } else if (q.special === 'number-guessing-game') {
      text = 'Guess a number from 1 to 100. You have 10 tries. Use hints like "too low" or "too high"!';
    } else if (q.special === 'redirect-to-goodluck') {
      text = 'This is the final challenge! You will be redirected to a special page.';
    } else {
      text = 'No hint available for this question';
    }
    
    hintBox.textContent = 'Hint: ' + text;
    hintBox.classList.remove('hidden');
    game.hintUsed = true;
    btnHint.disabled = true;
    btnHint.textContent = 'Hint (0 left)';
  });