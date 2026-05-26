import { useMemo, useState } from "react";

type EmojiItem = { e: string; n: string };
type Category = { id: string; label: string; items: EmojiItem[] };

const CATEGORIES: Category[] = [
  {
    id: "smileys",
    label: "Smileys & People",
    items: [
      ["😀","grinning"],["😃","smiley"],["😄","smile"],["😁","beaming"],["😆","laughing"],["😅","sweat smile"],["🤣","rofl"],["😂","joy"],["🙂","slight smile"],["🙃","upside down"],["🫠","melting"],["😉","wink"],
      ["😊","blush"],["😇","innocent"],["🥰","loved"],["😍","heart eyes"],["🤩","star struck"],["😘","kiss"],["😗","kissing"],["☺️","smiling"],["😚","kiss closed"],["😙","kiss smile"],["🥲","tear smile"],["😋","yum"],
      ["😛","tongue"],["😜","wink tongue"],["🤪","zany"],["😝","squint tongue"],["🤑","money"],["🤗","hug"],["🤭","hand over mouth"],["🫢","gasp"],["🫣","peek"],["🤫","shush"],["🤔","thinking"],["🫡","salute"],
      ["🤐","zipper"],["🤨","raised brow"],["😐","neutral"],["😑","expressionless"],["😶","no mouth"],["🫥","dotted"],["😏","smirk"],["😒","unamused"],["🙄","eye roll"],["😬","grimace"],["🤥","lying"],["🫨","shaking"],
      ["😌","relieved"],["😔","pensive"],["😪","sleepy"],["🤤","drool"],["😴","sleep"],["😷","mask"],["🤒","thermometer"],["🤕","bandage"],["🤢","nauseated"],["🤮","vomit"],["🤧","sneeze"],["🥵","hot"],
      ["🥶","cold"],["🥴","woozy"],["😵","dizzy"],["🤯","mind blown"],["🤠","cowboy"],["🥳","party"],["🥸","disguise"],["😎","cool"],["🤓","nerd"],["🧐","monocle"],["😕","confused"],["🫤","diagonal"],
      ["😟","worried"],["🙁","frown"],["☹️","sad"],["😮","open mouth"],["😯","hushed"],["😲","astonished"],["😳","flushed"],["🥺","pleading"],["🥹","holding tears"],["😦","frown open"],["😧","anguished"],["😨","fearful"],
      ["😰","anxious"],["😥","sad relief"],["😢","cry"],["😭","sob"],["😱","scream"],["😖","confounded"],["😣","persevere"],["😞","disappointed"],["😓","sweat"],["😩","weary"],["😫","tired"],["🥱","yawn"],
      ["😤","triumph"],["😡","rage"],["😠","angry"],["🤬","cursing"],["😈","devil"],["👿","imp"],["💀","skull"],["☠️","skull crossbones"],["💩","poop"],["🤡","clown"],["👹","ogre"],["👺","goblin"],
      ["👻","ghost"],["👽","alien"],["👾","invader"],["🤖","robot"],["🎃","jack o lantern"],["🙌","raised hands"],["👏","clap"],["🙏","pray"],["👍","thumbs up"],["👎","thumbs down"],["👌","ok"],["✌️","victory"],
      ["🤞","crossed"],["🤟","love you"],["🤘","rock"],["🤙","call me"],["👈","left"],["👉","right"],["👆","up"],["👇","down"],["☝️","point up"],["✋","raised hand"],["🤚","back hand"],["🖐️","splayed"],
      ["🖖","spock"],["👋","wave"],["🤝","handshake"],["💪","muscle"],["🦾","mech arm"],["🫶","heart hands"],["🫰","fingers"],["🤲","palms up"],["🙋","raising hand"],["🙇","bow"],["🤦","facepalm"],["🤷","shrug"],
    ].map(([e,n])=>({e,n})),
  },
  {
    id: "nature",
    label: "Animals & Nature",
    items: [
      ["🐶","dog"],["🐱","cat"],["🐭","mouse"],["🐹","hamster"],["🐰","rabbit"],["🦊","fox"],["🐻","bear"],["🐼","panda"],["🐨","koala"],["🐯","tiger"],["🦁","lion"],["🐮","cow"],
      ["🐷","pig"],["🐸","frog"],["🐵","monkey"],["🐔","chicken"],["🐧","penguin"],["🐦","bird"],["🐤","chick"],["🦆","duck"],["🦅","eagle"],["🦉","owl"],["🦇","bat"],["🐺","wolf"],
      ["🐗","boar"],["🐴","horse"],["🦄","unicorn"],["🐝","bee"],["🐛","bug"],["🦋","butterfly"],["🐌","snail"],["🐞","ladybug"],["🐢","turtle"],["🐍","snake"],["🦖","trex"],["🐙","octopus"],
      ["🦑","squid"],["🦐","shrimp"],["🦞","lobster"],["🦀","crab"],["🐡","blowfish"],["🐠","fish"],["🐟","fish2"],["🐬","dolphin"],["🐳","whale"],["🦈","shark"],["🐊","croc"],["🐅","tiger2"],
      ["🌵","cactus"],["🎄","tree"],["🌲","evergreen"],["🌳","deciduous"],["🌴","palm"],["🌱","seedling"],["🌿","herb"],["☘️","shamrock"],["🍀","clover"],["🍃","leaves"],["🌺","hibiscus"],["🌻","sunflower"],
      ["🌹","rose"],["🥀","wilted"],["🌷","tulip"],["🌼","daisy"],["🌸","blossom"],["💐","bouquet"],["🌎","earth"],["🌍","earth2"],["🌏","earth3"],["🌕","moon"],["🌑","new moon"],["⭐","star"],
      ["🌟","glow star"],["✨","sparkles"],["⚡","lightning"],["🔥","fire"],["💧","droplet"],["🌊","wave"],["☀️","sun"],["🌤️","sun cloud"],["⛅","partly"],["☁️","cloud"],["🌧️","rain"],["⛈️","storm"],
    ].map(([e,n])=>({e,n})),
  },
  {
    id: "food",
    label: "Food & Drink",
    items: [
      ["🍎","apple"],["🍐","pear"],["🍊","orange"],["🍋","lemon"],["🍌","banana"],["🍉","watermelon"],["🍇","grapes"],["🍓","strawberry"],["🫐","blueberry"],["🍈","melon"],["🍒","cherry"],["🍑","peach"],
      ["🥭","mango"],["🍍","pineapple"],["🥥","coconut"],["🥝","kiwi"],["🍅","tomato"],["🍆","eggplant"],["🥑","avocado"],["🥦","broccoli"],["🥬","leafy"],["🥒","cucumber"],["🌶️","pepper"],["🌽","corn"],
      ["🥕","carrot"],["🧄","garlic"],["🧅","onion"],["🥔","potato"],["🍠","sweet potato"],["🥐","croissant"],["🥯","bagel"],["🍞","bread"],["🥖","baguette"],["🥨","pretzel"],["🧀","cheese"],["🥚","egg"],
      ["🍳","cooking"],["🧈","butter"],["🥞","pancakes"],["🧇","waffle"],["🥓","bacon"],["🥩","steak"],["🍗","poultry"],["🍖","meat"],["🌭","hotdog"],["🍔","burger"],["🍟","fries"],["🍕","pizza"],
      ["🥪","sandwich"],["🌮","taco"],["🌯","burrito"],["🥙","stuffed"],["🧆","falafel"],["🥘","paella"],["🍝","spaghetti"],["🍜","ramen"],["🍲","stew"],["🍛","curry"],["🍣","sushi"],["🍱","bento"],
      ["🥟","dumpling"],["🍤","shrimp"],["🍙","rice ball"],["🍚","rice"],["🍘","cracker"],["🍢","oden"],["🍡","dango"],["🍧","shaved ice"],["🍨","ice cream"],["🍦","soft serve"],["🥧","pie"],["🧁","cupcake"],
      ["🍰","cake"],["🎂","birthday"],["🍮","custard"],["🍭","lollipop"],["🍬","candy"],["🍫","chocolate"],["🍿","popcorn"],["🍩","donut"],["🍪","cookie"],["☕","coffee"],["🍵","tea"],["🧃","juice"],
      ["🥤","cup"],["🧋","bubble tea"],["🍶","sake"],["🍺","beer"],["🍻","beers"],["🥂","clink"],["🍷","wine"],["🥃","whiskey"],["🍸","cocktail"],["🍹","tropical"],["🧉","mate"],["🍾","champagne"],
    ].map(([e,n])=>({e,n})),
  },
  {
    id: "activity",
    label: "Activity",
    items: [
      ["⚽","soccer"],["🏀","basketball"],["🏈","football"],["⚾","baseball"],["🥎","softball"],["🎾","tennis"],["🏐","volleyball"],["🏉","rugby"],["🥏","frisbee"],["🎱","8ball"],["🪀","yoyo"],["🏓","pingpong"],
      ["🏸","badminton"],["🥅","goal"],["🏒","hockey"],["🏑","field hockey"],["🥍","lacrosse"],["🏏","cricket"],["⛳","golf"],["🪁","kite"],["🏹","bow"],["🎣","fishing"],["🤿","diving"],["🥊","boxing"],
      ["🥋","martial"],["🎽","running"],["🛹","skateboard"],["🛼","skates"],["🛷","sled"],["⛸️","ice skate"],["🥌","curling"],["🎿","ski"],["⛷️","skier"],["🏂","snowboard"],["🏋️","weights"],["🤸","cartwheel"],
      ["🤼","wrestle"],["🤽","water polo"],["🤾","handball"],["🤺","fencing"],["🏇","horse race"],["🧘","yoga"],["🏄","surf"],["🏊","swim"],["🚴","cycle"],["🚵","mountain bike"],["🎯","bullseye"],["🎮","gaming"],
      ["🎲","dice"],["🧩","puzzle"],["♟️","chess"],["🎭","theater"],["🎨","art"],["🎬","clapper"],["🎤","mic"],["🎧","headphones"],["🎼","score"],["🎹","piano"],["🥁","drum"],["🎷","sax"],
      ["🎺","trumpet"],["🎸","guitar"],["🪕","banjo"],["🎻","violin"],["🎰","slot"],["🎳","bowling"],["🏆","trophy"],["🥇","gold"],["🥈","silver"],["🥉","bronze"],["🎖️","medal"],
    ].map(([e,n])=>({e,n})),
  },
  {
    id: "travel",
    label: "Travel & Places",
    items: [
      ["🚗","car"],["🚕","taxi"],["🚙","suv"],["🚌","bus"],["🚎","trolley"],["🏎️","race car"],["🚓","police"],["🚑","ambulance"],["🚒","fire truck"],["🚐","van"],["🛻","pickup"],["🚚","truck"],
      ["🚛","big rig"],["🚜","tractor"],["🛵","scooter"],["🏍️","motorcycle"],["🚲","bicycle"],["🛴","kick scooter"],["🚂","steam"],["🚆","train"],["🚇","metro"],["🚊","tram"],["🚝","monorail"],
      ["🚄","bullet"],["🚅","speed train"],["🚈","light rail"],["🛫","takeoff"],["🛬","landing"],["🛩️","small plane"],["✈️","plane"],["🚀","rocket"],["🛸","ufo"],["🚁","helicopter"],["⛵","sailboat"],["🚤","speedboat"],
      ["🛥️","motorboat"],["🛳️","cruise"],["⛴️","ferry"],["🚢","ship"],["⚓","anchor"],["⛽","fuel"],["🚧","construction"],["🚦","signal"],["🚥","traffic light"],["🗺️","map"],["🗿","moai"],["🗽","liberty"],
      ["🗼","tokyo tower"],["🏰","castle"],["🏯","japanese castle"],["🏟️","stadium"],["🎡","ferris wheel"],["🎢","roller coaster"],["🎠","carousel"],["⛲","fountain"],["⛱️","umbrella"],["🏖️","beach"],["🏝️","island"],["🏜️","desert"],
      ["🌋","volcano"],["⛰️","mountain"],["🏔️","snow mountain"],["🗻","fuji"],["🏕️","camping"],["⛺","tent"],["🛖","hut"],["🏠","house"],["🏡","home garden"],["🏘️","houses"],["🏚️","derelict"],["🏗️","construction crane"],
      ["🏭","factory"],["🏢","office"],["🏬","department"],["🏣","japan post"],["🏤","euro post"],["🏥","hospital"],["🏦","bank"],["🏨","hotel"],["🏪","store"],["🏫","school"],["🏩","love hotel"],["💒","wedding"],
    ].map(([e,n])=>({e,n})),
  },
  {
    id: "objects",
    label: "Objects",
    items: [
      ["⌚","watch"],["📱","phone"],["💻","laptop"],["⌨️","keyboard"],["🖥️","desktop"],["🖨️","printer"],["🖱️","mouse"],["🖲️","trackball"],["🕹️","joystick"],["🗜️","clamp"],["💽","minidisc"],["💾","floppy"],
      ["💿","cd"],["📀","dvd"],["📼","vhs"],["📷","camera"],["📸","flash"],["📹","video"],["🎥","movie cam"],["📽️","projector"],["🎞️","film"],["📞","phone"],["☎️","telephone"],["📟","pager"],
      ["📠","fax"],["📺","tv"],["📻","radio"],["🎙️","studio mic"],["🎚️","level"],["🎛️","control"],["🧭","compass"],["⏱️","stopwatch"],["⏲️","timer"],["⏰","alarm"],["🕰️","mantelpiece"],["⌛","hourglass"],
      ["⏳","sand"],["📡","satellite"],["🔋","battery"],["🔌","plug"],["💡","bulb"],["🔦","flashlight"],["🕯️","candle"],["🪔","diya"],["🧯","extinguisher"],["🛢️","oil"],["💸","money fly"],["💵","dollar"],
      ["💴","yen"],["💶","euro"],["💷","pound"],["💰","money bag"],["💳","card"],["💎","diamond"],["⚖️","scale"],["🪜","ladder"],["🧰","toolbox"],["🪛","screwdriver"],["🔧","wrench"],["🔨","hammer"],
      ["⚒️","tools"],["🛠️","hammer wrench"],["⛏️","pick"],["🪚","saw"],["🔩","nut bolt"],["⚙️","gear"],["🧱","brick"],["⛓️","chains"],["🧲","magnet"],["🔫","gun"],["💣","bomb"],["🧨","firecracker"],
      ["🪓","axe"],["🔪","knife"],["🗡️","dagger"],["⚔️","crossed swords"],["🛡️","shield"],["🚬","cigarette"],["⚰️","coffin"],["⚱️","urn"],["🏺","amphora"],["🔮","crystal"],["📿","prayer beads"],["🧿","nazar"],
    ].map(([e,n])=>({e,n})),
  },
  {
    id: "symbols",
    label: "Symbols",
    items: [
      ["❤️","red heart"],["🧡","orange heart"],["💛","yellow heart"],["💚","green heart"],["💙","blue heart"],["💜","purple heart"],["🖤","black heart"],["🤍","white heart"],["🤎","brown heart"],["💔","broken"],["❣️","exclam heart"],["💕","two hearts"],
      ["💞","revolving"],["💓","beating"],["💗","growing"],["💖","sparkling"],["💘","arrow"],["💝","gift heart"],["💟","decoration"],["☮️","peace"],["✝️","cross"],["☪️","star crescent"],["🕉️","om"],["☸️","wheel"],
      ["✡️","star david"],["🔯","six pointed"],["🕎","menorah"],["☯️","yin yang"],["☦️","orthodox"],["🛐","place worship"],["⛎","ophiuchus"],["♈","aries"],["♉","taurus"],["♊","gemini"],["♋","cancer"],["♌","leo"],
      ["♍","virgo"],["♎","libra"],["♏","scorpio"],["♐","sagittarius"],["♑","capricorn"],["♒","aquarius"],["♓","pisces"],["🆔","id"],["⚛️","atom"],["🉑","accept"],["☢️","radioactive"],["☣️","biohazard"],
      ["📴","mobile off"],["📳","vibration"],["🈶","not free"],["🈚","free"],["🈸","application"],["🈺","open"],["🈷️","monthly"],["✴️","eight pointed"],["🆚","vs"],["💮","white flower"],["🉐","bargain"],["㊙️","secret"],
      ["㊗️","congrats"],["🈴","passing"],["🈵","no vacancy"],["🈹","discount"],["🈲","prohibited"],["🅰️","a"],["🅱️","b"],["🆎","ab"],["🆑","cl"],["🅾️","o"],["🆘","sos"],["❌","cross mark"],
      ["⭕","circle"],["🛑","stop"],["⛔","no entry"],["📛","name badge"],["🚫","prohibit"],["💯","100"],["💢","anger"],["♨️","hot springs"],["🚷","no pedestrian"],["🚯","no litter"],["🚳","no bikes"],["🚱","not potable"],
      ["🔞","18"],["📵","no phones"],["🚭","no smoking"],["❗","exclamation"],["❕","white exclam"],["❓","question"],["❔","white question"],["‼️","double exclam"],["⁉️","interrobang"],["🔅","dim"],["🔆","bright"],["〽️","alternation"],
      ["⚠️","warning"],["🚸","children"],["🔱","trident"],["⚜️","fleur"],["🔰","novice"],["♻️","recycle"],["✅","check"],["🈯","reserved"],["💹","chart up"],["❇️","sparkle"],["✳️","asterisk"],["❎","negative"],
    ].map(([e,n])=>({e,n})),
  },
  {
    id: "flags",
    label: "Flags",
    items: [
      ["🏁","checkered"],["🚩","triangular"],["🎌","crossed"],["🏴","black"],["🏳️","white"],["🏳️‍🌈","rainbow"],["🏳️‍⚧️","trans"],["🏴‍☠️","pirate"],
      ["🇺🇸","usa"],["🇨🇦","canada"],["🇲🇽","mexico"],["🇬🇧","uk"],["🇫🇷","france"],["🇩🇪","germany"],["🇮🇹","italy"],["🇪🇸","spain"],["🇵🇹","portugal"],["🇳🇱","netherlands"],["🇧🇪","belgium"],["🇨🇭","switzerland"],
      ["🇸🇪","sweden"],["🇳🇴","norway"],["🇩🇰","denmark"],["🇫🇮","finland"],["🇮🇪","ireland"],["🇮🇸","iceland"],["🇵🇱","poland"],["🇨🇿","czechia"],["🇦🇹","austria"],["🇬🇷","greece"],["🇹🇷","turkey"],["🇷🇺","russia"],
      ["🇺🇦","ukraine"],["🇯🇵","japan"],["🇰🇷","korea"],["🇨🇳","china"],["🇮🇳","india"],["🇵🇰","pakistan"],["🇧🇩","bangladesh"],["🇹🇭","thailand"],["🇻🇳","vietnam"],["🇮🇩","indonesia"],["🇵🇭","philippines"],["🇸🇬","singapore"],
      ["🇲🇾","malaysia"],["🇦🇺","australia"],["🇳🇿","nz"],["🇿🇦","south africa"],["🇪🇬","egypt"],["🇳🇬","nigeria"],["🇰🇪","kenya"],["🇲🇦","morocco"],["🇧🇷","brazil"],["🇦🇷","argentina"],["🇨🇱","chile"],["🇨🇴","colombia"],
      ["🇵🇪","peru"],["🇻🇪","venezuela"],["🇨🇺","cuba"],["🇮🇱","israel"],["🇸🇦","saudi"],["🇦🇪","uae"],["🇮🇷","iran"],["🇮🇶","iraq"],["🇶🇦","qatar"],["🇰🇼","kuwait"],["🇯🇴","jordan"],["🇱🇧","lebanon"],
    ].map(([e,n])=>({e,n})),
  },
];

