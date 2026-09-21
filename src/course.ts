export type FingerMovement = { key: string; home: string; finger: string };
export type Lesson = { id: string; title: string; description: string; keys: string; stage: string; movements: FingerMovement[]; exercises: { title: string; text: string }[] };
const fingerMovements: Record<string, Omit<FingerMovement, 'key'>> = {
  a: {home:'q', finger:'linkerpink'}, e: {home:'d', finger:'linkermiddelvinger'},
  z: {home:'s', finger:'linkerringvinger'}, r: {home:'f', finger:'linkerwijsvinger'},
  i: {home:'k', finger:'rechtermiddelvinger'}, o: {home:'l', finger:'rechterringvinger'},
  t: {home:'f', finger:'linkerwijsvinger'}, u: {home:'j', finger:'rechterwijsvinger'},
  p: {home:'m', finger:'rechterpink'}, y: {home:'j', finger:'rechterwijsvinger'},
  v: {home:'f', finger:'linkerwijsvinger'}, b: {home:'f', finger:'linkerwijsvinger'},
  n: {home:'j', finger:'rechterwijsvinger'}, w: {home:'s', finger:'linkerringvinger'},
  x: {home:'d', finger:'linkermiddelvinger'}, c: {home:'f', finger:'linkerwijsvinger'},
};
const definitions = [
  ['Je eerste toetsen', 'Vind de voelbare streepjes op F en J. Hier rusten je wijsvingers.', 'fj', 'De basisrij', 'fj jf ff jj fj jf', 'fff jjj fjf jfj ffj jjf'],
  ['Een vinger verder', 'Laat je middelvingers rusten op D en K. Houd je handen ontspannen.', 'dk', 'De basisrij', 'dk kd fd jk df kj', 'fdk jkd dfd kjk fj dk'],
  ['De ringvingers', 'Voeg je ringvingers toe: links S en rechts L. Je pinken komen in de volgende les aan bod.', 'sl', 'De basisrij', 'ds sd kl lk sl ls', 'sdf jkl sl ls dsl kls'],
  ['De pinken: basisrij compleet', 'Voeg je pinken toe: links Q en rechts M. Nu rusten al je vingers op de basisrij.', 'qm', 'De basisrij', 'qs sq lm ml qf jm', 'qsdf jklm qm mq qsf mlk'],
  ['Naar het midden', 'Je wijsvingers bewegen naar G en H en keren terug naar F en J.', 'gh', 'De basisrij', 'fg jh gf hj fgf jhj', 'gh hg dfgh jhkl qsf mjh'],
  ['Je eerste woorden', 'Oefen eerst Q–A met je linkerpink, daarna D–E met je linkermiddelvinger. Keer telkens terug naar de basisrij.', 'ae', 'Woorden bouwen', 'qa aq de ed qa de aq ed', 'de les de dag de jas de kaas de haas de smaak'],
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

// Extra oefenstof per les, uitsluitend met de tot dan toe aangeleerde toetsen.
const combinedPractice = [
  'fjf jfj fff jjj ffj jjf fjj jff jf fj jj ff jfj fjf jff fjj ffj jjf fj jf ffff jjjj fjfj jfjf ffjj jjff fjf jfj fj jf ff jj fjj jff jf fj',
  'fd dk kj jf df jk kd fj fdk jkd kdf djf fjk kdj dfd kjk ffk jjd ddj kkf fdj jkf dkj kfd fj dk jf kd fdd jkk dff kjj fdjk kjdf dfkj jkfd fdk jkd dfd kjk',
  'sdf jkl fds lkj sl ls ds kl sd lk sf jl fs lj sdk kls dsl lsd sk dl ks ld sdf jkl dsf klj fsl jds sdl lks ssf llj dds kkl sdfj jkls sl ls ds sd kl lk',
  'qsdf jklm qsd mlk qf jm fq mj qs lm sq ml qdm msq qsf mlk dqm kqs qj mf jq fm qsdf mlkj fdqs klmj qqf mmj ssq llm qsk mld qdf mkj qsf jlm qm mq qsdf jklm',
  'fgf jhj dfg hjk gh hg qsg mlh fgh jhg gfd hkj sg lh gs hl qg mh gq hm dfgh jhkl qsf mjh gfg hjh fghg jhgh qdfg mlkh ghs hgl fgj hjf qsdfg hjklm gh hg fg jh',
  'de dag de jas de haas de kaas de les de smaak de dame de maag de maas de sla de mama de massa de adem de ham de jam de sla de lak de hal de hak de heg de haag de lage la de lege fles de gammele gsm de gladde aal de smalle la',
  'de zee de zaal de ezel de maker de aarde de haas de kaas de rare les de rare jas de rare smaak de gare kaas de lege la de lage heg de gare kaas de ezel de gare sla de lage la de lege garage',
  'ik lees de les de radio is mooi de giraffe is mooi de roos is rood de zee is laag de jas is grijs ik mis de kaas de ezel is gek de maker is klaar de haas is erg gek de doos is leeg de kamer is mooi de oma is daar ik lees graag de regel de olie is glad de olie is glad de dag is fris',
  'de muis zit stil ik lees uit de kast de deur is toe de taart is klaar de stoel staat daar de kat rust hier ik eet kaas de auto staat stil de roos staat daar de muis gaat door het gras de meester leest de les uit ik maak de juiste keuze de sleutel ligt hier de grote tas is leeg het huis is grijs het huis is groot',
  'de poes slaapt op de mat de papegaai eet de sla ik typ de juiste regel de pop staat op de kast de pot staat klaar de piloot stuurt het toestel de puppy speelt met de stok de papa pakt de tas de poes kijkt uit het raam de muis kruipt door het gat de pyjama is geel de tulp staat op tafel de soep is klaar ik stap uit de auto de papegaai roept luid de poes spitst haar oor',
  'ik typ een brief de bomen staan in de tuin de buren praten buiten een vogel vliegt over het pad de bakker bakt een brood de bus stopt bij het plein ik neem mijn tas en stap naar buiten de bloemen staan in een vaas de brief ligt op tafel mijn broer leest een boek de kinderen spelen bij de boom de trein rijdt naar de stad ik begin met een korte regel en blijf rustig typen mijn vingers vinden de toetsen vanzelf',
  'wij oefenen elke dag de clown zwaait naar de taxi de computer staat op tafel wij fietsen langs het water de bakker zet zes broden klaar de cactus staat bij het raam de boxer rent achter de bal wij zoeken een rustig plekje in het park de chauffeur wacht bij de taxi een extra oefening helpt mijn vingers de juiste weg te vinden ik schrijf een bericht voor mijn zus de muziek klinkt zacht door de kamer wij pakken onze spullen en wandelen naar school',
  'langs het water staan hoge bomen en kleine bloemen wij volgen het pad naar een houten brug aan de overkant ligt een veld waar kinderen met een bal spelen een hond loopt rustig naast zijn baas op een bank leest iemand een boek wij groeten elkaar en lopen verder bij de vijver blijven we even staan om naar de eenden te kijken daarna gaan we naar huis en zetten een kop thee ik pak mijn schrift en schrijf op wat we onderweg hebben gezien de wandeling was kort maar er viel veel te ontdekken morgen kiezen we een ander pad en nemen we wat brood mee voor onderweg',
  'Mijn handen rusten op de basisrij. Ik voel de streepjes op de toetsen. Mijn blik blijft op het scherm. Eerst zoek ik een rustig ritme. Daarna typ ik een korte zin. Elke spatie geeft mijn vingers even rust. Buiten rijdt een fietser voorbij. Op tafel staat een glas water. Naast het raam ligt een boek. Ik lees de woorden en typ ze over. Soms maak ik een fout. Ik zoek de juiste toets en ga verder. Mijn schouders blijven ontspannen. Aan het einde lees ik de tekst nog eens. Het gaat steeds vlotter. Morgen oefen ik weer een stukje.',
  'Vandaag schrijf ik over een wandeling door het dorp. Bij de voordeur trek ik mijn jas aan, pak mijn tas en stap naar buiten. De lucht is fris, maar de zon voelt warm. Op de hoek staat de bakker al klaar. Ik koop een brood, twee koeken en een klein zakje koffie. Daarna wandel ik langs het plein. Een jongen zet zijn fiets tegen de muur, terwijl zijn zus naar hem zwaait. Bij de brug blijf ik even staan. Het water glinstert en een eend zwemt rustig voorbij. Verderop zit mijn buur op een bank. We praten over de tuin, het weer en onze plannen voor morgen. Dan loop ik terug naar huis. Ik leg het brood op tafel, hang mijn jas op en open het raam. De geur van verse koffie vult de kamer. Na het ontbijt ga ik achter mijn computer zitten. Ik schrijf mijn verhaal in korte zinnen. Mijn vingers bewegen rustig over de toetsen, terwijl ik naar het scherm blijf kijken. Als een woord lastig is, neem ik even de tijd. Aan het einde lees ik alles na. Ik ben blij met wat ik vandaag heb geoefend.',
] as const;

function combinedExercise(original: string, extra: string): string {
  const words = `${original} ${extra}`.split(' ');
  const result: string[] = [];
  let length = 0;
  // Vijf keer de oorspronkelijke omvang, afgerond op een volledig woord.
  for (let index = 0; length < original.length * 5 || (original.endsWith('.') && !result.at(-1)?.endsWith('.')); index++) {
    const word = words[index % words.length];
    length += word.length + (result.length ? 1 : 0);
    result.push(word);
  }
  return result.join(' ');
}
// Eerst elke beweging twee keer na elkaar, daarna twee rondes met afwisseling.
// Zo komt elke toetscombinatie vier keer aan bod in een voorspelbaar ritme.
function repetitionDrill(drill: string): string {
  const focused = drill.split(' ').flatMap(group => [group, group]).join(' ');
  return `${focused} ${drill} ${drill}`;
}

function guidedDrill(keys: string, drill: string): string {
  const movements = [...keys].filter(key => fingerMovements[key]);
  if (!movements.length) return repetitionDrill(drill);
  const isolated = movements.map(key => {
    const {home} = fingerMovements[key];
    return Array(4).fill(`${home}${key} ${key}${home}`).join(' ');
  });
  return [...isolated, drill, drill].join(' ');
}

// IDs blijven stabiel voor opgeslagen resultaten: de nieuwe ringvingerles krijgt
// ID 15, de pinkenles behoudt ID 3 van de oorspronkelijke volledige basisrij.
export const lessons: Lesson[] = definitions.map(([title, description, keys, stage, drill, reading], i) => ({id:`lesson-${i === 2 ? 15 : i < 2 ? i + 1 : i}`, title, description, keys, stage, movements:[...keys].filter(key=>fingerMovements[key]).map(key=>({key,...fingerMovements[key]})), exercises: [
  {title: stage === 'De puntjes op de i' ? 'Verken de zinnen' : 'Verken de toetsen', text:/[a-z]/.test(keys) ? guidedDrill(keys, drill) : drill},
  {title: stage === 'De basisrij' ? 'Vind je ritme' : 'Woorden & ritme', text:stage === 'De basisrij' ? Array(4).fill(reading).join(' ') : reading},
  {title:'Alles samen', text:combinedExercise(stage === 'De basisrij' ? `${drill} ${reading}` : `${reading} ${stage === 'De puntjes op de i' ? drill : reading}`, combinedPractice[i])},
]}));
export const exerciseId = (lesson: number, exercise: number) => `${lessons[lesson].id}-${exercise}`;
export const totalExercises = lessons.reduce((sum, lesson) => sum + lesson.exercises.length, 0);
