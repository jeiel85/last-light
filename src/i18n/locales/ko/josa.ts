/**
 * 조사 자동 선택.
 *
 * 한국어의 주격·목적격 조사는 앞 음절의 받침 유무로 갈린다. 그런데 그 앞 음절은 대개
 * 자리표시자로 채워지는 값(사람 이름, 자원 이름, 시설 이름)이라 번역문을 쓰는 시점에는
 * 알 수 없다. 그래서 번역문에는 `{name}이/가`처럼 두 형태를 나란히 적어 두고, 값이
 * 채워진 뒤 이 함수가 한쪽을 고른다. `이(가)` 같은 표기를 쓰지 않아도 되는 이유다.
 *
 * 앞 글자가 한글이 아니면(영문 이름, 숫자) 받침이 없는 것으로 보고 뒤쪽 형태를 쓴다.
 * 이는 실제 관행과 일치한다: "Bekele가", "4가".
 */

/** 받침이 있을 때 쓰는 형태 / 없을 때 쓰는 형태. */
const PAIRS: readonly (readonly [string, string])[] = [
  ['은', '는'],
  ['이', '가'],
  ['을', '를'],
  ['과', '와'],
  ['으로', '로'],
  ['아', '야'],
  ['이라', '라'],
  ['이란', '란'],
  ['이며', '며'],
  ['이나', '나'],
];

const PATTERN = new RegExp(`(.)(${PAIRS.map(([a, b]) => `${a}/${b}`).join('|')})`, 'g');

/** 한글 음절인지, 그리고 받침이 있는지. */
function hasFinalConsonant(char: string): boolean {
  const code = char.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return false;
  return (code - 0xac00) % 28 !== 0;
}

/**
 * 숫자 뒤에는 그 숫자를 한국어로 읽었을 때의 받침을 따른다.
 *
 * "3일" 같은 표현이 아니라 "탄약 3이/가"처럼 수치가 조사 바로 앞에 오는 경우가 있어,
 * 마지막 자릿수만 보고 판단한다. 0·1·3·6·7·8은 받침이 있고 나머지는 없다.
 */
const DIGITS_WITH_FINAL = new Set(['0', '1', '3', '6', '7', '8']);

export function resolveJosa(text: string): string {
  if (!text.includes('/')) return text;
  return text.replace(PATTERN, (_whole, prev: string, pair: string) => {
    const [withFinal, withoutFinal] = pair.split('/') as [string, string];
    const final = /[0-9]/.test(prev) ? DIGITS_WITH_FINAL.has(prev) : hasFinalConsonant(prev);
    return prev + (final ? withFinal : withoutFinal);
  });
}
