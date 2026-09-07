import type { LocaleBundle } from '../../types';
import { KO_MESSAGES } from './messages';
import { KO_CORE } from './content/core';

/**
 * 한국어 번역 묶음.
 *
 * 콘텐츠 번역은 주제별 파일로 나뉘어 있고 여기서 하나로 합쳐진다. 새 언어를 추가할 때는
 * 이 디렉터리를 통째로 복사해 같은 모양으로 채우면 되고, 다른 곳은 손대지 않아도 된다.
 *
 * 빠진 항목은 영어 원문으로 표시된다. `npm run validate`가 언어별 번역률과 빠진 키를
 * 정확히 보고한다.
 */
export const KO_BUNDLE: LocaleBundle = {
  id: 'ko',
  messages: KO_MESSAGES,
  content: {
    ...KO_CORE,
  },
};
