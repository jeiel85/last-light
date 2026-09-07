import type { ContentBundle } from '../../../types';

/**
 * 시설.
 *
 * 이름은 짧은 명사구로 두고, 설명은 원문의 건조한 관찰자 시점을 유지한다. 단계 요약은
 * 숫자가 주인공이므로 수식을 붙이지 않고 원문의 기호(+, −, %)를 그대로 쓴다.
 */
export const KO_FACILITIES: ContentBundle = {
  'facilities.reactor.name': '원자로 잔편',
  'facilities.reactor.description':
    '구역 발전소에서 잘려 나온 한 갈래. 볼트를 봉인할 때 그대로 남았다. 연료를 태우며 낮게 웅웅거린다. 이곳의 나머지 전부가 여기에 매달려 있다.',
  'facilities.reactor.levels.1.summary': '용량 14kW. 하루 연료 1.1 소모.',
  'facilities.reactor.levels.2.summary': '용량 22kW. 하루 연료 1.6 소모.',
  'facilities.reactor.levels.3.summary': '용량 30kW. 하루 연료 2.1 소모.',

  'facilities.water_reclaimer.name': '정수기',
  'facilities.water_reclaimer.description':
    '지하층 대수층 침출수를 끌어올려 3단 여과로 밀어 넣는다. 3단은 한 번도 작동한 적이 없다.',
  'facilities.water_reclaimer.levels.1.summary': '인원이 있으면 하루 물 8 생산.',
  'facilities.water_reclaimer.levels.2.summary': '하루 물 11 생산. 이질 위험 절반.',
  'facilities.water_reclaimer.levels.3.summary': '하루 물 16 생산. 물이 충분히 깨끗해져 수인성 질병이 사라진다.',

  'facilities.galley.name': '취사장',
  'facilities.galley.description':
    '인덕션 두 구, 주워 온 압력솥, 그리고 존재하지도 않는 음식의 식단표를 누군가 계속 적어 두는 화이트보드.',
  'facilities.galley.levels.1.summary': '배급을 늘려 쓴다: 식량 효율 +22%. 부패 절반.',
  'facilities.galley.levels.2.summary': '식량 효율 +36%. 조리한 식사는 1인당 사기 +1.5.',
  'facilities.galley.levels.3.summary': '식량 효율 +50%. 1인당 사기 +3. 잉여분 보존.',

  'facilities.infirmary.name': '의무실',
  'facilities.infirmary.description':
    '바닥에 진료용 침대를 볼트로 박아 둔 창고 방. 캐비닛은 매주 조금씩 더 비어 간다.',
  'facilities.infirmary.levels.1.summary': '치료 가능. 환자는 하루 건강 +3 회복.',
  'facilities.infirmary.levels.2.summary': '치료 속도 +40%. 인원이 있으면 질병이 번지지 않는다.',
  'facilities.infirmary.levels.3.summary': '치료 속도 +80%. 치명상 수술 가능.',

  'facilities.workshop.name': '작업장',
  'facilities.workshop.description':
    '작업대와 바이스, 그리고 수공구가 걸린 벽. 두 자리가 비어 있다. 누군가 필요한 것만 챙겨 떠났다.',
  'facilities.workshop.levels.1.summary': '1등급 제작과 수리. 건설 노동 +25%. 하루 부품 1.2 분류.',
  'facilities.workshop.levels.2.summary': '2등급 제작. 노동 +50%. 하루 부품 2.1 분류. 분해 회수 +30%.',
  'facilities.workshop.levels.3.summary': '2등급 제작 속도 2배. 노동 +80%. 하루 부품 3.1 분류.',

  'facilities.bunks.name': '침상',
  'facilities.bunks.description':
    '초기 비축분에서 나온 접이식 침대틀. 각 자리 위에 마스킹테이프로 이름이 적혀 있다.',
  'facilities.bunks.levels.1.summary': '휴식 시 피로 추가 14 회복. 5명 수용.',
  'facilities.bunks.levels.2.summary': '휴식 시 피로 추가 20 회복. 9명 수용. 사기 하한 +1.',
  'facilities.bunks.levels.3.summary': '휴식 시 피로 추가 26 회복. 14명 수용. 사기 하한 +3.',

  'facilities.storage.name': '창고',
  'facilities.storage.description':
    '선반과 상자, 그리고 모두가 열쇠를 가진 자물쇠. 안 그런 척하다가 한 번 크게 싸웠다.',
  'facilities.storage.levels.1.summary': '저장 자원마다 보관량 +40. 부패 −20%.',
  'facilities.storage.levels.2.summary': '보관량 +80. 부패 −40%.',
  'facilities.storage.levels.3.summary': '보관량 +130. 부패 −65%. 대량 거래 사건 발생.',

  'facilities.radio_room.name': '무전실',
  'facilities.radio_room.description':
    '송수신기 한 대, 죽은 중계기 한 줄, 그리고 대부분 줄이 그어진 주파수 기록부.',
  'facilities.radio_room.levels.1.summary': '내일 날씨를 알려 준다. 먼 지점을 탐지한다. 접촉 사건이 열린다.',
  'facilities.radio_room.levels.2.summary': '한 번 탐지에 지점 2곳 발견. 거래·이방인 사건 2배.',
  'facilities.radio_room.levels.3.summary': '신호 삼각측량 가능. 청자 계열에 필수.',

  'facilities.laboratory.name': '연구실',
  'facilities.laboratory.description':
    '작업대 둘, 재물대가 금 간 현미경, 그리고 아무도 지우면 안 되는 화이트보드.',
  'facilities.laboratory.levels.1.summary': '연구 통찰을 생산한다. 대부분의 연구에 필요하다.',
  'facilities.laboratory.levels.2.summary': '통찰 +45%. 2등급 연구 개방.',
  'facilities.laboratory.levels.3.summary': '통찰 +90%. 3등급 연구와 시료 분석 개방.',

  'facilities.hydroponics.name': '수경 재배실',
  'facilities.hydroponics.description':
    '재배등 아래 층층이 쌓인 트레이. 누군가 기억에 의존해 배양액을 섞고 있다.',
  'facilities.hydroponics.levels.1.summary': '하루 식량 7 생산. 하루 물 2 소모.',
  'facilities.hydroponics.levels.2.summary': '하루 식량 12 생산. 물 3 소모.',
  'facilities.hydroponics.levels.3.summary': '하루 식량 18 생산. 물 4 소모. 심근성 품종 개방.',

  'facilities.security.name': '경비 초소',
  'facilities.security.description':
    '옛 경비실. 무기라 부를 만한 것을 걸어 두는 거치대와 죽은 카메라 네 대를 비추는 모니터가 있다.',
  'facilities.security.levels.1.summary': '기본 방어 8. 도난과 습격 피해 감소.',
  'facilities.security.levels.2.summary': '기본 방어 16. 사상자 없이 습격을 격퇴할 수 있다.',
  'facilities.security.levels.3.summary': '기본 방어 28. 대부분의 습격이 시작되기 전에 물러난다.',

  'facilities.surface_access.name': '지상 출입구',
  'facilities.surface_access.description':
    '보강한 비상계단. 안쪽에서만 잠기는 자물쇠를 달았다.',
  'facilities.surface_access.levels.1.summary': '1번 고리 개방. 1번 고리 이동 −1일. 폐소공포가 누그러진다.',
  'facilities.surface_access.levels.2.summary': '2번 고리 개방. 탐사 배낭 적재량 +4.',
  'facilities.surface_access.levels.3.summary': '차량고: 모든 이동 −1일. 수송대에 필수.',

  'facilities.machine_shop.name': '기계 공작실',
  'facilities.machine_shop.description':
    '선반과 프레스, 그리고 손으로 시동을 걸어야 해서 모두가 싫어하는 디젤 압축기.',
  'facilities.machine_shop.levels.1.summary': '3등급 제작. 하루에 고철 2를 부품 3으로 정련.',
  'facilities.machine_shop.levels.2.summary': '정련 2배. 시설 수리 비용 40% 감소.',
  'facilities.machine_shop.levels.3.summary': '수송대 계획 개방. 정련 3배.',

  'facilities.deep_archive.name': '심층 기록고',
  'facilities.deep_archive.description':
    '지하층 격벽 너머: 봉인된 캐비닛의 행렬, 아직 전원이 들어오는 판독기, 그리고 이쪽에서 잠긴 문.',
  'facilities.deep_archive.levels.1.summary': '3일마다 기록 조각 1개 회수. 메리디언 계열이 열린다.',
  'facilities.deep_archive.levels.2.summary': '2일마다 조각 1개. 연구 통찰 +25%.',
  'facilities.deep_archive.levels.3.summary': '하루에 조각 1개. 메리디언 결말에 필수.',
};
