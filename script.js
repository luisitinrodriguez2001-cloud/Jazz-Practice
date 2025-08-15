/* Jazz Trumpet Exercise Lab — Warm Modern, Funnel Filters, Live BPM, Pause Timer, CSV Import/Export, Share
   Optional externals: GSAP + Tonal (see HTML)
*/

/* -------------------------
   0) THEMING & CANVAS BACKDROP
-------------------------- */
const root = document.documentElement;
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas(){
  canvas.width = Math.max(1, innerWidth * devicePixelRatio);
  canvas.height = Math.max(1, innerHeight * devicePixelRatio);
}
resizeCanvas(); addEventListener('resize', resizeCanvas);

// subtle floating notes
const notes = [];
for(let i=0;i<36;i++){
  notes.push({
    x: Math.random() * (innerWidth * devicePixelRatio),
    y: Math.random() * (innerHeight * devicePixelRatio),
    s: 0.6 + Math.random()*1.4,
    vx: -0.18 + Math.random()*0.36,
    vy: -0.1 + Math.random()*0.2,
    r: Math.random()*Math.PI*2
  });
}
function drawNote(n){
  ctx.save();
  ctx.translate(n.x, n.y); ctx.rotate(n.r);
  const c = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
  ctx.fillStyle = hexToRgba(c, 0.6);
  const w = 7*n.s*devicePixelRatio; const h = 18*n.s*devicePixelRatio;
  ctx.fillRect(0, 0, w, h);
  ctx.beginPath(); ctx.arc(w/2, 0, w*0.85, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}
function tick(){
  ctx.clearRect(0,0,canvas.width, canvas.height);
  notes.forEach(n=>{
    n.x += n.vx; n.y += n.vy; n.r += 0.0016;
    if(n.x < -40) n.x = canvas.width+20;
    if(n.x > canvas.width+40) n.x = -20;
    if(n.y < -40) n.y = canvas.height+20;
    if(n.y > canvas.height+40) n.y = -20;
    drawNote(n);
  });
  requestAnimationFrame(tick);
}
tick();
function hexToRgba(hex, alpha=1){
  const h = hex.replace('#','');
  const bigint = parseInt(h.length===3 ? h.split('').map(c=>c+c).join('') : h, 16);
  const r=(bigint>>16)&255, g=(bigint>>8)&255, b=bigint&255;
  return `rgba(${r},${g},${b},${alpha})`;
}

// theme switch (warm variants)
const themeSel = document.getElementById('theme');
function applyTheme(name){
  root.classList.remove('theme-sunset','theme-amber','theme-rosewood','theme-olive');
  root.classList.add(`theme-${name}`);
  localStorage.setItem('jt_theme', name);
}
themeSel.addEventListener('change', e=> applyTheme(e.target.value));
applyTheme(localStorage.getItem('jt_theme') || 'sunset');
themeSel.value = localStorage.getItem('jt_theme') || 'sunset';

// reduce motion toggle
document.getElementById('reduceMotion')?.addEventListener('change', (e)=>{
  document.documentElement.classList.toggle('reduced-motion', e.target.checked);
});

/* -------------------------
   1) DATA: CITATIONS & GLOSSARY
-------------------------- */
const CITATIONS = {
  arban_wiki:{ title:"Arban’s Complete Conservatory Method for Trumpet — overview", url:"https://en.wikipedia.org/wiki/Arban%27s_Complete_Conservatory_Method_for_Trumpet", note:"History & structure." },
  clarke_wiki:{ title:"Clarke Studies — overview", url:"https://en.wikipedia.org/wiki/Clarke_Studies", note:"Technical studies context." },
  schlossberg_imslp:{ title:"Max Schlossberg — Daily Drills and Technical Studies", url:"https://imslp.org/wiki/Daily_Drills_and_Technical_Studies_%28Schlossberg%2C_Max%29", note:"Publication info." },
  cichowicz_store:{ title:"Cichowicz — Flow Studies (Studio 259)", url:"https://www.studio259productions.com/products/p/6b3lwgu99mzk6dbfvyckx9joyd4ayr", note:"Official description." },
  stamp_bim:{ title:"James Stamp — Warm-ups & Studies (Editions BIM)", url:"https://www.amazon.com/Warm-ups-Studies-Trumpet-Other-Instruments/dp/B001962PMK", note:"Publisher listing." },
  colin_advflex:{ title:"Charles Colin — Advanced Lip Flexibilities", url:"https://charlescolin.com/product/advanced-lip-flexibilities/", note:"Official product page." },
  caruso:{ title:"Carmine Caruso — Musical Calisthenics for Brass", url:"https://www.tomleemusic.ca/rondor-music-int-carmine-caruso-musical-calisthenics-for-brass-20007", note:"Publisher details." },
  flexus_official:{ title:"Flexus — Trumpet Calisthenics for the Modern Improviser", url:"https://www.lauriefrink.com/flexus", note:"Official info." },
  vizzutti_bk2:{ title:"Allen Vizzutti — Method Book 2: Harmonic Studies", url:"https://www.alfred.com/the-allen-vizzutti-trumpet-method-book-2-harmonic-studies/p/00-3392/", note:"Official product page." },
  charlier_leduc:{ title:"Théo Charlier — 36 Études Transcendantes", url:"https://www.halleonard.com/product/48181183/36-etudes-transcendantes", note:"Publisher page." },
  saint_jacome_cf:{ title:"Saint-Jacome — Grand Method (Carl Fischer)", url:"https://www.carlfischer.com/o457-grand%2Bmethod%2Bfor%2Btrumpet%2Bor%2Bcornet.html", note:"Official page." },
  bai_lin_cf:{ title:"Bai Lin — Lip Flexibilities (Balquhidder/Carl Fischer)", url:"https://www.carlfischer.com/bq38-lip-flexibilities.html", note:"Publisher page." },
  irons_27:{ title:"Earl Irons — 27 Groups of Exercises", url:"https://www.halleonard.com/product/3770191/27-groups-of-exercises", note:"Listing." },
  aebersold_cat:{ title:"Jamey Aebersold — Play-Along Catalog", url:"https://www.jazzbooks.com/", note:"Official catalog." },
  coker_patterns:{ title:"Jerry Coker — Patterns for Jazz (Alfred)", url:"https://www.alfred.com/patterns-for-jazz-a-theory-text-for-jazz-composition-and-improvisation/p/00-SB1/", note:"Official product page." },
  bergonzi_vol1:{ title:"Jerry Bergonzi — Inside Improvisation Vol.1: Melodic Structures", url:"https://www.schott-music.com/en/melodic-structures-no307910.html", note:"Schott/Advance." },
  baker_bebop:{ title:"David Baker — How to Play Bebop (Vol. 1)", url:"https://www.alfred.com/how-to-play-bebop-volume-1/p/00-2746/", note:"Official page." },
  levine_jtb:{ title:"Mark Levine — The Jazz Theory Book (Sher Music)", url:"https://www.shermusic.com/1883217040.php", note:"Publisher page." },
  snidero_conception:{ title:"Jim Snidero — Jazz Conception (Trumpet)", url:"https://www.alfred.com/jazz-conception-trumpet/p/01-ADV14722/", note:"Advance/Alfred." },
  parker_omnibook:{ title:"Charlie Parker — Omnibook (Bb)", url:"https://www.halleonard.com/product/4003/charlie-parker-omnibook", note:"Official product page." },
  confirmation_wiki:{ title:"‘Confirmation’ (Charlie Parker)", url:"https://en.wikipedia.org/wiki/Confirmation_%28composition%29", note:"Overview & history." },
  bebop_scale_wiki:{ title:"Bebop scales (dominant & major)", url:"https://en.wikipedia.org/wiki/Bebop_scale", note:"Added passing tones; Harris tie-in." },
  barry_harris_institute:{ title:"Barry Harris Institute — 6th-diminished concepts", url:"https://barryharrisinstituteofjazz.org/a-six-part-zoom-series/", note:"Institute overview." }
};

const GLOSSARY = {
  "Guide tones":{
    beginner:"Key notes that define the chord (often 3rd & 7th). Aim at these on changes.",
    advanced:"3rds/7ths (and 6/maj7 on Imaj6) driving voice-leading."
  },
  "Enclosure":{
    beginner:"Play a note below and above your target, then land on it.",
    advanced:"Chromatic/diatonic wraps targeting downbeats."
  },
  "Bebop dominant scale":{
    beginner:"V7 scale with a passing tone so strong notes hit on the beat.",
    advanced:"Mixolydian + natural 7 between ♭7–1 to align chord tones on downbeats."
  },
  "6th–diminished (Barry Harris)":{
    beginner:"Major scale idea that adds connectors to feel smooth.",
    advanced:"I6 alternating with related dim7; diatonic–diminished network."
  }
};

/* -------------------------
   2) TAXONOMY (funnel filters)
-------------------------- */
const TIER1 = {
  "Fundamentals 🫁":["Breathing","Buzzing","Tone/Flow"],
  "Technique 🧰":["Valve Technique","Articulation","Flexibility","Sight Reading"],
  "Language 🎶":["Bebop Grammar","Pattern Studies","Enclosures","Diminished","Triad Pairs","Upper Structures"],
  "Forms 🧩":["ii–V–I","Blues","Rhythm Changes","Tunes","Transcription"],
  "Time & Ear ⏱️👂":["Time Feel","Ear Training","Odd Meter"],
  "Physique 🏋️":["Range/Endurance","Mental Practice"]
};
const TIER3_SET = new Set(["Enclosures","Diminished","Triad Pairs","Upper Structures","Rhythm Changes","Blues","ii–V–I","Tunes","Transcription"]);

/* -------------------------
   3) EXERCISE DATA (FULL, all levels)
-------------------------- */
const ALL_KEYS = ["C","F","Bb","Eb","Ab","Db","Gb","B","E","A","D","G"];
const TEMPI = { slow:[56,66,72], med:[88,96,104], fast:[120,132,144], blower:[168,184,200,220] };

const BASE = [
  /* ===== BEGINNER ===== */
  {
    id:"b-longtones", level:"beginner", title:"Long tones → tone pillows",
    summary:"Air first. Sustain, crescendo–diminuendo, stay centered with a drone.",
    categories:["Breathing","Tone/Flow"],
    why:"Stabilizes embouchure & pitch center. Builds air consistency before complexity.",
    targets:["steady attack","centered pitch","airflow"],
    listen:["Drone on C"],
    how:["Breath 4-in/12-out.","Sustain low C→G (8–12 beats) with tuner.","No jaw pressure; release air smoothly."],
    refs:["cichowicz_store"],
    gens: () => expand({keys:["C","F","G","Bb"], tempi:TEMPI.slow, artics:["slurred"], feels:["straight"], minutes:[5,6,8]})
  },
  {
    id:"b-123454321", level:"beginner", title:"Pentascale 1-2-3-4-5-4-3-2-1",
    summary:"Grant-style pattern for finger/air sync and intonation.",
    categories:["Valve Technique","Articulation","Pattern Studies"],
    why:"Sync valves & tongue with air.",
    targets:["even fingers","clean attacks","scale fluency"],
    listen:["Aebersold Vol.24 drone"],
    how:["Slur one bar, tongue one bar; q=72→96.","Keep fingers close; light 'da'.","Consistent tone across notes."],
    refs:["arban_wiki","clarke_wiki","aebersold_cat"],
    gens: () => expand({keys:["C","G","F","Bb"], tempi:TEMPI.slow.concat(TEMPI.med), artics:["slurred","tongued"], feels:["swing","straight"]})
  },
  {
    id:"b-guidetones", level:"beginner", title:"Guide-tones over ii–V–I (3→7)",
    summary:"Connect 3rds & 7ths to feel resolution.",
    categories:["Bebop Grammar","ii–V–I","Ear Training"],
    why:"Teaches functional harmony with minimal notes.",
    targets:["voice-leading","time feel"],
    listen:["Slow ii–V–I loop"],
    how:["Say note names → sing → play.","Dmin7→G7→Cmaj6: F→B→E→B.","Metronome on 2 & 4."],
    refs:["levine_jtb","baker_bebop","aebersold_cat"],
    gens: () => expand({keys:["C","F","Bb","Eb","G"], tempi:TEMPI.slow, artics:["slurred"], feels:["swing"], minutes:[6,8]})
  },
  {
    id:"b-bebop-major", level:"beginner", title:"Bebop major scale (add ♯5/♭6)",
    summary:"8-note major with passing tone for downbeat alignment.",
    categories:["Bebop Grammar","Pattern Studies"],
    why:"Downbeat-align chord tones for idiomatic bebop phrasing.",
    targets:["bebop phrasing","scale mapping"],
    listen:["Simple swing click on 2&4"],
    how:["Spell 1-2-3-4-5-♯5-6-7-1.","Asc/desc; build 2-note cells (3–5, 5–6).","Keep chord tones on downbeats."],
    refs:["bebop_scale_wiki","barry_harris_institute"],
    gens: () => expand({keys:["C","F","G","Bb","Eb"], tempi:TEMPI.slow, artics:["tongued","slurred"], feels:["swing"]})
  },
  {
    id:"b-confirm-1-4", level:"beginner", title:"‘Confirmation’ — mm.1–4 (slow)",
    summary:"Micro-chunk the head; clean time & light tongue.",
    categories:["Tunes","Time Feel","Transcription"],
    why:"Keeps quality high at slow tempos.",
    targets:["time","articulation","memory"],
    listen:["Parker ‘Confirmation’"],
    how:["Count swing q=60; met on 2&4.","Speak rhythm → sing → play.","3 clean loops → +4 BPM."],
    refs:["confirmation_wiki","parker_omnibook"],
    gens: () => expand({keys:["C"], tempi:[60,66,72,80], artics:["mixed"], feels:["swing"], minutes:[6,8]})
  },

  /* ===== INTERMEDIATE ===== */
  {
    id:"i-cichowicz2", level:"intermediate", title:"Cichowicz Flow — Set 2",
    summary:"Long legato slurs; phrase to the top, then release.",
    categories:["Tone/Flow","Flexibility"],
    why:"Improves legato and breath while connecting partials.",
    targets:["legato","air support"],
    listen:["Drone root + 5th"],
    how:["No tongue between slurs—air only.","Dynamics mp→mf→mp.","Reset if slotting feels forced."],
    refs:["cichowicz_store"],
    gens: () => expand({keys:["C","G","F","Bb","Eb"], tempi:TEMPI.med, artics:["slurred"], feels:["straight"], minutes:[8,10]})
  },
  {
    id:"i-clarke-2-3", level:"intermediate", title:"Clarke #2/#3 — articulation ladder",
    summary:"Slur → single → K → double; even fingers over tongue.",
    categories:["Valve Technique","Articulation"],
    why:"Balances finger/tongue synchronization.",
    targets:["sync","clarity","speed"],
    listen:["Click at 96 → 112 → 120"],
    how:["q=88→132; 'da'/'ga' light.","No flams between finger & tongue.","Rest equal time per line."],
    refs:["clarke_wiki"],
    gens: () => expand({keys:["C"], tempi:[88,96,112,120,132], artics:["mixed"], feels:["straight"]})
  },
  {
    id:"i-harris-6dim", level:"intermediate", title:"Barry Harris: I6 ↔ dim7 network",
    summary:"Alternate I6 arps with related dim7; downbeat-align chord tones.",
    categories:["Bebop Grammar","ii–V–I"],
    why:"Builds 6–dim vocabulary for strong-beat grammar.",
    targets:["downbeat targeting","arpeggio fluency"],
    listen:["I6 pad + dim7"],
    how:["Play major(♯5) → arpeggiate I6 then dim7.","Compose 1-bar lines to 3rd/6th.","Apply over V using 5th-based 6–dim."],
    refs:["barry_harris_institute","bebop_scale_wiki"],
    gens: () => expand({keys:ALL_KEYS, tempi:TEMPI.med, artics:["tongued","slurred"], feels:["swing"], minutes:[8,10]})
  },
  {
    id:"i-bebop-dom", level:"intermediate", title:"Bebop dominant over V→I",
    summary:"Mixolydian + natural 7; start on 3rd and resolve to I.",
    categories:["Bebop Grammar","ii–V–I","Pattern Studies"],
    why:"Locks chord tones to downbeats in classic bebop fashion.",
    targets:["resolution","chromatic approach"],
    listen:["V7→I shells loop"],
    how:["q=96–144; vary starts (& of 4).","Resolve to 3rd of I.","Ghost upbeats for shape."],
    refs:["bebop_scale_wiki","baker_bebop","levine_jtb"],
    gens: () => expand({keys:ALL_KEYS, tempi:TEMPI.med.concat(TEMPI.fast), artics:["mixed"], feels:["swing"], minutes:[8,10]})
  },
  {
    id:"i-confirm-4-8", level:"intermediate", title:"‘Confirmation’ — mm.4–8 (transpose by 4ths)",
    summary:"Cycle the cell; light articulation, locked time.",
    categories:["Tunes","Transcription","Time Feel","Transposition"],
    why:"Develops endurance & clarity on the tricky spot.",
    targets:["articulation","memory","time"],
    listen:["Original Parker take for articulation"],
    how:["Start q=84; +6 BPM after two clean reps.","Ghost & accent per bebop style.","Two keys/day → 12 in a week."],
    refs:["parker_omnibook","confirmation_wiki"],
    gens: () => expand({keys:["C","F","Bb","Eb","Ab"], tempi:[84,96,108,120], artics:["mixed"], feels:["swing"]})
  },

  /* ===== ADVANCED ===== */
  {
    id:"a-flexus", level:"advanced", title:"Flexus circuit — bends → expansion",
    summary:"Frink/McNeil calisthenics for efficient embouchure.",
    categories:["Flexibility","Range/Endurance","Valve Technique"],
    why:"Conditioning for responsive slotting & endurance.",
    targets:["efficiency","response","range"],
    listen:["Soft drone; minimal breath noise"],
    how:["Warm-up → gentle bends → expansion sets (pp–mf).","Strict rest ratios; stop before strain.","Air constant; avoid bite."],
    refs:["flexus_official"],
    gens: () => expand({keys:["C","G","F","Bb","Eb"], artics:["slurred"], feels:["straight"], minutes:[8,10]})
  },
  {
    id:"a-caruso", level:"advanced", title:"Caruso: Six-Notes / Seconds",
    summary:"Time-boxed strength/coordination. Respect rest times.",
    categories:["Range/Endurance","Valve Technique"],
    why:"Physiological calibration of embouchure with timing.",
    targets:["stability","strength","timing"],
    listen:["Silent—monitor body cues"],
    how:["Use a timer; exact counts & breaths.","Corners set; no overblowing.","If tone thins, stop early."],
    refs:["caruso"],
    gens: () => expand({keys:["C"], feels:["straight"], minutes:[6,8,10]})
  },
  {
    id:"a-bergonzi-cells", level:"advanced", title:"Bergonzi Vol.1 — 3-note cells over changes",
    summary:"Assign cells per chord; voice-lead across the form.",
    categories:["Bebop Grammar","ii–V–I","Pattern Studies","Transposition"],
    why:"Forces melodic continuity & strong barline targets.",
    targets:["voice-leading","line continuity"],
    listen:["Play-along rhythm changes or blues"],
    how:["Cell per chord; nearest-note voice leading.","Two choruses continuous; no breaks.","Displace start (e of 1 / & of 4)."],
    refs:["bergonzi_vol1"],
    gens: () => expand({keys:ALL_KEYS, tempi:[108,120,132,144], artics:["mixed"], feels:["swing"], minutes:[8,10]})
  },
  {
    id:"a-omnibook-confirm", level:"advanced", title:"‘Confirmation’ head + 1 chorus (Omnibook)",
    summary:"Memorize; 12-key cycle; trade 4s.",
    categories:["Tunes","Transcription","Time Feel","Transposition"],
    why:"Combines language, articulation, range, and time.",
    targets:["consistency","style"],
    listen:["Any Parker ‘Confirmation’"],
    how:["Sing the solo; clap 2&4; then play.","Cycle via 4ths; consistent articulations.","Trade 4s over backing."],
    refs:["parker_omnibook","confirmation_wiki"],
    gens: () => expand({keys:ALL_KEYS, tempi:[120,144,168], artics:["as transcribed"], feels:["swing"]})
  },

  /* ===== EXPERT ===== */
  {
    id:"e-colin-trills", level:"expert", title:"Colin — lip-trill sequences",
    summary:"Fast oscillations without jaw motion; centered slot.",
    categories:["Flexibility","Range/Endurance"],
    why:"Top-register responsiveness with minimal pressure.",
    targets:["center","oscillation","efficiency"],
    listen:["No accompaniment; listen for purity"],
    how:["Find center first; then oscillate.","Corners stable; no pressure increase.","Short sets; high rest ratio."],
    refs:["colin_advflex"],
    gens: () => expand({keys:["C","D","Eb","E","F","G","A","Bb"], feels:["straight"], minutes:[5,6,8]})
  },
  {
    id:"e-ii-v-i-220", level:"expert", title:"Double-time ii–V–I at 220+ (downbeats targeted)",
    summary:"Chromatic approach tones, 3rds/7ths on downbeats.",
    categories:["Bebop Grammar","ii–V–I","Time Feel"],
    why:"High-tempo discipline aligning bebop grammar with strong beats.",
    targets:["speed","grammar","resolution"],
    listen:["Metronome 220; accent 2&4"],
    how:["Compose a 4-bar cell; transpose 12 keys.","Start on & of 4 → resolve on 3rd of I.","Drop to 180 for accuracy checks."],
    refs:["baker_bebop","levine_jtb"],
    gens: () => expand({keys:ALL_KEYS, tempi:TEMPI.blower, artics:["mixed"], feels:["swing"], minutes:[8,10]})
  },
  {
    id:"e-upper-structures", level:"expert", title:"Upper-structure triads for V7alt → I",
    summary:"E/G/Ab over C7 implies b9/#9/#5/#11 → resolve.",
    categories:["Upper Structures","ii–V–I","Bebop Grammar","Transposition"],
    why:"Colorful tensions with clean voice-leading into resolution.",
    targets:["tension→release","targeting"],
    listen:["Play-along ii–V–I loop"],
    how:["Triads over V7alt (tritone-related).","Resolve to I chord tones.","Keep lines singable; avoid parallel crunches."],
    refs:["levine_jtb","coker_patterns"],
    gens: () => expand({keys:ALL_KEYS, tempi:[112,132,152], artics:["tongued","mixed"], feels:["swing"], minutes:[8,10]})
  },
  {
    id:"e-confirm-12keys", level:"expert", title:"‘Confirmation’ — 12 keys, head + 2 choruses",
    summary:"Full-speed cycles; motif development + off-beat starts.",
    categories:["Tunes","Transcription","Time Feel","Transposition"],
    why:"Top-tier control of bebop head & continuous solo form.",
    targets:["endurance","phrasing","memory"],
    listen:["Original Parker + modern versions"],
    how:["Each chorus starts at a different pickup.","Ch1: pure bebop; Ch2: motif only.","Record; check time & articulation."],
    refs:["parker_omnibook","confirmation_wiki"],
    gens: () => expand({keys:ALL_KEYS, tempi:[168,184,200], artics:["as transcribed"], feels:["swing"], minutes:[10]})
  }
];

function expand({keys, tempi, artics, feels, subdivs=["eighths"], minutes=[5,8,10]}){
  const out=[];
  (keys||[null]).forEach(k=>{
    (tempi||[null]).forEach(t=>{
      (artics||["as written"]).forEach(a=>{
        (feels||["swing"]).forEach(f=>{
          (subdivs||["eighths"]).forEach(sd=>{
            minutes.forEach(m=> out.push({key:k, tempo:t, artic:a, feel:f, subdiv:sd, minutes:m}));
          });
        });
      });
    });
  });
  return out;
}

/* -------------------------
   4) STATE & HELPERS
-------------------------- */
const state = {
  level: 'beginner',
  tier: { t1:"", t2:"", t3:"" }, // funnel selections
  todayIndex: 0,
  shuffleSeed: null,
  favorites: new Set(JSON.parse(localStorage.getItem('jt_favorites')||'[]')),
  queue: JSON.parse(localStorage.getItem('jt_queue')||'[]'),
  notes: JSON.parse(localStorage.getItem('jt_notes')||'{}')
};

const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

function xmur3(str){ for(var i=0, h=1779033703^str.length; i<str.length; i++) h = Math.imul(h^str.charCodeAt(i),3432918353), h = h<<13|h>>>19; return function(){ h = Math.imul(h^(h>>>16), 2246822507); h = Math.imul(h^(h>>>13), 3266489909); return (h^=h>>>16)>>>0; } }
function mulberry32(a){ return function(){ var t = a += 0x6D2B79F5; t = Math.imul(t ^ t>>>15, t | 1); t ^= t + Math.imul(t ^ t>>>7, t | 61); return ((t ^ t>>>14) >>> 0) / 4294967296; } }

function prettyLevel(l){ return l[0].toUpperCase()+l.slice(1); }
function citeItem(key){
  const c = CITATIONS[key];
  const safeNote = c.note ? `<div class="hint">${c.note}</div>` : "";
  return `<div class="res-item">
            <div class="dot"></div>
            <div>
              <div><b>${c.title}</b></div>
              <div class="hint"><a href="${c.url}" target="_blank" rel="noopener noreferrer">${c.url}</a></div>
              ${safeNote}
            </div>
          </div>`;
}

/* -------------------------
   5) FUNNEL FILTERS (populate & cascade)
-------------------------- */
const tier1Sel = $("#tier1");
const tier2Sel = $("#tier2");
const tier3Sel = $("#tier3");
const clearFiltersBtn = $("#clearFilters");

function buildAllInstancesForLevel(){
  const dayKey = new Date().toISOString().slice(0,10);
  if(!state.shuffleSeed) state.shuffleSeed = xmur3(dayKey + ":" + state.level)();
  const bases = BASE.filter(b => b.level===state.level);
  const instances=[];
  bases.forEach(b=>{
    const vars = b.gens();
    vars.forEach((v, idx)=>{
      instances.push({
        uid:`${b.id}::${idx}`,
        baseId:b.id, idx,
        level:b.level, title:b.title, summary:b.summary,
        categories:b.categories, refs:b.refs, how:b.how,
        why:b.why, targets:b.targets, listen:b.listen,
        key:v.key, tempo:v.tempo, artic:v.artic, feel:v.feel, subdiv:v.subdiv, minutes:v.minutes,
        keyDisplay: v.key || "as written",
        tempoDisplay: v.tempo ?? "as written"
      });
    });
  });
  return instances;
}

function computeAvailableTier1Keys(){
  const inst = buildAllInstancesForLevel();
  const available = [];
  for(const [bucket, cats] of Object.entries(TIER1)){
    const has = inst.some(ex => ex.categories.some(c => cats.includes(c)));
    if(has) available.push(bucket);
  }
  return available;
}

function initFunnel(){
  const availT1 = computeAvailableTier1Keys();
  if(state.tier.t1 && !availT1.includes(state.tier.t1)){
    state.tier.t1 = ""; state.tier.t2 = ""; state.tier.t3 = "";
  }
  tier1Sel.innerHTML = `<option value="">All</option>` + availT1.map(k=>`<option value="${k}">${k}</option>`).join('');
  tier1Sel.value = state.tier.t1 || "";

  const t2opts = computeTier2Options();
  tier2Sel.innerHTML = (t2opts.length? `<option value="">All</option>` : `<option value="">—</option>`) + t2opts.map(o=>`<option value="${o}">${o}</option>`).join('');
  tier2Sel.disabled = t2opts.length===0;
  tier2Sel.value = state.tier.t2 || "";

  const t3opts = computeTier3Options();
  tier3Sel.innerHTML = (t3opts.length? `<option value="">All</option>` : `<option value="">—</option>`) + t3opts.map(o=>`<option value="${o}">${o}</option>`).join('');
  tier3Sel.disabled = t3opts.length===0;
  tier3Sel.value = state.tier.t3 || "";
}

function computeTier2Options(){
  const instances = buildAllInstancesForLevel();
  const set = new Set();
  let catsAllowed = null;
  if(state.tier.t1){ catsAllowed = new Set(TIER1[state.tier.t1]); }
  instances.forEach(ex=>{
    ex.categories.forEach(c=>{
      if(!catsAllowed || catsAllowed.has(c)) set.add(c);
    });
  });
  return Array.from(set).sort();
}
function computeTier3Options(){
  const filtered = buildCatalog(); // filtered by t1/t2
  const set = new Set();
  filtered.forEach(ex=>{
    ex.categories.forEach(c => { if(TIER3_SET.has(c)) set.add(c); });
  });
  return Array.from(set).sort();
}

initFunnel();

/* Collapsible header controls (manual only) */
const headerEl = document.querySelector('.hdr');
const collapseBtn = document.getElementById('collapseHdr');
const showFiltersBtn = document.getElementById('showFilters');

function setHeaderCollapsed(collapsed){
  headerEl.classList.toggle('collapsed', !!collapsed);
  const expanded = !collapsed;
  if (collapseBtn){
    collapseBtn.setAttribute('aria-expanded', String(expanded));
    collapseBtn.textContent = collapsed ? '⬇️ Show' : '⬆️ Hide';
  }
  if (showFiltersBtn){
    showFiltersBtn.hidden = !collapsed;
  }
  localStorage.setItem('jt_hdr_collapsed', collapsed ? '1' : '0');
}
collapseBtn?.addEventListener('click', ()=>{
  const nowCollapsed = !headerEl.classList.contains('collapsed');
  setHeaderCollapsed(nowCollapsed);
  if(!nowCollapsed) headerEl.scrollIntoView({behavior:'smooth', block:'start'});
});
showFiltersBtn?.addEventListener('click', ()=>{
  setHeaderCollapsed(false);
  headerEl.scrollIntoView({behavior:'smooth', block:'start'});
});
setHeaderCollapsed(localStorage.getItem('jt_hdr_collapsed') === '1');

/* funnel change handlers (NO auto-hide) */
tier1Sel.addEventListener('change', ()=>{
  state.tier.t1 = tier1Sel.value;
  state.tier.t2 = ""; state.tier.t3 = "";
  initFunnel();
  state.todayIndex=0; renderExercise(); renderBrowse();
});
tier2Sel.addEventListener('change', ()=>{
  state.tier.t2 = tier2Sel.value;
  state.tier.t3 = "";
  initFunnel();
  state.todayIndex=0; renderExercise(); renderBrowse();
});
tier3Sel.addEventListener('change', ()=>{
  state.tier.t3 = tier3Sel.value;
  state.todayIndex=0; renderExercise(); renderBrowse();
});
clearFiltersBtn.addEventListener('click', ()=>{
  state.tier = {t1:"", t2:"", t3:""};
  initFunnel();
  state.todayIndex=0; renderExercise(); renderBrowse();
});

/* -------------------------
   6) CATALOG + SAFE FALLBACK
-------------------------- */
function buildCatalog(){
  const rand = mulberry32(state.shuffleSeed || 12345);
  let list = buildAllInstancesForLevel();

  if(state.tier.t1){
    const allowed = new Set(TIER1[state.tier.t1]);
    list = list.filter(ex => ex.categories.some(c => allowed.has(c)));
  }
  if(state.tier.t2){
    list = list.filter(ex => ex.categories.includes(state.tier.t2));
  }
  if(state.tier.t3){
    list = list.filter(ex => ex.categories.includes(state.tier.t3));
  }
  for(let i=list.length-1;i>0;i--){ const j = Math.floor(rand()*(i+1)); [list[i], list[j]] = [list[j], list[i]]; }
  return list;
}

/* Auto-relax filters so we always have at least one match */
function getCatalogSafe(){
  let list = buildCatalog();
  if(list.length) return list;

  if(state.tier.t3){
    state.tier.t3 = ""; tier3Sel.value = "";
    list = buildCatalog(); if(list.length) return list;
  }
  if(state.tier.t2){
    state.tier.t2 = ""; tier2Sel.value = "";
    initFunnel();
    list = buildCatalog(); if(list.length) return list;
  }
  if(state.tier.t1){
    const availT1 = computeAvailableTier1Keys();
    if(availT1.length){
      state.tier.t1 = availT1[0];
      tier1Sel.value = state.tier.t1;
      initFunnel();
      list = buildCatalog(); if(list.length) return list;
    }else{
      state.tier = {t1:"", t2:"", t3:""};
      initFunnel();
      list = buildCatalog(); if(list.length) return list;
    }
  }
  return buildAllInstancesForLevel();
}

/* -------------------------
   7) RENDERERS
-------------------------- */
function renderExercise(){
  const list = getCatalogSafe();
  const card = $("#exerciseCard");
  if(list.length===0){ card.innerHTML = `<div class="hint">No data available for this level. Try another level. 🙏</div>`; return; }
  const i = ((state.todayIndex % list.length) + list.length) % list.length;
  const ex = list[i];

  const levelTip = levelCopy(state.level);

  card.innerHTML = `
    <div class="meta">
      <span class="level-tag">${prettyLevel(state.level)}</span>
      <span>Key: <b>${ex.keyDisplay}</b></span>
      <span>BPM: <b>${ex.tempoDisplay}</b></span>
      <span>Feel: <b>${ex.feel||"swing"}</b></span>
      <span>Artic: <b>${ex.artic||"—"}</b></span>
      <span>Subdiv: <b>${ex.subdiv||"eighths"}</b></span>
      <span>⏱️ <b>${ex.minutes} min</b></span>
    </div>
    <h2>${ex.title} ✨</h2>
    <div class="sub">${ex.summary}</div>

    <div class="tags">${ex.categories.map(c=>`<span class="tag">${c}</span>`).join("")}</div>

    <div class="kv">
      <div class="k">Why</div><div class="v">${ex.why}</div>
      <div class="k">Targets</div><div class="v">${ex.targets.join(", ")}</div>
      <div class="k">Listening</div><div class="v">${ex.listen.join(" • ")}</div>
    </div>

    <ol class="steps">${ex.how.map(s=>`<li>${s}</li>`).join("")}</ol>

    ${levelTip ? `<div class="inline-tip">${levelTip}</div>` : ""}

    <div class="resbox">
      <h3>Resource dissection 🔎</h3>
      <div class="res-items">${ex.refs.map(r=>citeItem(r)).join("")}</div>
    </div>

    <div class="controls-row">
      <button class="btn secondary" id="btnQueue">⏭️ Queue</button>
      <button class="btn ghost" id="btnShare">📤 Share</button>
    </div>
  `;
  $("#btnQueue").onclick = ()=> { enqueue(ex); pulse("#btnQueue"); };
  $("#btnShare").onclick = ()=> { shareExercise(ex); };

  const favBtn = $("#btnFavorite");
  favBtn.textContent = isFav(ex) ? "★ Favorited" : "☆ Favorite";

  if(window.gsap){ gsap.from("#exerciseCard", {y:10, opacity:0, duration:0.35, ease:"power2.out"}); }
}

function renderBrowse(){
  const list = getCatalogSafe();
  const box = $("#browseList"); box.innerHTML = "";
  list.slice(0,120).forEach((ex, idx)=>{
    const el = document.createElement('div');
    el.className = "card";
    el.innerHTML = `
      <div class="meta"><span class="level-tag">${prettyLevel(ex.level)}</span>
      <span>Key: <b>${ex.keyDisplay}</b></span>
      <span>BPM: <b>${ex.tempoDisplay}</b></span>
      <span>Artic: <b>${ex.artic}</b></span></div>
      <h2>${ex.title}</h2>
      <div class="sub">${ex.summary}</div>
      <div class="tags">${ex.categories.map(c=>`<span class="tag">${c}</span>`).join("")}</div>
      <div class="controls-row">
        <button class="btn secondary setToday">Set as today</button>
        <button class="btn ghost fav">${isFav(ex)?"★":"☆"} Fav</button>
        <button class="btn ghost q">Queue</button>
      </div>
    `;
    el.querySelector(".setToday").onclick = ()=>{ state.todayIndex = idx; switchTab('home'); renderExercise(); pulse(el.querySelector(".setToday")); };
    el.querySelector(".fav").onclick = ()=>{ toggleFav(ex); renderBrowse(); renderFavQueue(); };
    el.querySelector(".q").onclick = ()=>{ enqueue(ex); pulse(el.querySelector(".q")); };
    box.appendChild(el);
  });
}

function renderFavQueue(){
  const favBox = $("#favList"), qBox = $("#queueList");
  favBox.innerHTML = ""; qBox.innerHTML = "";
  const all = getCatalogSafe();
  const favIds = new Set(state.favorites);
  all.forEach((ex, idx)=>{ if(favIds.has(ex.uid)) favBox.appendChild(renderSmall(ex, idx, {fav:true})); });
  state.queue.forEach(item=>{
    const ex = all.find(e => e.uid === item.uid);
    if(ex) qBox.appendChild(renderSmall(ex, item.idx, {queue:true}));
  });
}
function renderSmall(ex, idx, opts={}){
  const el = document.createElement('div');
  el.className = "card";
  el.innerHTML = `
    <div class="meta">
      <span class="level-tag">${prettyLevel(ex.level)}</span>
      <span>${ex.keyDisplay} • ${ex.tempoDisplay} BPM</span>
    </div>
    <strong>${ex.title}</strong>
    <div class="hint">${ex.summary}</div>
    <div class="controls-row">
      <button class="btn secondary">Set today</button>
      ${opts.fav? `<button class="btn ghost remFav">Remove</button>`:""}
      ${opts.queue? `<button class="btn ghost remQ">Dequeue</button>`:""}
    </div>
  `;
  el.querySelector(".secondary").onclick = ()=>{ state.todayIndex = idx; switchTab('home'); renderExercise(); };
  if(opts.fav) el.querySelector(".remFav").onclick = ()=>{ state.favorites.delete(ex.uid); persistFavs(); renderFavQueue(); };
  if(opts.queue) el.querySelector(".remQ").onclick = ()=>{ state.queue = state.queue.filter(q=>q.uid!==ex.uid); persistQueue(); renderFavQueue(); };
  return el;
}

function renderCitations(){
  const list = $("#citationsList");
  list.innerHTML = "";
  Object.entries(CITATIONS).forEach(([key, meta])=>{
    const d = document.createElement("div");
    d.className = "card";
    d.innerHTML = `
      <div><b>${meta.title}</b></div>
      <div class="hint"><a href="${meta.url}" target="_blank" rel="noopener noreferrer">${meta.url}</a></div>
      <div class="hint">${meta.note||""}</div>`;
    list.appendChild(d);
  });
}
function renderGlossary(){
  const box = $("#glossaryList");
  box.innerHTML = "";
  Object.entries(GLOSSARY).forEach(([term, defs])=>{
    const def = defs[state.level] || defs.advanced || Object.values(defs)[0];
    const el = document.createElement('div');
    el.className = "card";
    el.innerHTML = `<b>${term}</b><div class="hint">${def}</div>`;
    box.appendChild(el);
  });
}

/* -------------------------
   8) ACTIONS: FAVORITES, QUEUE, NOTES, SHARE
-------------------------- */
function isFav(ex){ return state.favorites.has(ex.uid); }
function toggleFav(ex){
  if(isFav(ex)) state.favorites.delete(ex.uid); else state.favorites.add(ex.uid);
  persistFavs();
}
function persistFavs(){ localStorage.setItem('jt_favorites', JSON.stringify(Array.from(state.favorites))); }

function enqueue(ex){
  if(!state.queue.find(q=>q.uid===ex.uid)){ state.queue.push({uid:ex.uid, idx:ex.idx}); persistQueue(); renderFavQueue(); }
}
function persistQueue(){ localStorage.setItem('jt_queue', JSON.stringify(state.queue)); }

function copySummary(ex){
  const text = [
    `Level: ${prettyLevel(ex.level)} ${state.tier.t1?`| Focus: ${state.tier.t1}`:""} ${state.tier.t2?`| Flavor: ${state.tier.t2}`:""} ${state.tier.t3?`| Detail: ${state.tier.t3}`:""}`,
    `Exercise: ${ex.title}`,
    `Key: ${ex.keyDisplay} | BPM: ${ex.tempoDisplay} | Feel: ${ex.feel} | Artic: ${ex.artic} | Subdiv: ${ex.subdiv} | Duration: ${ex.minutes}m`,
    `Why: ${ex.why}`,
    `Targets: ${ex.targets.join(", ")}`,
    `Steps: ${ex.how.map((h,i)=>`${i+1}) ${h}`).join(" ")}`,
    `Refs: ${ex.refs.map(r=> `${CITATIONS[r].title} — ${CITATIONS[r].url}`).join(" | ")}`
  ].join("\n");
  return text;
}

