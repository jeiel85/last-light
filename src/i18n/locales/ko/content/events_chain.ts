import type { ContentBundle } from '../../../types';

/**
 * 사건: 연쇄.
 *
 * 앞선 결정의 결과로만 열리는 후속 사건들이라, 원문이 앞 장면을 다시 설명하지 않고
 * 곧바로 결과부터 말하는 호흡을 그대로 지킨다.
 */
export const KO_EVENTS_CHAIN: ContentBundle = {
  'events.chain.the_reply.title': '루프가 바뀌었다',
  'events.chain.the_reply.body':
    '송신하고 이틀 뒤, 112.4의 루프가 9초 길어졌고, 새 묶음은 누구나 가질 수 있는 표준 코드북으로 풀린다.',
  'events.chain.the_reply.choices.decode_reply.label': '해독한다',
  'events.chain.the_reply.choices.decode_reply.resultText':
    '당신들의 방위. 거리. 방폭문에 찍힌 번호. 그것이 11분 걸렸다.',
  'events.chain.the_reply.choices.burn_the_notes.label': '기록을 태우고 청취를 그만둔다',
  'events.chain.the_reply.choices.burn_the_notes.resultText':
    '코드북, 일지, 그리고 3주치 받아쓰기. 그 뒤로 무전실은 아주 조용하다.',
  'events.chain.the_reply.choices.answer_again.label': '다시 응답한다',
  'events.chain.the_reply.choices.answer_again.resultText':
    '어디에 있느냐고 묻는다. 방위로 답하는데, 그 방위는 장소가 아니다.',

  'events.chain.the_third_question.title': '세 번째 질문',
  'events.chain.the_third_question.body':
    '어디인지는 말했다. 누구인지도 말했다 — 이름의 목록, 그리고 그 이름이 전부 이 방에 있는 사람들이다. 질문 하나가 남았고 그것이 무엇인지 모두가 안다.',
  'events.chain.the_third_question.choices.ask_why.label': '왜냐고 묻는다',
  'events.chain.the_third_question.choices.ask_why.resultText':
    '네 시간을 쉬지 않고 답한다. 두 사람이 방을 나간다. 하나는 나가지 않고, 그 뒤로 달라진다.',
  'events.chain.the_third_question.choices.weld_the_door.label': '수신기를 뜯어 케이스를 용접해 버린다',
  'events.chain.the_third_question.choices.weld_the_door.resultText':
    '송신탑 아래 관리동에서 누군가 당신들보다 먼저 이렇게 했고, 그 이유를 문 안면에 적어 두었다.',
  'events.chain.the_third_question.choices.hand_it_over.label': '전부를 대원들에게 내놓는다',
  'events.chain.the_third_question.choices.hand_it_over.resultText':
    '그것이 한 말을 전부 말하고, 그다음에 볼트가 어떻게 하고 싶은지 묻는다.',

  'events.chain.the_crew_decides.title': '볼트가 내린 결정',
  'events.chain.the_crew_decides.body':
    '거의 전부를 취사장에서 벌인 이틀의 논쟁, 그리고 오늘 저녁의 거수.',
  'events.chain.the_crew_decides.choices.go_to_it.label': '볼트는 찾아 나서기로 한다',
  'events.chain.the_crew_decides.choices.go_to_it.resultText':
    '근소하게, 기권 둘과 함께. 그리고 자기는 가지 않겠지만 누구도 말리지 않겠다는 사람 하나와 함께.',
  'events.chain.the_crew_decides.choices.stay_away.label': '볼트는 건드리지 않기로 한다',
  'events.chain.the_crew_decides.choices.stay_away.resultText':
    '만장일치다. 찬성한 사람들까지 포함해 모두가 놀란다.',

  'events.chain.mutiny_ultimatum.title': '최후통첩',
  'events.chain.mutiny_ultimatum.body':
    '셋이 함께 취사장에서 당신을 기다리고 있다. 그중 하나가 적어 온 목록을 들고 있다.',
  'events.chain.mutiny_ultimatum.choices.accept_terms.label': '목록을 받아들인다',
  'events.chain.mutiny_ultimatum.choices.accept_terms.resultText':
    '주 사흘 정량 배급, 탐사에 대한 표결, 그리고 야간 단독 근무 금지. 전부 합리적이다.',
  'events.chain.mutiny_ultimatum.choices.negotiate_terms.label': '조건을 깎는다',
  'events.chain.mutiny_ultimatum.choices.negotiate_terms.successText':
    '네 항목 중 둘, 그리고 나머지를 다시 논의할 날짜. 다들 감당할 만하다.',
  'events.chain.mutiny_ultimatum.choices.negotiate_terms.failureText':
    '역제안을 정중히 듣더니 원래 목록을 한 글자도 빼지 않고 다시 읽는다.',
  'events.chain.mutiny_ultimatum.choices.refuse_terms.label': '거절한다',
  'events.chain.mutiny_ultimatum.choices.refuse_terms.resultText':
    '아무도 소리치지 않는다. 목록을 접어 주머니에 넣고 일하러 돌아간다.',

  'events.chain.they_are_leaving.title': '짐을 싸고 있다',
  'events.chain.they_are_leaving.body':
    '계단 입구에 가방 셋, 그리고 무엇을 가져가는지와 왜 그럴 권리가 있다고 보는지를 정확히 적은 화이트보드의 쪽지.',
  'events.chain.they_are_leaving.choices.let_them_go.label': '제 몫과 함께 보낸다',
  'events.chain.they_are_leaving.choices.let_them_go.resultText':
    '짐 싣는 것을 돕는다. 이번 회차 최악의 저녁이고, 아무도 죽지 않았다.',
  'events.chain.they_are_leaving.choices.talk_them_down.label': '마지막으로 한 번 더 설득한다',
  'events.chain.they_are_leaving.choices.talk_them_down.successText':
    '취사장에서 두 시간, 아무도 한 번도 목소리를 높이지 않는다. 자정이면 가방이 풀려 있다.',
  'events.chain.they_are_leaving.choices.talk_them_down.failureText':
    '끝까지 듣고도 첫 빛에 떠나며, 제 몫보다 많이 가져간다.',
  'events.chain.they_are_leaving.choices.stop_them.label': '문에서 막는다',
  'events.chain.they_are_leaving.choices.stop_them.resultText':
    '계단참에서 몸싸움이 된다. 남는다. 그 뒤로 볼트의 무엇도 예전 같지 않다.',

  'events.chain.no_one_came.title': '아무도 오지 않았다',
  'events.chain.no_one_came.body':
    '방송 이후 여드레, 집결지는 아직 비어 있고, 다들 그것에 대해 묻기를 그만두었다. 묻는 것보다 나쁘다.',
  'events.chain.no_one_came.choices.admit.label': '녹음이었다고 분명히 말한다',
  'events.chain.no_one_came.choices.admit.resultText':
    '세게 내려앉고, 한 번에 끝난다. 다른 쪽보다는 낫다.',
  'events.chain.no_one_came.choices.keep_hoping.label': '조직하는 데 시간이 걸린다고 말한다',
  'events.chain.no_one_came.choices.keep_hoping.resultText':
    '일주일을 더 산다. 그다음 주는 훨씬 힘들 것이다.',
  'events.chain.no_one_came.choices.redirect.label': '대신 전부를 볼트에 쏟는다',
  'events.chain.no_one_came.choices.redirect.resultText':
    '아무도 오지 않으니 트레이가 들어가고, 수경 재배를 둘러싼 논쟁이 끝난다.',

  'events.chain.she_came_back.title': '그가 돌아왔다',
  'events.chain.she_came_back.body':
    '보급품을 나눠 줬던 여자가 다시 문 앞에 있고, 이번에는 부탁이 아니라 할 말이 있어서 왔다.',
  'events.chain.she_came_back.choices.hear_her.label': '끝까지 듣는다',
  'events.chain.she_came_back.choices.hear_her.resultText':
    '건물 넷, 그중 둘은 손대지 않은 곳, 그리고 페리 레인 아파트에 대한 경고.',
  'events.chain.she_came_back.choices.invite_her.label': '아예 함께 지내자고 한다',
  'events.chain.she_came_back.choices.invite_her.resultText':
    '문장이 끝나기도 전에 그러겠다고 하고, 그러고는 그렇게 답한 것을 사과한다.',

  'events.chain.they_came_back.title': '그들이 돌아왔다',
  'events.chain.they_came_back.body':
    '같은 무리, 더 많은 인원, 그리고 이번에는 문을 뚫을 것을 들고 왔다.',
  'events.chain.they_came_back.choices.defend.label': '막아 낸다',
  'events.chain.they_came_back.choices.defend.successText':
    '문도 버티고 당신들도 버틴다. 쇠지레 둘과 상당한 소음을 남기고 간다.',
  'events.chain.they_came_back.choices.defend.failureText':
    '6분 만에 마당 문을 뚫고, 고정되지 않은 것은 전부 가져간다.',
  'events.chain.they_came_back.choices.evacuate_stores.label': '비축을 깊이 옮기고 앞쪽 방을 내준다',
  'events.chain.they_came_back.choices.evacuate_stores.resultText':
    '2층 아래는 전부 용접한 격벽 뒤로. 앞쪽 방에 남은 것을 가져가고 떠난다.',
  'events.chain.they_came_back.choices.negotiate_raid.label': '상시 약정을 제안한다',
  'events.chain.they_came_back.choices.negotiate_raid.successText':
    '문서로 합의한 상납, 그리고 이 골목에 다른 누구도 오지 않게 하겠다는 약속. 회차가 끝날 때까지 지켜진다.',
  'events.chain.they_came_back.choices.negotiate_raid.failureText':
    '협상은 저들이 문틀에 쇠막대를 밀어 넣는 데 걸리는 시간만큼 이어진다.',

  'events.chain.grey_harbour_trade.title': '그레이 하버가 조건을 제안한다',
  'events.chain.grey_harbour_trade.body':
    '나흘 동안 기술 지원을 원한다. 대가는 식량, 연료, 그리고 작동하는 송수신기.',
  'events.chain.grey_harbour_trade.choices.send_engineer.label': '가장 좋은 기술자를 보낸다',
  'events.chain.grey_harbour_trade.choices.send_engineer.resultText':
    '나흘을 나가 있고 상당한 것을 들고 온다. 작동하는 무전기와 언제든 오라는 초대까지.',
  'events.chain.grey_harbour_trade.choices.send_nobody.label': '사람 대신 부품을 준다',
  'events.chain.grey_harbour_trade.choices.send_nobody.resultText':
    '받아들이는데 반기지는 않는다. 이 관계는 이제 거래다.',
  'events.chain.grey_harbour_trade.choices.decline_gh.label': '거절한다 — 뺄 사람이 없다',
  'events.chain.grey_harbour_trade.choices.decline_gh.resultText':
    '이해한다. 그리고 이제 중요한 무언가에서 나흘 뒤처져 있다.',

  'events.chain.the_first_harvest.title': '첫 수확',
  'events.chain.the_first_harvest.body':
    '일부러 굶은 열이틀, 그리고 오늘 아침 트레이가 다 되었다.',
  'events.chain.the_first_harvest.choices.eat_it_all.label': '오늘 밤, 전부 먹는다',
  'events.chain.the_first_harvest.choices.eat_it_all.resultText':
    '다들 더 못 먹을 때까지 먹는다. 고요 이전 이후로 없던 일이다.',
  'events.chain.the_first_harvest.choices.save_seed.label': '가장 좋은 것은 종자로 남긴다',
  'events.chain.the_first_harvest.choices.save_seed.resultText':
    '트레이 둘 분량을 따로 두고 이름표를 붙인다. 볼트가 다음 주 너머를 계획한 첫날이다.',

  'events.chain.the_promise.title': '그 약속',
  'events.chain.the_promise.body':
    '이제는 없는 사람에게 그러겠다고 했고, 오늘 그 값이 돌아왔다.',
  'events.chain.the_promise.choices.keep_it.label': '무엇이 들든 지킨다',
  'events.chain.the_promise.choices.keep_it.resultText':
    '이틀과 상당한 거리의 걸음이 들고, 살아 있는 누구에게도 도움이 되지 않는다. 지켜졌다.',
  'events.chain.the_promise.choices.partial.label': '할 수 있는 만큼 한다',
  'events.chain.the_promise.choices.partial.resultText':
    '거의 대부분, 얼추 비슷하게. 그리고 그 차이를 알아볼 사람은 남아 있지 않다.',
  'events.chain.the_promise.choices.break_it.label': '놓아 버린다',
  'events.chain.the_promise.choices.break_it.resultText':
    '아무도 그 이야기를 꺼내지 않는다. 다들 기억한다. 당신도, 특히 새벽 네 시에.',

  'events.chain.the_voice_returns.title': '해냈다',
  'events.chain.the_voice_returns.body':
    '엿새 전 부목 대는 것을 안내해 준 그 목소리가 다시 전파에 있고, 걷고 있고, 가도 되겠느냐고 묻는다.',
  'events.chain.the_voice_returns.choices.yes.label': '주소를 알려 준다',
  'events.chain.the_voice_returns.choices.yes.resultText':
    '이틀 뒤 절뚝이며, 배낭 하나와 작동하는 무전기를 들고 도착한다.',
  'events.chain.the_voice_returns.choices.meet_neutral.label': '먼저 다른 곳에서 만난다',
  'events.chain.the_voice_returns.choices.meet_neutral.resultText':
    '2킬로미터 떨어진 교회, 긴 대화, 그리고 함께 걸어 돌아오는 길.',
  'events.chain.the_voice_returns.choices.no.label': '아무도 받을 수 없다고 말한다',
  'events.chain.the_voice_returns.choices.no.resultText':
    '이해한다고 말한다. 나흘 더 송신하다가 멈춘다.',

  'events.chain.the_doctor_returns.title': '그 의사, 다시',
  'events.chain.the_doctor_returns.body':
    '돌아왔고, 이번에는 혼자가 아니고, 당신들이 만들 수 없는 것들이 담긴 상자를 들고 왔다.',
  'events.chain.the_doctor_returns.choices.take_him_in.label': '영구히 머물 자리를 제안한다',
  'events.chain.the_doctor_returns.choices.take_him_in.resultText':
    '하루 만에 의무실을 뜯어 다시 세우고, 문전박대당했던 일은 한 번도 입에 올리지 않는다.',
  'events.chain.the_doctor_returns.choices.trade_with_him.label': '거래하고, 선은 지킨다',
  'events.chain.the_doctor_returns.choices.trade_with_him.resultText':
    '공정한 값, 정해진 일정, 그리고 다른 대피소 네 곳을 도는 순회 경로.',

  'events.chain.the_thief_returns.title': '도둑이 돌아왔다',
  'events.chain.the_thief_returns.body':
    '같은 열아홉 살이 마당에 자루를 들고 있고, 이번에는 문을 두드리고 있다.',
  'events.chain.the_thief_returns.choices.take_the_sack.label': '자루 안을 본다',
  'events.chain.the_thief_returns.choices.take_the_sack.resultText':
    '가져갔던 것보다 훨씬 많고, 어디서 났는지는 말하지 않으려 한다.',
  'events.chain.the_thief_returns.choices.offer_place_again.label': '다시 자리를 제안한다',
  'events.chain.the_thief_returns.choices.offer_place_again.resultText':
    '이번에는 그러겠다고 하고, 일주일 만에 아무도 들어가지 않던 골목 넷을 지도에 올린다.',

  'events.chain.the_walker_leaves.title': '그가 사라졌다',
  'events.chain.the_walker_leaves.body':
    '방폭문은 안쪽에서 빗장이 걸린 채 닫혀 있고 그는 볼트에 없고, 아무도 아무 소리를 듣지 못했다.',
  'events.chain.the_walker_leaves.choices.check_door.label': '문을 확인한다',
  'events.chain.the_walker_leaves.choices.check_door.resultText':
    '안쪽에서 빗장, 그대로 둔 그대로. 사흘 동안 아무도 제대로 자지 못한다.',
  'events.chain.the_walker_leaves.choices.never_mention.label': '다시는 입에 올리지 않는다',
  'events.chain.the_walker_leaves.choices.never_mention.resultText':
    '이야기되지 않는다. 끊임없이 생각된다.',

  'events.chain.the_bait_taken.title': '누군가 갔다',
  'events.chain.the_bait_taken.body':
    '당신이 묘사한 창고로 한 팀이 갔다. 해 질 무렵 계단 입구에서 연기가 보인다.',
  'events.chain.the_bait_taken.choices.go_look.label': '가서 본다',
  'events.chain.the_bait_taken.choices.go_look.resultText':
    '넷, 그리고 사칭자는 아니었고, 사칭자였을지 아닐지는 알 방법이 없다.',
  'events.chain.the_bait_taken.choices.never_speak.label': '가지도 않고 이야기하지도 않는다',
  'events.chain.the_bait_taken.choices.never_speak.resultText':
    '아침이면 연기는 사라진다. 그 주파수는 열하루 동안 조용하다.',

  'events.chain.the_parents_return.title': '아이를 찾으러 돌아왔다',
  'events.chain.the_parents_return.body':
    '둘 다, 계단 입구에, 더 야윈 채로, 아이를 볼 수 있겠느냐고 묻는다.',
  'events.chain.the_parents_return.choices.let_them_in_now.label': '전부 들이고, 영구히',
  'events.chain.the_parents_return.choices.let_them_in_now.resultText':
    '처음부터 그랬어야 했다. 볼트의 모두가 그렇게 생각하고 아무도 그렇게 말하지 않는다.',
  'events.chain.the_parents_return.choices.a_visit.label': '만나게 하고, 그다음엔 보낸다',
  'events.chain.the_parents_return.choices.a_visit.resultText':
    '취사장에서 두 시간. 헤어지는 데 만나 있던 시간보다 오래 걸린다.',

  'events.chain.the_debt_repaid.title': '빚',
  'events.chain.the_debt_repaid.body':
    '이레 전 마지막 한 회분을 내주었다. 오늘 밤 누군가 마당에 상자 하나를 놓고 문도 두드리지 않고 간다.',
  'events.chain.the_debt_repaid.choices.open_it.label': '연다',
  'events.chain.the_debt_repaid.choices.open_it.resultText':
    '내준 것의 네 배, 그리고 한 줄만 적힌 쪽지. 그 아이는 살았습니다.',

  'events.chain.someone_answered.title': '무언가 답했다',
  'events.chain.someone_answered.body':
    '모든 주파수로 여섯 시간을 부른 끝에, 0411에 무언가가 당신들 주파수 그대로, 당신 자신의 녹음된 목소리로 답했다.',
  'events.chain.someone_answered.choices.analyse_it.label': '녹음을 분석한다',
  'events.chain.someone_answered.choices.analyse_it.resultText':
    '당신의 목소리이고, 아직 하지 않은 말을 하고 있고, 녹음 시각은 당신이 송신하기 전이다.',
  'events.chain.someone_answered.choices.delete.label': '지우고 다시는 말하지 않는다',
  'events.chain.someone_answered.choices.delete.resultText':
    '테이프를 지운다. 두 사람이 들었고 둘 다 그 이야기를 하지 않는다.',

  'events.chain.the_reader.title': '읽어 주는 사람',
  'events.chain.the_reader.body':
    '매일 저녁 전파로 책을 읽던 아이가 일주일째 당신들에게만 읽어 주고 있고, 오늘 밤에는 어른이 마이크를 잡는다.',
  'events.chain.the_reader.choices.arrange_meeting.label': '만날 약속을 잡는다',
  'events.chain.the_reader.choices.arrange_meeting.resultText':
    '할머니 한 사람과 아홉 살 아이, 태엽식 송신기 하나, 그리고 책 400권.',
  'events.chain.the_reader.choices.stay_on_air.label': '지금 이대로 둔다 — 매일 저녁의 목소리로',
  'events.chain.the_reader.choices.stay_on_air.resultText':
    '그대로 남는다. 일곱 시 십 분이면 취사장은 여전히 조용해진다.',

  'events.chain.the_hatch_answered.title': '해치가 답했다',
  'events.chain.the_hatch_answered.body':
    '7번 해치를 두드린 나흘 뒤, 마당에 당신들 시설 번호가 적힌 밀봉 봉투가 놓여 있다.',
  'events.chain.the_hatch_answered.choices.open_envelope.label': '연다',
  'events.chain.the_hatch_answered.choices.open_envelope.resultText':
    '타자로 친 한 줄. “12번은 비축되어 있지 않다. 진입을 시도하지 말 것. 우리는 당신들을 알고 있다.”',
  'events.chain.the_hatch_answered.choices.burn_envelope.label': '뜯지 않고 태운다',
  'events.chain.the_hatch_answered.choices.burn_envelope.resultText':
    '4초가 걸리고, 당신이 한 일 중 가장 인기 있는 일이 된다.',
  'events.chain.the_hatch_answered.choices.reply_to_it.label': '답장을 써서 해치에 두고 온다',
  'events.chain.the_hatch_answered.choices.reply_to_it.resultText':
    '이름 여섯, 생존 일수, 그리고 암반 조사에 대한 질문 하나. 다음에 가 보면 사라지고 없다.',
};
