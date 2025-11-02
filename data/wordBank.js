// 📚 LogicLine Word Bank
// ===========================

// Words the game will actually pick as the "target word"
const solutionWords = [
  // 4-letter
  "COLD","WARM","FIRE","WIND","MOON","STAR","TREE","GAME","CODE","PLAY","TRIAL","BIRD","FISH","LION","BEAR","DUCK","WOLF","SNOW","RAIN","DUST","ROCK","SAND","LEAF","SEED","BONE","CAVE","FALL","HILL","LAKE","PATH","ROAD","SHIP","WAVE","ZONE","PEAK","DUNE","FROG","MOSS","POND","BUSH","CLAY","FANG","HORN","IVY","JUMP","KITE","LAMB","MINT","NEST","OWL","RUSH","SAGE","VINE","YARD","ZEAL","BARK","BEAD","BAND","BULK","CART","DART","FIRM","GLOW","HARD","JAZZ","LUSH","MILD","NEAT","PLUG","QUAD","RIFT","SINK","TIDE","VAST","WISP","YAWN","ZINC","2",
  // 5-letter
  "FRAME","CLOUD","MUSIC","LIGHT","RIVER","STORM","BRAVE","WORLD","TABLE","WATER","VESTE","CREAM","ALICE","TREAT","LOUIS","PIERRE","SOPHIE","SOPHI","WEEKS","SICOT","PLANT","STONE","HEART","DREAM","NIGHT","SOUND","FLAME","GLASS","HOUSE","MOUSE","PLATE","QUICK","RANCH","SCALE","TOWER","UNITY","VOICE","WHEEL","YOUNG","ZEBRA","BREAD","CHAIR","DANCE","ELDER","FIELD","GRASS","HONEY","IDEAL","JELLY","KNIFE","LEMON","MAGIC","NURSE","OCEAN","PARTY","QUEEN","ROBIN","SUGAR","TREND","UNDER","VIOLET","WHISK","YEAST","ZESTY","BRICK","CANDY","DRINK","EVENT","FLOOR","GIANT","HAPPY","INPUT","JOKER","KNOCK","LADDER","MOTOR","NIGHT","OASIS","PILOT","QUOTA","RIVER","SHEEP","TABLE","ULTRA","VIRUS","WAGON","YACHT",
  // 6-letter
  "PLANET","MARKET","BRIDGE","CASTLE","FUTURE","GARDEN","POCKET","SHADOW","SPIRIT","VISION","ACTION","BEAUTY","CUSTOM","DRAGON","ENERGY","FAMILY","GUITAR","HUNTER","JOURNY","KITTEN","ARCADE","BREEZE","CANDLE","DESERT","FOSSIL","GALAXY","HARBOR","ISLAND","JUNGLE","KERNEL","LEGEND","MIRROR","NUGGET","ORCHID","PYRAMID","QUARTZ","ROCKET","SHELTER","TUNNEL","UNIQUE","VALLEY","WIZARD"
];

// Larger dictionary of acceptable guesses
let validGuesses = [
  ...solutionWords,
  // 4-letter extras
  "LOVE","TIME","WORD","NOTE","SONG","BOOK","FISH","BIRD","LION","BEAR",
  // 5-letter extras
  "ABOUT","AFTER","AGAIN","BEACH","CRISP","GHOST","NIGHT","QUIET","SHINE","STORY",
  // 6-letter extras
  "ACTION","BEAUTY","CUSTOM","DRAGON","ENERGY","FAMILY","GUITAR","HUNTER","JOURNY","KITTEN"
];

// Load external dictionary (one word per line in data/dictionary.txt)
fetch("data/dictionary.txt")
  .then(res => res.text())
  .then(text => {
    const words = text
      .split(/\r?\n/)
      .map(w => w.trim().toUpperCase())
      .filter(w => w.length >= 4 && w.length <= 6); // only keep 4–6 letter words
    validGuesses = [...new Set([...validGuesses, ...words])]; // merge + dedupe
  });