async function shareExercise(ex){
  const text = copySummary(ex);
  const shareData = { title: "Jazz Trumpet Exercise", text, url: location.href };
  if (navigator.share){
    try{
      await navigator.share(shareData);
    }catch(err){
      await navigator.clipboard.writeText(text);
      alert("Copied summary to clipboard ✅");
    }
  } else {
    await navigator.clipboard.writeText(text);
    alert("Copied summary to clipboard ✅");
  }
}

$("#btnFavorite").onclick = ()=>{
  const list = getCatalogSafe();
  const i = ((state.todayIndex % list.length) + list.length) % list.length;
  const ex = list[i];
  toggleFav(ex);
  renderExercise();
  renderFavQueue();
};

const notesTA = $("#notes");
$("#saveNotes").onclick = ()=>{
  const day = new Date().toISOString().slice(0,10);
  state.notes[day] = notesTA.value.trim();
  localStorage.setItem('jt_notes', JSON.stringify(state.notes));
  pulse("#saveNotes");
};
$("#copySummary").onclick = ()=>{
  const list = getCatalogSafe();
  const i = ((state.todayIndex % list.length) + list.length) % list.length;
  const text = copySummary(list[i]);
  navigator.clipboard.writeText(text);
  pulse("#copySummary");
};

/* -------------------------
   9) NAVIGATION, LEVEL SWITCH, CONTROLS
-------------------------- */
function switchTab(id){
  $$("section.sheet").forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  $$(".nav-btn").forEach(n=>n.classList.toggle("active", n.dataset.target===id));
  if(id==="browser") renderBrowse();
  if(id==="citations") renderCitations();
  if(id==="glossary") renderGlossary();
  if(id==="queueFav") renderFavQueue();
}
$$(".nav-btn").forEach(btn => btn.addEventListener('click', ()=> switchTab(btn.dataset.target)));

