# Scene art

The scene illustrations in `src/ui/art/` were generated with Codex's built-in image tool
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

## Asset art

Items, facilities, sites and survivor portraits live in subfolders (`items/`, `facilities/`,
`locations/`, `portraits/`) named by content id. Items and portraits are 192px squares;
facilities and sites are 960px wide. Facilities and sites use the shared scene direction
above; items and portraits have their own:

### Items

```
SHARED ART DIRECTION (inventory item art for the game LAST LIGHT, a grim post-collapse bunker survival game):
- One single object, centred, filling about 70% of the frame, seen at a slight three-quarter angle, nothing else in the scene.
- Background: plain, flat near-black blue-grey (#101416), no table, no props, no floor, subtle vignette only.
- Medium: muted painterly digital illustration with visible brush texture, like a concept-art item sheet. Not photoreal, not cartoon, not 3D render, not flat vector.
- Lighting: soft warm amber key light from upper left, cool teal rim light on the right edge. Low saturation, worn and used, scuffed, improvised, 1970s-90s civil-defence era materials.
- Must read clearly as a small thumbnail: strong silhouette, simple shape.
- Absolutely NO text, letters, numbers, labels, logos, UI, borders, frames or watermarks.
```

### Portraits

```
SHARED ART DIRECTION (survivor portrait for the game LAST LIGHT, a grim post-collapse bunker survival game):
- Head-and-shoulders bust portrait of one ordinary person, face centred and filling the upper-middle of the frame, three-quarter view, looking slightly off-camera, tired but alive.
- Background: plain dark blue-grey (#141a1c), soft vignette, nothing else.
- Medium: muted painterly digital portrait with visible brush texture, like character concept art. Not photoreal, not cartoon, not anime.
- Lighting: warm amber key light from one side (like a lamp), cool teal shadow side. Low saturation.
- Clothes: worn, practical, layered, dusty; weeks underground without a proper wash.
- Absolutely NO text, letters, logos, UI, borders, frames or watermarks.
```

Portraits are a pool, not one per person: `portraits/<she|he|they>-<young|mid|old>-<n>.webp`,
five per group. `assignPortraits` matches a survivor to a group by pronouns and age (under 32,
under 52, older) and picks by `portraitSeed`, skipping faces already in the vault.

Two item prompts (lockpick set, trade goods) were refused by the image safety filter as
first written and were regenerated from more neutral descriptions.

### Subjects

