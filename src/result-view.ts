import { formatTime, MIN_ACCURACY, type Result } from './progress';

export function resultView(result: Result, title: string, lessonNumber: number, last: boolean, storageWarning: boolean, icon: (name: string) => string): string {
  const accurate = result.accuracy >= MIN_ACCURACY;
  const inTime = result.maxSeconds === undefined || result.seconds <= result.maxSeconds;
  return `<button class="text-button" id="back">← Terug naar mijn lessen</button>
  <section class="result-panel ${result.passed ? '' : 'needs-practice'}">
    <div class="result-symbol">${icon(result.passed ? 'check' : 'repeat')}</div>
    <span class="eyebrow">LES ${lessonNumber} · ${title}</span>
    <h1>${result.passed ? 'Mooi gedaan!' : 'Nog even oefenen'}</h1>
    <p>${result.passed ? 'Deze oefening is afgerond. Je hebt beide doelen gehaald.' : 'Deze poging haalt nog niet alle doelen. Oefen opnieuw om je bewegingen zekerder te maken. Je mag ook verdergaan.'}</p>
    <ul class="result-goals" aria-label="Behaalde oefendoelen">
      <li class="${accurate ? 'goal-met' : 'goal-missed'}">${icon(accurate ? 'check' : 'repeat')}<div><strong>Nauwkeurigheid: ${result.accuracy}% / minimaal ${MIN_ACCURACY}%</strong><span>${accurate ? 'Doel behaald' : 'Nog niet behaald — probeer minder fouten te maken.'}</span></div></li>
      <li class="${inTime ? 'goal-met' : 'goal-missed'}">${icon(inTime ? 'check' : 'clock')}<div><strong>Tijd: ${formatTime(result.seconds)} / maximaal ${formatTime(result.maxSeconds ?? result.seconds)}</strong><span>${inTime ? 'Doel behaald' : `Nog niet behaald — ${formatTime(result.seconds - result.maxSeconds!)} boven de tijdslimiet.`}</span></div></li>
    </ul>
    <div class="result-stats"><div><strong>${result.accuracy}%</strong><span>Nauwkeurigheid</span></div><div><strong>${result.wpm}</strong><span>Woorden per minuut</span></div><div><strong>${result.seconds}s</strong><span>Geoefend</span></div></div>
    <div class="result-actions"><button id="restart" class="${result.passed ? 'secondary' : 'primary'}">${icon('repeat')} ${result.passed ? 'Opnieuw oefenen' : 'Opnieuw oefenen — aanbevolen'}</button><button id="next" class="${result.passed ? 'primary' : 'secondary'}">${last ? 'Naar je voortgang' : 'Volgende oefening'} ${icon('arrow')}</button></div>
    <small>${storageWarning ? 'Opslaan is niet gelukt.' : 'Je resultaat is opgeslagen in deze browser.'}</small>
  </section>`;
}