$$(".lv").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    $$(".lv").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    state.level = btn.dataset.level;
    state.todayIndex = 0;
    state.shuffleSeed = null;
    state.tier = {t1:"", t2:"", t3:""};
    initFunnel();
    renderExercise(); renderBrowse(); renderGlossary();
  });
});

/* Next / Shuffle */
$("#btnNext").onclick = ()=>{ state.todayIndex++; renderExercise(); pulse("#btnNext"); };
$("#btnShuffle").onclick = ()=>{
  state.shuffleSeed = Math.floor(Math.random()*1e9);
  state.todayIndex = 0;
  renderExercise(); renderBrowse();
};

/* -------------------------
   10) STREAK
-------------------------- */
function bumpStreak(){
  const today = new Date().toDateString();
  const last = localStorage.getItem("jt_last");
  let streak = Number(localStorage.getItem("jt_streak")||0);
  if(last !== today){
    const yday = new Date(Date.now()-86400000).toDateString();
    streak = (last===yday) ? streak+1 : 1;
    localStorage.setItem("jt_last", today);
    localStorage.setItem("jt_streak", String(streak));
  }
  $("#streak").textContent = `🔥 ${streak}`;
}
function initStreak(){
  const streak = Number(localStorage.getItem("jt_streak")||0);
  $("#streak").textContent = `🔥 ${streak}`;
}