const TONES = [
  { id: "default", label: "Default", color: "#FCD34D", mod: "" },
  { id: "light", label: "Light", color: "#F5D6BA", mod: "\u{1F3FB}" },
  { id: "medium-light", label: "Medium-Light", color: "#E8B98A", mod: "\u{1F3FC}" },
  { id: "medium", label: "Medium", color: "#C68642", mod: "\u{1F3FD}" },
  { id: "medium-dark", label: "Medium-Dark", color: "#8D5524", mod: "\u{1F3FE}" },
  { id: "dark", label: "Dark", color: "#4A2C19", mod: "\u{1F3FF}" },
];

const TONE_SUPPORT = new Set([
  "👋","🤚","🖐️","✋","🖖","👌","🤌","🤏","✌️","🤞","🫰","🤟","🤘","🤙","👈","👉","👆","🖕","👇","☝️","👍","👎","✊","👊","🤛","🤜","👏","🙌","👐","🤲","🤝","🙏","💅","🤳","💪","🦵","🦶","👂","🦻","👃","👶","🧒","👦","👧","🧑","👨","👩","🧓","👴","👵","🙍","🙎","🙅","🙆","💁","🙋","🧏","🙇","🤦","🤷","💆","💇","🚶","🧍","🧎","🏃","💃","🕺","🕴️","🧖","🧗","🤺","🏇","⛷️","🏂","🏌️","🏄","🚣","🏊","⛹️","🏋️","🚴","🚵","🤸","🤼","🤽","🤾","🤹","🧘","🛀","🛌","🫵","🫱","🫲","🫳","🫴","🫶","🦾","🦿"
]);

