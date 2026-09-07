import type { ContentBundle } from '../../../types';

/**
 * 사건: 메리디언 계열과 현장 발견.
 *
 * 이 게임의 중심 서사가 밝혀지는 대목이라 문서 인용은 원문의 공문서체를 유지하고,
 * 대문자로 강조된 부분은 명령조로 옮긴다. 노드 번호와 방위는 그대로 둔다.
 */
export const KO_EVENTS_MERIDIAN: ContentBundle = {
  /* ========================================================== 메리디언 */
  'events.mer.the_fire_plan.title': '피난도가 틀렸다',
  'events.mer.the_fire_plan.body':
    '누군가 지하층 벽의 피난도를 그것이 가리키는 복도와 두 번 맞춰 보더니 당신을 찾아온다. 도면에는 있는데 실제로는 없는 통로가 있고, 실제로는 있는데 도면에는 없는 통로가 있다.',
  'events.mer.the_fire_plan.choices.measure_it.label': '걸음으로 제대로 재 본다',
  'events.mer.the_fire_plan.choices.measure_it.hint': '저녁 하나를 쓴다. 의문이 정리된다.',
  'events.mer.the_fire_plan.choices.measure_it.resultText':
    '설명되지 않는 11미터. 기계실 뒤, 이 아래 다른 어떤 벽보다 두꺼운 벽 너머에 있다.',
  'events.mer.the_fire_plan.choices.ask_around.label': '저 뒤에 뭐가 있는지 아는 사람이 있는지 묻는다',
  'events.mer.the_fire_plan.choices.ask_around.successText':
    '한 사람이 같은 문 코드를 쓰는 곳에서 계약직으로 일한 적이 있다. 그 이상은 말하지 않으려 하고, 그 말을 한 것 자체를 후회하는 얼굴이다.',
  'events.mer.the_fire_plan.choices.ask_around.failureText':
    '아는 사람이 없고, 물어본 탓에 다들 그것을 생각하게 됐다. 그것도 나름의 답이다.',
  'events.mer.the_fire_plan.choices.ignore_plan.label': '오래된 건물이다. 넘어간다.',
  'events.mer.the_fire_plan.choices.ignore_plan.resultText':
    '도면 오류보다 급한 일이 있다. 아침에도, 그다음 아침에도 벽은 그대로 있다.',

  'events.mer.the_bulkhead.title': '지하층의 격벽',
  'events.mer.the_bulkhead.body':
    '기계실 뒤, 피난도에 없는 복도를 지나면 키패드와 정비 패널이 달린 격벽이 있다.',
  'events.mer.the_bulkhead.choices.work_the_panel.label': '정비 패널을 연다',
  'events.mer.the_bulkhead.choices.work_the_panel.successText':
    '정비 규약이 패널 안쪽에 인쇄되어 있다. 손이 들겠지만, 열린다.',
  'events.mer.the_bulkhead.choices.work_the_panel.failureText':
    '패널은 완강하고 인터록은 눈에 띄지 않는다. 제대로 된 연구가 필요하다.',
  'events.mer.the_bulkhead.choices.force_it.label': '잘라서 뚫는다',
  'events.mer.the_bulkhead.choices.force_it.hint':
    '비싸고 진이 빠진다. 연구 없이 심층 기록고가 열린다.',
  'events.mer.the_bulkhead.choices.force_it.resultText':
    '토치로 아홉 시간, 그리고 봉인된 캐비닛의 행렬과 아직 전원이 들어오는 판독기가 나온다.',
  'events.mer.the_bulkhead.choices.leave_bulkhead.label': '지금은 놔둔다',
  'events.mer.the_bulkhead.choices.leave_bulkhead.resultText':
    '닫힌 채로 있다. 저녁이면 누군가 그 앞에 한참 서 있다.',

  'events.mer.node_twelve.title': '12번 시설',
  'events.mer.node_twelve.body': '기록고가 노드 명부를 내놓았고, 그중 한 줄이 이 건물에 대한 것이다.',
  'events.mer.node_twelve.choices.read_register.label': '명부를 읽는다',
  'events.mer.node_twelve.choices.read_register.resultText':
    '12번은 실패해서 버려진 것이 아니다. 이곳 암반이 실제로 듣기 때문에 비워진 것이다.',
  'events.mer.node_twelve.choices.read_aloud_register.label': '모두에게 읽어 준다',
  'events.mer.node_twelve.choices.read_aloud_register.resultText':
    '누군가 “3등급 청각 반응의 부재”가 무슨 뜻이냐고 묻고, 아무도 답하지 못한다.',

  'events.mer.selection_criteria.title': '선발 기준',
  'events.mer.selection_criteria.body':
    '온전하게 회수된 한 쪽, 노드 인원을 어떻게 골랐는지가 적혀 있다.',
  'events.mer.selection_criteria.choices.file_it.label': '철해 두고 하던 일을 한다',
  'events.mer.selection_criteria.choices.file_it.resultText':
    '기술적 역량, 생식 가능성, 그리고 여기 누구도 검사할 수 없는 반응의 부재.',
  'events.mer.selection_criteria.choices.test_ourselves.label': '여기 누가 자격이 됐을지 따져 본다',
  'events.mer.selection_criteria.choices.test_ourselves.resultText':
    '둘은 됐을 것이다. 나머지는 기록되고, 제외되고, 이유는 듣지 못했을 것이다.',
  'events.mer.selection_criteria.choices.burn_the_page.label': '태운다',
  'events.mer.selection_criteria.choices.burn_the_page.resultText':
    '4초쯤 걸린다. 그 방에 있던 누구도 반대하지 않는다.',

  'events.mer.the_committee.title': '상임위원회 회의록',
  'events.mer.the_committee.body':
    '아흐레에 걸친 회의록 마흔 쪽, 마지막 것은 고요 전날 것이다.',
  'events.mer.the_committee.choices.read_all.label': '마흔 쪽을 전부 읽는다',
  'events.mer.the_committee.choices.read_all.resultText':
    '4항: 본 현상은 공격이 아니다. 5항: 대외적으로는 계속 기반 시설 붕괴로 기술한다. 6항: 메리디언을 발동한다.',
  'events.mer.the_committee.choices.summarise.label': '누군가에게 요약해 전하게 한다',
  'events.mer.the_committee.choices.summarise.resultText':
    '취사장에서 세 문장. 한참 아무도 말이 없다가, 그다음엔 모두가 한꺼번에 말한다.',

  'events.mer.the_decision.title': '세 개의 문',
  'events.mer.the_decision.body':
    '이 볼트가 무엇인지, 그 계획이 무엇이었는지, 무엇이 물어 오고 있는지 대강 안다. 그것으로 할 수 있는 일이 셋 있고, 그중 하나만 할 수 있다.',
  'events.mer.the_decision.choices.go_down.label': '사람이 있는 노드를 찾아 들어간다',
  'events.mer.the_decision.choices.go_down.hint': '메리디언 결말이 열린다.',
  'events.mer.the_decision.choices.go_down.resultText':
    '해치 하나, 열쇠 하나, 그리고 적어도 둘은 아직 따뜻한 마흔한 개의 시설.',
  'events.mer.the_decision.choices.go_west.label': '물어 오는 것을 찾아 나선다',
  'events.mer.the_decision.choices.go_west.hint': '신호 결말이 열린다.',
  'events.mer.the_decision.choices.go_west.resultText':
    '방위 041, 그리고 그 방의 모두가 이 문은 양쪽으로 열리지 않는다는 것을 이해한다.',
  'events.mer.the_decision.choices.stay.label': '남아서 이곳을 굴러가게 만든다',
  'events.mer.the_decision.choices.stay.hint': '깊은 뿌리 결말이 열린다.',
  'events.mer.the_decision.choices.stay.resultText':
    '이곳 암반은 그것을 90퍼센트 깎아 낸다. 그것은 아무것도 아닌 게 아니다. 사실은 그것이 전부다.',

  'events.mer.the_convoy.title': '수송대',
  'events.mer.the_convoy.body':
    '기계 공작실이면 만들 수 있다. 문제는 연료 60리터와 몇 달째 아무도 달리지 않은 도로가 계획인지, 아니면 다른 데서 죽는 방법인지다.',
  'events.mer.the_convoy.choices.start_it.label': '만들기 시작한다',
  'events.mer.the_convoy.choices.start_it.resultText':
    '차량 둘, 작업장 벽의 경로, 그리고 그 옆에 분필로 적은 연료 목표.',
  'events.mer.the_convoy.choices.plan_only.label': '계획만 세우고 확약하지 않는다',
  'events.mer.the_convoy.choices.plan_only.resultText':
    '경로 하나, 연료 수치 하나, 그리고 결론이 날 때까지 주마다 반복될 논쟁 하나.',
  'events.mer.the_convoy.choices.refuse_convoy.label': '우리가 있을 곳은 여기다',
  'events.mer.the_convoy.choices.refuse_convoy.resultText':
    '한 번, 분명히 말한다. 그리고 경로는 벽에 올라가지 않는다.',

  'events.mer.attenuation.title': '감쇠',
  'events.mer.attenuation.body':
    '읽어 내는 데 사흘이 걸린 디스크에서 회수한, 모형의 마지막 절.',
  'events.mer.attenuation.choices.read_model.label': '읽는다',
  'events.mer.attenuation.choices.read_model.resultText':
    '세로축에는 “아직 반응하는 비율”이라고 적혀 있다. 곡선은 7년째에 0에 닿는다.',
  'events.mer.attenuation.choices.model_ourselves.label': '이 볼트에 모형을 돌려 본다',
  'events.mer.attenuation.choices.model_ourselves.resultText':
    '이 암반에서 감쇠 91퍼센트. 여기 아래에서는 곡선이 0에 닿지 않는다. 여기 아래에서는 시작조차 하지 않는다.',

  /* ============================================================== 현장 */
  'events.site.tower_transmission.title': '철탑 아래',
  'events.site.tower_transmission.body':
    '밑동의 관리동은 안쪽에서 용접해 잠겼고, 그러기 전에 누군가 문 안면에 무언가를 적었다.',
  'events.site.tower_transmission.choices.read_door.label': '문에 적힌 것을 읽는다',
  'events.site.tower_transmission.choices.read_door.resultText':
    '나는 그것에게 질문을 했고 그것은 답했다. 세 번째 질문은 하지 마라.',
  'events.site.tower_transmission.choices.strip_tower.label': '관리동을 뜯고 떠난다',
  'events.site.tower_transmission.choices.strip_tower.resultText':
    '송수신기 하나, 회전기 제어반 하나, 그리고 좋은 동축 케이블 400미터.',

  'events.site.data_centre_console.title': '냉각실의 콘솔',
  'events.site.data_centre_console.body':
    '랙 하나에 아직 전기가 들어오고, 콘솔은 몇 주째 커서를 깜빡이는 로그인 프롬프트를 띄우고 있다.',
  'events.site.data_centre_console.choices.log_in.label': '정비 계정을 시도한다',
  'events.site.data_centre_console.choices.log_in.successText':
    '하나의 표제 아래 줄지어 선 디렉터리들. 메리디언 연속성. 12번 노드는 개방으로 되어 있다.',
  'events.site.data_centre_console.choices.log_in.failureText':
    '세 번 시도하자 콘솔이 스스로를 지운다. 팬이 잦아들고 방이 마침내 조용해진다.',
  'events.site.data_centre_console.choices.pull_drives.label': '디스크를 뽑는다',
  'events.site.data_centre_console.choices.pull_drives.resultText':
    '캐디 넷, 아직 차갑다. 읽는 것은 볼트에서, 전기가 있는 곳에서, 다른 사람 몫이 될 것이다.',

  'events.site.signal_source.title': '차고',
  'events.site.signal_source.body':
    '방위선이 끝나는 곳은 자동차 배터리와 안테나, 반복 재생 중인 카세트 데크가 있는 가정집 차고다. 누군가 배터리를 갈아 왔다.',
  'events.site.signal_source.choices.wait_for_her.label': '가는 사람을 기다린다',
  'events.site.signal_source.choices.wait_for_her.successText':
    '“나는 송신하는 게 아니에요.” 그가 말한다. “중계하는 겁니다. 누군가 계속 흘려보내지 않으면 다른 통로를 찾기 시작하거든요.”',
  'events.site.signal_source.choices.wait_for_her.failureText':
    '아무도 오지 않는다. 빛을 잃고 힘겹게 걸어 돌아온다.',
  'events.site.signal_source.choices.take_the_rig.label': '장비를 가져간다',
  'events.site.signal_source.choices.take_the_rig.resultText':
    '전부 들어낸다. 신호가 멈춘다. 나흘 뒤 다른 곳에서 다시 시작된다.',

  'events.site.meridian_hatch.title': '7번 해치',
  'events.site.meridian_hatch.body':
    '당신들 방폭문과 같은 스텐실. 같은 도장 코드. 같은 연도. 한 자리만 다르고, 밀폐부로 따뜻한 공기가 올라온다.',
  'events.site.meridian_hatch.choices.use_key.label': '메리디언 열쇠를 쓴다',
  'events.site.meridian_hatch.choices.use_key.resultText':
    '돌아간다. 아래로 내려가는 계단, 불이 켜져 있고, 따뜻한 공기, 그리고 그 아래 어딘가에서 몇 달째 돌고 있는 설비.',
  'events.site.meridian_hatch.choices.document_hatch.label': '전부 기록하고 물러난다',
  'events.site.meridian_hatch.choices.document_hatch.resultText':
    '명판 번호, 스텐실, 그리고 밀폐부 온도. 기록고가 작업할 만큼은 된다.',
  'events.site.meridian_hatch.choices.knock.label': '두드린다',
  'events.site.meridian_hatch.choices.knock.resultText':
    '30센티 강철을 네 번. 아무것도 답하지 않는다. 돌아오는 내내 다들 뒤를 돌아본다.',
};