/* -------------------------
   11) METRONOME (Start/Stop + live BPM)
-------------------------- */
let audioCtx, metroRunning=false, metroId=null;
const bpmInput = $("#bpm");
const accent24 = $("#accent24");

function metroTick(accent=false){
  if(!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type="square"; o.frequency.value = accent ? 1200 : 900;
  g.gain.setValueAtTime(0.0001, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.35, audioCtx.currentTime + 0.001);
  g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.06);
  o.connect(g).connect(audioCtx.destination);
  o.start(); o.stop(audioCtx.currentTime + 0.07);
}
function bpmToMs(){
  const bpm = Math.max(30, Math.min(360, Number(bpmInput.value)||96));
  return 60000/bpm;
}
function startMetro(){
  if(metroRunning) return;
  metroRunning = true;
  let beat=1;
  const tickNow = ()=>{
    const acc = accent24.checked ? (beat===2 || beat===4) : (beat===1);
    metroTick(acc);
    beat = beat===4?1:beat+1;
  };
  tickNow();
  metroId = setInterval(tickNow, bpmToMs());
}
function stopMetro(){ metroRunning=false; clearInterval(metroId); metroId=null; }

$("#metroStart").onclick = ()=> { startMetro(); };
$("#metroStop").onclick = ()=> { stopMetro(); };
bpmInput.addEventListener('input', ()=>{
  if(metroRunning){ stopMetro(); startMetro(); }
});