| File | Subject |
|---|---|
| `items/pry_bar` | The item: Pry Bar. A metre of forged steel. Opens shutters, doors, and occasionally skulls. |
| `items/multitool` | The item: Multitool. Pliers, drivers, a blade that no longer locks. Solves a surprising number of problems. |
| `items/lockpick_set` | The item: Lockpick Set. Filed from hacksaw blades. Opens what pry bars destroy. |
| `items/bolt_cutters` | The item: Bolt Cutters. Nothing chained is safe. Heavy, loud, entirely worth it. |
| `items/welding_rig` | The item: Welding Rig. Portable gas set. Cuts through bulkheads and seals them again. |
| `items/geiger_wand` | The item: Geiger Wand. Clicks. Sometimes it does not, which is worse, because you stop trusting it. |
| `items/signal_meter` | The item: Signal Meter. Field strength and bearing. Built from a car radio and a great deal of patience. |
| `items/shovel` | The item: Shovel. For rubble, for planting, and for the other thing. |
| `items/pipe_club` | The item: Pipe Club. Scaffold tube wrapped in tape. Crude, silent, and effective at arm's length. |
| `items/machete` | The item: Machete. Clears brush, doors, and arguments. |
| `items/nail_bat` | The item: Nail Bat. Somebody put real thought into this, which is the unsettling part. |
| `items/fire_axe` | The item: Fire Axe. From a wall case with the glass already broken. |
| `items/crossbow` | The item: Crossbow. Slow to reload, quiet enough that only one thing hears it. |
| `items/service_pistol` | The item: Service Pistol. Nine millimetre, twelve in the magazine, and a serial number filed flat. |
| `items/hunting_rifle` | The item: Hunting Rifle. Bolt action. Reaches across a car park and does not miss twice. |
| `items/shotgun` | The item: Shotgun. Ends a stairwell argument in one syllable. |
| `items/stun_baton` | The item: Stun Baton. Charged from a battery cell. Non-lethal, which occasionally matters. |
| `items/padded_vest` | The item: Padded Vest. Layered canvas and closed-cell foam. Stops a knife, not much else. |
| `items/riot_plate` | The item: Riot Plate. Torso plate from a public-order kit. Heavy, and you will be glad of it once. |
| `items/respirator` | The item: Respirator. Half-face with fresh cartridges. Ash-fall stops being a problem. |
| `items/hazard_suit` | The item: Hazard Suit. Taped seams, a hood, and a smell that never washes out. |
| `items/work_gloves` | The item: Work Gloves. Reinforced palms. Fewer lacerations, better grip on wet rebar. |
| `items/helmet` | The item: Site Helmet. Scuffed yellow shell. Concussions become headaches. |
| `items/bandage` | The item: Bandage. Sterile dressing. Stops bleeding, if applied today. |
| `items/antiseptic` | The item: Antiseptic. Stings badly enough that people believe it is working. |
| `items/splint` | The item: Splint. Aluminium and padding. Sets a fracture so it knits straight. |
| `items/antibiotics` | The item: Antibiotics. Broad spectrum, past their date, still the difference between living and not. |
| `items/stimulant` | The item: Stimulant. Buys a day of alertness at tomorrow's expense. |
| `items/painkillers` | The item: Painkillers. Does nothing for the wound and everything for the person carrying it. |
| `items/blood_bag` | The item: Blood Bag. O-negative, cold-stored. There are four of these left in the district. |
| `items/surgical_kit` | The item: Surgical Kit. Clamps, sutures, a scalpel, and someone willing to use them. |
| `items/first_aid_kit` | The item: First Aid Kit. Everything for the first ten minutes, which are usually the ones that matter. |
| `items/rope_kit` | The item: Rope Kit. Forty metres of static line and three carabiners. Opens vertical routes. |
| `items/lantern` | The item: Lantern. Wind-up LED. Four hours of honest light, no fuel. |
| `items/pack_frame` | The item: Pack Frame. External aluminium frame. The difference between one trip and three. |
| `items/map_case` | The item: Map Case. Laminated district sheets, annotated by someone who did not come back. |
| `items/radio_beacon` | The item: Radio Beacon. Squawks a position on a fixed frequency. Someone at home has to be listening. |
| `items/water_skin` | The item: Water Skin. Four litres, carried on the hip. Extends a trip by a day. |
| `items/climbing_harness` | The item: Climbing Harness. With a rope kit, a collapsed stairwell stops being a wall. |
| `items/flare` | The item: Flare. Red, thirty seconds, visible for two kilometres. Everything sees it. |
| `items/crowbar_sled` | The item: Salvage Sled. A plastic tub on skis. Undignified, and it doubles what you can drag home. |
| `items/battery_cell` | The item: Battery Cell. Charged lithium pack. Powers a tool, or a night of light. |
| `items/water_filter` | The item: Water Filter. Ceramic and carbon. Turns a puddle into something you can keep down. |
| `items/ration_pack` | The item: Ration Pack. Three thousand calories in a foil brick. Nobody enjoys it. Everybody wants one. |
| `items/fuel_canister` | The item: Fuel Canister. Twenty litres, sealed. Heavy, volatile, and the reason the lights stay on. |
| `items/spare_parts` | The item: Spare Parts. A bag of the specific fixings you always turn out to need. |
| `items/seed_tray` | The item: Seed Tray. Viable seed stock. Worth more than its weight in almost anything. |
| `items/trade_goods` | The item: Trade Goods. Cigarettes, batteries, soap. Currency, in every settlement still standing. |
| `items/ammo_box` | The item: Ammunition Box. Mixed calibre, badly sorted, extremely welcome. |
| `items/tarpaulin` | The item: Tarpaulin. Keeps ash off the trays and rain off the stair head. |
| `items/gas_mask_filters` | The item: Filter Cartridges. Sealed pair. A respirator without these is a costume. |
| `items/field_notes` | The item: Field Notes. Somebody catalogued what they saw out there. Their handwriting deteriorates. |
| `items/data_slate` | The item: Data Slate. Ruggedised reader with a partial archive on it. Needs power to talk. |
| `items/meridian_key` | The item: Meridian Key. A brass-and-ceramic token stamped with a facility code that is not this one. |
| `items/signal_recorder` | The item: Signal Recorder. Captures a transmission for later analysis. It records more than you hear. |
| `facilities/reactor` | A room inside the bunker vault: Reactor Stub. A truncated arm of the district plant, left behind when the vault was sealed. It burns fuel and hums. Everything else here depends on it. Show the room itself, no people or only one small silhouette at most. |
| `facilities/water_reclaimer` | A room inside the bunker vault: Water Reclaimer. Draws from the aquifer seep in the sub-level and pushes it through three stages of filtration. The third stage has never worked. Show the room itself, no people or only one small silhouette at most. |
| `facilities/galley` | A room inside the bunker vault: Galley. Two induction rings, a scavenged pressure cooker, and a whiteboard where someone keeps writing menus for food that does not exist. Show the room itself, no people or only one small silhouette at most. |
| `facilities/infirmary` | A room inside the bunker vault: Infirmary. A store room with a examination couch bolted to the floor and a cabinet that is emptier every week. Show the room itself, no people or only one small silhouette at most. |
| `facilities/workshop` | A room inside the bunker vault: Workshop. Bench, vice, and a wall of hand tools with two gaps where someone took what they needed and left. Show the room itself, no people or only one small silhouette at most. |
| `facilities/bunks` | A room inside the bunker vault: Bunks. Fold-down frames from the original stores. Someone has written names on masking tape above each one. Show the room itself, no people or only one small silhouette at most. |
| `facilities/storage` | A room inside the bunker vault: Storage. Racking, crates, and a padlock that everyone has a key to because pretending otherwise caused a fight. Show the room itself, no people or only one small silhouette at most. |
| `facilities/radio_room` | A room inside the bunker vault: Radio Room. A transceiver, a bank of dead repeaters, and a logbook of frequencies with most entries crossed out. Show the room itself, no people or only one small silhouette at most. |
| `facilities/laboratory` | A room inside the bunker vault: Laboratory. Two benches, a microscope with a cracked stage, and a whiteboard nobody is allowed to wipe. Show the room itself, no people or only one small silhouette at most. |
| `facilities/hydroponics` | A room inside the bunker vault: Hydroponics. Stacked trays under grow lamps, running on nutrient solution someone is mixing from memory. Show the room itself, no people or only one small silhouette at most. |
| `facilities/security` | A room inside the bunker vault: Security Post. The old guard station, with a rack for whatever passes as arms and a monitor showing four dead cameras. Show the room itself, no people or only one small silhouette at most. |
| `facilities/surface_access` | A room inside the bunker vault: Surface Access. The service stair, re-shored and fitted with a lock that works from the inside only. Show the room itself, no people or only one small silhouette at most. |
| `facilities/machine_shop` | A room inside the bunker vault: Machine Shop. A lathe, a press, and a diesel compressor that has to be started by hand and hated by everyone. Show the room itself, no people or only one small silhouette at most. |
| `facilities/deep_archive` | A room inside the bunker vault: Deep Archive. Behind the sub-level bulkhead: rows of sealed cabinets, a reader that still powers up, and a door that was locked from this side. Show the room itself, no people or only one small silhouette at most. |
| `locations/apartment_block` | A scavenging site on the silent surface above the bunker: Apartment Block. Six floors of front doors, most of them already open. Exterior or interior establishing shot, empty of people. |
| `locations/corner_shop` | A scavenging site on the silent surface above the bunker: Corner Shop. Shutters down, back door open. Somebody was methodical about the cigarettes. Exterior or interior establishing shot, empty of people. |
| `locations/garden_centre` | A scavenging site on the silent surface above the bunker: Garden Centre. Glasshouses with the panes intact, and something still growing in tray nine. Exterior or interior establishing shot, empty of people. |
| `locations/car_park` | A scavenging site on the silent surface above the bunker: Sunken Car Park. Three levels down, no light, and four hundred vehicles nobody came back for. Exterior or interior establishing shot, empty of people. |
| `locations/church` | A scavenging site on the silent surface above the bunker: Church. Candles burned down to the holders. Someone has been writing names on the wall. Exterior or interior establishing shot, empty of people. |
| `locations/filling_station` | A scavenging site on the silent surface above the bunker: Filling Station. Pumps dead, tanks below. Getting at them is the entire problem. Exterior or interior establishing shot, empty of people. |
| `locations/supermarket` | A scavenging site on the silent surface above the bunker: Supermarket. Aisles stripped at head height and untouched at floor level, where nobody looked. Exterior or interior establishing shot, empty of people. |
| `locations/clinic` | A scavenging site on the silent surface above the bunker: Clinic. Waiting room chairs pushed to the walls to make space for what came after. Exterior or interior establishing shot, empty of people. |
| `locations/hardware_store` | A scavenging site on the silent surface above the bunker: Hardware Store. Someone took the power tools. Everything that matters is still on the racks. Exterior or interior establishing shot, empty of people. |
| `locations/school` | A scavenging site on the silent surface above the bunker: School. Assembly hall converted to a shelter, then abandoned in a hurry. Exterior or interior establishing shot, empty of people. |
| `locations/police_station` | A scavenging site on the silent surface above the bunker: Police Station. The armoury door is a foot of steel. The evidence store is not. Exterior or interior establishing shot, empty of people. |
| `locations/warehouse` | A scavenging site on the silent surface above the bunker: Warehouse. Racking to the roof. Most pallets are shrink-wrapped office furniture. Exterior or interior establishing shot, empty of people. |
| `locations/subway_station` | A scavenging site on the silent surface above the bunker: Subway Station. Water at the platform edge. The tunnels run further than the map admits. Exterior or interior establishing shot, empty of people. |
| `locations/bus_depot` | A scavenging site on the silent surface above the bunker: Bus Depot. Forty vehicles, four of them stripped, and a workshop pit full of useful things. Exterior or interior establishing shot, empty of people. |
| `locations/quarantine_tent` | A scavenging site on the silent surface above the bunker: Quarantine Post. Field hospital sheeting, still standing, with the flaps tied shut from outside. Exterior or interior establishing shot, empty of people. |
| `locations/hospital` | A scavenging site on the silent surface above the bunker: Hospital. Eleven floors. The generators ran for six days, and the records say what happened on the seventh. Exterior or interior establishing shot, empty of people. |
| `locations/factory` | A scavenging site on the silent surface above the bunker: Factory. Machine tools worth their weight in anything, if you can move them. Exterior or interior establishing shot, empty of people. |
| `locations/water_treatment` | A scavenging site on the silent surface above the bunker: Water Treatment Plant. Settling tanks, chlorine drums, and a control room with the log still open. Exterior or interior establishing shot, empty of people. |
| `locations/radio_tower` | A scavenging site on the silent surface above the bunker: Radio Tower. Two hundred metres of lattice, and a shack at the base whose door was welded shut. Exterior or interior establishing shot, empty of people. |
| `locations/military_checkpoint` | A scavenging site on the silent surface above the bunker: Military Checkpoint. Concrete blocks, a burnt vehicle, and crates that were never distributed. Exterior or interior establishing shot, empty of people. |
| `locations/data_centre` | A scavenging site on the silent surface above the bunker: Data Centre. Halon-flooded and sealed. The racks are dead. One console is not. Exterior or interior establishing shot, empty of people. |
| `locations/grain_silo` | A scavenging site on the silent surface above the bunker: Grain Silo. Four hundred tonnes of barley, and a ladder that has already killed somebody. Exterior or interior establishing shot, empty of people. |
| `locations/collapsed_tunnel` | A scavenging site on the silent surface above the bunker: Collapsed Tunnel. A hundred metres of it came down. Whatever is past it has been quiet for weeks. Exterior or interior establishing shot, empty of people. |
| `locations/unknown_signal` | A scavenging site on the silent surface above the bunker: Unknown Signal. Something is transmitting from here on a band nobody licensed. Exterior or interior establishing shot, empty of people. |
| `locations/meridian_hatch` | A scavenging site on the silent surface above the bunker: Meridian Access Hatch. A hatch with the same stencilling as your own blast door, and a different facility code. Exterior or interior establishing shot, empty of people. |
| `portraits/she-young-0` | a woman in their early-to-mid 20s, White Southern European, wearing a hand-knitted jumper under a canvas coat, a grown-out buzz cut. |
| `portraits/she-young-1` | a woman in their early-to-mid 20s, Eastern European, wearing a faded boiler suit, round wire glasses. |
| `portraits/she-young-2` | a woman in their early-to-mid 20s, Southeast Asian, wearing a padded work jacket, hair tied back. |
| `portraits/she-young-3` | a woman in their early-to-mid 20s, mixed-heritage, wearing a faded boiler suit, freckles. |
| `portraits/she-young-4` | a woman in their early-to-mid 20s, Afro-Caribbean, wearing a faded boiler suit, round wire glasses. |
| `portraits/she-mid-0` | a woman in their late 30s to 40s, Middle Eastern, wearing a worn denim jacket, round wire glasses. |
| `portraits/she-mid-1` | a woman in their late 30s to 40s, Afro-Caribbean, wearing a padded work jacket, freckles. |
| `portraits/she-mid-2` | a woman in their late 30s to 40s, Middle Eastern, wearing a faded boiler suit, dark circles under the eyes. |
| `portraits/she-mid-3` | a woman in their late 30s to 40s, South Asian, wearing a scrubs top under a fleece, a small earring. |
| `portraits/she-mid-4` | a woman in their late 30s to 40s, Eastern European, wearing an old wool coat with the collar up, a healed scar on the cheek. |
| `portraits/she-old-0` | a woman in their 60s, mixed-heritage, wearing an old wool coat with the collar up, a grown-out buzz cut. |
| `portraits/she-old-1` | a woman in their 60s, East Asian, wearing a scrubs top under a fleece, a healed scar on the cheek. |
| `portraits/she-old-2` | a woman in their 60s, Southeast Asian, wearing a hand-knitted jumper under a canvas coat, short cropped hair. |
| `portraits/she-old-3` | a woman in their 60s, Middle Eastern, wearing a hand-knitted jumper under a canvas coat, freckles. |
| `portraits/she-old-4` | a woman in their 60s, South Asian, wearing an old wool coat with the collar up, short cropped hair. |
| `portraits/he-young-0` | a man in their early-to-mid 20s, Southeast Asian, wearing a hand-knitted jumper under a canvas coat, round wire glasses, a moustache. |
| `portraits/he-young-1` | a man in their early-to-mid 20s, mixed-heritage, wearing a scrubs top under a fleece, hair tied back, clean-shaven. |
| `portraits/he-young-2` | a man in their early-to-mid 20s, Southeast Asian, wearing a padded work jacket, dark circles under the eyes, clean-shaven. |
| `portraits/he-young-3` | a man in their early-to-mid 20s, mixed-heritage, wearing a scrubs top under a fleece, a grey streak in the hair, a moustache. |
| `portraits/he-young-4` | a man in their early-to-mid 20s, Middle Eastern, wearing a military surplus field jacket, a grey streak in the hair, a moustache. |
| `portraits/he-mid-0` | a man in their late 30s to 40s, Latin American, wearing a military surplus field jacket, short cropped hair, stubble. |
| `portraits/he-mid-1` | a man in their late 30s to 40s, Black African, wearing a scrubs top under a fleece, round wire glasses, a moustache. |
| `portraits/he-mid-2` | a man in their late 30s to 40s, White Northern European, wearing a flannel shirt and a quilted gilet, a grey streak in the hair, a short beard. |
| `portraits/he-mid-3` | a man in their late 30s to 40s, North African, wearing a turtleneck and a scarf, short cropped hair, a moustache. |
| `portraits/he-mid-4` | a man in their late 30s to 40s, South Asian, wearing a padded work jacket, freckles, a thick grey-flecked beard. |
| `portraits/he-old-0` | a man in their 60s, Black African, wearing a military surplus field jacket, a woollen beanie, a thick grey-flecked beard. |
| `portraits/he-old-1` | a man in their 60s, Middle Eastern, wearing a faded boiler suit, a small earring, clean-shaven. |
| `portraits/he-old-2` | a man in their 60s, Southeast Asian, wearing an old wool coat with the collar up, hair tied back, a short beard. |
| `portraits/he-old-3` | a man in their 60s, North African, wearing a military surplus field jacket, dark circles under the eyes, a thick grey-flecked beard. |
| `portraits/he-old-4` | a man in their 60s, mixed-heritage, wearing a turtleneck and a scarf, round wire glasses, clean-shaven. |
| `portraits/they-young-0` | an androgynous person whose gender is not obvious in their early-to-mid 20s, White Northern European, wearing a turtleneck and a scarf, a headlamp pushed up on the forehead. |
| `portraits/they-young-1` | an androgynous person whose gender is not obvious in their early-to-mid 20s, Eastern European, wearing a padded work jacket, a healed scar on the cheek. |
| `portraits/they-young-2` | an androgynous person whose gender is not obvious in their early-to-mid 20s, North African, wearing a hi-vis vest over a hoodie, a small earring. |
| `portraits/they-young-3` | an androgynous person whose gender is not obvious in their early-to-mid 20s, mixed-heritage, wearing a turtleneck and a scarf, short cropped hair. |
| `portraits/they-young-4` | an androgynous person whose gender is not obvious in their early-to-mid 20s, North African, wearing a worn denim jacket, a small earring. |
| `portraits/they-mid-0` | an androgynous person whose gender is not obvious in their late 30s to 40s, White Southern European, wearing a faded boiler suit, a grey streak in the hair. |
| `portraits/they-mid-1` | an androgynous person whose gender is not obvious in their late 30s to 40s, White Southern European, wearing a hand-knitted jumper under a canvas coat, dark circles under the eyes. |
| `portraits/they-mid-2` | an androgynous person whose gender is not obvious in their late 30s to 40s, South Asian, wearing a turtleneck and a scarf, a healed scar on the cheek. |
| `portraits/they-mid-3` | an androgynous person whose gender is not obvious in their late 30s to 40s, Afro-Caribbean, wearing a hi-vis vest over a hoodie, a woollen beanie. |
| `portraits/they-mid-4` | an androgynous person whose gender is not obvious in their late 30s to 40s, North African, wearing a scrubs top under a fleece, a grown-out buzz cut. |
| `portraits/they-old-0` | an androgynous person whose gender is not obvious in their 60s, Middle Eastern, wearing a turtleneck and a scarf, round wire glasses. |
| `portraits/they-old-1` | an androgynous person whose gender is not obvious in their 60s, Black African, wearing a turtleneck and a scarf, a grown-out buzz cut. |
| `portraits/they-old-2` | an androgynous person whose gender is not obvious in their 60s, Southeast Asian, wearing a hi-vis vest over a hoodie, a woollen beanie. |
| `portraits/they-old-3` | an androgynous person whose gender is not obvious in their 60s, Middle Eastern, wearing a flannel shirt and a quilted gilet, short cropped hair. |
| `portraits/they-old-4` | an androgynous person whose gender is not obvious in their 60s, North African, wearing a worn denim jacket, hair tied back. |