function applyTone(emoji: string, mod: string): string {
  if (!mod) return emoji;
  if (!TONE_SUPPORT.has(emoji)) return emoji;
  // Strip trailing VS16 (FE0F) before inserting modifier, append once
  const base = emoji.replace(/\uFE0F$/, "");
  return base + mod;
}

type Props = { onPick: (e: string) => void; onClose: () => void; direction?: "up" | "down" };

export function EmojiPicker({ onPick, onClose, direction = "up" }: Props) {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState(CATEGORIES[0].id);
  const [tone, setTone] = useState(TONES[0]);
  const [toneOpen, setToneOpen] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    const all = CATEGORIES.flatMap(c => c.items);
    return all.filter(i => i.n.includes(q));
  }, [query]);

  const active = CATEGORIES.find(c => c.id === activeCat) ?? CATEGORIES[0];
  const ICONS: Record<string, string> = {
    smileys: "😀", nature: "🌿", food: "🍔", activity: "⚽",
    travel: "✈️", objects: "💡", symbols: "❤️", flags: "🏳️",
  };

  const pick = (e: string) => onPick(applyTone(e, tone.mod));

  return (
    <div className={`emoji-picker emoji-picker-${direction}`} onMouseLeave={onClose}>
      <div className="emoji-picker-search">
        <input
          autoFocus
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search emoji"
        />
        <div className="emoji-tone-wrap">
          <button
            type="button"
            className="emoji-tone-trigger"
            onClick={() => setToneOpen(v => !v)}
            title={`Skin tone: ${tone.label}`}
          >
            <span className="emoji-tone-dot" style={{ background: tone.color }} />
          </button>
          {toneOpen && (
            <div className="emoji-tone-menu">
              {TONES.map(t => (
                <button
                  key={t.id}
                  type="button"
                  className={`emoji-tone-item${t.id === tone.id ? " on" : ""}`}
                  onClick={() => { setTone(t); setToneOpen(false); }}
                >
                  <span className="emoji-tone-dot" style={{ background: t.color }} />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {!results && (
        <div className="emoji-picker-tabs">
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              type="button"
              className={`emoji-tab${c.id === activeCat ? " on" : ""}`}
              onClick={() => setActiveCat(c.id)}
              title={c.label}
            >
              {ICONS[c.id]}
            </button>
          ))}
        </div>
      )}
      <div className="emoji-picker-body">
        {results ? (
          <>
            <div className="emoji-picker-label">{results.length} result{results.length===1?"":"s"}</div>
            <div className="emoji-grid">
              {results.map((i, idx) => (
                <button key={idx} type="button" className="composer-emoji-btn" title={i.n} onClick={() => pick(i.e)}>{applyTone(i.e, tone.mod)}</button>
              ))}
              {results.length === 0 && <div className="emoji-empty">No emoji found</div>}
            </div>
          </>
        ) : (
          <>
            <div className="emoji-picker-label">{active.label}</div>
            <div className="emoji-grid">
              {active.items.map((i, idx) => (
                <button key={idx} type="button" className="composer-emoji-btn" title={i.n} onClick={() => pick(i.e)}>{applyTone(i.e, tone.mod)}</button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