/* -------------------------
   12) TIMER with Pause/Resume (distinct from metronome)
-------------------------- */
let timerId = null;
let tElapsed = 0;      // ms accumulated
let isPaused = false;  // for button label

function startTimer(){
  if (timerId) return; // already running
  const t0 = Date.now() - tElapsed; // resume from elapsed
  timerId = setInterval(()=>{
    tElapsed = Date.now() - t0;
    $("#timerReadout").textContent = mmss(tElapsed);
  }, 200);
  isPaused = false;
  const pb = $("#timerPause"); if (pb) pb.textContent = "⏸️ Pause";
}
function pauseTimer(){
  if (!timerId) return;
  clearInterval(timerId);
  timerId = null;
  isPaused = true;
  const pb = $("#timerPause"); if (pb) pb.textContent = "⏯️ Resume";
}
function stopTimer(){
  clearInterval(timerId);
  timerId = null;
  tElapsed = 0;
  isPaused = false;
  $("#timerReadout").textContent = "00:00";
  const pb = $("#timerPause"); if (pb) pb.textContent = "⏸️ Pause";
  const sb = $("#timerStart"); if (sb) sb.textContent = "▶️ Start";
}
function mmss(ms){
  const s = Math.floor(ms/1000);
  const m = Math.floor(s/60);
  const ss = (s%60).toString().padStart(2,'0');
  return `${m.toString().padStart(2,'0')}:${ss}`;
}
$("#timerStart").onclick = ()=> startTimer();
$("#timerPause").onclick = ()=>{ if (isPaused) startTimer(); else pauseTimer(); };
$("#timerStop").onclick = ()=> stopTimer();

