import type { ContentBundle } from '../../../types';

/**
 * 자원 · 날씨 · 난이도 · 상태 · 기술.
 *
 * 게임 전반에서 가장 자주 눈에 들어오는 짧은 문자열들이라 용어를 여기서 확정한다.
 * 이후 다른 파일들은 이 용어를 따른다: components 부품, hope 희망, seep 침출수,
 * reclaimer 정수기, reactor stub 원자로 잔편, vault 볼트.
 */
export const KO_CORE: ContentBundle = {
  /* ------------------------------------------------------------------ 자원 */
  'resources.water.name': '물',
  'resources.water.summary':
    '마실 수 있는 물. 정수기가 대수층 침출수를 끌어올리지만, 전력이 있을 때만이다.',
  'resources.water.failure': '탈수는 굶주림보다 빨리 죽인다. 마르면 하루 만에 건강이 급격히 떨어진다.',
  'resources.food.name': '식량',
  'resources.food.summary': '배급, 통조림, 그리고 수경 재배가 내주는 것. 냉장 없이는 상한다.',
  'resources.food.failure': '허기가 오르고, 사기가 무너지고, 그다음 건강이 따라 내려간다.',
  'resources.power.name': '전력',
  'resources.power.summary':
    '원자로 잔편이 매일 만들고 시설이 끌어 쓴다. 축전지가 없으면 남는 만큼은 그냥 사라진다.',
  'resources.power.failure': '우선순위가 낮은 시설부터 정전된다. 어두운 볼트는 희망을 빨리 잃는다.',
  'resources.medicine.name': '의약품',
  'resources.medicine.summary': '소독제, 항생제, 붕대. 부상과 질병을 다루는 데 쓰인다.',
  'resources.medicine.failure': '상처가 곪는다. 방치된 감염은 대개 일주일 안에 사람을 죽인다.',
  'resources.components.name': '부품',
  'resources.components.summary': '주워 온 전선, 철판, 모터, 체결구. 무언가를 짓는 모든 일의 화폐다.',
  'resources.components.failure': '볼트는 더 자라지 않고, 때우는 속도보다 빨리 낡기 시작한다.',
  'resources.fuel.name': '연료',
  'resources.fuel.summary': '경유와 정제 탄화수소. 원자로 잔편이 태우고, 움직이는 모든 것이 태운다.',
  'resources.fuel.failure': '연료가 없으면 전력도 없고, 차를 몰고 나갈 방법도 없다.',
  'resources.ammo.name': '탄약',
  'resources.ammo.summary': '구경이 뒤섞여 있다. 총기는 이것이 남아 있는 동안만 무게값을 한다.',
  'resources.ammo.failure': '원정대는 칼과 운에 의지하게 된다.',
  'resources.hope.name': '희망',
  'resources.hope.summary':
    '볼트가 내일에 대해 함께 믿고 있는 것. 어려운 결정이 깎고, 지킨 약속이 되돌린다.',
  'resources.hope.failure': '0이 되면 사람들은 지시를 듣지 않는다. 그다음에는 머물지도 않는다.',

  /* ------------------------------------------------------------------ 날씨 */
  'weather.clear.name': '맑음',
  'weather.clear.description': '연무 사이로 드는 찬 햇빛. 지금으로서는 이만하면 좋은 날이다.',
  'weather.overcast.name': '흐림',
  'weather.overcast.description': '납작한 잿빛. 돕지도, 방해하지도 않는다.',
  'weather.rain.name': '비',
  'weather.rain.description': '꾸준하고 차갑다. 집수조는 차고, 거리는 차지 않는다.',
  'weather.storm.name': '폭풍',
  'weather.storm.description': '잔해를 밀 만큼 센 바람. 오늘 위로 올라갈 사람은 없어야 한다.',
  'weather.ash_fall.name': '재',
  'weather.ash_fall.description': '고운 회색이 모든 것에 내려앉는다. 필터로도, 폐로도 들어간다.',
  'weather.cold_snap.name': '한파',
  'weather.cold_snap.description': '계단참에 성에가 앉았다. 원자로도 사람도 더 힘을 쓴다.',
  'weather.fog.name': '안개',
  'weather.fog.description': '시야 이십 미터. 좋은 엄폐다. 다른 것들에게도 그렇다.',
  'weather.heat.name': '건열',
  'weather.heat.description': '철에 맞지 않게 덥고 바람이 없다. 침출이 느려지고 성미가 짧아진다.',

  /* ---------------------------------------------------------------- 난이도 */
  'difficulties.dim.name': '희미함',
  'difficulties.dim.description':
    '체계를 익히기 위한 난이도. 비축이 넉넉하고 부상이 관대하며, 실수는 사람이 아니라 하루를 잃는 정도로 끝난다. 더 쉬운 이야기가 아니라, 같은 이야기를 읽을 여유가 있는 쪽이다.',
  'difficulties.overcast.name': '흐림',
  'difficulties.overcast.description':
    '의도된 난이도. 비축은 예정대로 바닥나고, 원정은 실제로 위험하며, 대개는 — 항상은 아니고 — 빠져나갈 길이 있다.',
  'difficulties.blackout.name': '정전',
  'difficulties.blackout.description':
    '체계를 아는 사람을 위한 난이도. 비축은 얇고, 사건은 가혹하고, 마모는 빠르고, 합류하려는 사람은 적다. 초반에 한 명을 잃으면 대개 그것으로 결정된다.',
  'difficulties.absolute.name': '완전',
  'difficulties.absolute.description':
    '대부분의 회차는 끝난다. 여유가 얇아서 날씨 한 번이 치명적일 수 있고, 지도가 필요한 것을 늘 품고 있지도 않다. 여기서 엔딩에 닿는 것은 그 자체로 성취다.',

  /* ------------------------------------------------------------------ 상태 */
  'conditions.laceration.name': '열상',
  'conditions.laceration.description': '깊게 베였다. 아프고, 더디고, 감염이 들어오는 문이다.',
  'conditions.bleeding.name': '출혈',
  'conditions.bleeding.description': '저절로 멎지 않는다. 내일이 아니라 오늘 압박하고 싸매야 한다.',
  'conditions.fracture.name': '골절',
  'conditions.fracture.description': '뼈다. 부목을 대면 두 주면 붙는다. 대지 않으면 제대로 붙지 않는다.',
  'conditions.concussion.name': '뇌진탕',
  'conditions.concussion.description': '말이 뭉개지고 메스껍고, 자기는 괜찮다고 우긴다.',
  'conditions.burn.name': '화상',
  'conditions.burn.description': '화학이든 열이든. 잘 낫지 않고 계속 아프다.',
  'conditions.crush_injury.name': '압좌상',
  'conditions.crush_injury.description': '무거운 것이 내려왔다. 여기 누구도 볼 수 없는 내부 손상.',
  'conditions.sprain.name': '염좌',
  'conditions.sprain.description': '가볍다. 쓰지 않고 두면 알아서 낫는다.',
  'conditions.gunshot.name': '총상',
  'conditions.gunshot.description': '운이 좋으면 관통. 나쁘면 수술이 필요하다.',
  'conditions.infection.name': '감염',
  'conditions.infection.description': '상처가 뜨거워졌다. 항생제 아니면 절단인데, 둘 중 하나는 있다.',
  'conditions.sepsis.name': '패혈증',
  'conditions.sepsis.description': '전신으로 갔다. 수술로 대응하지 않으면 이것이 마지막 단계다.',
  'conditions.fever.name': '발열',
  'conditions.fever.description': '아무것도 아닐 수 있다. 볼트가 감당 못 할 무언가의 시작일 수도 있다.',
  'conditions.dysentery.name': '이질',
  'conditions.dysentery.description': '물은 계기가 말한 만큼 깨끗하지 않았다. 좁은 곳에서 빨리 번진다.',
  'conditions.pneumonia.name': '폐렴',
  'conditions.pneumonia.description': '젖은 호흡과 잿빛 얼굴. 온기와 휴식과 항생제가 필요하다.',
  'conditions.food_poisoning.name': '식중독',
  'conditions.food_poisoning.description': '창고의 무언가가 상했다. 불쾌하고, 짧고, 좀처럼 죽지는 않는다.',
  'conditions.malnutrition.name': '영양실조',
  'conditions.malnutrition.description': '며칠씩 모자랐다. 이것이 있는 동안 나머지 전부가 나빠진다.',
  'conditions.dust_sickness.name': '분진증',
  'conditions.dust_sickness.description': '재에 오래 노출됐다. 가시지 않는 그렁거리는 기침.',
  'conditions.hypothermia.name': '저체온증',
  'conditions.hypothermia.description': '추위에 너무 오래 있었다. 혼란해지고, 느려지고, 멈춘다.',
  'conditions.grieving.name': '애도',
  'conditions.grieving.description': '누군가 없다. 일은 할 수 있지만, 좋은 일은 아니다.',
  'conditions.breakdown.name': '붕괴',
  'conditions.breakdown.description': '침상을 떠나지 않는다. 오늘은 말이 통하지 않는다.',
  'conditions.exposure.name': '노출',
  'conditions.exposure.description': '지상에서의 나쁜 하루로 바람에 타고 탈수됐다.',

  /* ------------------------------------------------------------------ 기술 */
  'skills.medicine.name': '의술',
  'skills.engineering.name': '기계',
  'skills.combat.name': '전투',
  'skills.scavenging.name': '수색',
  'skills.cooking.name': '조리',
  'skills.science.name': '과학',
  'skills.botany.name': '식물',
  'skills.negotiation.name': '교섭',
};
