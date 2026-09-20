import './style.css';
import { lessons, exerciseId, totalExercises } from './course';
import { calculateResult, parseProgress, STORAGE_KEY, timeLimit, formatTime, type Progress, type Result } from './progress';
import { resultView } from './result-view';

const icons: Record<string,string> = {
 keyboard:'<rect x="3" y="6" width="18" height="12" rx="3"/><path d="M7 10h.01M11 10h.01M15 10h.01M18 10h.01M7 14h.01M10 14h7"/>',
 book:'<path d="M12 5v15M3 4h4a5 5 0 0 1 5 2 5 5 0 0 1 5-2h4v14h-4a5 5 0 0 0-5 2 5 5 0 0 0-5-2H3z"/>',
 chart:'<path d="M5 20V10m7 10V4m7 16v-7"/>',
 arrow:'<path d="M5 12h14m-5-5 5 5-5 5"/>',
 check:'<path d="m5 12 4 4L19 6"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
 bolt:'<path d="m13 2-9 12h7l-1 8 10-13h-7z"/>',
 shield:'<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6z"/><path d="m8 12 3 3 5-6"/>',
 repeat:'<path d="M4 9a8 8 0 0 1 13-4l3 3M20 3v5h-5M20 15A8 8 0 0 1 7 19l-3-3M4 21v-5h5"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.1"/>',
 leaf:'<path d="M20 3C7 2 2 7 5 15s17 6 15-12ZM5 20 15 9"/>',
};
const icon = (name:string) => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.book}</svg>`;
const app = document.querySelector<HTMLDivElement>('#app')!;
let storageWarning = false;
let progress: Progress = {};
try { progress = parseProgress(localStorage.getItem(STORAGE_KEY)); } catch { storageWarning = true; }
let selected = 0;
let step = 0;
let page: 'lessons' | 'progress' | 'method' = 'lessons';
let filter = 'all';
let active = false;
let finished: Result | null = null;
let position = 0;
let attempts = 0;
let started = 0;
let elapsed = 0;
let wrong = false;
let paused = false;
let timer: ReturnType<typeof setInterval> | undefined;
const passed = (l:number,e:number) => (progress[exerciseId(l,e)] || []).some(r=>r.passed);
const lessonDone = (l:number) => lessons[l].exercises.filter((_, e)=>passed(l,e)).length;
const completed = () => lessons.reduce((s,_,i)=>s+lessonDone(i),0);
const results = () => Object.values(progress).flat();
function recommended() { for(let l=0;l<lessons.length;l++) for(let e=0;e<3;e++) if(!passed(l,e)) return {l,e}; return {l:0,e:0}; }
({l:selected,e:step}=recommended());
function save() { try { localStorage.setItem(STORAGE_KEY,JSON.stringify(progress)); } catch { storageWarning = true; } }
function stopTimer() { if(timer) clearInterval(timer); timer=undefined; if(started) {elapsed+=performance.now()-started; started=0;} }
function currentElapsed() {return elapsed+(started?performance.now()-started:0);}
function currentLimit() { return timeLimit(lessons[selected].exercises[step].text.length, lessons[selected].stage); }
function movementGuide() {
 const movements=lessons[selected].movements;
 if(!movements.length || step!==0)return '';
 return `<div class="movement-guide"><strong>Eerst per vinger, daarna combineren</strong><div>${movements.map(m=>`<span><b>${m.home.toUpperCase()} ↔ ${m.key.toUpperCase()}</b> ${m.finger}</span>`).join('')}</div><small>Gebruik voor elk paar dezelfde vinger en keer terug naar de basisrij.</small></div>`;
}
function resetExercise() { stopTimer(); position=0; attempts=0; elapsed=0; wrong=false; finished=null; paused=false; }
function render() {
 const done=completed();
 app.innerHTML=`<div class="shell"><aside class="sidebar"><a class="brand" href="#" aria-label="Letterlijk startpagina"><span class="brand-mark">${icon('keyboard')}</span>letterlijk<span class="brand-dot">.</span></a><div class="workspace-label">JOUW TYPAVONTUUR</div><nav aria-label="Hoofdnavigatie"><button data-page="lessons" class="nav-item ${page==='lessons'?'selected':''}">${icon('book')}<span>Mijn lessen</span><span class="nav-count">${lessons.length}</span></button><button data-page="progress" class="nav-item ${page==='progress'?'selected':''}">${icon('chart')}Mijn voortgang</button><button data-page="method" class="nav-item ${page==='method'?'selected':''}">${icon('info')}Zo werkt het</button></nav><div class="sidebar-bottom"><div class="small-progress"><span>Een beetje beter, elke dag.</span><strong>${Math.round(done/totalExercises*100)}%</strong><div class="progress-track"><i style="width:${done/totalExercises*100}%"></i></div><small>${done} van ${totalExercises} oefeningen afgerond</small></div><div class="local-note">${icon('shield')}<span>Je voortgang blijft bij jou.<br><strong>Opgeslagen in deze browser</strong></span></div></div></aside><div class="main-wrap"><header class="topbar"><span>Jouw plek om blind te leren typen</span><div class="layout-badge"><span class="belgium">🇧🇪</span> Belgisch AZERTY <span class="badge-dot"></span></div></header><main>${storageWarning?'<div class="warning" role="alert">Opslaan is niet beschikbaar. Je kunt oefenen, maar je voortgang blijft alleen bewaard zolang deze pagina open is.</div>':''}${active?exerciseView():page==='lessons'?lessonsView():page==='progress'?progressView():methodView()}</main><footer><span>Grote stappen beginnen met kleine aanslagen.</span><span>Gemaakt voor Belgisch AZERTY ${icon('keyboard')}</span></footer></div></div>`;
 bind();
 if(active&&!finished) { drawTyping(); document.querySelector<HTMLTextAreaElement>('#typing-input')?.focus({preventScroll:true}); }
}
function lessonsView() {
 const next=recommended();
 return `<div class="page-heading"><div><div class="eyebrow">RUSTIG OEFENEN. ZEKER GROEIEN.</div><h1>Letter voor letter vooruit<span>.</span></h1><p>Leer blind typen, op jouw tempo. Van je eerste toetsen tot vlotte zinnen.</p></div><span class="heading-art">${icon('leaf')}</span></div><section class="continue-card"><div class="continue-copy"><span class="pill">${completed()?'JOUW VOLGENDE STAP':'KLAAR VOOR JE EERSTE STAP?'}</span><h2>${lessons[next.l].title}</h2><p>${lessons[next.l].description}</p><button class="primary" id="continue">${results().length?'Ga verder met oefenen':'Start je eerste oefening'} ${icon('arrow')}</button><span class="duration">${icon('clock')} 2–5 minuten per oefening</span></div><div class="hero-keys" aria-hidden="true"><span class="key-caption">VIND JE BASISPOSITIE</span><div class="floating-keys"><kbd>Q</kbd><kbd>S</kbd><kbd>D</kbd><kbd class="home-key">F<i></i></kbd></div><div class="floating-keys second"><kbd class="home-key">J<i></i></kbd><kbd>K</kbd><kbd>L</kbd><kbd>M</kbd></div><span class="key-foot">Ontspan je handen. De rest volgt.</span></div></section><div class="stats-row"><div class="stat">${icon('book')}<div><strong>${lessons.filter((_,i)=>lessonDone(i)===3).length}<span> / ${lessons.length}</span></strong><small>Lessen afgerond</small></div></div><div class="stat">${icon('target')}<div><strong>${results().length?Math.round(results().reduce((s,r)=>s+r.accuracy,0)/results().length)+'%':'—'}</strong><small>Gemiddelde nauwkeurigheid</small></div></div><div class="stat">${icon('clock')}<div><strong>${Math.round(results().reduce((s,r)=>s+r.seconds,0)/60)}<span> min</span></strong><small>Tijd geoefend</small></div></div><div class="stat encouragement">${icon('leaf')}<div><strong>Elke aanslag telt</strong><small>Nauwkeurigheid vóór snelheid.</small></div></div></div><section class="course-section"><div class="section-heading"><div><h2>Jouw leerpad <span>${lessons.length} lessen</span></h2><p>Begin bij de basis of kies een les om opnieuw te oefenen.</p></div><div class="filters" role="group" aria-label="Lessen filteren"><button data-filter="all" class="${filter==='all'?'on':''}">Alle lessen</button><button data-filter="open" class="${filter==='open'?'on':''}">Te oefenen</button><button data-filter="done" class="${filter==='done'?'on':''}">Afgerond</button></div></div><div class="course-layout"><div class="lesson-list">${lessonList()}</div><aside class="lesson-detail">${detailView()}</aside></div></section>`;
}
function lessonList() {
 let stage=''; let html='';
 lessons.forEach((l,i)=>{
  const n=lessonDone(i); if(filter==='done'&&n!==3||filter==='open'&&n===3)return;
  if(stage!==l.stage) {stage=l.stage;html+=`<div class="stage-label">${['De basisrij','Woorden bouwen','Vlotter typen','De puntjes op de i'].indexOf(stage)+1}<span>${stage}</span><i></i></div>`;}
  html+=`<button class="lesson-row ${selected===i?'current':''}" data-lesson="${i}" aria-pressed="${selected===i}"><span class="lesson-number ${n===3?'done':''}">${n===3?icon('check'):String(i+1).padStart(2,'0')}</span><span class="lesson-info"><strong>${l.title}</strong><small>${l.keys?`Nieuwe toetsen <b>${l.keys.toUpperCase().split('').join(' · ')}</b>`:'Alle letters samen'}<span class="mobile-count"> · ${n}/3</span></small></span><span class="lesson-status">${n===3?'Afgerond':n?`${n}/3 afgerond`:resultsForLesson(i)?'In uitvoering':'3 oefeningen'}</span><span class="row-arrow">${icon('arrow')}</span></button>`;
 });
 return html||'<div class="empty-state">Nog geen afgeronde lessen. Elke oefening brengt je een stap dichterbij.</div>';
}
function resultsForLesson(l:number) {return lessons[l].exercises.some((_,e)=>(progress[exerciseId(l,e)]||[]).length);}
function detailView() {
 const l=lessons[selected];
 return `<div class="detail-top"><span class="eyebrow">LES ${String(selected+1).padStart(2,'0')}</span><span>${lessonDone(selected)}/3 afgerond</span></div><h3>${l.title}</h3><p>${l.description}</p><div class="detail-keys">${(l.keys||'qsdfjklm').split('').map(k=>`<kbd>${k.toUpperCase()}</kbd>`).join('')}</div><div class="detail-divider"></div><h4>Stap voor stap</h4><div class="exercise-options">${l.exercises.map((e,i)=>{ const history=progress[exerciseId(selected,i)]||[]; return `<button data-start="${i}" class="exercise-option"><span class="step-circle ${passed(selected,i)?'done':''}">${passed(selected,i)?icon('check'):i+1}</span><span><strong>${e.title}</strong>${history.length&&!passed(selected,i)?'<small class="retry-status">Nog niet behaald &middot; opnieuw oefenen</small>':''}<small>${history.length?`Beste score: ${Math.max(...history.map(r=>r.accuracy))}% · ${history.length}× geoefend`:`${e.text.length} tekens · ${i===0?'Ontdekken':i===1?'Oefenen':'Herhalen'}`}</small></span>${icon(history.length?'repeat':'arrow')}</button>`;}).join('')}</div><div class="tip"><span>✦</span><p><strong>Goed is beter dan snel.</strong><br>Haal minstens 95% nauwkeurigheid en blijf binnen de tijdslimiet. Herhalen mag altijd.</p></div>`;
}
function keyboard() {
 const rows=[['²','&','é','"',"'",'(','§','è','!','ç','à',')','-','⌫'],['Tab','a','z','e','r','t','y','u','i','o','p','^','$'],['Caps','q','s','d','f','g','h','j','k','l','m','ù','µ','↵'],['Shift','<','w','x','c','v','b','n',',',';',':','=','Shift']];
 const available=lessons.slice(0,selected+1).map(l=>l.keys).join('');
 return `<div class="keyboard" aria-label="Belgisch AZERTY-toetsenbord">${rows.map((row,i)=>`<div class="keyboard-row row-${i}">${row.map(k=>`<span class="keyboard-key ${k.length>1||k==='↵'||k==='⌫'?'wide':''} ${available.includes(k)?'learned':''} ${k==='f'||k==='j'?'home':''}" data-key="${k==='"'?'&quot;':k==='<'?'&lt;':k}">${k==='<'?'&lt;':k}<i></i></span>`).join('')}</div>`).join('')}<div class="keyboard-row"><span class="keyboard-key space" data-key=" ">spatie</span></div></div>`;
}
function exerciseView() {
 const l=lessons[selected]; const e=l.exercises[step];
 if(finished) return resultView(finished, e.title, selected+1, selected===lessons.length-1&&step===2, storageWarning, icon);
 return `<div class="exercise-header"><button class="text-button" id="back">← Mijn lessen</button><span>Les ${selected+1} van ${lessons.length} <span class="muted">/</span> Oefening ${step+1} van 3</span><button class="text-button" id="restart">${icon('repeat')} Opnieuw</button></div><div class="practice-heading"><span class="eyebrow">${l.title.toUpperCase()}</span><h1>${e.title}</h1><p>${l.description}</p></div>${movementGuide()}<p class="exercise-goals">Doelen: minimaal 95% nauwkeurigheid &middot; maximaal ${formatTime(currentLimit())} <span id="time-feedback" role="status"></span></p><section class="typing-card"><div class="typing-toolbar"><span id="typing-status">${icon('keyboard')} Typ de tekst hieronder om te beginnen</span><span><b id="live-accuracy">100%</b> nauwkeurig <i>·</i> <b id="live-time">0:00</b></span></div><div class="typing-area" id="typing-area"><div id="typing-text" class="typing-text" aria-hidden="true"></div><label class="sr-only" for="typing-input">Typ deze tekst: ${e.text}</label><textarea id="typing-input" autocomplete="off" autocapitalize="off" spellcheck="false" aria-describedby="input-help" rows="1"></textarea></div><div class="typing-bottom"><span id="input-help">${paused?'Gepauzeerd. Klik op de tekst om verder te gaan.':'Volg de gemarkeerde toets. Een fout? Probeer dezelfde letter opnieuw.'}</span><span id="character-count">0 / ${e.text.length}</span></div><div class="progress-track"><i id="exercise-progress" style="width:0%"></i></div></section><div class="keyboard-heading"><span>JE TOETSENBORD ALS HOUVAST</span><span><i class="legend-dot"></i> Volgende toets</span></div>${keyboard()}<div class="practice-tip">${icon('info')} Laat je vingers terugkeren naar <strong>Q S D F</strong> en <strong>J K L M</strong>. Kijk naar je scherm.</div>`;
}
function drawTyping() {
 const text=lessons[selected].exercises[step].text;
 const target=document.querySelector('#typing-text'); if(!target)return;
 target.replaceChildren(...Array.from(text).map((char,i)=>{const span=document.createElement('span');span.textContent=char;span.className=i<position?'typed':i===position?`cursor ${wrong?'incorrect':''}`:'';return span;}));
 document.querySelector('#character-count')!.textContent=`${position} / ${text.length}`;
 (document.querySelector('#exercise-progress') as HTMLElement).style.width=`${position/text.length*100}%`;
 document.querySelector('#live-accuracy')!.textContent=`${attempts?Math.floor(position/attempts*1000)/10:100}%`;
 document.querySelectorAll<HTMLElement>('[data-key]').forEach(el=>{
  let next=text[position]||'';let key=next.toLowerCase();if(next==='.')key=';';
  el.classList.toggle('next-key',el.dataset.key===key || el.dataset.key==='Shift'&&(next==='.'||/[A-Z]/.test(next)));
 });
 document.querySelector('.cursor')?.scrollIntoView({block:'nearest'});
}
function startTimer() { if(started)return; started=performance.now();paused=false; document.querySelector('#typing-status')!.textContent='Goed bezig. Houd je eigen ritme aan.';document.querySelector('#input-help')!.textContent='Volg de gemarkeerde toets. Een fout? Probeer dezelfde letter opnieuw.';timer=setInterval(()=>{const secs=Math.floor(currentElapsed()/1000);const overdue=currentElapsed()>currentLimit()*1000;const feedback=document.querySelector('#time-feedback');if(feedback)feedback.textContent=overdue?'Tijdslimiet overschreden. Typ rustig verder; opnieuw oefenen is aanbevolen.':'';const node=document.querySelector('#live-time');node?.classList.toggle('over-time',overdue);if(node)node.textContent=`${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}`;},250); }
function typeChar(char:string) {
 if(!active||finished)return;
 startTimer(); attempts++;
 const text=lessons[selected].exercises[step].text;
 if(char===text[position]) {position++;wrong=false;}else wrong=true;
 if(position===text.length) {stopTimer();finished=calculateResult(position,attempts,elapsed,currentLimit());const id=exerciseId(selected,step);progress[id]=[...(progress[id]||[]),finished].slice(-30);save();render();}else drawTyping();
}
function progressView() {
 const all=results();
 return `<div class="page-heading"><div><div class="eyebrow">KIJK EENS HOEVER JE BENT</div><h1>Jouw vooruitgang<span>.</span></h1><p>Een helder overzicht van elke stap die je hebt gezet.</p></div></div><div class="overview-grid"><div class="overview-card">${icon('book')}<strong>${completed()} / ${totalExercises}</strong><span>Oefeningen afgerond</span></div><div class="overview-card">${icon('bolt')}<strong>${all.length?Math.max(...all.map(r=>r.wpm)):0}</strong><span>Hoogste woorden per minuut</span></div><div class="overview-card">${icon('target')}<strong>${all.length?Math.round(all.reduce((s,r)=>s+r.accuracy,0)/all.length):0}%</strong><span>Gemiddelde nauwkeurigheid</span></div></div><section class="history-card"><h2>Je lessen in één oogopslag</h2>${lessons.map((l,i)=>`<button class="progress-lesson" data-open="${i}"><span>${String(i+1).padStart(2,'0')} · ${l.title}</span><div class="progress-track"><i style="width:${lessonDone(i)/3*100}%"></i></div><small>${lessonDone(i)}/3</small>${icon('arrow')}</button>`).join('')}</section><section class="history-card"><h2>Recent geoefend</h2>${all.length?`<div class="history-table"><table><thead><tr><th>Oefening</th><th>Datum</th><th>Nauwkeurig</th><th>Woorden/min</th></tr></thead><tbody>${Object.entries(progress).flatMap(([key,rs])=>rs.map(r=>({key,...r}))).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,10).map(r=>{const match=r.key.match(/lesson-(\d+)-(\d+)/)!;const l=lessons.find(lesson=>lesson.id===`lesson-${match[1]}`);return l?`<tr><td>${l.title} · ${Number(match[2])+1}</td><td>${new Date(r.date).toLocaleDateString('nl-BE')}</td><td>${r.accuracy}%</td><td>${r.wpm}</td></tr>`:'';}).join('')}</tbody></table></div>`:'<p>Je eerste resultaat verschijnt hier zodra je een oefening uittypt.</p><button class="primary" id="continue">Begin met oefenen '+icon('arrow')+'</button>'}</section><p class="privacy-note">Je gegevens blijven in deze browser op dit apparaat. Bij het wissen van browsergegevens verdwijnt ook je voortgang.</p>`;
}
function methodView() { return `<div class="page-heading"><div><div class="eyebrow">EEN GOEDE BASIS MAAKT HET VERSCHIL</div><h1>Zo leer je blind typen<span>.</span></h1><p>Geen haast. Wel een duidelijk plan.</p></div></div><section class="method-card"><h2>Van basisrij naar volledige zinnen</h2><p>We beginnen op de basisrij Q S D F – J K L M. Eerst de wijsvingers, dan de andere vingers. Vervolgens reik je naar de bovenrij en de onderrij. Met elke uitbreiding oefen je ook de eerder geleerde letters.</p><p>De lesstructuur is geïnspireerd op de basisrijmethode van <a href="https://www.typingmission.com/nl-be/typemission-voor-scholen/typemethode" target="_blank" rel="noreferrer">TypeMission</a> en de rijgewijze opbouw van <a href="https://typingfast.net/be/lessons/" target="_blank" rel="noreferrer">TypingFast voor Belgisch AZERTY</a>. Onze precieze lettergroepen en Nederlandse oefenteksten zijn eigen uitwerkingen, geen overgenomen cursus.</p><h3>Drie stappen in elke les</h3><ol><li><strong>Verkennen.</strong> Oefen nieuwe letters op de boven- en onderrij eerst uitsluitend met de basistoets van dezelfde vinger, zoals Q-A. Daarna volgen de volgende vinger en gemengde combinaties.</li><li><strong>Ritme vinden.</strong> Combineer bekende letters. Vanaf les 6 typ je echte woorden.</li><li><strong>Alles samen.</strong> Herhaal wat je leerde en groei door naar zinnen.</li></ol><h3>Zo haal je het meeste uit een oefening</h3><ul><li>Zit ontspannen, zet je voeten op de grond en kijk naar het scherm.</li><li>Voel de streepjes op F en J. Gebruik je duimen voor de spatie.</li><li>Oefen liever elke dag kort dan één keer heel lang.</li><li>Een verkeerde toets telt als fout. De cursor wacht tot je de juiste letter typt.</li><li>Een oefening is afgerond bij minstens 95% nauwkeurigheid en binnen de aangegeven tijdslimiet. Je mag altijd verdergaan, ook als een doel nog niet behaald is.</li></ul><h3>De tijdslimiet</h3><p>Elke oefening krijgt een limiet op basis van de tekstlengte: 8 woorden per minuut bij de basisrij, 10 bij woorden bouwen, 12 bij vlotter typen en 15 bij hoofdletters en leestekens. Daarbij krijg je 10 seconden speling, met altijd minstens 30 seconden. De oefening stopt niet als de tijd om is. Eerder behaalde resultaten blijven behouden volgens de toenmalige doelen.</p><h3>Je resultaten</h3><p>Nauwkeurigheid is het aantal juiste aanslagen gedeeld door alle aanslagen. Typesnelheid rekent met vijf tekens per woord, inclusief spaties. De timer begint bij je eerste aanslag en pauzeert als het invoerveld de focus verliest.</p><h3>Belgisch AZERTY</h3><p>Stel ook je fysieke toetsenbord in je besturingssysteem in op Belgisch AZERTY. De M staat op de basisrij; een punt typ je met Shift + puntkomma. We oefenen alle 26 letters, hoofdletters, de punt en de komma. Cijfers en accenten vallen buiten deze eerste cursus.</p><h3>Alleen in je browser</h3><p>Er is geen account of database. Je voortgang wordt lokaal bewaard en wordt niet gesynchroniseerd tussen apparaten of browsers. Privémodus of het wissen van browsergegevens kan je voortgang verwijderen.</p></section>`; }
function launch(l:number,e:number) {resetExercise();selected=l;step=e;active=true;page='lessons';render();window.scrollTo(0,0);}
function bind() {
 document.querySelector('.brand')?.addEventListener('click',e=>{e.preventDefault();resetExercise();active=false;page='lessons';render();});
 document.querySelectorAll<HTMLButtonElement>('[data-page]').forEach(b=>b.onclick=()=>{resetExercise();active=false;page=b.dataset.page as typeof page;render();window.scrollTo(0,0);});
 document.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter!;render();});
 document.querySelectorAll<HTMLButtonElement>('[data-lesson]').forEach(b=>b.onclick=()=>{selected=Number(b.dataset.lesson);render();if(window.innerWidth<1050)document.querySelector('.lesson-detail')?.scrollIntoView({behavior:'smooth',block:'start'});});
 document.querySelectorAll<HTMLButtonElement>('[data-start]').forEach(b=>b.onclick=()=>launch(selected,Number(b.dataset.start)));
 document.querySelectorAll<HTMLButtonElement>('[data-open]').forEach(b=>b.onclick=()=>{selected=Number(b.dataset.open);page='lessons';filter='all';render();document.querySelector('.course-section')?.scrollIntoView({behavior:'smooth'});});
 document.querySelector('#continue')?.addEventListener('click',()=>{const n=recommended();launch(n.l,n.e);});
 document.querySelector('#back')?.addEventListener('click',()=>{resetExercise();active=false;render();});
 document.querySelector('#restart')?.addEventListener('click',()=>launch(selected,step));
 document.querySelector('#next')?.addEventListener('click',()=>{if(selected===lessons.length-1&&step===2){resetExercise();active=false;page='progress';render();}else launch(step===2?selected+1:selected,(step+1)%3);});
 const input=document.querySelector<HTMLTextAreaElement>('#typing-input');
 if(input) {
  input.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey||e.isComposing)return;if(e.key.length===1){e.preventDefault();typeChar(e.key);}else if(e.key==='Backspace'||e.key==='Enter'){e.preventDefault();}});
  input.addEventListener('paste',e=>e.preventDefault());
  input.addEventListener('beforeinput',e=>{if(e.inputType==='insertText'&&e.data&&Array.from(e.data).length===1){e.preventDefault();typeChar(e.data);}else e.preventDefault();});
  input.addEventListener('blur',()=>{if(!finished&&started){stopTimer();paused=true;const help=document.querySelector('#input-help');if(help)help.textContent='Gepauzeerd. Klik op de tekst om verder te gaan.';}});
  document.querySelector('#typing-area')?.addEventListener('click',()=>input.focus());
 }
}
document.addEventListener('visibilitychange',()=>{if(document.hidden){document.querySelector<HTMLTextAreaElement>('#typing-input')?.blur();}});
render();
