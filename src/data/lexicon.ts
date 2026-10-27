import { LevelConfig, LexiconWord } from '../types/game';
import { createSeededRng, splitThaanaSyllables } from '../utils/thaana';

function wordEntry(
  word: string,
  meaningEn: string,
  transliteration: string,
  category: string,
  explicitSyllables?: string[]
): LexiconWord {
  return {
    word,
    syllables: explicitSyllables || splitThaanaSyllables(word),
    meaningEn,
    transliteration,
    category,
  };
}

export const MALDIVIAN_ATOLLS: string[] = [
  'ކ. މާލެ (K. Malé)',
  'ސ. އައްޑޫ (S. Addu)',
  'ޏ. ފުވައްމުލައް (Gn. Fuvahmulah)',
  'ހދ. ކުޅުދުއްފުށި (HDh. Kulhudhuffushi)',
  'ބ. އޭދަފުށި (B. Eydhafushi)',
  'ގދ. ތިނަދޫ (GDh. Thinadhoo)',
  'ޅ. ނައިފަރު (Lh. Naifaru)',
  'ލ. ގަން (L. Gan)',
  'ހއ. ދިއްދޫ (HA. Dhidhdhoo)',
  'ރ. އުނގޫފާރު (R. Ungoofaaru)',
  'އދ. މަހިބަދޫ (ADh. Mahibadhoo)',
  'ގއ. ވިލިނގިލި (GA. Vilingili)',
];

/**
 * Exact 8x8 grid recreation inspired by the user's uploaded reference screenshot
 * (/public/assets/aistudio/image_a22d7c16.png) so players can play the iconic reference board!
 */
export const CLASSIC_REFERENCE_GRID: string[][] = [
  ['ރި', 'ބަ', 'ރު', 'ޖު', 'ސަ', 'މި', 'ވަ', 'އި'],
  ['ފަ', 'ސަ', 'ވި', 'ބަ', 'ޖެ', 'ރެ', 'ރި', 'ސަ'],
  ['ޒަ', 'ޖަ', 'ގި', 'މަ', 'ޖި', 'ރަ', 'އާ', 'ކަ'],
  ['ތި', 'ބި', 'ނަ', 'ދެ', 'ރި', 'ސާ', 'ދެ', 'މު'],
  ['ވާ', 'އި', 'ރަ', 'ބެ', 'ފި', 'ހި', 'ރު', 'ލު'],
  ['ކި', 'ރޮ', 'ގި', 'މާ', 'ރި', 'ލޮ', 'ރާ', 'ދެ'],
  ['ރި', 'ސަ', 'ބި', 'އެ', 'ޖެ', 'ލި', 'ޔަ', 'ލި'],
  ['ވާ', 'ގަ', 'ތު', 'އެ', 'ފު', 'ރެ', 'ކަ', 'އި'],
];

export const CLASSIC_REFERENCE_WORDS: LexiconWord[] = [
  wordEntry('ސަޖުރުބި', 'Classic Reference Row 1 (RTL)', 'sajurubi', 'classic', ['ސަ', 'ޖު', 'ރު', 'ބި', 'ރި']),
  wordEntry('އިސަކަމުލު', 'Classic Reference Right Column', 'isakamulu', 'classic', ['އި', 'ސަ', 'ކަ', 'މު', 'ލު']),
  wordEntry('މިވަރެޖެ', 'Classic Diagonal Pattern', 'mivareje', 'classic', ['މި', 'ރެ', 'ޖި', 'ދެ']),
  wordEntry('ސަވިބަޖެ', 'Second Row Sequence', 'savibaje', 'classic', ['ރި', 'ރެ', 'ޖެ', 'ބަ', 'ވި', 'ސަ']),
  wordEntry('ރާލޮރިމާ', 'Sixth Row RTL Sequence', 'raalorimaa', 'classic', ['ރާ', 'ލޮ', 'ރި', 'މާ', 'ގި']),
  wordEntry('ލިޔަލިޖެ', 'Seventh Row RTL Sequence', 'liyalije', 'classic', ['ލި', 'ޔަ', 'ލި', 'ޖެ', 'އެ']),
];