/* -------------------------
   13) EXPORT/IMPORT — CSV + Citations CSV
-------------------------- */
$("#btnExportCitesCsv").onclick = ()=>{
  const csv = buildCitationsCSV();
  downloadFile('citations.csv', 'text/csv;charset=utf-8;', csv);
};

function buildCitationsCSV(){
  const rows = [["key","title","url","note"]];
  Object.entries(CITATIONS).forEach(([key, meta])=>{
    rows.push([key, meta.title, meta.url, meta.note||""]);
  });
  return rows.map(r=> r.map(csvEsc).join(",")).join("\n");
}

// Export user state as CSV
$("#exportState").onclick = ()=>{
  const csv = buildCSVExport();
  downloadFile('jt_data.csv', 'text/csv;charset=utf-8;', csv);
};

function buildCSVExport(){
  const rows = [];
  const push = (obj)=> rows.push(obj);

  const allForLevel = buildAllInstancesForLevel();
  const favIds = new Set(state.favorites);
  const favs = allForLevel.filter(x => favIds.has(x.uid));
  const qset = new Set(state.queue.map(q=>q.uid));
  const queueItems = allForLevel.filter(x => qset.has(x.uid));

  push({section:"meta", key:"exported_at", value:new Date().toISOString(), extra:"" });
  push({section:"meta", key:"level", value:state.level, extra:""});
  push({section:"meta", key:"focus", value:state.tier.t1, extra:""});
  push({section:"meta", key:"flavor", value:state.tier.t2, extra:""});
  push({section:"meta", key:"detail", value:state.tier.t3, extra:""});
  rows.push({section:"", key:"", value:"", extra:""});

  favs.forEach(ex=> push({section:"favorite", key:ex.uid, value:ex.title, extra:serializeExercise(ex)}));
  rows.push({section:"", key:"", value:"", extra:""});

  queueItems.forEach(ex=> push({section:"queue", key:ex.uid, value:ex.title, extra:serializeExercise(ex)}));
  rows.push({section:"", key:"", value:"", extra:""});

  Object.entries(state.notes).forEach(([date, txt])=>{
    push({section:"note", key:date, value:txt.replace(/\s+/g,' ').trim(), extra:""});
  });

  const header = "section,key,value,extra";
  const lines = rows.map(r => [r.section, r.key, r.value, r.extra].map(csvEsc).join(","));
  return [header].concat(lines).join("\n");
}
function serializeExercise(ex){
  const cats = ex.categories.join("|");
  return `level=${ex.level};key=${ex.keyDisplay};bpm=${ex.tempoDisplay};feel=${ex.feel};artic=${ex.artic};subdiv=${ex.subdiv};minutes=${ex.minutes};categories=${cats}`;
}
function csvEsc(v){
  const s = String(v == null ? "" : v);
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}
function downloadFile(name, mime, content){
  const blob = new Blob([content], {type:mime});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name; a.click(); URL.revokeObjectURL(a.href);
}

