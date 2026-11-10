// Free APIs and Generators for dynamic typing practice (No API key required)

const wordBanks = {
  Beginner: [
    'bright', 'calm', 'forest', 'gentle', 'morning', 'open', 'quiet', 'river',
    'smile', 'simple', 'warm', 'window', 'yellow', 'breeze', 'garden', 'little',
    'cloud', 'stone', 'water', 'silver', 'green', 'happy', 'planet', 'travel',
    'flower', 'spring', 'summer', 'winter', 'autumn', 'island', 'valley', 'shadow',
    'golden', 'flight', 'bridge', 'castle', 'memory', 'friend', 'family', 'future',
    'spark', 'ocean', 'silver', 'peace', 'timber', 'blossom', 'meadow', 'whisper'
  ],
  Advanced: [
    'deliberate', 'persistence', 'remarkable', 'perspective', 'efficient',
    'articulate', 'flourish', 'luminous', 'curiosity', 'navigate', 'elaborate',
    'formidable', 'subtle', 'coherence', 'eloquent', 'harmonious', 'resilience',
    'authentic', 'innovate', 'momentum', 'pragmatic', 'scrutiny', 'transcend',
    'versatile', 'whimsical', 'catalyst', 'disruption', 'equilibrium', 'paradigm',
    'magnificent', 'substantial', 'formidable', 'vulnerable', 'synchronize'
  ],
  Expert: [
    'idiosyncratic', 'juxtaposition', 'unequivocally', 'conscientious',
    'metamorphosis', 'quintessential', 'ubiquitous', 'serendipity', 'magnanimous',
    'ephemeral', 'anachronistic', 'cacophony', 'grandiloquent', 'iconoclast',
    'obfuscate', 'perfunctory', 'recalcitrant', 'sycophant', 'vicissitude',
    'verisimilitude', 'surreptitious', 'pulchritudinous', 'prestidigitation'
  ]
};

const sentenceBanks = {
  Beginner: [
    'A little practice each day can make a big difference.',
    'Stay relaxed, find your rhythm, and enjoy the progress.',
    'Clear your mind and let your fingers glide across the keys.',
    'Consistency is the secret to building natural speed and confidence.',
    'Every journey starts with a single deliberate keystroke.',
    'Focus on hitting each key cleanly and speed will follow on its own.'
  ],
  Advanced: [
    'Precision comes from patience; speed follows naturally when your hands learn where every letter lives.',
    'Can you keep a steady pace through punctuation, varied casing, and longer sentence structures?',
    'Good typists rarely race ahead; they stay calm and maintain a rhythmic cadence.',
    'Mistakes are valuable signals that show exactly where your muscle memory hesitates.',
    'Fluency is achieved when your thoughts flow directly onto the screen without conscious effort.'
  ],
  Expert: [
    '"Accuracy," she remarked, "is not the enemy of speed - it is the foundation upon which sustainable speed is built."',
    'In challenging passages, typists must navigate intricate punctuation; can you sustain 98% precision?',
    '"The instruments aren\'t infallible," he noted, "but careful calibration reveals what a hurried glance misses."',
    'When complex syntax, hyphenated compounds, and quotes intersect, steadfast composure is your greatest asset.'
  ]
};

const paragraphBanks = {
  Beginner: [
    'A quiet morning is a lovely time to begin again. The sun rises slowly, birds fill the air with song, and a fresh page waits. Take a breath, settle in, and let your fingers find their rhythm.',
    'Learning to type with all fingers takes time, but every single session builds real muscle memory. Keep your hands comfortable, take steady breaths, and enjoy the feeling of getting better every day.',
    'A walk through a quiet park can clear your thoughts completely. The wind rustles through tall trees, sunlight reflects off the pond, and for a short while, everything feels simple and peaceful.'
  ],
  Advanced: [
    'Good typing is less about racing and more about staying consistent. When you slow down enough to notice each mistake, your hands begin to learn the right movement. Before long, confidence replaces hesitation and accuracy becomes second nature.',
    'Effective written communication is one of the most powerful skills you can build. Being able to type quickly and effortlessly frees your mind to concentrate on ideas rather than the mechanics of the keyboard.',
    'The concept of flow is a mental state where action and awareness merge seamlessly. In typing, reaching flow means your fingers respond instantly to the words on the screen without hesitation or friction.'
  ],
  Expert: [
    'At 08:45 a.m., the observatory\'s chief researcher recorded a 97.8% reading - an unusually precise result. "The instruments aren\'t infallible," he noted, "but careful calibration, repeated measurements, and a healthy skepticism can reveal what a hurried glance would miss."',
    'Historically, the QWERTY typewriter mechanism was designed to prevent jamming of mechanical typebars. Modern ergonomic alternatives, such as Colemak and Dvorak, optimize finger movement to minimize repetitive strain and travel distance.',
    'In modern computing architectures, asynchronous input processing decouples hardware keystroke interrupts from graphical frame rendering, guaranteeing responsive tactile feedback under high operating system load.'
  ]
};

// Clean text to ensure standard typing characters (replace un-typeable smart quotes, dashes, etc.)
function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[—–]/g, ' - ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getRandomFromList(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function getRandomWordsFromBank(level, count = 15) {
  const bank = wordBanks[level] || wordBanks.Beginner;
  const shuffled = [...bank].sort(() => Math.random() - 0.5);
  // Pick words, loop if count > bank.length
  const words = [];
  while (words.length < count) {
    words.push(...shuffled);
  }
  return words.slice(0, count).join(' ');
}