export const DHIVEHI_LEXICON: LexiconWord[] = [
  // Category: Islands & Atolls (ރަށްތަކާއި އަތޮޅުތައް)
  wordEntry('ދިވެހި', 'Maldivian / Dhivehi', 'dhivehi', 'islands'),
  wordEntry('މާލެ', 'Malé Capital Island', 'maale', 'islands'),
  wordEntry('އައްޑޫ', 'Addu Atoll', 'addoo', 'islands'),
  wordEntry('ތިނަދޫ', 'Thinadhoo Island', 'thinadhoo', 'islands'),
  wordEntry('ހިތަދޫ', 'Hithadhoo Island', 'hithadhoo', 'islands'),
  wordEntry('ނައިފަރު', 'Naifaru Island', 'naifaru', 'islands'),
  wordEntry('މާފުށި', 'Maafushi Island', 'maafushi', 'islands'),
  wordEntry('އޭދަފުށި', 'Eydhafushi Island', 'eydhafushi', 'islands'),
  wordEntry('ފުވައްމުލައް', 'Fuvahmulah Island', 'fuvahmulah', 'islands'),
  wordEntry('ވިލިނގިލި', 'Vilingili Island', 'vilingili', 'islands'),
  wordEntry('ދިއްދޫ', 'Dhidhdhoo Island', 'dhidhdhoo', 'islands'),
  wordEntry('ކުޅުދުއްފުށި', 'Kulhudhuffushi City', 'kulhudhuffushi', 'islands'),
  wordEntry('އަތޮޅު', 'Coral Atoll', 'atholhu', 'islands'),
  wordEntry('ރަށްފުށު', 'Island Life / Rural Island', 'rahfushu', 'islands'),
  wordEntry('ފަޅުރަށް', 'Uninhabited Lagoon Island', 'falhurah', 'islands'),

  // Category: Ocean & Marine Life (ކަނޑާއި ފަރުގެ ދިރުން)
  wordEntry('މަސްވެރި', 'Fisherman', 'masveri', 'ocean'),
  wordEntry('ފަރުމަސް', 'Reef Fish', 'farumas', 'ocean'),
  wordEntry('ކަނޑުމަސް', 'Skipjack Tuna', 'kandumas', 'ocean'),
  wordEntry('މިޔަރު', 'Shark', 'miyaru', 'ocean'),
  wordEntry('ވެލާ', 'Sea Turtle', 'velaa', 'ocean'),
  wordEntry('ކަހަނބު', 'Hawksbill Turtle', 'kahanbu', 'ocean'),
  wordEntry('މުރަކަ', 'Coral', 'muraka', 'ocean'),
  wordEntry('ދޯނި', 'Traditional Maldivian Boat', 'dhoani', 'ocean'),
  wordEntry('ރާޅު', 'Ocean Wave', 'raalhu', 'ocean'),
  wordEntry('ފަޅު', 'Turquoise Lagoon', 'falhu', 'ocean'),
  wordEntry('ގޮނޑުދޮށް', 'Sandy Beach Shore', 'gondudhoh', 'ocean'),
  wordEntry('ކޯމަސް', 'Dolphin', 'koamas', 'ocean'),
  wordEntry('އެންމަޑި', 'Manta Ray', 'enmadi', 'ocean'),
  wordEntry('ފެހުރިހި', 'Whale Shark', 'fehurihi', 'ocean'),

  // Category: Culture & Heritage (ސަގާފަތާއި އާދަކާދަ)
  wordEntry('ބޮޑުބެރު', 'Traditional Bodu Beru Drums', 'boduberu', 'culture'),
  wordEntry('ފޭލި', 'Traditional Woven Sarong', 'feyli', 'culture'),
  wordEntry('ތާނަ', 'Thaana Script', 'thaana', 'culture'),
  wordEntry('ރައިވަރު', 'Classical Dhivehi Poetry', 'raivaru', 'culture'),
  wordEntry('މާހެފުން', 'Ramadan Eve Feast Tradition', 'maahefun', 'culture'),
  wordEntry('ފަންވަތް', 'Palm Frond Manuscript', 'fanvaiy', 'culture'),
  wordEntry('ބަސްފޮތް', 'Dictionary / Lexicon', 'basfoiy', 'culture'),
  wordEntry('ސަގާފަތް', 'Culture & Heritage', 'sagaafaiy', 'culture'),
  wordEntry('ތާރީޚު', 'History', 'thaareekhu', 'culture'),
  wordEntry('ލިޔެލާ', 'Traditional Lacquer Craft', 'liyelaa', 'culture'),
  wordEntry('ހިރިގާ', 'Coral Stone Carving', 'hirigaa', 'culture'),
  wordEntry('އުނދޯލި', 'Traditional Hanging Swing', 'undhoali', 'culture'),

  // Category: Cuisine & Tropical Nature (ކާބޯތަކެއްޗާއި ގަސްގަހާގެހި)
  wordEntry('ގަރުދިޔަ', 'Traditional Clear Tuna Broth', 'garudhiya', 'cuisine'),
  wordEntry('މަސްހުނި', 'Shredded Smoked Tuna & Coconut', 'mashuni', 'cuisine'),
  wordEntry('ރިހާކުރު', 'Slow-Cooked Tuna Paste', 'rihaakuru', 'cuisine'),
  wordEntry('ކުރުނބާ', 'Young Green Coconut', 'kurunbaa', 'cuisine'),
  wordEntry('ބަނބުކެޔޮ', 'Breadfruit', 'banbukeyo', 'cuisine'),
  wordEntry('ފަތްކެޔޮ', 'Ripe Island Banana', 'faiykeyo', 'cuisine'),
  wordEntry('ހެދިކާ', 'Traditional Savory Short Eats', 'hedhikaa', 'cuisine'),
  wordEntry('ބޮނޑިބަތް', 'Festive Sweetened Rice', 'bondibaiy', 'cuisine'),
  wordEntry('ކަށިކެޔޮ', 'Screwpine / Pandanus Fruit', 'kashikeyo', 'cuisine'),
  wordEntry('ދިވެހިރުއް', 'Maldivian Coconut Palm', 'dhivehiruh', 'cuisine'),
  wordEntry('އަނބު', 'Sweet Mango', 'anbu', 'cuisine'),
  wordEntry('ފިނިފެންމާ', 'Pink Rose', 'finifenmaa', 'cuisine'),

  // Category: Everyday Dhivehi & Wisdom (ޢާންމު ބަސްތަކާއި ޢިލްމު)
  wordEntry('މަދަރުސާ', 'School / Academy', 'madharusaa', 'everyday'),
  wordEntry('އުފާވެރި', 'Joyful & Happy', 'ufaaveri', 'everyday'),
  wordEntry('ހިތްވަރު', 'Courage & Determination', 'hiyvaru', 'everyday'),
  wordEntry('ކާމިޔާބު', 'Success & Victory', 'kaamiyaabu', 'everyday'),
  wordEntry('ތަޖުރިބާ', 'Experience & Skill', 'thajuribaa', 'everyday'),
  wordEntry('އެކުވެރި', 'Friendly & United', 'ekuveri', 'everyday'),
  wordEntry('އިޙްތިރާމް', 'Respect & Honor', 'ihthiraam', 'everyday'),
  wordEntry('ސަމާލުކަން', 'Focus & Attention', 'samaalukan', 'everyday'),
  wordEntry('މުދައްރިސް', 'Teacher / Mentor', 'mudharris', 'everyday'),
  wordEntry('ދަރިވަރު', 'Student / Scholar', 'dharivaru', 'everyday'),
  wordEntry('ހެނދުނު', 'Morning', 'hendhunu', 'everyday'),
  wordEntry('ރޭގަނޑު', 'Nighttime', 'reygandu', 'everyday'),

  // Category: Kids Fun Words (ކުދިންގެ އުފާވެރި ބަސްތައް)
  wordEntry('ބުޅާ', 'Cat 🐱', 'bulhaa', 'kids'),
  wordEntry('ދޫނި', 'Bird 🐦', 'dhooni', 'kids'),
  wordEntry('ކޮކާ', 'Butterfly 🦋', 'kokaa', 'kids'),
  wordEntry('މަންމަ', 'Mom 💛', 'manma', 'kids'),
  wordEntry('ބައްޕަ', 'Dad 💙', 'bappa', 'kids'),
  wordEntry('އިރު', 'Sun ☀️', 'iru', 'kids'),
  wordEntry('ހަނދު', 'Moon 🌙', 'handhu', 'kids'),
  wordEntry('ތަރި', 'Star ⭐', 'thari', 'kids'),
  wordEntry('މާ', 'Flower 🌸', 'maa', 'kids'),
  wordEntry('ފެހި', 'Green 🌿', 'fehi', 'kids'),
  wordEntry('ރަތް', 'Red 🎈', 'raiy', 'kids'),
  wordEntry('ނޫ', 'Blue 🌊', 'noo', 'kids'),
];

