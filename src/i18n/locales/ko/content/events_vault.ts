import type { ContentBundle } from '../../../types';

/**
 * 사건: 시설과 날씨.
 *
 * 설비 고장과 기상은 이 게임에서 가장 기술적인 문장들이라 용어를 정확히 옮기고,
 * 원문이 정비 기록처럼 담담한 어조를 유지하는 점을 그대로 지킨다.
 */
export const KO_EVENTS_VAULT: ContentBundle = {
  /* ============================================================== 시설 */
  'events.fac.breakdown.title': '멈췄다',
  'events.fac.breakdown.body':
    '첫날부터 소리를 내던 무언가가 더는 소리를 내지 않고, 그 침묵이 훨씬 나쁘다.',
  'events.fac.breakdown.choices.fix_now.label': '오늘 밤 안에 고친다',
  'events.fac.breakdown.choices.fix_now.successText':
    '세 시간, 누군가 이로 문 손전등, 그리고 네 번째 시도에서 돌아간다.',
  'events.fac.breakdown.choices.fix_now.failureText':
    '돌기는 한다. 나쁘게 돈다. 고친 사람은 내일을 못 쓸 만큼 망가졌다.',
  'events.fac.breakdown.choices.bodge.label': '임시로 때우고 넘어간다',
  'events.fac.breakdown.choices.bodge.resultText':
    '테이프, 호스 밴드, 그리고 제대로 하겠다는 약속. 더 빨리 다시 고장 날 것이다.',
  'events.fac.breakdown.choices.strip_it.label': '부품으로 뜯고 없이 지낸다',
  'events.fac.breakdown.choices.strip_it.resultText':
    '아주 쓸모 있는 더미로 분해된다. 볼트의 계통이 하나 줄었다.',

  'events.fac.behind_the_panel.title': '패널 뒤',
  'events.fac.behind_the_panel.body':
    '배선을 넣으려고 벽을 뜯다가, 어느 도면에도 없는 공간을 발견한다. 그리고 그 안에 무언가가 있다.',
  'events.fac.behind_the_panel.choices.open_it.label': '뜯어서 연다',
  'events.fac.behind_the_panel.choices.open_it.resultText':
    '케이블 드럼들, 공구함 하나, 그리고 원자로 외함의 것과 같은 필체로 적힌 쪽지.',
  'events.fac.behind_the_panel.choices.survey.label': '먼저 제대로 조사한다',
  'events.fac.behind_the_panel.choices.survey.successText':
    '층 전체를 따라 이어지는 설비 공간, 그리고 한 번도 사람이 들어간 적 없는 시설의 비축 목록.',
  'events.fac.behind_the_panel.choices.survey.failureText':
    '패널이 벽을 의도보다 많이 데리고 떨어져 나온다.',
  'events.fac.behind_the_panel.choices.seal.label': '막고 배선 작업을 끝낸다',
  'events.fac.behind_the_panel.choices.seal.resultText':
    '철판으로 덮고 잊는다. 해야 할 일이 있다.',

  'events.fac.flood.title': '층에 물이 찼다',
  'events.fac.flood.body':
    '아침이면 아래층 전체에 3센티미터, 천천히 오르고 있고, 정수기 뒤 어딘가에서 나온다.',
  'events.fac.flood.choices.find_source.label': '원인을 찾아 막는다',
  'events.fac.flood.choices.find_source.successText':
    '환수관 연결부에 금이 갔다. 막았고, 저녁이면 바닥이 마른다. 그리고 탱크는 전보다 차 있다.',
  'events.fac.flood.choices.find_source.failureText':
    '두 시간을 물속에서 보내고 원인은 못 찾는다. 정수기는 그 수색으로 더 나빠졌다.',
  'events.fac.flood.choices.pump_it.label': '퍼내고 전부 높이 올린다',
  'events.fac.flood.choices.pump_it.resultText':
    '전부 팔레트 위로, 수동 펌프는 밤새. 다시 찰 것이다.',
  'events.fac.flood.choices.seal_deck.label': '아래층을 통째로 봉쇄한다',
  'events.fac.flood.choices.seal_deck.resultText':
    '격벽이 내려온다. 거기 있던 무엇이든 이제 거기 있다.',

  'events.fac.the_smell_of_burning.title': '타는 냄새',
  'events.fac.the_smell_of_burning.body':
    '뜨거운 절연물, 틀림없다. 첫 주 이후 아무도 열지 않은 배전반에서 난다.',
  'events.fac.the_smell_of_burning.choices.kill_power.label': '전원을 내리고 배전반을 연다',
  'events.fac.the_smell_of_burning.choices.kill_power.resultText':
    '네 시간 동안 전부 정전, 어둠 속에서, 그을린 부스바를 제대로 교체한다.',
  'events.fac.the_smell_of_burning.choices.live_work.label': '활선 작업으로 한다 — 정전은 감당 못 한다',
  'events.fac.the_smell_of_burning.choices.live_work.successText':
    '절연 매트, 한 손은 등 뒤로, 40분 만에 아무 손실 없이 끝난다.',
  'events.fac.the_smell_of_burning.choices.live_work.failureText':
    '배전반을 가로지르는 섬광. 튕겨 나가고, 팔뚝에 아주 심한 화상을 입는다.',
  'events.fac.the_smell_of_burning.choices.isolate_circuit.label': '그 회로를 끊고 없이 산다',
  'events.fac.the_smell_of_burning.choices.isolate_circuit.resultText':
    '차단기 하나 영구히 내림. 이제 시설 둘이 같은 계통에 걸려 있고 둘 다 그것을 안다.',

  'events.fac.the_door_schedule.title': '문 점검 일정표',
  'events.fac.the_door_schedule.body':
    '방폭문 함 안쪽에 코팅된 카드가 있다. 개방 권한과 정비 일정이 적혀 있고, 날짜는 고요 이후 8개월이다.',
  'events.fac.the_door_schedule.choices.read.label': '제대로 읽는다',
  'events.fac.the_door_schedule.choices.read.resultText':
    '일정표는 이 볼트에 사람이 있고 정비를 받는다고 전제한다. 누구에 의해서인지는 적혀 있지 않다.',
  'events.fac.the_door_schedule.choices.show_everyone.label': '모두에게 보여 준다',
  'events.fac.the_door_schedule.choices.show_everyone.resultText':
    '아무도 잘 자지 못한다. 다들 당신을 조금 더 믿는다.',
  'events.fac.the_door_schedule.choices.pocket_it.label': '주머니에 넣는다',
  'events.fac.the_door_schedule.choices.pocket_it.resultText':
    '주머니에 들어가 거기 남는다. 인정하는 것보다 자주 꺼내 본다.',

  'events.fac.air_quality.title': '공기가 탁해진다',
  'events.fac.air_quality.body':
    '매일 오후면 전원이 두통을 앓는다. 공기 정화기는 원래 설치된 것이고 몇 주째 쉬지 않고 돌았다.',
  'events.fac.air_quality.choices.service.label': '정화기를 정비한다',
  'events.fac.air_quality.choices.service.resultText':
    '여과재를 갈고 팬을 닦으니 저녁에는 두통이 사라진다.',
  'events.fac.air_quality.choices.open_up.label': '하루 한 시간 계단 입구를 연다',
  'events.fac.air_quality.choices.open_up.resultText':
    '매일 진짜 공기. 크게 도움이 되고, 문이 열려 있다는 것이 무슨 뜻인지 다들 안다.',
  'events.fac.air_quality.choices.endure.label': '견딘다',
  'events.fac.air_quality.choices.endure.resultText':
    '두통이 심해진다. 한 사람에게 가라앉지 않는 기침이 생긴다.',

  'events.fac.hydroponics_blight.title': '트레이가 망가지고 있다',
  'events.fac.hydroponics_blight.body':
    '잎끝부터 노랗게 변하며 빠르게 번진다. 이미 트레이 셋이다.',
  'events.fac.hydroponics_blight.choices.diagnose.label': '진단한다',
  'events.fac.hydroponics_blight.choices.diagnose.successText':
    '병해가 아니라 양분 불균형이다. 하루 만에 바로잡았고, 이제 적어 두었다.',
  'events.fac.hydroponics_blight.choices.diagnose.failureText':
    '짐작으로 세 가지를 한꺼번에 손보다가 트레이 둘을 더 잃는다.',
  'events.fac.hydroponics_blight.choices.cull.label': '감염된 트레이를 즉시 버린다',
  'events.fac.hydroponics_blight.choices.cull.resultText':
    '트레이 셋을 폐기한다. 거기서 멈추고, 그것이 요점이다.',
  'events.fac.hydroponics_blight.choices.harvest_early.label': '지금 전부 수확한다',
  'events.fac.hydroponics_blight.choices.harvest_early.resultText':
    '덜 자란 채로 전부, 한꺼번에. 식량은 많고 계통은 다시 세워야 한다.',

  'events.fac.the_rubble.title': '3층의 잔해',
  'events.fac.the_rubble.body':
    '봉쇄된 구역이 계속 내려앉고 있다. 천장을 무너뜨린 것이 무엇이든 아직 아주 천천히 움직이고 있다.',
  'events.fac.the_rubble.choices.shore_it.label': '치우기 전에 받친다',
  'events.fac.the_rubble.choices.shore_it.resultText':
    '지주, 받침대, 그리고 매일 확인하는 다림줄. 움직임이 멎는다.',
  'events.fac.the_rubble.choices.clear_fast.label': '빠르게 치운다',
  'events.fac.the_rubble.choices.clear_fast.resultText':
    '이틀치 일을 하루에 하고, 한 구획이 누군가의 다리 위로 내려앉는다.',
  'events.fac.the_rubble.choices.leave.label': '봉쇄한 채로 둔다',
  'events.fac.the_rubble.choices.leave.resultText':
    '격벽은 닫혀 있다. 가끔 밤에 내려앉는 소리가 들린다.',

  'events.fac.storage_overflow.title': '선반이 휜다',
  'events.fac.storage_overflow.body':
    '누군가 정격 하중 위로 쌓아 왔고 기둥이 배부르기 시작했다.',
  'events.fac.storage_overflow.choices.brace.label': '보강하고 다시 나눈다',
  'events.fac.storage_overflow.choices.brace.resultText':
    '기둥을 가로질러 앵글을 용접하고 칸마다 분필로 하중 한계를 적는다.',
  'events.fac.storage_overflow.choices.ignore.label': '버틸 것이다',
  'events.fac.storage_overflow.choices.ignore.resultText':
    '버티지 못한다. 새벽 네 시에 한 칸이 그것을 쌓던 사람 위로 무너진다.',
  'events.fac.storage_overflow.choices.unload.label': '윗칸을 복도로 내린다',
  'events.fac.storage_overflow.choices.unload.resultText':
    '복도가 창고가 되었고 다들 옆걸음으로 다녀야 한다.',

  'events.fac.the_lab_result.title': '아무도 예상 못 한 결과',
  'events.fac.the_lab_result.body':
    '어느 지점에서 가져온 시료가 값을 내놓았고, 측정한 사람이 네 번을 다시 확인했다.',
  'events.fac.the_lab_result.choices.pursue.label': '모든 것을 멈추고 파고든다',
  'events.fac.the_lab_result.choices.pursue.resultText':
    '이틀 동안 다른 것은 하나도 하지 않는다. 연구실이 보낸 가장 값진 이틀이다.',
  'events.fac.the_lab_result.choices.log_it.label': '기록해 두고 하던 일을 한다',
  'events.fac.the_lab_result.choices.log_it.resultText':
    '정리해 적고 철해 두고 원래 일로 돌아간다.',
  'events.fac.the_lab_result.choices.suppress.label': '그만 들여다보라고 한다',
  'events.fac.the_lab_result.choices.suppress.resultText':
    '그만둔다. 그 일로 눈에 띄게 시들고, 볼트는 조금 편히 잔다.',

  /* ============================================================== 날씨 */
  'events.env.the_storm.title': '폭풍',
  'events.env.the_storm.body':
    '해 질 무렵 서쪽에서 들어오고, 자정이면 지상에서 차문만 한 파편이 날아다닌다.',
  'events.env.the_storm.choices.secure.label': '계단 입구를 단속하고 버틴다',
  'events.env.the_storm.choices.secure.resultText':
    '빗장 걸고 쐐기 박고 모래주머니까지. 아침이면 집수조는 가득하고 마당은 알아볼 수 없다.',
  'events.env.the_storm.choices.catchment.label': '가진 용기를 전부 홈통에 댄다',
  'events.env.the_storm.choices.catchment.resultText':
    '그 속에서 지상 두 시간. 탱크는 가득하고 누군가는 한 시간 동안 떨고 있다.',
  'events.env.the_storm.choices.work_through_storm.label': '평소대로 한다',
  'events.env.the_storm.choices.work_through_storm.resultText':
    '지상의 무언가가 안테나를 떼어 가고, 다른 무언가가 덕트로 들어온다.',

  'events.env.ash.title': '재가 내린다',
  'events.env.ash.body':
    '오후에 시작해 저녁이면 1센티미터가 쌓였고 아직 내린다. 미지근하고, 아무 냄새도 나지 않는다.',
  'events.env.ash.choices.seal_up.label': '흡기구를 전부 막는다',
  'events.env.ash.choices.seal_up.resultText':
    '필터를 겹치고 흡기구마다 테이프. 공기가 답답하고 깨끗하다.',
  'events.env.ash.choices.sample_it.label': '시료를 받아 분석한다',
  'events.env.ash.choices.sample_it.successText':
    '화산재도 아니고 연소 생성물도 아니다. 확대해 보면 거의 전부 유기물이다.',
  'events.env.ash.choices.sample_it.failureText':
    '결론이 없고, 채취한 사람은 일주일 동안 기침한다.',
  'events.env.ash.choices.ignore_ash.label': '하던 대로 한다',
  'events.env.ash.choices.ignore_ash.resultText':
    '필터로, 재배 트레이로, 그리고 두 사람의 폐로 들어간다.',

  'events.env.the_cold_snap.title': '된서리',
  'events.env.the_cold_snap.body':
    '계단 입구 문 안쪽에 얼음이 얼었고, 원자로가 온도를 유지하려고 눈에 띄게 힘을 쓴다.',
  'events.env.the_cold_snap.choices.burn_it.label': '드는 만큼 태운다',
  'events.env.the_cold_snap.choices.burn_it.resultText':
    '이틀 동안 볼트가 정말로 따뜻하고 다들 잠을 잔다.',
  'events.env.the_cold_snap.choices.consolidate.label': '전원이 한 방에서 잔다',
  'events.env.the_cold_snap.choices.consolidate.resultText':
    '열 사람, 방 하나, 그리고 상당한 체온. 아무도 즐겁지 않고 다들 따뜻하다.',
  'events.env.the_cold_snap.choices.endure_cold.label': '껴입고 견딘다',
  'events.env.the_cold_snap.choices.endure_cold.resultText':
    '이틀. 가장 나이 많은 사람이 둘째 날 저녁에 정신이 흐려져 부축을 받아 침상으로 간다.',

  'events.env.clear_sky.title': '맑은 하늘',
  'events.env.clear_sky.body':
    '몇 주 만에 처음으로 안개가 걷힌다. 밤에 계단 입구에서 별이 보이고, 지평선 어디에도 불빛이 없다.',
  'events.env.clear_sky.choices.let_them_up.label': '한 시간 올라가 있게 한다',
  'events.env.clear_sky.choices.let_them_up.resultText':
    '외투를 입고 계단 입구에 다 나와서 별말 없이 있는다. 누군가 인공위성을 가리켰다가 그것이 아님을 깨닫는다.',
  'events.env.clear_sky.choices.observe.label': '기회를 살려 제대로 관측한다',
  'events.env.clear_sky.choices.observe.successText':
    '쌍안경과 구역도로 여섯 시간. 새 건물 넷, 통행 가능한 도로 둘을 확인한다.',
  'events.env.clear_sky.choices.observe.failureText': '추위 속 두 시간에 건물 하나.',
  'events.env.clear_sky.choices.keep_working.label': '맑은 밤은 일하기 좋은 밤이다',
  'events.env.clear_sky.choices.keep_working.resultText':
    '좋은 빛, 찬 공기, 그리고 차라리 하늘을 올려다보고 싶었던 사람들이 해낸 많은 일.',

  'events.env.the_fog.title': '안개',
  'events.env.the_fog.body':
    '강에서 밀려와 오전 중반이면 마당 건너편이 보이지 않는다. 그 안에서는 소리가 이상하게 움직인다.',
  'events.env.the_fog.choices.use_cover.label': '이용한다 — 낮에 물자를 옮긴다',
  'events.env.the_fog.choices.use_cover.resultText':
    '맑은 날이면 자살행위였을 트인 지형을 세 번 왕복한다.',
  'events.env.the_fog.choices.stay_in.label': '아무도 나가지 않는다',
  'events.env.the_fog.choices.stay_in.resultText': '허비한 하루, 그리고 완전히 안전한 하루.',
  'events.env.the_fog.choices.listen.label': '청음 감시를 세운다',
  'events.env.the_fog.choices.listen.resultText':
    '네 시간, 그리고 그 어느 시점에 아무도 설명할 수 없는 발소리가 마당을 가로지른다.',

  'events.env.the_heat.title': '철 이른 더위',
  'events.env.the_heat.body':
    '침출수가 줄고, 볼트는 숨 막히고, 이틀째 오후면 다들 눈에 띄게 예민해진다.',
  'events.env.the_heat.choices.ration_hard.label': '이틀 동안 물을 강하게 제한한다',
  'events.env.the_heat.choices.ration_hard.resultText':
    '계량한 2리터, 씻기는 없음. 곁에 있기 불쾌한 사람들이 되고 탱크는 버틴다.',
  'events.env.the_heat.choices.night_shift.label': '전원 야간 근무로 바꾼다',
  'events.env.the_heat.choices.night_shift.resultText':
    '시원하고 조용하고, 그 뒤 일주일 동안 다들 잠이 엉망이다.',
  'events.env.the_heat.choices.nothing_heat.label': '지나갈 것이다',
  'events.env.the_heat.choices.nothing_heat.resultText':
    '지나간다. 탱크는 눈에 띄게 줄었고 두 사람에게 땀띠가 났다.',

  'events.env.rain_at_last.title': '비',
  'events.env.rain_at_last.body':
    '꾸준하고 볼품없이, 여섯 시간째 내린다. 홈통이 가득 흐르고 있다.',
  'events.env.rain_at_last.choices.collect.label': '받을 수 있는 만큼 전부 받는다',
  'events.env.rain_at_last.choices.collect.resultText':
    '볼트의 드럼, 양동이, 욕조까지 전부 마당에 내놓는다. 거의 일주일치 물이다.',
  'events.env.rain_at_last.choices.wash.label': '다들 제대로 씻게 한다',
  'events.env.rain_at_last.choices.wash.resultText':
    '차갑고, 바깥이고, 볼썽사납다. 두 주 만에 가장 좋은 20분이다.',
  'events.env.rain_at_last.choices.both.label': '먼저 받고, 넘치는 물로 씻는다',
  'events.env.rain_at_last.choices.both.resultText':
    '조직적이고 분별 있고, 다들 원하던 것의 대부분을 얻는다.',

  'events.env.something_growing_outside.title': '마당에 무언가 자란다',
  'events.env.something_growing_outside.body':
    '담장 옆 갈라진 콘크리트에서 초록이 빽빽하게, 날마다 늘어난다. 아무도 심지 않았다.',
  'events.env.something_growing_outside.choices.harvest_it.label': '수확한다',
  'events.env.something_growing_outside.choices.harvest_it.successText':
    '명아주와 쐐기풀이 잔뜩. 먹을 수 있고, 많고, 계속 다시 난다.',
  'events.env.something_growing_outside.choices.harvest_it.failureText': '세 종 중 둘은 괜찮았다.',
  'events.env.something_growing_outside.choices.study_it.label': '손대기 전에 조사한다',
  'events.env.something_growing_outside.choices.study_it.resultText':
    '그럴 리 없는 속도로 네 배 빠르게 자라고 있고, 그 이유는 토양 화학에 있다.',
  'events.env.something_growing_outside.choices.clear_it.label': '없앤다 — 콘크리트를 갈라놓는다',
  'events.env.something_growing_outside.choices.clear_it.resultText':
    '뽑고 태우고, 마당은 다시 마당이 된다.',
};
