import type { ContentBundle } from '../../../types';

/**
 * 지점 원형과 그 이름들.
 *
 * 지점 이름은 영국식 지명·상호라서 외래어 표기법에 따라 음차하고, 뜻이 있는 부분
 * (Level −3, The Blockage 등)만 옮긴다. 지도 위 라벨로 쓰이므로 되도록 짧게 잡는다.
 */
export const KO_LOCATIONS: ContentBundle = {
  'locations.apartment_block.name': '아파트 단지',
  'locations.apartment_block.description': '현관문 여섯 층. 대부분 이미 열려 있다.',
  'locations.apartment_block.nameForms.0': '시커모어 코트',
  'locations.apartment_block.nameForms.1': '킬너 하우스',
  'locations.apartment_block.nameForms.2': '연립 구역',
  'locations.apartment_block.nameForms.3': '베크위스 라이즈',
  'locations.apartment_block.nameForms.4': '페리 레인 아파트',

  'locations.corner_shop.name': '동네 가게',
  'locations.corner_shop.description': '셔터는 내려가 있고 뒷문은 열려 있다. 담배만은 누가 아주 꼼꼼히 챙겨 갔다.',
  'locations.corner_shop.nameForms.0': '파텔 부자 상회',
  'locations.corner_shop.nameForms.1': '심야 상점',
  'locations.corner_shop.nameForms.2': '나이팅게일 스토어',
  'locations.corner_shop.nameForms.3': '할림 식료품',

  'locations.garden_centre.name': '원예 센터',
  'locations.garden_centre.description': '유리가 성한 온실. 9번 트레이에서는 아직 무언가가 자라고 있다.',
  'locations.garden_centre.nameForms.0': '애시미드 묘목장',
  'locations.garden_centre.nameForms.1': '그린 로',
  'locations.garden_centre.nameForms.2': '분갈이 창고',

  'locations.car_park.name': '지하 주차장',
  'locations.car_park.description': '지하 3층, 빛이 없고, 아무도 찾으러 오지 않은 차량 400대.',
  'locations.car_park.nameForms.0': '지하 3층',
  'locations.car_park.nameForms.1': '언더크로프트',
  'locations.car_park.nameForms.2': '마켓 스트리트 주차장',

  'locations.church.name': '교회',
  'locations.church.description': '초는 촛대까지 타들어 갔다. 누군가 벽에 이름을 적어 왔다.',
  'locations.church.nameForms.0': '세인트올데이트 교회',
  'locations.church.nameForms.1': '집회소',
  'locations.church.nameForms.2': '삼위일체 교회',
  'locations.church.nameForms.3': '안식 예배당',

  'locations.filling_station.name': '주유소',
  'locations.filling_station.description': '주유기는 죽었고 탱크는 지하에 있다. 거기까지 닿는 것이 문제의 전부다.',
  'locations.filling_station.nameForms.0': '노스웨이 휴게소',
  'locations.filling_station.nameForms.1': '국도변 정류장',
  'locations.filling_station.nameForms.2': '코베트 주유',

  'locations.supermarket.name': '대형 마트',
  'locations.supermarket.description': '눈높이 진열대는 다 털렸고, 아무도 보지 않은 바닥 칸은 그대로다.',
  'locations.supermarket.nameForms.0': '노스게이트 마켓',
  'locations.supermarket.nameForms.1': '큰 상점',
  'locations.supermarket.nameForms.2': '펜 앤 로우',
  'locations.supermarket.nameForms.3': '리버사이드 상가',

  'locations.clinic.name': '진료소',
  'locations.clinic.description': '대기실 의자를 벽으로 밀어 두었다. 그다음에 온 것을 위한 자리였다.',
  'locations.clinic.nameForms.0': '웨일랜드 의원',
  'locations.clinic.nameForms.1': '무예약 진료소',
  'locations.clinic.nameForms.2': '도클랜즈 클리닉',

  'locations.hardware_store.name': '철물점',
  'locations.hardware_store.description': '전동공구는 누가 가져갔다. 정작 중요한 것들은 아직 선반에 있다.',
  'locations.hardware_store.nameForms.0': '브레너 공구',
  'locations.hardware_store.nameForms.1': '자재 마당',
  'locations.hardware_store.nameForms.2': '커 앤 밴스 철물',

  'locations.school.name': '학교',
  'locations.school.description': '강당을 대피소로 바꿨다가, 서둘러 버리고 떠났다.',
  'locations.school.nameForms.0': '애시콤 중등학교',
  'locations.school.nameForms.1': '세인트브라이즈',
  'locations.school.nameForms.2': '아카데미',
  'locations.school.nameForms.3': '마시 레인 초등학교',

  'locations.police_station.name': '경찰서',
  'locations.police_station.description': '무기고 문은 30센티 두께 강철이다. 증거 보관실은 아니다.',
  'locations.police_station.nameForms.0': '6분서',
  'locations.police_station.nameForms.1': '말로 스트리트 지구대',
  'locations.police_station.nameForms.2': '분소',

  'locations.warehouse.name': '물류 창고',
  'locations.warehouse.description': '천장까지 닿는 선반. 팔레트 대부분은 랩으로 감긴 사무용 가구다.',
  'locations.warehouse.nameForms.0': '14호동',
  'locations.warehouse.nameForms.1': '케스트럴 물류',
  'locations.warehouse.nameForms.2': '배송 창고',
  'locations.warehouse.nameForms.3': '9번 하역장',

  'locations.subway_station.name': '지하철역',
  'locations.subway_station.description': '승강장 끝에 물이 차 있다. 터널은 지도가 인정하는 것보다 멀리 뻗는다.',
  'locations.subway_station.nameForms.0': '펜윅 크로스',
  'locations.subway_station.nameForms.1': '언더라인 북부',
  'locations.subway_station.nameForms.2': '3번 승강장',
  'locations.subway_station.nameForms.3': '구 거래소',

  'locations.bus_depot.name': '버스 차고지',
  'locations.bus_depot.description': '차량 40대, 그중 넷은 뜯겼고, 정비 피트에는 쓸 만한 것이 가득하다.',
  'locations.bus_depot.nameForms.0': '이스트웨이 차고',
  'locations.bus_depot.nameForms.1': '정비고',
  'locations.bus_depot.nameForms.2': '운수 야적장',

  'locations.quarantine_tent.name': '검역소',
  'locations.quarantine_tent.description': '야전병원 천막이 아직 서 있다. 출입구가 바깥에서 묶여 있다.',
  'locations.quarantine_tent.nameForms.0': '앰버 검문소',
  'locations.quarantine_tent.nameForms.1': '흰 천막들',
  'locations.quarantine_tent.nameForms.2': '4번 선별소',

  'locations.hospital.name': '종합병원',
  'locations.hospital.description': '열한 개 층. 발전기는 엿새를 돌았고, 이레째에 무슨 일이 있었는지는 기록에 남아 있다.',
  'locations.hospital.nameForms.0': '세인트베리티 병원',
  'locations.hospital.nameForms.1': '중앙병원',
  'locations.hospital.nameForms.2': '노스필드 의료원',

  'locations.factory.name': '공장',
  'locations.factory.description': '옮길 수만 있다면 무게값을 하고도 남을 공작기계들.',
  'locations.factory.nameForms.0': '핼러웨이 섬유',
  'locations.factory.nameForms.1': '프레스 공장',
  'locations.factory.nameForms.2': '200호동 가공',

  'locations.water_treatment.name': '정수장',
  'locations.water_treatment.description': '침전조, 염소 드럼, 그리고 일지가 펼쳐진 채로 남은 통제실.',
  'locations.water_treatment.nameForms.0': '마시 로드 처리장',
  'locations.water_treatment.nameForms.1': '여과지',
  'locations.water_treatment.nameForms.2': '델타 시설',

  'locations.radio_tower.name': '송신탑',
  'locations.radio_tower.description': '200미터 철탑. 밑동의 관리동은 문이 용접되어 있다.',
  'locations.radio_tower.nameForms.0': '비컨 힐 철탑',
  'locations.radio_tower.nameForms.1': '9번 중계소',
  'locations.radio_tower.nameForms.2': '송신소',

  'locations.military_checkpoint.name': '군 검문소',
  'locations.military_checkpoint.description': '콘크리트 블록, 불탄 차량, 그리고 끝내 배급되지 않은 상자들.',
  'locations.military_checkpoint.nameForms.0': '2차 차단선',
  'locations.military_checkpoint.nameForms.1': '도로 봉쇄점',
  'locations.military_checkpoint.nameForms.2': '동부 집결지',

  'locations.data_centre.name': '데이터 센터',
  'locations.data_centre.description': '할론이 살포된 채 밀폐되었다. 랙은 죽었다. 콘솔 하나는 아니다.',
  'locations.data_centre.nameForms.0': '메리디언 4번 노드',
  'locations.data_centre.nameForms.1': '냉각실',
  'locations.data_centre.nameForms.2': '12B 시설',

  'locations.grain_silo.name': '곡물 저장고',
  'locations.grain_silo.description': '보리 400톤, 그리고 이미 사람을 하나 죽인 사다리.',
  'locations.grain_silo.nameForms.0': '조합 창고 2',
  'locations.grain_silo.nameForms.1': '승강기동',
  'locations.grain_silo.nameForms.2': '마시 농장 사일로',

  'locations.collapsed_tunnel.name': '무너진 터널',
  'locations.collapsed_tunnel.description': '100미터가 내려앉았다. 그 너머의 무엇이든 몇 주째 조용하다.',
  'locations.collapsed_tunnel.nameForms.0': '붕괴 구간',
  'locations.collapsed_tunnel.nameForms.1': '북측 2번 갱도',
  'locations.collapsed_tunnel.nameForms.2': '막힌 구간',

  'locations.unknown_signal.name': '미상 신호',
  'locations.unknown_signal.description': '허가된 적 없는 대역으로 여기에서 무언가가 송신하고 있다.',
  'locations.unknown_signal.nameForms.0': '방위 041',
  'locations.unknown_signal.nameForms.1': '중계기',
  'locations.unknown_signal.nameForms.2': '발신원 불명',
  'locations.unknown_signal.nameForms.3': '방위 297',

  'locations.meridian_hatch.name': '메리디언 출입 해치',
  'locations.meridian_hatch.description':
    '당신들의 방폭문과 똑같은 스텐실이 찍힌 해치. 시설 코드만 다르다.',
  'locations.meridian_hatch.nameForms.0': '7번 해치',
  'locations.meridian_hatch.nameForms.1': 'M-3 정비 출입구',
  'locations.meridian_hatch.nameForms.2': '두 번째 문',
};