export interface CategoryPackInfo {
  id: string;
  titleDv: string;
  titleEn: string;
  descriptionDv: string;
  accentColor: string;
  levels: LevelConfig[];
}

export const OFFLINE_CAMPAIGN_PACKS: CategoryPackInfo[] = [
  {
    id: 'pack-kids',
    titleDv: 'ކުދިންގެ އުފާވެރި ބަސްތައް',
    titleEn: 'Kids Fun Adventure',
    descriptionDv: 'ކުޑަކުދިންނަށް ފަސޭހަ އަދި މަޖާ ދިވެހި ބަސްތައް',
    accentColor: '#F97316',
    levels: [
      {
        id: 'kids-1',
        titleDv: 'ލެވެލް 1: ޖަނަވާރާއި ދޫނިސޫފާސޫފި',
        titleEn: 'Friendly Animals & Nature',
        subtitleDv: 'ބުޅާ، ދޫނި، ކޮކާ އަދި ވެލާ ހޯދާލަމާ!',
        category: 'kids',
        mode: 'campaign',
        gridSize: 7,
        words: DHIVEHI_LEXICON.filter((w) =>
          ['ބުޅާ', 'ދޫނި', 'ކޮކާ', 'ވެލާ', 'ކޯމަސް', 'މުރަކަ'].includes(w.word)
        ),
        seedKey: 'campaign-kids-1',
      },
      {
        id: 'kids-2',
        titleDv: 'ލެވެލް 2: އާއިލާ އާއި އުޑުމަތި',
        titleEn: 'Family, Sun & Stars',
        subtitleDv: 'މަންމަ، ބައްޕަ، އިރު، ހަނދު އަދި ތަރި',
        category: 'kids',
        mode: 'campaign',
        gridSize: 7,
        words: DHIVEHI_LEXICON.filter((w) =>
          ['މަންމަ', 'ބައްޕަ', 'އިރު', 'ހަނދު', 'ތަރި', 'އަނބު'].includes(w.word)
        ),
        seedKey: 'campaign-kids-2',
      },
    ],
  },
  {
    id: 'pack-classic',
    titleDv: 'ފުރަތަމަ ގޮންޖެހުން (ކްލެސިކް)',
    titleEn: 'Classic Reference Pack',
    descriptionDv: 'ދިވެހި އަކުރާއި ފިލި ގުޅުވައިގެން ބަސް ހޯދާ ކްލެސިކް ގޮތް',
    accentColor: '#10B981',
    levels: [
      {
        id: 'classic-ref',
        titleDv: 'ލެވެލް 1: ކްލެސިކް ބޯޑު',
        titleEn: 'Reference Classic Grid',
        subtitleDv: 'ތަމްރީނު ފެށުމުގެ ބޯޑު',
        category: 'classic',
        mode: 'campaign',
        gridSize: 8,
        words: CLASSIC_REFERENCE_WORDS,
        seedKey: 'classic-ref-board',
        fixedGrid: CLASSIC_REFERENCE_GRID,
      },
      {
        id: 'classic-2',
        titleDv: 'ލެވެލް 2: ފަސޭހަ ބަސްތައް',
        titleEn: 'Essential Thaana Words',
        subtitleDv: 'ޢާންމުކޮށް ބޭނުންކުރާ ކުރު ބަސްތައް',
        category: 'everyday',
        mode: 'campaign',
        gridSize: 8,
        words: DHIVEHI_LEXICON.filter((w) =>
          ['ދިވެހި', 'ތާނަ', 'ބަސްފޮތް', 'ހެނދުނު', 'ރޭގަނޑު', 'އެކުވެރި'].includes(w.word)
        ),
        seedKey: 'campaign-classic-2',
      },
    ],
  },
  {
    id: 'pack-islands',
    titleDv: 'ދިވެހި ރަށްތަކާއި އަތޮޅުތައް',
    titleEn: 'Islands & Atolls',
    descriptionDv: 'ރާއްޖޭގެ މަޝްހޫރު ރަށްތަކާއި އަތޮޅުތަކުގެ ނަންތައް',
    accentColor: '#0D9488',
    levels: [
      {
        id: 'islands-1',
        titleDv: 'ލެވެލް 1: އުތުރާއި މެދުރާއްޖެތެރެ',
        titleEn: 'Northern & Central Islands',
        subtitleDv: 'މާލެ އާއި އުތުރުގެ ރަށްތައް',
        category: 'islands',
        mode: 'campaign',
        gridSize: 8,
        words: DHIVEHI_LEXICON.filter((w) =>
          ['މާލެ', 'ނައިފަރު', 'މާފުށި', 'އޭދަފުށި', 'ދިއްދޫ', 'އަތޮޅު'].includes(w.word)
        ),
        seedKey: 'campaign-islands-1',
      },
      {
        id: 'islands-2',
        titleDv: 'ލެވެލް 2: ދެކުނުގެ އަތޮޅުތައް',
        titleEn: 'Southern Atoll Jewels',
        subtitleDv: 'ދެކުނުގެ ރަށްތަކާއި ފަޅުތައް',
        category: 'islands',
        mode: 'campaign',
        gridSize: 8,
        words: DHIVEHI_LEXICON.filter((w) =>
          ['އައްޑޫ', 'ތިނަދޫ', 'ހިތަދޫ', 'ފުވައްމުލައް', 'ރަށްފުށު', 'ފަޅުރަށް'].includes(w.word)
        ),
        seedKey: 'campaign-islands-2',
      },
    ],
  },
  {
    id: 'pack-ocean',
    titleDv: 'ކަނޑާއި ފަރުގެ ދިރުން',
    titleEn: 'Ocean & Coral Reefs',
    descriptionDv: 'ދިވެހި ކަނޑުތަކާއި ފަރުތަކުގައި އުޅޭ މަސްމަހާމެހި',
    accentColor: '#0284C7',
    levels: [
      {
        id: 'ocean-1',
        titleDv: 'ލެވެލް 1: ފަޅާއި ގޮނޑުދޮށް',
        titleEn: 'Lagoon & Shore',
        subtitleDv: 'ދޯންޏާއި ފަޅުތެރޭގެ ރީތިކަން',
        category: 'ocean',
        mode: 'campaign',
        gridSize: 8,
        words: DHIVEHI_LEXICON.filter((w) =>
          ['ދޯނި', 'ރާޅު', 'ފަޅު', 'މުރަކަ', 'ވެލާ', 'ގޮނޑުދޮށް'].includes(w.word)
        ),
        seedKey: 'campaign-ocean-1',
      },
      {
        id: 'ocean-2',
        titleDv: 'ލެވެލް 2: މާކަނޑުގެ ދިރުން',
        titleEn: 'Deep Blue Marine Life',
        subtitleDv: 'މަސްވެރިކަމާއި ކަނޑުގެ ދިރުންތައް',
        category: 'ocean',
        mode: 'campaign',
        gridSize: 8,
        words: DHIVEHI_LEXICON.filter((w) =>
          ['މަސްވެރި', 'ފަރުމަސް', 'ކަނޑުމަސް', 'މިޔަރު', 'ކޯމަސް', 'އެންމަޑި'].includes(w.word)
        ),
        seedKey: 'campaign-ocean-2',
      },
    ],
  },
  {
    id: 'pack-culture',
    titleDv: 'ދިވެހި ސަގާފަތާއި ކާބޯތަކެތި',
    titleEn: 'Culture & Island Cuisine',
    descriptionDv: 'ދިވެހިންގެ އާދަކާދަ އާއި މީރު ކާބޯތަކެތި',
    accentColor: '#E11D48',
    levels: [
      {
        id: 'culture-1',
        titleDv: 'ލެވެލް 1: އާދަކާދަ އާއި ތާރީޚު',
        titleEn: 'Heritage & Craft',
        subtitleDv: 'ބޮޑުބެރާއި ދިވެހި ފަންނުވެރިކަން',
        category: 'culture',
        mode: 'campaign',
        gridSize: 8,
        words: DHIVEHI_LEXICON.filter((w) =>
          ['ބޮޑުބެރު', 'ފޭލި', 'ރައިވަރު', 'ފަންވަތް', 'ލިޔެލާ', 'ހިރިގާ'].includes(w.word)
        ),
        seedKey: 'campaign-culture-1',
      },
      {
        id: 'culture-2',
        titleDv: 'ލެވެލް 2: ދިވެހި ރަހަތައް',
        titleEn: 'Traditional Maldivian Flavors',
        subtitleDv: 'ގަރުދިޔަ، މަސްހުނި އަދި ހެދިކާ',
        category: 'cuisine',
        mode: 'campaign',
        gridSize: 8,
        words: DHIVEHI_LEXICON.filter((w) =>
          ['ގަރުދިޔަ', 'މަސްހުނި', 'ރިހާކުރު', 'ކުރުނބާ', 'ހެދިކާ', 'ބޮނޑިބަތް'].includes(w.word)
        ),
        seedKey: 'campaign-culture-2',
      },
    ],
  },
  {
    id: 'pack-wisdom',
    titleDv: 'ޢިލްމާއި ހިތްވަރު',
    titleEn: 'Knowledge & Everyday Life',
    descriptionDv: 'މަދަރުސާ އާއި ދިރިއުޅުމުގެ މުހިންމު ބަސްތައް',
    accentColor: '#7C3AED',
    levels: [
      {
        id: 'wisdom-1',
        titleDv: 'ލެވެލް 1: ކިޔެވުމާއި ކާމިޔާބީ',
        titleEn: 'Learning & Achievement',
        subtitleDv: 'ޢިލްމާއި ތަޖުރިބާ',
        category: 'everyday',
        mode: 'campaign',
        gridSize: 8,
        words: DHIVEHI_LEXICON.filter((w) =>
          ['މަދަރުސާ', 'އުފާވެރި', 'ހިތްވަރު', 'ކާމިޔާބު', 'ތަޖުރިބާ', 'ދަރިވަރު'].includes(w.word)
        ),
        seedKey: 'campaign-wisdom-1',
      },
    ],
  },
];

/**
 * Generates a deterministic Daily Challenge LevelConfig for a given YYYY-MM-DD date string.
 * Every player worldwide gets the exact same 6 Dhivehi words and 8x8 board on the same date,
 * even when playing completely offline!
 */
export function getDailyLevelConfig(dateKey: string): LevelConfig {
  const rng = createSeededRng(`bashoadha-daily-${dateKey}`);
  const eligible = DHIVEHI_LEXICON.filter(
    (w) => w.syllables.length >= 3 && w.syllables.length <= 6
  );

  const pool = [...eligible];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = pool[i];
    pool[i] = pool[j];
    pool[j] = tmp;
  }

  const selectedWords = pool.slice(0, 6);

  return {
    id: `daily-${dateKey}`,
    titleDv: `ދުވަހުގެ ގޮންޖެހުން (${dateKey})`,
    titleEn: `Daily Challenge · ${dateKey}`,
    subtitleDv: 'ކޮންމެ ދުވަހަކު ވެސް ހުރިހާ ކުޅުންތެރިންނަށް އެއް ބޯޑެއް',
    category: 'daily',
    mode: 'daily',
    gridSize: 8,
    words: selectedWords,
    seedKey: `daily-board-seed-${dateKey}`,
  };
}
