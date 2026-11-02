# Scene art

The illustrations in `src/ui/art/` were generated with Codex's built-in image tool
(`image_gen`), one image per prompt at 1536×1024, then resized and re-encoded to WebP
(title 1600px wide, everything else 960px, quality 70). They are decorative only: every
`<img>` has an empty `alt`, and the text beside it carries the meaning.

To add or replace one, generate with the shared direction below plus the subject line,
save it as `src/ui/art/<name>.webp`, and the glob in `src/ui/art/index.ts` picks it up.
Names follow `event-<theme>`, `weather-<weatherId>`, `ending-<endingId>` and `title`.

## Shared direction

```
SHARED ART DIRECTION (apply to every image):
- Game: LAST LIGHT, a grim, quiet survival-management game. Survivors live in Vault Meridian, a decommissioned 1970s civil-defence bunker under an industrial suburb, after "the Quiet" — the power went out everywhere with no blast and no explanation. A city above is going cold.
- Medium: muted painterly digital illustration, like moody concept art; visible brush texture, subtle film grain. NOT photoreal, NOT cartoon, NOT anime.
- Palette: near-black blue-grey and desaturated teal shadows, with a single warm amber/sodium light source as accent (lamps, embers, indicator lights). Low saturation overall. Dark image overall (it sits on a #0a0c0d UI), but readable.
- Composition: wide landscape, main subject near the centre band so the image can be cropped to a thin horizontal strip. Lots of atmosphere; quiet, still, melancholic. Small distant human figures only when stated, seen from behind or in silhouette, never close-up faces.
- Absolutely NO text, letters, numbers, logos, signage text, UI, borders, frames or watermarks.
```

## Subjects

| File | Subject |
|---|---|
| `title` | A heavy round steel blast door at the bottom of a concrete stairwell, slightly ajar, a thin blade of warm amber light spilling onto wet steps; a cold dusk sky and dead industrial skyline above. |
| `event-onboarding` | First days in the vault: a cramped stores office inside the bunker, a steel desk with a clipboard manifest, a single hanging amber bulb, metal shelving half-stocked with crates and water drums fading into darkness. |
| `event-survival` | Scarcity: a bunker galley table with a few rationed tins, a measuring jug of water and a dented pot over a small flame, cold concrete walls, the feeling of counting what is left. |
| `event-social` | Crew life: a dim communal bunk room, several survivors seen from behind or in silhouette sitting close together around a camp lantern, one holding a battered acoustic guitar, bunks receding into shadow. |
| `event-facility` | The vault machinery: a narrow plant-room corridor of pipes, valves and humming electrical cabinets, one breaker panel open with a faint wisp of smoke, an amber warning lamp glowing, cables on the floor. |
| `event-radio` | The radio room: an old shortwave transceiver with a glowing amber dial and an oscilloscope trace, headphones resting on a desk covered in handwritten number groups on paper, darkness all around. |
| `event-strangers` | Someone at the door: looking up the bunker's concrete entry stairwell at night toward the closed outer hatch, a lone figure silhouetted at the top against cold grey fog, a torch beam cutting through the mist. |
| `event-medical` | The infirmary: a makeshift bunker sickbay with a single metal cot, an IV stand, a nearly empty medicine cabinet with a few glass bottles, a desk lamp throwing warm light on rolled bandages. |
| `event-environment` | The world above: a ruined, silent industrial suburb seen from the bunker's surface hatch, overturned cars, dead power lines, a heavy storm front rolling in from the west under a bruised sky. |
| `event-moral` | A hard choice: a single glass vial of medicine on an empty steel table under a hanging lamp, two empty chairs facing each other across it, long shadows, heavy stillness. |
| `event-chain` | Consequences: a worn logbook lying open on a desk beside a cold mug, a pencil and a pinned list of dates on a corkboard, faded strings connecting notes, lamplight and dust in the air. |
| `event-meridian` | The vault's secret: a hidden lower corridor behind a broken concrete wall, an old sealed government door with stencilled-over markings (no legible text), emergency strip lights glowing faint amber deep into the dark. |
| `weather-clear` | Weather - clear: the empty industrial skyline seen from ground level at a cold, clear day, pale weak sun through high haze, long shadows across cracked tarmac, silent and still. |
| `weather-overcast` | Weather - overcast: the empty industrial suburb under a flat, uniform grey sky, dull diffuse light, no shadows, dead streetlights and a rusted fence. |
| `weather-rain` | Weather - rain: steady cold rain over an abandoned street of terraced houses, puddles reflecting a grey sky, a rain-catchment barrel overflowing beside the bunker hatch. |
| `weather-storm` | Weather - storm: violent wind over the ruined suburb, debris and sheet metal flying, bent trees, dark churning clouds lit by a distant flash of lightning. |
| `weather-ash_fall` | Weather - ash fall: fine grey ash drifting down like snow over abandoned cars and rooftops, everything coated in grey, a muted orange glow behind the haze. |
| `weather-cold_snap` | Weather - cold snap: hard frost on everything, icicles hanging from a concrete stairwell rail, frozen puddles, breath-fog cold blue light with a warm glow from below. |
| `weather-fog` | Weather - fog: thick fog swallowing an empty street after twenty metres, a lamppost and a parked van fading into white-grey, eerie and quiet. |
| `weather-heat` | Weather - dry heat: unseasonable heat over the ruined suburb, a hazy bleached sky, heat shimmer above cracked dry tarmac, dead brown grass, a dry rain barrel. |
| `ending-silence` | Ending "Silence" - everyone is gone: an empty bunker bunk room, neatly made beds, a single lantern burned out, dust motes in a faint shaft of light, total stillness. |
| `ending-vault_fails` | Ending "The Vault Fails": the bunker reactor and machinery hall gone dark and cold, frost forming on dead pipes, the last amber indicator lamp flickering out, a fallen hard hat on the floor. |
| `ending-scattered` | Ending "Scattered" - the crew left one by one: the open bunker hatch at dawn, several separate sets of footprints in the ash leading away in different directions across the empty suburb. |
| `ending-deadline_missed` | Ending "The Road Closed": an empty highway on-ramp at dusk, fresh tyre tracks leading away into the distance, a convoy's tail lights long gone, a closed barrier and a lone survivor's silhouette left behind. |
| `ending-exodus` | Ending "Exodus": a small improvised convoy of an old truck and a bus with armour plates driving out of the ruined suburb at dawn along an empty road, headlights on, hopeful warm light on the horizon. |
| `ending-deep_root` | Ending "Deep Root" - self-sufficiency: a thriving underground hydroponic garden inside the bunker, rows of green plants under warm grow lamps, water dripping, survivors in silhouette tending them, calm and hopeful. |
| `ending-the_thaw` | Ending "The Thaw" - they lasted the winter: melting snow on the bunker's surface hatch, water dripping from icicles, the first pale green shoots through cracked concrete, soft spring morning light. |
| `ending-signal` | Ending "The Signal": a tall rusted radio tower on a hill to the west at night, survivors' silhouettes walking toward it, a faint amber light pulsing at the top, an immense quiet sky full of stars. |
| `ending-meridian` | Ending "Meridian" - the second door: a vast hidden chamber deep under the vault revealed by torchlight, rows of old sealed archive cabinets and a second immense round blast door, awe and dread. |
| `ending-last_light` | Ending "Last Light": a lone figure standing at the open surface hatch at dawn holding a lantern, looking out over the silent ruined city as the first warm sunlight breaks the horizon, bittersweet and resolute. |
