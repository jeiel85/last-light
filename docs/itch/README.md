# itch.io 등록 안내

## 업로드 파일 만들기

```bash
npm run pack:itch
```

`release/last-light-itch.zip`이 생깁니다. 압축 루트에 `index.html`이 있고 `dist/`와 같은 파일입니다.
빌드는 상대 경로(`./assets/...`)로 만들어지므로 셸에 `LASTLIGHT_BASE`가 설정돼 있으면 안 됩니다
(설정돼 있으면 스크립트가 절대 경로를 발견하고 멈춥니다).

## 프로젝트 설정 (Create new project)

| 항목 | 값 |
|---|---|
| Title | LAST LIGHT |
| Kind of project | **HTML** |
| Uploads | `last-light-itch.zip` 업로드 후 **This file will be played in the browser** 체크 |
| Embed options → Viewport dimensions | 1280 × 800 (1200px 이상이라 데스크톱 3단 레이아웃으로 열림) |
| Embed options | **Mobile friendly** 체크(Orientation: Default — 세로·가로 모두 지원), **Fullscreen button** 체크, **Automatically start on page load** 켜도 됨(소리는 기본 꺼짐) |
| Classification | Games · Strategy |
| Tags | `survival`, `management`, `roguelite`, `post-apocalyptic`, `narrative`, `text-based`, `strategy`, `singleplayer`, `turn-based`, `base-building` |
| Release status | Released |
| Pricing | No payments (원하면 Donate) |
| Cover image | [`cover.jpg`](cover.jpg) (630×500) |
| Screenshots | `docs/screenshots/`의 dashboard, crew, base, map, research, mobile-dashboard |

## 게임 동작 메모

- itch.io는 게임을 다른 도메인(itch.zone)의 iframe 안에서 실행합니다. 이 게임에는 공유 링크·초대 링크·클립보드 복사·전체 화면 API를 쓰는 기능이 없어 iframe용 분기가 필요 없습니다. 전체 화면은 itch의 Fullscreen 버튼을 씁니다.
- 저장(IndexedDB, 막히면 localStorage)은 itch.zone 쪽 브라우저 저장소에 따로 저장되므로 **웹 버전(GitHub Pages)의 세이브와 공유되지 않습니다.** 옮기려면 **Saves → Export / Import** 파일을 쓰면 됩니다.
- 브라우저가 iframe 저장소를 막으면 게임은 그대로 실행되고 저장만 되지 않습니다.
- 서비스 워커(오프라인 캐시)는 itch iframe에서도 등록을 시도합니다. 브라우저가 거부해도 게임 실행에는 영향이 없습니다.
- 언어는 영어로 시작하고 **Settings**에서 한국어로 바꿀 수 있습니다.

## 페이지 소개문 (그대로 붙여 넣기)

```
LAST LIGHT is a survival-management roguelite you play in the browser.

Eleven weeks ago the world went quiet. You command a handful of survivors inside Vault Meridian, an abandoned civil-defence facility, and every day you decide who works, what gets built, what gets researched, and who goes up the stair. Every night the vault produces and consumes, people get hungry and tired, machines wear out, and the world asks you a question you would rather not answer.

A run lasts 20–60 days and ends in one of ten ways. Save and resume at any point.

THE LOOP
• Plan the morning — assign people to facilities, to rest, or to nothing
• Spend — build, upgrade, repair, craft and research; every cost is charged up front
• Go outside — form an expedition, pack it, and read the forecast before committing
• End the day — production and consumption resolve, needs advance, machines decay
• Answer — the night brings events, each a choice with a stated price
• Live with it — consequences land now, three days later, or at the ending

FEATURES
• Survivors with names, skills, traits, injuries and relationships — and the capacity to break
• A three-deck base to build, upgrade, repair and power by priority
• A radial map of three rings, with danger and knowledge per site
• 38 research nodes across seven branches
• 127 events, 46 expedition encounters and 43 lore fragments — the catastrophe is pieced together from radio fragments, documents and contradicting theories
• 6 scenarios and 4 difficulty levels; a Legacy profile carries unlocks between runs
• Every derived number opens into the terms that produced it; risk is shown before you take it
• Works on desktop, tablet and phone (the interface is reorganised for small screens)
• Accessibility: reduced motion, high contrast, four text sizes, numeric gauges, full keyboard play
• English and 한국어
• No accounts, no servers, no analytics — saves stay in your browser

CONTROLS
Mouse or touch. Keyboard: 1–7 switch panels · Esc closes a dialog · Tab / Shift+Tab move focus · Enter / Space activate.

All visuals are generated from code (CSS and SVG) and all audio is synthesised — there are no image or sound assets.

Source code (MIT): https://github.com/jeiel85/last-light
```
