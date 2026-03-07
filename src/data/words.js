export const wordsSets = {
    common: [
        "the", "be", "to", "of", "and", "a", "in", "that", "have", "it",
        "for", "not", "on", "with", "he", "as", "you", "do", "at", "this",
        "but", "his", "by", "from", "they", "we", "say", "her", "she", "or",
        "an", "will", "my", "one", "all", "would", "there", "their", "what",
        "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
        "when", "make", "can", "like", "time", "no", "just", "him", "know",
        "take", "people", "into", "year", "your", "good", "some", "could",
        "them", "see", "other", "than", "then", "now", "look", "only", "come",
        "its", "over", "think", "also", "back", "after", "use", "two", "how",
        "our", "work", "first", "well", "even", "new", "want", "because",
        "any", "these", "give", "day", "most", "us"
    ],
    rare: [
        "absurd", "abyss", "affix", "askew", "avenue", "awkward", "axiom", "azure",
        "bagpipes", "bandwagon", "banjo", "bayou", "beekeeper", "blitz", "blizzard",
        "boggle", "bookworm", "boxcar", "boxful", "buckaroo", "buffalo", "buffoon",
        "buxom", "buzzard", "buzzing", "buzzwords", "caliph", "cobweb", "cockiness",
        "croquet", "crypt", "curacao", "cycle", "daiquiri", "dirndl", "disavow",
        "dizzying", "duplex", "dwarves", "embezzle", "equip", "espionage", "euouae",
        "exodus", "faking", "fishhook", "fixable", "fjord", "flapjack", "flopping",
        "fluffiness", "flyby", "foxglove", "frazzled", "frizzled", "fuchsia",
        "funny", "gabby", "galaxy", "galvanize", "gazebo", "giaour", "gizmo",
        "glowworm", "glyph", "gnarly", "gnostic", "gossip", "grogginess", "haiku",
        "haphazard", "hyphen", "iatrogenic", "icebox", "injury", "ivory", "ivy",
        "jackpot", "jaundice", "jawbreaker", "jaywalk", "jazziest", "jazzy",
        "jelly", "jigsaw", "jinx", "jiujitsu", "jockey", "jogging", "joking",
        "jovial", "joyful", "juicy", "jukebox", "jumbo", "kayak", "kazoo",
        "keyhole", "khaki", "kilobyte", "kiosk", "kitsch", "kiwifruit", "klutz",
        "knapsack", "larynx", "luxury", "lymph", "marquis", "matrix", "megahertz",
        "microwave", "mnemonic", "mystify", "naphtha", "nightclub", "nowadays",
        "numbskull", "nymph", "onyx", "ovary", "oxidize", "oxygen", "pajama",
        "peekaboo", "phlegm", "pixel", "pizazz", "pneumonia", "polka", "pshaw",
        "psyche", "puppy", "puzzling", "quartz", "queue", "quips", "quixotic",
        "quiz", "quizzes", "quorum", "razzmatazz", "rhubarb", "rhythm", "rickshaw",
        "schnapps", "scratch", "shiv", "snazzy", "sphinx", "spritz", "squawk",
        "staff", "strength", "strengths", "stretch", "stronghold", "stymied",
        "subway", "swivel", "syndrome", "thriftless", "thumbscrew", "topaz",
        "transcript", "transgress", "transplant", "triphthong", "twelfth",
        "twelfths", "unknown", "unworthy", "unzip", "uptown", "vaporize", "vixen",
        "vodka", "voodoo", "vortex", "voyeurism", "walkway", "waltz", "wave",
        "wavy", "waxy", "wellspring", "wheezy", "whiskey", "whizzing", "whomever",
        "wimpy", "witchcraft", "wizard", "woozy", "wristwatch", "wyvern", "xylophone",
        "yachtsman", "yippee", "yoked", "youthful", "yummy", "zephyr", "zigzag",
        "zigzagging", "zilch", "zipper", "zodiac", "zombie"
    ],
    technical: [
        "algorithm", "asynchronous", "binary", "boolean", "callback", "closure",
        "compilation", "concurrency", "deployment", "encryption", "framework",
        "functionality", "hierarchy", "immutable", "inheritance", "interface",
        "iteration", "javascript", "library", "middleware", "normalization",
        "optimization", "parameter", "polymorphism", "recursion", "refinement",
        "scalability", "serialization", "synchronous", "transaction", "typescript",
        "virtualization", "webworker", "websocket", "xmlhttprequest", "backend",
        "frontend", "database", "repository", "abstraction", "encapsulation",
        "microservices", "containerization", "kubernetes", "docker", "pipeline",
        "authentication", "authorization", "cryptography", "distributed",
        "latency", "throughput", "bandwidth", "idempotent", "stateless"
    ]
};

export const generateTargetText = ({
    count = 25,
    difficulty = 'common',
    includePunctuation = false,
    includeNumbers = false
}) => {
    const baseWords = wordsSets[difficulty] || wordsSets.common;
    let resultWords = [];

    for (let i = 0; i < count; i++) {
        let word = baseWords[Math.floor(Math.random() * baseWords.length)];

        // Randomly include numbers if enabled
        if (includeNumbers && Math.random() < 0.2) {
            word = Math.floor(Math.random() * 1000).toString();
        }

        // Randomly include punctuation if enabled
        if (includePunctuation && Math.random() < 0.15) {
            const punc = [',', '.', '!', '?', ';', ':'];
            const chosenPunc = punc[Math.floor(Math.random() * punc.length)];
            word += chosenPunc;
        }

        // Capitalize first letter sometimes if punctuation is on
        if (includePunctuation && Math.random() < 0.1) {
            word = word.charAt(0).toUpperCase() + word.slice(1);
        }

        resultWords.push(word);
    }

    return resultWords.join(' ');
};