// Import CSV (from our jt_data.csv format)
$("#importState").addEventListener('change', e=>{
  const f = e.target.files?.[0]; if(!f) return;
  const fr = new FileReader();
  fr.onload = ()=>{
    try{
      const rows = parseCSV(String(fr.result));
      // Expect header: section,key,value,extra
      const idx = headerIndex(rows[0]);
      const dataRows = rows.slice(1).filter(r=> r.length>=3);
      const newState = { favorites:[], queue:[], notes:{}, level:state.level, filters:["","",""] };

      for(const r of dataRows){
        const section = r[idx.section].trim();
        const key = r[idx.key];
        const value = r[idx.value];
        const extra = r[idx.extra] || "";

        if(section === "meta"){
          if(key==="level") newState.level = value || newState.level;
          if(key==="focus") newState.filters[0] = value || "";
          if(key==="flavor") newState.filters[1] = value || "";
          if(key==="detail") newState.filters[2] = value || "";
        } else if(section === "favorite"){
          newState.favorites.push(key);
        } else if(section === "queue"){
          newState.queue.push({uid:key, idx:0}); // idx not used much; safe default
        } else if(section === "note"){
          newState.notes[key] = value;
        }
      }

      // apply
      state.favorites = new Set(newState.favorites);
      state.queue = newState.queue;
      state.notes = newState.notes;
      state.level = newState.level;
      state.tier = {t1:newState.filters[0]||"", t2:newState.filters[1]||"", t3:newState.filters[2]||""};

      persistFavs(); persistQueue();
      // UI restore
      $$(".lv").forEach(b=>b.classList.toggle("active", b.dataset.level===state.level));
      initFunnel();
      if(state.tier.t1){ tier1Sel.value = state.tier.t1; tier1Sel.dispatchEvent(new Event('change')); }
      if(state.tier.t2){ tier2Sel.value = state.tier.t2; tier2Sel.dispatchEvent(new Event('change')); }
      if(state.tier.t3){ tier3Sel.value = state.tier.t3; tier3Sel.dispatchEvent(new Event('change')); }
      renderAll();
      alert("Imported CSV ✅");
    }catch(err){
      console.error(err);
      alert("Invalid CSV");
    }
  };
  fr.readAsText(f);
});

