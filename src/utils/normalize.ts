let accentsMap: Map<string, string>;
let accentsRegex: RegExp;

function initAccents() {
  const accents = {
    A: 'ÁÀÃÂÄĄ',
    a: 'áàãâäą',
    E: 'ÉÈÊËĖ',
    e: 'éèêëę',
    I: 'ÍÌÎÏĮ',
    i: 'íìîïį',
    O: 'ÓÒÔÕÖ',
    o: 'óòôõö',
    U: 'ÚÙÛÜŪŲ',
    u: 'úùûüūų',
    C: 'ÇČ',
    c: 'çč',
    N: 'Ñ',
    n: 'ñ',
    S: 'Š',
    s: 'š',
    ی: 'ي',
    ا: 'آ',
    و: 'ؤ',
    ک: 'ك',
    ه: 'ہھ',
    0: '۰٠',
    1: '۱١',
    2: '۲٢',
    3: '۳٣',
    4: '۴٤',
    5: '۵٥',
    6: '۶٦',
    7: '۷٧',
    8: '۸٨',
    9: '۹٩',
  };

  accentsMap = new Map();
  let accentsTpl = '';

  for (let r in accents) {
    accents[r as keyof typeof accents].split('').forEach(a => {
      accentsTpl += a;
      accentsMap.set(a, r);
    });
  }

  accentsRegex = new RegExp(`[${accentsTpl}]`, 'g');
}

export function normalizeLetters(str: string) {
  if (!accentsRegex || !accentsMap) {
    initAccents();
  }
  return str
    .replace(accentsRegex, m => accentsMap.get(m)!)
    .replaceAll(/[\u064B\u064C\u064D\u064E\u064F\u0650\u0651\u0655]/g, '');
}
