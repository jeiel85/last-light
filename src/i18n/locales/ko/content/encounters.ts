import type { ContentBundle } from '../../../types';

/**
 * 탐사 조우.
 *
 * 원정 중 한 장면씩 제시되는 짧은 상황들. 본문은 현재형의 관찰 시점이고, 선택지 라벨은
 * 명령형 짧은 구, 힌트는 대가와 위험을 한 줄로 밝힌다. 결과문은 원문처럼 감정을 덧붙이지
 * 않고 벌어진 일만 적는다.
 */
export const KO_ENCOUNTERS: ContentBundle = {
  /* ============================================================== 이동 */
  'encounters.trv.open_ground.title': '열린 지형',
  'encounters.trv.open_ground.text':
    '볼트 계단과 시가지 사이에 500미터쯤 트인 땅이 있다. 불이 테라스를 넘으며 다 태워 버린 자리다. 어느 쪽으로도 몸을 숨길 것이 없다.',
  'encounters.trv.open_ground.choices.straight.label': '빠르게 가로지른다',
  'encounters.trv.open_ground.choices.straight.hint': '빠르다. 다만 누가 보고 있다면 보인다.',
  'encounters.trv.open_ground.choices.straight.outcome.text': '4분 만에 건넜고 아무도 부르지 않았다.',
  'encounters.trv.open_ground.choices.edge.label': '담장선을 따라간다',
  'encounters.trv.open_ground.choices.edge.hint': '느리고 지친다. 노출은 훨씬 적다.',
  'encounters.trv.open_ground.choices.edge.outcome.text':
    '방화벽을 따라 몸을 접고 이동해 아무에게도 들키지 않고 반대편에 닿는다.',
  'encounters.trv.open_ground.choices.scout.label': '한 명을 먼저 보내 지형을 본다',
  'encounters.trv.open_ground.choices.scout.hint': '탐색 4. 성공하면 접근로를 확보한다.',
  'encounters.trv.open_ground.choices.scout.lockedHint': '탐색 4 이상인 사람이 필요하다.',
  'encounters.trv.open_ground.choices.scout.onSuccess.text':
    '배수 암거를 지나는 경로와, 땅이 무른 구간을 적은 쪽지를 들고 돌아온다.',
  'encounters.trv.open_ground.choices.scout.onFailure.text':
    '어떤 지도에도 없는 울타리 앞에서 20분을 잃고, 잔뜩 심통이 나서 돌아온다.',

  'encounters.trv.rain_on_the_road.title': '길 위의 비',
  'encounters.trv.rain_on_the_road.text':
    '교차로에 닿기도 전에 시작해서 그치지 않는다. 한 시간 만에 전원이 젖고, 기온은 떨어진다.',
  'encounters.trv.rain_on_the_road.choices.push.label': '그대로 밀고 간다',
  'encounters.trv.rain_on_the_road.choices.push.hint': '저체온 위험.',
  'encounters.trv.rain_on_the_road.choices.push.outcome.text': '춥고 흠뻑 젖은 채, 일정보다 늦게 도착한다.',
  'encounters.trv.rain_on_the_road.choices.shelter.label': '잦아들 때까지 피한다',
  'encounters.trv.rain_on_the_road.choices.shelter.hint': '햇빛과 식량을 쓴다.',
  'encounters.trv.rain_on_the_road.choices.shelter.outcome.text':
    '하역장 차양 아래에서 버틴다. 두 시간을 잃었지만 전원이 말라 있다.',
  'encounters.trv.rain_on_the_road.choices.tarp.label': '방수포를 친다',
  'encounters.trv.rain_on_the_road.choices.tarp.hint': '방수포를 쓴다. 따뜻하게, 계속 움직인다.',
  'encounters.trv.rain_on_the_road.choices.tarp.lockedHint': '배낭에 방수포가 필요하다.',
  'encounters.trv.rain_on_the_road.choices.tarp.outcome.text':
    '기둥 넷, 벽 하나, 40분. 따뜻하게, 그리고 스스로도 놀랄 만큼 기분 좋게 다시 출발한다.',

  'encounters.trv.stripped_car.title': '뜯긴 차',
  'encounters.trv.stripped_car.text':
    '차도 한가운데 림만 남은 세단. 문도 트렁크도 열려 있다. 배터리는 이미 누가 가져갔다. 주유구 뚜껑은 아직 달려 있다.',
  'encounters.trv.stripped_car.choices.siphon.label': '연료를 빼낸다',
  'encounters.trv.stripped_car.choices.siphon.hint': '연료, 그리고 도로에 누워 보내는 20분.',
  'encounters.trv.stripped_car.choices.siphon.outcome.text':
    '서너 리터, 그리고 하루 종일 입에 남을 한 모금.',
  'encounters.trv.stripped_car.choices.strip.label': '남은 것을 뜯는다',
  'encounters.trv.stripped_car.choices.strip.hint': '부품. 더 느리다.',
  'encounters.trv.stripped_car.choices.strip.outcome.text':
    '발전기, 배선 다발, 그리고 사이드미러 두 짝. 언젠가 램프 하우징이 될 것이다.',
  'encounters.trv.stripped_car.choices.pass.label': '그냥 지나친다',
  'encounters.trv.stripped_car.choices.pass.hint': '아낀 시간은 아낀 피로다.',
  'encounters.trv.stripped_car.choices.pass.outcome.text': '지나쳐 간다. 이런 차는 또 있다.',

  'encounters.trv.the_dogs.title': '개들',
  'encounters.trv.the_dogs.text':
    '거리 끝에 네 마리가 지켜보고 있다. 목줄이 있다. 마르지 않았다.',
  'encounters.trv.the_dogs.choices.back_away.label': '천천히 물러난다',
  'encounters.trv.the_dogs.choices.back_away.outcome.text':
    '100미터쯤 따라오다 흥미를 잃는다. 한동안 아무도 입을 열지 않는다.',
  'encounters.trv.the_dogs.choices.fight.label': '버티고 서서 쫓아낸다',
  'encounters.trv.the_dogs.choices.fight.hint': '짧고 험한 싸움.',
  'encounters.trv.the_dogs.choices.fight.outcome.text': '90초 만에 끝난다.',
  'encounters.trv.the_dogs.choices.feed.label': '먹을 것을 던져 준다',
  'encounters.trv.the_dogs.choices.feed.hint': '식량 2 소모. 그들은 기억한다.',
  'encounters.trv.the_dogs.choices.feed.outcome.text':
    '받아 물고 길을 내준다. 돌아오는 길에 또 있었고, 또 길을 내준다.',

  'encounters.trv.checkpoint_remains.title': '버려진 차단선',
  'encounters.trv.checkpoint_remains.text':
    '콘크리트 블록과 올려진 차단봉. 표지판에는 아직 “이동 통제 — 신분증 제시”라고 적혀 있다. 그 아래 누군가 페인트로 적었다. 안쪽 같은 건 없다.',
  'encounters.trv.checkpoint_remains.choices.search.label': '초소를 뒤진다',
  'encounters.trv.checkpoint_remains.choices.search.outcome.text':
    '식량 상자 하나, 반쯤 남은 탄창, 그리고 나흘째 이후로는 이름이 비어 있는 근무표.',
  'encounters.trv.checkpoint_remains.choices.read.label': '명령판을 제대로 읽는다',
  'encounters.trv.checkpoint_remains.choices.read.hint': '시간이 든다. 무언가 설명해 줄지도.',
  'encounters.trv.checkpoint_remains.choices.read.onSuccess.text':
    '명령서 날짜는 고요 이후다. 감염 확산을 막는 내용이 아니다. 사람들이 나가지 못하게 하는 내용이다.',
  'encounters.trv.checkpoint_remains.choices.read.onFailure.text':
    '물에 젖어 뭉개졌다. “메리디언 일정”이라는 반 문장만 건지고 나머지는 없다.',
  'encounters.trv.checkpoint_remains.choices.move_on.label': '여기 오래 있지 않는다',
  'encounters.trv.checkpoint_remains.choices.move_on.outcome.text': '멀리 돌아서 지나간다.',

  'encounters.trv.ash_drift.title': '재 낙진',
  'encounters.trv.ash_drift.text':
    '바람이 방향을 바꾸며 계곡을 따라 내려온다. 고운 회색, 미지근하고, 탄 냄새가 나지 않는다.',
  'encounters.trv.ash_drift.choices.mask.label': '마스크를 쓰고 계속 걷는다',
  'encounters.trv.ash_drift.choices.mask.lockedHint': '배낭에 방독면이나 방호복이 필요하다.',
  'encounters.trv.ash_drift.choices.mask.outcome.text': '거르고 나면 불쾌한 정도에 그친다.',
  'encounters.trv.ash_drift.choices.cover.label': '천으로 얼굴을 가린다',
  'encounters.trv.ash_drift.choices.cover.outcome.text':
    '그래도 들어온다. 지나갈 즈음엔 전원이 기침하고 있다.',
  'encounters.trv.ash_drift.choices.wait_out.label': '실내로 들어가 기다린다',
  'encounters.trv.ash_drift.choices.wait_out.outcome.text':
    '문을 닫고 계단참에서 한 시간. 빛은 잃었고 폐는 잃지 않았다.',

  /* ============================================================== 접근 */
  'encounters.app.locked_shutter.title': '잠긴 셔터',
  'encounters.app.locked_shutter.text':
    '셔터가 내려가 안쪽에서 자물쇠로 잠겨 있다. 누군가 잠그고 다른 길로 나갔다는 뜻이다.',
  'encounters.app.locked_shutter.choices.pry.label': '지레로 뜯는다',
  'encounters.app.locked_shutter.choices.pry.hint': '시끄럽다. 빠르다.',
  'encounters.app.locked_shutter.choices.pry.lockedHint': '쇠지레, 소방 도끼, 볼트 커터 중 하나가 필요하다.',
  'encounters.app.locked_shutter.choices.pry.outcome.text':
    '3분간 쇠 비명이 울리고 안으로 들어간다. 두 블록 안의 모든 것이 들었다.',
  'encounters.app.locked_shutter.choices.pick.label': '자물쇠를 딴다',
  'encounters.app.locked_shutter.choices.pick.lockedHint': '해정 도구가 필요하다.',
  'encounters.app.locked_shutter.choices.pick.onSuccess.text':
    '1분도 안 되어 열린다. 셔터를 30센티쯤 들고 굴러 들어간다.',
  'encounters.app.locked_shutter.choices.pick.onFailure.text':
    '피크가 부러진다. 결국 억지로 여는데, 쇠지레보다 소리가 크다.',
  'encounters.app.locked_shutter.choices.roof.label': '옥상 쪽 진입로를 찾는다',
  'encounters.app.locked_shutter.choices.roof.hint': '등반. 느리고 조용하다.',
  'encounters.app.locked_shutter.choices.roof.onSuccess.text':
    '비상계단, 유리가 금 간 천창, 그리고 창고로 떨어지는 낙하.',
  'encounters.app.locked_shutter.choices.roof.onFailure.text':
    '비상 사다리가 굳어 있다. 누군가 온몸으로 매달리고 나서야 떨어진다.',

  'encounters.app.someone_home.title': '사람이 산다',
  'encounters.app.someone_home.text':
    '문간 발목 높이에 줄이 걸려 있고 깡통이 매달려 있다. 최근 것이다. 손이 야무지다.',
  'encounters.app.someone_home.choices.announce.label': '소리쳐 신원을 밝힌다',
  'encounters.app.someone_home.choices.announce.hint': '교섭 판정. 어느 쪽으로든 갈 수 있다.',
  'encounters.app.someone_home.choices.announce.onSuccess.text':
    '긴 침묵, 그다음 목소리. 나눠 쓰기로 한다. 위층은 당신들, 1층은 저쪽.',
  'encounters.app.someone_home.choices.announce.onFailure.text':
    '대답은 머리 위 천장으로 발사된 산탄이다. 뜻은 전달됐다.',
  'encounters.app.someone_home.choices.step_over.label': '줄을 넘어 조용히 들어간다',
  'encounters.app.someone_home.choices.step_over.hint': '아직 살아 있는 사람에게서 훔친다.',
  'encounters.app.someone_home.choices.step_over.onSuccess.text':
    '들어갔다 나온다. 아무도 깨지 않는다. 돌아오는 길에도 다들 말이 없다.',
  'encounters.app.someone_home.choices.step_over.onFailure.text':
    '깡통이 쓰러진다. 위층에서 무언가 빠르게 내려오고, 들어온 길로 나간다.',
  'encounters.app.someone_home.choices.leave.label': '건드리지 않는다',
  'encounters.app.someone_home.choices.leave.hint': '얻는 것 없음. 지키는 것 있음.',
  'encounters.app.someone_home.choices.leave.outcome.text':
    '물러나면서 줄을 원래대로 돌려 놓는다. 지점 하나를 잃었는데, 이상하게도 아무도 아쉬워하지 않는다.',

  'encounters.app.flooded_entry.title': '문턱까지 찬 물',
  'encounters.app.flooded_entry.text':
    '아래층에 물이 찼다. 허벅지 깊이, 검고, 아주 조금씩 움직인다. 어딘가로 흘러가고 있다는 뜻이다.',
  'encounters.app.flooded_entry.choices.wade.label': '걸어서 건넌다',
  'encounters.app.flooded_entry.choices.wade.hint': '차갑고, 아래에 뭐가 있는지 모른다.',
  'encounters.app.flooded_entry.choices.wade.outcome.text':
    '건넌다. 두 사람이 예전에 난간이었던 무언가에 다리를 베인다.',
  'encounters.app.flooded_entry.choices.rope.label': '줄을 걸고 넘어간다',
  'encounters.app.flooded_entry.choices.rope.lockedHint': '로프 세트나 등강 하네스가 필요하다.',
  'encounters.app.flooded_entry.choices.rope.outcome.text':
    '기둥에 고정하고 손으로 당겨 간다. 발이 마른 채로. 느리고, 그만한 값을 한다.',
  'encounters.app.flooded_entry.choices.find_other.label': '다른 내려가는 길을 찾는다',
  'encounters.app.flooded_entry.choices.find_other.onSuccess.text':
    '점검용 발판이 달린 환기 수직관. 물이 찬 구역 뒤편으로 나온다.',
  'encounters.app.flooded_entry.choices.find_other.onFailure.text':
    '40분 동안 막다른 길만. 결국 물에 들어가는데, 기분만 더 나쁘다.',

  'encounters.app.watched.title': '누군가 보고 있다',
  'encounters.app.watched.text':
    '건너편 3층에 사람이 있다. 모퉁이를 돌 때부터 거기 있었다. 움직이지 않는다.',
  'encounters.app.watched.choices.wave.label': '손을 흔든다',
  'encounters.app.watched.choices.wave.hint': '가장 오래된 긴장 완화 방법.',
  'encounters.app.watched.choices.wave.onSuccess.text':
    '손 하나가 올라왔다가 들어간다. 우호적이지 않다. 문제도 아니다.',
  'encounters.app.watched.choices.wave.onFailure.text':
    '아무 반응 없다. 안에 있는 내내 지켜본다. 편할 리가 없다.',
  'encounters.app.watched.choices.reposition.label': '시야를 끊고 자리를 옮긴다',
  'encounters.app.watched.choices.reposition.outcome.text':
    '골목으로 돌아 반대편에서 들어간다. 시간은 비싸고, 효과는 눈에 보이지 않는다.',
  'encounters.app.watched.choices.ignore.label': '무시하고 빠르게 작업한다',
  'encounters.app.watched.choices.ignore.outcome.text':
    '들어간다. 그자는 아무것도 하지 않는다. 왜인지는 나중에도, 어쩌면 영영 모른다.',

  'encounters.app.the_smell.title': '냄새',
  'encounters.app.the_smell.text':
    '문 앞에서부터 닿는다. 무슨 냄새인지 다들 안다. 문제는 몇 구인가뿐이다.',
  'encounters.app.the_smell.choices.mask_up.label': '마스크를 쓰고 들어간다',
  'encounters.app.the_smell.choices.mask_up.lockedHint': '방독면이나 방호복이 필요하다.',
  'encounters.app.the_smell.choices.mask_up.outcome.text':
    '거르면 일할 수 있다. 오래 걸리고, 아무도 말하지 않는다.',
  'encounters.app.the_smell.choices.go_in.label': '그냥 들어간다',
  'encounters.app.the_smell.choices.go_in.outcome.text':
    '안쪽 방에 닿기 전에 두 번 토한다. 찾으러 온 것은 찾는다.',
  'encounters.app.the_smell.choices.seal.label': '문을 봉하고 표시한다',
  'encounters.app.the_smell.choices.seal.hint': '지점을 포기한다. 사람을 지킨다.',
  'encounters.app.the_smell.choices.seal.outcome.text':
    '손잡이를 철사로 묶고 분필로 십자를 긋는다. 예전에 사람들이 하던 식으로.',

  /* ============================================================== 현장 */
  'encounters.site.methodical.title': '방을 훑는다',
  'encounters.site.methodical.text':
    '쓸 만한 빛이 두 시간쯤 남았다. 여기엔 들고 갈 수 있는 것보다 많은 것이 있는데, 평소 문제보다는 나은 문제다.',
  'encounters.site.methodical.choices.fast.label': '눈에 보이는 것만 챙기고 나간다',
  'encounters.site.methodical.choices.fast.hint': '안전하다. 수확은 적다.',
  'encounters.site.methodical.choices.fast.outcome.text': '눈높이, 자루에, 밖으로. 25분.',
  'encounters.site.methodical.choices.thorough.label': '제대로 훑는다',
  'encounters.site.methodical.choices.thorough.hint': '수확이 낫다. 노출 시간이 길다.',
  'encounters.site.methodical.choices.thorough.outcome.text':
    '가구 아래, 패널 뒤, 물탱크 속. 아무도 확인하지 않는 볼품없는 자리들.',
  'encounters.site.methodical.choices.systematic.label': '2인 1조로 나눠 구획을 나눈다',
  'encounters.site.methodical.choices.systematic.hint': '탐색 5. 최고의 수확, 잘못되면 최악.',
  'encounters.site.methodical.choices.systematic.lockedHint': '탐색 5 이상인 사람이 필요하다.',
  'encounters.site.methodical.choices.systematic.onSuccess.text':
    '한 조당 네 방씩, 끝낼 때마다 분필로 표시한다. 건물을 통째로 비운다.',
  'encounters.site.methodical.choices.systematic.onFailure.text':
    '흩어졌고, 한 조가 그때까지 버티던 바닥을 뚫고 떨어진다.',

  'encounters.site.locked_room.title': '잠긴 방',
  'encounters.site.locked_room.text':
    '건물에서 문 하나만 잠겨 있고, 그것도 방화문이고, 자물쇠도 좋은 것이다. 누군가 뒤에 무언가를 두고 일부러 잠갔다.',
  'encounters.site.locked_room.choices.force.label': '억지로 연다',
  'encounters.site.locked_room.choices.force.lockedHint': '지레 도구가 필요하다.',
  'encounters.site.locked_room.choices.force.outcome.text':
    '자물쇠보다 문틀이 먼저 나간다. 그 뒤에는 손대지 않은 좋은 재고가 있다.',
  'encounters.site.locked_room.choices.cut.label': '경첩을 자른다',
  'encounters.site.locked_room.choices.cut.lockedHint': '절단 도구가 필요하다.',
  'encounters.site.locked_room.choices.cut.outcome.text':
    '토치로 4분, 문이 바깥으로 쓰러진다. 안쪽은 두고 간 그대로다.',
  'encounters.site.locked_room.choices.leave.label': '내버려 둔다',
  'encounters.site.locked_room.choices.leave.hint': '모든 문을 열 수는 없다.',
  'encounters.site.locked_room.choices.leave.outcome.text':
    '문을 기록해 두고 지나간다. 다음에도 잠겨 있을 것이다.',

  'encounters.site.the_cache.title': '남의 은닉처',
  'encounters.site.the_cache.text':
    '가짜 벽 뒤에: 통조림, 물, 기름먹인 천에 싼 소총, 그리고 그 옆에 엎어 둔 아이 둘의 사진.',
  'encounters.site.the_cache.choices.take_all.label': '전부 가져간다',
  'encounters.site.the_cache.choices.take_all.hint': '전부, 그리고 그 무게.',
  'encounters.site.the_cache.choices.take_all.outcome.text':
    '전부 가져간다. 사진은 엎어 둔 채로 남기는데, 어쩐지 그편이 더 나쁘다.',
  'encounters.site.the_cache.choices.take_half.label': '절반만 가져가고 다시 봉한다',
  'encounters.site.the_cache.choices.take_half.outcome.text':
    '식량만 챙기고 소총과 물은 남긴다. 대단한 몸짓은 아니고, 그래도 몸짓이다.',
  'encounters.site.the_cache.choices.leave_note.label': '절반만 가져가고 주파수를 적어 둔다',
  'encounters.site.the_cache.choices.leave_note.hint': '현장 기록을 쓴다. 연락이 닿을 수도.',
  'encounters.site.the_cache.choices.leave_note.outcome.text':
    '두 줄과 숫자 하나를 통조림으로 눌러 둔다. 누군가 읽을지도 모른다.',

  'encounters.site.the_pharmacy_safe.title': '향정신성 의약품 캐비닛',
  'encounters.site.the_pharmacy_safe.text': '강철, 벽 고정, 손상 없음. 항생제가 여기 있다.',
  'encounters.site.the_pharmacy_safe.choices.crack.label': '자물쇠를 만진다',
  'encounters.site.the_pharmacy_safe.choices.crack.onSuccess.text':
    '청진기와 드라이버로 20분, 열린다.',
  'encounters.site.the_pharmacy_safe.choices.crack.onFailure.text':
    '열리지 않는다. 애초에 열릴 물건이 아니었다. 20분을 잃었다.',
  'encounters.site.the_pharmacy_safe.choices.torch.label': '잘라서 연다',
  'encounters.site.the_pharmacy_safe.choices.torch.lockedHint': '절단 도구가 필요하다.',
  'encounters.site.the_pharmacy_safe.choices.torch.outcome.text':
    '시끄럽고 뜨겁고 확실하다. 내용물의 절반이 절단에서 살아남는다.',
  'encounters.site.the_pharmacy_safe.choices.unbolt.label': '캐비닛째 떼어 간다',
  'encounters.site.the_pharmacy_safe.choices.unbolt.hint': '아주 무겁다. 대신 집에서 연다.',
  'encounters.site.the_pharmacy_safe.choices.unbolt.outcome.text':
    '볼트 넷, 사람 둘, 그리고 오래 기억할 귀갓길. 작업대 위에서 열린다.',

  'encounters.site.fuel_tanks.title': '지하 탱크',
  'encounters.site.fuel_tanks.text':
    '주유소 바닥 아래 2천 리터, 그리고 펌프는 없다. 점검구 뚜껑은 용접되어 있고 증기는 눈에 보일 만큼 짙다.',
  'encounters.site.fuel_tanks.choices.hand_pump.label': '수동 사이펀을 만든다',
  'encounters.site.fuel_tanks.choices.hand_pump.onSuccess.text':
    '호스, 파이프 한 토막, 그리고 중력. 한 시간 만에 가져온 통을 전부 채운다.',
  'encounters.site.fuel_tanks.choices.hand_pump.onFailure.text':
    '관이 꺾이더니 찢어진다. 일부만 받고 나머지는 몸에 뒤집어쓴다.',
  'encounters.site.fuel_tanks.choices.cut_plate.label': '점검구를 잘라 낸다',
  'encounters.site.fuel_tanks.choices.cut_plate.hint': '연료 증기 속에서 절단 토치를.',
  'encounters.site.fuel_tanks.choices.cut_plate.lockedHint': '절단 도구가 필요하다.',
  'encounters.site.fuel_tanks.choices.cut_plate.onSuccess.text':
    '먼저 물로 치환하고 냉간 절단. 교과서대로였고, 탱크는 가득하다.',
  'encounters.site.fuel_tanks.choices.cut_plate.onFailure.text':
    '섬광이 가장 가까이 있던 사람의 눈썹을 가져가고 주유소 바닥에 불이 붙는다.',
  'encounters.site.fuel_tanks.choices.surface_only.label': '지상에 있는 것만 챙긴다',
  'encounters.site.fuel_tanks.choices.surface_only.outcome.text':
    '정비고의 기름통들, 가게 뒤의 반 드럼. 소박하고 완전히 안전하다.',

  'encounters.site.the_ward.title': '9병동',
  'encounters.site.the_ward.text':
    '문은 복도 쪽에서 사슬로 묶여 있다. 철망 유리 너머로: 정돈된 침대들, 그리고 누군가 급히 일어난 듯 의자가 뒤로 밀린 간호사실.',
  'encounters.site.the_ward.choices.open.label': '사슬을 끊고 들어간다',
  'encounters.site.the_ward.choices.open.outcome.text':
    '비어 있다. 완전히 비어 있고, 침대는 정돈되어 있다. 돌아오는 길 내내 아무도 설명하지 못한다.',
  'encounters.site.the_ward.choices.records.label': '먼저 병동 기록을 찾는다',
  'encounters.site.the_ward.choices.records.onSuccess.text':
    '마지막 기재는 처치가 아니라 관찰이다. “환자 보행 가능. 환자 안정. 환자들 듣고 있음.”',
  'encounters.site.the_ward.choices.records.onFailure.text':
    '간호사실이 비었다. 누군가 기록을 가져갔고, 그것도 나름의 답이다.',
  'encounters.site.the_ward.choices.skip.label': '대신 약국을 턴다',
  'encounters.site.the_ward.choices.skip.outcome.text': '사슬은 그대로 둔다.',

  'encounters.site.silo_ladder.title': '사일로 사다리',
  'encounters.site.silo_ladder.text':
    '상부 해치까지 40미터의 안전망 사다리, 곡물은 꼭대기에 있다. 사다리 아래에는 내려오지 못한 사람이 있다.',
  'encounters.site.silo_ladder.choices.climb.label': '올라간다',
  'encounters.site.silo_ladder.choices.climb.onSuccess.text':
    '올라가서 해치를 열고 두 시간 동안 두레박 줄. 몇 달 만의 최고 수확이다.',
  'encounters.site.silo_ladder.choices.climb.onFailure.text':
    '중간에서 가로대가 나간다. 안전망이 받아 주기는 하는데, 심하게 다친다.',
  'encounters.site.silo_ladder.choices.harness.label': '확보줄을 걸고 올라간다',
  'encounters.site.silo_ladder.choices.harness.lockedHint': '로프 세트나 등강 하네스가 필요하다.',
  'encounters.site.silo_ladder.choices.harness.outcome.text':
    '끝까지 확보했다. 느리고, 전원이 내려온다.',
  'encounters.site.silo_ladder.choices.base_hatch.label': '바닥 배출구를 억지로 연다',
  'encounters.site.silo_ladder.choices.base_hatch.outcome.text':
    '반 톤이 한꺼번에 쏟아져 마당을 덮는다. 쥐가 오기 전에 담을 수 있는 만큼 담는다.',

  'encounters.site.armoury_door.title': '무기고 문',
  'encounters.site.armoury_door.text':
    '30센티 두께 강철에 다이얼 자물쇠, 그 옆에 안에 있는 것을 전부 적어 둔 코팅 카드. 누군가 그 카드를 자랑스러워했다.',
  'encounters.site.armoury_door.choices.combination.label': '번호를 알아낸다',
  'encounters.site.armoury_door.choices.combination.hint': '과학 5. 근무 일지에 있을 것이다.',
  'encounters.site.armoury_door.choices.combination.lockedHint': '과학 5 이상인 사람이 필요하다.',
  'encounters.site.armoury_door.choices.combination.onSuccess.text':
    '경사 서랍의 근무표 뒷면에 적혀 있다. 늘 그렇듯이.',
  'encounters.site.armoury_door.choices.combination.onFailure.text':
    '세 번 틀리자 자물쇠가 그날 하루 잠긴다.',
  'encounters.site.armoury_door.choices.hinges.label': '경첩을 공격한다',
  'encounters.site.armoury_door.choices.hinges.lockedHint': '절단 도구가 필요하다.',
  'encounters.site.armoury_door.choices.hinges.outcome.text':
    '오후를 거의 다 쓰고 가스통을 절반 쓰고 나서 열린다.',
  'encounters.site.armoury_door.choices.evidence.label': '대신 증거 보관실을 턴다',
  'encounters.site.armoury_door.choices.evidence.outcome.text':
    '무기고는 아니지만 그 뒤 철망 안: 압수된 칼들, 조끼 넷, 그리고 상당한 현금.',

  'encounters.site.console.title': '아직 살아 있는 콘솔',
  'encounters.site.console.text':
    '랙 하나 뒤에 축전지가 있고, 콘솔 하나가 로그인 프롬프트를 띄운 채 커서를 깜빡이고 있다.',
  'encounters.site.console.choices.try_access.label': '들어가 본다',
  'encounters.site.console.choices.try_access.onSuccess.text':
    '한 번도 비활성화되지 않은 정비 계정. 그 뒤로 하나의 표제 아래 디렉터리가 줄지어 있다. 메리디언 연속성.',
  'encounters.site.console.choices.try_access.onFailure.text':
    '세 번 시도하자 콘솔이 스스로를 지운다. 팬이 잦아들고 방이 마침내 조용해진다.',
  'encounters.site.console.choices.take_drives.label': '디스크를 뽑아 가져간다',
  'encounters.site.console.choices.take_drives.outcome.text':
    '캐디 넷, 아직 차갑다. 읽는 것은 다른 사람 몫이 될 것이다.',
  'encounters.site.console.choices.strip_room.label': '무시하고 방을 뜯는다',
  'encounters.site.console.choices.strip_room.outcome.text':
    '구리, 셀, 랙 레일. 실용적이다. 나올 때도 커서는 여전히 깜빡이고 있다.',

  'encounters.site.the_source.title': '발신원',
  'encounters.site.the_source.text':
    '신호가 여기서 가장 세다. 그리고 여기는 자동차 배터리와 안테나, 그리고 반복 재생 중인 카세트 데크가 있는 가정집 차고다. 누군가 배터리를 갈아 왔다. 최근에.',
  'encounters.site.the_source.choices.listen.label': '루프를 끝까지 듣는다',
  'encounters.site.the_source.choices.listen.hint': '9분. 아무도 듣고 싶어 하지 않는다.',
  'encounters.site.the_source.choices.listen.outcome.text':
    '음 하나, 그다음 여자가 숫자를 읽고, 그다음 다른 목소리가 같은 숫자를 읽고, 그다음 다시 첫 목소리. 녹음은 며칠씩 떨어져 있다. 같은 여자다.',
  'encounters.site.the_source.choices.take_rig.label': '장비를 가져간다',
  'encounters.site.the_source.choices.take_rig.outcome.text':
    '전부 들어낸다. 신호가 멈춘다. 나흘 뒤 다른 곳에서 다시 시작된다.',
  'encounters.site.the_source.choices.wait.label': '배터리를 가는 사람을 기다린다',
  'encounters.site.the_source.choices.wait.hint': '남은 하루를 쓴다.',
  'encounters.site.the_source.choices.wait.onSuccess.text':
    '예순쯤 되었고 아주 침착하다. 자기는 송신하는 게 아니라고 한다. 중계한다고 한다.',
  'encounters.site.the_source.choices.wait.onFailure.text':
    '아무도 오지 않는다. 빛을 잃고 어둠 속을 힘겹게 걸어 돌아온다.',

  'encounters.site.the_second_door.title': '두 번째 문',
  'encounters.site.the_second_door.text':
    '해치에는 당신들 방폭문과 같은 스텐실, 같은 제조사 명판, 같은 도장이 있다. 시설 코드만 한 자리 다르다.',
  'encounters.site.the_second_door.choices.key.label': '메리디언 열쇠를 넣어 본다',
  'encounters.site.the_second_door.choices.key.lockedHint': '메리디언 열쇠가 필요하다.',
  'encounters.site.the_second_door.choices.key.outcome.text':
    '돌아간다. 해치 뒤로: 아래로 내려가는 계단, 불이 켜져 있고, 따뜻한 공기가 올라온다.',
  'encounters.site.the_second_door.choices.panel.label': '정비 패널을 연다',
  'encounters.site.the_second_door.choices.panel.onSuccess.text':
    '인터록은 기계식이고 40년 됐다. 계단으로 열리고, 그 계단에는 불이 들어와 있다.',
  'encounters.site.the_second_door.choices.panel.onFailure.text':
    '패널에 경보가 걸려 있다. 여기서는 소리가 나지 않는데, 그럼 어디서 나느냐는 물음이 남는다.',
  'encounters.site.the_second_door.choices.document.label': '전부 기록하고 물러난다',
  'encounters.site.the_second_door.choices.document.outcome.text':
    '명판 번호, 스텐실, 전부. 기록고가 작업할 만큼은 된다.',

  'encounters.site.contaminated.title': '봉쇄된 구역',
  'encounters.site.contaminated.text':
    '비닐 시트, 테이프로 막은 이음매, 그리고 손으로 쓴 표지: 출입 금지 — 그 병이 아님.',
  'encounters.site.contaminated.choices.suited.label': '제대로 방호하고 들어간다',
  'encounters.site.contaminated.choices.suited.lockedHint': '방호복이 필요하다.',
  'encounters.site.contaminated.choices.suited.outcome.text':
    '밀봉하고 장갑 끼고 테이프로 막았다. 안에는 실험대 하나, 시료 상자 셋, 그리고 상당한 양의 의약품.',
  'encounters.site.contaminated.choices.quick.label': '숨 참고 재빨리 다녀온다',
  'encounters.site.contaminated.choices.quick.outcome.text':
    '안에서 90초. 한 아름을 안고 나오는데, 다른 것도 함께 나온다.',
  'encounters.site.contaminated.choices.respect.label': '표지를 존중한다',
  'encounters.site.contaminated.choices.respect.outcome.text':
    '건물의 나머지를 훑는다. 시트 뒤에 있는 것은 거기 그대로 둔다.',

  'encounters.site.hoard.title': '다 들고 갈 수 없다',
  'encounters.site.hoard.text':
    '창고가 가득하다. 정말로 가득하다. 들 수 있는 양의 세 배는 가져갈 수 있고, 다음 주엔 여기 없을 것이다.',
  'encounters.site.hoard.choices.sensible.label': '배낭만 채우고 나간다',
  'encounters.site.hoard.choices.sensible.outcome.text': '끈이 팽팽할 만큼만, 그 이상은 없다.',
  'encounters.site.hoard.choices.overload.label': '과적하고 천천히 걷는다',
  'encounters.site.hoard.choices.overload.hint': '수확이 많다. 지치고, 무슨 일이 생기면 느리다.',
  'encounters.site.hoard.choices.overload.outcome.text':
    '들어야 할 양의 두 배를 짊어진다. 귀갓길이 네 시간이고 다들 진저리를 친다.',
  'encounters.site.hoard.choices.cache.label': '나머지를 묻고 표시해 둔다',
  'encounters.site.hoard.choices.cache.hint': '보급 은닉망이 필요하다.',
  'encounters.site.hoard.choices.cache.lockedHint': '보급 은닉망 연구가 필요하다.',
  'encounters.site.hoard.choices.cache.outcome.text':
    '드럼에 밀봉해 하역장 아래 묻고 구역도에 표시한다.',

  'encounters.site.the_survivor.title': '혼자가 아니다',
  'encounters.site.the_survivor.text':
    '문에 캐비닛을 밀어 놓은 안쪽 사무실에서, 누군가 오랫동안 자판기 재고로 버텨 왔다.',
  'encounters.site.the_survivor.choices.offer.label': '볼트의 자리를 제안한다',
  'encounters.site.the_survivor.choices.offer.hint': '입이 하나 늘고, 손도 한 쌍 는다.',
  'encounters.site.the_survivor.choices.offer.onSuccess.text':
    '문을 사이에 두고 20분을 이야기한다. 이미 짐을 싸 둔 채로 나온다.',
  'encounters.site.the_survivor.choices.offer.onFailure.text':
    '나오지도 않고 말하지도 않는다. 문 앞에 먹을 것을 두고 온다.',
  'encounters.site.the_survivor.choices.trade.label': '거래한다',
  'encounters.site.the_survivor.choices.trade.outcome.text':
    '의약품과 정보를 바꾼다. 어느 건물이 비었고, 어디에 사람이 있고, 어디를 피해야 하는지.',
  'encounters.site.the_survivor.choices.nothing.label': '이 건물에서는 아무것도 가져가지 않는다',
  'encounters.site.the_survivor.choices.nothing.outcome.text': '지나가면서 문을 조용히 닫아 준다.',

  /* ============================================================== 사건 */
  'encounters.cmp.scavengers.title': '다른 무리',
  'encounters.cmp.scavengers.text':
    '하역문에 넷, 그리고 당신들의 배낭을 봤다. 아직 아무도 무언가를 들지는 않았다.',
  'encounters.cmp.scavengers.choices.talk.label': '말을 건다',
  'encounters.cmp.scavengers.choices.talk.onSuccess.text':
    '분배, 공유 주파수, 그리고 북쪽 끝에 대한 진짜로 쓸모 있는 경고.',
  'encounters.cmp.scavengers.choices.talk.onFailure.text': '세 번째 문장에서 틀어진다.',
  'encounters.cmp.scavengers.choices.fight.label': '먼저 움직인다',
  'encounters.cmp.scavengers.choices.fight.hint': '저쪽은 예상하지 못한다.',
  'encounters.cmp.scavengers.choices.fight.outcome.text': '선수를 잡는다.',
  'encounters.cmp.scavengers.choices.give.label': '절반을 주고 나온다',
  'encounters.cmp.scavengers.choices.give.hint': '수확의 일부를 잃는다. 사람은 전부 지킨다.',
  'encounters.cmp.scavengers.choices.give.outcome.text':
    '자루 절반을 내려놓고 문간에서 물러난다. 아무도 총에 맞지 않는다.',

  'encounters.cmp.collapse.title': '바닥이 내려앉는다',
  'encounters.cmp.collapse.text':
    '2층 한 구획이 예고 없이 무너지며 그 위에 서 있던 사람을 아래층으로 데려간다.',
  'encounters.cmp.collapse.choices.dig.label': '지금 당장 파낸다',
  'encounters.cmp.collapse.choices.dig.outcome.text':
    '맨손과 쇠지레, 그리고 훨씬 길게 느껴지는 11분.',
  'encounters.cmp.collapse.choices.rope.label': '줄을 걸고 제대로 한다',
  'encounters.cmp.collapse.choices.rope.lockedHint': '로프 세트나 등강 하네스가 필요하다.',
  'encounters.cmp.collapse.choices.rope.outcome.text':
    '고정하고 확보해 수직으로 끌어올린다. 다치기는 했지만 훨씬 덜하다.',
  'encounters.cmp.collapse.choices.stabilise.label': '먼저 받치고 나서 파낸다',
  'encounters.cmp.collapse.choices.stabilise.onSuccess.text':
    '선반에서 뜯은 지주 둘과 받침대 하나. 나머지 바닥은 제자리에 있는다.',
  'encounters.cmp.collapse.choices.stabilise.onFailure.text':
    '그 아래에서 작업하는 동안 두 번째 구획이 내려앉는다.',

  'encounters.cmp.ambush.title': '매복',
  'encounters.cmp.ambush.text': '계단참에서 기다리고 있었다. 그것도 당신들을 특정해서.',
  'encounters.cmp.ambush.choices.fight_through.label': '뚫고 나간다',
  'encounters.cmp.ambush.choices.fight_through.outcome.text': '나갈 길은 저들이 서 있는 그 길뿐이다.',
  'encounters.cmp.ambush.choices.suppress.label': '제압 사격 후 이탈한다',
  'encounters.cmp.ambush.choices.suppress.lockedHint': '탄약 4이 필요하다.',
  'encounters.cmp.ambush.choices.suppress.outcome.text':
    '계단참으로 네 발. 다들 고개를 숙이는 사이에 빠져나간다.',
  'encounters.cmp.ambush.choices.drop_and_run.label': '배낭을 버리고 달린다',
  'encounters.cmp.ambush.choices.drop_and_run.outcome.text':
    '수확물을 층계참에 두고 간다. 저들은 보내 준다. 무엇을 원했는지 알 수 있다.',

  'encounters.cmp.the_wounded.title': '누군가 다쳤다',
  'encounters.cmp.the_wounded.text':
    '이 속도로는 버티지 못한다. 멈춰서 제대로 처치하거나, 업고 가면서 요행을 바라거나.',
  'encounters.cmp.the_wounded.choices.treat.label': '멈춰서 처치한다',
  'encounters.cmp.the_wounded.choices.treat.lockedHint': '배낭에 의료 물품이 필요하다.',
  'encounters.cmp.the_wounded.choices.treat.onSuccess.text':
    '씻고, 채우고, 감았다. 의무실까지는 버틴다.',
  'encounters.cmp.the_wounded.choices.treat.onFailure.text':
    '할 수 있는 것을 하는데 충분하지 않고, 걷는 동안 나빠진다.',
  'encounters.cmp.the_wounded.choices.carry.label': '업고 지금 출발한다',
  'encounters.cmp.the_wounded.choices.carry.outcome.text':
    '둘이 짐을, 하나가 앞을. 두 시간이 아니라 네 시간.',
  'encounters.cmp.the_wounded.choices.push_on.label': '일을 먼저 끝낸다',
  'encounters.cmp.the_wounded.choices.push_on.hint': '수확도 중요하다. 사람도 중요하다.',
  'encounters.cmp.the_wounded.choices.push_on.outcome.text':
    '훑기를 끝낸다. 출발할 즈음엔 눈에 띄게 나빠져 있고, 본인도 이유를 안다.',

  'encounters.cmp.lost_light.title': '빛을 잃었다',
  'encounters.cmp.lost_light.text':
    '누구도 예상 못 한 속도로 완전히 어두워졌고, 아직 세 블록 안쪽이다.',
  'encounters.cmp.lost_light.choices.lantern.label': '랜턴을 꺼낸다',
  'encounters.cmp.lost_light.choices.lantern.lockedHint': '랜턴이나 조명탄이 필요하다.',
  'encounters.cmp.lost_light.choices.lantern.outcome.text':
    '감아서 불을 켠다. 무난한 속도로 걸어 나가고, 1.6킬로미터 밖에서도 보인다.',
  'encounters.cmp.lost_light.choices.feel_way.label': '더듬어서 나간다',
  'encounters.cmp.lost_light.choices.feel_way.outcome.text':
    '벽에 손을 대고 한 명이 앞장선다. 느리고 조용하고, 누군가 연석에서 넘어진다.',
  'encounters.cmp.lost_light.choices.hole_up.label': '동틀 때까지 숨는다',
  'encounters.cmp.lost_light.choices.hole_up.hint': '하루치 식량을 쓴다. 안전하다.',
  'encounters.cmp.lost_light.choices.hole_up.outcome.text':
    '문이 하나뿐인 사무실에서 교대로. 아무도 잘 자지 못하고, 다들 깨어난다.',

  'encounters.cmp.the_offer.title': '제안',
  'encounters.cmp.the_offer.text':
    '하필 클립보드를 든 남자, 그리고 뒤에 무장한 둘. 모집 중이라고 한다. 정착지로. 성벽이 있는.',
  'encounters.cmp.the_offer.choices.decline.label': '정중히 거절한다',
  'encounters.cmp.the_offer.choices.decline.outcome.text':
    '무언가 적더니 주파수 카드를 건네고 지나간다.',
  'encounters.cmp.the_offer.choices.trade.label': '대신 거래한다',
  'encounters.cmp.the_offer.choices.trade.hint': '부품을 팔고 의약품을 받는다.',
  'encounters.cmp.the_offer.choices.trade.outcome.text':
    '값을 후하게 쳐준다. 선의이거나, 아주 긴 계산이거나.',
  'encounters.cmp.the_offer.choices.question.label': '성벽이 무엇을 위한 것인지 묻는다',
  'encounters.cmp.the_offer.choices.question.onSuccess.text':
    '대답이 길고, 대체로 정직하다. 성벽은 사람을 막으려고 있는 것이 아니다.',
  'encounters.cmp.the_offer.choices.question.onFailure.text':
    '“안전을 위해서요.” 그가 말하고, 뒤의 둘이 무게중심을 옮긴다.',

  'encounters.cmp.contaminated_haul.title': '수확물이 상했다',
  'encounters.cmp.contaminated_haul.text':
    '쉬는 참에 누군가 통조림을 따는데 냄새가 분명하다. 하나가 그렇다면 대부분이 그렇다.',
  'encounters.cmp.contaminated_haul.choices.dump.label': '의심되는 것을 버린다',
  'encounters.cmp.contaminated_haul.choices.dump.outcome.text':
    '식량 절반이 계단참으로 간다. 아무도 따지지 않고, 다들 더 조용해진다.',
  'encounters.cmp.contaminated_haul.choices.sort.label': '제대로 골라낸다',
  'encounters.cmp.contaminated_haul.choices.sort.onSuccess.text':
    '이음매, 부풀음, 날짜 코드. 3분의 2는 멀쩡하고, 이제 어느 3분의 2인지 안다.',
  'encounters.cmp.contaminated_haul.choices.sort.onFailure.text':
    '괜찮아 보이는 것을 남긴다. 괜찮아 보이는 것과 괜찮은 것은 같지 않다.',
  'encounters.cmp.contaminated_haul.choices.keep_all.label': '전부 가져간다 — 볼트는 굶고 있다',
  'encounters.cmp.contaminated_haul.choices.keep_all.outcome.text':
    '배낭에 넣는다. 사흘 뒤 누군가의 문제가 될 것이다.',

  'encounters.cmp.gas.title': '공기 중에 무언가',
  'encounters.cmp.gas.text':
    '램프 불꽃이 노랗게 길어지더니, 뒤쪽에 있던 사람이 저도 모르게 주저앉는다.',
  'encounters.cmp.gas.choices.out_now.label': '전원 지금 밖으로',
  'encounters.cmp.gas.choices.out_now.outcome.text': '밖으로 끌어내고, 기침하고, 살아 있다.',
  'encounters.cmp.gas.choices.masks.label': '마스크를 쓰고 마무리한다',
  'encounters.cmp.gas.choices.masks.lockedHint': '방독면이나 방호복이 필요하다.',
  'encounters.cmp.gas.choices.masks.outcome.text':
    '정화통을 끼우고, 원래라면 못 했을 8분을 더 일한다.',
  'encounters.cmp.gas.choices.ventilate.label': '통풍구를 뚫고 기다린다',
  'encounters.cmp.gas.choices.ventilate.onSuccess.text':
    '격자 하나를 떼어 바람길을 내고, 20분 뒤 불꽃이 다시 파랗게 탄다.',
  'encounters.cmp.gas.choices.ventilate.onFailure.text':
    '빠지지 않는다. 그 사실을 인정하기까지 두 사람이 크게 당한다.',

  /* ============================================================== 귀환 */
  'encounters.ext.long_walk.title': '긴 귀갓길',
  'encounters.ext.long_walk.text': '짐을 지고, 지쳤고, 잠기는 문까지 4킬로미터.',
  'encounters.ext.long_walk.choices.direct.label': '곧장 돌아간다',
  'encounters.ext.long_walk.choices.direct.outcome.text': '지름길, 그리고 아무 일도 없다.',
  'encounters.ext.long_walk.choices.careful.label': '큰길을 피해 돌아간다',
  'encounters.ext.long_walk.choices.careful.outcome.text':
    '한 시간 더 걸리고, 들어가는 것을 아무도 보지 못한다.',
  'encounters.ext.long_walk.choices.rest_first.label': '한 시간 쉬고 출발한다',
  'encounters.ext.long_walk.choices.rest_first.hint': '식량을 쓰고, 덜 지쳐서 도착한다.',
  'encounters.ext.long_walk.choices.rest_first.outcome.text':
    '배낭을 내리고, 신발을 벗고, 물을 나눈다. 생각보다 훨씬 차이가 크다.',

  'encounters.ext.followed.title': '미행',
  'encounters.ext.followed.text':
    '계단 입구에서 두 블록. 교차로에서부터 계속 뒤에 있던 사람이 있다.',
  'encounters.ext.followed.choices.lose_them.label': '들어가기 전에 따돌린다',
  'encounters.ext.followed.choices.lose_them.onSuccess.text':
    '세 번 꺾고, 화물 마당, 그리고 기다림. 지나쳐 간다.',
  'encounters.ext.followed.choices.lose_them.onFailure.text':
    '따돌리지 못한다. 그래도 들어가고, 이제 누군가 문의 위치를 안다.',
  'encounters.ext.followed.choices.confront.label': '돌아서서 마주한다',
  'encounters.ext.followed.choices.confront.outcome.text':
    '트인 곳에 서서 상대가 다가오기를 기다린다.',
  'encounters.ext.followed.choices.straight_in.label': '곧장 들어가 문을 건다',
  'encounters.ext.followed.choices.straight_in.outcome.text':
    '90초 만에 안으로 들어간다. 안이 어디인지도 함께 알려진다.',

  'encounters.ext.one_more_room.title': '방 하나 더',
  'encounters.ext.one_more_room.text':
    '나오는 길에, 아무도 열지 않은 문 하나. 시간은 있다. 많지는 않다.',
  'encounters.ext.one_more_room.choices.open_it.label': '연다',
  'encounters.ext.one_more_room.choices.open_it.outcome.text': '이번만은 위험을 걸 값을 했다.',
  'encounters.ext.one_more_room.choices.walk.label': '지나친다',
  'encounters.ext.one_more_room.choices.walk.outcome.text':
    '두고 간다. 돌아오는 길에 누군가 그 얘기를 세 번 꺼낸다.',
  'encounters.ext.one_more_room.choices.mark.label': '다음을 위해 표시해 둔다',
  'encounters.ext.one_more_room.choices.mark.outcome.text':
    '문틀에 분필로, 구역도에 기록으로.',

  'encounters.ext.the_stair_head.title': '계단 입구',
  'encounters.ext.the_stair_head.text':
    '집은 화물 마당의 녹슨 문이다. 빗장은 안쪽에 있고, 누군가 듣고 있어야 한다.',
  'encounters.ext.the_stair_head.choices.knock.label': '약속된 노크를 한다',
  'encounters.ext.the_stair_head.choices.knock.outcome.text':
    '셋, 쉬고, 둘. 빗장이 올라간다. 안은 비교적 따뜻하다.',
  'encounters.ext.the_stair_head.choices.beacon.label': '표지를 쏜다',
  'encounters.ext.the_stair_head.choices.beacon.lockedHint': '무선 표지나 전계 측정기가 필요하다.',
  'encounters.ext.the_stair_head.choices.beacon.outcome.text':
    '닿기도 전에 문이 열려 있고, 국이 있다.',
  'encounters.ext.the_stair_head.choices.wait.label': '마당이 빌 때까지 엄폐하고 기다린다',
  'encounters.ext.the_stair_head.choices.wait.outcome.text':
    '쓰레기통 뒤에서 20분, 제 집 대문을 지켜본다. 분별 있고, 사람을 지치게 한다.',

  'encounters.ext.overweight.title': '너무 무겁다',
  'encounters.ext.overweight.text':
    '누군가는 무언가를 내려놓아야 하고, 그 누군가가 누구일지는 다들 안다.',
  'encounters.ext.overweight.choices.redistribute.label': '짐을 나눈다',
  'encounters.ext.overweight.choices.redistribute.outcome.text':
    '각자 조금씩 더 진다. 다 같이 지쳐서 도착한다.',
  'encounters.ext.overweight.choices.ditch.label': '가장 무거운 자루를 버린다',
  'encounters.ext.overweight.choices.ditch.outcome.text':
    '부품은 담벼락 뒤에 표시해 두고 간다. 아침이면 아마 없을 것이다.',
  'encounters.ext.overweight.choices.sled.label': '썰매에 끌고 간다',
  'encounters.ext.overweight.choices.sled.lockedHint': '회수용 썰매나 배낭 프레임이 필요하다.',
  'encounters.ext.overweight.choices.sled.outcome.text':
    '볼썽사납고 아스팔트에서 시끄럽고, 전부 집으로 온다.',

  /* ==================================================== 추가 조우 */
  'encounters.app.reading_the_front.title': '건물 읽기',
  'encounters.app.reading_the_front.text':
    '마지막 모퉁이에 서서 처음으로 그 건물을 제대로 본다. 어느 문이 열려 있는지, 어느 창이 안쪽에서 깨졌는지, 계단의 먼지를 밟고 지나간 자국이 있는지.',
  'encounters.app.reading_the_front.choices.careful.label': '시간을 들여 읽는다',
  'encounters.app.reading_the_front.choices.careful.hint': '햇빛을 쓴다. 이후가 전부 나아진다.',
  'encounters.app.reading_the_front.choices.careful.outcome.text':
    '10분을 지켜보면 어느 바닥이 성한지, 어느 출입구를 아무도 쓰지 않았는지 알 수 있다.',
  'encounters.app.reading_the_front.choices.straight.label': '곧장 들어간다',
  'encounters.app.reading_the_front.choices.straight.hint': '안에서 쓸 시간이 늘고, 경고는 없다.',
  'encounters.app.reading_the_front.choices.straight.outcome.text':
    '옆문으로 들어가 도착 2분 만에 작업을 시작한다.',
  'encounters.app.reading_the_front.choices.survey.label': '다음을 위해 배치를 그려 둔다',
  'encounters.app.reading_the_front.choices.survey.hint': '과학 3. 이곳에 다시 올 때마다 안전해진다.',
  'encounters.app.reading_the_front.choices.survey.lockedHint': '과학 3 이상인 사람이 필요하다.',
  'encounters.app.reading_the_front.choices.survey.outcome.text':
    '무너진 구획을 표시한 대략적인 평면도가 지도 케이스에 들어간다.',

  'encounters.trv.stray_pack.title': '연립 구역의 개들',
  'encounters.trv.stray_pack.text':
    '길 위 둑에 여섯 마리. 마르고 조용하게, 목축견이 들판을 보듯 팀을 본다. 한때는 누군가의 개였다. 지금은 아니다.',
  'encounters.trv.stray_pack.choices.walk.label': '눈을 마주치지 않고 계속 걷는다',
  'encounters.trv.stray_pack.choices.walk.hint': '흥미를 잃을 수도 있다. 아닐 수도 있다.',
  'encounters.trv.stray_pack.choices.walk.onSuccess.text':
    '200미터를 따라오다 절개지 위로 빠진다.',
  'encounters.trv.stray_pack.choices.walk.onFailure.text':
    '우두머리가 암거 앞에서 달려들고 나머지가 따라온다.',
  'encounters.trv.stray_pack.choices.food.label': '식량을 놓고 물러난다',
  'encounters.trv.stray_pack.choices.food.hint': '식량을 쓴다. 깨끗한 통과를 산다.',
  'encounters.trv.stray_pack.choices.food.outcome.text':
    '통조림을 아스팔트에 놓는다. 그것에 닿을 즈음 팀은 모퉁이를 돌아 있다.',
  'encounters.trv.stray_pack.choices.drive.label': '소리를 내어 쫓는다',
  'encounters.trv.stray_pack.choices.drive.hint': '시끄럽다. 근처의 다른 것도 듣는다.',
  'encounters.trv.stray_pack.choices.drive.outcome.text':
    '고함과 난간을 두드리는 소리에 언덕 위로 흩어진다. 이제 연립의 모든 창이 당신들을 보고 있다.',

  'encounters.app.the_watcher.title': '이미 누가 있다',
  'encounters.app.the_watcher.text':
    '문간에 눕혀 둔 자전거, 체인 기름이 아직 따뜻하다. 주인은 안에 있고, 당신들이 온 것을 들었다.',
  'encounters.app.the_watcher.choices.call.label': '먼저 소리쳐 알린다',
  'encounters.app.the_watcher.choices.call.hint': '교섭. 신원을 밝히는 것이 총 맞지 않는 방법이다.',
  'encounters.app.the_watcher.choices.call.onSuccess.text':
    '계단참에서 여자가 답한다. 북쪽 절반은 그가, 남쪽 절반은 당신들이. 서로 뒤를 보지 않는다.',
  'encounters.app.the_watcher.choices.call.onFailure.text':
    '대답이 없고, 이어 누군가 뒤창으로 빠르게 나가는 소리. 좋은 절반을 들고 갔다.',
  'encounters.app.the_watcher.choices.wait.label': '엄폐하고 나올 때까지 기다린다',
  'encounters.app.the_watcher.choices.wait.hint': '햇빛 한 시간을 쓴다.',
  'encounters.app.the_watcher.choices.wait.outcome.text':
    '40분 뒤 소년 하나가 통조림을 담은 베갯잇을 들고 나오는데, 당신들을 전혀 보지 못한다.',
  'encounters.app.the_watcher.choices.push.label': '그래도 들어간다',
  'encounters.app.the_watcher.choices.push.hint': '가장 빠르다. 안에 있는 사람은 몰리게 된다.',
  'encounters.app.the_watcher.choices.push.outcome.text':
    '층계참에서 마주친다. 아무도 주먹을 휘두르지 않지만 아슬아슬했고, 다들 화가 난 채로 떠난다.',

  'encounters.site.the_locked_room.title': '아무도 열지 않은 방',
  'encounters.site.the_locked_room.text':
    '복도 끝의 강철 문, 아직 바깥에서 빗장이 걸려 있다. 그 뒤의 무엇이든 고요 이후로 손대지 않았다는 뜻이고, 그것은 이번 주 최고의 소식이거나 다들 이 문을 건드리지 않은 이유거나 둘 중 하나다.',
  'encounters.site.the_locked_room.choices.force.label': '빗장을 부순다',
  'encounters.site.the_locked_room.choices.force.hint': '지레 도구가 필요하다.',
  'encounters.site.the_locked_room.choices.force.lockedHint': '쇠지레 종류가 필요하다.',
  'encounters.site.the_locked_room.choices.force.outcome.text':
    '빗장이 끊어지고 문이 열리며 온전한 창고가 나온다. 몇 달 동안 아무도 이 공기를 마시지 않았다.',
  'encounters.site.the_locked_room.choices.hinges.label': '대신 경첩을 만진다',
  'encounters.site.the_locked_room.choices.hinges.hint': '느리고 힘들지만 도구 없이 된다.',
  'encounters.site.the_locked_room.choices.hinges.onSuccess.text':
    '20분의 끈질긴 작업 끝에 문이 핀에서 통째로 빠진다.',
  'encounters.site.the_locked_room.choices.hinges.onFailure.text':
    '핀이 용접되어 있다. 남은 것은 휜 드라이버와 결린 어깨뿐이다.',
  'encounters.site.the_locked_room.choices.leave.label': '표시해 두고 지나간다',
  'encounters.site.the_locked_room.choices.leave.hint': '다음에도 여기 있을 것이다.',
  'encounters.site.the_locked_room.choices.leave.outcome.text':
    '문에 분필 십자, 일지에 한 줄. 그대로 남는다.',

  'encounters.site.the_meltwater.title': '지하의 눈 녹은 물',
  'encounters.site.the_meltwater.text':
    '아래층 재고 위로 1미터의 고인 물, 아플 만큼 차갑다. 무언가 든 상자들이 수면 아래로 겨우 보이며 먼 벽에 붙어 떠 있다.',
  'encounters.site.the_meltwater.choices.wade.label': '들어가서 떠 있는 것을 건진다',
  'encounters.site.the_meltwater.choices.wade.hint': '차갑다. 대가를 각오할 것.',
  'encounters.site.the_meltwater.choices.wade.outcome.text':
    '상자 넷을 건진다. 그리고 돌아오는 길 내내 가슴에 남는 한기도.',
  'encounters.site.the_meltwater.choices.pole.label': '계단에서 건져 올린다',
  'encounters.site.the_meltwater.choices.pole.hint': '더 안전하고, 가까운 것만 얻는다.',
  'encounters.site.the_meltwater.choices.pole.outcome.text':
    '전선관 한 토막으로 참을성 있게 20분, 상자 둘을 끌어당긴다.',
  'encounters.site.the_meltwater.choices.drain.label': '배수구를 찾아 연다',
  'encounters.site.the_meltwater.choices.drain.hint': '공학 5. 방을 영구히 비운다.',
  'encounters.site.the_meltwater.choices.drain.lockedHint': '공학 5 이상인 사람이 필요하다.',
  'encounters.site.the_meltwater.choices.drain.onSuccess.text':
    '집수정 밸브가 계단 아래 있다. 굳었을 뿐 망가지지는 않았다. 한 시간 만에 물이 빠지고 전부를 내준다.',
  'encounters.site.the_meltwater.choices.drain.onFailure.text':
    '밸브 대가 부러진다. 물은 남고, 이제 영영 남을 것이다.',

  'encounters.site.the_ledger.title': '기록을 남긴 사람',
  'encounters.site.the_ledger.text':
    '점장 책상 위의 링 바인더. 매일 손으로 채워졌고, 문장 중간에 멈춘 쪽까지 이어진다. 마지막 기재는 재고 이야기가 아니다.',
  'encounters.site.the_ledger.choices.read.label': '가기 전에 제대로 읽는다',
  'encounters.site.the_ledger.choices.read.hint': '시간이 든다. 알아 둘 값어치는 있다.',
  'encounters.site.the_ledger.choices.read.outcome.text':
    '세 쪽 들어가면 납품이 어디로 돌려졌는지 적힌 목록과, 계속 반복되는 이름 하나가 있다.',
  'encounters.site.the_ledger.choices.take.label': '가져가서 집에서 읽는다',
  'encounters.site.the_ledger.choices.take.outcome.text':
    '배낭에 들어간다. 보기보다 무겁다.',
  'encounters.site.the_ledger.choices.skip.label': '둔다 — 보급품을 가지러 왔다',
  'encounters.site.the_ledger.choices.skip.outcome.text':
    '있던 자리에 책상 모서리와 나란히 맞춰 놓고 선반 일로 돌아간다.',

  'encounters.cmp.the_floor_goes.title': '바닥이 내려앉는다',
  'encounters.cmp.the_floor_goes.text':
    '중이층 한 구획이 예고 없이 떨어지며 그 위에 서 있던 사람을 아래층 어둠으로 데려간다.',
  'encounters.cmp.the_floor_goes.choices.rope.label': '줄을 내려 준다',
  'encounters.cmp.the_floor_goes.choices.rope.lockedHint': '로프나 등반 장비가 필요하다.',
  'encounters.cmp.the_floor_goes.choices.rope.outcome.text':
    '흙투성이에 떨고 있지만 온전한 상태로 올라온다.',
  'encounters.cmp.the_floor_goes.choices.climb.label': '따라 내려간다',
  'encounters.cmp.the_floor_goes.choices.climb.onSuccess.text':
    '무너진 선반을 타고 느리게 내려가고, 부상자를 사이에 두고 더 느리게 올라온다.',
  'encounters.cmp.the_floor_goes.choices.climb.onFailure.text':
    '두 번째 추락이 첫 번째보다 나쁘고, 이제 아래에 둘이 있다.',
  'encounters.cmp.the_floor_goes.choices.abort.label': '꺼내서 집으로 돌아간다',
  'encounters.cmp.the_floor_goes.choices.abort.hint': '가진 것만 들고 탐사를 끝낸다.',
  'encounters.cmp.the_floor_goes.choices.abort.outcome.text':
    '끌어내고 팔을 감고 걷는다. 건물의 나머지는 비밀을 지킨다.',

  'encounters.cmp.the_toll.title': '길목의 제안',
  'encounters.cmp.the_toll.text':
    '길을 막은 셋, 손은 보이게 두고, 하나가 말을 한다. 들고 있는 것의 절반을 원한다. 대신 이 구역이 당신들에게 더는 문제가 되지 않게 해 주겠다고 한다.',
  'encounters.cmp.the_toll.choices.pay.label': '준다',
  'encounters.cmp.the_toll.choices.pay.hint': '수확의 절반. 다시 쓸 수 있는 길을 산다.',
  'encounters.cmp.the_toll.choices.pay.outcome.text':
    '말하던 자가 세어 보고 한 번 끄덕이더니 비켜선다. 그 약속이 지켜질지는 다음 달의 문제다.',
  'encounters.cmp.the_toll.choices.talk.label': '값을 깎는다',
  'encounters.cmp.the_toll.choices.talk.hint': '교섭 5.',
  'encounters.cmp.the_toll.choices.talk.lockedHint': '교섭 5 이상인 사람이 필요하다.',
  'encounters.cmp.the_toll.choices.talk.onSuccess.text':
    '4분의 1과 다음번 의약품 약속으로 정리된다. 서로 체면이 선다.',
  'encounters.cmp.the_toll.choices.talk.onFailure.text':
    '말하던 자가 시간 낭비라고 판단하고, 대화는 이런 대화가 늘 끝나는 방식으로 끝난다.',
  'encounters.cmp.the_toll.choices.refuse.label': '거절한다',
  'encounters.cmp.the_toll.choices.refuse.hint': '저쪽은 무장했고 셋이다.',
  'encounters.cmp.the_toll.choices.refuse.outcome.text':
    '한참 동안 아무도 움직이지 않는다. 그러다 말하던 자가 어깨를 으쓱하고, 싸움이 된다.',

  'encounters.ext.the_long_way_round.title': '멀리 돌아가는 길',
  'encounters.ext.the_long_way_round.text':
    '들어온 길이 점거됐다. 불빛, 움직임, 세 명 이상. 다른 귀로가 있지만 트인 지형으로 4킬로미터가 늘어난다.',
  'encounters.ext.the_long_way_round.choices.long.label': '먼 길로 간다',
  'encounters.ext.the_long_way_round.choices.long.hint': '지치지만 아무도 보지 못한다.',
  'encounters.ext.the_long_way_round.choices.long.outcome.text':
    '어두워진 뒤 비상계단을 내려온다. 다리는 갔고 배낭은 온전하다.',
  'encounters.ext.the_long_way_round.choices.through.label': '그래도 사이로 빠져나간다',
  'encounters.ext.the_long_way_round.choices.through.hint': '준비가 되어 있으면 훨씬 안전하다.',
  'encounters.ext.the_long_way_round.choices.through.onSuccess.text':
    '저들의 모닥불 두 개 사이 틈으로 한마디 소리 없이 빠져나간다.',
  'encounters.ext.the_long_way_round.choices.through.onFailure.text':
    '가장 나쁜 순간에 개가 짖어 들킨다. 마지막 1킬로미터는 달리기다.',
  'encounters.ext.the_long_way_round.choices.cache.label': '수확물을 묻어 두고 나중에 온다',
  'encounters.ext.the_long_way_round.choices.cache.hint': '사람은 지킨다. 물건은 지킬 수도 있다.',
  'encounters.ext.the_long_way_round.choices.cache.outcome.text':
    '무거운 것은 전부 무너진 차양 아래 넣고 돌 세 개로 표시한다. 가볍게, 들키지 않고 돌아온다.',
};
