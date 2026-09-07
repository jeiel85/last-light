import type { ContentBundle } from '../../../types';

/**
 * 사건: 낯선 사람과 도덕적 선택.
 *
 * 이 두 묶음은 이 게임에서 가장 무거운 결정을 다룬다. 원문이 판단을 내리지 않고
 * 결과만 적는 태도를 그대로 지킨다 — 옳고 그름은 문장이 아니라 플레이어가 정한다.
 */
export const KO_EVENTS_PEOPLE: ContentBundle = {
  /* ======================================================== 낯선 사람 */
  'events.str.at_the_door.title': '문 앞에 누가 있다',
  'events.str.at_the_door.body':
    '간격을 둔 세 번의 노크. 감시창 너머: 여자 하나, 혼자, 보이는 무기 없음, 그리고 몹시 춥다.',
  'events.str.at_the_door.choices.let_in.label': '들인다',
  'events.str.at_the_door.choices.let_in.hint': '입이 하나 는다. 손도 한 쌍 는다. 모르는 사람이다.',
  'events.str.at_the_door.choices.let_in.resultText':
    '말을 할 수 있게 되기까지 한 시간을 원자로 옆에 앉아 있는다. 아침이면 시키지도 않았는데 취사장을 치워 놓았다.',
  'events.str.at_the_door.choices.supplies_only.label': '보급품을 주고 보낸다',
  'events.str.at_the_door.choices.supplies_only.resultText':
    '문틈으로 자루 하나, 그리고 문이 다시 닫힌다. 닫히는 소리를 모두가 듣는다.',
  'events.str.at_the_door.choices.turn_away.label': '문을 열지 않는다',
  'events.str.at_the_door.choices.turn_away.resultText':
    '두 번 더 두드리다 그친다. 볼트 안의 누구도 한참 동안 아무 말을 하지 않는다.',

  'events.str.the_trader.title': '행상',
  'events.str.the_trader.body':
    '손수레와 코팅된 가격표를 든 남자. 안심이 되거나, 이번 주에 본 것 중 가장 기이하거나 둘 중 하나다.',
  'events.str.the_trader.choices.buy_food.label': '부품을 주고 식량을 산다',
  'events.str.the_trader.choices.buy_food.resultText':
    '부품 12에 식량 14. 그는 흥정하지 않고 당신도 하지 않는다.',
  'events.str.the_trader.choices.buy_medicine.label': '부품을 주고 의약품을 산다',
  'events.str.the_trader.choices.buy_medicine.resultText':
    '밀봉된 상자, 유효기간 안, 그리고 분명 내주기 싫어했던 항생제 한 판.',
  'events.str.the_trader.choices.haggle.label': '값을 두고 밀어붙인다',
  'events.str.the_trader.choices.haggle.successText':
    '20분쯤 하다가 웃더니 3분의 1을 깎아 주고 주파수를 묻는다.',
  'events.str.the_trader.choices.haggle.failureText':
    '수레를 챙기며 “다음에”라고 하는데, 사람이 아니라 값에 대한 협박으로 하는 말이다.',

  'events.str.the_raiders.title': '밖에 있다',
  'events.str.the_raiders.body':
    '마당에 여섯, 무장했고, 노크도 없이 한 시간째 있다. 출구를 세고 있다는 뜻이다.',
  'events.str.the_raiders.choices.fight.label': '문을 지킨다',
  'events.str.the_raiders.choices.fight.hint': '방어 수치를 쓴다. 탄약이 든다.',
  'events.str.the_raiders.choices.fight.successText':
    '격자 너머로 두 발, 그리고 값이 안 된다고 판단한다. 쇠지레 하나를 두고 간다.',
  'events.str.the_raiders.choices.fight.failureText':
    '마당 문으로 들어온다. 90초 만에 끝나고 비축의 3분의 1을 가져간다.',
  'events.str.the_raiders.choices.pay.label': '밖에 얼마간 내놓고 물러선다',
  'events.str.the_raiders.choices.pay.resultText':
    '마당에 상자 둘. 가져가고, 이제 이 주소가 값을 낸다는 것을 안다.',
  'events.str.the_raiders.choices.talk.label': '격자를 열고 말한다',
  'events.str.the_raiders.choices.talk.successText':
    '약탈자가 아니다. 불탄 아파트에서 온 열두 사람이고, 당신들을 무서워하고 있다.',
  'events.str.the_raiders.choices.talk.failureText':
    '누군가 격자 사이로 쇠막대를 밀어 넣는다. 봉합 한 바늘과 아주 긴 밤이 든다.',

  'events.str.the_family.title': '가족',
  'events.str.the_family.body':
    '어른 둘과 아이 하나가 계단 입구에 있고, 똑바로 서 있는 것은 아이뿐이다.',
  'events.str.the_family.choices.take_all.label': '셋 다 받는다',
  'events.str.the_family.choices.take_all.hint': '당장 입이 셋 는다.',
  'events.str.the_family.choices.take_all.resultText':
    '40명을 위해 지어졌고 엿새치가 있는 공간에 셋이 더. 아무도 토를 달지 않는다.',
  'events.str.the_family.choices.take_child.label': '아이만 받는다',
  'events.str.the_family.choices.take_child.hint': '부모가 동의한다. 그게 가장 나쁜 부분이다.',
  'events.str.the_family.choices.take_child.resultText':
    '즉시 동의하고, 모두에게 남는 것은 바로 그 부분이다.',
  'events.str.the_family.choices.supplies.label': '줄 수 있는 것을 주고 북쪽으로 안내한다',
  'events.str.the_family.choices.supplies.resultText':
    '각자 자루 하나, 차단선을 피하는 경로, 그리고 부를 주파수. 충분하지 않고 다들 그것을 안다.',

  'events.str.the_recruiter.title': '애시필드에서 온 모집책',
  'events.str.the_recruiter.body':
    '클립보드와 호위 둘, 그리고 제안 하나. 사람들을 정착지로 데려오면 자리와 식량과 성벽이 있다고 한다.',
  'events.str.the_recruiter.choices.refuse.label': '정중히 거절한다',
  'events.str.the_recruiter.choices.refuse.resultText':
    '무언가 적더니 주파수 카드를 남기고, 제안은 유효하다고 말한다.',
  'events.str.the_recruiter.choices.trade_instead.label': '대신 교역 관계를 제안한다',
  'events.str.the_recruiter.choices.trade_instead.successText':
    '상시 약정 하나: 열흘마다 표시된 인계 지점에서 부품과 의약품을.',
  'events.str.the_recruiter.choices.trade_instead.failureText':
    '“부품은 아쉽지 않습니다.” 그가 말하고, 그것으로 논의가 끝난다.',
  'events.str.the_recruiter.choices.ask_about_walls.label': '성벽이 무엇을 위한 것인지 묻는다',
  'events.str.the_recruiter.choices.ask_about_walls.resultText':
    '“약탈자는 열한 번.” 그가 말한다. “몽유병자는 구백 번. 벽은 그들이 우리를 돌아가게 하려고 있는 겁니다.”',

  'events.str.the_doctor.title': '부탁하는 의사',
  'events.str.the_doctor.body':
    '가방 하나, 아무도 확인할 수 없는 자격증, 그리고 하룻밤만 들여보내 달라는 부탁.',
  'events.str.the_doctor.choices.admit.label': '들이고 일하게 둔다',
  'events.str.the_doctor.choices.admit.resultText':
    '자기 전에 볼트의 전원을 진료하고, 아침에 머물러도 되겠느냐고 묻는다.',
  'events.str.the_doctor.choices.one_night.label': '하룻밤만, 그 뒤엔 보낸다',
  'events.str.the_doctor.choices.one_night.resultText':
    '가장 심한 사람들을 봐 주고, 먹고, 네 시간 자고, 아무도 일어나기 전에 떠난다.',
  'events.str.the_doctor.choices.refuse_doctor.label': '거절한다 — 무엇도 확인할 수 없다',
  'events.str.the_doctor.choices.refuse_doctor.resultText':
    '따지지 않는다. 무언가 든 앰풀 둘을 계단에 놓고 돌아간다.',

  'events.str.the_sleeper.title': '걸어가는 사람',
  'events.str.the_sleeper.body':
    '마당을 가로지르는 남자. 문 쪽도 아니고 문에서 멀어지는 쪽도 아니다. 곧장 가로질러 서쪽으로, 일정한 걸음으로, 빗속을, 외투도 없이.',
  'events.str.the_sleeper.choices.stop_him.label': '나가서 붙잡는다',
  'events.str.the_sleeper.choices.stop_him.resultText':
    '돌려세우면 순순히 돌아선다. 저항하지 않고 말하지도 않는다. 손을 놓는 순간 다시 방향을 잡는다.',
  'events.str.the_sleeper.choices.bring_in.label': '안으로 데려온다',
  'events.str.the_sleeper.choices.bring_in.resultText':
    '앉히는 자리에 앉고 주는 것을 먹고, 내내 같은 방향을 향하고 있다.',
  'events.str.the_sleeper.choices.watch.label': '가는 것을 지켜본다',
  'events.str.the_sleeper.choices.watch.resultText':
    '마당을 가로질러, 담이 낮은 곳을 넘어, 4분 만에 시야에서 사라진다.',

  'events.str.the_debt.title': '당신이 도운 사람',
  'events.str.the_debt.body':
    '보급품을 나눠 줬던 여자가 돌아왔고, 혼자가 아니고, 무언가를 부탁하러 온 것이 아니다.',
  'events.str.the_debt.choices.accept.label': '가져온 것을 받는다',
  'events.str.the_debt.choices.accept.resultText':
    '자루 둘과 상자 하나, 그리고 그 이야기는 하지 않으려 하고, 제대로 고맙다는 말을 하기도 전에 떠난다.',
  'events.str.the_debt.choices.invite.label': '아예 함께 지내자고 한다',
  'events.str.the_debt.choices.invite.resultText':
    '넷, 그중 둘은 용접을 할 줄 안다. 볼트가 시끄러워지고 상당히 유능해진다.',
  'events.str.the_debt.choices.alliance.label': '대신 상시 약정을 제안한다',
  'events.str.the_debt.choices.alliance.resultText':
    '인계 지점, 신호, 그리고 일정. 한 살림 대신 두 살림이고, 그것도 시작이다.',

  'events.str.the_thief.title': '붙잡혔다',
  'events.str.the_thief.body':
    '새벽 네 시에 여기 살지 않는 누군가가 비축고에 있었고, 아직 복도에 있고, 열아홉쯤 되어 보인다.',
  'events.str.the_thief.choices.feed_and_release.label': '먹이고 보낸다',
  'events.str.the_thief.choices.feed_and_release.resultText':
    '선 채로 먹고, 고맙다는 말은 하지 않고, 1분도 안 되어 마당을 벗어난다.',
  'events.str.the_thief.choices.recruit_them.label': '대신 자리를 제안한다',
  'events.str.the_thief.choices.recruit_them.successText':
    '10분과 따뜻한 국 한 그릇이 걸린다. 여기 누구보다 이 구역을 잘 안다.',
  'events.str.the_thief.choices.recruit_them.failureText':
    '받아들이고 문 근무를 서더니, 아침이면 이틀치 식량과 함께 사라졌다.',
  'events.str.the_thief.choices.make_example.label': '들고 있던 것을 뺏고 험하게 내보낸다',
  'events.str.the_thief.choices.make_example.resultText':
    '빠른 속도로 마당 문 밖으로 나간다. 복도에서 두 사람이 지켜봤고, 그 뒤로 둘 다 아무 말이 없다.',

  'events.str.the_offer_of_work.title': '일자리 제안',
  'events.str.the_offer_of_work.body':
    '두 구역 건너 무리에서 온 남자가 당신들 사람 둘을 나흘 빌리고 싶어 한다. 중노동, 위험하고, 연료로 지불한다.',
  'events.str.the_offer_of_work.choices.send.label': '둘을 보낸다',
  'events.str.the_offer_of_work.choices.send.resultText':
    '무너진 지붕을 치우는 나흘. 지치고 쑤신 몸으로, 18리터와 함께 돌아온다.',
  'events.str.the_offer_of_work.choices.negotiate.label': '조건을 먼저 협상한다',
  'events.str.the_offer_of_work.choices.negotiate.successText':
    '선불, 나흘이 아니라 사흘, 그리고 일하는 동안의 식사. 전부 받아들인다.',
  'events.str.the_offer_of_work.choices.negotiate.failureText':
    '어깨를 으쓱하고 다른 사람을 구하고, 그 이야기를 나중에 전해 듣는다.',
  'events.str.the_offer_of_work.choices.decline_work.label': '거절한다 — 여기 전원이 필요하다',
  'events.str.the_offer_of_work.choices.decline_work.resultText':
    '따지지 않고 받아들이며 주파수를 남긴다. 나중에 값이 될지도 모른다.',

  'events.str.the_wounded_stranger.title': '마당에서 피를 흘린다',
  'events.str.the_wounded_stranger.body':
    '문에서 10미터, 엎드린 채, 아직 움직인다. 이렇게 만든 것이 무엇이든 아직 근처에 있을 수 있다.',
  'events.str.the_wounded_stranger.choices.bring_in_treat.label': '데려와 치료한다',
  'events.str.the_wounded_stranger.choices.bring_in_treat.successText':
    '의무실 탁자에서 두 시간, 버틴다. 사흘이면 걷고 일주일이면 일한다.',
  'events.str.the_wounded_stranger.choices.bring_in_treat.failureText':
    '누군가의 손을 잡은 채 탁자에서 죽고, 의약품은 사라졌다.',
  'events.str.the_wounded_stranger.choices.treat_outside.label': '마당에서 처치하고 문은 닫아 둔다',
  'events.str.the_wounded_stranger.choices.treat_outside.resultText':
    '지혈하고 감고 물과 함께 벽에 기대 놓는다. 아침이면 사라지고 없다.',
  'events.str.the_wounded_stranger.choices.watch_from_inside.label': '안에서 지켜본다',
  'events.str.the_wounded_stranger.choices.watch_from_inside.hint':
    '미끼일 수 있다. 어딘가에서는 미끼였던 적이 있다.',
  'events.str.the_wounded_stranger.choices.watch_from_inside.resultText':
    '새벽 두 시쯤 움직임이 멎는다. 두 사람이 내내 지켜봤다.',

  /* ============================================================== 선택 */
  'events.mor.the_last_dose.title': '마지막 한 회분',
  'events.mor.the_last_dose.body':
    '한 회분 남았다. 볼트 안의 누군가가 오늘 밤 그것이 필요하고, 문 앞의 누군가가 그것을 청하고 있고, 두 가지가 동시에 사실이다.',
  'events.mor.the_last_dose.choices.ours.label': '우리 것이다',
  'events.mor.the_last_dose.choices.ours.resultText':
    '문은 닫힌 채다. 옳은 결정이고, 복도에서 아무도 그렇다고 말하지 않는다.',
  'events.mor.the_last_dose.choices.theirs.label': '그들에게 준다',
  'events.mor.the_last_dose.choices.theirs.resultText':
    '격자 사이로 나간다. 여기서 그것이 필요했던 사람은 진통제와 오기로 밤을 넘긴다.',
  'events.mor.the_last_dose.choices.trade_it.label': '무엇을 줄 수 있는지 묻는다',
  'events.mor.the_last_dose.choices.trade_it.successText':
    '값을 치른다. 그것도 후하게. 그리고 관련된 모두가 그 거래로 조금씩 작아진다.',
  'events.mor.the_last_dose.choices.trade_it.failureText':
    '가진 것이 없다. 두 번 그렇게 말하고, 떠난다.',

  'events.mor.the_useless_mouth.title': '사람의 산수',
  'events.mor.the_useless_mouth.body':
    '누군가 저녁 식사 자리에서 조심스럽게, 가정으로서 꺼낸다. 어느 지점부터 한 사람이 기여하는 것보다 볼트에 더 많은 비용이 되는가.',
  'events.mor.the_useless_mouth.choices.shut_it_down.label': '즉시 자른다',
  'events.mor.the_useless_mouth.choices.shut_it_down.resultText':
    '그 질문은 열려 있지 않고 앞으로도 아닐 것이라고 말한다. 다시는 소리 내어 나오지 않는다.',
  'events.mor.the_useless_mouth.choices.discuss.label': '논의하게 둔다',
  'events.mor.the_useless_mouth.choices.discuss.resultText':
    '합리적인 논의가 합리적으로 진행된다. 모두가 묘사하고 있는 그 사람 앞에서.',
  'events.mor.the_useless_mouth.choices.answer_it.label': '정직하게 답한다',
  'events.mor.the_useless_mouth.choices.answer_it.resultText':
    '“절대로 아니다.” 당신이 말한다. “그래서 우리가 죽는다면, 그런 것이다.” 아무도 완전히 만족하지 않고, 모두가 분명히 안다.',

  'events.mor.the_other_shelter.title': '그들이 더 가졌다',
  'events.mor.the_other_shelter.body':
    '팀이 보고를 들고 돌아온다. 네 블록 떨어진 지하실에 열한 사람, 작동하는 발전기, 그리고 상당한 식량.',
  'events.mor.the_other_shelter.choices.approach.label': '드러내 놓고 접촉한다',
  'events.mor.the_other_shelter.choices.approach.successText':
    '두 번 찾아가야 한다. 저쪽은 의약품과 기술이 부족하고 당신들은 식량이 부족하며, 그것이 관계다.',
  'events.mor.the_other_shelter.choices.approach.failureText':
    '문을 열지도 않고 이야기하지도 않는다. 그리고 이제 당신들이 어디 사는지 안다.',
  'events.mor.the_other_shelter.choices.take_it.label': '필요한 것을 가져온다',
  'events.mor.the_other_shelter.choices.take_it.resultText':
    '빠르고 아무도 죽지 않았다. 그 일에 대해 할 수 있는 말은 그것이 전부다.',
  'events.mor.the_other_shelter.choices.leave_them.label': '완전히 내버려 둔다',
  'events.mor.the_other_shelter.choices.leave_them.resultText':
    '보고는 일지에 들어가고 그 밖에는 아무 일도 없다. 두 사람은 당신이 틀렸다고 생각한다.',

  'events.mor.the_informer.title': '당신에게 말해 주겠다고 한다',
  'events.mor.the_informer.body':
    '누군가 조용히, 당신이 없는 자리에서 다른 사람들이 무슨 말을 하는지 알려 주겠다고 한다.',
  'events.mor.the_informer.choices.accept.label': '받아들인다',
  'events.mor.the_informer.choices.accept.resultText':
    '다음 문제가 문제가 되기 사흘 전에 알게 될 것이다. 누가 알려 줬는지도 알게 될 것이다.',
  'events.mor.the_informer.choices.refuse.label': '거절하고, 이유를 말한다',
  'events.mor.the_informer.choices.refuse.resultText':
    '이 볼트는 그런 식으로 굴러가지 않는다고 말한다. 안도한 얼굴을 하는데, 흥미로운 지점이다.',
  'events.mor.the_informer.choices.tell_others.label': '그런 제안이 있었다고 모두에게 말한다',
  'events.mor.the_informer.choices.tell_others.resultText':
    '저녁 식사 자리에서 담담하게 말해진다. 두 주 동안 아무도 그 사람 옆에 앉지 않는다.',

  'events.mor.the_body.title': '시신을 어떻게 할 것인가',
  'events.mor.the_body.body':
    '바깥 땅은 얼었고, 태울 연료는 원자로에 들어갈 연료이고, 볼트에는 3층의 봉쇄 구역이 있다.',
  'events.mor.the_body.choices.bury.label': '무엇이 들든 제대로 묻는다',
  'events.mor.the_body.choices.bury.resultText':
    '언 땅에서 수공구로 네 시간, 다들 한 번씩 삽을 잡는다. 표지가 세워진다.',
  'events.mor.the_body.choices.burn.label': '화장한다',
  'events.mor.the_body.choices.burn.resultText':
    '원자로에 들어갈 연료였다. 아무도 반대하지 않고 다들 그 계산을 한다.',
  'events.mor.the_body.choices.seal.label': '3층 봉쇄 구역에 둔다',
  'events.mor.the_body.choices.seal.resultText':
    '뒤에 격벽을 다시 닫는다. 돌아갈 길이 있으면 아무도 그 복도로 다니지 않는다.',

  'events.mor.the_child_alone.title': '혼자인 아이',
  'events.mor.the_child_alone.body':
    '아홉이나 열쯤, 계단 입구에 있고, 어디서 왔는지도 누구와 있었는지도 말하지 않는다.',
  'events.mor.the_child_alone.choices.take_in.label': '받아들인다',
  'events.mor.the_child_alone.choices.take_in.resultText':
    '이틀 동안 말을 하지 않다가, 그 뒤로는 멈추지 않는다. 다들 눈에 띄게 나아진다.',
  'events.mor.the_child_alone.choices.find_family.label': '함께 있던 사람을 찾아본다',
  'events.mor.the_child_alone.choices.find_family.successText':
    '두 블록, 지하실 하나, 그리고 포기하고 있던 이모. 둘 다 팀과 함께 돌아온다.',
  'events.mor.the_child_alone.choices.find_family.failureText':
    '이틀을 찾는다. 주소는 맞고 아무도 없고, 오래전부터 없었다.',
  'events.mor.the_child_alone.choices.to_the_settlement.label': '대신 정착지로 데려간다',
  'events.mor.the_child_alone.choices.to_the_settlement.resultText':
    '거기엔 학교가 있다고 한다. 누군가 그 말을 소리 내어 두 번 하는데, 반복하면 쉬워지기라도 하듯이.',

  'events.mor.the_promise.title': '지킬 수 없는 약속',
  'events.mor.the_promise.body':
    '죽어 가는 누군가가 무언가를 부탁하고, 그렇다고 말하는 데는 아무 값이 들지 않으며 그것을 지키는 데는 전부가 든다.',
  'events.mor.the_promise.choices.promise.label': '약속한다',
  'events.mor.the_promise.choices.promise.resultText':
    '그렇게 하겠다고 말한다. 즉시 차분해지고, 당신은 남은 회차 내내 그것을 지고 간다.',
  'events.mor.the_promise.choices.honest.label': '대신 사실대로 말한다',
  'events.mor.the_promise.choices.honest.resultText':
    '약속할 수 없는 이유를 설명한다. 받아들이고, 고맙다고 하는데, 그편이 더 나쁘다.',
  'events.mor.the_promise.choices.say_nothing.label': '아무 말도 하지 않는다',
  'events.mor.the_promise.choices.say_nothing.resultText':
    '손을 잡고, 그 질문이 더는 중요하지 않게 될 때까지 답하지 않은 채로 둔다.',

  'events.mor.the_stores_decision.title': '먹을 것인가 심을 것인가',
  'events.mor.the_stores_decision.body':
    '종자가 트레이 넷 분량이거나 사흘치 식사 분량인데, 트레이는 두 주 동안 아무것도 내놓지 않는다.',
  'events.mor.the_stores_decision.choices.plant.label': '심는다',
  'events.mor.the_stores_decision.choices.plant.resultText':
    '재배등 아래 트레이 넷, 그리고 일부러 굶는 두 주.',
  'events.mor.the_stores_decision.choices.eat.label': '먹는다',
  'events.mor.the_stores_decision.choices.eat.resultText':
    '사흘간의 제대로 된 식사. 식물학자는 자기 몫을 말없이 먹는다.',
  'events.mor.the_stores_decision.choices.split_seed.label': '반반',
  'events.mor.the_stores_decision.choices.split_seed.resultText':
    '트레이 둘과 하루 반의 식사. 아무도 반대하지 않고 아무도 좋아하지 않는 답이다.',

  'events.mor.who_goes_out.title': '누군가는 나가야 한다',
  'events.mor.who_goes_out.body':
    '그 일은 해야 하고, 그 일을 감당할 수 있는 사람은 가장 잃어서는 안 되는 둘뿐이다.',
  'events.mor.who_goes_out.choices.send_best.label': '돌아올 가능성이 가장 높은 둘을 보낸다',
  'events.mor.who_goes_out.choices.send_best.resultText':
    '필요한 것을 들고 돌아오고, 둘 다 이틀 동안 아무것도 못 한다.',
  'events.mor.who_goes_out.choices.send_expendable.label': '빠져도 되는 사람을 보낸다',
  'events.mor.who_goes_out.choices.send_expendable.resultText':
    '덜 들고, 다쳐서 돌아온다. 그리고 그 뒤 복도에서 “빠져도 되는”이라는 말이 오간다.',
  'events.mor.who_goes_out.choices.go_yourself.label': '당신을 포함해 제비를 뽑는다',
  'events.mor.who_goes_out.choices.go_yourself.resultText':
    '머그잔에 자른 성냥개비. 효율적이지 않고, 일주일 동안 볼트의 온도를 바꾼다.',

  'events.mor.the_locked_room.title': '그들이 남긴 것',
  'events.mor.the_locked_room.body':
    '죽은 사람의 유품을 정리하다가, 모두가 그 사람을 보던 방식을 바꿀 무언가를 찾아낸다.',
  'events.mor.the_locked_room.choices.burn_it.label': '태우고 아무 말도 하지 않는다',
  'events.mor.the_locked_room.choices.burn_it.resultText':
    '소각로에서 2분, 그리고 그것은 존재한 적이 없다. 찾아낸 사람은 잠을 잘 자지 못한다.',
  'events.mor.the_locked_room.choices.tell_them.label': '모두에게 말한다',
  'events.mor.the_locked_room.choices.tell_them.resultText':
    '추모의 모양이 통째로 바뀌고, 그 사람에 대한 모두의 기억도 바뀐다.',
  'events.mor.the_locked_room.choices.keep_it.label': '읽지 않은 채 유품과 함께 둔다',
  'events.mor.the_locked_room.choices.keep_it.resultText':
    '외투와 함께 상자에 들어가고 상자는 선반에 올라가고, 그대로 남는다.',

  'events.mor.the_vote.title': '표결을 원한다',
  'events.mor.the_vote.body':
    '작은 일에 대한 것이 아니다. 볼트가 떠나려 해야 하는지, 언제인지, 누가 정하는지에 대한 것이다.',
  'events.mor.the_vote.choices.hold_vote.label': '연다',
  'events.mor.the_vote.choices.hold_vote.resultText':
    '떠날 준비를 하는 쪽으로 근소하게 기운다. 이제 모두가 그 결정을 함께 진다.',
  'events.mor.the_vote.choices.delay.label': '상황이 분명해질 때까지 미룬다',
  'events.mor.the_vote.choices.delay.resultText':
    '합리적인 이유의 합리적인 연기이고, 두 사람은 그것을 거부로 듣는다.',
  'events.mor.the_vote.choices.refuse_vote.label': '거절한다 — 여기는 위원회가 아니다',
  'events.mor.the_vote.choices.refuse_vote.resultText':
    '그 방에서는 아무도 따지지 않는다. 그중 셋은 다른 데서 그 대화를 이어 간다.',
};
