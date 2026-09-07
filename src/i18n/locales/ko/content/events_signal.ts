import type { ContentBundle } from '../../../types';

/**
 * 사건: 무전과 의료.
 *
 * 무전 쪽은 서사의 중심 줄기라 숫자·방위·호출부호를 원문 그대로 옮긴다.
 * 의료 쪽은 결정이 사람 목숨과 직결되므로 완곡하게 뭉개지 않고 원문의 직설을 지킨다.
 */
export const KO_EVENTS_SIGNAL: ContentBundle = {
  /* ============================================================== 무전 */
  'events.rad.first_voice.title': '112.4의 목소리',
  'events.rad.first_voice.body':
    '여자가 다섯 자리 숫자 묶음을 서두르지 않고 읽는 20초, 그다음 음 하나, 그리고 처음부터 다시 시작한다.',
  'events.rad.first_voice.choices.record.label': '루프 전체를 녹음한다',
  'events.rad.first_voice.choices.record.resultText':
    '41분, 반복되는 묶음은 하나도 없다. 통신사가 두 번 되돌려 듣더니 밖으로 걸으러 나간다.',
  'events.rad.first_voice.choices.answer.label': '응답한다',
  'events.rad.first_voice.choices.answer.hint': '이것이 무엇을 하는지 아무도 모른다.',
  'events.rad.first_voice.choices.answer.resultText':
    '무작위 주파수로 나가는 당신의 목소리 90초. 루프는 바뀌지 않는다. 오늘 밤에는.',
  'events.rad.first_voice.choices.shut_it_off.label': '수신기를 끈다',
  'events.rad.first_voice.choices.shut_it_off.resultText':
    '껐고, 방은 조용하고, 다들 일주일 만에 가장 잘 잔다.',

  'events.rad.grey_harbour.title': '그레이 하버가 부른다',
  'events.rad.grey_harbour.body':
    '남자 목소리, 또렷하게 호출부호와 북쪽 40킬로미터의 위치를 말한다. 전기가 있고 생존자를 세고 있다고 한다.',
  'events.rad.grey_harbour.choices.respond.label': '인원수를 알려 준다',
  'events.rad.grey_harbour.choices.respond.hint': '거래가 열린다. 낯선 자에게 인원수를 알린다.',
  'events.rad.grey_harbour.choices.respond.resultText':
    '숫자 하나, 대략의 위치, 그리고 내일 같은 시각에 듣겠다는 약속.',
  'events.rad.grey_harbour.choices.listen_only.label': '송신하지 않고 듣기만 한다',
  'events.rad.grey_harbour.choices.listen_only.resultText':
    '사흘 밤의 교신에서 건물 이름 넷과 피해야 할 도로 둘을 얻는다.',
  'events.rad.grey_harbour.choices.warn_off.label': '평문 송신을 그만두라고 말한다',
  'events.rad.grey_harbour.choices.warn_off.hint': '교섭 판정. 반기지 않을 수도 있다.',
  'events.rad.grey_harbour.choices.warn_off.successText':
    '긴 침묵, 그러다 “알겠습니다. 고맙습니다.” 하루 안에 주파수와 시각을 바꾼다.',
  'events.rad.grey_harbour.choices.warn_off.failureText':
    '신원도 밝히지 않는 사람의 충고에 대해 어떻게 생각하는지 정확히 말해 준다.',

  'events.rad.the_numbers_change.title': '묶음이 바뀌었다',
  'events.rad.the_numbers_change.body':
    '루프는 길이도 목소리도 같은데 숫자 묶음이 다르고, 그중 하나가 풀린다.',
  'events.rad.the_numbers_change.choices.decode.label': '해독한다',
  'events.rad.the_numbers_change.choices.decode.successText':
    '방위, 거리, 그리고 당신들 방폭문에 찍힌 번호. 저쪽도 듣고 있었다.',
  'events.rad.the_numbers_change.choices.decode.failureText':
    '일부만. 한 묶음이 방위로 풀리는데, 그 방위가 대략 여기다.',
  'events.rad.the_numbers_change.choices.jam.label': '방해 전파를 쏜다',
  'events.rad.the_numbers_change.choices.jam.resultText':
    '여섯 시간 동안 대역 전체에 광대역 잡음. 동틀 무렵 루프가 그대로 재개된다.',
  'events.rad.the_numbers_change.choices.stop_listening.label': '무전실을 그 루프에서 완전히 뗀다',
  'events.rad.the_numbers_change.choices.stop_listening.resultText':
    '다이얼 위에 붙인 쪽지: 이 주파수 금지. 일주일쯤 지켜진다.',

  'events.rad.distress.title': '구조 요청',
  'events.rad.distress.body':
    '어린 목소리, 호출부호도 규약도 없다. 주소 하나, 부러진 다리에 대한 설명, 그리고 제발 누가 와 달라는 부탁.',
  'events.rad.distress.choices.go.label': '팀을 보낸다',
  'events.rad.distress.choices.go.hint': '하루와 보급을 쓴다. 사람을 얻을 수도 있다.',
  'events.rad.distress.choices.go.successText':
    '부목을 대고 업어서 어두워지기 전에 도착한다. 열아홉 살이고 요리를 할 줄 안다.',
  'events.rad.distress.choices.go.failureText':
    '주소는 맞다. 이틀 늦었고, 그것이 정확히 며칠인지 모두가 안다.',
  'events.rad.distress.choices.talk_them_through.label': '무전으로 처치를 안내한다',
  'events.rad.distress.choices.talk_them_through.successText':
    '두 시간의 지시와 상당한 격려. 스스로 부목을 댄다.',
  'events.rad.distress.choices.talk_them_through.failureText':
    '송신이 문장 중간에 끊긴다. 다시 이어지지 않는다.',
  'events.rad.distress.choices.ignore.label': '수신기를 끈다',
  'events.rad.distress.choices.ignore.resultText':
    '수신기가 꺼진다. 방 안의 모두가 그것을 들었고, 누가 껐는지도 봤다.',

  'events.rad.the_official_broadcast.title': '공식적인 목소리',
  'events.rad.the_official_broadcast.body':
    '고요 이후 처음으로 국가 주파수에서, 최대 출력으로, 침착하고 격식 있는 녹음 방송이 집결지를 열거한다.',
  'events.rad.the_official_broadcast.choices.log_muster.label': '집결지를 전부 받아 적는다',
  'events.rad.the_official_broadcast.choices.log_muster.resultText':
    '네 곳, 전부 이 구역 안, 전부 누군가 가 봤고 비어 있다고 보고한 곳이다.',
  'events.rad.the_official_broadcast.choices.analyse.label': '녹음 자체를 분석한다',
  'events.rad.the_official_broadcast.choices.analyse.successText':
    '녹음은 9주 전 것이고 타이머로 돌고 있다. 반대편에는 아무도 없고, 오래전부터 없었다.',
  'events.rad.the_official_broadcast.choices.analyse.failureText':
    '반복 재생되는 녹음. 그 이상은 증명할 수 있는 것이 없다.',
  'events.rad.the_official_broadcast.choices.believe.label': '구조가 온다고 모두에게 말한다',
  'events.rad.the_official_broadcast.choices.believe.resultText':
    '한 시간 안에 볼트의 분위기가 바뀐다. 외상으로 무언가를 산 것이다.',

  'events.rad.weather_net.title': '기상 교신망',
  'events.rad.weather_net.body':
    '서로 아는 사이로 보이지 않는 통신사 셋이 매일 저녁 같은 시각에 기압 값을 주고받는다.',
  'events.rad.weather_net.choices.join.label': '망에 합류한다',
  'events.rad.weather_net.choices.join.resultText':
    '1900 시간대와 우리만의 호출부호. 내일 날씨가 더는 놀랄 일이 아니게 된다.',
  'events.rad.weather_net.choices.listen.label': '합류하지 않고 값만 기록한다',
  'events.rad.weather_net.choices.listen.resultText':
    '공책에 3주치 기록. 거의 같은 값어치를 하고 아무것도 내주지 않는다.',
  'events.rad.weather_net.choices.trade_offer.label': '지도와 바꿀 것을 제안한다',
  'events.rad.weather_net.choices.trade_offer.resultText':
    '교회 뒤 쓰레기통에 둔 항생제 두 회분과, 여백에 적힌 시가지 도면 여섯 쪽.',

  'events.rad.silence_on_the_band.title': '대역이 비었다',
  'events.rad.silence_on_the_band.body':
    '그레이 하버가 나흘째 송신하지 않는다. 기상 교신망도, 다른 누구도.',
  'events.rad.silence_on_the_band.choices.call_out.label': '침묵을 깨고 모든 주파수에 부른다',
  'events.rad.silence_on_the_band.choices.call_out.resultText':
    '여섯 시간의 호출. 아무도 답하지 않는다. 112.4의 루프가 9초 길어진 것만 빼면.',
  'events.rad.silence_on_the_band.choices.wait.label': '감시를 유지하고 기다린다',
  'events.rad.silence_on_the_band.choices.wait.resultText':
    '나흘 더 빈 대역. 닷새째에 하나가 돌아오고, 설명은 하지 않는다.',
  'events.rad.silence_on_the_band.choices.go_look.label': '가장 가까운 곳으로 탐사를 계획한다',
  'events.rad.silence_on_the_band.choices.go_look.resultText':
    '방위 둘, 거리 하나, 그리고 구역도에 연필로 그린 경로.',

  'events.rad.the_walkers.title': '걷는 사람들에 대한 보고',
  'events.rad.the_walkers.body':
    '그레이 하버가 화물 도로를 따라 서쪽으로 움직이는 예순쯤 되는 행렬을 전한다. 수송대가 아니다. 조직된 것도 아니다. 그냥 걷는다.',
  'events.rad.the_walkers.choices.ask.label': '자세히 묻는다',
  'events.rad.the_walkers.choices.ask.resultText':
    '말에 반응하지 않는다. 밀어내면 방향을 다시 잡는다. 전부 같은 방향으로 걷는다.',
  'events.rad.the_walkers.choices.warn.label': '망 전체에 경고한다',
  'events.rad.the_walkers.choices.warn.resultText':
    '한 시간 안에 다른 국 셋이 당신의 송신을 중계한다. 이 무전기가 한 일 중 가장 쓸모 있는 일이다.',
  'events.rad.the_walkers.choices.plot_bearing.label': '그들이 걷는 방향을 작도한다',
  'events.rad.the_walkers.choices.plot_bearing.successText':
    '방위 041을 따라 걷고 있다. 신호도 방위 041에 있다. 우연이 아니다.',
  'events.rad.the_walkers.choices.plot_bearing.failureText':
    '대체로 서쪽. 쓸 만큼 정확하지는 않다.',

  'events.rad.the_archive_fragment.title': '기록고가 무언가를 내준다',
  'events.rad.the_archive_fragment.body':
    '손상된 색인을 사흘 읽은 끝에 디렉터리 하나가 마침내 열린다.',
  'events.rad.the_archive_fragment.choices.read_it.label': '읽는다',
  'events.rad.the_archive_fragment.choices.read_it.resultText':
    '지역 간격으로 배치된 경화 노드 41개. 각각 9년치 비축. 인원은 선발하며 자원으로 채우지 않는다.',
  'events.rad.the_archive_fragment.choices.read_aloud.label': '모두에게 읽어 준다',
  'events.rad.the_archive_fragment.choices.read_aloud.resultText':
    '취사장에서 소리 내어 읽는다. 아무도 끼어들지 않는다. 누군가 우리 문에 적힌 번호가 몇이냐고 묻고, 당신은 알려 준다.',
  'events.rad.the_archive_fragment.choices.cross_reference.label': '먼저 나머지 전부와 대조한다',
  'events.rad.the_archive_fragment.choices.cross_reference.resultText':
    '노드 4: 인원 배치, 봉인, 정상. 노드 12: 인원 없음, 개방, 환경 제어 가동 중. 당신들 문에는 12라고 적혀 있다.',

  'events.rad.tower_bearing.title': '두 개의 방위',
  'events.rad.tower_bearing.body':
    '계단 입구에서 전계 측정기가 방위 하나를 준다. 4킬로미터 떨어진 곳에서 잡은 두 번째 방위가 교점을 만든다.',
  'events.rad.tower_bearing.choices.triangulate.label': '확실히 하려고 세 번째 방위를 잡는다',
  'events.rad.tower_bearing.choices.triangulate.successText':
    '세 방위는 한 점에서 만나지 않는다. 원을 그리고, 그 안에 도시가 있다.',
  'events.rad.tower_bearing.choices.triangulate.failureText':
    '세 번째 방위가 앞의 둘과 11도씩 어긋난다.',
  'events.rad.tower_bearing.choices.go_now.label': '지금 교점으로 팀을 보낸다',
  'events.rad.tower_bearing.choices.go_now.resultText':
    '구역 반대편 지도에 핀 하나, 그리고 선뜻 나서는 사람은 없다.',
  'events.rad.tower_bearing.choices.stop.label': '이 작업을 중단한다',
  'events.rad.tower_bearing.choices.stop.resultText':
    '측정기가 서랍으로 들어간다. 두 주 사이 당신이 내린 가장 인기 있는 결정이다.',

  'events.rad.someone_using_your_callsign.title': '누가 당신들 호출부호를 쓴다',
  'events.rad.someone_using_your_callsign.body':
    '교신망에서, 당신들 시간대에, 당신들 호출부호로, 여기 누구의 것도 아닌 목소리가 다른 국들에게 위치를 묻고 있다.',
  'events.rad.someone_using_your_callsign.choices.correct.label': '끼어들어 바로잡는다',
  'events.rad.someone_using_your_callsign.choices.correct.successText':
    '진짜 국만 알 수 있는 세 가지를 말한다. 망이 당신을 믿고 사칭자는 조용해진다.',
  'events.rad.someone_using_your_callsign.choices.correct.failureText':
    '두 국은 믿는다. 하나는 믿지 않고, 그 하나는 이제 당신을 사칭자로 여긴다.',
  'events.rad.someone_using_your_callsign.choices.change.label': '호출부호를 버리고 잠적한다',
  'events.rad.someone_using_your_callsign.choices.change.resultText':
    '새 호출부호, 새 시각, 새 주파수, 그리고 이미 쌓았던 신뢰를 다시 쌓는 두 주.',
  'events.rad.someone_using_your_callsign.choices.bait.label': '가짜 위치를 흘린다',
  'events.rad.someone_using_your_callsign.choices.bait.resultText':
    '동쪽 3킬로미터의 창고를 정성껏 묘사해 준다. 이제 누가 가는지 지켜보면 된다.',

  'events.rad.the_child_station.title': '전파를 타는 아이',
  'events.rad.the_child_station.body':
    '매일 저녁 같은 시각에 11분 동안 아이가 책을 소리 내어 읽는다. 그 송신기에서는 다른 교신이 한 번도 없다.',
  'events.rad.the_child_station.choices.listen_nightly.label': '저녁 일과로 삼는다',
  'events.rad.the_child_station.choices.listen_nightly.resultText':
    '일곱 시 십 분이면 취사장이 조용해진다. 그러지 말자고 한 사람은 한 번도 없다.',
  'events.rad.the_child_station.choices.reply.label': '답한다',
  'events.rad.the_child_station.choices.reply.resultText':
    '송신 뒤의 긴 침묵, 그러다 훨씬 작은 소리로. “거기 누구 있어요?”',
  'events.rad.the_child_station.choices.find_them.label': '송신기의 방위를 잡는다',
  'events.rad.the_child_station.choices.find_them.resultText':
    '주택가 거리 하나, 2킬로미터, 그리고 구역도에 연필로 적은 표시.',

  /* ============================================================== 의료 */
  'events.med.the_fever.title': '침상의 열',
  'events.med.the_fever.body':
    '동틀 무렵 한 명, 오후에는 둘. 이만한 공간에서 그것은 우연이 아니다.',
  'events.med.the_fever.choices.isolate.label': '즉시 격리한다',
  'events.med.the_fever.choices.isolate.resultText':
    '창고 방이 병실이 된다. 춥고 지루하고, 확산을 막는다.',
  'events.med.the_fever.choices.treat_all.label': '전원에게 예방 투약한다',
  'events.med.the_fever.choices.treat_all.resultText':
    '비싸고 무차별적이고, 주말이면 열이 있는 사람이 없다.',
  'events.med.the_fever.choices.work_through.label': '다들 일한다 — 감기다',
  'events.med.the_fever.choices.work_through.resultText':
    '감기가 아니다. 사흘째면 전원이 걸렸고 되는 일이 없다.',

  'events.med.the_infection.title': '곪았다',
  'events.med.the_infection.body':
    '붉은 기가 드레싱 선을 넘었고 주변 피부가 팽팽하게 번들거린다.',
  'events.med.the_infection.choices.antibiotics.label': '항생제를 쓴다',
  'events.med.the_infection.choices.antibiotics.resultText':
    '48시간 만에 선이 물러난다. 그것을 위해 있던 물건이다.',
  'events.med.the_infection.choices.debride.label': '열어서 긁어낸다',
  'events.med.the_infection.choices.debride.successText':
    '20분, 마취라 부를 만한 것 없이, 끝났을 때는 깨끗하다.',
  'events.med.the_infection.choices.debride.failureText':
    '전보다 나빠졌고, 이제 더 빨리 번진다.',
  'events.med.the_infection.choices.wait_and_see.label': '드레싱하고 지켜본다',
  'events.med.the_infection.choices.wait_and_see.resultText':
    '아침에 나아지지 않았다. 의료진이 아무 말도 하지 않는데, 그것이 말이다.',

  'events.med.triage.title': '환자 둘, 약은 하나',
  'events.med.triage.body': '같은 밤에 둘이 같은 것을 필요로 하고, 그것은 하나뿐이다.',
  'events.med.triage.choices.worst_first.label': '더 나쁜 쪽을 치료한다',
  'events.med.triage.choices.worst_first.resultText':
    '교과서적인 답을, 손전등 아래 창고 방에서, 어차피 버티지 못할지도 모르는 사람에게.',
  'events.med.triage.choices.best_odds.label': '회복 가능성이 높은 쪽을 치료한다',
  'events.med.triage.choices.best_odds.resultText':
    '변호할 수 있다. 살릴 수 있다. 둘 다 듣는 앞에서 소리 내어 말해진다.',
  'events.med.triage.choices.split.label': '반씩 나눈다',
  'events.med.triage.choices.split.resultText':
    '어느 쪽도 충분하지 않다. 아침에 둘 다 아직 여기 있는데, 그것도 아무것도 아닌 건 아니다.',

  'events.med.the_amputation.title': '살릴 수 없다',
  'events.med.the_amputation.body':
    '의료진이 두 번 분명히 말한다. 아무도 처음에 들었다고 하고 싶지 않기 때문이다.',
  'events.med.the_amputation.choices.operate.label': '한다',
  'events.med.the_amputation.choices.operate.successText':
    '40분, 네 사람이 붙들고, 끝났을 때 살아 있고 예전 같지는 않을 것이다.',
  'events.med.the_amputation.choices.operate.failureText':
    '깨어나지 못한다. 의료진은 하루 동안 의무실을 나오지 않는다.',
  'events.med.the_amputation.choices.antibiotics_gamble.label': '가진 것 전부를 쓰고 기대한다',
  'events.med.the_amputation.choices.antibiotics_gamble.successText':
    '의료진의 예상과 정반대로 돌아선다. 팔다리를 지키고 다들 조용히 놀란다.',
  'events.med.the_amputation.choices.antibiotics_gamble.failureText':
    '돌아서지 않는다. 약장을 통째로 비웠고 아침이면 떠났다.',
  'events.med.the_amputation.choices.comfort.label': '편하게 해 준다',
  'events.med.the_amputation.choices.comfort.resultText':
    '통증을 무디게 할 수 있는 것 전부와, 내내 곁을 지키는 사람 하나. 밤이 거의 다 걸린다.',
  'events.med.the_amputation.choices.dry.label': '줄 것이 없다. 그래도 한다.',
  'events.med.the_amputation.choices.dry.hint': '약 없이. 붙들린 채, 깨어 있는 채로.',
  'events.med.the_amputation.choices.dry.successText':
    '된다. 네 사람이 붙들고 하나가 자른다. 그 소리가 볼트 전체를 지나가고, 들은 사람 누구에게서도 떠나지 않는다.',
  'events.med.the_amputation.choices.dry.failureText':
    '되지 않고, 되지 않는 데 오래 걸린다. 이틀 동안 식탁에서 아무도 말하지 않는다.',

  'events.med.dysentery.title': '물에 있다',
  'events.med.dysentery.body':
    '열두 시간에 세 명, 전부 같은 증상, 전부 심하다. 탱크 계기는 정상이라고 해 왔다.',
  'events.med.dysentery.choices.boil_everything.label': '전부 끓이고 탱크를 비운다',
  'events.med.dysentery.choices.boil_everything.resultText':
    '이틀 내내, 전원이 펌프에 붙었고, 탱크가 깨끗해져 돌아온다.',
  'events.med.dysentery.choices.treat_only.label': '환자만 치료하고 계속 마신다',
  'events.med.dysentery.choices.treat_only.resultText':
    '오늘은 싸다. 일주일 동안 이틀에 한 명씩 새 환자가 나온다.',
  'events.med.dysentery.choices.find_source.label': '원인을 제대로 찾는다',
  'events.med.dysentery.choices.find_source.successText':
    '침출수의 반대편에서 물을 끌어 오던 금 간 관. 막았고, 환자가 뚝 끊긴다.',
  'events.med.dysentery.choices.find_source.failureText':
    '이틀의 검사에 답이 없다. 그사이 두 사람이 더 앓는다.',

  'events.med.the_cabinet_is_empty.title': '약장이 비었다',
  'events.med.the_cabinet_is_empty.body':
    '모자란 게 아니라 비었다. 누군가 일주일째 일지에 차용증을 쓰고 있고, 일지의 쪽이 다 떨어졌다.',
  'events.med.the_cabinet_is_empty.choices.improvise.label': '남은 것으로 임시로 만든다',
  'events.med.the_cabinet_is_empty.choices.improvise.successText':
    '삶은 천, 증류한 술, 그리고 교역품에서 꺼낸 꿀. 아무것도 아닌 건 아니다.',
  'events.med.the_cabinet_is_empty.choices.improvise.failureText':
    '정말로 임시로 만들 만한 것조차 남지 않았다.',
  'events.med.the_cabinet_is_empty.choices.prioritise_clinic.label':
    '다음 탐사는 무슨 일이 있어도 진료소로 보낸다',
  'events.med.the_cabinet_is_empty.choices.prioritise_clinic.resultText':
    '진료소가 게시판 맨 위로 올라가고, 누군가 다녀올 때까지 거기 남는다.',
  'events.med.the_cabinet_is_empty.choices.trade_for_it.label': '교신망에 무엇이든 주겠다고 한다',
  'events.med.the_cabinet_is_empty.choices.trade_for_it.resultText':
    '값을 한참 더 치르고, 듣고 있던 모두가 당신들에게 무엇이 없는지 알게 된다.',

  'events.med.the_pregnancy.title': '변수',
  'events.med.the_pregnancy.body':
    '그가 의료진에게 먼저 말하고, 의료진이 당신에게 말한다. 자원에 관한 대화를 해야 하는데 둘 다 그 말을 꺼내는 사람이 되고 싶지 않기 때문이다.',
  'events.med.the_pregnancy.choices.support.label': '무엇이 들든 한다',
  'events.med.the_pregnancy.choices.support.resultText':
    '추가 배급, 가벼운 일, 그리고 두 시간이나 이어지는 이름 이야기.',
  'events.med.the_pregnancy.choices.plan.label': '지지하고, 제대로 계획을 세운다',
  'events.med.the_pregnancy.choices.plan.resultText':
    '수경 재배를 둘러싼 논쟁이 취향의 문제에서 일정의 문제로 바뀐다.',
  'events.med.the_pregnancy.choices.defer.label': '볼트가 아직 감당할 수 없다고 말한다',
  'events.med.the_pregnancy.choices.defer.resultText':
    '산수를 소리 내어 말한다. 아무도 산수에 이의를 달지 않는다. 아무도 당신을 쳐다보지도 않는다.',

  'events.med.overdue_rest.title': '잠을 자지 않았다',
  'events.med.overdue_rest.body':
    '본인 계산으로 나흘, 남들 계산으로는 그 이상. 오늘 아침에는 문틀에 부딪혔다.',
  'events.med.overdue_rest.choices.sedate.label': '재운다',
  'events.med.overdue_rest.choices.sedate.resultText':
    '열네 시간. 잃은 하루에 화를 내며 깨어나더니 도움이 됐다고 인정한다.',
  'events.med.overdue_rest.choices.stimulant.label': '각성제를 주고 하루를 쓴다',
  'events.med.overdue_rest.choices.stimulant.resultText':
    '아주 생산적인 하루, 그리고 그 끝의 아주 나쁜 밤.',
  'events.med.overdue_rest.choices.order_rest.label': '명단에서 빼고 물러서지 않는다',
  'events.med.overdue_rest.choices.order_rest.resultText':
    '10분을 다투더니 열한 시간을 잔다.',

  'events.med.the_medic_is_hurt.title': '의료진이 환자다',
  'events.med.the_medic_is_hurt.body':
    '무엇을 해야 하는지 아는 유일한 사람이 무엇을 해야 할지 모르는 채로 탁자에 누워, 누군가에게 말로 설명하려 하고 있다.',
  'events.med.the_medic_is_hurt.choices.follow_instructions.label': '말하는 대로 정확히 한다',
  'events.med.the_medic_is_hurt.choices.follow_instructions.successText':
    '엔진을 고치던 사람의 흔들리지 않는 손, 그리고 탁자에서 이어지는 해설.',
  'events.med.the_medic_is_hurt.choices.follow_instructions.failureText':
    '말로 될 일이 아니다. 나쁘게, 그리고 느리게 흘러간다.',
  'events.med.the_medic_is_hurt.choices.call_for_help.label': '모든 주파수로 도움을 청한다',
  'events.med.the_medic_is_hurt.choices.call_for_help.resultText':
    '두 구역 떨어진 누군가가 90분 동안 안내해 주고, 이름은 끝내 밝히지 않는다.',
  'events.med.the_medic_is_hurt.choices.wait_it_out.label': '드레싱하고 기대한다',
  'events.med.the_medic_is_hurt.choices.wait_it_out.resultText':
    '충분하지 않다. 사흘째면 처음보다 훨씬 큰 문제가 되어 있다.',
};
