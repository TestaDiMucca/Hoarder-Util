/**
 * @file Minecraft style splash text for fun
 */
import * as colors from 'colors/safe';

import { randomFromArray } from '../util/helpers';

type SplashOpts = Array<string | [string, string]>;

const PERSONAL_SPLASHES: SplashOpts = [
  'Nobody should be using this, it is for personal use.',
  'You should rethink your life',
  'Grazie, grazie mille! Tu hai una gatta vecchi, vero?',
  '火腿蛋通心粉, 味道不錯!',
  '哥哥你要什麼？',
  '✨ Happy hour is cancelled ✨',
  'If you visit New Glory Brewing you will burn out of Hazy IPAs',
  'Hikori dikori dokk',
  ['"It is all in your mind"', 'Carlos 2023'],
  [
    'Some time day is gray, and you look in sky, and there is cloud',
    'Tuap 2017',
  ],
  /** Vanquishment of Varias, Valkaron */
  'Serenna, YOUUUUU',
  /** Bento NYC '23 */
  '🍱🦖🌇🍎',
  'git reset --hard',
];

/**
 * Remember to comment references lol
 */
const SPLASH_OPTS: SplashOpts = [
  ...PERSONAL_SPLASHES,
  /** Moyang */
  'Also try Minecraft!',
  /** Dragon's dogma */
  ["They're masterworks all, you can't go wrong", 'Caxton'],
  /** While We Sleep, Insomnium */
  'We need to slow down...',
  /** Battlebots */
  ['HUUUUGE HIT THERE', 'Kenny Florian'],
  /** Umu, Fate */
  'Umu, umu!',
  /** Tailgunner, Iron Maiden */
  "You're a tail-gunner",
  /** White lotus */
  ['You have to treat these people like sensitive children', 'Armond'],
  /** Weebotry */
  ['People die when they are killed', 'EMIYA'],
  /** Okita-Alter/brownie, Fate */
  'Majin-san daishōri',
  /** Yngwie */
  ["You've just unleashed the fury", 'Yngwie Malmsteen'],
  /** THE ROOM */
  'Oh hai, Mark',
  /** Private eyes */
  '家陣惡搵食，邊有半斤八兩咁理想（吹漲!）',
  /** Hanekawa/nyanners tongue twister */
  'にゃにゃめにゃにゃじゅうにゃにゃどのにゃらびでにゃく...',
  /** Spinal Tap */
  [
    'How much more black could this be? And the answer is none. None more black.',
    'Nigel Tufnel',
  ],
  /** Ghost World */
  ["I can't relate to 99% of humanity.", 'Seymour'],
  /** Star Wars: Clone Wars */
  ['We are pirates. We don’t even know what that means.', 'Hondo Ohnaka'],
  /** Lord of the Rings */
  [
    "It's the job that's never started as takes longest to finish.",
    'Samwise Gamgee',
  ],
  /** Unknowing, Omnium Gatherum */
  'Hey sister, have you been THE DRAMA',
  /** Dive dive dive, Bruce Dickinson */
  'DIVE! DIVE! DIVE!',
  /** Panther, Pain of Salvation */
  "I said I feel like a panther.. trapped in a dog's world",
  /** Courage */
  'Stupid dog. You make me look bad.',
  /** Insomnium playing WWS */
  ['Dee-doo-dee-doo', 'Markus Vanhala'],
  /** Konosuba */
  ["Nobody's expecting much from a shut-in game otaku anyway.", 'Aqua'],
  /** Konosuba */
  ['When man stares into the abyss, the abyss stares back.', 'Megumin'],
  /** VE */
  [
    'The worst battle is between what you know, and what you feel',
    'Violet Evergarden',
  ],
  [
    'Sometimes we create our own heartbreaks through expectations.',
    'Violet Evergarden',
  ],
  /** Tales from the Hood */
  ['Ah! The doo-doo! The poopedy-pop! The shit!', 'Mr. Simms'],
  /** <etal is for Everyone, Freedom Call */
  'Metal is for everyone, stronger than the law!',
  /** Bocchi the Rock */
  [
    "It might not resonate with all, but those that it does, it'll hit deep.",
    'Ryo Yamada',
  ],
  /** Bocchi the Rock */
  [
    "Actually, I'm pretty exhausted from all this social interaction, so I'm gonna go",
    'Hitori Gotou',
  ],
  /** UMU UMU, Fate */
  ["It's difficult being this talented", 'Nero Claudius'],
];

export const getSplashText = () => {
  const result = randomFromArray(SPLASH_OPTS);

  const mainText = Array.isArray(result) ? result[0] : result;
  const subText = Array.isArray(result) ? result[1] : undefined;

  return {
    len: mainText.length,
    render: () => {
      console.log(colors.rainbow(mainText));
      if (subText) console.log('   ◦', colors.dim(subText));
    },
  };
};
