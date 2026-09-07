import type { ContentBundle } from '../../../types';

/**
 * 회차의 뼈대: 시나리오, 결말, 유산 해금, 성격, 그리고 전투 상대.
 *
 * 결말 후일담은 이 게임에서 가장 긴 산문이라 원문의 호흡(짧은 사실 나열 뒤 한 문장의
 * 판단)을 그대로 지킨다. `{survivors}`와 `{days}`는 자리표시자이므로 반드시 남긴다.
 */
export const KO_RUN: ContentBundle = {
  /* ------------------------------------------------------------ 시나리오 */
  'scenarios.cold_start.name': '냉시동',
  'scenarios.cold_start.tagline': '낯선 넷, 엿새치 식량, 그리고 잠기는 문 하나.',
  'scenarios.cold_start.description':
    '표준적인 시작. 둘째 주에 볼트 메리디언에 닿았고, 원자로 잔편은 아직 돌고 있으며, 선반에는 며칠쯤 생각할 여유가 남아 있다. 무엇이든 할 수 있고, 무엇도 주어지지 않는다.',

  'scenarios.black_winter.name': '검은 겨울',
  'scenarios.black_winter.tagline': '추위가 당신들보다 먼저 도착했다.',
  'scenarios.black_winter.description':
    '이미 죽은 전력망 위에 닥친 혹한. 연료도, 식량도, 사람도 더 빨리 타 없어진다. 이만큼 추운 곳에서 재배등만으로는 수경 재배가 절반밖에 나오지 않고, 날씨는 맑은 한 주를 내주지 않는다.',

  'scenarios.silent_city.name': '침묵의 도시',
  'scenarios.silent_city.tagline': '무전실이 탔다. 아무도 당신에게 아무것도 알려 주지 않는다.',
  'scenarios.silent_city.description':
    '둘째 날 밤의 화재가 통신 구역을 가져갔다. 일기예보도, 거래 상대도, 먼 곳의 발견도, 그 어떤 사전 경고도 없다. 열흘 동안, 그리고 다시 세운 뒤에야 겨우. 바깥에서 송신하는 무언가는 일단 당신들을 적으로 가정하고 시작한다.',

  'scenarios.last_convoy.name': '마지막 수송대',
  'scenarios.last_convoy.tagline': '여덟 사람. 사흘치 식량. 빠져나갈 시간은 스물닷새.',
  'scenarios.last_convoy.description':
    '북동쪽으로 향하던 행렬이 두 블록 앞에서 흩어졌고, 그 남은 것이 당신들의 계단으로 내려왔다. 여덟 개의 입, 거기 넣을 것은 거의 없음, 그리고 스물닷새째에 길이 영영 닫힌다는 소식. 수송대를 만들거나, 그날 여기 남거나.',
  'scenarios.last_convoy.deadlineText': '북동쪽 도로는 25일차에 닫힌다.',

  'scenarios.skeleton_crew.name': '최소 인원',
  'scenarios.skeleton_crew.tagline': '두 사람과, 도저히 다 채울 수 없는 완성된 볼트.',
  'scenarios.skeleton_crew.description':
    '여기 있던 누군가가 일을 다 해 놓고 살아남지는 못했다. 핵심 시설은 전부 1단계로 서 있고, 그 전부를 돌릴 사람은 둘이다. 이것은 사망자가 나오는 일정 문제다.',

  'scenarios.meridian_key.name': '메리디언 열쇠',
  'scenarios.meridian_key.tagline': '당신은 이곳이 무엇이었는지 이미 안다. 저쪽도 안다.',
  'scenarios.meridian_key.description':
    '황동과 세라믹 토큰 하나, 그리고 12번 시설이 무엇을 위해 지어졌는지에 대한 절반의 이해를 가지고 도착했다. 심층 기록고는 첫날부터 열려 있고, 그 계획의 반대편에 있는 무언가는 누군가 읽고 있다는 사실을 알고 있다.',

  /* -------------------------------------------------------------- 결말 */
  'endings.silence.name': '침묵',
  'endings.silence.summary': '모두 사라졌다.',
  'endings.silence.epilogue':
    '원자로 잔편은 남은 연료로 열하루를 더 돌고, 그동안 복도의 불은 계속 켜져 있다. 계단으로 내려오는 사람은 없다. 마침내 탱크가 비면 볼트는 당신들이 오기 전과 정확히 같은 것이 된다. 두꺼운 암반 아래 밀봉된 마른 공기 한 덩어리, 기다리는 것.',

  'endings.vault_fails.name': '볼트의 붕괴',
  'endings.vault_fails.summary': '살아 있게 해 주던 계통이 멈췄고, 다시 켤 수 없었다.',
  'endings.vault_fails.epilogue':
    '가장 덜 나빠 보이는 방향으로, 들 수 있는 것만 들고 걸어서 떠난다. {survivors}이(가) 마지막으로 마당을 가로질러 비상계단을 오른다. 뒤에서 문을 걸어 잠그지는 않는다. 이제 잠글 이유가 없기 때문이다.',

  'endings.scattered.name': '흩어짐',
  'endings.scattered.summary': '사람들은 당신을 믿지 않게 되었고, 그다음엔 머무르지 않게 되었다.',
  'endings.scattered.epilogue':
    '극적이지 않다. 나흘에 걸쳐 사람들이 그저 있어야 할 자리에 없고, 그러다 침상이 비고, 그러다 남은 것은 당신과 웅웅거리는 소리뿐이다. 누군가 화이트보드를 그대로 두고 갔다. 왼쪽에는 볼트가 가진 것. 오른쪽에는 필요한 것. 일주일째 어느 쪽도 갱신되지 않았다.',

  'endings.deadline_missed.name': '닫힌 도로',
  'endings.deadline_missed.summary': '수송대는 당신들 없이 떠났거나, 애초에 떠나지 못했다.',
  'endings.deadline_missed.epilogue':
    '북동쪽 화물 도로는 다들 말하던 대로 스물닷새째에 잠긴다. {survivors}은(는) 아직 여기 있고, 볼트도 아직 여기 있고, 해안으로 끝나는 판본은 더 이상 존재하지 않는다.',

  'endings.exodus.name': '탈출',
  'endings.exodus.summary': '수송대를 만들고, 연료를 채우고, 몰고 나갔다.',
  'endings.exodus.epilogue':
    '차량 둘, 60리터, 그리고 고요 이후 아무도 달린 적 없는 900킬로미터의 길. {survivors}이(가) {days}일차 첫 빛에 북동쪽으로 간다. 짐칸에는 재배 트레이가, 데이터 슬레이트에는 기록고가 실려 있다. 좋은 계획은 아니다. 애초에 좋은 계획일 수가 없었다. 그저 함께 만든 사람들이 만들어 낸 계획이고, 길이 꺾일 때까지 볼트는 그들 뒤에 서 있다.',

  'endings.deep_root.name': '깊은 뿌리',
  'endings.deep_root.summary':
    '볼트가 스스로 먹이고 스스로 물을 대고 스스로 전기를 만든다. 더 이상 날짜를 세지 않는다.',
  'endings.deep_root.epilogue':
    '9세대는 재배등 스펙트럼만으로 91퍼센트가 발아했다. 정수기는 침출수로 돌고, 침출수는 마르지 않는다. {survivors}을(를) 무기한 먹일 식량이 있고, 이곳의 암반은 무언가가 던지는 물음을 90퍼센트 넘게 깎아 낸다. 위원회는 그것을 알았고, 자신들이 고르지 않은 사람들의 손에 두고 싶어 하지 않았다. {days}일차에 누군가 화이트보드에서 남은 날짜를 지우고 그 자리에 파종 일정을 적는다.',

  'endings.the_thaw.name': '해빙',
  'endings.the_thaw.summary': '겨울을 넘겼다. 해결된 것은 없고, 다들 아직 여기 있다.',
  'endings.the_thaw.epilogue':
    '나흘 내내 옥상 테라스에서 물이 흘러내리고 침출수가 흙빛으로 흐른다. 무전에 답한 사람은 없고, 두 번째 문은 여전히 닫혀 있고, 비축량은 늘 그래 왔던 그대로다. 아무 일도 없다면 겨우 충분한 정도. {days}일차, 바깥 공기가 마침내 안쪽보다 따뜻해져서 한 시간 동안 문을 열어 둔다. {survivors}이(가) 그 자리에 서서 별말 없이 있는다. 문제는 애초에 겨울이 아니었다. 하지만 겨울은 끝났고 당신들은 아직 여기 있다. 당분간은 그것이 성취의 전부다.',

  'endings.signal.name': '신호',
  'endings.signal.summary': '서쪽으로 갔고, 계속 물어 오던 것을 찾아냈다.',
  'endings.signal.epilogue':
    '방위선은 끝내 한 점에서 만나지 않았다. 애초에 점이 아니었기 때문이다. {survivors}이(가) {days}일차에 화물 도로를 따라 걸어 나가고, 볼트 메리디언의 마지막 송신은 9초간의 무변조 반송파, 그리고 다섯 자리 숫자 묶음을 서두르지 않고 읽는 여자의 목소리다. 이 구역에서 네 사람이 그 목소리를 알아듣는다.',

  'endings.meridian.name': '메리디언',
  'endings.meridian.summary': '두 번째 문을 찾았고, 그 계획이 무엇이었는지 알게 되었다.',
  'endings.meridian.epilogue':
    '7번 해치는 불이 들어오고 따뜻한 공기가 올라오는 계단으로 이어진다. 그 아래에는 선발된 사람들과 9년치 비축, 그리고 설명해야 할 것이 잔뜩 있다. {survivors}이(가) {days}일차에 내려간다. 기록고도 한 장 빠짐없이 함께 간다. 해치가 닫히기 전 마지막으로 하는 일은, 누군가 보게끔 문 바깥에 분필로 12라고 쓰는 것이다.',

  'endings.last_light.name': '마지막 불빛',
  'endings.last_light.summary':
    '볼트가 무엇을 위한 곳이었는지, 무엇이 물어 오고 있었는지 알고도, 그래도 선택했다.',
  'endings.last_light.epilogue':
    '헌장과 감쇠 모형, 그리고 스스로 녹음한 적 없는 숫자를 읽는 여자의 41분이 손에 있다. 위원회가 그것을 기반 시설 붕괴라고 적은 이유는 다른 설명이 입 밖에 낼 수 없는 것이었기 때문이고, 이 시설이 비워진 이유는 암반이 실제로 듣기 때문임을 당신은 안다. {days}일차, 그 전부를 탁자에 올려놓고 {survivors}이(가) 무엇을 할지 정한다. 무엇을 정하든, 알고서 정한다. 그것은 결코 보장된 적이 없었다. 다른 거의 누구도 그것을 얻지 못했다.',

  /* ------------------------------------------------------------ 유산 해금 */
  'unlocks.scenario_black_winter.name': '시나리오: 검은 겨울',
  'unlocks.scenario_black_winter.description': '죽은 전력망 위의 혹한. 모든 것이 더 빨리 탄다.',
  'unlocks.scenario_silent_city.name': '시나리오: 침묵의 도시',
  'unlocks.scenario_silent_city.description': '열흘간 무전 없음. 예보도, 접촉도, 경고도 없다.',
  'unlocks.scenario_last_convoy.name': '시나리오: 마지막 수송대',
  'unlocks.scenario_last_convoy.description': '생존자 여덟, 사흘치 식량, 그리고 25일차의 기한.',
  'unlocks.scenario_skeleton_crew.name': '시나리오: 최소 인원',
  'unlocks.scenario_skeleton_crew.description': '두 사람, 완성된 볼트, 그리고 불가능한 근무표.',
  'unlocks.scenario_meridian_key.name': '시나리오: 메리디언 열쇠',
  'unlocks.scenario_meridian_key.description':
    '심층 기록고가 열린 채로 시작한다. 그리고 당신이 읽고 있다는 것을 아는 무언가와 함께.',
  'unlocks.trait_radio_ear.name': '특성: 전파 귀',
  'unlocks.trait_radio_ear.description': '잡음 속의 구조를 듣는 사람이 생성 후보에 추가된다.',
  'unlocks.trait_survivalist.name': '특성: 생존주의자',
  'unlocks.trait_survivalist.description': '정확히 이런 상황을 대비해 온 사람이 추가된다.',
  'unlocks.trait_forager.name': '특성: 채집꾼',
  'unlocks.trait_forager.description': '무엇이 먹을 수 있는지 아는 사람이 추가된다.',
  'unlocks.trait_field_surgeon.name': '특성: 야전 외과의',
  'unlocks.trait_field_surgeon.description': '바닥에서 사람을 열어 본 적 있는 사람이 추가된다.',
  'unlocks.trait_quiet_touched.name': '특성: 고요에 닿은',
  'unlocks.trait_quiet_touched.description':
    '그 일이 벌어질 때 바깥에 있었고 주파수로 꿈을 꾸는 사람이 추가된다.',
  'unlocks.kit_tools.name': '초기 보급: 공구',
  'unlocks.kit_tools.description': '멀티툴, 볼트 커터, 그리고 부품 10을 더 가지고 시작한다.',
  'unlocks.kit_medicine.name': '초기 보급: 의약',
  'unlocks.kit_medicine.description': '구급함, 항생제, 그리고 의약품 6을 더 가지고 시작한다.',
  'unlocks.kit_arms.name': '초기 보급: 무장',
  'unlocks.kit_arms.description': '마체테, 방검 조끼, 그리고 탄약 12를 더 가지고 시작한다.',
  'unlocks.kit_seeds.name': '초기 보급: 종자',
  'unlocks.kit_seeds.description': '모종판 둘과 이미 완료된 박층 수경 연구를 가지고 시작한다.',
  'unlocks.mod_ironman.name': '변형: 아이언맨',
  'unlocks.mod_ironman.description':
    '저장 칸 하나, 매일 덮어쓴다. 잘못된 결정을 되감을 수 없다. 유산 +40%.',
  'unlocks.mod_rich_region.name': '변형: 풍요로운 구역',
  'unlocks.mod_rich_region.description': '지도에 수확물이 30% 늘고 지점이 둘 더 생긴다. 유산 −25%.',
  'unlocks.mod_long_winter.name': '변형: 긴 겨울',
  'unlocks.mod_long_winter.description':
    '어떤 시나리오에서든 회차 내내 한파 확률이 두 배가 된다. 유산 +30%.',
  'unlocks.archive_theories.name': '기록: 가설판',
  'unlocks.archive_theories.description':
    '기록고가 조각을 가설별로 묶고, 각 가설을 얼마나 맞춰 놓았는지 보여 준다.',
  'unlocks.archive_carryover.name': '기록: 연속성',
  'unlocks.archive_carryover.description':
    '이전 회차에서 찾은 기록이 계속 읽을 수 있게 남고, 기록 관련 연구가 15% 저렴해진다.',

  /* -------------------------------------------------------------- 성격 */
  'personalities.steady.name': '침착',
  'personalities.steady.description': '흔들기 어렵고 들뜨게 하기도 어렵다. 할 말만 하고 멈춘다.',
  'personalities.bright.name': '밝음',
  'personalities.bright.description': '농담을 찾아낸다. 가끔 그 농담이 반갑지 않다.',
  'personalities.severe.name': '엄격',
  'personalities.severe.description': '모두에게 기준을 요구한다. 자기 자신부터.',
  'personalities.gentle.name': '온화',
  'personalities.gentle.description': '부탁받지 않아도 남의 무게를 대신 진다.',
  'personalities.guarded.name': '경계',
  'personalities.guarded.description': '지켜본다. 천천히 정한다. 좀처럼 바꾸지 않는다.',
  'personalities.restless.name': '분주',
  'personalities.restless.description': '어둠 속에 앉아 생각하지 못한다. 할 일이 필요하다.',
  'personalities.wry.name': '능청',
  'personalities.wry.description': '전부 받아넘긴다. 넘기지 못하는 그 순간까지.',
  'personalities.devout.name': '신실',
  'personalities.devout.description': '이 일에 의미가 있다고 믿는다. 무슨 의미인지는 따지지 않는다.',
  'personalities.blunt.name': '직설',
  'personalities.blunt.description': '가장 나쁜 순간에 맞는 말을 한다.',
  'personalities.anxious.name': '불안',
  'personalities.anxious.description': '모든 경우를 돌려 본다. 일어나지 않을 경우까지.',
  'personalities.dry.name': '건조',
  'personalities.dry.description': '차가워 보일 만큼 효율적이다. 정확히 차갑지는 않다.',
  'personalities.fierce.name': '맹렬',
  'personalities.fierce.description': '가끔 문제가 될 만큼 사람을 감싼다.',

  /* -------------------------------------------------------------- 상대 */
  'enemies.a pack of dogs.name': '들개 무리',
  'enemies.the ambush.name': '매복조',
  'enemies.the follower.name': '뒤를 밟던 자',
  'enemies.the gate crew.name': '정문 패거리',
  'enemies.the household.name': '그 집 사람들',
  'enemies.the other crew.name': '다른 무리',
  'enemies.the pack.name': '무리',
};