function headerIndex(headerRow){
  const map = {section:0, key:1, value:2, extra:3};
  const lower = headerRow.map(h => (h||"").toString().trim().toLowerCase());
  Object.keys(map).forEach(k=>{
    const i = lower.indexOf(k);
    if(i>=0) map[k]=i;
  });
  return map;
}

// Basic CSV parser that handles quoted fields and newlines
function parseCSV(text){
  const rows = [];
  let i=0, field="", row=[], inQuotes=false;
  while(i<text.length){
    const c = text[i];
    if(inQuotes){
      if(c === '"'){
        if(i+1<text.length && text[i+1] === '"'){ field+='"'; i+=2; continue; }
        inQuotes = false; i++; continue;
      } else { field += c; i++; continue; }
    }else{
      if(c === '"'){ inQuotes = true; i++; continue; }
      if(c === ','){ row.push(field); field=""; i++; continue; }
      if(c === '\r'){ i++; continue; }
      if(c === '\n'){ row.push(field); rows.push(row); row=[]; field=""; i++; continue; }
      field += c; i++; continue;
    }
  }
  row.push(field); rows.push(row);
  return rows;
}

/* -------------------------
   14) COPY: LEVEL TIPS
-------------------------- */
function levelCopy(level){
  if(level==="beginner") return "Keep reps short, volume modest, and focus on steady air. If tone pinches, slow down. ✔️";
  if(level==="intermediate") return "Lean into swing phrasing & guide-tones. Use bebop passing tones with intention; resolve to 3rds/7ths. 💡";
  if(level==="advanced") return "Prioritize voice-leading and long lines. Add enclosures and ghosted upbeats. 🤔";
  if(level==="expert") return "Pro pass: unshakeable time, incisive tension–release (V7alt→I), and efficient physiology. Stop before form cracks. ❗";
  return "";
}

/* -------------------------
   15) UTILS & INIT
-------------------------- */
function pulse(sel){
  const el = (typeof sel==="string")? $(sel) : sel;
  if(!el) return;
  el.style.transform = "translateY(-1px) scale(1.02)";
  setTimeout(()=> el.style.transform = "", 160);
}
function renderAll(){
  renderExercise(); renderBrowse(); renderCitations(); renderGlossary(); renderFavQueue();
}
function init(){
  initStreak(); bumpStreak();
  renderAll();
  document.addEventListener("keydown", e=>{
    if(e.key==="ArrowRight"){ state.todayIndex++; renderExercise(); }
    if(e.key==="ArrowLeft"){ state.todayIndex--; renderExercise(); }
  });
  const day = new Date().toISOString().slice(0,10);
  $("#notes").value = state.notes[day] || "";
}
init();