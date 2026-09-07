import type { ContentBundle } from '../../../types';

/**
 * 기록 조각.
 *
 * 이 게임의 서사는 거의 전부 여기 있다. 각 조각은 서로 다른 사람이 남긴 문서라서
 * 어조가 제각각이다 — 손편지, 근무 일지, 공문, 낙서. 원문의 화자를 지키고, 대문자로
 * 강조된 부분은 굵은 명령조로 옮긴다. 출처는 "장소, 세부"의 짧은 형식을 유지한다.
 */
export const KO_LORE: ContentBundle = {
  'lore.note_kitchen_table.title': '식탁 위에 남겨진 쪽지',
  'lore.note_kitchen_table.source': '아파트 단지, 2층',
  'lore.note_kitchen_table.body':
    '엄마 집에 가 있을게. 개는 데려가고 고양이는 두고 가. 미안. 라디오는 있으라고 하는데 나흘째 같은 말만 하고 오늘 아침엔 수도까지 끊겼어. 우리보다 먼저 오면 여벌 열쇠는 늘 있던 자리에 있어. 사랑해. 부디 무리하지 마.',

  'lore.note_school_run.title': '외투 주머니 속 메모',
  'lore.note_school_run.source': '아파트 단지, 계단참',
  'lore.note_school_run.body':
    '할 일: 빵, 엘리 흡입기, 아빠 일로 병원에 전화. 그 아래, 다른 잉크와 훨씬 흐트러진 글씨로: 병원에서 안 받는다. 어디에서도 안 받는다.',

  'lore.note_names_on_the_wall.title': '벽에 적힌 이름들',
  'lore.note_names_on_the_wall.source': '교회, 북쪽 회랑',
  'lore.note_names_on_the_wall.body':
    '연필로 400개, 그다음엔 매직으로, 펜이 떨어지자 숯으로. 마지막 열두 개는 같은 필체이고, 그중 마지막 하나는 끝맺지 못했다. 그 아래에: 우리는 여기 있었고, 대체로 서로에게 다정했다.',

  'lore.note_queue_discipline.title': '줄 서기 안내',
  'lore.note_queue_discipline.source': '대형 마트, 고객센터',
  'lore.note_queue_discipline.body':
    '코팅된 안내판을 손으로 세 번 고쳤다. 한 가구당 한 사람. 그다음 한 사람당 두 품목. 그다음, 둘 위에 걸쳐 매직으로: 필요한 만큼 가져가시오. 신이여 도우소서. 나갈 때 문 잠그시오.',

  'lore.note_chalkboard.title': '칠판',
  'lore.note_chalkboard.source': '학교, 강당',
  'lore.note_chalkboard.body':
    '열하루 동안 매일 갱신한 점호표. 이름은 두 색으로 지워졌다. 검정은 가족이 데려감, 빨강은 그 다른 쪽. 아흐레째부터 누군가 빨강을 쓰지 않고 그냥 비워 두기 시작했다.',

  'lore.note_evacuation_list.title': '대피 명단',
  'lore.note_evacuation_list.source': '학교, 교장실',
  'lore.note_evacuation_list.body':
    '네 개 구역의 집결지, 버스 번호와 출발 시각까지 적혀 있다. 시각은 전부 같은 날이다. 도착했다고 기록된 버스는 없다. 여백에: “차고지에 전화했다. 구청에 전화했다. 긴급번호에 전화했다. 신호음만 간다.”',

  'lore.note_water_log.title': '설비 운전 일지',
  'lore.note_water_log.source': '정수장, 통제실',
  'lore.note_water_log.body':
    '0412 — 북부 계통 수전 상실. 예비 발전으로 전환.\n0630 — 남부 계통 상실. 규정에 따라 부하 차단.\n1140 — 예비 연료 40%. 지역 통제소와 연락 두절.\n2일차 0900 — 연료 고갈. 염소 소독 중단. 무엇이라도 흐르게 하려고 수문을 열었다. 이걸 읽는 사람에게: 전부 끓여 마실 것.',

  'lore.note_last_briefing.title': '마지막 근무 지시',
  'lore.note_last_briefing.source': '경찰서, 집합실',
  'lore.note_last_briefing.body':
    '순찰 지시 사항: 무전망 없음, 전령을 쓸 것. 신병 인계 없음, 인계할 곳이 없음. 단독 출동 금지. 무슨 일이 벌어졌느냐고 묻거든, 우리도 모른다는 것이 정직한 답이고 추측하는 것보다 그 편이 낫다. 서로를 챙길 것. — 아이버스 경사',

  'lore.note_detention_log.title': '유치 기록',
  'lore.note_detention_log.source': '경찰서, 유치장',
  'lore.note_detention_log.body':
    '피유치자 셋, 모두 2일차에 “상황을 고려하여” 불기소 석방. 네 번째 항목에는 이름도, 죄명도, 석방 시각도 없다. “유치 사유”란에는 이렇게 적혀 있다: 차단선 안쪽에서 바깥을 향해 걷다 발견됨. “처리”란에는: 인계, 메리디언.',

  'lore.note_tunnel_graffiti.title': '터널 낙서',
  'lore.note_tunnel_graffiti.source': '지하철, 운행 터널',
  'lore.note_tunnel_graffiti.body':
    '2킬로미터에 걸쳐 일정 간격으로 스프레이로 적혀 있다. 하나씩 승강장에서 멀어진다. 전기는 돌아온다. 전기는 돌아온다. 전기는 돌아오지 않는다. 애초에 전기가 문제가 아니었다.',

  'lore.note_last_train.title': '운행 안내',
  'lore.note_last_train.source': '지하철, 승강장 표시기',
  'lore.note_last_train.body':
    '전광판이 흐르다 멈췄다: 운행 중단 — 다른 교통편을 이용하십 — 운행 중. 판은 죽어 있다. 몇 주째 죽어 있다. 뒤편 함에 배터리가 있고, 그 배터리는 다 됐고, 누군가 적어도 한 번은 갈아 끼웠다.',

  'lore.note_triage_sheet.title': '분류 기록지',
  'lore.note_triage_sheet.source': '진료소, 접수처',
  'lore.note_triage_sheet.body':
    '4일차 주요 호소 증상: 두통(31), 이명(28), “어떤 음이 들림”(24), 방향감각 상실(19), 코피(9). 비고란에: 발열 사례 없음. 염증 지표 없음. 진찰 소견 없음. 아픈 것이 아니다. 전부 같은 소리를 묘사하고 있다.',

  'lore.note_it_was_not_a_disease.title': '선별 소견',
  'lore.note_it_was_not_a_disease.source': '검역소, 기록 상자',
  'lore.note_it_was_not_a_disease.body':
    '우리는 한 번도 분리해 낸 적 없는 병원체를, 다른 것을 위해 쓰인 규약으로, 엿새째 응답이 없는 기관의 지시에 따라 선별하고 있다. 여기를 지나간 사람 중 전염성이 있던 사람은 없었다. 나는 이것이 누군가에 의해 어딘가에 기록되기를 바란다. 언젠가 누군가 묻는다면.',

  'lore.note_screening_protocol.title': '선별 규약 4-B',
  'lore.note_screening_protocol.source': '검역소, 클립보드',
  'lore.note_screening_protocol.body':
    '선별 기준 4차 개정. 1. 청각 호소. 2. 방향감각 상실, 특히 방위 041 방향. 3. 두 항목을 모두 보이는 대상은 기록 후 이첩할 것. 구금하지 말 것. 고지하지 말 것. 이첩 연락처: 메리디언 연락관, 본 주파수, 시간 무관.',

  'lore.note_seventh_day.title': '병동 일지, 7일차',
  'lore.note_seventh_day.source': '종합병원, 간호사실',
  'lore.note_seventh_day.body':
    '0340 발전기 정지. 실온 하강 중. 병동 환자 22명, 전원 안정, 처치 필요 없음. 0500에 스물둘 전부가 일어나 앉아 있었다. 아무도 깨우지 않았다. 모두 같은 방향을 보고 있었다. 무엇을 듣고 있느냐고 물었더니, 전원이 이렇게 답했다. “당신도 들리잖아요.”',

  'lore.note_ward_nine.title': '9병동',
  'lore.note_ward_nine.source': '종합병원, 9병동',
  'lore.note_ward_nine.body':
    '침대는 정리되어 있고 차트는 정리되어 있고 환자는 전부 사라졌다. 방화문은 복도 쪽에서 사슬로 묶여 있었다. 사슬은 온전했다. 9병동에는 다른 출구가 없다.',

  'lore.note_cordon_orders.title': '차단선 상시 명령',
  'lore.note_cordon_orders.source': '군 검문소, 초소',
  'lore.note_cordon_orders.body':
    '즉시 시행: 본 차단선은 안쪽을 향한다. 통제구역으로 들어오려는 민간인은 정중히 돌려보낼 것. 나가려는 민간인은 메리디언 판정 시까지 억류할 것. 본 명령은 민간인, 지방정부, 그리고 귀관의 가족과 논의하지 말 것.',

  'lore.note_they_were_not_keeping_people_out.title': '어느 하사의 수첩',
  'lore.note_they_were_not_keeping_people_out.source': '군 검문소, 차량',
  'lore.note_they_were_not_keeping_people_out.body':
    '사흘째인데 우리가 무엇을 가두고 있는지 아무도 말해 주지 않는다. 구름도 없다. 부상자 행렬도 없다. 가이거는 자연 방사선만 읽는다. 우리는 전기도 물도 없는 도시에서 서쪽으로 걸어 나가려는 사람들을 막고 있고, 그것을 보건 조치라고 부르고 있으며, 나는 기록을 남기기 시작했다.',

  'lore.note_meridian_charter.title': '계획 헌장(발췌)',
  'lore.note_meridian_charter.source': '데이터 센터, 콘솔',
  'lore.note_meridian_charter.body':
    '메리디언은 지역 간격으로 배치된 41개 경화 노드로 구성된 정부 연속성 역량이며, 각 노드는 9년 이상의 자립 운용이 가능하도록 비축한다. 발동 권한은 상임위원회에 있다. 노드는 지방정부에 공개하지 않는다. 노드 인원은 선발하며, 자원으로 채우지 않는다.',

  'lore.note_node_four.title': '4번 노드 상태',
  'lore.note_node_four.source': '데이터 센터, 콘솔',
  'lore.note_node_four.body':
    '노드 04 — 인원 배치 — 봉인 — 정상.\n노드 07 — 인원 배치 — 봉인 — 정상.\n노드 12 — 인원 없음 — 개방 — 환경 제어 가동 중.\n당신들의 방폭문 명판에는 12가 찍혀 있다.',

  'lore.note_the_second_door.title': '두 번째 문',
  'lore.note_the_second_door.source': '메리디언 출입 해치',
  'lore.note_the_second_door.body':
    '당신들의 방폭문과 같은 제조사 명판. 같은 도장 코드. 같은 설치 연도. 시설 번호만 한 자리 다르고, 그 뒤의 공기는 따뜻하다. 저 아래에서 무언가가 아직 설비를 돌리고 있다는 뜻이다.',

  'lore.note_continuity_of_government.title': '선발 기준',
  'lore.note_continuity_of_government.source': '메리디언 출입 해치, 서류 가방',
  'lore.note_continuity_of_government.body':
    '노드 인원은 연속성 지수에 따라 선발한다: 기술적 역량, 생식 가능성, 그리고 3등급 청각 반응의 부재. 3등급을 보이는 자는 예외 없이, 그리고 설명 없이 모든 노드 인원에서 제외한다.',

  'lore.note_past_the_blockage.title': '막힌 구간 너머',
  'lore.note_past_the_blockage.source': '무너진 터널',
  'lore.note_past_the_blockage.body':
    '붕괴가 아니다. 잔해는 입도가 고르고, 단면은 직각으로 잘렸고, 천공 자국이 있다. 누군가 반대편에서 의도적으로 이 터널을 무너뜨렸고, 그것도 아주 능숙하게 했다.',

  'lore.note_carrier_tone.title': '반송파',
  'lore.note_carrier_tone.source': '송신탑, 일지',
  'lore.note_carrier_tone.body':
    '할당된 적 없는 대역에서, 우리 것이 아닌 송신기로부터, 설명할 수 없는 출력으로 아홉 시간의 무변조 반송파. 1811에 멈췄다. 그때쯤엔 건물 안의 모든 수신기가 그 주파수에 맞춰져 있었다. 맞춘 기억이 있는 사람은 없다.',

  'lore.note_the_tone.title': '루프',
  'lore.note_the_tone.source': '미상 신호 발신원',
  'lore.note_the_tone.body':
    '9초간의 음. 그다음 여자가 다섯 자리 숫자 묶음을 서두르지 않고 읽는다. 그다음 같은 묶음을 다른 목소리로 다시 읽는데, 그 두 번째 목소리도 같은 여자다. 다른 날 녹음된 것이다. 루프는 41분이다. 같은 묶음이 반복된 적은 한 번도 없다.',

  'lore.note_they_know_your_frequency.title': '응답',
  'lore.note_they_know_your_frequency.source': '미상 신호 발신원',
  'lore.note_they_know_your_frequency.body':
    '무작위로 고른 주파수로 90초간 송신했다. 11분 뒤 루프가 바뀌었다. 새 묶음을 표준 코드북으로 풀면 당신들의 방위, 거리, 그리고 방폭문에 찍힌 번호가 나온다.',

  'lore.note_it_is_answering.title': '그것은 답한다',
  'lore.note_it_is_answering.source': '송신탑, 용접된 관리동',
  'lore.note_it_is_answering.body':
    '안쪽에서 용접해 잠근 문 안면에 적혀 있다: 나는 그것에게 질문을 했고 그것은 답했다. 더 나은 질문을 했고 그것도 답했다. 세 번째 질문은 하지 마라.',

  'lore.note_the_relay.title': '중계',
  'lore.note_the_relay.source': '배터리를 갈고 있던 여자',
  'lore.note_the_relay.body':
    '“나는 송신하는 게 아니에요.” 그가 말했다. “중계하는 겁니다. 그 둘은 다르고, 그 차이가 중요해요. 누군가 계속 흘려보내지 않으면 멈추고, 멈추면 다른 통로를 찾기 시작하는데, 그 다른 통로가 사람이거든요.”',

  'lore.note_bearing_041.title': '방위 041',
  'lore.note_bearing_041.source': '방향 탐지 기록',
  'lore.note_bearing_041.body':
    '세 주에 걸쳐 네 지점에서 잡은 네 개의 방위. 한 점에서 만나지 않는다. 두 개씩 짝지으면 매번 다른 곳에서 만나고, 그 네 점은 지름 40킬로미터의 원을 그리며, 그 원의 중심은 이 도시다.',

  'lore.note_the_settlement.title': '애시필드의 성벽',
  'lore.note_the_settlement.source': '클립보드를 든 모집책',
  'lore.note_the_settlement.body':
    '“사람 400명, 수돗물, 그리고 성벽. 네, 성벽이요. 아뇨, 약탈자 때문이 아닙니다 — 약탈자는 열한 번 왔고 몽유병자는 구백 번 왔어요. 그들은 서쪽으로 걷습니다. 울타리 앞에서 멈추지 않고 고함에도 멈추지 않아요. 벽은 그들이 우리를 통과하는 대신 돌아가게 하려고 있는 겁니다.”',

  'lore.note_the_walkers.title': '그들은 서쪽으로 걷는다',
  'lore.note_the_walkers.source': '현장 관찰',
  'lore.note_the_walkers.body':
    '공격적이지 않다. 빠르지도 않다. 말에도, 가로막는 것에도, 부상에도 반응하지 않고, 밀어내면 다시 방향을 잡는다. 물을 주면 마신다. 음식을 주면 먹는다. 그러고는 계속 걷는다. 전부 같은 방향으로.',

  'lore.note_the_quiet_itself.title': '우리가 부르는 이름',
  'lore.note_the_quiet_itself.source': '볼트 메리디언, 첫 주',
  'lore.note_the_quiet_itself.body':
    '누군가 2일차에 칠판에 “고요”라고 적었고 그대로 굳었다. 사람들이 무엇을 먼저 알아차렸는지 말해 주는 이름이다. 어둠이 아니다. 추위도 아니다. 그 일이 벌어진 저녁, 아홉 시간 동안 어디에서도 그 음 말고는 아무것도 들리지 않았다는 사실이다.',

  'lore.note_vault_manifest.title': '시설 목록',
  'lore.note_vault_manifest.source': '볼트 메리디언, 비품실',
  'lore.note_vault_manifest.body':
    '12번 시설 — 비축 기준: 40명, 9년. 실사 시 실제 재고: 6일치. 누군가 준공과 고요 사이에 이곳을 체계적으로 비웠고, 그것이 어디로 갔는지는 어떤 기록도 남기지 않았다.',

  'lore.note_the_engineer.title': '남았던 기술자',
  'lore.note_the_engineer.source': '볼트 메리디언, 기계실',
  'lore.note_the_engineer.body':
    '원자로 외함에 손으로 적혀 있다: “잔편은 돌려 두고 침출수 밸브는 조금 열어 뒀다. 여기 오는 사람은 둘 다 필요할 거다. 문 배정표는 믿지 마라 — 12번은 애초에 사람을 넣을 곳이 아니었고, 배정표도 그걸 안다. 행운을 빈다. — B.O., 시설과.”',

  'lore.note_the_third_question.title': '세 번째 질문',
  'lore.note_the_third_question.source': '지향성 안테나, 최초 접촉',
  'lore.note_the_third_question.body':
    '첫 번째 질문은 어디냐였다. 그것은 방위로 답했다. 두 번째는 누구냐였고, 그것은 이름의 목록으로 답했는데, 그 이름이 전부 이 방 안에 있는 사람들이었다. 세 번째 질문은 왜냐이고, 송신탑의 문이 안쪽에서 용접된 데에는 이유가 있다.',

  'lore.note_nine_years.title': '9년',
  'lore.note_nine_years.source': '심층 기록고',
  'lore.note_nine_years.body':
    '비축 기준이 9년인 이유는 모형이 지표가 7년이면 다시 거주 가능해진다고 말했기 때문이다. 그 모형은 낙진이나 기상이나 전염병에 관한 것이 아니었다. 모형 4절의 제목은 감쇠이고, 세로축에는 “아직 반응하는 비율”이라고 적혀 있다.',

  'lore.note_the_committee.title': '상임위원회 회의록',
  'lore.note_the_committee.source': '심층 기록고',
  'lore.note_the_committee.body':
    '4항. 위원회는 본 현상이 공격이 아니며 식별 가능한 기원·방향·의도를 갖지 않고, “신호”라는 용어는 편의상의 표현임을 확인하였다. 5항. 위원회는 대외 발표를 기반 시설 붕괴로 계속 기술하기로 합의하였다. 6항. 위원회는 메리디언을 발동하였다.',

  'lore.note_facility_twelve.title': '12번 시설',
  'lore.note_facility_twelve.source': '심층 기록고',
  'lore.note_facility_twelve.body':
    '12번은 발동 전에 폐지되었고 배정 인원은 재배정되었다. 사유: 음향 조사 결과 이곳 암반이 현상을 90퍼센트 이상 감쇠시킴. 12번이 버려진 것은 쓸모가 없어서가 아니다. 작동했기 때문에 비워진 것이고, 위원회는 작동하는 장소가 자신들이 선발하지 않은 사람들의 손에 있는 것을 원하지 않았다.',

  'lore.note_what_it_wants.title': '감쇠',
  'lore.note_what_it_wants.source': '지향성 안테나, 최종 분석',
  'lore.note_what_it_wants.body':
    '그것은 우리에게 말을 거는 것이 아니다. 재고 있다. 우리가 보내는 응답 하나하나가 추정치를 좁힌다. 서쪽으로 걷는 사람들은 불려 가는 것이 아니다 — 한 명씩 읽히고 있는 것이고, 충분히 읽고 나면 그것은 더 이상 질문할 필요가 없어진다.',

  'lore.note_the_choice.title': '남은 결정',
  'lore.note_the_choice.source': '볼트 메리디언',
  'lore.note_the_choice.body':
    '문이 셋이다. 하나는 서쪽, 물어 오는 것에게로 이어진다. 하나는 아래, 누구를 남길 가치가 있는지 정한 사람들이 지은 시설로 이어진다. 하나는 아무 데로도 이어지지 않는다. 남아서, 재배등 아래 식량을 기르고, 기록고가 잔여 인구라 부르는 것이 된다. 이 방의 누구도 선택할 자격이 없고, 이 방의 누군가는 선택하게 될 것이다.',

  'lore.note_convoy_plan.title': '수송대 계획',
  'lore.note_convoy_plan.source': '볼트 메리디언, 작업장 벽',
  'lore.note_convoy_plan.body':
    '차량 둘, 60리터, 그리고 차단선과 터널과 지도 위의 모든 방위선을 피해 옛 화물 도로를 따라 북동쪽으로 가는 경로. 배가 아직 있을지 없을지 모를 해안까지 900킬로미터. 좋은 계획은 아니다. 계획이기는 하다.',

  'lore.note_deep_root.title': '9세대',
  'lore.note_deep_root.source': '수경 재배실, 트레이 일지',
  'lore.note_deep_root.body':
    '9세대는 재배등 스펙트럼만으로 91퍼센트가 발아했다. 트레이 넷과 원자로 잔편만으로 열네 사람을 무기한 먹일 수 있다. 다른 무엇이 사실이든, 우리는 더 이상 식량이 떨어질 날을 세지 않는다. 그냥 날을 셀 뿐이다.',

  'lore.note_first_night.title': '첫날 밤',
  'lore.note_first_night.source': '볼트 메리디언',
  'lore.note_first_night.body':
    '네 사람, 원자로 잔편 하나, 엿새치 식량, 그리고 잠기는 문. 아무도 자지 못했다. 누군가 비품실을 찾아내 목록을 소리 내어 읽었다. 40명, 9년. 그러고 나서 다들 조금 지나치게 오래 웃었다.',
};