// Generate dynamic numbers procedurally based on level
function generateNumbers(level) {
  if (level === 'Beginner') {
    const nums = [];
    for (let i = 0; i < 18; i++) {
      nums.push(Math.floor(Math.random() * 950) + 10);
    }
    return nums.join(' ');
  }

  if (level === 'Advanced') {
    const items = [];
    for (let i = 0; i < 12; i++) {
      const mode = i % 4;
      if (mode === 0) items.push((Math.floor(Math.random() * 900000) + 1000).toLocaleString('en-US'));
      else if (mode === 1) items.push((Math.random() * 99 + 1).toFixed(2));
      else if (mode === 2) items.push(`${(Math.random() * 90 + 5).toFixed(1)}%`);
      else items.push(`-${Math.floor(Math.random() * 900) + 10}`);
    }
    return items.join(' ');
  }

  // Expert
  const currencies = ['$', '₹', '€', '£'];
  const cur = currencies[Math.floor(Math.random() * currencies.length)];
  const items = [
    `${cur}${(Math.floor(Math.random() * 900000) + 1000).toLocaleString('en-US')}.${Math.floor(Math.random() * 90 + 10)}`,
    `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
    `${(Math.random() * 80 + 10).toFixed(2)}%`,
    `${(Math.floor(Math.random() * 9000000) + 1000000).toLocaleString('en-US')}`,
    '3.14159',
    `2026-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
    `+91 ${Math.floor(Math.random() * 90000 + 10000)} ${Math.floor(Math.random() * 90000 + 10000)}`,
    `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase()}`,
    `v${Math.floor(Math.random() * 9) + 1}.${Math.floor(Math.random() * 20)}.${Math.floor(Math.random() * 10)}`,
    `${(Math.random() * 999).toFixed(3)}ms`
  ];
  return items.sort(() => Math.random() - 0.5).join(' ');
}

// Fetch random words from free Random Word API with timeout
async function fetchWordsFromApi(level) {
  const configs = {
    Beginner: { length: 5, number: 18 },
    Advanced: { length: 8, number: 14 },
    Expert: { length: 11, number: 10 }
  };
  const { length, number } = configs[level] || configs.Beginner;
  const url = `https://random-word-api.herokuapp.com/word?length=${length}&number=${number}`;

  const res = await fetch(url, { signal: AbortSignal.timeout(2500) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (Array.isArray(data) && data.length > 0) {
    return data.join(' ').toLowerCase();
  }
  throw new Error('Invalid word data');
}

// Fetch random sentence/quote from free DummyJSON Quotes API
async function fetchSentenceFromApi(level) {
  const res = await fetch('https://dummyjson.com/quotes/random', { signal: AbortSignal.timeout(2500) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data?.quote) {
    if (level === 'Expert' && data.author) {
      return cleanText(`"${data.quote}" - ${data.author}`);
    }
    return cleanText(data.quote);
  }
  throw new Error('Invalid quote data');
}

// Fetch random paragraph from free DummyJSON Posts API
async function fetchParagraphFromApi(level) {
  const randomSkip = Math.floor(Math.random() * 240);
  const url = `https://dummyjson.com/posts?limit=1&skip=${randomSkip}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(2500) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const body = data?.posts?.[0]?.body;
  if (body) {
    const cleaned = cleanText(body);
    if (level === 'Beginner') {
      // Split into first 2 sentences if long
      const sentences = cleaned.match(/[^.!?]+[.!?]+/g);
      if (sentences && sentences.length >= 2) {
        return sentences.slice(0, 2).join(' ').trim();
      }
    }
    return cleaned;
  }
  throw new Error('Invalid post data');
}

/**
 * Main fetch function:
 * Retrieves dynamic typing text using free public APIs,
 * falling back smoothly to randomized offline banks if the network or API is unavailable.
 */
export async function getDynamicTypingText(level = 'Beginner', type = 'Words') {
  if (type === 'Numbers') {
    return {
      text: generateNumbers(level),
      source: 'Generated'
    };
  }

  if (type === 'Words') {
    try {
      const text = await fetchWordsFromApi(level);
      return { text, source: 'Random Word API' };
    } catch {
      return {
        text: getRandomWordsFromBank(level, level === 'Expert' ? 10 : level === 'Advanced' ? 14 : 18),
        source: 'Word Bank'
      };
    }
  }

  if (type === 'Sentences') {
    try {
      const text = await fetchSentenceFromApi(level);
      return { text, source: 'DummyJSON Quotes API' };
    } catch {
      return {
        text: getRandomFromList(sentenceBanks[level] || sentenceBanks.Beginner),
        source: 'Sentence Bank'
      };
    }
  }

  if (type === 'Paragraphs') {
    try {
      const text = await fetchParagraphFromApi(level);
      return { text, source: 'DummyJSON Posts API' };
    } catch {
      return {
        text: getRandomFromList(paragraphBanks[level] || paragraphBanks.Beginner),
        source: 'Paragraph Bank'
      };
    }
  }

  return {
    text: getRandomWordsFromBank(level),
    source: 'Default Bank'
  };
}
