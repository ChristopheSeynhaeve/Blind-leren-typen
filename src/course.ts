export type Lesson = { id: string; title: string; description: string; keys: string; stage: string; exercises: { title: string; text: string }[] };
const definitions = [
  ['Je eerste toetsen', 'Vind de voelbare streepjes op F en J. Hier rusten je wijsvingers.', 'fj', 'De basisrij', 'fj jf ff jj fj jf', 'fff jjj fjf jfj ffj jjf'],
  ['Een vinger verder', 'Laat je middelvingers rusten op D en K. Houd je handen ontspannen.', 'dk', 'De basisrij', 'dk kd fd jk df kj', 'fdk jkd dfd kjk fj dk'],
  ['De basisrij compleet', 'Voeg je ringvingers en pinken toe: links Q en S, rechts L en M.', 'qslm', 'De basisrij', 'qsdf jklm qs df jk lm', 'sl ls dm md qf jm qs kl'],
  ['Naar het midden', 'Je wijsvingers bewegen naar G en H en keren terug naar F en J.', 'gh', 'De basisrij', 'fg jh gf hj fgf jhj', 'gh hg dfgh jhkl qsf mjh'],
  ['Je eerste woorden', 'Reik met je linkerpink naar A en je middelvinger naar E.', 'ae', 'Woorden bouwen', 'fa af de ed ka ak le el', 'de les de dag de jas de kaas de haas de smaak'],
  ['Meer om te lezen', 'Gebruik je ringvinger voor Z en je wijsvinger voor R.', 'zr', 'Woorden bouwen', 'sz zs fr rf za re er', 'de zee de maker de aarde de zaal de ezel'],
  ['De bovenrij rechts', 'Je rechter middelvinger gaat naar I, je ringvinger naar O.', 'io', 'Woorden bouwen', 'ki ik lo ol is of', 'ik lees de les de radio is mooi de giraffe is mooi'],
  ['Een groter bereik', 'Beide wijsvingers reiken omhoog: links T, rechts U.', 'tu', 'Woorden bouwen', 'ft tf ju uj te uit', 'de muis zit stil ik lees uit de kast'],
  ['De bovenrij compleet', 'Voeg P met je rechterpink toe en Y met je rechterwijsvinger.', 'py', 'Woorden bouwen', 'mp pm jy yj py po', 'de poes slaapt op de mat de papegaai eet de sla'],
  ['Op naar beneden', 'Met je wijsvingers bereik je V, B en N. Keer steeds terug naar de basisrij.', 'vbn', 'Vlotter typen', 'fv fb jn vf bf nj', 'ik typ een brief de bomen staan in de tuin'],
  ['Alle letters in de vingers', 'Maak het alfabet compleet met W, X en C op de onderste rij.', 'wxc', 'Vlotter typen', 'sw dx fc ws xd cf', 'wij oefenen elke dag de clown zwaait naar de taxi'],
  ['Van woorden naar zinnen', 'Houd een rustig ritme aan. Gebruik je duim voor de spatie.', '', 'Vlotter typen', 'een kleine stap maakt een groot verschil', 'buiten schijnt de zon en wij wandelen samen door het park'],
  ['Hoofdletters en punten', 'Houd Shift in met de andere hand. De punt typ je met Shift + puntkomma.', '.', 'De puntjes op de i', 'Ik leer typen. Dit gaat al goed.', 'Elke dag een beetje oefenen helpt. Neem rustig de tijd.'],
  ['Je eerste verhaal', 'Combineer alle letters met hoofdletters, punten en komma’s.', ',', 'De puntjes op de i', 'Hallo, wat fijn dat je er bent. We gaan samen aan de slag.', 'De zon schijnt door het raam. Ik zet een kop thee, schuif mijn stoel aan en begin te typen. Met elke les gaat het een beetje beter.'],
] as const;
export const lessons: Lesson[] = definitions.map(([title, description, keys, stage, drill, reading], i) => ({id:`lesson-${i+1}`, title, description, keys, stage, exercises: [
  {title: i < 12 ? 'Verken de toetsen' : 'Verken de zinnen', text:drill},
  {title: i < 4 ? 'Vind je ritme' : 'Woorden & ritme', text:reading},
  {title:'Alles samen', text:i < 4 ? `${drill} ${reading}` : `${reading} ${i < 12 ? reading : drill}`},
]}));
export const exerciseId = (lesson: number, exercise: number) => `${lessons[lesson].id}-${exercise}`;
export const totalExercises = lessons.reduce((sum, lesson) => sum + lesson.exercises.length, 0);
