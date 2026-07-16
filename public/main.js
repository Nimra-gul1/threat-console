/* ---------- Radar sweep + blips ---------- */
const blipsGroup = document.getElementById('radar-blips');
const rlList = document.getElementById('rl-list');

function polar(cx, cy, r, angleDeg){
  const rad = (angleDeg - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function getRadarCoordinates(ip, tag, index, total) {
  const octets = ip.split('.');
  const last = parseInt(octets[octets.length - 1]) || 0;
  
  // Space out the angles nicely
  const angle = (last * 7 + index * (360 / Math.max(total, 1))) % 360;
  
  // Radius based on classification
  let r = 70;
  if (tag === 'router' || tag === 'gateway') {
    r = 50; 
  } else if (tag === 'local host') {
    r = 90; 
  } else if (tag === 'web server' || tag === 'db server') {
    r = 130; 
  } else {
    // Semi-random radius but within the rings
    r = 45 + (last % 8) * 11;
  }
  return { r, angle };
}

function dropBlip(node, index, total, delay){
  setTimeout(()=>{
    const { r, angle } = getRadarCoordinates(node.host, node.tag, index, total);
    const p = polar(150, 150, r, angle);
    
    // Create ring
    const ring = document.createElementNS('http://www.w3.org/2000/svg','circle');
    ring.setAttribute('cx', p.x); ring.setAttribute('cy', p.y);
    ring.setAttribute('r', 4); 
    ring.setAttribute('class', `radar-blip-ring ${node.tag === 'local host' ? 'radar-blip-ring-local' : ''}`);
    
    // Create core
    const core = document.createElementNS('http://www.w3.org/2000/svg','circle');
    core.setAttribute('cx', p.x); core.setAttribute('cy', p.y);
    core.setAttribute('r', 4); 
    core.setAttribute('class', `radar-blip radar-blip-core ${node.tag === 'local host' ? 'radar-blip-local' : ''}`);
    
    blipsGroup.appendChild(ring);
    blipsGroup.appendChild(core);

    // Add list legend item
    const item = document.createElement('div');
    item.className = 'rl-item';
    const dotClass = node.tag === 'local host' ? 'rl-dot rl-dot-local' : 'rl-dot';
    item.innerHTML = `<span class="${dotClass}"></span><span class="host">${node.host}</span> <span class="tag2">— ${node.tag}</span>`;
    rlList.appendChild(item);
  }, delay);
}

async function startRadarCycle(){
  try {
    const res = await fetch('/api/radar-nodes');
    const data = await res.json();
    
    if (data.success && data.devices) {
      blipsGroup.innerHTML = '';
      rlList.innerHTML = '';
      data.devices.forEach((node, i)=> dropBlip(node, i, data.devices.length, 200 + i * 500));
    }
  } catch (err) {
    console.error('Error fetching radar nodes:', err);
  }
}

// Initial sweep and run every 12 seconds
startRadarCycle();
setInterval(startRadarCycle, 12000);

/* ---------- Password analyzer ---------- */
const commonPw = [
  'password','123456','qwerty','letmein','admin','iloveyou','welcome','monkey','football','12345678','password1',
  'shadow','master','hunter2','dragon','root','12345','123456789','princess','superman','admin123'
];
const pwInput = document.getElementById('pw-input');
pwInput.addEventListener('input', ()=>{
  const v = pwInput.value;
  const checks = {
    len: v.length >= 12,
    upper: /[A-Z]/.test(v),
    lower: /[a-z]/.test(v),
    num: /[0-9]/.test(v),
    sym: /[^A-Za-z0-9]/.test(v),
    common: v.length>0 && !commonPw.includes(v.toLowerCase())
  };
  ['len','upper','lower','num','sym','common'].forEach(k=>{
    const el = document.getElementById('c-'+k);
    if(v.length === 0){ el.textContent='○'; el.className='mark'; return; }
    el.textContent = checks[k] ? '✓' : '✕';
    el.className = 'mark ' + (checks[k] ? 'pass' : 'fail');
  });
  
  const score = Object.values(checks).filter(Boolean).length;
  const fill = document.getElementById('strength-fill');
  const label = document.getElementById('strength-label');
  if(v.length === 0){
    fill.style.width='0%'; label.textContent='Waiting for input…'; label.style.color='var(--muted)';
    return;
  }
  const pct = (score/6)*100;
  fill.style.width = pct+'%';
  let color, text;
  if(score <= 2){ color='var(--red)'; text='Weak — crackable in seconds'; }
  else if(score <= 4){ color='var(--amber)'; text='Moderate — could be stronger'; }
  else { color='var(--green)'; text='Strong — solid entropy'; }
  fill.style.background = color;
  label.style.color = color;
  label.textContent = text;
});

/* ---------- Hash generator ---------- */
async function sha(algo, text){
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest(algo, enc);
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}
document.getElementById('hash-input').addEventListener('input', async (e)=>{
  const v = e.target.value;
  if(!v){ 
    document.getElementById('sha256-out').textContent='—'; 
    document.getElementById('sha1-out').textContent='—'; 
    return; 
  }
  document.getElementById('sha256-out').textContent = await sha('SHA-256', v);
  document.getElementById('sha1-out').textContent = await sha('SHA-1', v);
});

/* ---------- Scan simulator ---------- */
let currentEventSource = null;
const scanBtn = document.getElementById('scan-btn');

if (scanBtn) {
  scanBtn.addEventListener('click', runScan);
}

function runScan(){
  const target = document.getElementById('scan-target').value.trim() || '127.0.0.1';
  const log = document.getElementById('scan-log');
  
  // Disable button
  scanBtn.disabled = true;
  scanBtn.textContent = 'Scanning...';
  
  if (currentEventSource) {
    currentEventSource.close();
  }

  log.innerHTML = '';
  
  // Establish real SSE connection
  currentEventSource = new EventSource(`/api/scan-ports?target=${encodeURIComponent(target)}`);
  
  currentEventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      
      if (data.status === 'info') {
        const div = document.createElement('div');
        div.className = 'l';
        div.style.color = 'var(--cyan)';
        div.textContent = data.message;
        log.appendChild(div);
      } else if (data.port) {
        const div = document.createElement('div');
        div.className = 'l';
        
        let color = 'var(--muted)';
        if (data.status === 'open') {
          color = 'var(--green)';
        } else if (data.status === 'filtered') {
          color = 'var(--amber)';
        }
        
        const portStr = data.port.padEnd(12);
        const statusStr = data.status.padEnd(12);
        div.innerHTML = `<span style="color:${color}">${portStr} ${statusStr} ${data.service}</span>`;
        log.appendChild(div);
      } else if (data.done) {
        const div = document.createElement('div');
        div.className = 'l';
        div.style.color = 'var(--green)';
        div.textContent = data.summary;
        log.appendChild(div);
        
        // Clean up
        currentEventSource.close();
        currentEventSource = null;
        scanBtn.disabled = false;
        scanBtn.textContent = 'Run scan';
      }
      log.scrollTop = log.scrollHeight;
    } catch (err) {
      console.error('Error parsing SSE message:', err);
    }
  };
  
  currentEventSource.onerror = () => {
    const div = document.createElement('div');
    div.className = 'l';
    div.style.color = 'var(--red)';
    div.textContent = 'Error: Lost connection to scanning service.';
    log.appendChild(div);
    
    currentEventSource.close();
    currentEventSource = null;
    scanBtn.disabled = false;
    scanBtn.textContent = 'Run scan';
  };
}

/* ---------- CTF ---------- */
const answers = {
  1: 'ctf{#3ase64_is_not_encryption}',
  2: 'ctf{caesar_ciphers_are_weak}',
  3: 'xss'
};
function normalize(s){ return s.trim().toLowerCase().replace(/\s+/g,''); }
window.checkCTF = function(n){
  const input = document.getElementById('ctf'+n+'-input').value;
  const fb = document.getElementById('ctf'+n+'-feedback');
  const correct = normalize(input) === normalize(answers[n]);
  if(correct){
    fb.textContent = '✓ Correct — flag captured.';
    fb.className = 'feedback ok';
  } else {
    fb.textContent = '✕ Not quite. Try again or check the hint.';
    fb.className = 'feedback bad';
  }
};
window.toggleHint = function(n){
  const hint = document.getElementById('ctf'+n+'-hint');
  hint.style.display = hint.style.display === 'block' ? 'none' : 'block';
};
