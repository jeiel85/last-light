import type { ContentBundle } from '../../../types';

/**
 * 사건: 도입부와 생존.
 *
 * 사건 본문은 그날 저녁 눈앞에 벌어진 일을 현재형으로 적고, 선택지 라벨은 플레이어가
 * 내리는 결정 그 자체를, 힌트는 대가를 한 줄로 밝힌다. 결과문은 과거형 서술이다.
 * 안내 성격의 힌트(패널 이름 등)는 UI 번역과 용어를 맞춘다.
 */
export const KO_EVENTS_CORE: ContentBundle = {
  /* ============================================================== 도입 */
  'events.onb.the_manifest.title': '비품실',
  'events.onb.the_manifest.body':
    '문 옆 클립보드에 목록이 걸려 있다. 이 시설의 비축 기준이 적혀 있다. 40명, 9년. 그 뒤 선반에는 엿새치 식량이 있다.',
  'events.onb.the_manifest.choices.count_it.label': '실제로 얼마나 있는지 센다',
  'events.onb.the_manifest.choices.count_it.hint': '남은 시간이 정확히 정해진다.',
  'events.onb.the_manifest.choices.count_it.resultText':
    '엿새치, 그리고 선반 뒤로 굴러가 있던 통조림 셋. 이제 모두가 그 숫자를 안다.',
  'events.onb.the_manifest.choices.do_not_count.label': '사람들 앞에서 세지는 않는다',
  'events.onb.the_manifest.choices.do_not_count.resultText':
    '클립보드를 챙겨 나중에 혼자, 두 번 계산한다.',
  'events.onb.the_manifest.choices.read_manifest.label': '40명짜리 대피소가 왜 비었는지 묻는다',
  'events.onb.the_manifest.choices.read_manifest.resultText':
    '답할 수 있는 사람이 없다. 그 질문은 화이트보드에 적히고 그대로 남는다.',

  'events.onb.the_first_job.title': '누군가는 정해야 한다',
  'events.onb.the_first_job.body':
    '네 사람, 지켜봐야 하는 원자로 하나, 퍼내야 하는 침출수, 그리고 아홉 가지쯤 더. 다들 무엇을 하라는 말을 기다리고 있다.',
  'events.onb.the_first_job.choices.water_first.label': '물이 먼저다 — 나머지는 하루 미룰 수 있다',
  'events.onb.the_first_job.choices.water_first.hint': '대원 패널에서 정수기에 사람을 배치한다.',
  'events.onb.the_first_job.choices.water_first.resultText':
    '정수기가 하루 종일 손을 받고, 도착한 이래 가장 많은 양을 낸다.',
  'events.onb.the_first_job.choices.build_first.label': '건설이 먼저다 — 여긴 아직 볼트라기 어렵다',
  'events.onb.the_first_job.choices.build_first.hint': '미배치로 남은 사람은 건설 노동에 보탠다.',
  'events.onb.the_first_job.choices.build_first.resultText':
    '선반, 작업대, 그리고 제대로 닫히는 문. 하루가 들었고, 잘 쓴 하루다.',
  'events.onb.the_first_job.choices.look_outside.label': '밖을 본다 — 바깥에 무엇이 있는지 알아야 한다',
  'events.onb.the_first_job.choices.look_outside.hint': '지도에 가까운 지점 두 곳이 열린다.',
  'events.onb.the_first_job.choices.look_outside.resultText':
    '지상에서 두 시간, 그리고 들어가 볼 만한 건물 둘이 구역도에 오른다.',

  'events.onb.the_first_expedition.title': '계단 입구',
  'events.onb.the_first_expedition.body':
    '비상계단은 보강했고 문은 작동한다. 다음에 무슨 일이 벌어지든, 누군가 그 계단을 올라가는 것에서 시작한다.',
  'events.onb.the_first_expedition.choices.send_two.label': '둘을, 제대로 갖춰 보낸다',
  'events.onb.the_first_expedition.choices.send_two.hint':
    '탐사는 지도 패널에서 계획한다. 나가 있을 날수만큼 식량을 꾸린다.',
  'events.onb.the_first_expedition.choices.send_two.resultText':
    '비계 파이프로 만든 몽둥이, 드레싱 둘, 그리고 규칙 하나. 혼자 가지 않는다.',
  'events.onb.the_first_expedition.choices.send_one.label': '하나를, 가볍고 빠르게 보낸다',
  'events.onb.the_first_expedition.choices.send_one.resultText':
    '두 시간에 세 블록, 돌아오는 길에 접질린 발목, 그리고 다시 생각하게 된 규칙 하나.',
  'events.onb.the_first_expedition.choices.nobody_yet.label': '아직 아무도 올라가지 않는다',
  'events.onb.the_first_expedition.choices.nobody_yet.resultText':
    '하루 더 안에 있었고, 볼트는 눈에 띄게 나아졌고, 비축은 하루치 줄었다.',

  'events.onb.the_whiteboard.title': '화이트보드',
  'events.onb.the_whiteboard.body':
    '누군가 한가운데 선을 그었다. 왼쪽에는 볼트가 가진 것. 오른쪽에는 필요한 것. 오른쪽이 훨씬 길다.',
  'events.onb.the_whiteboard.choices.prioritise_research.label': '과학을 맨 위에 둔다',
  'events.onb.the_whiteboard.choices.prioritise_research.hint':
    '연구실은 배치된 인원을 연구 통찰로 바꾼다.',
  'events.onb.the_whiteboard.choices.prioritise_research.resultText':
    '수경 재배가 맨 위로 올라간다. 두 주가 걸릴 것이고, 모든 것을 바꿀 것이다.',
  'events.onb.the_whiteboard.choices.prioritise_defence.label': '문을 맨 위에 둔다',
  'events.onb.the_whiteboard.choices.prioritise_defence.hint':
    '경비 초소와 진지 구축 연구가 기본 방어를 올린다.',
  'events.onb.the_whiteboard.choices.prioritise_defence.resultText':
    '경첩, 빗장, 그리고 무기라 부를 만한 것을 걸어 둘 거치대. 아무도 토를 달지 않는다.',
  'events.onb.the_whiteboard.choices.prioritise_people.label': '사람을 맨 위에 둔다',
  'events.onb.the_whiteboard.choices.prioritise_people.hint': '사기와 희망도 다른 것과 같은 자원이다.',
  'events.onb.the_whiteboard.choices.prioritise_people.resultText':
    '제대로 된 식사, 제대로 된 잠, 그리고 아무 일정도 없는 저녁 하루.',

  /* ============================================================== 생존 */
  'events.sur.empty_shelf.title': '선반이 비었다',
  'events.sur.empty_shelf.body':
    '저녁 재고가 모자란다. 세다 틀린 것이 아니다. 내일 무엇을 내놓든 전원에게 돌아가지 않는다.',
  'events.sur.empty_shelf.choices.half.label': '전원 절반 배급',
  'events.sur.empty_shelf.choices.half.hint': '모두가 조금씩 먹는다. 모두가 조금씩 원망한다.',
  'events.sur.empty_shelf.choices.half.resultText':
    '국이 묽어지고 줄이 조용해진다. 아무도 불평하지 않는데, 그편이 오히려 나쁘다.',
  'events.sur.empty_shelf.choices.workers_first.label': '일하는 사람에게 먼저 준다',
  'events.sur.empty_shelf.choices.workers_first.hint':
    '생산을 유지한다. 쉬는 사람은 굶고, 그것을 안다.',
  'events.sur.empty_shelf.choices.workers_first.resultText':
    '솔직하게 말한다. 일을 지고 있는 사람이 먹는다고. 변호할 수 있는 결정이다. 그리고 기억되는 결정이다.',
  'events.sur.empty_shelf.choices.stretch.label': '요리사에게 늘려 쓰게 한다',
  'events.sur.empty_shelf.choices.stretch.hint': '요리 판정. 성공하면 하루를 번다.',
  'events.sur.empty_shelf.choices.stretch.successText':
    '육수와 부재료, 그리고 상당한 자신감. 그럴 리 없는 양까지 늘어난다.',
  'events.sur.empty_shelf.choices.stretch.failureText':
    '양은 늘었고 맛도 그만큼이다. 모두 먹었고, 아무도 즐기지 않았다.',

  'events.sur.the_seep_slows.title': '침출수가 줄어든다',
  'events.sur.the_seep_slows.body':
    '밤사이 대수층 유입이 실낱같이 줄었다. 취수구에 앙금이 낀 것일 수도, 지하수위가 내려간 것일 수도 있다. 여기서는 아무도 그 차이를 알지 못한다.',
  'events.sur.the_seep_slows.choices.clear_intake.label': '사람을 내려보내 취수구를 뚫는다',
  'events.sur.the_seep_slows.choices.clear_intake.hint': '공학 판정. 좁고, 젖고, 춥다.',
  'events.sur.the_seep_slows.choices.clear_intake.successText':
    '앙금과 비닐봉지 하나. 한 시간 안에 유량이 돌아온다.',
  'events.sur.the_seep_slows.choices.clear_intake.failureText':
    '두 시간을 아래에서 보내고 떨면서 올라온다. 유량은 조금 나아진다.',
  'events.sur.the_seep_slows.choices.ration_water.label': '1인당 2리터로 제한한다',
  'events.sur.the_seep_slows.choices.ration_water.resultText':
    '계량한 2리터, 씻기는 없음. 그럭저럭 버틴다.',
  'events.sur.the_seep_slows.choices.ignore.label': '두고 기대해 본다',
  'events.sur.the_seep_slows.choices.ignore.hint': '저절로 풀릴 수도 있다. 아닐 수도 있다.',
  'events.sur.the_seep_slows.choices.ignore.successText':
    '아침이면 저절로 풀린다. 그 도박에 대해 아무도 언급하지 않는다.',
  'events.sur.the_seep_slows.choices.ignore.failureText':
    '풀리지 않는다. 아침에 탱크는 이번 회차 최저치를 가리킨다.',

  'events.sur.spoiled_stores.title': '무언가 상했다',
  'events.sur.spoiled_stores.body':
    '비축고 안쪽에서 냄새가 나는데 은근하지가 않다. 그게 무엇이든 주변에 쌓인 것으로 새어 들고 있다.',
  'events.sur.spoiled_stores.choices.purge.label': '의심스러운 것은 전부 버린다',
  'events.sur.spoiled_stores.choices.purge.hint': '식량을 잃는다. 그 외에는 잃지 않는다.',
  'events.sur.spoiled_stores.choices.purge.resultText':
    '상자 넷이 계단참으로 간다. 비축고에서 표백제 냄새가 나고 다들 멀쩡하다.',
  'events.sur.spoiled_stores.choices.sort.label': '조심해서 골라낸다',
  'events.sur.spoiled_stores.choices.sort.successText':
    '이음매, 날짜, 그리고 상당한 양의 냄새 맡기. 거의 전부를 건진다.',
  'events.sur.spoiled_stores.choices.sort.failureText':
    '대부분 건진다. 하나는 아니었고, 누군가 몸으로 알게 된다.',
  'events.sur.spoiled_stores.choices.eat_it.label': '의심스러운 것부터 먹는다',
  'events.sur.spoiled_stores.choices.eat_it.hint': '버리는 것이 없다. 모두를 건다.',
  'events.sur.spoiled_stores.choices.eat_it.resultText':
    '아무것도 버리지 않는다고 화이트보드가 말한다. 두 사람이 다음 날 하루 종일 그 방침을 후회한다.',

  'events.sur.reactor_stutter.title': '원자로가 더듬는다',
  'events.sur.reactor_stutter.body':
    '0300에 웅웅거림의 음이 바뀌고, 깨어 있던 사람은 모두 알아챈다. 다시 가라앉는다. 완전히 원래대로는 아니다.',
  'events.sur.reactor_stutter.choices.strip_it.label': '분해해서 분사 시점을 다시 잡는다',
  'events.sur.reactor_stutter.choices.strip_it.hint': '공학 판정. 어느 쪽이든 부품이 든다.',
  'events.sur.reactor_stutter.choices.strip_it.successText':
    '외함 아래 누워 네 시간, 웅웅거림이 제 소리로 돌아온다.',
  'events.sur.reactor_stutter.choices.strip_it.failureText':
    '돌기는 한다. 더 나쁘게 돈다. 저 안의 무언가는 스패너로 고쳐질 것이 아니다.',
  'events.sur.reactor_stutter.choices.run_it_lower.label': '하루 동안 출력을 낮춰 돌린다',
  'events.sur.reactor_stutter.choices.run_it_lower.resultText':
    '조명 절반을 끄고 작업장을 어둡게 둔다. 조금은 도움이 된다.',
  'events.sur.reactor_stutter.choices.ignore_it.label': '아무것도. 전에도 이랬다.',
  'events.sur.reactor_stutter.choices.ignore_it.resultText':
    '전에도 이랬다. 그 간격이 점점 짧아지고 있다.',

  'events.sur.fuel_math.title': '연료 산수',
  'events.sur.fuel_math.body':
    '누군가 배급표 뒷면에 계산을 해서 게시판에 붙였다. 지금 소모 속도라면 원자로가 멈추는 날짜가, 이제 날짜로 부를 만큼 가까이 있다.',
  'events.sur.fuel_math.choices.take_it_down.label': '떼어 낸다',
  'events.sur.fuel_math.choices.take_it_down.hint': '사기를 지킨다. 아무것도 해결하지 않는다.',
  'events.sur.fuel_math.choices.take_it_down.resultText':
    '아침 식사 전에 떼어졌다. 세 사람이 봤다. 세 사람이면 충분하다.',
  'events.sur.fuel_math.choices.own_it.label': '그대로 두고 날짜를 소리 내어 말한다',
  'events.sur.fuel_math.choices.own_it.hint': '지금 희망을 잃는다. 신뢰를 산다.',
  'events.sur.fuel_math.choices.own_it.resultText':
    '날짜를 말한다. 아무도 반박하지 않고, 저녁이 되기 전에 두 사람이 연료를 구하러 가겠다고 나선다.',
  'events.sur.fuel_math.choices.brownout_plan.label': '계획 정전 순번을 공지한다',
  'events.sur.fuel_math.choices.brownout_plan.hint': '연료를 아낀다. 모든 것이 더 나빠진다.',
  'events.sur.fuel_math.choices.brownout_plan.resultText':
    '매일 여섯 시간의 어둠, 순번제로. 탱크가 나흘 늘어난다.',

  'events.sur.the_cold.title': '추위가 들어온다',
  'events.sur.the_cold.body':
    '계단 입구가 일주일 내내 찬 공기를 흘려보내더니 이제 더 빨리 흘린다. 있던 밀폐가 무엇이었든 망가졌다.',
  'events.sur.the_cold.choices.seal_it.label': '제대로 밀폐한다',
  'events.sur.the_cold.choices.seal_it.resultText':
    '폼, 철판, 그리고 타이어에서 잘라 낸 고무 립. 복도가 일주일 만에 처음으로 따뜻하다.',
  'events.sur.the_cold.choices.blankets.label': '담요와 닫힌 문으로 버틴다',
  'events.sur.the_cold.choices.blankets.resultText':
    '다들 외투를 입고 잔다. 가장 나이 많은 사람이 아침에 기침을 한다.',
  'events.sur.the_cold.choices.burn_more.label': '연료를 더 태워 온도를 유지한다',
  'events.sur.the_cold.choices.burn_more.resultText':
    '따뜻하고, 그 대가가 얼마인지 모두가 정확히 안다.',

  'events.sur.water_tastes_wrong.title': '물맛이 이상하다',
  'events.sur.water_tastes_wrong.body':
    '쇠 맛이 나고, 가만히 둔 컵 위에 막이 뜬다. 정수기 계기는 정상이라고 하는데, 그 계기는 세 주째 정상이라고 해 왔다.',
  'events.sur.water_tastes_wrong.choices.test_it.label': '제대로 검사한다',
  'events.sur.water_tastes_wrong.choices.test_it.hint': '과학 판정.',
  'events.sur.water_tastes_wrong.choices.test_it.successText':
    '2단 여과재가 다 됐다. 비축분으로 교체하니 하루 만에 맛이 사라진다.',
  'events.sur.water_tastes_wrong.choices.test_it.failureText':
    '결론이 없다. 다들 계속 마시고, 며칠간 다들 조금씩 안 좋다.',
  'events.sur.water_tastes_wrong.choices.boil.label': '전부 끓인다',
  'events.sur.water_tastes_wrong.choices.boil.resultText':
    '연료가 많이 들고 성가시고, 문제를 완전히 없앤다.',
  'events.sur.water_tastes_wrong.choices.drink_it.label': '그냥 마시고 말하지 않는다',
  'events.sur.water_tastes_wrong.choices.drink_it.resultText':
    '이틀 뒤 누군가 크게 앓고, 그 사람은 알고, 당신도 그 사람이 안다는 것을 안다.',

  'events.sur.hoarding.title': '누군가 빼돌리고 있다',
  'events.sur.hoarding.body':
    '일주일째 재고가 서넛씩 모자란다. 부패도 아니고 계산 착오도 아니다.',
  'events.sur.hoarding.choices.search.label': '침상을 뒤진다',
  'events.sur.hoarding.choices.search.hint': '찾아낸다. 어느 쪽이든 신뢰를 잃는다.',
  'events.sur.hoarding.choices.search.resultText':
    '매트리스 아래: 통조림 열하나와 커피 한 병. 이틀 동안 아무도 눈을 마주치지 않는다.',
  'events.sur.hoarding.choices.announce.label': '자진 반납 기간을 알린다',
  'events.sur.hoarding.choices.announce.hint': '교섭 판정.',
  'events.sur.hoarding.choices.announce.successText':
    '무엇이 돌아왔든 밤사이에 놓여 있고, 아무도 누구의 이름도 부르지 않는다.',
  'events.sur.hoarding.choices.announce.failureText':
    '상자는 비어 있다. 다음 주 재고도 마찬가지다.',
  'events.sur.hoarding.choices.let_it_go.label': '넘어간다',
  'events.sur.hoarding.choices.let_it_go.hint': '사람은 겁이 나서 쟁인다.',
  'events.sur.hoarding.choices.let_it_go.resultText':
    '재고를 세고, 차이를 적고, 아무 말도 하지 않는다. 나아지지 않는다.',

  'events.sur.rat_problem.title': '비축고에 무언가 있다',
  'events.sur.rat_problem.body':
    '선반을 따라 배설물, 그리고 갉힌 자루 모서리. 한 마리가 있으면 마흔 마리가 있다.',
  'events.sur.rat_problem.choices.traps.label': '덫을 놓고 선반을 막는다',
  'events.sur.rat_problem.choices.traps.resultText':
    '철망, 철판, 덫 열하나. 사흘 안에 손실이 멈춘다.',
  'events.sur.rat_problem.choices.hunt.label': '잡고, 잡은 것은 쓴다',
  'events.sur.rat_problem.choices.hunt.hint': '불쾌하다. 식량은 식량이다.',
  'events.sur.rat_problem.choices.hunt.resultText':
    '국에 뭐가 들었는지 아무도 묻지 않고 요리사도 굳이 말하지 않는다.',
  'events.sur.rat_problem.choices.nothing.label': '아무것도 — 더 큰 문제가 있다',
  'events.sur.rat_problem.choices.nothing.resultText':
    '더 큰 문제가 있다. 그것을 처리하는 동안 이 문제가 비축의 10분의 1을 먹는다.',

  'events.sur.the_generator_gift.title': '작동하는 발전기',
  'events.sur.the_generator_gift.body':
    '탐사팀이 온전한 휴대용 디젤 발전기를 들고 돌아왔다. 탱크는 절반쯤 차 있다. 그들이 가져온 나머지 전부보다 값이 나간다.',
  'events.sur.the_generator_gift.choices.integrate.label': '원자로 회로에 편입한다',
  'events.sur.the_generator_gift.choices.integrate.hint': '공학 판정. 되면 영구적 이득.',
  'events.sur.the_generator_gift.choices.integrate.successText':
    '환상 간선에 병렬로 물리고 부하 시험까지 마쳤다. 원자로에 처음으로 동료가 생겼다.',
  'events.sur.the_generator_gift.choices.integrate.failureText':
    '위상이 맞지 않아 권선이 탄다. 아주 훌륭한 고철이 되었다.',
  'events.sur.the_generator_gift.choices.strip.label': '부품으로 뜯는다',
  'events.sur.the_generator_gift.choices.strip.resultText':
    '구리, 시동 모터, 그리고 아주 좋은 발전기. 확실하고, 낭만은 없다.',
  'events.sur.the_generator_gift.choices.trade_it.label': '온전히 두고 거래에 쓴다',
  'events.sur.the_generator_gift.choices.trade_it.resultText':
    '방수포를 덮어 팔레트에 올린다. 바깥의 누군가는 이걸 몹시 원할 것이다.',

  'events.sur.overflow.title': '넣을 데가 없다',
  'events.sur.overflow.body':
    '선반은 가득하고 복도에도 쌓였고, 둘 데가 없어서 의무실에 복숭아 통조림 상자가 하나 있다.',
  'events.sur.overflow.choices.feast.label': '하룻밤은 잘 먹는다',
  'events.sur.overflow.choices.feast.resultText':
    '누군가 초를 찾아낸다. 다른 누군가는 아껴 둔 병을 꺼낸다. 다들 오랜만에 가장 좋은 저녁이었다.',
  'events.sur.overflow.choices.cache.label': '잉여분을 밖에 숨겨 둔다',
  'events.sur.overflow.choices.cache.hint': '화재, 습격, 부패에 대한 보험.',
  'events.sur.overflow.choices.cache.resultText':
    '드럼에 밀봉해 마당 아래 묻고, 주머니 하나에만 들어 있는 지도에 표시한다.',
  'events.sur.overflow.choices.preserve.label': '요리사에게 하루 저장 처리를 맡긴다',
  'events.sur.overflow.choices.preserve.resultText':
    '말리고 절이고 밀봉했다. 가벼워졌고 오래간다.',

  'events.sur.mushroom_bloom.title': '무언가 자라고 있다',
  'events.sur.mushroom_bloom.body':
    '창고 선반 뒤 어둠, 아무도 손대지 않은 축축한 자리에 창백하고 전혀 초대받지 않은 군락이 있다.',
  'events.sur.mushroom_bloom.choices.identify.label': '무엇인지 감정하게 한다',
  'events.sur.mushroom_bloom.choices.identify.hint': '식물 판정. 식량원이 될 수도 있다.',
  'events.sur.mushroom_bloom.choices.identify.successText':
    '먹을 수 있고, 잘 번지고, 젖은 골판지에서도 자란다. 비축고에 새 구역이 생겼다.',
  'events.sur.mushroom_bloom.choices.identify.failureText':
    '무엇인지 말할 수 있는 사람이 없고, 아직 알아낼 만큼 배고픈 사람도 없다.',
  'events.sur.mushroom_bloom.choices.eat.label': '먹어 보고 안다',
  'events.sur.mushroom_bloom.choices.eat.resultText':
    '대부분은 괜찮다. 한 사람은 이틀 동안 괜찮지 않다.',
  'events.sur.mushroom_bloom.choices.bleach.label': '그 구역 전체를 소독한다',
  'events.sur.mushroom_bloom.choices.bleach.resultText':
    '콘크리트가 드러날 때까지 문질렀다. 축축한 자리는 다시 생길 것이다.',

  'events.sur.starving.title': '사흘째 굶는다',
  'events.sur.starving.body':
    '사흘째 아무도 제대로 먹지 못했다. 사람들이 느리다. 오늘 아침 누군가 쟁반을 떨어뜨리고는 그 옆에 주저앉아 한참 일어나지 못했다.',
  'events.sur.starving.choices.emergency_run.label': '걸을 수 있는 사람은 전부, 지금 나간다',
  'events.sur.starving.choices.emergency_run.hint': '절박하다. 식량을 얻는다. 건강을 잃는다.',
  'events.sur.starving.choices.emergency_run.resultText':
    '네 시간, 세 블록, 그리고 못 박히지 않은 것 전부. 이틀치는 된다.',
  'events.sur.starving.choices.the_seed_stock.label': '종자를 먹는다',
  'events.sur.starving.choices.the_seed_stock.hint': '오늘을 해결한다. 모든 내일을 잃는다.',
  'events.sur.starving.choices.the_seed_stock.resultText':
    '아홉 사람을 하루 먹인다. 식물학자는 일주일 동안 당신과 말을 섞지 않는다.',
  'events.sur.starving.choices.hold.label': '버틴다. 올 것이다.',
  'events.sur.starving.choices.hold.resultText':
    '버틴다. 가장 약한 사람이 아침에 눈에 띄게 나빠져 있다.',

  'events.sur.clean_night.title': '좋은 밤',
  'events.sur.clean_night.body':
    '탱크는 가득하고 선반도 찼고, 오랜만에 처음으로 보고할 비상이 없는 저녁이다.',
  'events.sur.clean_night.choices.rest.label': '다들 일찍 손 놓게 한다',
  'events.sur.clean_night.choices.rest.resultText':
    '카드놀이, 제목을 아무도 기억하지 못하는 영화에 대한 말다툼, 그리고 이른 소등.',
  'events.sur.clean_night.choices.push.label': '좋은 날을 써서 앞서 나간다',
  'events.sur.clean_night.choices.push.resultText':
    '선반과 덕트에 두 시간 더. 분별 있다. 조금 삭막하다.',
  'events.sur.clean_night.choices.talk.label': '앉아서 예전 이야기를 하게 둔다',
  'events.sur.clean_night.choices.talk.resultText':
    '지나치게 오래 이어지고, 어떤 작업보다 훨씬 큰 도움이 된다.',
};
