import type { ContentBundle } from '../../../types';

/**
 * 사건: 사람 사이의 일.
 *
 * 이 묶음은 자원이 아니라 관계를 다룬다. 원문이 감정을 직접 말하지 않고 행동만 적는
 * 방식을 지킨다 — 누가 무엇을 했고, 그 뒤에 무엇이 달라졌는지.
 */
export const KO_EVENTS_SOCIAL: ContentBundle = {
  'events.soc.the_argument.title': '말다툼',
  'events.soc.the_argument.body':
    '머그잔 하나로 시작하는데 머그잔 이야기가 아니다. 누군가 끼어들 즈음에는 둘 다 되돌리는 데 두 주는 걸릴 말을 해 버렸다.',
  'events.soc.the_argument.choices.separate.label': '떼어 놓고 넘어간다',
  'events.soc.the_argument.choices.separate.resultText':
    '다른 근무, 복도의 반대쪽 끝. 해결되지 않은 채로 식는다.',
  'events.soc.the_argument.choices.mediate.label': '둘을 앉힌다',
  'events.soc.the_argument.choices.mediate.hint': '교섭 판정.',
  'events.soc.the_argument.choices.mediate.successText':
    '한 시간, 그중 대부분은 침묵. 어색하게 악수하고, 진심이다.',
  'events.soc.the_argument.choices.mediate.failureText':
    '모두가 보는 앞에서 커진다. 정확히 피하려던 그것이다.',
  'events.soc.the_argument.choices.side.label': '한쪽 손을 들어 준다',
  'events.soc.the_argument.choices.side.hint': '지금 끝난다. 누군가는 안고 간다.',
  'events.soc.the_argument.choices.side.resultText':
    '누가 옳은지 말한다. 즉시, 깔끔하게 끝나고, 둘 중 하나는 그것을 기억한다.',

  'events.soc.old_friends.title': '예전에 서로를 알았다',
  'events.soc.old_friends.body':
    '둘이 여섯 해 동안 네 블록 떨어진 같은 건물에서 일했고, 오늘 밤까지 아무도 몰랐다.',
  'events.soc.old_friends.choices.let_them.label': '그냥 둔다',
  'events.soc.old_friends.choices.let_them.resultText':
    '새벽 세 시까지 이야기한다. 나머지는 자는 척하고, 대체로 개의치 않는다.',
  'events.soc.old_friends.choices.pair_them.label': '앞으로 같은 근무에 넣는다',
  'events.soc.old_friends.choices.pair_them.resultText':
    '둘이 함께 있으면 혼자일 때보다 빠르고, 복도가 시끄러워진다.',
  'events.soc.old_friends.choices.split_them.label': '일부러 근무를 갈라 놓는다',
  'events.soc.old_friends.choices.split_them.hint': '역량이 퍼진다. 관계를 잃는다.',
  'events.soc.old_friends.choices.split_them.resultText':
    '아주 좋은 근무 하나 대신 유능한 근무 둘. 변호할 만하고, 둘 다 눈치챈다.',

  'events.soc.who_decides.title': '누가 정하는가',
  'events.soc.who_decides.body':
    '저녁 식사 자리에서 열 없이 곧바로 묻는다. 무슨 권한으로 그런 결정을 내리느냐고.',
  'events.soc.who_decides.choices.vote.label': '표결에 부친다',
  'events.soc.who_decides.choices.vote.resultText':
    '거수, 당신 쪽으로 기운다. 이제 그것은 당신의 결정이 아니라 모두의 결정이다.',
  'events.soc.who_decides.choices.assert.label': '누군가는 해야 하고 그게 나라고 분명히 말한다',
  'events.soc.who_decides.choices.assert.resultText':
    '아무도 반박하지 않는다. 두 사람이 의견을 내는 것을 그만두는데, 동의와는 다르다.',
  'events.soc.who_decides.choices.hand_over.label': '원하는 사람에게 그 자리를 넘기겠다고 한다',
  'events.soc.who_decides.choices.hand_over.hint': '아무도 받지 않는다. 그게 요점이다.',
  'events.soc.who_decides.choices.hand_over.resultText':
    '긴 침묵, 그러다 누군가 “아니요, 계속하세요”라고 말하고, 그것으로 끝난다.',

  'events.soc.the_rival_pair.title': '싫어함을 넘어섰다',
  'events.soc.the_rival_pair.body':
    '둘은 같은 방에 있지 못한다. 상대가 손댄 것은 무엇도 쓰지 않으려 해서 같은 일이 두 번 되고 있다.',
  'events.soc.the_rival_pair.choices.force_together.label': '같은 일을 맡기고 문을 잠근다',
  'events.soc.the_rival_pair.choices.force_together.hint': '해결될 수도 있다. 아닐 수도 있다.',
  'events.soc.the_rival_pair.choices.force_together.successText':
    '네 시간과 아주 긴 대화 하나 뒤에 말을 섞는 사이가 되어 나온다.',
  'events.soc.the_rival_pair.choices.force_together.failureText':
    '하나는 주먹이 터진 채로, 하나는 눈 위가 찢어진 채로 나온다.',
  'events.soc.the_rival_pair.choices.keep_apart.label': '영구히 떼어 놓는다',
  'events.soc.the_rival_pair.choices.keep_apart.resultText':
    '다른 층, 다른 시간. 효율을 잃고 싸움을 멈춘다.',
  'events.soc.the_rival_pair.choices.send_one.label': '하나를 모든 탐사에 내보낸다',
  'events.soc.the_rival_pair.choices.send_one.hint': '눈에서 멀어진다. 위험에는 가까워진다.',
  'events.soc.the_rival_pair.choices.send_one.resultText':
    '여기 있는 날보다 나가 있는 날이 많다. 아무도 자세히 보지 않을 때 굴러가는 방식으로 굴러간다.',

  'events.soc.someone_breaks.title': '누군가 멈춘다',
  'events.soc.someone_breaks.body':
    '일어나지 않는다. 반항이 아니다 — 그냥 침상 가장자리에 부츠를 손에 든 채 앉아, 다음 동작을 만들어 내지 못한다.',
  'events.soc.someone_breaks.choices.sit_with.label': '옆에 앉아 있는다',
  'events.soc.someone_breaks.choices.sit_with.hint': '당신의 하루를 쓴다.',
  'events.soc.someone_breaks.choices.sit_with.resultText':
    '쓸모 있는 말은 하나도 하지 않는다. 그것이 필요한 것이 아니었음이 드러난다.',
  'events.soc.someone_breaks.choices.order.label': '일하러 돌아가라고 명령한다',
  'events.soc.someone_breaks.choices.order.resultText':
    '간다. 하루 종일 쓸모없고 다음 날은 더하고, 당신이 그러는 것을 모두가 봤다.',
  'events.soc.someone_breaks.choices.give_day.label': '하루를 주고 근무를 메운다',
  'events.soc.someone_breaks.choices.give_day.resultText':
    '다들 조금씩 더 일하고, 아무도 이유를 입에 올리지 않는다.',

  'events.soc.the_birthday.title': '누군가의 생일이다',
  'events.soc.the_birthday.body':
    '본인은 말하지 않았다. 다른 누가 그 사람 주머니의 서류에서 알아내 취사장에 알렸다.',
  'events.soc.the_birthday.choices.mark_it.label': '제대로 챙긴다',
  'events.soc.the_birthday.choices.mark_it.resultText':
    '복숭아 통조림 하나와 교회에서 가져온 초 하나. 우스꽝스럽고, 효과가 있다.',
  'events.soc.the_birthday.choices.quiet.label': '조용히 한마디만 건넨다',
  'events.soc.the_birthday.choices.quiet.resultText':
    '당신이 그 말을 하고, 그가 다른 말을 하고, 둘 다 일로 돌아간다.',
  'events.soc.the_birthday.choices.skip.label': '아무것도 — 식량은 식량이다',
  'events.soc.the_birthday.choices.skip.resultText':
    '통조림은 선반에 남는다. 두 사람은 이미 초 이야기를 했었다.',

  'events.soc.mutiny_murmur.title': '당신이 들어가면 멎는 대화',
  'events.soc.mutiny_murmur.body':
    '작업장에 셋, 그리고 선반 소리 때문이 아닌 방식으로 조용해진다.',
  'events.soc.mutiny_murmur.choices.address.label': '공개적으로 짚는다',
  'events.soc.mutiny_murmur.choices.address.hint': '교섭 판정. 판이 크다.',
  'events.soc.mutiny_murmur.choices.address.successText':
    '무슨 말을 하고 있었느냐고 묻고, 전부 말하게 두고, 그다음에 답한다.',
  'events.soc.mutiny_murmur.choices.address.failureText':
    '아무 일도 없었다고 잡아뗀다. 그 부인이 그 대화보다 나쁘다.',
  'events.soc.mutiny_murmur.choices.concede.label': '양보한다 — 식사를 늘리고 근무를 줄인다',
  'events.soc.mutiny_murmur.choices.concede.resultText':
    '사흘간 정량 배급, 야간 근무 없음. 비싸고, 버틴다.',
  'events.soc.mutiny_murmur.choices.harden.label': '아무 말 없이 근무표를 조인다',
  'events.soc.mutiny_murmur.choices.harden.resultText':
    '더 긴 근무와 게시된 근무표. 사라지지 않는다. 밑으로 들어갈 뿐이다.',

  'events.soc.the_confession.title': '고백',
  'events.soc.the_confession.body':
    '누군가 복도가 빌 때까지 기다렸다가, 여기까지 오기 위해 무엇을 했는지 말한다. 작은 일이 아니다.',
  'events.soc.the_confession.choices.keep_it.label': '둘만의 일로 둔다',
  'events.soc.the_confession.choices.keep_it.resultText':
    '그때도 나중에도 누구에게도 말하지 않는다. 두 주 동안 다른 사람처럼 일한다.',
  'events.soc.the_confession.choices.tell.label': '다른 사람들에게 말한다',
  'events.soc.the_confession.choices.tell.resultText':
    '공개적으로 말해진다. 이제 모두가 그것을 알고, 당신이 공개적으로 말하는 사람이라는 것도 안다.',
  'events.soc.the_confession.choices.condition.label': '조건을 걸고 덮어 준다',
  'events.soc.the_confession.choices.condition.hint': '지렛대다. 효과가 있고, 지렛대다.',
  'events.soc.the_confession.choices.condition.resultText':
    '한 달 동안 가장 나쁜 근무를 맡고, 둘 다 그 이유를 입에 올리지 않는다.',

  'events.soc.grief.title': '아무도 그 이름을 말하지 않았다',
  'events.soc.grief.body':
    '며칠이 지났는데 침상은 아직 정돈된 채이고 걸이에 외투가 걸려 있고, 아무도 먼저 그 둘을 치우려 하지 않는다.',
  'events.soc.grief.choices.ceremony.label': '그 사람을 위한 자리를 만든다',
  'events.soc.grief.choices.ceremony.resultText':
    '작업대 위의 등 하나, 방 안의 전원, 그리고 말하고 싶은 사람이 말한다.',
  'events.soc.grief.choices.clear_it.label': '침상을 치우고 장비를 나눈다',
  'events.soc.grief.choices.clear_it.resultText':
    '실용적이고 즉각적이고, 모두가 보는 앞에서 이루어진다.',
  'events.soc.grief.choices.leave_it.label': '그대로 둔다',
  'events.soc.grief.choices.leave_it.resultText':
    '외투는 걸이에 남는다. 잠깐 혼자여야 할 때 사람들이 가서 서는 자리가 된다.',

  'events.soc.the_newcomer.title': '적응하지 못하고 있다',
  'events.soc.the_newcomer.body':
    '가장 늦게 온 사람이 어디에도 끼지 못했고, 이제는 끼려는 시도도 그만두었다.',
  'events.soc.the_newcomer.choices.partner.label': '참을성 있는 사람 옆에 붙인다',
  'events.soc.the_newcomer.choices.partner.resultText':
    '이틀의 거의 완전한 침묵, 그러다 통하는 농담 하나, 그것으로 끝이다.',
  'events.soc.the_newcomer.choices.give_role.label': '그 사람 것인 일을 하나 준다',
  'events.soc.the_newcomer.choices.give_role.resultText':
    '물 일지, 온전히 그 사람 것으로, 하루 두 번 확인. 일주일 만에 다른 사람이 된다.',
  'events.soc.the_newcomer.choices.leave_alone.label': '스스로 자리 잡게 둔다',
  'events.soc.the_newcomer.choices.leave_alone.resultText':
    '자리를 잡지 못한다. 주마다 더 조용해진다.',

  'events.soc.the_pairing.title': '두 사람',
  'events.soc.the_pairing.body':
    '비밀도 아니고 알린 것도 아니다. 다들 알고, 진짜 문제는 근무표를 바꿀 것이냐뿐이다.',
  'events.soc.the_pairing.choices.nothing.label': '아무것도 바꾸지 않고 아무 말도 하지 않는다',
  'events.soc.the_pairing.choices.nothing.resultText':
    '당신이 상관할 일이 아니다. 그 둘을 포함해 모두가 아주 조금 더 낫다.',
  'events.soc.the_pairing.choices.separate_duties.label': '같은 탐사에는 넣지 않는다',
  'events.soc.the_pairing.choices.separate_duties.hint': '분별 있다. 둘 다 고마워하지 않는다.',
  'events.soc.the_pairing.choices.separate_duties.resultText':
    '이유를 설명한다. 받아들이고, 이번 주에는 둘 다 당신을 별로 좋아하지 않는다.',
  'events.soc.the_pairing.choices.lean_in.label': '모든 일에 둘을 함께 넣는다',
  'events.soc.the_pairing.choices.lean_in.resultText':
    '함께면 대단하고 떨어지면 쓸 수 없다. 그리고 당신이 그것을 굳혔다.',

  'events.soc.the_theft.title': '약장',
  'events.soc.the_theft.body':
    '진통제 두 회분이 사라졌고 일지에는 서명이 없다. 할 수 있었던 사람은 넷이다.',
  'events.soc.the_theft.choices.investigate.label': '누구인지 밝힌다',
  'events.soc.the_theft.choices.investigate.successText':
    '오후 하나가 걸린다. 인정하고 남은 것을 돌려준다. 그 사람은 아프고, 당신도 알고 있었다.',
  'events.soc.the_theft.choices.investigate.failureText':
    '전원에게 물었다. 아무도 인정하지 않는다. 이제 모두가 서로에게 용의자다.',
  'events.soc.the_theft.choices.lock_it.label': '자물쇠를 달고 열쇠는 하나만 둔다',
  'events.soc.the_theft.choices.lock_it.resultText':
    '걸쇠와 자물쇠. 손실이 멈추고, 이 볼트에 대해 무언가를 말하며, 모두가 그것을 듣는다.',
  'events.soc.the_theft.choices.raise_allowance.label': '대신 진통제 허용량을 늘린다',
  'events.soc.the_theft.choices.raise_allowance.resultText':
    '욕심이 아니라 필요였다고 보고 그에 맞게 처리한다. 손실이 멈춘다.',

  'events.soc.the_music.title': '누가 기타를 찾아왔다',
  'events.soc.the_music.body':
    '줄 넷, 케이스 없음, 두 블록 건너 어느 집에 있던 것. 일주일째 구석에 있다가 오늘 밤 누군가 집어 들었다.',
  'events.soc.the_music.choices.listen.label': '그냥 둔다',
  'events.soc.the_music.choices.listen.resultText': '잘 치지 못한다. 조금도 상관없다.',
  'events.soc.the_music.choices.noise.label': '밤에는 안 된다 — 소리는 멀리 간다',
  'events.soc.the_music.choices.noise.resultText':
    '소리가 멀리 간다는 말은 맞다. 기타는 다시 구석으로 간다.',
  'events.soc.the_music.choices.join.label': '다른 사람에게 가르치라고 한다',
  'events.soc.the_music.choices.join.resultText':
    '매일 저녁 둘이 서투르게 붙잡고 있고, 이제 일과 뒤에 벌어지는 무언가가 생겼다.',

  'events.soc.exhaustion.title': '다들 바닥나고 있다',
  'events.soc.exhaustion.body':
    '첫 주 이후로 아무도 제대로 자지 못했다. 몸에 배어 있던 일에서 실수가 나기 시작한다.',
  'events.soc.exhaustion.choices.stand_down.label': '하루 전원 쉬게 한다',
  'events.soc.exhaustion.choices.stand_down.resultText':
    '아무것도 짓지 않고 아무것도 고치지 않았고, 다음 날 다들 눈에 띄게 일을 잘한다.',
  'events.soc.exhaustion.choices.stagger.label': '휴일을 한 주에 걸쳐 나눈다',
  'events.soc.exhaustion.choices.stagger.resultText':
    '분별 있고 점진적이고, 제대로 멈추는 것의 절반쯤 효과가 있다.',
  'events.soc.exhaustion.choices.push_through.label': '밀어붙인다 — 기회가 닫히고 있다',
  'events.soc.exhaustion.choices.push_through.resultText':
    '이틀 더 강행군, 그리고 둘째 날 오후에 선반에 낀 손 하나.',

  'events.soc.what_are_we_for.title': '우리는 무엇을 위해 있는가',
  'events.soc.what_are_we_for.body':
    '잠 못 드는 누군가가 새벽 세 시에 묻는다. 수사적인 질문이 아니고, 뻔한 답도 없다.',
  'events.soc.what_are_we_for.choices.survive.label': '“아직 여기 있기 위해서.”',
  'events.soc.what_are_we_for.choices.survive.resultText':
    '감동적이지 않다. 사실이고, 새벽 세 시에 사실은 값이 있다.',
  'events.soc.what_are_we_for.choices.find_out.label': '“무슨 일이 있었는지 알아내려고.”',
  'events.soc.what_are_we_for.choices.find_out.resultText':
    '누군가 연구실 화이트보드에 그것을 적고, 회차가 끝날 때까지 그대로 남는다.',
  'events.soc.what_are_we_for.choices.leave.label': '“여기서 나가려고.”',
  'events.soc.what_are_we_for.choices.leave.resultText':
    '아침이면 작업장 벽에 유성 연필로 경로가 그려져 있고, 두 사람이 연료를 두고 다투고 있다.',

  'events.soc.veteran.title': '네 번의 탐사',
  'events.soc.veteran.body':
    '한 사람이 이제 네 번을 나갔고, 지상을 규칙이 있는 장소처럼 말하기 시작했다.',
  'events.soc.veteran.choices.teach.label': '다른 사람들을 가르치게 한다',
  'events.soc.veteran.choices.teach.resultText':
    '계단참을 분필로 그려 가며 저녁 두 번. 다들 조금씩 안전해진다.',
  'events.soc.veteran.choices.rest_them.label': '일주일 명단에서 뺀다',
  'events.soc.veteran.choices.rest_them.resultText':
    '그것을 두고 다투더니 열네 시간을 잔다.',
  'events.soc.veteran.choices.lean_on.label': '계속 보낸다 — 가장 나은 사람이다',
  'events.soc.veteran.choices.lean_on.resultText':
    '나가고, 무언가를 들고 오고, 그때마다 방 안에 남는 그 사람이 조금씩 줄어든다.',
};
