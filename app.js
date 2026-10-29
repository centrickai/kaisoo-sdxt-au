'use strict';
/* ============================================================
   KAISOO NEVER DIE
   ============================================================ */
const $=s=>document.querySelector(s);
const SCREEN=$('#screen'),APP=$('#appL'),HOME=$('#homeL'),LOCK=$('#lockL'),OV=$('#ov'),PLAYER=$('#player');
const base=Date.now();let timeOffset=0;
const elapsed=()=>(Date.now()-base)/1000+timeOffset;

/* ---------- STATUS ---------- */
let view='lock',curDark=true,SC=1,lastRect=null,animTok=0,firstOpen=true,pendingOpen=null;
let pincode='',noteId=0,selectedDay=new Date().getDate(),calMonth=new Date().getMonth()+1,chatId='Kyungsoo my love 💞',videoIndex=0,mailId=0,missOnly=false,safSearch=false;
let calYear = new Date().getFullYear();
//let unread={'민호 형 🔕':2,'준면이 형 🐰':1,'SM 러닝크루 🏃🔥':26}; //kakao unread; same names for all language
let unread = {};
let ksooUnread=0,todayChat=[],incoming=0,replyStage=0,lineIdx=0,typing=false,pendingText='',replyBusy=false;
let introDelivered=0, introReady=false;
let alarmStates=Array(7).fill(true),readMail=new Set(),nowSong=-1,flashOn=false;
let callState='',phoneDone=false,declined=0,callStart=0,callPrev='',nextCallAt=0,ringIv=null,ringTo=null,capIdx=-1,extraCalls=[];
let askedCall=false,callName='Kyungsoo my love 💞',callTimers=[],busySent=false,declineSent=false,rbIv=null;
let callReplySent=false;
//let lockNotes=[{title:t('bdayTitle'),body:fmtMD(11,21)+' · '+t('inDays',35),app:'rem',time:t('now')}];
const birthdayDate = new Date(2027, 0, 13);
const todayDate = new Date();
todayDate.setHours(0, 0, 0, 0);

const daysUntilBirthday = Math.ceil(
  (birthdayDate - todayDate) / 86400000
);

let lockNotes = [{
  title: "my baby sooky's birthday 🍰",
  body: fmtMD(1, 13) + ' · ' + daysUntilBirthday + ' days left',
  app: 'rem',
  time: t('now')
}];




/* ---------- UTILITIES ---------- */
const pad=n=>String(n).padStart(2,'0');
const esc=v=>String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const clock12=()=>{const d=new Date();return((d.getHours()%12)||12)+':'+pad(d.getMinutes())};
function ampm(min){return fmtTime(min)}
const nowMin=()=>{const d=new Date();return d.getHours()*60+d.getMinutes()};
const nowAmpm=()=>ampm(nowMin());
function relRect(el){const s=SCREEN.getBoundingClientRect(),r=el.getBoundingClientRect();return{x:(r.left-s.left)/SC,y:(r.top-s.top)/SC,w:r.width/SC,h:r.height/SC}}
const vib=p=>{try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}};
const t_=t;const T={duration:460,easing:'cubic-bezier(.32,.72,0,1)'};
function devRadius(){return document.getElementById('phone').classList.contains('mob')?0:56}

/* ---------- APP ICONS ---------- */
const g=(p,o='')=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${o}>${p}</svg>`;
const G={
 chevL:`<svg viewBox="0 0 12 20" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2 2 10l8 8"/></svg>`,
 chevR:`<svg class="chev" viewBox="0 0 8 13"><path d="m1.5 1.5 5 5-5 5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
 chevRb:g('<path d="m9 5 7 7-7 7"/>'),chevLb:g('<path d="m15 5-7 7 7 7"/>'),
 search:g('<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>'),
 plus:g('<path d="M12 5v14M5 12h14"/>'),
 dots:g('<circle cx="12" cy="12" r="9.2"/><circle cx="8" cy="12" r=".8" fill="currentColor"/><circle cx="12" cy="12" r=".8" fill="currentColor"/><circle cx="16" cy="12" r=".8" fill="currentColor"/>'),
 dotsH:g('<circle cx="5" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="19" cy="12" r="1.2" fill="currentColor"/>'),
 menu:g('<path d="M4 7h16M4 12h16M4 17h16"/>'),
 gear:g('<circle cx="12" cy="12" r="3"/><path d="M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6M5.5 5.5l1.8 1.8M16.7 16.7l1.8 1.8M5.5 18.5l1.8-1.8M16.7 7.3l1.8-1.8"/><circle cx="12" cy="12" r="6.4"/>'),
 person:g('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>'),
 chat:g('<path d="M12 4C7 4 3 7.1 3 11c0 2.4 1.5 4.5 3.9 5.8L6 20.5l4-2.4c.6.1 1.3.1 2 .1 5 0 9-3.1 9-7.1S17 4 12 4Z"/>'),
 chatPlus:g('<path d="M12 4C7 4 3 7.1 3 11c0 2.4 1.5 4.5 3.9 5.8L6 20.5l4-2.4c.6.1 1.3.1 2 .1 5 0 9-3.1 9-7.1S17 4 12 4Z"/><path d="M12 8.5v5M9.5 11h5"/>'),
 openchat:g('<circle cx="12" cy="12" r="8.5"/><path d="M8 12.5c1 1.6 2.4 2.4 4 2.4s3-.8 4-2.4"/>'),
 bag:g('<path d="M5 8h14l-1 12H6Z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>'),
 clock:g('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
 star:g('<path d="m12 3.6 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9Z"/>'),
 contacts:g('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="9.5" r="3"/><path d="M6.8 18c.9-2.4 2.9-3.6 5.2-3.6s4.3 1.2 5.2 3.6"/>'),
 keypad:g('<g fill="currentColor" stroke="none"><circle cx="6" cy="5" r="1.7"/><circle cx="12" cy="5" r="1.7"/><circle cx="18" cy="5" r="1.7"/><circle cx="6" cy="11" r="1.7"/><circle cx="12" cy="11" r="1.7"/><circle cx="18" cy="11" r="1.7"/><circle cx="6" cy="17" r="1.7"/><circle cx="12" cy="17" r="1.7"/><circle cx="18" cy="17" r="1.7"/><circle cx="12" cy="22" r="1.5"/></g>'),
 voicemail:g('<circle cx="6.5" cy="12" r="3.5"/><circle cx="17.5" cy="12" r="3.5"/><path d="M6.5 15.5h11"/>'),
 info:g('<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/><circle cx="12" cy="7.8" r=".7" fill="currentColor"/>'),
 compose:g('<path d="M20 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6"/><path d="M17.5 3.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4Z"/>'),
 filter:g('<circle cx="12" cy="12" r="9"/><path d="M8 10h8M9.5 13h5M11 16h2"/>'),
 share:g('<path d="M12 3v12M8 7l4-4 4 4"/><path d="M6 11v9h12v-9"/>'),
 heart:g('<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10Z"/>'),
 trash:g('<path d="M5 7h14M9 7V4.5h6V7M6.5 7l1 13h9l1-13"/>'),
 book:g('<path d="M4 5.5C6 4.5 9 4.5 12 6c3-1.5 6-1.5 8-.5V19c-2-1-5-1-8 .5-3-1.5-6-1.5-8-.5Z"/><path d="M12 6v13.5"/>'),
 tabs:g('<rect x="4" y="4" width="11" height="11" rx="2"/><path d="M9 20h9a2 2 0 0 0 2-2V9"/>'),
 mic:g('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>'),
 globe:g('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.8 3.5 5.8 3.5 9s-1 6.2-3.5 9c-2.5-2.8-3.5-5.8-3.5-9s1-6.2 3.5-9Z"/>'),
 smile:g('<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5c1.8 2 5.2 2 7 0"/><circle cx="9" cy="10" r=".9" fill="currentColor"/><circle cx="15" cy="10" r=".9" fill="currentColor"/>'),
 plusSq:g('<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><path d="M12 8v8M8 12h8"/>'),
 arrowUp:g('<path d="M12 19V5M6 11l6-6 6 6"/>'),
 home:g('<path d="M4 10.5 12 4l8 6.5V20h-5v-6H9v6H4Z"/>'),
 reels:g('<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M3.5 8.5h17M9 3.5l2.5 5M14.5 3.5 17 8.5"/><path d="m10 12 5 2.8-5 2.8Z"/>'),
 bell:g('<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15Z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>'),
 send:g('<path d="M21 3 10 14"/><path d="M21 3 14.5 21l-4.5-7-7-4.5Z"/>'),
 comment:g('<path d="M12 3.5a8.5 8.5 0 1 0 4.3 15.8l4.2 1.2-1.2-4.2A8.5 8.5 0 0 0 12 3.5Z"/>'),
 grid:g('<rect x="3.5" y="3.5" width="17" height="17" rx="1.5"/><path d="M9.2 3.5v17M14.8 3.5v17M3.5 9.2h17M3.5 14.8h17"/>'),
 tag:g('<rect x="4" y="3.5" width="16" height="17" rx="2.5"/><circle cx="12" cy="10" r="3"/><path d="M7.5 18c.9-2 2.5-3 4.5-3s3.6 1 4.5 3"/>'),
 bookmark:g('<path d="M6 3.5h12v17l-6-4-6 4Z"/>'),
 camera:g('<path d="M4 8h3.5L9 5.5h6L16.5 8H20v11H4Z"/><circle cx="12" cy="13" r="3.5"/>'),
 flash:g('<path d="M8.5 3h7l-1 5h-5Z"/><path d="M9.5 8h5v11a2.5 2.5 0 0 1-5 0Z"/><path d="M12 11.5v2.5"/>'),
 photo:g('<rect x="3.5" y="5" width="17" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m4 17 5-4.5 4 3.5 3-2.5 4 3.5"/>'),
 video:g('<rect x="3" y="6.5" width="13" height="11" rx="2"/><path d="m16 10.5 5-3v9l-5-3"/>'),
 list:g('<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r=".9" fill="currentColor"/><circle cx="4.5" cy="12" r=".9" fill="currentColor"/><circle cx="4.5" cy="18" r=".9" fill="currentColor"/>'),
 inbox:g('<path d="M3.5 13.5 6 5h12l2.5 8.5V19h-17Z"/><path d="M3.5 13.5H9a3 3 0 0 0 6 0h5.5"/>'),
 check:g('<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.8 2.7L16 9.5"/>'),
 pen:g('<path d="m14.5 5.5 4 4L8 20H4v-4Z"/>'),
 alarm:g('<circle cx="12" cy="13" r="7.5"/><path d="M12 9.5V13l2.5 1.5M4.5 5 7 3M19.5 5 17 3"/>'),
 stopwatch:g('<circle cx="12" cy="13.5" r="7.5"/><path d="M12 13.5V9.5M10 2.5h4M12 2.5V6"/>'),
 timer:g('<circle cx="12" cy="12" r="8.5"/><path d="M12 12 8 8"/>'),
 musicNote:'<svg viewBox="0 0 24 24"><path d="M17 3v11.5a3 3 0 1 1-2-2.8V7.3l-6 1.4v8a3 3 0 1 1-2-2.8V5.5Z"/></svg>',
 playF:'<svg viewBox="0 0 24 24"><path d="M7 4.5v15l12.5-7.5Z"/></svg>',
 pauseF:'<svg viewBox="0 0 24 24"><rect x="6" y="4.5" width="4" height="15" rx="1"/><rect x="14" y="4.5" width="4" height="15" rx="1"/></svg>',
 fwdF:'<svg viewBox="0 0 32 24"><path d="M2 4.5v15l12-7.5Z"/><path d="M15 4.5v15l12-7.5Z"/></svg>',
 bwdF:'<svg viewBox="0 0 32 24"><path d="M30 4.5v15l-12-7.5Z"/><path d="M17 4.5v15L5 12Z"/></svg>',
 handset:'<svg viewBox="0 0 24 24"><path d="M6.6 3.2c.6-.3 1.4-.1 1.8.5l1.9 3c.4.6.3 1.4-.2 1.9l-1.4 1.3a12.4 12.4 0 0 0 5.4 5.4l1.3-1.4c.5-.5 1.3-.6 1.9-.2l3 1.9c.6.4.8 1.2.5 1.8l-.9 1.9c-.5 1-1.6 1.6-2.7 1.4C10 19.6 4.4 14 3.3 6.8c-.2-1.1.4-2.2 1.4-2.7Z"/></svg>',
 speaker:'<svg viewBox="0 0 24 24"><path d="M3.5 9h4l5-4.5v15l-5-4.5h-4Z"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></svg>',
 muteF:'<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M4 4l16 16" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></svg>',
 videoF:'<svg viewBox="0 0 24 24"><rect x="2.5" y="6.5" width="13" height="11" rx="2.5"/><path d="m16.5 10.5 5-3v9l-5-3Z"/></svg>',
 plusF:'<svg viewBox="0 0 24 24"><path d="M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7Z"/></svg>',
 keypadF:'<svg viewBox="0 0 24 24"><g><circle cx="6" cy="5" r="1.8"/><circle cx="12" cy="5" r="1.8"/><circle cx="18" cy="5" r="1.8"/><circle cx="6" cy="11" r="1.8"/><circle cx="12" cy="11" r="1.8"/><circle cx="18" cy="11" r="1.8"/><circle cx="6" cy="17" r="1.8"/><circle cx="12" cy="17" r="1.8"/><circle cx="18" cy="17" r="1.8"/></g></svg>',
 bellF:'<svg viewBox="0 0 24 24"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15Z"/><circle cx="12" cy="20.5" r="2"/></svg>',
 msgF:'<svg viewBox="0 0 24 24"><path d="M12 4C7 4 3 7.1 3 11c0 2.4 1.5 4.5 3.9 5.8L6 20.5l4-2.4c.6.1 1.3.1 2 .1 5 0 9-3.1 9-7.1S17 4 12 4Z"/></svg>',
 shift:'<svg viewBox="0 0 24 24" width="22" fill="none" stroke="#000" stroke-width="1.7" stroke-linejoin="round"><path d="M12 4 4 12.5h4.5V20h7v-7.5H20Z"/></svg>',
 bksp:'<svg viewBox="0 0 26 20" width="26" fill="none" stroke="#000" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"><path d="M8 3h15v14H8l-6-7Z"/><path d="m12 7 6 6M18 7l-6 6"/></svg>',
 sil:'<svg viewBox="0 0 24 24"><circle cx="12" cy="9" r="4.3" fill="#fff"/><path d="M3.8 22c.6-4.4 4-7 8.2-7s7.6 2.6 8.2 7Z" fill="#fff"/></svg>',
 calSm:g('<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'),
 sun:'<svg viewBox="0 0 24 24" width="24"><circle cx="12" cy="12" r="5" fill="#ffd60a"/><g stroke="#ffd60a" stroke-width="2" stroke-linecap="round"><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></g></svg>',
 moon:'<svg viewBox="0 0 24 24" width="24"><path d="M15.5 3.5A8.5 8.5 0 1 0 20.5 15 7 7 0 0 1 15.5 3.5Z" fill="#fff"/></svg>',
 pcloud:'<svg viewBox="0 0 24 24" width="24"><circle cx="9" cy="9" r="4.2" fill="#ffd60a"/><path d="M8 19.5h9.5a3.5 3.5 0 0 0 .3-7A5 5 0 0 0 8.4 11 4.3 4.3 0 0 0 8 19.5Z" fill="#fff"/></svg>',
 cloud:'<svg viewBox="0 0 24 24" width="24"><path d="M7 19h10.5a4 4 0 0 0 .4-8A5.6 5.6 0 0 0 7.2 9.2 5 5 0 0 0 7 19Z" fill="#fff"/></svg>',
};


/* ===== CUSTOM APP ICONS ===== */

const CUSTOM_APP_ICONS = {
  // Instagram replaced by X.
  photos: 'icons/photos.png',
  mail: 'icons/mail.png',
  notes: 'icons/notes.png',
  weather: 'icons/weather.png',
  settings: 'icons/settings.png',
  phone: 'icons/phone.png',
  safari: 'icons/safari.png',
  kakao: 'icons/kakao.png',
  music: 'icons/music.png',
  maps: 'icons/maps.png',
  rem: 'icons/rem.png'

  // Optional:
  // calendar: 'icons/calendar.png',
  // clock: 'icons/clock.png'
};


const APPS={maps:'지도',twitter:'X',photos:'사진',mail:'Mail',calendar:'캘린더',clock:'시계',notes:'메모',weather:'날씨',settings:'설정',phone:'전화',safari:'Safari',kakao:'카카오톡',music:'음악',voicememos:'Voice Memos',schoolportal:'LSM School Portal'};
function appIcon(id){
    // Use a real image when a custom icon is available
  if (CUSTOM_APP_ICONS[id]) {
    return `<img
      src="${CUSTOM_APP_ICONS[id]}"
      class="custom-app-icon"
      alt="${id}"
      draggable="false"
    >`;
  }

  // Keep the original SVG icons as fallback
 const L=(a,b,c,d)=>`<linearGradient id="${a}" x1="0" y1="${d?1:0}" x2="${d?1:0}" y2="${d?0:1}"><stop offset="0" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient>`;
 const W=(defs,body)=>`<svg viewBox="0 0 60 60"><defs>${defs}</defs>${body}</svg>`;
 switch(id){
 case'instagram':return W(`<linearGradient id="gi" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#ffc35c"/><stop offset=".5" stop-color="#ff3d6e"/><stop offset="1" stop-color="#7c3bf0"/></linearGradient>`,`<rect width="60" height="60" fill="url(#gi)"/><rect x="17" y="12.5" width="26" height="34" rx="4.5" fill="none" stroke="#fff" stroke-width="3.2"/><rect x="21.6" y="17" width="16.8" height="17" rx="2" fill="#fff"/>`);
   case'schoolportal':return W('',`<rect width="60" height="60" rx="12" fill="#196a68"/><path d="M11 23 30 13l19 10v24H11Z" fill="#fff"/><path d="M7 25 30 12l23 13" stroke="#b8eee2" stroke-width="4" fill="none" stroke-linejoin="round"/><rect x="26" y="31" width="9" height="16" rx="1" fill="#196a68"/><rect x="15" y="30" width="7" height="8" rx="1" fill="#78c6bc"/><rect x="39" y="30" width="7" height="8" rx="1" fill="#78c6bc"/>`);
 case'voicememos':return W('',`<rect width="60" height="60" rx="12" fill="#fff"/><g stroke="#fa354b" stroke-width="2.8" stroke-linecap="round"><path d="M11 24v12M16 19v22M21 13v34M26 23v14M31 9v42M36 18v24M41 13v34M46 21v18M51 26v8"/></g>`);
case'twitter':return W('',`<rect width="60" height="60" rx="12" fill="#050505"/><text x="30" y="44" fill="white" font-size="42" font-family="Arial,sans-serif" text-anchor="middle">𝕏</text>`);
 case'photos':{let p='';for(let i=0;i<10;i++)p+=`<ellipse cx="30" cy="18.2" rx="4.4" ry="10.5" fill="#fff" transform="rotate(${i*36} 30 30)"/>`;return W(L('gp','#9bdcff','#d8f1ff'),`<rect width="60" height="60" fill="url(#gp)"/>${p}<circle cx="30" cy="30" r="7.2" fill="#ffc83d"/><circle cx="30" cy="30" r="7.2" fill="none" stroke="#f0a500" stroke-width="1"/>`)}
 case'mail':return W(L('gm','#3fb0ff','#0a6cf5'),`<rect width="60" height="60" fill="url(#gm)"/><rect x="11.5" y="18" width="37" height="25" rx="3.5" fill="#fff"/><path d="M12.5 20 30 32.5 47.5 20" fill="none" stroke="#1676f3" stroke-width="2.4" stroke-linejoin="round"/>`);
 case 'calendar': {
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth() + 1;
  const d = today.getDate();
  const weekday = wdLong(y, m, d);

  return W('', `
    <rect width="60" height="60" fill="#fff"/>
    <text x="30" y="17.5" text-anchor="middle"
      font-size="${weekday.length > 5 ? 8 : 9.5}"
      font-weight="600" fill="#ff3b30"
      font-family="-apple-system,Pretendard,sans-serif">${weekday}</text>
    <text x="30" y="47" text-anchor="middle"
      font-size="31" font-weight="300" fill="#111"
      font-family="-apple-system,Pretendard,sans-serif">${d}</text>
  `);
}
 //case'calendar':return W('',`<rect width="60" height="60" fill="#fff"/><text x="30" y="17.5" text-anchor="middle" font-size="${wdLong(2026,10,17).length>5?8:9.5}" font-weight="600" fill="#ff3b30" font-family="-apple-system,Pretendard,sans-serif">${wdLong(2026,10,17)}</text><text x="30" y="47" text-anchor="middle" font-size="31" font-weight="300" fill="#111" font-family="-apple-system,Pretendard,sans-serif">17</text>`);
 case'clock':{const d=new Date(),h=d.getHours()%12,m=d.getMinutes();let t='';for(let i=0;i<12;i++)t+=`<path d="M30 8.5v${i%3?2.6:3.8}" stroke="#111" stroke-width="${i%3?1:1.6}" transform="rotate(${i*30} 30 30)"/>`;
  return W('',`<rect width="60" height="60" fill="#000"/><circle cx="30" cy="30" r="24" fill="#fff"/>${t}<path d="M30 30V17" stroke="#111" stroke-width="2.6" stroke-linecap="round" transform="rotate(${h*30+m/2} 30 30)"/><path d="M30 30V11.5" stroke="#111" stroke-width="1.8" stroke-linecap="round" transform="rotate(${m*6} 30 30)"/><path d="M30 34V11" stroke="#ff9500" stroke-width="1" transform="rotate(${(m*6+90)%360} 30 30)"/><circle cx="30" cy="30" r="1.8" fill="#ff9500"/>`)}
 case'notes':return W(L('gn','#ffe27a','#ffc933'),`<rect width="60" height="60" fill="#fff"/><rect width="60" height="17" fill="url(#gn)"/><g stroke="#d9d9de" stroke-width="1.2"><path d="M8 27h44M8 35h44M8 43h44M8 51h44"/></g><g fill="#cfcfd4"><circle cx="10" cy="17" r=".9"/><circle cx="14" cy="17" r=".9"/><circle cx="18" cy="17" r=".9"/><circle cx="22" cy="17" r=".9"/><circle cx="26" cy="17" r=".9"/><circle cx="30" cy="17" r=".9"/><circle cx="34" cy="17" r=".9"/><circle cx="38" cy="17" r=".9"/><circle cx="42" cy="17" r=".9"/><circle cx="46" cy="17" r=".9"/><circle cx="50" cy="17" r=".9"/></g>`);
 case'weather':return W(L('gw','#53b5ff','#1f6fe0'),`<rect width="60" height="60" fill="url(#gw)"/><circle cx="23" cy="23" r="9.5" fill="#ffd84a"/><path d="M19 45h21.5a7.5 7.5 0 0 0 .6-15 10 10 0 0 0-19.2 3.2A6 6 0 0 0 19 45Z" fill="#fff"/>`);
 case'settings':return W(L('gs','#a7adb6','#6d727b'),`<rect width="60" height="60" fill="url(#gs)"/><circle cx="30" cy="30" r="17" fill="none" stroke="#e9eaee" stroke-width="7" stroke-dasharray="4.4 4.5"/><circle cx="30" cy="30" r="14" fill="#878c95" stroke="#e9eaee" stroke-width="3.2"/><circle cx="30" cy="30" r="5.5" fill="none" stroke="#e9eaee" stroke-width="3"/><g stroke="#e9eaee" stroke-width="2.4"><path d="M30 17.5v7M30 35.5v7M17.5 30h7M35.5 30h7"/></g>`);
 case'phone':return W(L('gph','#65f38f','#28c253'),`<rect width="60" height="60" fill="url(#gph)"/><g transform="translate(12 12) scale(1.5)" fill="#fff">${G.handset.replace(/<\/?svg[^>]*>/g,'')}</g>`);
 case'safari':return W(L('gsa','#3aa8ff','#0f5fe0'),`<rect width="60" height="60" fill="#fff"/><circle cx="30" cy="30" r="21" fill="url(#gsa)"/><g fill="none" stroke="#fff" stroke-width="1.6" opacity=".95"><ellipse cx="30" cy="30" rx="8.5" ry="21"/><path d="M9 30h42M12 19.5h36M12 40.5h36M30 9v42"/></g>`);
 case'kakao':return W('',`<rect width="60" height="60" fill="#fee500"/><path d="M30 14.5c-11.9 0-21.5 7.4-21.5 16.5 0 5.9 4 11.1 10 14l-2.2 7.8c-.2.7.6 1.3 1.2.8l9.2-6.1c1.1.1 2.2.2 3.3.2 11.9 0 21.5-7.4 21.5-16.6S41.9 14.5 30 14.5Z" fill="#3a1d1d"/><g fill="#fee500"><circle cx="21.5" cy="31" r="2.7"/><circle cx="30" cy="31" r="2.7"/><circle cx="38.5" cy="31" r="2.7"/></g>`);
 case'music':return W(L('gmu','#ff6f61','#fa2b47'),`<rect width="60" height="60" fill="url(#gmu)"/><g transform="translate(11 10) scale(1.55)" fill="#fff">${G.musicNote.replace(/<\/?svg[^>]*>/g,'')}</g>`);
 case'maps':return W('',`<rect width="60" height="60" fill="#e9f2df"/><path d="M0 38 60 22v12L0 50Z" fill="#fff"/><path d="M24 0h9L27 60h-9Z" fill="#ffd966"/><path d="M0 12c14 6 30-4 60 6V0H0Z" fill="#bfe3a5"/><path d="M42 60c0-8 10-10 18-12v12Z" fill="#9fd0f5"/><path d="M40 14a8 8 0 0 0-8 8c0 6 8 14 8 14s8-8 8-14a8 8 0 0 0-8-8Z" fill="#ff3b30"/><circle cx="40" cy="22" r="3" fill="#fff"/>`);
 case'rem':return W('',`<rect width="60" height="60" fill="#fff"/><circle cx="16" cy="19" r="4.5" fill="#007aff"/><circle cx="16" cy="31" r="4.5" fill="#ff3b30"/><circle cx="16" cy="43" r="4.5" fill="#ff9500"/><g stroke="#d6d6db" stroke-width="2"><path d="M25 19h24M25 31h24M25 43h24"/></g>`);
 }return''}

/* ---------- Sound (synthesized directly using WebAudio) ---------- */
let AC=null;
function ac(){if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(AC&&AC.state==='suspended')AC.resume();return AC}
function tone(f,t0,dur,vol=.12,type='sine'){const a=ac();if(!a)return;const t=a.currentTime+t0,o=a.createOscillator(),gn=a.createGain();o.type=type;o.frequency.value=f;gn.gain.setValueAtTime(0,t);gn.gain.linearRampToValueAtTime(vol,t+.008);gn.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(gn).connect(a.destination);o.start(t);o.stop(t+dur+.05)}
function sfx(k){if(k==='key')tone(2400,0,.025,.035,'triangle');else if(k==='msg'){tone(1046,0,.22,.09);tone(1397,.1,.32,.09)}else if(k==='send'){tone(620,0,.07,.05);tone(930,.05,.09,.05)}else if(k==='unlock'){tone(1300,0,.05,.04,'triangle');tone(1700,.04,.05,.03,'triangle')}else if(k==='lock')tone(500,0,.06,.05,'triangle')}
function ringOnce(){[[784,0],[988,.2],[1175,.4],[988,.6],[784,1.0],[988,1.2],[1175,1.4],[1319,1.6]].forEach(([f,t])=>{tone(f,t,.35,.11);tone(f*2,t,.18,.03)})}
document.addEventListener('pointerdown',()=>ac(),{once:true});

/* ---------- STATUS BAR ---------- */
function setStatus(dark){curDark=!!dark;$('#sb').classList.toggle('light',curDark);$('#hb').classList.toggle('light',curDark)}
const ART = [
  "media/peaches.jpg",       // Peaches
  "media/thats_okay.jpg",    // That's Okay
  "media/montreal.jpg",      // Montreal
  "media/dopamine.jpg",      // Guitarist
  "media/the_war.jpg",       // The Eve
  "media/kai_mmmh.jpg",      // Amnesia
  "media/rose.jpg",                       // Rose
  "media/tempo.jpg",         // Oasis
  "media/wait_on_me.jpg",    // Wait On Me
  "media/bumkey.jpg",        // My Everything
  "media/somebody.jpg",      // Somebody
  "media/kai_mmmh.jpg",      // Mmmh
  "media/universe.jpg",      // Been Through
  "media/dopamine.jpg",      // Dancing Party
  "media/somebody.jpg",      // I Do
  "media/rover.jpg",         // Slidin'
  "media/xoxo.jpg",          // Baby Don't Cry
  "media/brandy.jpg",        // Slower
  "media/kai_mmmh.jpg",      // Nothing On Me
  "media/popcorn.jpg",       // Popcorn
  "media/universe.jpg",      // Universe
  "media/peaches.jpg",       // Blue
  "media/rose.jpg",                       // I'm Gonna Love You
  "media/rover.jpg",         // Rover
  "media/dopamine.jpg",      // Sing It Loud
  "media/overdose.jpg",                       // Moonlight
  "media/popcorn.jpg",       // Good Night
  "media/kai_mmmh.jpg",      // Reason
  "media/lmr.jpg",       // First Love
  "media/adult_swim.jpg",    // Adult Swim
  "media/somebody.jpg",      // Wonder
  "media/rover.jpg",         // Black Mirror
  "media/xoxo.jpg",          // Don't Go
  "media/peaches.jpg",       // Vanilla
  "media/dopamine.jpg",      // Don't You
  "media/hotshot.jpg",       // I'm a HOTSHOT
  "media/popcorn.jpg",       // Mars
  "media/kai_mmmh.jpg",      // Ride Or Die
  "media/lmr.jpg",                       // Love Me Right
  "media/wait_on_me.jpg",    // Walls Don't Talk
  "media/dopamine.jpg",      // Dear
  "media/rose.jpg",                       // My Love
  "media/wait_on_me.jpg"     // Flight to Paris
];
const ARTIST = [
  "KAI",
  "D.O.",
  "The Weeknd",
  "D.O.",
  "EXO",
  "KAI",
  "D.O.",
  "EXO",
  "KAI",
  "Bumkey",
  "D.O.",
  "KAI",
  "EXO",
  "D.O.",
  "D.O.",
  "KAI",
  "EXO",
  "Brandy",
  "KAI",
  "D.O.",
  "EXO",
  "KAI",
  "D.O.",
  "KAI",
  "D.O.",
  "EXO",
  "D.O.",
  "KAI",
  "EXO",
  "KAI",
  "D.O.",
  "KAI",
  "EXO",
  "KAI",
  "D.O.",
  "HOTSHOT",
  "D.O.",
  "KAI",
  "EXO",
  "KAI",
  "D.O.",
  "D.O.",
  "KAI"
];
function updateIsland(){typeof updateCrumb==='function'&&updateCrumb();const on=nowSong>=0&&!PLAYER.paused&&!['music','lock','pin'].includes(view)&&!OV.querySelector('.np,.call,.viewer');const il=$('#island');il.classList.toggle('act',on);if(on){const a=ART[nowSong];il.querySelector('.ia').style.backgroundImage=a?`url(${a})`:'linear-gradient(135deg,#ff9a9e,#fa2d48)'}}

/* ============================================================
   Lock Screen / Passcode
   ============================================================ */
function ncardHTML(n){const ic=n.app==='kakao'?`<div class="ni" style="position:relative;overflow:visible"><img src="media/kyungsoo_kakao_profile.jpg" style="width:38px;height:38px;border-radius:50%;object-fit:cover;display:block"><span style="position:absolute;right:-4px;bottom:-4px;width:18px;height:18px;border-radius:5px;overflow:hidden;border:1.5px solid rgba(255,255,255,.9)">${appIcon('kakao')}</span></div>`:`<div class="ni">${appIcon(n.app)}</div>`;
 return `${ic}<div class="nt"><div class="nh"><span>${esc(n.title)}</span><small>${n.time}</small></div><div class="nb">${esc(n.body)}</div></div>`}
function renderLock(){
 $('#lkc').innerHTML=`<div class="lk-date">${fmtLockDate()}</div><div class="lk-time" id="lkt">${clock12()}</div>
 <div class="lk-langw"><button class="lk-lang" onclick="event.stopPropagation();openLangSheet()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.8 3.5 5.8 3.5 9s-1 6.2-3.5 9c-2.5-2.8-3.5-5.8-3.5-9s1-6.2 3.5-9Z"/></svg>${(window.LANGS||[]).find(l=>l[0]===LANG)?.[1]||''}</button></div>
 <div class="lk-notes">${lockNotes.map((n,i)=>`<button class="ncard" data-i="${i}" onclick="lockNoteTap(${i},event)">${ncardHTML(n)}</button>`).join('')}</div>
 <button class="lk-btn" style="left:46px;${flashOn?'background:#fff;color:#000':''}" onclick="event.stopPropagation();flashOn=!flashOn;vib(15);renderLock()">${G.flash.replace('<svg','<svg width="24" height="24" style="color:'+(flashOn?'#000':'#fff')+'"')}</button>
 <button class="lk-btn" style="right:46px" onclick="event.stopPropagation();vib(15);this.animate([{transform:'scale(1.2)'},{transform:'none'}],250)">${G.camera.replace('<svg','<svg width="24" height="24" style="color:#fff"')}</button>
 <div class="lk-hint">${t('swipeUp')}</div>`}
function openLangSheet(){vib(10);const d=document.createElement('div');d.id='langSheet';
 d.innerHTML=`<div class="ls-g"><div class="ls-h">Language · 언어</div>${(window.LANGS||[]).map(l=>`<button class="${l[0]===LANG?'on':''}" data-l="${l[0]}">${l[1]}${l[0]===LANG?' ✓':''}</button>`).join('')}</div><button class="ls-c">${t('cancel')}</button>`;
 const close=()=>{d.animate([{opacity:1},{opacity:0}],{duration:200}).onfinish=()=>d.remove()};
 d.onclick=e=>{e.stopPropagation();const b=e.target.closest('[data-l]');if(b){if(b.dataset.l===LANG)return close();setLang(b.dataset.l);return}if(e.target===d||e.target.closest('.ls-c'))close()};
 d.addEventListener('pointerdown',e=>e.stopPropagation());
 $('#phone').appendChild(d);d.animate([{opacity:0},{opacity:1}],{duration:200});d.querySelector('.ls-g').animate([{transform:'translateY(60px)'},{transform:'none'}],{duration:320,easing:'cubic-bezier(.2,.9,.25,1)'})}
function lockNoteTap(i,e){e.stopPropagation();if(lockNotes[i].app==='kakao')pendingOpen='chat';goPin()}
(function lockDrag(){const el=$('#lkc');let y0=null,dy=0,moved=false;
 el.addEventListener('pointerdown',e=>{if(view!=='lock'||e.target.closest('button'))return;y0=e.clientY;dy=0;moved=false;el.setPointerCapture(e.pointerId)});
 el.addEventListener('pointermove',e=>{if(y0===null)return;dy=Math.min(0,(e.clientY-y0)/SC);if(Math.abs(dy)>6)moved=true;el.style.transform=`translateY(${dy}px)`;el.style.opacity=1+dy/500;$('#wall').style.filter=`blur(${Math.min(24,-dy/8)}px) brightness(${1-Math.min(.38,-dy/700)})`});
 el.addEventListener('pointerup',e=>{if(y0===null)return;const d=dy;y0=null;$('#wall').style.filter='';
  if(d<-70||!moved&&!e.target.closest('button')){goPin(d)}else{el.animate([{transform:`translateY(${d}px)`,opacity:1+d/500},{transform:'none',opacity:1}],{duration:350,easing:'cubic-bezier(.2,1.3,.4,1)'});el.style.transform='';el.style.opacity=''}});
})();
function goPin(fromDy=0){view='pin';pincode='';const lk=$('#lkc');lk.animate([{transform:`translateY(${fromDy}px)`,opacity:Math.max(0,1+fromDy/500)},{transform:'translateY(-120px)',opacity:0}],{duration:380,easing:'cubic-bezier(.3,.7,.2,1)',fill:'forwards'});
 lk.style.transform='';lk.style.opacity='';lk.style.pointerEvents='none';$('#wall').classList.add('dim');renderPin();const p=$('#pinL');p.style.display='flex';p.animate([{opacity:0,transform:'translateY(40px)'},{opacity:1,transform:'none'}],{duration:420,easing:'cubic-bezier(.2,.9,.25,1)'})}
const PL=['','ABC','DEF','GHI','JKL','MNO','PQRS','TUV','WXYZ'];
function renderPin(){$('#pinL').innerHTML=`<div class="pt">${t('enterPass')}</div><div class="pdots" id="pdots">${[0,1,2,3].map(i=>`<i class="${i<pincode.length?'on':''}"></i>`).join('')}</div>
 <div class="pkeys">${[1,2,3,4,5,6,7,8,9].map(n=>`<button class="pk" onpointerdown="pinPress('${n}',this)"><b>${n}</b><small>${PL[n-1]}</small></button>`).join('')}<span></span><button class="pk" onpointerdown="pinPress('0',this)"><b>0</b><small></small></button><span></span></div>
 <div class="pbot"><button onclick="vib(10)">${t('emergency')}</button><button id="pcancel" onclick="pinCancelOrDel()">${pincode?t('delete'):t('cancel')}</button></div>`}
function pinDots(){$('#pdots').innerHTML=[0,1,2,3].map(i=>`<i class="${i<pincode.length?'on':''}"></i>`).join('');$('#pcancel').textContent=pincode?t('delete'):t('cancel')}
function pinPress(n,el){if(pincode.length>=4)return;el.classList.add('dn');setTimeout(()=>el.classList.remove('dn'),90);sfx('key');vib(8);pincode+=n;pinDots();
 if(pincode.length===4){if(pincode==='1213'){setTimeout(unlock,140)}else{setTimeout(()=>{const d=$('#pdots');d.classList.remove('shake');void d.offsetWidth;d.classList.add('shake');vib([60,40,60]);setTimeout(()=>{pincode='';pinDots()},420)},120)}}}
function pinCancelOrDel(){if(pincode){pincode=pincode.slice(0,-1);pinDots();return}pinCancel()}
function pinCancel(){view='lock';const p=$('#pinL');p.animate([{opacity:1},{opacity:0,transform:'translateY(30px)'}],{duration:300}).onfinish=()=>p.style.display='none';
 const lk=$('#lkc');lk.getAnimations().forEach(a=>a.cancel());lk.style.pointerEvents='';lk.animate([{transform:'translateY(-120px)',opacity:0},{transform:'none',opacity:1}],{duration:450,easing:'cubic-bezier(.2,.9,.25,1)'});$('#wall').classList.remove('dim')}
function unlock(){sfx('unlock');view='home';$('#wall').classList.remove('dim');
 LOCK.animate([{opacity:1},{opacity:0}],{duration:300,fill:'forwards'}).onfinish=()=>{LOCK.style.visibility='hidden';$('#pinL').style.display='none';$('#lkc').getAnimations().forEach(a=>a.cancel());$('#lkc').style.pointerEvents=''};
 renderHome();HOME.style.visibility='visible';HOME.animate([{transform:'scale(1.18)',opacity:0},{transform:'none',opacity:1}],{duration:560,easing:'cubic-bezier(.2,.9,.22,1)'});
 [...HOME.querySelectorAll('.app,.widget')].forEach((el,i)=>el.animate([{transform:'scale(.7)',opacity:0},{transform:'none',opacity:1}],{duration:520,delay:30+i*14,easing:'cubic-bezier(.2,1.1,.3,1)',fill:'backwards'}));
 setStatus(true);if(pendingOpen){pendingOpen=null;setTimeout(()=>{chatId='Kyungsoo my love 💞';openApp('chat',HOME.querySelector('.app[data-app="kakao"] .icon'))},520)}}

 
function lockIphone() {
  if (view === 'lock' || view === 'pin' || callState) return;

  // Cancel pending app transition animations
  ++animTok;

  // Close any open keyboard
  const keyboard = document.querySelector('#kbd');
  if (keyboard) keyboard.classList.remove('open');

  // Hide any active application
  APP.getAnimations().forEach(a => a.cancel());
  APP.querySelectorAll('video').forEach(v => v.pause());
  APP.style.visibility = 'hidden';
  APP.innerHTML = '';

  // Hide the home screen
  HOME.getAnimations().forEach(a => a.cancel());
  HOME.style.visibility = 'hidden';

  // Restore the lock screen
  const lockLayer = document.querySelector('#lockL');
  const lockContent = document.querySelector('#lkc');

  lockLayer.getAnimations().forEach(a => a.cancel());
  lockLayer.style.visibility = 'visible';
  lockLayer.style.opacity = '1';

  lockContent.getAnimations().forEach(a => a.cancel());
  lockContent.style.transform = '';
  lockContent.style.opacity = '';
  lockContent.style.pointerEvents = '';

  document.querySelector('#pinL').style.display = 'none';
  document.querySelector('#wall').classList.remove('dim');

  pendingOpen = null;
  view = 'lock';

  renderLock();
  setStatus(true);
}

/* ============================================================
   HOME SCREEN
   ============================================================ */
function badgeOf(id){if(id==='phone')return 3+declined;if(id==='mail')return[0,1].filter(i=>!readMail.has(i)).length;if(id==='kakao')return Object.values(unread).reduce((a,b)=>a+b,0)+ksooUnread;return 0}
function appBtn(id){const b=badgeOf(id);return `<button class="app" data-app="${id}" onclick="openApp('${id}',this.firstElementChild)"><div class="icon"><div class="ic">${appIcon(id)}</div>${b?`<span class="bdg">${b}</span>`:''}</div><span class="lbl">${id==='schoolportal'?'LSM School Portal':id==='voicememos'?'Voice Memos':id==='twitter'?'X':t('app_'+id)}</span></button>`}
function renderHome(){
 HOME.innerHTML=`<div class="hgrid">
  <button class="widget wcal" data-app="calendar" onclick="openApp('calendar',this)"><div class="wd">${wdLong(new Date().getFullYear(),new Date().getMonth()+1,new Date().getDate())}</div><div class="wn">${new Date().getDate()}</div>${(events[17]||[]).map(x=>`<div class="we">${esc(x)}<small>${t('allDay')}</small></div>`).join('')}</button>
  ${manilaWxWidgetMarkup()}
  ${['photos','mail','calendar','clock','notes','weather','settings','maps','voicememos','schoolportal'].map(appBtn).join('')}
 </div><button class="spot" onclick="this.animate([{transform:'translateX(-50%) scale(1)'},{transform:'translateX(-50%) scale(1.08)'},{transform:'translateX(-50%) scale(1)'}],300)">${G.search.replace('<svg','<svg width="13" height="13"')}${t('search')}</button>
 <div class="dock">${['phone','safari','kakao','music'].map(appBtn).join('')}</div>`}
// INSERT HERE
const renderHomeWithoutWeatherRefresh = renderHome;

renderHome = function (...args) {
  const result = renderHomeWithoutWeatherRefresh.apply(this, args);
  manilaWxEnsureWidgetFresh();
  return result;
};

// The next existing function or section
/* ============================================================
   Screen Transition Engine
   ============================================================ */
const PARENT={note:'notes',chat:'kakao',maild:'mail',reel:'twitter',screentime:'settings'};
const rootOf=v=>PARENT[v]||v;
function viewDark(){if(['lock','pin','home'].includes(view))return true;const p=APP.lastElementChild;return!!(p&&p.dataset.dark)}
function wireScroll(pg){const sc=pg.querySelector('.scroll');if(sc)sc.addEventListener('scroll',()=>pg.classList.toggle('scrolled',sc.scrollTop>38),{passive:true})}
function show(id,anim='swap'){
 const old=[...APP.children];old.forEach(o=>{o.querySelectorAll('video').forEach(v=>v.pause())});
 if(PLAYER.dataset.voice&&!(id==='chat')){PLAYER.pause()}
 view=id;const v=VIEWS[id]();const pg=document.createElement('div');pg.className='pg '+(v.cls||'');pg.innerHTML=v.html;pg.dataset.view=id;pg.dataset.dark=v.dark?'1':'';
 if(anim==='pop')APP.insertBefore(pg,APP.firstChild);else APP.appendChild(pg);
 setStatus(v.dark);wireScroll(pg);
 const done=()=>old.forEach(o=>o.remove());
 if(anim==='push'){pg.classList.add('pushed');pg.animate([{transform:'translateX(100%)'},{transform:'none'}],T);old.forEach(o=>o.animate([{transform:'none',filter:'brightness(1)'},{transform:'translateX(-28%)',filter:'brightness(.92)'}],T));setTimeout(done,T.duration)}
 else if(anim==='pop'){pg.animate([{transform:'translateX(-28%)',filter:'brightness(.92)'},{transform:'none',filter:'brightness(1)'}],T);old.forEach(o=>{o.classList.add('pushed');o.animate([{transform:'none'},{transform:'translateX(100%)'}],{...T,fill:'forwards'})});setTimeout(done,T.duration)}
 else done();
 v.init&&v.init(pg);updateIsland();return pg}
function zoomFrames(r){const W=SCREEN.clientWidth,H=SCREEN.clientHeight,s=r.w/W,iy=Math.max(0,(H-r.h/s)/2),dx=r.x+r.w/2-W/2,dy=r.y+r.h/2-H/2;
 return[{transform:`translate(${dx}px,${dy}px) scale(${s})`,clipPath:`inset(${iy}px 0px round ${15/s}px)`,opacity:.25},{transform:'translate(0px,0px) scale(1)',clipPath:`inset(0px 0px round ${devRadius()}px)`,opacity:1}]}
function openApp(id,el){if(callState)return;if(view!=='home'){return}
 lastRect=el?relRect(el):null;APP.innerHTML='';show(id,'none');const tok=++animTok;
 APP.style.visibility='visible';APP.getAnimations().forEach(a=>a.cancel());
 APP.animate(zoomFrames(lastRect||{x:166,y:396,w:60,h:60}),{duration:540,easing:'cubic-bezier(.2,.9,.22,1)'});
 HOME.animate([{transform:'none',opacity:1},{transform:'scale(1.1)',opacity:0}],{duration:400,easing:'ease-in'}).onfinish=()=>{if(tok===animTok&&view!=='home')HOME.style.visibility='hidden'};
 if(firstOpen){firstOpen=false;setTimeout(()=>{$('#hb').classList.add('pulse');setTimeout(()=>$('#hb').classList.remove('pulse'),3400)},900)}}
function closeApp(){if(callState||['home','lock','pin'].includes(view))return;
 const root=rootOf(view);if(PLAYER.dataset.voice)PLAYER.pause();
 view='home';renderHome();HOME.style.visibility='visible';setStatus(true);
 const icon=HOME.querySelector(`.app[data-app="${root}"] .icon`);const r=icon?relRect(icon):{x:166,y:396,w:60,h:60};
 const tok=++animTok;APP.getAnimations().forEach(a=>a.cancel());
 const a=APP.animate(zoomFrames(r).reverse(),{duration:460,easing:'cubic-bezier(.3,.75,.2,1)',fill:'forwards'});
 a.onfinish=()=>{if(tok!==animTok)return;APP.style.visibility='hidden';APP.querySelectorAll('video').forEach(v=>v.pause());APP.innerHTML='';a.cancel()};
 HOME.animate([{transform:'scale(1.1)',opacity:0},{transform:'none',opacity:1}],{duration:460,easing:'cubic-bezier(.2,.9,.22,1)'});updateIsland()}
function push(id){show(id,'push')}
function back(){if(view==='voicememos'&&vmReturnChat){returnFromAttachedVoiceMemo();return;}if(PARENT[view])show(PARENT[view],'pop');else closeApp()}
function hbAction(){if(callState)return;const vw=OV.querySelector('.viewer');if(vw)return closeViewer();if(OV.querySelector('.np'))return closeNP();
 if(view==='lock')return goPin();if(view==='pin')return;if(view==='home')return HOME.animate([{transform:'none'},{transform:'scale(.97)'},{transform:'none'}],250);closeApp()}
(function hbGesture(){const hb=$('#hb');let y0=null;hb.addEventListener('pointerdown',e=>{y0=e.clientY;hb.setPointerCapture(e.pointerId)});hb.addEventListener('pointerup',e=>{if(y0===null)return;y0=null;hbAction()})})();
(function edgeBack(){let x0=null,y0=0,pg=null;SCREEN.addEventListener('pointerdown',e=>{const r=SCREEN.getBoundingClientRect();if(!PARENT[view]||(e.clientX-r.left)/SC>22)return;x0=e.clientX;y0=e.clientY;pg=APP.lastElementChild});
 SCREEN.addEventListener('pointermove',e=>{if(x0===null)return;const dx=Math.max(0,(e.clientX-x0)/SC);if(pg)pg.style.transform=`translateX(${dx}px)`});
 SCREEN.addEventListener('pointerup',e=>{if(x0===null)return;const dx=(e.clientX-x0)/SC;x0=null;if(pg)pg.style.transform='';if(dx>90)back()})})();
/* 뒤로가기: 상태바 '◀ 홈' + 브라우저/안드로이드 뒤로 버튼 + Backspace + 마우스 뒤로 버튼 */
function goBack(){if(callState)return;const ls=document.getElementById('langSheet');if(ls){ls.remove();return}
 if(OV.querySelector('.viewer'))return closeViewer();if(OV.querySelector('.np'))return closeNP();
 if(['lock','pin','home'].includes(view)){if(view==='pin')pinCancel();return}back()}
function updateCrumb(){const on=!['lock','pin','home'].includes(view)&&!callState;$('#sb').classList.toggle('crumb',on)}
$('#sbk').innerHTML=`<svg viewBox="0 0 7 12"><path d="M6 1 1 6l5 5"/></svg>${t('home')}`;
$('#sbk').addEventListener('click',e=>{e.stopPropagation();if(callState)return;if(OV.querySelector('.viewer'))closeViewer();if(OV.querySelector('.np'))closeNP();closeApp()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')hbAction();else if(e.key==='Backspace'&&!e.target.closest('input,textarea')){e.preventDefault();goBack()}});
document.addEventListener('mouseup',e=>{if(e.button===3){e.preventDefault();goBack()}});
try{history.pushState({wb:1},'');addEventListener('popstate',()=>{goBack();history.pushState({wb:1},'')})}catch(e){}

/* ---------- Common Template---------- */
function navHTML(o){return `<div class="nav ${o.solid?'solid':''}">${o.back!==undefined?`<button class="nb-back" onclick="${o.backFn||'back()'}">${G.chevL}${o.back}</button>`:(o.left||'<span></span>')}<div class="nb-title">${o.title||''}</div><div class="nb-right">${o.right||''}</div></div>`}
function tabbar(items,on,cls=''){return `<div class="tabbar ${cls}">${items.map(([ic,l],i)=>`<button class="${i===on?'on':''}">${G[ic]||ic}<span>${l}</span></button>`).join('')}</div>`}
const sw=(on,fn)=>`<button class="sw ${on?'on':''}" onclick="this.classList.toggle('on');vib(8);${fn||''}"></button>`;

/* ============================================================
   APP SCREENS
   ============================================================ */
const VIEWS={};

/* ============================================================
   SCHOOL PORTAL — fictional school bulletin + parent comments
   and direct school mailbox. Edit the data arrays below.
   ============================================================ */
const SP_POSTS = typeof STORY_SP_POSTS !== 'undefined' ? structuredClone(STORY_SP_POSTS) : [];
const SP_THREADS = typeof STORY_SP_THREADS !== 'undefined' ? structuredClone(STORY_SP_THREADS) : [];
const SP_ATTENDANCE = typeof STORY_SP_ATTENDANCE !== 'undefined' ? structuredClone(STORY_SP_ATTENDANCE) : [];
let spAttendanceFilter='all';
let spTab='bulletin',spPostId=null,spThreadId=null;
const spEsc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Direction-aware page transitions within the School Portal.
let spTransition='none';
function spRefresh(){
 if(view!=='schoolportal')return;
 const pg=APP.querySelector('[data-view="schoolportal"]');
 const oldSurface=pg?.querySelector('.sp-app');
 if(!oldSurface){show('schoolportal','none');return;}
 const wrapper=document.createElement('div');
 wrapper.innerHTML=spPage();
 const nextSurface=wrapper.firstElementChild;
 const direction=spTransition;
 spTransition='none';
 // Replace the entire flex layout synchronously: scroll and bottom tabs
 // must remain in the normal document flow, not an absolute overlay.
 oldSurface.replaceWith(nextSurface);
 const conversation=nextSurface.querySelector('.sp-conversation');
 if(conversation)conversation.scrollTop=conversation.scrollHeight;
 if(direction!=='none' && typeof nextSurface.animate==='function'){
  const x=direction==='back'?-24:direction==='tab'?0:24;
  nextSurface.animate(
   [{transform:`translateX(${x}px)`,opacity:direction==='tab'?0.65:0.85},
    {transform:'translateX(0)',opacity:1}],
   {duration:direction==='tab'?180:250,easing:'cubic-bezier(.22,.75,.25,1)'}
  );
 }
}
function spSwitch(tab){if(spTab===tab&&spPostId===null&&spThreadId===null)return;spTab=tab;spPostId=null;spThreadId=null;spTransition='tab';spRefresh()}
function spOpenPost(id){spPostId=id;spTransition='forward';spRefresh()}
function spOpenThread(id){spThreadId=id;spTransition='forward';spRefresh()}
function spBack(){if(spPostId!==null)spPostId=null;else if(spThreadId!==null)spThreadId=null;else {closeApp();return;}spTransition='back';spRefresh()}
function spAddComment(id){const el=document.querySelector('#sp-comment-input');const val=el?.value.trim();if(!val)return;const post=SP_POSTS.find(p=>p.id===id);if(!post)return;post.comments.push({name:'Kyungsoo',text:val,time:'Just now'});spRefresh();}
function spSendMessage(id){const el=document.querySelector('#sp-message-input');const val=el?.value.trim();if(!val)return;const thread=SP_THREADS.find(t=>t.id===id);if(!thread)return;thread.messages.push({from:'me',text:val,time:'Just now'});spRefresh();const scroll=document.querySelector('.sp-conversation');if(scroll)scroll.scrollTop=scroll.scrollHeight;}
function spAvatar(initials){return `<span class="sp-avatar">${spEsc(initials)}</span>`}
function spComment(c){return `<div class="sp-comment">${spAvatar(c.name==='Kyungsoo'?'KD':c.name==='Teacher Nini'?'TN':c.name.split(' ').map(x=>x[0]).join('').slice(0,2))}<div class="sp-comment-text"><b>${spEsc(c.name)}</b><p>${spEsc(c.text)}</p><small>${spEsc(c.time)}</small></div></div>`}
function spPost(p,full){return `<article class="sp-post"> <div class="sp-author">${spAvatar(p.initials)}<div><b>${spEsc(p.author)}</b><small>${spEsc(p.role)} · ${spEsc(p.date)}</small></div></div><span class="sp-tag">${spEsc(p.tag)}</span><h3>${spEsc(p.title)}</h3><p class="sp-post-body">${spEsc(p.body)}</p><div class="sp-post-footer"><span>💬 ${p.comments.length} ${p.comments.length===1?'comment':'comments'}</span>${full?'':`<button onclick="spOpenPost(${p.id})">Read & comment ›</button>`}</div>${full?`<div class="sp-comments"><h4>Parent comments</h4>${p.comments.map(spComment).join('')}</div><div class="sp-compose"><input id="sp-comment-input" placeholder="Write a comment…" maxlength="1000" onkeydown="if(event.key==='Enter')spAddComment(${p.id})"><button onclick="spAddComment(${p.id})" aria-label="Post comment">↑</button></div>`:''}</article>`}
function spAttendanceCard(r){
 const status=String(r.status||'Present').toLowerCase();
 const checkIn=r.checkIn||'—',checkOut=r.checkOut||'—';
 return `<article class="sp-att-card"><div class="sp-att-card-top"><div><b>${spEsc(r.day||'')}</b><small>${spEsc(r.date||'')}</small></div><span class="sp-att-status ${status==='present'?'present':status==='absent'?'absent':'other'}">${spEsc(r.status||'Present')}</span></div><div class="sp-att-times"><div><small>CHECK-IN</small><strong>${spEsc(checkIn)}</strong></div><div><small>CHECK-OUT</small><strong>${spEsc(checkOut)}</strong></div></div>${r.note?`<p class="sp-att-note">${spEsc(r.note)}</p>`:''}${r.teacher?`<small class="sp-att-teacher">Recorded by ${spEsc(r.teacher)}</small>`:''}</article>`;
}
function spAttendancePage(){
 const all=SP_ATTENDANCE;
 const visible=spAttendanceFilter==='all'?all:all.filter(r=>String(r.status||'').toLowerCase()===spAttendanceFilter);
 const present=all.filter(r=>String(r.status||'').toLowerCase()==='present').length;
 const latest=all[0];
 return `<div class="sp-main-head"><span class="sp-eyebrow">LITTLE STEPS MONTESSORI</span><h1>Attendance</h1><p>Sookyung Do · Kindergarten</p></div><div class="sp-scroll sp-att-scroll"><div class="sp-att-summary"><span>Attendance record</span><strong>${present} <small>/ ${all.length} days present</small></strong><p>${latest?`${spEsc(latest.day||'Latest update')} · ${spEsc(latest.status||'')}`:'No attendance records yet'}</p></div><div class="sp-att-section">Attendance notifications</div>${all.filter(r=>r.notification).slice(0,5).map(r=>`<div class="sp-att-alert"><span class="sp-att-alert-icon">${String(r.status||'').toLowerCase()==='absent'?'!':'✓'}</span><div><b>${spEsc(r.notification)}</b><small>${spEsc(r.date||'')}${r.notificationTime?' · '+spEsc(r.notificationTime):''}</small></div></div>`).join('')||'<p class="sp-att-empty">No notifications yet.</p>'}<div class="sp-att-section">Daily records</div><div class="sp-att-filters"><button class="${spAttendanceFilter==='all'?'active':''}" onclick="spAttendanceFilter='all';spRefresh()">All</button><button class="${spAttendanceFilter==='present'?'active':''}" onclick="spAttendanceFilter='present';spRefresh()">Present</button><button class="${spAttendanceFilter==='absent'?'active':''}" onclick="spAttendanceFilter='absent';spRefresh()">Absent</button></div>${visible.map(spAttendanceCard).join('')||'<p class="sp-att-empty">No records for this filter.</p>'}</div>`;
}
function spPage(){
 const detailPost=SP_POSTS.find(p=>p.id===spPostId);
 const detailThread=SP_THREADS.find(t=>t.id===spThreadId);
 let content='';
 if(detailPost){content=`<div class="sp-topline"><button onclick="spBack()">‹ Bulletin</button><b>Post</b><span></span></div><div class="sp-scroll">${spPost(detailPost,true)}</div>`;}
 else if(detailThread){content=`<div class="sp-topline"><button onclick="spBack()">‹ Mailbox</button><b>${spEsc(detailThread.name)}</b><span></span></div><div class="sp-conversation">${detailThread.messages.map(m=>`<div class="sp-bubble-wrap ${m.from==='me'?'mine':''}"><div class="sp-bubble">${spEsc(m.text)}</div><small>${spEsc(m.time)}</small></div>`).join('')}</div><div class="sp-msg-compose"><input id="sp-message-input" placeholder="Message ${spEsc(detailThread.name)}…" maxlength="2000" onkeydown="if(event.key==='Enter')spSendMessage(${detailThread.id})"><button onclick="spSendMessage(${detailThread.id})" aria-label="Send message">↑</button></div>`;}
 else if(spTab==='attendance'){content=spAttendancePage();}
 else if(spTab==='bulletin'){content=`<div class="sp-main-head"><span class="sp-eyebrow">LITTLE STEPS MONTESSORI</span><h1>Bulletin Board</h1><p>Updates from Sookyung’s school</p></div><div class="sp-scroll">${SP_POSTS.map(p=>spPost(p,false)).join('')}</div>`;}
 else {content=`<div class="sp-main-head"><span class="sp-eyebrow">LITTLE STEPS MONTESSORI</span><h1>Mailbox</h1><p>Messages from teachers & school staff</p></div><div class="sp-scroll sp-inbox">${SP_THREADS.map(t=>{const last=t.messages[t.messages.length-1];return `<button class="sp-thread" onclick="spOpenThread(${t.id})">${spAvatar(t.initials)}<span class="sp-thread-text"><b>${spEsc(t.name)}</b><small>${spEsc(t.role)}</small><span>${spEsc(last.text)}</span></span><span class="sp-thread-chevron">›</span></button>`}).join('')}</div>`;}
 return `<div class="sp-app"><div class="sp-safe"></div>${content}${!detailPost&&!detailThread?`<div class="sp-tabs"><button class="${spTab==='bulletin'?'active':''}" onclick="spSwitch('bulletin')"><span>▤</span>Bulletin</button><button class="${spTab==='mailbox'?'active':''}" onclick="spSwitch('mailbox')"><span>✉</span>Mailbox</button><button class="${spTab==='attendance'?'active':''}" onclick="spSwitch('attendance')"><span>✓</span>Attendance</button></div>`:''}</div>`;
}
VIEWS.schoolportal=()=>({cls:'sp-page',dark:false,html:spPage(),init(pg){const c=pg.querySelector('.sp-conversation');if(c)c.scrollTop=c.scrollHeight;}});



/* VOICE MEMOS — iOS-style transcript playback.
   Edit transcripts in data.en.js; duration automatically follows word count.
   Approximate speaking rate: 145 words/minute, minimum 3 seconds.
   The simulator does not synthesize or play recorded audio. */
const VM_WORDS_PER_MINUTE = 220;
const VM_RECORDINGS = typeof STORY_VM_RECORDINGS !== 'undefined' ? structuredClone(STORY_VM_RECORDINGS) : [];
const vmSafe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
//const vmWords=s=>String(s).replace(/<\/?i>/gi,'').trim().match(/\S+/gu)||[];

const vmWords = s =>
  String(s)
    .replace(/<\/?i>/gi, '')
    .replace(/(^|\n)[ \t]*[^:\n]+:[ \t]*/g, '$1')
    .trim()
    .match(/\S+/gu) || [];

//function vmFormattedWords(s){
// let italic=false,index=0;
// return (String(s).match(/<\/?i>|\s+|[^\s<>]+/giu)||[]).map(token=>{
 // if(/^<i>$/i.test(token)){italic=true;return '';}
 // if(/^<\/i>$/i.test(token)){italic=false;return '';}
 // if(/^\s+$/u.test(token))return token;
//  return `<span data-vm-word="${index++}"${italic?' style="font-style:italic !important;font-weight:700 !important"':''}>${vmSafe(token)}</span>`;
  //return `<span data-vm-word="${index++}"${italic?' style="font-style:italicized;font-weight:700"':''}>${vmSafe(token)}</span>`;
// }).join('');
//}


function vmFormattedWords(s) {
  let italic = false;
  let index = 0;

  return String(s)
    .split('\n')
    .map(line => {
      const match = line.match(/^(\s*)([^:\n]+:)([ \t]*)(.*)$/);

      let prefix = '';
      let dialogue = line;

      if (match) {
        prefix =
          vmSafe(match[1]) +
          `<span class="vm-speaker">${vmSafe(match[2])}</span>` +
          vmSafe(match[3]);

        dialogue = match[4];
      }

      const formatted = (
        dialogue.match(/<\/?i>|\s+|[^\s<>]+/giu) || []
      ).map(token => {
        if (/^<i>$/i.test(token)) {
          italic = true;
          return '';
        }

        if (/^<\/i>$/i.test(token)) {
          italic = false;
          return '';
        }

        if (/^\s+$/u.test(token)) {
          return token;
        }

        return `<span data-vm-word="${index++}"${
          italic
            ? ' style="font-style:italic !important;font-weight:700 !important"'
            : ''
        }>${vmSafe(token)}</span>`;
      }).join('');

      return prefix + formatted;
    })
    .join('\n');
}


const vmDuration=r=>Math.max(3,Math.ceil(vmWords(r.transcript).length/VM_WORDS_PER_MINUTE*60));
const vmTime=s=>`${Math.floor(Math.max(0,s)/60)}:${String(Math.floor(Math.max(0,s)%60)).padStart(2,'0')}`;
const vmClock=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(Math.floor(s%60)).padStart(2,'0')}.${String(Math.floor((s%1)*100)).padStart(2,'0')}`;
let vmActive=-1,vmPlaying=false,vmSeconds=0,vmTimer=null,vmStarted=0,vmLastWord=-1;
// The attachment opens a readable transcript, without starting simulated playback.
let vmReturnChat=null;
function openAttachedVoiceMemo(index){
 if(!VM_RECORDINGS[index]||view!=='chat')return;
 const sc=document.getElementById('msgs');
 vmReturnChat={id:chatId,scrollTop:sc?sc.scrollTop:0};
 show('voicememos','push');
 vmActive=index;vmSeconds=0;vmLastWord=-1;vmPlaying=false;
 vmOpenTranscript();vmUpdate();
}
function returnFromAttachedVoiceMemo(){
 if(!vmReturnChat)return;
 const saved=vmReturnChat;vmReturnChat=null;vmStop();vmActive=-1;
 chatId=saved.id;show('chat','pop');
 const sc=document.getElementById('msgs');if(sc)sc.scrollTop=saved.scrollTop;
}

function vmStop(){if(vmTimer){clearInterval(vmTimer);vmTimer=null;}vmPlaying=false;}
function vmToggle(i){
 if(vmActive!==i){vmStop();vmActive=i;vmSeconds=0;vmLastWord=-1;vmOpenTranscript();}
 else if(vmPlaying){vmSeconds=Math.min(vmDuration(VM_RECORDINGS[i]),(performance.now()-vmStarted)/1000);vmStop();vmUpdate();return;}
 if(vmSeconds>=vmDuration(VM_RECORDINGS[i])){vmSeconds=0;vmLastWord=-1;}
 vmPlaying=true;vmStarted=performance.now()-vmSeconds*1000;vmUpdate();
 vmTimer=setInterval(()=>{
  if(view!=='voicememos'){vmStop();return;}
  vmSeconds=Math.min(vmDuration(VM_RECORDINGS[i]),(performance.now()-vmStarted)/1000);
  if(vmSeconds>=vmDuration(VM_RECORDINGS[i]))vmStop();
  vmUpdate();
 },80);
}
function vmBackToRecordings(){
 if(vmReturnChat){returnFromAttachedVoiceMemo();return;}
 vmStop();
 const pg=APP.querySelector('[data-view="voicememos"]');
 if(!pg)return;
 const panel=pg.querySelector('.vm-full');
 if(panel){
  panel.animate([{opacity:1,transform:'translateX(0)'},{opacity:0,transform:'translateX(38px)'}],{duration:270,easing:'ease-in',fill:'forwards'});
  setTimeout(()=>{if(panel.isConnected){panel.hidden=true;panel.innerHTML='';panel.getAnimations().forEach(a=>a.cancel());}},275);
 }
 setTimeout(()=>{
  if(!pg.isConnected)return;
  for(const selector of ['.vm-list','.vm-heading','.vm-top']){
   const el=pg.querySelector(selector);if(el)el.style.visibility='';
  }
 },160);
 vmActive=-1;vmSeconds=0;vmLastWord=-1;
}
function vmOpenTranscript(){
 const pg=APP.querySelector('[data-view="voicememos"]');if(!pg)return;
 const r=VM_RECORDINGS[vmActive];
 const panel=pg.querySelector('.vm-full');if(!panel)return;
 panel.hidden=false;
 panel.getAnimations().forEach(a=>a.cancel());
 panel.animate([{opacity:0,transform:'translateX(40px)'},{opacity:1,transform:'translateX(0)'}],{duration:330,easing:'cubic-bezier(.22,.75,.25,1)'});
 pg.querySelector('.vm-list').style.visibility='hidden';
 pg.querySelector('.vm-heading').style.visibility='hidden';
 pg.querySelector('.vm-top').style.visibility='hidden';
 panel.innerHTML=`<div class="vm-full-top"><button type="button" class="vm-fake-dots vm-dots-back" onclick="vmBackToRecordings()" aria-label="${vmReturnChat?'Back to Messages':'Back to all recordings'}">‹</button><span class="vm-fake-check">✓</span></div>
  <div class="vm-full-title">${vmSafe(r.title)}</div><div class="vm-full-date">${vmSafe(r.date)}&nbsp; ${vmTime(vmDuration(r))}</div>
  <div class="vm-transcript-viewport"><div class="vm-transcript-words">${vmFormattedWords(r.transcript)}</div></div>
  <div class="vm-full-bottom"><div class="vm-big-clock">00:00.00</div>
   <div class="vm-full-controls"><span class="vm-fake-skip">↶<small>15</small></span><button class="vm-main-play" onclick="vmToggle(${vmActive})" aria-label="Pause">❚❚</button><span class="vm-fake-skip">↷<small>15</small></span></div>
   <div class="vm-full-actions"><span class="vm-fake-caption">▤</span><span class="vm-fake-replace">REPLACE</span><span class="vm-fake-sliders">☷</span></div></div>`;
}
function vmUpdate(){
 const pg=APP.querySelector('[data-view="voicememos"]');if(!pg||vmActive<0)return;
 const panel=pg.querySelector('.vm-full');if(!panel||panel.hidden)return;
 const r=VM_RECORDINGS[vmActive],duration=vmDuration(r),words=vmWords(r.transcript);
 const clk=panel.querySelector('.vm-big-clock');if(clk)clk.textContent=vmClock(vmSeconds);
 const btn=panel.querySelector('.vm-main-play');if(btn){btn.textContent=vmPlaying?'❚❚':'▶';btn.setAttribute('aria-label',vmPlaying?'Pause':'Play');}
 // Progressively highlight the current spoken word, like iOS Voice Memos.
 const current=Math.min(words.length-1,Math.floor(vmSeconds/duration*words.length));
 if(current!==vmLastWord){
  const spans=panel.querySelectorAll('[data-vm-word]');
  spans.forEach((sp,j)=>{sp.classList.toggle('vm-spoken',j<current);sp.classList.toggle('vm-current-word',j===current);});
  const active=spans[current];if(active){
   const viewport=panel.querySelector('.vm-transcript-viewport');
   const target=active.offsetTop-viewport.offsetTop-viewport.clientHeight*.38;
   viewport.scrollTo({top:Math.max(0,target),behavior:'smooth'});
  }
  vmLastWord=current;
 }
}
VIEWS.voicememos=()=>({
 cls:'vm-page',
 html:`<div class="vm-shell">
  <div class="vm-top"><span class="vm-decor vm-back">‹</span><div class="vm-top-right"><span class="vm-decor vm-search">⌕</span><span class="vm-decor vm-select">Select</span></div></div>
  <h1 class="vm-heading">All Recordings</h1>
  <div class="vm-list">${VM_RECORDINGS.map((r,i)=>`<div class="vm-row"><div class="vm-record-meta"><strong>${vmSafe(r.title)}</strong><div class="vm-sub"><span>${vmSafe(r.date)}</span><span>${vmTime(vmDuration(r))}</span></div></div><button class="vm-inline-play" onclick="vmToggle(${i})" aria-label="Play ${vmSafe(r.title)}">▶</button></div>`).join('')}</div>
  <div class="vm-record-bottom"><div class="vm-record-red"></div></div>
  <div class="vm-full" hidden></div>
 </div>`,
 init:()=>{vmStop();vmActive=-1;vmSeconds=0;vmLastWord=-1;}
});

/* --- NOTES --- */
function noteDate(d,full){const [y,m,dd]=d.split('-').map(Number);if(full)return fmtYMD(y,m,dd);if(d==='2026-10-17')return fmtTime(14*60+14);if(d==='2026-10-16')return t('yesterday');const diff=(new Date(2026,9,17)-new Date(y,m-1,dd))/864e5;if(diff<7)return wdLong(y,m,dd);return fmtNum(y,m,dd)}
const noteRow=(n,i)=>`<button class="row tap" onclick="noteId=${i};push('note')"><b>${esc(n[0])}</b><small><em>${noteDate(n[3])}</em>${esc(n[1])}</small></button>`;
VIEWS.notes=()=>({cls:'grouped notes-pg',html:navHTML({title:t('app_notes'),back:t('folders'),right:G.dots})+`<div class="scroll"><h1 class="lt">${t('app_notes')}</h1><div class="srch">${G.search}${t('search')}</div>
 <div class="gh" style="margin-top:8px">📌 ${t('pinned')}</div><div class="group note-l">${notes.slice(0,4).map((n,i)=>noteRow(n,i)).join('')}</div>
 <div class="gh">${t('notesSec')}</div><div class="group note-l">${notes.slice(4).map((n,i)=>noteRow(n,i+4)).join('')}</div></div>
 <div class="toolbar"><span style="width:24px"></span><span style="color:#000;align-self:center;font-size:11px">${t('nNotes',notes.length)}</span>${G.compose}</div>`});
/* Checklist items are declared in data.en.js using lines starting with [ ] or [x].
   Checked states persist in localStorage without changing the source notes. */
const NOTE_CHECK_STORAGE = 'kaisoo_note_checkmarks_v1';
let noteCheckStates = {};
try { noteCheckStates = JSON.parse(localStorage.getItem(NOTE_CHECK_STORAGE) || '{}') || {}; } catch (_) { noteCheckStates = {}; }
function noteChecklistToggle(noteIndex, lineIndex, checked) {
  const key = `${noteIndex}:${lineIndex}`;
  noteCheckStates[key] = checked;
  try { localStorage.setItem(NOTE_CHECK_STORAGE, JSON.stringify(noteCheckStates)); } catch (_) {}
  const row = document.querySelector(`[data-note-check="${key}"]`);
  if (row) row.classList.toggle('checked', checked);
}
function noteBodyHTML(noteIndex, body) {
  return String(body).split('\n').map((line, lineIndex) => {
    const match = line.match(/^\s*\[([ xX])\]\s*(.*)$/);
    if (!match) return `<div class="note-text-line">${esc(line) || '&nbsp;'}</div>`;
    const key = `${noteIndex}:${lineIndex}`;
    const checked = Object.prototype.hasOwnProperty.call(noteCheckStates, key)
      ? !!noteCheckStates[key] : match[1].toLowerCase() === 'x';
    return `<label class="note-check-row${checked ? ' checked' : ''}" data-note-check="${key}"><input type="checkbox" ${checked ? 'checked' : ''} onchange="noteChecklistToggle(${noteIndex},${lineIndex},this.checked)"><span>${esc(match[2])}</span></label>`;
  }).join('');
}
VIEWS.note=()=>{const n=notes[noteId];return{cls:'notes-pg',html:navHTML({title:'',back:t('app_notes'),right:G.share+G.dots,solid:false})+`<div class="scroll"><div class="note-v"><div class="nd">${noteDate(n[3],true)}</div><h2>${esc(n[0])}</h2>${noteBodyHTML(noteId,n[2])}</div></div><div class="toolbar">${G.check}${G.camera}${G.pen}${G.compose}</div>`}};


/* --- CALENDAR --- */

// sookyung's's birthday: January 13, 2027
const BDAY_YEAR = 2027;
const BDAY_MONTH = 1;
const BDAY_DAY = 13;

// Calendar events
function calEvents() {
  let monthEvents = {};

  if (calYear === 2026 && calMonth === 10) {
    monthEvents = events;
  } else if (calYear === 2026 && calMonth === 11) {
    monthEvents = novemberEvents;
  } else if (calYear === 2026 && calMonth === 12) {
    monthEvents = decemberEvents;
  } else if (calYear === 2027 && calMonth === 1) {
    monthEvents = januaryEvents;
  }

  const dayEvents = monthEvents[selectedDay] || [];

  const isBirthday =
    calYear === BDAY_YEAR &&
    calMonth === BDAY_MONTH &&
    selectedDay === BDAY_DAY;

  if (isBirthday) {
    return [
      "🎂 my baby sooky's birthday 💞",
      ...dayEvents.filter(x => !x.includes("KYUNGSOO'S BIRTHDAY"))
    ];
  }

  return dayEvents;
}


// Calendar screen
VIEWS.calendar = () => {
  const first = new Date(calYear, calMonth - 1, 1).getDay();
  const days = new Date(calYear, calMonth, 0).getDate();

  let c = '';

  for (let i = 0; i < first; i++) {
    c += '<div></div>';
  }

  for (let d = 1; d <= days; d++) {
    const dow = (first + d - 1) % 7;

    const isBirthday =
      calYear === BDAY_YEAR &&
      calMonth === BDAY_MONTH &&
      d === BDAY_DAY;
      
      const monthEvents =
      calYear === 2026 && calMonth === 10 ? events :
      calYear === 2026 && calMonth === 11 ? novemberEvents :
      calYear === 2026 && calMonth === 12 ? decemberEvents :
      calYear === 2027 && calMonth === 1 ? januaryEvents :
      {};
      
      const has = isBirthday || !!monthEvents[d]?.length;


    const today = new Date();

    const td =
      calYear === today.getFullYear() &&
      calMonth === today.getMonth() + 1 &&
      d === today.getDate();

    c += `<button class="cal-d ${td?'td':''} ${d===selectedDay?'sel':''} ${dow===0||dow===6?'we':''}" onclick="selectedDay=${d};show('calendar')"><span>${d}</span>${has?'<i></i>':''}</button>`;
  }

  const ev = calEvents().map(x => {
    const m = x.split(' · ');

    return `<div class="evt"><span class="bar" style="background:${x.startsWith('🎂')?'#ff9500':'#af52de'}"></span><b>${esc(m[0])}</b><small>${m[1]||t('allDay')}</small></div>`;
  }).join('') || `<div class="evt muted">${t('noEvents')}</div>`;

  return {
    html: navHTML({
      title: '',
      back: fmtYear(calYear),
      backFn: 'closeApp()',
      right: G.list + G.search + G.plus
    }) + `<div class="scroll" style="padding-bottom:120px"><div style="display:flex;justify-content:space-between;align-items:center;margin:0 16px 8px"><h1 class="lt" style="margin:0">${_f({month:'long'}).format(new Date(calYear,calMonth-1,1))}</h1><span style="display:flex;gap:26px;color:var(--blue)"><button style="width:22px" onclick="calNav(-1)">${G.chevLb}</button><button style="width:22px" onclick="calNav(1)">${G.chevRb}</button></span></div>
    <div class="cal-g cal-w">${wdNarrow().map(w=>`<div>${w}</div>`).join('')}</div>
    <div class="cal-g" id="calg">${c}</div>
    <div style="border-top:.5px solid var(--sep);margin-top:4px;padding-top:4px">${ev}</div></div>
    <div class="tabbar" style="color:#ff3b30">${[t('today'),t('calendars'),t('inbox')].map(x=>`<button style="color:#ff3b30;font-size:16px;justify-content:center">${x}</button>`).join('')}</div>`
  };
};

// Navigate between months, including different years
function calNav(d) {
  const n = new Date(calYear, calMonth - 1 + d, 1);

  calYear = n.getFullYear();
  calMonth = n.getMonth() + 1;

  selectedDay = Math.min(
    selectedDay,
    new Date(calYear, calMonth, 0).getDate()
  );

  const pg = show('calendar');

  pg.querySelector('#calg').animate(
    [
      {transform:`translateX(${d*40}%)`,opacity:0},
      {transform:'none',opacity:1}
    ],
    {
      duration:350,
      easing:'cubic-bezier(.2,.9,.25,1)'
    }
  );
}


/* --- CLOCK --- */
VIEWS.clock=()=>({cls:'dark',dark:true,html:`<div class="nav" style="color:#ff9f0a"><button style="color:#ff9f0a;font-size:17px;justify-self:start;padding-left:8px">${t('edit')}</button><div class="nb-title">${t('alarm')}</div><div class="nb-right" style="color:#ff9f0a">${G.plus}</div></div><div class="scroll"><h1 class="lt">${t('alarm')}</h1>
 <div style="margin:10px 16px 4px;font-size:15px;font-weight:600;display:flex;gap:6px;align-items:center">${t('sleepWake')}</div><div style="padding:8px 16px 14px;color:#8e8e93;font-size:15px;border-bottom:.5px solid rgba(255,255,255,.15)">${t('noAlarm')} <span style="float:right;color:#ff9f0a">${t('setUp')}</span></div>
 <div style="margin:18px 16px 4px;font-size:15px;font-weight:600">${t('other')}</div>
 ${Array.from({length:7},(_,i)=>`<div class="alarm ${alarmStates[i]?'':'off'}"><div><div class="at">${(p=>p.before?`<small>${p.dp}</small>${p.tm}`:`${p.tm}<small style="margin-left:4px">${p.dp}</small>`)(alarmParts(7,i))}</div><div class="al">${t('alarmLabel')}</div></div>${sw(alarmStates[i],`alarmStates[${i}]=!alarmStates[${i}];this.closest('.alarm').classList.toggle('off',!alarmStates[${i}])`)}</div>`).join('')}</div>
 ${tabbar([['globe',t('worldClock')],['alarm',t('alarm')],['stopwatch',t('stopwatch')],['timer',t('timer')]],1).replace('class="on"','class="on" style="color:#ff9f0a"')}`});

/* --- PHONE --- */
function callWhen(s){if(s.startsWith('오늘 ')){const [h,m]=s.slice(3).split(':').map(Number);return ampm(h*60+m)}const w=s.split(' ')[0];if(w==='어제')return t('yesterday');if(KO_WD[w]!=null){return wdLong(2026,10,11+KO_WD[w])}return w}
const callNameDisp=n=>n.replace(/^(.+?)( \(\d+\))?$/,(m,a,b)=>dn(a)+(b||''));
VIEWS.phone=()=>{const all=[...extraCalls,...calls].filter(c=>!missOnly||c[2]==='부재중');
 return{html:`<div class="nav"><button style="color:var(--blue);font-size:17px;justify-self:start;padding-left:8px">${t('edit')}</button><div class="seg"><button class="${missOnly?'':'on'}" onclick="missOnly=false;show('phone')">${t('all')}</button><button class="${missOnly?'on':''}" onclick="missOnly=true;show('phone')">${t('missed')}</button></div><span></span></div>
 <div class="scroll"><h1 class="lt">${t('recents')}</h1><div class="srch">${G.search}${t('search')}</div>
 ${all.map(c=>`<div class="prow ${c[2]==='부재중'?'miss':''}" style="cursor:pointer" onclick="dial('${esc(c[0].replace(/ \(\d+\)$/,''))}')"><span class="pi">${c[2]==='발신'?'<svg viewBox="0 0 24 24"><path d="M6.6 3.2c.6-.3 1.4-.1 1.8.5l1.9 3c.4.6.3 1.4-.2 1.9l-1.4 1.3a12.4 12.4 0 0 0 5.4 5.4l1.3-1.4c.5-.5 1.3-.6 1.9-.2l3 1.9c.6.4.8 1.2.5 1.8l-.9 1.9c-.5 1-1.6 1.6-2.7 1.4C10 19.6 4.4 14 3.3 6.8c-.2-1.1.4-2.2 1.4-2.7Z"/></svg>':''}</span><div class="pn"><b>${esc(callNameDisp(c[0]))}</b><small>${t('mobile')}</small></div><span class="pd">${callWhen(c[1])}</span><span class="inf">${G.info}</span></div>`).join('')}</div>
 ${tabbar([['star',t('favorites')],['clock',t('recents')],['contacts',t('contacts')],['keypad',t('keypad')],['voicemail',t('voicemail')]],1)}`}};

/* --- KKT --- */
const IM_EXTRA_GROUPS = [
  // Add the exact chatroom title here, e.g. 'Kinder A Parents 🧸'
];
const isGroup=n=>/Accounting Team/.test(n)||IM_EXTRA_GROUPS.includes(n)||Boolean(MEMBERS[n]);
const MEMBERS={'Accounting Team':3,'엑소 🪐': 6,'SM 러닝크루 🏃🔥':9};
function lastDate(n){const d=((chatData[n]||[]).filter(x=>x[1]==='date').slice(-1)[0]||[''])[0];return d==='10월 16일'?'어제':d}
function dateKey(n){if(n==='Kyungsoo my love 💞')return 9999;const l=lastDate(n);if(l==='어제')return 1016;const m=l.match(/(\d+)월 (\d+)일/);return m?+m[1]*100+ +m[2]:0}
function previewText(s,grp){const m=mediaLabels[s];if(m)return m.kind==='image'?t('photo'):t('voiceMsg');const b=s.match(/^\[(.+)\]$/);if(b)return /기프티콘/.test(b[1])?t('giftSent'):/파일/.test(b[1])&&!/영상/.test(b[1])?t('fileColon')+fileInfo(b[1])[0]:/영상/.test(b[1])?t('video'):t('photo');return grp?s.replace(/^[^:：]+[:：]\s*/,''):s}
//function avatarFor(name,group){if(/Kyungsoo my love 💞/.test(name))return '<img src="media/kyungsoo_kakao_profile.jpg" alt="">';if(group)return `<svg viewBox="0 0 24 24"><circle cx="8.5" cy="9" r="3" fill="#fff"/><circle cx="15.5" cy="9" r="3" fill="#fff"/><path d="M2.5 19c.4-3 2.9-5 6-5s5.6 2 6 5ZM9.5 19c.4-3 2.9-5 6-5s5.6 2 6 5Z" fill="#fff"/></svg>`;return G.sil}
/* FIX 2 — Find the entire one-line function beginning with:
   function avatarFor(name,group){
   Replace that function with: */
function avatarFor(name,group){
  if(/Kyungsoo my love 💞/.test(name)) return '<img src="media/kyungsoo_kakao_profile.jpg" alt="">';
  const photo = typeof IM_SENDER_PHOTOS !== 'undefined' ? IM_SENDER_PHOTOS[name] : '';
  if(photo) return '<img src="'+esc(photo)+'" alt="">';
  if(group) return `<svg viewBox="0 0 24 24"><circle cx="8.5" cy="9" r="3" fill="#fff"/><circle cx="15.5" cy="9" r="3" fill="#fff"/><path d="M2.5 19c.4-3 2.9-5 6-5s5.6 2 6 5ZM9.5 19c.4-3 2.9-5 6-5s5.6 2 6 5Z" fill="#fff"/></svg>`;
  return G.sil;
}

// ===== iMESSAGE DEFAULT UNREAD STATUS =====
// A chat is unread by default if its last message is from "them".
// Opening the chat marks it as read.

const IM_READ_KEY = 'imessage_read_chats';

let imReadChats = new Set();

try {
  imReadChats = new Set(
    JSON.parse(localStorage.getItem(IM_READ_KEY) || '[]')
  );
} catch (e) {
  imReadChats = new Set();
}

function initIMUnread() {
  chatNames.forEach(name => {
    const messages = chatData[name] || [];

    const last = messages
      .slice()
      .reverse()
      .find(m => Array.isArray(m) && m[1] !== 'date');

    if (imReadChats.has(name)) {
      unread[name] = 0;
    } else {
      unread[name] = last && last[1] === 'them' ? 1 : 0;
    }
  });
}
//initIMUnread();

function markIMRead(name) {
  imReadChats.add(name);

  try {
    localStorage.setItem(IM_READ_KEY, JSON.stringify([...imReadChats]));
  } catch (e) {}

  unread[name] = 0;

  if (name === 'Kyungsoo my love 💞') {
    ksooUnread = 0;
  }

  updateIsland();
}



function otherUnread(){return Object.entries(unread).filter(([k])=>k!==chatId).reduce((a,[,b])=>a+b,0)+(chatId==='Kyungsoo my love 💞'?0:ksooUnread)}
VIEWS.kakao=()=>{const list=chatNames.slice().sort((a,b)=>dateKey(b)-dateKey(a));
 return{cls:'kk',html:`<div class="kk-h"><b>Messages</b><span>${G.search}${G.chatPlus}</span></div><div class="scroll">${list.map(n=>{const arr=chatData[n]||[];let last=arr.filter(x=>x[1]!=='date').slice(-1)[0],time=fmtLabel(lastDate(n)),cnt=unread[n]||0;
  if(n==='Kyungsoo my love 💞'&&todayChat.length){last=todayChat[todayChat.length-1];time=last[2];cnt=ksooUnread}
  return `<button class="crow" onclick="chatId=${esc(JSON.stringify(n))};push('chat')"><div class="av">${avatarFor(n,isGroup(n))}</div><div style="flex:1;min-width:0"><div class="cn">${esc(dn(n))}${MEMBERS[n]?`<small>${MEMBERS[n]}</small>`:''}</div><div class="cp">${last?esc(previewText(last[0],isGroup(n))):''}</div></div><div class="cm"><span class="ct">${time}</span>${cnt?`<span class="kbdg">${cnt}</span>`:''}</div></button>`}).join('')}</div>
 `}};

 initIMUnread();


 /* CHAT ROOM */
const AUD_DUR={'media/my_love.mp3':'0:25','media/ssk.mp3':'1:40'};
function fileInfo(n){return({'과제 파일':[t('f_assign'),'1.2MB'],'수정한 과제 파일':[t('f_assign2'),'1.3MB'],'실기 체크 시트 파일':[t('f_check'),'48KB']})[n]||[n+'.pdf','820KB']}
function voiceMemoAttachment(s){
 const match=String(s).match(/^\[Voice Memo: (.+)\]$/i);
 if(!match)return null;
 const i=VM_RECORDINGS.findIndex(r=>r.title.toLowerCase().includes(match[1].toLowerCase()));
 if(i<0)return `<div class="bb">${esc(s)}</div>`;
 const r=VM_RECORDINGS[i];
 return `<button type="button" class="bb im-vm-attachment" onclick="event.stopPropagation();openAttachedVoiceMemo(${i})" aria-label="Tap to read ${vmSafe(r.title)} in Voice Memos"><span class="im-vm-icon">▥</span><span class="im-vm-details"><strong>${vmSafe(r.title)}.m4a</strong><small>Voice Memos · ${vmTime(vmDuration(r))}</small><em>Tap to Read</em></span><span class="im-vm-arrow">›</span></button>`;
}
function bubble(s){const attachment=voiceMemoAttachment(s);if(attachment)return attachment;const m=mediaLabels[s];
 if(m&&m.kind==='image')return `<div class="bb img" onclick="event.stopPropagation();openViewerSrc('${m.src}',this.firstElementChild)"><img src="${m.src}" alt=""></div>`;
 if(m&&m.kind==='audio'){let w='';for(let i=0;i<20;i++)w+=`<i style="height:${5+Math.round(Math.abs(Math.sin(i*1.7+s.length))*15)}px;animation-delay:-${(i%5)*.13}s"></i>`;return `<div class="bb aud" data-src="${m.src}" onclick="event.stopPropagation();playChatAudio(this)"><span class="pl">${G.playF}</span><span class="wv">${w}</span><span class="du">${AUD_DUR[m.src]||'0:10'}</span></div>`}
 const b=s.match(/^\[(.+)\]$/);if(b){const n=b[1];
  if(/기프티콘/.test(n))return `<div class="bb gift"><div class="gt">🍵</div><div class="gb"><b>${t('giftArrived')}</b>${t('giftItem')}</div><div class="gbtn">${t('giftCheck')}</div></div>`;
  if(/파일/.test(n)&&!/영상/.test(n)){const f=fileInfo(n);return `<div class="bb file"><span class="fi">${f[0].split('.').pop().toUpperCase()}</span><div><div class="fn">${esc(f[0])}</div><div class="fs">${t('expired')} · ${f[1]}</div></div></div>`}
  const vid=/영상/.test(n);return `<div class="bb exp">${vid?G.video:G.photo}<span>${vid?t('expVideo'):t('expPhoto')}</span></div>`}
 return `<div class="bb">${esc(s)}</div>`}
//function fullDate(l){return fmtLabel(l,true)}

function fullDate(l) {
  if (l === currentChatDate()) {
    return l;
  }

  return fmtLabel(l, true);
}

function currentChatDate() {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

//function chatItems(id){const arr=id==='Kyungsoo my love 💞'?[...chatData[id],...(todayChat.length?[['오늘','date'],...todayChat]:[])]:(chatData[id]||[]);const grp=isGroup(id);const items=[];let tm=0;

function chatItems(id) {
  const arr = id === 'Kyungsoo my love 💞'
    ? [
        ...chatData[id],
        ...(todayChat.length
          ? [[currentChatDate(), 'date'], ...todayChat]
          : [])
      ]
    : (chatData[id] || []);

  const grp = isGroup(id);
  const items = [];
  let tm = 0;
  
  const TT=CHAT_TIMES[id]||[];arr.forEach((m,i)=>{if(m[1]==='date'){items.push({date:m[0]});return}if(m[1]==='story-vm'){items.push({storyVoiceMemo:m[0]});return}
  let text=m[0],sender=id==='Kyungsoo my love 💞'?'Kyungsoo my love 💞':id;if(grp&&m[1]==='them'){const mm=text.match(/^([^:：]+)[:：]\s*([\s\S]*)$/);if(mm){sender=mm[1];text=mm[2]}}
  if(TT[i]!=null)tm=TT[i];else tm+=1;items.push({who:m[1],text,sender,time:m[2]||ampm(tm),rd:m[3]==='rd'})});return items}
/* Group-chat contact pictures: edit these paths when you add your own photos. */
const IM_GROUP_PHOTOS = {
  // 'Your group name': ['images/person1.jpg', 'images/person2.jpg']
};
//const IM_SENDER_PHOTOS = {
   //'Channie': 'images/chanyeol.jpg',
  // 'Jongin': 'images/jongin.jpg',

  /* FIX 1 — In app.js, find the existing IM_SENDER_PHOTOS object and replace it with: */
const IM_SENDER_PHOTOS = {
  'Channie': 'images/chanyeol.jpg',
  // 'Jongin': 'images/jongin.jpg',
};

function imGroupMembers(id){
  const configured=IM_GROUP_PHOTOS[id];
  if(configured&&configured.length)return configured;
  const names=[];
  (chatData[id]||[]).forEach(m=>{
    if(m[1]!=='them')return;
    const match=String(m[0]).match(/^([^:：]+)[:：]\s*/);
    if(match&&!names.includes(match[1]))names.push(match[1]);
  });
  return names.slice(0,3).map(n=>IM_SENDER_PHOTOS[n]||'');
}
function imGroupHeader(id){
  const pics=imGroupMembers(id);
  const fallback='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" fill="#a5a9b2"/><path d="M4 21c0-5 3-8 8-8s8 3 8 8" fill="#a5a9b2"/></svg>';
  return '<div class="im-group-photos">'+(pics.length?pics:['','','']).slice(0,3).map(src=>'<span class="im-group-photo">'+(src?'<img src="'+esc(src)+'" alt="">':fallback)+'</span>').join('')+'</div>';
}
function imSenderAvatar(sender){const src=IM_SENDER_PHOTOS[sender];return src?'<img src="'+esc(src)+'" alt="">':avatarFor(sender,false)}
function chatMsgs(id){const it=chatItems(id),grp=isGroup(id);let o='';
 it.forEach((x,i)=>{if(x.date){o+=`<div class="dpill"><span>${G.calSm.replace('<svg','<svg width="12" height="12"')}${fullDate(x.date)}</span></div>`;return}
  if(x.storyVoiceMemo){const index=VM_RECORDINGS.findIndex(r=>r.title.toLowerCase().includes(String(x.storyVoiceMemo).toLowerCase()));if(index>=0){const r=VM_RECORDINGS[index];o+=`<div class="im-story-divider"><button type="button" class="im-story-vm" onclick="event.stopPropagation();openAttachedVoiceMemo(${index})" aria-label="Tap to read ${vmSafe(r.title)} in Voice Memos"><span class="im-story-vm-icon">♫</span><span class="im-story-vm-title">${vmSafe(r.title.replace(/^\d+\s*:\s*/,''))}</span><span class="im-story-vm-hint">Tap to Read ›</span></button></div>`;}return;}
  const p=it[i-1],n=it[i+1];
  const first=!p||p.date||p.who!==x.who||p.sender!==x.sender;
  // For group chats, consecutive messages from one sender form one visual stack.
  const lastInRun=!n||n.date||n.who!==x.who||n.sender!==x.sender;
  const last=!n||n.date||n.who!==x.who||n.sender!==x.sender||n.time!==x.time;
  const me=x.who==='me';
  const tm=last?`<div class="tm">${x.rd?'<span class="rd">1</span>':''}<span>${x.time}</span></div>`:(x.rd?'<div class="tm"><span class="rd">1</span></div>':'');
  const showAvatar=!me&&(!grp?first:lastInRun);
  const showName=!me&&first;
  const avatarSlot=grp&&!me?`<div class="im-avatar-slot">${showAvatar?`<div class="sav">${imSenderAvatar(x.sender)}</div>`:''}</div>`:(showAvatar?`<div class="sav">${avatarFor(x.sender)}</div>`:'');
  o+=`<div class="ln ${grp?'im-group-line':''} ${me?'me':'th'} ${first?'first':''} ${grp&&!me&&!lastInRun?'im-stack-continued':''} ${grp&&!me&&lastInRun?'im-stack-last':''}">${avatarSlot}<div class="col" style="${me?'align-items:flex-end':''}">${showName?`<div class="who">${esc(dn(x.sender))}</div>`:''}<div class="wrap">${me?tm+bubble(x.text):bubble(x.text)+tm}</div></div></div>`;
 });return o}

VIEWS.chat=()=>({cls:isGroup(chatId)?'chat im-group-chat':'chat',html:`<div class="chat-h"><button class="bk" onclick="back()">${G.chevL}<span>${otherUnread()||''}</span></button><div class="nm">${isGroup(chatId)?imGroupHeader(chatId):`<div class="im-contact-photo">${avatarFor(chatId,false)}</div>`}<div class="im-contact-name">${esc(dn(chatId))}<span class="im-contact-chevron">›</span></div>${MEMBERS[chatId]?`<small>${MEMBERS[chatId]}</small>`:''}</div><div class="rt"></div></div>
 <div class="msgs" id="msgs" onclick="closeKbd()">${chatMsgs(chatId)}</div>
 <div class="cin safe" id="cin"><span class="im-camera" aria-hidden="true"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M8 3.5h8l2 2.5h3a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l2-2.5zM12 8a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/></svg></span><div class="im-entry"><div class="fld ph" id="fld" onclick="event.stopPropagation();tapInput()">${t('msgInput')}</div><button class="snd" id="snd" onclick="sendLine()">${G.arrowUp}</button></div></div><div class="kbd" id="kbd">${kbdHTML()}</div>`,
 init:()=>{if(chatId==='Kyungsoo my love 💞')ksooUnread=0;else unread[chatId]=0;typing=false;pendingText='';scrollChat()}});
function scrollChat(smooth){const b=$('#msgs');if(!b)return;if(smooth)b.scrollTo({top:b.scrollHeight,behavior:'smooth'});else b.scrollTop=b.scrollHeight}
function refreshChat(pop){const b=$('#msgs');if(!b||view!=='chat')return;b.innerHTML=chatMsgs(chatId);scrollChat();if(pop){const l=b.lastElementChild&&b.lastElementChild.querySelector('.bb');if(l)l.classList.add('pop')}}
function playChatAudio(el){const src=el.dataset.src;document.querySelectorAll('.bb.aud').forEach(x=>{x.classList.remove('playing');x.querySelector('.pl').innerHTML=G.playF});
 if(PLAYER.dataset.voice===src&&!PLAYER.paused){PLAYER.pause();return}nowSong=-1;PLAYER.src=src;PLAYER.dataset.voice=src;PLAYER.play().then(()=>{el.classList.add('playing');el.querySelector('.pl').innerHTML=G.pauseF}).catch(()=>{});
 PLAYER.onended=()=>{el.classList.remove('playing');el.querySelector('.pl').innerHTML=G.playF;delete PLAYER.dataset.voice}}
/* Keyboard + Auto-Type */
const KR=[['ㅂ','ㅈ','ㄷ','ㄱ','ㅅ','ㅛ','ㅕ','ㅑ','ㅐ','ㅔ'],['ㅁ','ㄴ','ㅇ','ㄹ','ㅎ','ㅗ','ㅓ','ㅏ','ㅣ'],['ㅋ','ㅌ','ㅊ','ㅍ','ㅠ','ㅜ','ㅡ']];
const KB_LAT=['qwertyuiop'.split(''),'asdfghjkl'.split(''),'zxcvbnm'.split('')];
const KB_TH=[['ๆ','ไ','ำ','พ','ะ','ั','ี','ร','น','ย','บ','ล'],['ฟ','ห','ก','ด','เ','้','่','า','ส','ว','ง'],['ผ','ป','แ','อ','ิ','ื','ท','ม','ใ','ฝ']];
const KB_JA=[['あ','か','さ'],['た','な','は'],['ま','や','ら'],['小','わ','、']];
function kbdHTML(){const k=c=>`<div class="key" data-k="${c}" data-c="${c}">${c}</div>`;let rows;
 if(LANG==='ja'){const side=['⌫','空白','改行','🌐'];rows=KB_JA.map((r,i)=>`<div class="kr"><div class="key sp" style="max-width:none;flex:1" data-k="${i===0?'→':i===1?'abc':i===2?'あいう':'☺'}">${i===0?'→':i===1?'ABC':i===2?'あいう':'☺'}</div>${r.map(c=>`<div class="key" style="max-width:none;flex:1.3;font-size:20px" data-k="${c}" data-c="${c}">${c}</div>`).join('')}<div class="key sp" style="max-width:none;flex:1;font-size:14px" data-k="${['⌫','space','ret','emo'][i]}">${side[i]==='⌫'?G.bksp:side[i]}</div></div>`).join('');
  return `<div class="kin" onclick="event.stopPropagation();kbdTap(event)">${rows}<div class="kbot">${G.globe}${G.mic}</div></div>`}
 const R=LANG==='ko'?KR:LANG==='th'?KB_TH:KB_LAT;
 const isChinese=LANG==='zh';
 const chineseCandidates=isChinese?`<div class="zh-candidates" style="display:flex;align-items:center;justify-content:space-between;height:35px;padding:0 12px;color:#333;font-size:14px;gap:10px"><span style="font-weight:600">拼音</span><span style="flex:1;text-align:center;color:#666">中文输入</span><span>⌄</span></div>`:''; return `<div class="kin" onclick="event.stopPropagation();kbdTap(event)">${chineseCandidates}<div class="kr">${R[0].map(k).join('')}</div><div class="kr" style="padding:0 ${R[1].length<10?20:3}px">${R[1].map(k).join('')}</div>
 <div class="kr"><div class="key sp" data-k="⇧">${G.shift}</div><span style="width:6px"></span>${R[2].map(k).join('')}<span style="width:6px"></span><div class="key sp" data-k="⌫">${G.bksp}</div></div>
 <div class="kr"><div class="key sp" data-k="123" style="font-size:16px">123</div><div class="key sp" data-k="emo" style="font-size:${isChinese?14:20}px">${isChinese?'中/英':'🙂'}</div><div class="key wide" data-k="space">${isChinese?'空格':t('space')}</div><div class="key ret" data-k="ret">${isChinese?'发送':t('ret')}</div></div>
 <div class="kbot">${isChinese?'<span style="font-size:12px;font-weight:600;margin-right:8px">简体中文 · 拼音</span>':''}${G.globe}${G.mic}</div></div>`}
function openKbd(){const k=$('#kbd');if(!k||k.classList.contains('open'))return;k.classList.add('open');$('#cin').classList.remove('safe');const t0=performance.now();(function f(){scrollChat();if(performance.now()-t0<420)requestAnimationFrame(f)})()}
function closeKbd(){const k=$('#kbd');if(!k||!k.classList.contains('open'))return;k.classList.remove('open');$('#cin').classList.add('safe')}
function pressKey(k){const el=document.querySelector(`#kbd [data-k="${k}"]`);if(!el)return;el.classList.add('dn');if(!el.classList.contains('sp')&&!el.classList.contains('wide')&&!el.classList.contains('ret'))el.classList.add('pv');sfx('key');setTimeout(()=>el.classList.remove('dn','pv'),95)}
function kbdTap(e){const k=e.target.closest('.key');if(!k)return;pressKey(k.dataset.k);vib(5);tapInput()}
const CHO=['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'],JUNG=['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'],JONG=['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const VS={'ㅘ':'ㅗㅏ','ㅙ':'ㅗㅐ','ㅚ':'ㅗㅣ','ㅝ':'ㅜㅓ','ㅞ':'ㅜㅔ','ㅟ':'ㅜㅣ','ㅢ':'ㅡㅣ'},FS={'ㄳ':'ㄱㅅ','ㄵ':'ㄴㅈ','ㄶ':'ㄴㅎ','ㄺ':'ㄹㄱ','ㄻ':'ㄹㅁ','ㄼ':'ㄹㅂ','ㄽ':'ㄹㅅ','ㄾ':'ㄹㅌ','ㄿ':'ㄹㅍ','ㅀ':'ㄹㅎ','ㅄ':'ㅂㅅ'},DBL={'ㄲ':'ㄱ','ㄸ':'ㄷ','ㅃ':'ㅂ','ㅆ':'ㅅ','ㅉ':'ㅈ','ㅒ':'ㅐ','ㅖ':'ㅔ'};
const KK=j=>DBL[j]?['⇧',DBL[j]]:[j];
function jamoSteps(str){const st=[];let done='';for(const ch of str){const c=ch.charCodeAt(0);
 if(c>=0xAC00&&c<=0xD7A3){const s=c-0xAC00,ci=Math.floor(s/588),vi=Math.floor(s%588/28),ti=s%28,cp=(v,t)=>String.fromCharCode(0xAC00+ci*588+v*28+t);
  st.push({k:KK(CHO[ci]),t:done+CHO[ci]});const v=VS[JUNG[vi]];if(v){st.push({k:[v[0]],t:done+cp(JUNG.indexOf(v[0]),0)});st.push({k:[v[1]],t:done+cp(vi,0)})}else st.push({k:KK(JUNG[vi]),t:done+cp(vi,0)});
  if(ti){const f=FS[JONG[ti]];if(f){st.push({k:[f[0]],t:done+cp(vi,JONG.indexOf(f[0]))});st.push({k:[f[1]],t:done+cp(vi,ti)})}else st.push({k:KK(JONG[ti]),t:done+cp(vi,ti)})}done+=ch}
 else{done+=ch;st.push({k:ch===' '?['space']:/[ㄱ-ㅣ]/.test(ch)?KK(ch):[],t:done})}}return st}
const JA_ROW={};[['あ','あいうえおぁぃぅぇぉ'],['か','かきくけこがぎぐげご'],['さ','さしすせそざじずぜぞ'],['た','たちつてとだぢづでどっ'],['な','なにぬねの'],['は','はひふへほばびぶべぼぱぴぷぺぽ'],['ま','まみむめも'],['や','やゆよゃゅょ'],['ら','らりるれろ'],['わ','わをんゎー'],['、','、。？！?!…〜']].forEach(([k,s])=>[...s].forEach(c=>JA_ROW[c]=k));
const rnd=a=>a[Math.floor(Math.random()*a.length)];
function keysFor(ch){if(ch===' ')return['space'];
 if(LANG==='ja'){let c=ch;const cc=c.charCodeAt(0);if(cc>=0x30A1&&cc<=0x30F6)c=String.fromCharCode(cc-0x60);if(JA_ROW[c])return[JA_ROW[c]];if(/[一-鿿]/.test(ch))return[rnd(['あ','か','さ','た','な','は','ま','や','ら']),'space'];return[]}
 if(LANG==='th'){return KB_TH.flat().includes(ch)?[ch]:[]}
 if(LANG==='zh'&&/[一-鿿]/.test(ch)){const l='qwertyuiopasdfghjklzxcvbnm';return[rnd(l),rnd(l),'space']}
 const base=ch.normalize('NFD')[0];const lo=base.toLowerCase();if(/[a-z]/.test(lo))return base!==lo?['⇧',lo]:[lo];return[]}
function genSteps(str){const st=[];let done='';for(const ch of str){done+=ch;st.push({k:keysFor(ch),t:done})}return st}
function setField(txt,cursor){const f=$('#fld');if(!f)return;if(!txt&&!cursor){f.className='fld ph';f.textContent=t('msgInput');return}f.className='fld';f.innerHTML=esc(txt)+(cursor?'<span class="cur"></span>':'')}
//function canType(){return chatId==='Kyungsoo my love 💞'&&todayChat.filter(x=>x[1]==='them').length>=2&&replyStage<liveReplies.length&&!typing&&!pendingText&&!replyBusy}
function canType(){
  return chatId==='Kyungsoo my love 💞'
    && introReady
    && replyStage<liveReplies.length
    && !typing
    && !pendingText
    && !replyBusy;
}
function tapInput(){openKbd();if(!canType()){setField(pendingText,true);return}typeLine(liveReplies[replyStage].mine[lineIdx])}

function typeLine(line) {
  typing = true;

  const steps = LANG === 'ko' ? jamoSteps(line) : genSteps(line);
  let i = 0;

  setField('', true);

  (function step() {
    if (view !== 'chat') {
      typing = false;
      return;
    }

    if (i >= steps.length) {
      typing = false;
      pendingText = line;

      const s = $('#snd');
      if (s) s.classList.add('on');

      return;
    }

    const s = steps[i++];

    // Faster virtual keyboard animation
    s.k.forEach((k, j) => {
      setTimeout(() => pressKey(k), j * 20);
    });

    setField(s.t, true);

    // Faster LIVE REPLIES typing
    const delay =
      (LANG === 'ko' ? 25 : 35) +
      Math.random() * 25 +
      (s.k.length > 1 ? s.k.length * 20 : 0) +
      (s.k[0] === 'space' ? 25 : 0);

    setTimeout(step, delay);
  })();
}

function sendLine(){if(!pendingText)return;const stage=liveReplies[replyStage];todayChat.push([pendingText,'me',nowAmpm(),'rd']);pendingText='';sfx('send');vib(10);setField('',false);$('#snd').classList.remove('on');refreshChat(true);lineIdx++;
 //if(lineIdx<stage.mine.length){setTimeout(()=>{if(view==='chat'&&chatId==='Kyungsoo my love 💞'&&$('#kbd.open'))typeLine(stage.mine[lineIdx])},500);return}
 //replyStage++;lineIdx=0;replyBusy=true;const them=stage.them.slice();
 if(lineIdx<stage.mine.length){
  setTimeout(()=>{
    if(
      view==='chat' &&
      chatId==='Kyungsoo my love 💞' &&
      $('#kbd.open')
    ){
      typeLine(stage.mine[lineIdx]);
    }
  },500);
  return;
}
// Kyungsoo can call only after Jongin sends "call meee"
if(askedCall && stage.mine===CALL_ASK_REPLY){
  callReplySent=true;
  nextCallAt=elapsed()+4.5;
}


replyStage++;
lineIdx=0;
replyBusy=true;
const them=stage.them.slice();
 setTimeout(()=>{todayChat.forEach(x=>{if(x[3]==='rd')x[3]=''});refreshChat()},900);
 let t=1500;them.forEach((msg,k)=>{const typingDur=700+msg.length*55;setTimeout(()=>showTyping(),t);t+=typingDur;setTimeout(()=>{hideTyping();deliverKyungsoo(msg)},t);t+=350});
 setTimeout(()=>{replyBusy=false},t+50)}
function showTyping(){if(!(view==='chat'&&chatId==='Kyungsoo my love 💞'))return;const b=$('#msgs');if(!b||$('#typ'))return;b.insertAdjacentHTML('beforeend',`<div class="ln th first" id="typ"><div class="sav">${avatarFor('Kyungsoo my love 💞')}</div><div class="col"><div class="who">Kyungsoo my love 💞</div><div class="wrap"><div class="bb typing pop"><i></i><i></i><i></i></div></div></div></div>`);scrollChat(true)}
function hideTyping(){const t=$('#typ');if(t)t.remove()}
function deliverKyungsoo(text){todayChat.push([text,'them',nowAmpm()]);
 if(view==='chat'&&chatId==='Kyungsoo my love 💞'){refreshChat(true);tone(1318,0,.12,.05)}
 else{ksooUnread++;notify(text);if(view==='kakao')show('kakao');if(view==='home')renderHome()}}
//function incomingMsg(text){if(view==='chat'&&chatId==='Kyungsoo my love 💞'){showTyping();setTimeout(()=>{hideTyping();deliverKyungsoo(text)},1500)}else deliverKyungsoo(text)}
function incomingMsg(text,onDelivered){
  const deliver=()=>{
    hideTyping();
    deliverKyungsoo(text);

    if(typeof onDelivered==='function'){
      onDelivered();
    }
  };

  if(view==='chat'&&chatId==='Kyungsoo my love 💞'){
    showTyping();
    setTimeout(deliver,1500);
  }else{
    deliver();
  }
}



/* --- NOTIFICATION BANNER --- */
function notify(body){sfx('msg');vib([30,60,30]);
 if(view==='lock'||view==='pin'){// Remove previous KakaoTalk notifications
lockNotes = lockNotes.filter(n => n.app !== 'kakao');

// Add the newest KakaoTalk notification
lockNotes.unshift({
  title: 'Kyungsoo my love 💞',
  body,
  app: 'kakao',
  time: t('now')
});

// Refresh the lock screen
renderLock();const c=document.querySelector('.lk-notes .ncard');if(c)c.animate([{transform:'translateY(-30px) scale(.9)',opacity:0},{transform:'none',opacity:1}],{duration:500,easing:'cubic-bezier(.2,1.2,.4,1)'});return}
 OV.querySelectorAll('.banner').forEach(b=>b.remove());const b=document.createElement('div');b.className='banner';b.innerHTML=`<div class="ncard">${ncardHTML({title:'Kyungsoo',body,app:'kakao',time:t('now')})}</div>`;OV.appendChild(b);
 b.animate([{transform:'translateY(-140%) scale(.96)'},{transform:'none'}],{duration:620,easing:'cubic-bezier(.2,1.25,.35,1)'});
 let y0=null,dy=0,mv=false;const hide=()=>{if(!b.isConnected)return;b.animate([{transform:`translateY(${Math.min(0,dy)}px)`},{transform:'translateY(-150%)'}],{duration:320,easing:'ease-in',fill:'forwards'}).onfinish=()=>b.remove()};
 const tm=setTimeout(hide,5600);
 b.addEventListener('pointerdown',e=>{y0=e.clientY;mv=false;b.setPointerCapture(e.pointerId)});
 b.addEventListener('pointermove',e=>{if(y0===null)return;dy=(e.clientY-y0)/SC;if(Math.abs(dy)>5)mv=true;b.style.transform=`translateY(${dy<0?dy:dy*.25}px)`});
 b.addEventListener('pointerup',()=>{if(y0===null)return;y0=null;clearTimeout(tm);if(dy<-30){hide();return}b.style.transform='';if(!mv){b.remove();openKyungsoo(b)}})}
function openKyungsoo(el){if(callState)return;chatId='Kyungsoo my love 💞';if(view==='home'){openApp('chat',el.querySelector?el:null);return}if(view==='chat'&&chatId==='Kyungsoo my love 💞')return;if(['lock','pin'].includes(view))return;push('chat')}

/* --- Safari --- */
VIEWS.safari=()=>{if(safSearch)return{cls:'saf',html:`<div style="position:absolute;top:54px;left:0;right:0;padding:6px 14px;display:flex;gap:12px;align-items:center;z-index:3"><div class="srch" style="margin:0;flex:1;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.08);height:40px">${G.search}<span style="color:#000">|</span><span>${t('searchWeb')}</span></div><button style="color:var(--blue);font-size:17px" onclick="safSearch=false;show('safari')">${t('cancel')}</button></div>
 <div class="scroll" style="padding-top:112px"><div style="display:flex;justify-content:space-between;margin:0 16px 8px"><b style="font-size:20px">${t('recentSearches')}</b><span style="color:var(--blue)">${t('clear')}</span></div><div class="group srec">${searches.map(s=>`<div class="row" style="--inset:44px">${G.clock.replace('<svg','<svg width="18" height="18" style="color:#8e8e93;flex:none"')}<span>${esc(s)}</span></div>`).join('')}</div></div>`,init:pg=>pg.querySelector('.srec').animate([{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'none'}],{duration:300})};
  const fav=[
  ['Little Steps Montessori', '🏫', '#4778c7'],
  ['BIR eServices', '🧾', '#167a55'],
  ['Google Sheets', '📊', '#24865b'],
  ['Google Calendar', '📅', '#4285f4'],
  ['Healthy Recipes', '🍱', '#e38a42'],
  ['Pediatric Care', '🩺', '#54a6a6'],
  ['Shopee', '🛍️', '#ee6934'],
  ['GRINDR', '🎭', '#5a8fdb']
 ].map(([name,icon,color])=>[icon,name,color]);
 //const fav=[['sf_portal','#2a5bd7'],['sf_acad','#1e8e5a'],['sf_lib','#8b5a2b'],['sf_elearn','#d9480f'],['sf_pe','#4b6cb7'],['sf_mail','#5e5ce6'],['sf_news','#34c759'],['app_maps','#ff9f0a']].map(([k,c])=>[[...t(k)][0].toUpperCase(),t(k),c]);
 return{cls:'saf',html:`<div class="scroll"><div class="sh" style="font-size:22px">${t('favoritesSf')}</div><div class="favs">${fav.map(f=>`<div class="fav"><i style="color:${f[2]}">${f[0]}</i>${f[1]}</div>`).join('')}</div>
 <div class="sh" style="font-size:22px;margin-top:28px">${t('privacyReport')}</div><div class="group" style="padding:14px 16px;display:flex;gap:12px;align-items:center;font-size:15px"><span style="font-size:26px">🛡️</span><span>${t('privacyText')}</span></div>
 <div class="sh" style="font-size:22px;margin-top:28px">${t('readingList')}</div><div class="group"><div class="row muted" style="font-size:15px">${t('readingEmpty')}</div></div></div>
 <div class="sbar"><button class="ad" style="width:100%" onclick="safSearch=true;show('safari')"><b>${t('aa')}</b><span style="flex:1;text-align:center">${t('searchWeb')}</span>${G.mic.replace('<svg','<svg width="18" height="18"')}</button><div class="tb">${G.chevLb.replace('<svg','<svg class="dis"')}${G.chevRb.replace('<svg','<svg class="dis"')}${G.share}${G.book}${G.tabs}</div></div>`}};

/* --- Mail --- */
function mailDate(s){const m=s.match(/^(\d+)\/(\d+)$/);if(m)return fmtNum(2026,+m[1],+m[2]);if(s==='2025')return fmtNum(2025,12,2);if(s==='어제')return t('yesterday');return s}
VIEWS.mail=()=>({html:navHTML({title:t('inbox'),back:t('mailboxes'),backFn:'closeApp()',right:t('edit')})+`<div class="scroll"><h1 class="lt">${t('inbox')}</h1><div class="srch">${G.search}${t('search')}</div>
 ${emails.map((e,i)=>`<button class="mrw" onclick="mailId=${i};readMail.add(${i});push('maild')"><span class="dot ${i<2&&!readMail.has(i)?'':'r'}"></span><div class="bd"><div class="l1"><b>${esc(e[0])}</b><span>${mailDate(e[3])}${G.chevR}</span></div><div class="sj">${esc(e[1])}</div><div class="pv">${esc(e[2])}</div></div></button>`).join('')}</div>
 <div class="toolbar">${G.filter}<span style="color:#000;font-size:11px;text-align:center;align-self:center">${t('updatedNow')}</span>${G.compose}</div>`});
function mailSignoff(sender){
 const name=String(sender).trim();
 if(/shopee/i.test(name))return 'Thank you,\nShopee Team';
 if(/lazada/i.test(name))return 'Thank you,\nLazada Team';
 if(/montessori|school/i.test(name))return 'Thank you,\nSchool Administration';
 if(/apple/i.test(name))return 'Thank you,\nApple Support';
 if(/spotify/i.test(name))return 'Thank you,\nSpotify Team';
 if(/chanyeol|chan\b/i.test(name))return 'Thanks,\nChanyeol';
 return 'Thank you,\n'+name;
}
VIEWS.maild=()=>{const e=emails[mailId];const body=e[2]+'\n\n'+mailSignoff(e[0]);
 return{html:navHTML({title:'',back:t('inbox'),right:'',solid:false})+`<div class="scroll"><div class="mail-d"><div class="hd"><span class="ini">${esc(e[0][0])}</span><div style="flex:1"><b>${esc(e[0])}</b><small>${t('toMe')}</small></div><small class="muted">${mailDate(e[3])}</small></div><h2>${esc(e[1])}</h2><div class="bd" style="white-space:pre-line">${esc(body)}</div></div></div><div class="toolbar">${G.trash}${G.bookmark}${G.share.replace('M12 3v12M8 7l4-4 4 4','M9 15 4 10l5-5M4 10h10a6 6 0 0 1 6 6v3')}${G.compose}</div>`}};

/* --- 사진 --- */
const allPhotos=[];photoSections.forEach(s=>s[1].forEach(n=>allPhotos.push({src:'gallery/'+n,sec:s[0],sub:s[2]})));
const STORY_I=allPhotos.length;allPhotos.push({src:'photos/story_capture_final.png',thumb:'photos/story_last_thumbnail.jpg',sec:'2025년 11월 27일',sub:t('screenshot',fmtTime(21*60+41))});
VIEWS.photos=()=>{let k=0;return{html:`<div class="nav"><span></span><div class="nb-title">${t('library')}</div><div class="nb-right">${G.search}<span>${t('select')}</span></div></div><div class="scroll" style="padding-bottom:120px"><h1 class="lt">${t('library')}</h1><div class="muted" style="margin:-6px 16px 10px;font-size:15px">${t('nPhotos',allPhotos.length)}</div>
 ${photoSections.map(s=>`<div class="ph-sec">${fmtLabel(s[0])}</div><div class="ph-grid">${s[1].map(n=>`<button data-pi="${k}" onclick="openViewer(${k++},this.firstElementChild)"><img src="gallery/${n}" loading="lazy" alt=""></button>`).join('')}</div>`).join('')}
 <div class="ph-sec" style="margin-top:12px">${fmtYM(2025,11)}</div><div class="ph-grid"><button data-pi="${STORY_I}" onclick="openViewer(${STORY_I},this.firstElementChild)"><img src="photos/story_last_thumbnail.jpg" alt=""></button></div></div>
 <div class="phtabs"><button>${t('years')}</button><button>${t('months')}</button><button class="on">${t('allPhotos')}</button></div>`,init:pg=>{const sc=pg.querySelector('.scroll');sc.scrollTop=0}}};
/* GALLERY */
let vList=allPhotos,vIdx=0;
function fitRect(nw,nh){const W=SCREEN.clientWidth,H=SCREEN.clientHeight,s=Math.min(W/nw,H/nh);const w=nw*s,h=nh*s;return{x:(W-w)/2,y:(H-h)/2,w,h}}
function placeImg(img){const f=fitRect(img.naturalWidth||1,img.naturalHeight||1);Object.assign(img.style,{left:f.x+'px',top:f.y+'px',width:f.w+'px',height:f.h+'px'});return f}
function flipFrom(img,r,f){const s=Math.max(r.w/f.w,r.h/f.h),ix=Math.max(0,(f.w*s-r.w)/2/s),iy=Math.max(0,(f.h*s-r.h)/2/s);return{transform:`translate(${r.x+r.w/2-(f.x+f.w/2)}px,${r.y+r.h/2-(f.y+f.h/2)}px) scale(${s})`,clipPath:`inset(${iy}px ${ix}px round ${8/s}px)`}}
function openViewerSrc(src,el){vList=[{src,sec:t('app_kakao'),sub:t('photo')}];openViewer(0,el,true)}
async function openViewer(i,el,custom){if(!custom)vList=allPhotos;vIdx=i;const p=vList[i];const r=el?relRect(el):null;
 const v=document.createElement('div');v.className='viewer';v.innerHTML=`<div class="vbg"></div><img class="vi" src="${p.src}" alt=""><div class="vt"><button class="nb-back" onclick="closeViewer()">${G.chevL}</button><div class="ttl" id="vttl"></div><div class="nb-right" style="color:#fff">${t('edit')}</div></div><div class="vb">${G.share}${G.heart}${G.info}${G.trash}</div>`;OV.appendChild(v);setVTitle();setStatus(true);
 const img=v.querySelector('.vi');try{await img.decode()}catch(e){}const f=placeImg(img);
 if(r){img.animate([flipFrom(img,r,f),{transform:'none',clipPath:`inset(0px 0px round 0px)`}],{duration:420,easing:'cubic-bezier(.2,.9,.25,1)'})}
 v.querySelector('.vbg').animate([{opacity:0},{opacity:1}],{duration:300});[...v.querySelectorAll('.vt,.vb')].forEach(x=>x.animate([{opacity:0},{opacity:1}],{duration:400}));
 viewerGestures(v)}
function setVTitle(){const p=vList[vIdx];const T_=$('#vttl');if(T_)T_.innerHTML=`${esc(fmtLabel(p.sec))}<small>${esc(p.sub||t('photo'))}</small>`}
function closeViewer(){const v=OV.querySelector('.viewer');if(!v)return;const img=v.querySelector('.vi');const th=vList===allPhotos?document.querySelector(`[data-pi="${vIdx}"] img`):null;
 const f={x:parseFloat(img.style.left),y:parseFloat(img.style.top),w:parseFloat(img.style.width),h:parseFloat(img.style.height)};
 const cur=getComputedStyle(img).transform;
 if(th&&view==='photos'){th.scrollIntoView({block:'nearest'});const r=relRect(th);img.animate([{transform:cur==='none'?'none':cur},flipFrom(img,r,f)],{duration:380,easing:'cubic-bezier(.3,.8,.25,1)',fill:'forwards'})}
 else img.animate([{transform:cur==='none'?'none':cur,opacity:1},{transform:'scale(.85)',opacity:0}],{duration:300,fill:'forwards'});
 v.querySelector('.vbg').animate([{opacity:getComputedStyle(v.querySelector('.vbg')).opacity},{opacity:0}],{duration:360,fill:'forwards'});[...v.querySelectorAll('.vt,.vb')].forEach(x=>x.style.opacity=0);
 setTimeout(()=>{v.remove();setStatus(viewDark());updateIsland()},390)}
function viewerGestures(v){const img=v.querySelector('.vi'),bg=v.querySelector('.vbg');let x0=null,y0=0,dx=0,dy=0,mode=null;
 v.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;x0=e.clientX;y0=e.clientY;dx=dy=0;mode=null;v.setPointerCapture(e.pointerId)});
 v.addEventListener('pointermove',e=>{if(x0===null)return;dx=(e.clientX-x0)/SC;dy=(e.clientY-y0)/SC;if(!mode&&Math.hypot(dx,dy)>8)mode=Math.abs(dx)>Math.abs(dy)?'h':'v';
  if(mode==='h')img.style.transform=`translateX(${dx}px)`;if(mode==='v'){const k=Math.max(.6,1-Math.max(0,dy)/900);img.style.transform=`translate(${dx}px,${dy}px) scale(${k})`;bg.style.opacity=Math.max(0,1-Math.max(0,dy)/400)}});
 v.addEventListener('pointerup',async()=>{if(x0===null)return;x0=null;
  if(!mode){v.classList.toggle('bare');return}
  if(mode==='v'&&dy>110){closeViewer();return}
  if(mode==='h'&&Math.abs(dx)>70&&vList[vIdx+(dx<0?1:-1)]){const dir=dx<0?1:-1;img.animate([{transform:`translateX(${dx}px)`},{transform:`translateX(${-dir*110}%)`}],{duration:220,fill:'forwards'});
   setTimeout(async()=>{vIdx+=dir;img.getAnimations().forEach(a=>a.cancel());img.style.transform='';img.src=vList[vIdx].src;try{await img.decode()}catch(e){}placeImg(img);setVTitle();img.animate([{transform:`translateX(${dir*110}%)`},{transform:'none'}],{duration:280,easing:'cubic-bezier(.2,.9,.25,1)'})},210);return}
  img.animate([{transform:img.style.transform||'none'},{transform:'none'}],{duration:300,easing:'cubic-bezier(.2,1.2,.4,1)'});img.style.transform='';bg.style.opacity=1})}

/* --- Instagram --- */
const REELS=[{t:'my shy sweet baby doll',d:fmtYMD(2026,10,24),v:'4,451',n:214},{t:'🐻🐧',d:fmtYMD(2026,9,11),v:'12,143',n:168},{t:'after practice',d:fmtYMD(2025,11,25),v:'14,888',n:888}];
VIEWS.instagram=()=>({cls:'ig',html:`<div class="ig-h"><button onclick="closeApp()" style="width:26px">${G.chevLb}</button><b>ninibear</b>${G.bell}${G.dotsH}</div><div class="scroll">
 <div class="igp"><div class="pp"><img src="media/kai_instagram_avatar.jpg" alt=""></div><div class="st"><span><b>3</b>${t('posts')}</span><span><b>124</b>${t('followers')}</span><span><b>7</b>${t('following')}</span></div></div>
 
<div class="igbio">
  <b></b>
  <br>${t('you found me')}
  <div class="ig-bio-link">
    ${G.link || '🔗'} <span>youtu.be/QqkLnNClpAQ?si=8e15YlTIWPcPjzoD and 1 more</span>
  </div>
</div>

 <div class="igbtn"><button>${t('Edit profile')}</button><button>${t('Share profile')}</button><button class="sq">${G.person.replace('<svg','<svg width="18" height="18"')}</button></div>
 <div class="igtabs"><span class="on">${G.grid}</span><span>${G.reels}</span><span>${G.tag}</span></div>
 <div class="iggrid">${['kai_instagram_01.jpg','kai_instagram_02.jpg','kai_instagram_03.jpg'].map((x,i)=>`<button onclick="videoIndex=${i};push('reel')"><img src="media/${x}" alt=""><svg class="rc" viewBox="0 0 24 24"><path d="M3.5 7.5A4 4 0 0 1 7.5 3.5h9a4 4 0 0 1 4 4v9a4 4 0 0 1-4 4h-9a4 4 0 0 1-4-4Zm6.5 3v7l6-3.5Z"/></svg><span class="vc">${G.playF.replace('<svg','<svg fill="none" stroke="#fff"')}${REELS[i].v}</span></button>`).join('')}</div></div>
 ${tabbar([['home',''],['search',''],['plusSq',''],['reels',''],['<span style="width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,#bbb,#888);display:block"></span>','']],-1)}`});

function reelInner(i) {
  const r = REELS[i];

  return `<div class="vwrap">
    <video src="media/kai_instagram_0${i+1}.mp4" loop playsinline></video>

    <div class="ract">
      <div class="liked">${G.heart}<span>${r.n+1}</span></div>
      <div>${G.comment}<span>${12+i*7}</span></div>
      <div>${G.send}<span>${3+i}</span></div>
      <div>${G.dotsH}</div>
    </div>

    <div class="rinfo">
      <div class="u">
        <img src="media/kai_instagram_avatar.jpg" alt="">
        ninibear
      </div>
      ${esc(r.t)}
      <br>
      <small>${r.d} · ${t('likedBy','d0hk',r.n)}</small>
      <br>
      <small>ninibear · Original Audio</small>
    </div>
  </div>`;
}

VIEWS.reel=()=>({cls:'reel dark',dark:true,html:`<div id="rhost">${reelInner(videoIndex)}</div><div class="rtop"><button class="rback" onclick="back()" aria-label="${t('back')}">${G.chevLb}</button><span>${t('reels')}</span>${G.camera}</div>${tabbar([['home',''],['search',''],['plusSq',''],['reels',''],['person','']],3).replace(/<button class="(on)?">/g,'<button class="$1" onclick="back()">')}`,
 init:pg=>{playReel(pg);let y0=null,dy=0;pg.addEventListener('pointerdown',e=>{if(e.target.closest('button,.tabbar'))return;y0=e.clientY;dy=0});pg.addEventListener('pointermove',e=>{if(y0===null)return;dy=(e.clientY-y0)/SC;const w=pg.querySelector('.vwrap');if(w)w.style.transform=`translateY(${dy*.6}px)`});
  pg.addEventListener('pointerup',()=>{if(y0===null)return;y0=null;const w=pg.querySelector('.vwrap');const n=videoIndex+(dy<0?1:-1);
   if(Math.abs(dy)>80&&REELS[n]){w.animate([{transform:w.style.transform},{transform:`translateY(${dy<0?-100:100}%)`}],{duration:250,fill:'forwards'});setTimeout(()=>{videoIndex=n;$('#rhost').innerHTML=reelInner(n);$('#rhost .vwrap').animate([{transform:`translateY(${dy<0?100:-100}%)`},{transform:'none'}],{duration:330,easing:'cubic-bezier(.2,.9,.25,1)'});playReel(pg)},240)}
   else{if(w){w.style.transform='';if(Math.abs(dy)<6){const vd=w.querySelector('video');vd.paused?vd.play():vd.pause()}}}})}});
function playReel(pg){const v=pg.querySelector('video');if(!v)return;
v.muted = false;
v.volume = 1;

v.play().catch(err => {
  console.warn("Reel audio playback blocked:", err);
});
if(nowSong>=0)PLAYER.pause();v.muted=false;v.play().catch(()=>{v.muted=true;v.play().catch(()=>{})})}

/* --- MUSIC --- */
const artStyle=i=>ART[i]?`background-image:url(${ART[i]})`:'';
VIEWS.music=()=>({html:navHTML({title:t('songs'),back:t('libraryMu'),backFn:'closeApp()',right:''})+`<div class="scroll" style="padding-bottom:180px"><h1 class="lt">${t('songs')}</h1>
 <div style="display:flex;gap:12px;margin:4px 16px 14px"><button onclick="playSong(0)" style="flex:1;background:#eeeef0;border-radius:10px;padding:12px;color:#fa2d48;font-weight:600;display:flex;justify-content:center;gap:6px;align-items:center">${G.playF.replace('<svg','<svg width="14" fill="#fa2d48"')}${t('play')}</button><button onclick="playSong(Math.floor(Math.random()*${songs.length}))" style="flex:1;background:#eeeef0;border-radius:10px;padding:12px;color:#fa2d48;font-weight:600">${t('shuffle')}</button></div>
 ${songs.map((s,i)=>`<button class="mrow" onclick="playSong(${i})"><span class="art" style="${artStyle(i)}">${ART[i]?'':G.musicNote}</span><span class="mt ${i===nowSong?'pl':''}">${esc(s[0])}<small>${ARTIST[i]}</small></span><span style="color:#8e8e93">${G.dotsH.replace('<svg','<svg width="20"')}</span></button>`).join('')}</div>
 ${miniHTML()}${tabbar([['<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="m10 8.5 5 3.5-5 3.5Z" fill="currentColor"/></svg>',t('listenNow')],['<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/></svg>',t('browse')],['<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="2"/><path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4M5 5a10 10 0 0 0 0 14M19 5a10 10 0 0 1 0 14"/></svg>',t('radio')],['<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 4v16M10 4v16M14.5 4.5l5 15"/></svg>',t('libraryMu')],['search',t('search')]],3).replace(/class="on"/,'class="on" style="color:#fa2d48"')}`});
function miniHTML(){if(nowSong<0)return '';return `<div class="mini" onclick="openNP()"><span class="art" style="${artStyle(nowSong)}">${ART[nowSong]?'':G.musicNote}</span><b>${esc(songs[nowSong][0])}</b><button onclick="event.stopPropagation();toggleSong()">${PLAYER.paused?G.playF:G.pauseF}</button><button onclick="event.stopPropagation();nextSong(1)">${G.fwdF.replace('<svg','<svg width="30"')}</button></div>`}
function playSong(i){nowSong=i;delete PLAYER.dataset.voice;PLAYER.src=songs[i][1];PLAYER.onended=()=>nextSong(1);PLAYER.play().catch(()=>{});if(view==='music'){const sc=APP.querySelector('.scroll').scrollTop;const pg=show('music');pg.querySelector('.scroll').scrollTop=sc}refreshNP()}
function toggleSong(){if(PLAYER.paused)PLAYER.play().catch(()=>{});else PLAYER.pause();setTimeout(()=>{if(view==='music'){const m=APP.querySelector('.mini');if(m)m.outerHTML=miniHTML()}refreshNP();updateIsland()},30)}
function nextSong(d){playSong((nowSong+d+songs.length)%songs.length)}
function openNP(){if(nowSong<0)return;const n=document.createElement('div');n.className='np';OV.appendChild(n);refreshNP();setStatus(true);n.animate([{transform:'translateY(100%)'},{transform:'none'}],{duration:480,easing:'cubic-bezier(.2,.9,.25,1)'});
 let y0=null,dy=0;n.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;y0=e.clientY;dy=0;n.setPointerCapture(e.pointerId)});n.addEventListener('pointermove',e=>{if(y0===null)return;dy=Math.max(0,(e.clientY-y0)/SC);n.style.transform=`translateY(${dy}px)`});n.addEventListener('pointerup',()=>{if(y0===null)return;y0=null;if(dy>120)closeNP();else{n.animate([{transform:n.style.transform},{transform:'none'}],{duration:280,easing:'cubic-bezier(.2,1.2,.4,1)'});n.style.transform=''}})}
function refreshNP(){const n=OV.querySelector('.np');if(!n||nowSong<0)return;const a=ART[nowSong]?`url(${ART[nowSong]})`:'linear-gradient(135deg,#ff9a9e,#fa2d48)';n.classList.toggle('paused',PLAYER.paused);
 n.innerHTML=`<div class="bgart" style="background-image:${a}"></div><button class="grab" onclick="closeNP()"></button><div class="bigart" style="background-image:${a}"></div><div class="ti">${esc(songs[nowSong][0])}<small>${ARTIST[nowSong]}</small></div><div class="bar"><i id="npbar"></i></div><div class="tt"><span id="npc">0:00</span><span id="npr">-0:00</span></div>
 <div class="ctl"><button onclick="nextSong(-1)">${G.bwdF.replace('<svg','<svg width="44"')}</button><button onclick="toggleSong()">${(PLAYER.paused?G.playF:G.pauseF).replace('<svg','<svg width="46"')}</button><button onclick="nextSong(1)">${G.fwdF.replace('<svg','<svg width="44"')}</button></div>`}
function closeNP(){const n=OV.querySelector('.np');if(!n)return;n.animate([{transform:n.style.transform||'none'},{transform:'translateY(100%)'}],{duration:340,easing:'cubic-bezier(.4,0,.6,1)',fill:'forwards'}).onfinish=()=>{n.remove();setStatus(viewDark());updateIsland()}}
const fmtT=s=>Math.floor(s/60)+':'+pad(Math.floor(s%60));
PLAYER.addEventListener('timeupdate',()=>{const b=$('#npbar');if(b&&PLAYER.duration){b.style.width=(PLAYER.currentTime/PLAYER.duration*100)+'%';$('#npc').textContent=fmtT(PLAYER.currentTime);$('#npr').textContent='-'+fmtT(PLAYER.duration-PLAYER.currentTime)}});
PLAYER.addEventListener('play',updateIsland);PLAYER.addEventListener('pause',updateIsland);


/* --- MAP --- */
let mapSel=null,mapPos={x:-480,y:-640};
function mapSVG(){return `<svg width="900" height="1200" viewBox="0 0 900 1200" style="position:absolute;inset:0">
 <rect width="900" height="1200" fill="#f2efe9"/>
 <path d="M0 980C160 940 260 1010 380 1080S640 1150 900 1120V1200H0Z" fill="#b9dcf7"/>
 <path d="M60 700h260v230H60Z" fill="#cfe8c4" rx="20"/><path d="M820 0h80v380h-80Z" fill="#cfe8c4"/>
 <rect x="110" y="110" width="460" height="460" rx="18" fill="#ece3d6"/>
 <g fill="#ddd2c2"><rect x="160" y="180" width="110" height="90" rx="6"/><rect x="400" y="190" width="120" height="110" rx="6"/><rect x="270" y="380" width="130" height="80" rx="6"/><rect x="160" y="400" width="80" height="90" rx="6"/><rect x="440" y="400" width="80" height="110" rx="6"/></g>
 <g fill="#e6e1d8"><rect x="610" y="640" width="90" height="70" rx="4"/><rect x="720" y="640" width="120" height="60" rx="4"/><rect x="610" y="730" width="70" height="90" rx="4"/><rect x="790" y="730" width="80" height="70" rx="4"/><rect x="610" y="900" width="140" height="60" rx="4"/><rect x="770" y="860" width="100" height="90" rx="4"/><rect x="640" y="340" width="120" height="60" rx="4"/><rect x="640" y="470" width="100" height="70" rx="4"/></g>
 <g stroke="#d8d3ca" stroke-width="22" fill="none" stroke-linecap="round"><path d="M0 605H900"/><path d="M590 0V1200"/><path d="M590 760H900"/><path d="M590 450H820"/><path d="M340 570V1000"/><path d="M760 760V980"/></g>
 <g stroke="#fff" stroke-width="18" fill="none" stroke-linecap="round"><path d="M590 0V1200"/><path d="M590 760H900"/><path d="M590 450H820"/><path d="M340 570V1000"/><path d="M760 760V980"/></g>
 <path d="M0 605H900" stroke="#ffe08a" stroke-width="20"/>
 <g stroke="#fff" stroke-width="5" fill="none" stroke-dasharray="2 9"><path d="M120 340H560M340 120V560"/></g>
 <g font-family="-apple-system,Pretendard,sans-serif" fill="#8a8578" font-size="13" font-weight="600" text-anchor="middle">
  <text x="340" y="152" font-size="16" fill="#7d6b55">University Belt</text><text x="190" y="760" fill="#5f8f4e">Rizal Park</text>
  <text x="450" y="598" fill="#9a7d2c">Taft Avenue</text><text x="604" y="250" transform="rotate(90 604 250)">España Boulevard</text><text x="830" y="752">P. Noval Street</text><text x="700" y="442">Café District</text>
  <text x="335" y="425" font-size="11">Sampaloc</text><text x="200" y="450" font-size="11">National Library</text><text x="340" y="582" font-size="11">Manila City</text><text x="560" y="1110" fill="#5b8fbf">Pasig River</text>
 </g></svg>`}
const MG={home:'<path d="M4 11 12 4l8 7v9h-5v-6H9v6H4Z"/>',cup:'<path d="M5 8h11v6a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5Z"/><path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16M8 3v2M11 3v2"/>',pin:'<circle cx="12" cy="10" r="3"/><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z"/>',bag:'<path d="M5 8h14l-1 12H6Z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',game:'<rect x="3" y="8" width="18" height="10" rx="5"/><path d="M8 11v4M6 13h4"/><circle cx="15.5" cy="12" r=".6"/><circle cx="17" cy="14.5" r=".6"/>',mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',bowl:'<path d="M3.5 11h17a8.5 8.5 0 0 1-17 0Z"/><path d="M9 7c0-2 2-2 2-4M13 7c0-2 2-2 2-4"/>',bus:'<rect x="5" y="3" width="14" height="15" rx="3"/><path d="M5 11h14M8 18v2.5M16 18v2.5"/><circle cx="8.5" cy="14.5" r=".7"/><circle cx="15.5" cy="14.5" r=".7"/>'};
const mg=k=>`<svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">${MG[k]}</svg>`;
const placeById=id=>MAP_PLACES.find(p=>p.id===id)||MAP_PLACES.find(p=>p.name===id);
function mapSheet(){if(mapSel){const p=placeById(mapSel);return `<div class="grab"></div><div class="mdet"><div style="display:flex;justify-content:space-between;align-items:flex-start"><div><h2>${esc(p.name)}</h2><div class="sb">${esc(p.sub)}</div></div><button onclick="selPlace(null)" style="width:30px;height:30px;border-radius:50%;background:#e3e3e8;color:#7c7c80;font-size:17px">✕</button></div>
  <div class="acts"><button class="pri">${G.send.replace('<svg','<svg style="color:#fff"')}${p.id==='home'?t('currentLoc'):t('walkMin',p.id==='s'?4:p.id==='corner'?9:12)}</button><button>${G.star}${p.fav?t('favorited'):t('favorite')}</button><button>${G.share}${t('share')}</button><button>${G.dotsH}${t('moreInfo')}</button></div>
  <div class="inf">${(p.info.length?p.info:[[t('info'),t('noInfo')]]).map(r=>`<div><small>${esc(r[0])}</small>${esc(r[1])}</div>`).join('')}</div></div>`}
 const favs=MAP_PLACES.filter(p=>p.fav);
 return `<div class="grab"></div><div class="srch" style="margin:0 0 14px;background:rgba(118,118,128,.14)">${G.search}${t('searchMaps')}</div>
 <div style="display:flex;justify-content:space-between;font-size:15px;font-weight:600;color:var(--grey);margin-bottom:8px"><span>${t('favorites')}</span><span style="color:var(--blue);font-weight:500">${t('moreInfo')}</span></div>
 <div class="mfav">${favs.map(p=>`<button onclick="selPlace('${p.id}')"><span class="fc" style="background:${p.color}">${mg(p.glyph)}</span>${esc(p.name)}<small>${p.id==='home'?t('currentLoc'):t('minN',p.id==='s'?4:9)}</small></button>`).join('')}<button><span class="fc" style="background:#e3e3e8"><svg viewBox="0 0 24 24" style="stroke:var(--blue)"><path d="M12 5v14M5 12h14" stroke-linecap="round"/></svg></span>${t('add')}<small>&nbsp;</small></button></div>
 <div style="font-size:15px;font-weight:600;color:var(--grey);margin:16px 0 8px">${t('recentsMap')}</div><div class="group" style="margin:0">${MAP_RECENTS.map(r=>`<button class="row tap" style="--inset:58px;min-height:56px" onclick="selPlace('${placeById(r[0]).id}')"><span class="st-ic" style="background:${placeById(r[0]).color};border-radius:50%">${mg(placeById(r[0]).glyph).replace('<svg','<svg style="stroke:#fff;fill:none;stroke-width:2"')}</span><span style="flex:1"><div style="font-size:16px">${esc(r[0])}</div><div class="muted" style="font-size:13px">${esc(r[1])}</div></span></button>`).join('')}</div>`}
function mapCanvas(){const pins=MAP_PLACES.map(p=>`<div class="mpin ${p.fav?'':'small'} ${mapSel===p.id?'sel':''}" style="left:${p.x}px;top:${p.y}px" onclick="event.stopPropagation();selPlace('${p.id}')"><span class="pc" style="background:${p.color}">${mg(p.glyph)}</span>${esc(p.name)}</div>`).join('');
 const h=placeById('home');return mapSVG()+`<div class="me-dot" style="left:${h.x-26}px;top:${h.y+30}px"></div>`+pins}
function setMapPos(x,y,anim){const cv=$('#mapcv');if(!cv)return;const W=SCREEN.clientWidth,H=SCREEN.clientHeight;mapPos={x:Math.min(0,Math.max(W-900,x)),y:Math.min(0,Math.max(H-1200,y))};const t=`translate(${mapPos.x}px,${mapPos.y}px)`;if(anim)cv.animate([{transform:cv.style.transform||'none'},{transform:t}],{duration:450,easing:'cubic-bezier(.2,.9,.25,1)'});cv.style.transform=t}
function centerOn(p,anim){const W=SCREEN.clientWidth,H=SCREEN.clientHeight;setMapPos(W/2-p.x,H*.27-p.y,anim)}
function selPlace(id){mapSel=id;const s=$('#msheet');if(s){s.innerHTML=mapSheet();s.animate([{transform:'translateY(16px)',opacity:.6},{transform:'none',opacity:1}],{duration:260})}
 document.querySelectorAll('.mpin').forEach(el=>el.classList.remove('sel'));if(id){const p=placeById(id);const i=MAP_PLACES.indexOf(p);const el=document.querySelectorAll('.mpin')[i];if(el)el.classList.add('sel');centerOn(p,true);vib(8)}}
VIEWS.maps=()=>({cls:'mapv',html:`<div class="mapwrap" id="mapwrap"><div class="mapcv" id="mapcv">${mapCanvas()}</div></div>
 <div class="mbtns"><button>${'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 7l9-4 9 4-9 4Z"/><path d="m3 12 9 4 9-4M3 17l9 4 9-4"/></svg>'}</button><button onclick="centerOn(placeById('home'),true)">${'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 3.5 3.5 10.6l7.2 2.7 2.7 7.2Z"/></svg>'}</button></div>
 <div class="msheet" id="msheet">${mapSheet()}</div>`,
 init:pg=>{centerOn(placeById(mapSel||'home'));const w=pg.querySelector('#mapwrap');let x0=null,y0=0,sx=0,sy=0,mv=false;
  w.addEventListener('pointerdown',e=>{x0=e.clientX;y0=e.clientY;sx=mapPos.x;sy=mapPos.y;mv=false});
  w.addEventListener('pointermove',e=>{if(x0===null)return;const dx=(e.clientX-x0)/SC,dy=(e.clientY-y0)/SC;if(Math.hypot(dx,dy)>4)mv=true;if(mv){w.style.cursor='grabbing';setMapPos(sx+dx,sy+dy)}});
  w.addEventListener('pointerup',()=>{x0=null;w.style.cursor=''})}});

/* --- WEATHER: Manila, Philippines (Open-Meteo live forecast) --- */
/* Replace your existing VIEWS.weather block with this entire block. */
const MANILA_WX = {
  lat: 14.5995, lon: 120.9842, zone: 'Asia/Manila',
  data: null, fetchedAt: 0, pending: null, error: false
};

function manilaWxCode(code, isDay = true) {
  if (code === 0) return { icon: isDay ? G.sun : G.moon, label: 'Clear' };
  if ([1, 2].includes(code)) return { icon: G.pcloud, label: 'Partly Cloudy' };
  if (code === 3) return { icon: G.cloud, label: 'Cloudy' };
  if ([45, 48].includes(code)) return { icon: G.cloud, label: 'Foggy' };
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { icon: G.cloud, label: 'Rain' };
  if ([95, 96, 99].includes(code)) return { icon: G.cloud, label: 'Thunderstorms' };
  return { icon: G.pcloud, label: 'Mostly Cloudy' };
}

/* MANILA WEATHER HOME WIDGET — add this after your MANILA_WX / manilaWxCode functions and before renderHome(). */
function manilaWxWidgetMarkup() {
  const data = MANILA_WX.data;
  const current = data?.current;
  const temp = Number.isFinite(current?.temperature_2m)
    ? `${Math.round(current.temperature_2m)}°` : '--°';
  const weather = current
    ? manilaWxCode(current.weather_code, Boolean(current.is_day))
    : { icon: G.cloud, label: 'Weather unavailable' };
  const today = manilaWxNow().slice(0, 10);
  const idx = data?.daily?.time?.indexOf(today) ?? -1;
  const hi = idx >= 0 ? data.daily.temperature_2m_max?.[idx] : null;
  const lo = idx >= 0 ? data.daily.temperature_2m_min?.[idx] : null;
  const hilo = Number.isFinite(hi) && Number.isFinite(lo)
    ? `H:${Math.round(hi)}° L:${Math.round(lo)}°` : 'Live forecast unavailable';
  const stale = !data || Date.now() - MANILA_WX.fetchedAt > 15 * 60 * 1000;
  return `<button class="widget wwx" data-app="weather" onclick="openApp('weather',this)">
    <div class="c">Manila ➚</div>
    <div class="tp">${temp}</div>
    <span style="position:absolute;top:14px;right:14px">${weather.icon}</span>
    <div class="ds">${weather.label}<small>${hilo}${stale && data ? ' · Cached' : ''}</small></div>
  </button>`;
}

function manilaWxRefreshWidget() {
  const old = document.querySelector('#homeL .widget.wwx');
  if (!old) return;
  const holder = document.createElement('div');
  holder.innerHTML = manilaWxWidgetMarkup().trim();
  old.replaceWith(holder.firstElementChild);
}

function manilaWxEnsureWidgetFresh() {
  if (MANILA_WX.pending || (MANILA_WX.data && Date.now() - MANILA_WX.fetchedAt < 15 * 60 * 1000)) return;
  manilaWxFetch().then(() => {
    // Update only the widget, never navigate away from the active app.
    manilaWxRefreshWidget();
  });
}


function manilaWxTime(iso) {
  if (!iso) return '--';
  const part = iso.split('T')[1] || '';
  const m = /^([0-9]{2}):([0-9]{2})/.exec(part);
  if (!m) return '--';
  const hh = Number(m[1]);
  return `${hh % 12 || 12}:${m[2]} ${hh >= 12 ? 'PM' : 'AM'}`;
}

function manilaWxHour(iso) {
  const hh = Number((iso.split('T')[1] || '00').slice(0, 2));
  return `${hh % 12 || 12} ${hh >= 12 ? 'PM' : 'AM'}`;
}

function manilaWxDay(date, today) {
  if (date === today) return 'Today';
  return new Intl.DateTimeFormat('en-PH', { weekday: 'short', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`));
}

function manilaWxNow() {
  // An ISO-like local timestamp for the Philippines, without UTC conversion ambiguity.
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: MANILA_WX.zone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', hourCycle: 'h23'
  }).formatToParts(new Date());
  const get = type => parts.find(p => p.type === type)?.value || '00';
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:00`;
}

async function manilaWxFetch() {
  if (MANILA_WX.pending) return MANILA_WX.pending;
  if (MANILA_WX.data && Date.now() - MANILA_WX.fetchedAt < 15 * 60 * 1000) return MANILA_WX.data;
  const url = 'https://api.open-meteo.com/v1/forecast?' + new URLSearchParams({
    latitude: String(MANILA_WX.lat), longitude: String(MANILA_WX.lon),
    timezone: MANILA_WX.zone, forecast_days: '10',
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code',
    hourly: 'temperature_2m,weather_code,is_day',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max'
  });
  MANILA_WX.pending = fetch(url).then(r => {
    if (!r.ok) throw new Error(`Weather service: ${r.status}`);
    return r.json();
  }).then(data => {
    if (!data.current || !data.hourly || !data.daily) throw new Error('Incomplete weather response');
    MANILA_WX.data = data;
    MANILA_WX.fetchedAt = Date.now();
    MANILA_WX.error = false;
    return data;
  }).catch(err => {
    console.warn('Manila weather unavailable:', err);
    MANILA_WX.error = true;
    return MANILA_WX.data;
  }).finally(() => { MANILA_WX.pending = null; });
  return MANILA_WX.pending;
}

function manilaWxMarkup() {
  const data = MANILA_WX.data;
  const now = manilaWxNow();
  const today = now.slice(0, 10);
  // Fallback is intentionally labeled, not passed off as current weather.
  const current = data?.current;
  const currentTemp = current ? `${Math.round(current.temperature_2m)}°` : '--°';
  const condition = current ? manilaWxCode(current.weather_code, !!current.is_day).label : 'Weather unavailable';
  const daily = data?.daily;
  const dayIndex = Math.max(0, daily?.time?.indexOf(today) ?? 0);
  const hi = daily?.temperature_2m_max?.[dayIndex];
  const lo = daily?.temperature_2m_min?.[dayIndex];
  const hilo = Number.isFinite(hi) && Number.isFinite(lo) ? `H:${Math.round(hi)}°  L:${Math.round(lo)}°` : 'Live forecast unavailable';

  const hourly = data?.hourly;
  const hourStart = hourly?.time?.findIndex(t => t >= now) ?? -1;
  const hrs = hourStart >= 0 ? hourly.time.slice(hourStart, hourStart + 12).map((time, i) => {
    const j = hourStart + i;
    const weather = manilaWxCode(hourly.weather_code[j], !!hourly.is_day[j]);
    return `<div><span>${i ? manilaWxHour(time) : 'Now'}</span>${weather.icon}<span>${Math.round(hourly.temperature_2m[j])}°</span></div>`;
  }).join('') : '<div>Forecast unavailable</div>';

  const lows = daily?.temperature_2m_min || [];
  const highs = daily?.temperature_2m_max || [];
  const rangeLow = lows.length ? Math.floor(Math.min(...lows)) : 0;
  const rangeHigh = highs.length ? Math.ceil(Math.max(...highs)) : 1;
  const span = Math.max(1, rangeHigh - rangeLow);
  const days = daily?.time?.map((date, i) => {
    const low = lows[i], high = highs[i];
    const left = Math.max(0, (low - rangeLow) / span * 100);
    const right = Math.max(0, (rangeHigh - high) / span * 100);
    const icon = manilaWxCode(daily.weather_code[i]).icon;
    return `<div class="d10"><span>${manilaWxDay(date, today)}</span>${icon}<span class="lo">${Math.round(low)}°</span><span class="rng"><i style="left:${left}%;right:${right}%"></i></span><span>${Math.round(high)}°</span></div>`;
  }).join('') || '<div style="padding:14px">Forecast unavailable</div>';

  const uv = daily?.uv_index_max?.[dayIndex];
  const uvLabel = uv == null ? 'Unavailable' : uv < 3 ? 'Low' : uv < 6 ? 'Moderate' : uv < 8 ? 'High' : uv < 11 ? 'Very High' : 'Extreme';
  const sunrise = manilaWxTime(daily?.sunrise?.[dayIndex]);
  const sunset = manilaWxTime(daily?.sunset?.[dayIndex]);
  const summary = data
    ? `Current conditions in Manila. Updated ${manilaWxTime(current.time)} (PHT).`
    : 'Live Manila weather is temporarily unavailable. Connect to the internet to refresh.';

  return `<div class="scroll"><div class="top">
    <div class="lc">Manila, Philippines</div><div class="ct">Manila</div>
    <div class="tp">${currentTemp}</div><div class="ds">${condition}</div>
    <div style="font-size:18px;font-weight:500">${hilo}</div>
  </div>
  <div class="wcard"><div class="wh" style="border:0;padding-bottom:6px;opacity:1;font-size:14px;font-weight:500">${summary}</div>
    <div style="border-top:.5px solid rgba(255,255,255,.25);padding-top:12px" class="hrs">${hrs}</div></div>
  <div class="wcard"><div class="wh">${G.calSm.replace('<svg','<svg width="14" height="14"')}10-DAY FORECAST</div>${days}</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 16px 20px">
    <div class="wcard" style="margin:0"><div class="wh">UV INDEX</div><b style="font-size:30px">${uv == null ? '--' : Math.round(uv)}</b><div>${uvLabel}</div></div>
    <div class="wcard" style="margin:0"><div class="wh">SUNSET</div><b style="font-size:26px">${sunset}</b><div style="font-size:14px">Sunrise: ${sunrise}</div></div>
  </div></div>
  <div class="tabbar" style="background:rgba(40,90,170,.5);box-shadow:none"><button style="color:#fff">🗺</button><button style="color:#fff;flex:2;flex-direction:row;justify-content:center;gap:6px"><i style="width:7px;height:7px;border-radius:50%;background:#fff;display:block"></i></button><button style="color:#fff">${G.list}</button></div>`;
}

VIEWS.weather = () => ({
  cls: 'wx', dark: true,
  html: manilaWxMarkup(),
  init: () => {
    if (MANILA_WX.pending || (MANILA_WX.data && Date.now() - MANILA_WX.fetchedAt < 15 * 60 * 1000)) return;
    manilaWxFetch().then(() => {
      // Refresh the current Weather screen only; don't change navigation state.
      if (typeof view !== 'undefined' && view === 'weather' && typeof render === 'function') render();
    });
  }
});

/* --- SETTINGS --- */
const sIc=(c,i)=>`<span class="st-ic" style="background:${c}">${(G[i]||i).replace('<svg','<svg style="color:#fff" width="18" height="18"')}</span>`;
const sRow=(c,i,t,r='',fn)=>`<div class="row ${fn?'tap':''}" style="--inset:57px;cursor:${fn?'pointer':'default'}" ${fn?`onclick="${fn}"`:''}>${sIc(c,i)}<span style="flex:1">${t}</span>${r.startsWith('<button')?r:`<span class="muted" style="font-size:17px">${r}</span>${G.chevR}`}</div>`;
VIEWS.settings=()=>({cls:'grouped',html:navHTML({title:t('app_settings')})+`<div class="scroll"><h1 class="lt">${t('app_settings')}</h1><div class="srch">${G.search}${t('search')}</div>
 <div class="group" style="margin-bottom:22px"><div class="row" style="min-height:76px"><span style="width:58px;height:58px;border-radius:50%;background:linear-gradient(#a8aeb8,#7f858f);color:#fff;font-size:24px;font-weight:600;display:grid;place-items:center">DK</span><div style="flex:1"><b style="font-size:20px;font-weight:500">Kyungsoo Do</b><div class="muted" style="font-size:13px">${t('acct')}</div></div>${G.chevR}</div></div>
 <div class="group" style="margin-bottom:22px">${sRow('#ff9500','<svg viewBox="0 0 24 24"><path d="M21 15.5v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0v5l-8 5v2l8-2.5V18l-2 1.5V21l3.5-1 3.5 1v-1.5L13 18v-5Z" fill="#fff"/></svg>',t('airplane'),sw(false))}${sRow('#007aff','<svg viewBox="0 0 16 12"><path fill="#fff" d="M8 2.3c2.3 0 4.4.9 6 2.4l1.2-1.2A10.3 10.3 0 0 0 8 .6 10.3 10.3 0 0 0 .8 3.5L2 4.7a8.6 8.6 0 0 1 6-2.4Zm0 3.4c1.4 0 2.6.5 3.6 1.4l1.2-1.2A6.8 6.8 0 0 0 8 4a6.8 6.8 0 0 0-4.8 1.9l1.2 1.2c1-.9 2.2-1.4 3.6-1.4Zm0 3.4c-.6 0-1.2.2-1.6.6L8 11.3l1.6-1.6c-.4-.4-1-.6-1.6-.6Z"/></svg>','Wi-Fi','dofamily_home_5G')}${sRow('#007aff','<svg viewBox="0 0 24 24"><path d="m7 7 10 10-5 4V3l5 4L7 17" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>','Bluetooth',t('on'))}${sRow('#34c759','<svg viewBox="0 0 24 24"><path d="M12 4v16M7 9v11M17 7v13M2 13v7M22 11v9" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></svg>',t('cellular'))}${sRow('#34c759','<svg viewBox="0 0 24 24"><rect x="3" y="7" width="16" height="10" rx="2.5" fill="none" stroke="#fff" stroke-width="2"/><rect x="5.5" y="9.5" width="8" height="5" rx="1" fill="#fff"/></svg>',t('battery'),'94%')}</div>
 <div class="group" style="margin-bottom:22px">${sRow('#8e8e93','gear',t('general'))}${sRow('#007aff','person',t('access'))}${sRow('#8e8e93','camera',t('camera'))}${sRow('#32ade6','photo',t('wallpaper'))}${sRow('#8e8e93','search',t('search'))}</div>
 <div class="group" style="margin-bottom:22px">${sRow('#ff3b30','bellF',t('notif'))}${sRow('#ff2d55','speaker',t('sound'))}${sRow('#5856d6','<svg viewBox="0 0 24 24"><path d="M15.5 3.5A8.5 8.5 0 1 0 20.5 15 7 7 0 0 1 15.5 3.5Z" fill="#fff"/></svg>',t('focus'))}${sRow('#5856d6','<svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 1 0 9 9h-9Z" fill="#fff"/><path d="M14 3.2V10h6.8A9 9 0 0 0 14 3.2Z" fill="#fff" opacity=".7"/></svg>',t('screenTime'),'',"push('screentime')")}</div>
 <div class="group" style="margin-bottom:22px">${sRow('#34c759','<svg viewBox="0 0 24 24"><path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16M9 9.5v1M15 9.5v1M12 9.5v3.5h-1M9.5 16c1.5 1 3.5 1 5 0" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></svg>',t('faceid'))}${sRow('#007aff','<svg viewBox="0 0 24 24"><path d="M7 11V8a5 5 0 0 1 10 0v3" fill="none" stroke="#fff" stroke-width="2"/><rect x="5" y="11" width="14" height="10" rx="2" fill="#fff"/></svg>',t('privacy'))}</div></div>`});
VIEWS.screentime=()=>{const apps=[['twitter',t('hm',2,41),100],['kakao',t('hm',1,52),70],['music',t('mOnly',58),36],['photos',t('mOnly',31),19],['safari',t('mOnly',22),14]].map(a=>[a[0],t('app_'+a[0]),a[1],a[2]]);
 return{cls:'grouped',html:navHTML({title:t('screenTime'),back:t('app_settings')})+`<div class="scroll"><h1 class="lt">${t('screenTime')}</h1>
 <div class="gh" style="margin-top:8px">${t('wonbinsIphone')}</div><div class="group" style="padding:14px 16px"><div class="muted" style="font-size:13px">${t('dailyAvg')}</div><div style="font-size:28px;font-weight:600">${t('hm',6,48)}</div><div class="muted" style="font-size:13px">${t('upPct',32)}</div>
 <div class="bars">${[55,62,48,70,83,77,92].map(v=>`<i style="height:${v}%"></i>`).join('')}</div><div style="display:flex;justify-content:space-between;padding:4px 16px 0;font-size:11px;color:#8e8e93">${wdNarrow().map(d=>`<span>${d}</span>`).join('')}</div></div>
 <div class="gh">${t('mostUsed')}</div><div class="group">${apps.map(a=>`<div class="row" style="--inset:58px;min-height:54px"><span style="width:30px;height:30px;border-radius:7px;overflow:hidden;flex:none">${appIcon(a[0])}</span><div style="flex:1"><div style="font-size:16px">${a[1]}</div><div style="height:5px;border-radius:3px;background:#007aff;width:${a[3]}%;margin-top:5px;opacity:.85"></div></div><span class="muted" style="font-size:15px">${a[2]}</span></div>`).join('')}</div>
 <div class="gh">${t('pickups')}</div><div class="group"><div class="row"><span style="flex:1">${t('firstPickup')}</span><span class="muted">${fmtTime(7*60+2)}</span></div><div class="row"><span style="flex:1">${t('avgPickups')}</span><span class="muted">${t('pickN',143)}</span></div><div class="row"><span style="flex:1">${t('firstUsed')}</span><span class="muted">X</span></div></div>
 <div class="gh">${t('notifSec')}</div><div class="group"><div class="row"><span style="flex:1">${t('app_kakao')}</span><span class="muted">${t('perDay',41)}</span></div></div><div style="height:30px"></div></div>`}};

/* ============================================================
   PHONE CALL
   ============================================================ */
function startRing(){ringOnce();clearInterval(ringIv);ringIv=setInterval(()=>{ringOnce();vib([400,250,400])},2600);vib([400,250,400])}
function stopRing(){clearInterval(ringIv);ringIv=null;clearTimeout(ringTo);try{navigator.vibrate&&navigator.vibrate(0)}catch(e){}}
function incomingCall(){callName='Kyungsoo my love 💞';callDir='in';callPrev=view;callState='ring';if(nowSong>=0||PLAYER.dataset.voice)PLAYER.pause();APP.querySelectorAll('video').forEach(v=>v.pause());OV.querySelectorAll('.banner').forEach(b=>b.remove());renderCall();startRing();ringTo=setTimeout(missCall,30000)}
function callTop(){const sh=callName==='Kyungsoo my love 💞';return `<div class="cav">${sh?'<img src="media/kyungsoo_kakao_profile.jpg" alt="">':/^[0-9*-]+$/.test(callName)?`<span style="width:100%;height:100%;display:grid;place-items:center;background:linear-gradient(#a5abb6,#7f858f)">${G.sil.replace('<svg','<svg width="64"')}</span>`:`<span style="width:100%;height:100%;display:grid;place-items:center;background:linear-gradient(#a5abb6,#7f858f);font-size:42px;font-weight:500">${esc(/^[가-힣]{3}$/.test(callName)?callName[1]:[...dn(callName)][0].toUpperCase())}</span>`}</div><div class="cnm">${esc(dn(callName))}</div>`}
function renderCall(){OV.style.pointerEvents = 'auto';
OV.style.zIndex = '9999';
OV.style.visibility = 'visible';

let c=OV.querySelector('.call');if(!c){c=document.createElement('div');c.className='call';OV.appendChild(c);c.animate([{opacity:0,transform:'scale(1.05)'},{opacity:1,transform:'none'}],{duration:380,easing:'cubic-bezier(.2,.9,.25,1)'})}
 setStatus(true);const locked=['lock','pin'].includes(callPrev);c.classList.toggle('act',callState!=='ring');
 if(callState==='ring'){c.innerHTML=callTop()+`<div class="csub">${t('mobile')}</div>`+(locked?`<div class="ring-top"><div class="cb"><span class="cc" style="width:50px;height:50px">${G.bellF}</span>${t('remind')}</div><div class="cb"><span class="cc" style="width:50px;height:50px">${G.msgF}</span>${t('message2')}</div></div><div class="slider" id="slider"><div class="kn">${G.handset}</div><span>${t('slideAnswer')}</span></div>`:
  `<div class="ring-top"><div class="cb"><span class="cc" style="width:50px;height:50px">${G.bellF}</span>${t('remind')}</div><div class="cb"><span class="cc" style="width:50px;height:50px">${G.msgF}</span>${t('message2')}</div></div><div class="ring"><button class="cb red" onclick="declineCall()"><span class="cc"><span style="display:block;transform:rotate(135deg)">${G.handset}</span></span>${t('decline')}</button><button class="cb grn" onclick="answerCall()"><span class="cc">${G.handset}</span>${t('accept')}</button></div>`);
  if(locked)wireSlider()}
 else{const B=[['speaker',t('speaker')],['videoF','FaceTime'],['muteF',t('mute')],['plusF',t('addCall')],['end',t('endCall')],['keypadF',t('keypad')]];
  const dl=callState==='dialing';c.innerHTML=callTop()+`<div class="csub" id="ctime">${dl?t('calling'):'00:00'}</div>${dl?'':`<div class="cap" id="cap"><small>${t('liveCap')}</small>…</div>`}<div class="cgrid">${B.map(([i,l])=>i==='end'?`<button class="cb red" onclick="endCall()"><span class="cc"><span style="display:block;transform:rotate(135deg)">${G.handset}</span></span>${l}</button>`:`<button class="cb" onclick="${i==='videoF'||i==='plusF'?'':"this.classList.toggle('on');vib(8)"}"><span class="cc">${G[i]}</span>${l}</button>`).join('')}</div>`;
  if(!dl)c.querySelector('.cav').animate([{transform:'scale(1)'},{transform:'scale(.82)'}],{duration:400,fill:'forwards',easing:'cubic-bezier(.2,.9,.25,1)'})}}
function wireSlider(){const s=$('#slider'),k=s.querySelector('.kn'),lab=s.querySelector('span');let x0=null,dx=0;const max=s.clientWidth-k.clientWidth-12;
 k.addEventListener('pointerdown',e=>{x0=e.clientX;k.setPointerCapture(e.pointerId)});k.addEventListener('pointermove',e=>{if(x0===null)return;dx=Math.max(0,Math.min(max,(e.clientX-x0)/SC));k.style.transform=`translateX(${dx}px)`;lab.style.opacity=1-dx/max});
 k.addEventListener('pointerup',()=>{if(x0===null)return;x0=null;if(dx>max*.75){answerCall()}else{k.animate([{transform:`translateX(${dx}px)`},{transform:'none'}],{duration:300,easing:'cubic-bezier(.2,1.3,.4,1)'});k.style.transform='';lab.style.opacity=1}})}
function answerCall(){if(callDir==='in'){curScript=speech;isEnding=true}stopRing();stopRingback();vib(20);callState='active';callStart=Date.now();
resetCaptionTimer();
renderCall()}
function declineCall(){stopRing();callState='';declined++;extraCalls.unshift(['Kyungsoo my love 💞','오늘 '+new Date().getHours()+':'+pad(new Date().getMinutes()),'부재중']);afterDecline();closeCallUI()}
function missCall(){if(callState!=='ring')return;stopRing();callState='';declined++;extraCalls.unshift(['Kyungsoo my love 💞','오늘 '+new Date().getHours()+':'+pad(new Date().getMinutes()),'부재중']);afterDecline();closeCallUI();if(['lock','pin'].includes(view)){// Remove previous missed-call notifications
lockNotes = lockNotes.filter(n => n.app !== 'phone');

// Add the newest missed-call notification
lockNotes.unshift({
  title: t('missedCall'),
  body: 'Kyungsoo my love 💞',
  app: 'phone',
  time: t('now')
});

// Refresh the lock screen
renderLock();}}
function endCall(){if(callState==='dialing'){clearCallTimers();stopRingback();callState='';extraCalls.unshift([callName,'오늘 '+new Date().getHours()+':'+pad(new Date().getMinutes()),'발신']);closeCallUI();if(view==='phone')show('phone');return}
 if(callState!=='active')return;callState='ended';vib(15);const t=$('#ctime');if(t)t.textContent=t_('callEnded');const c=OV.querySelector('.call');c&&c.querySelectorAll('.cb').forEach(b=>b.style.opacity=.4);
 extraCalls.unshift([callName,'오늘 '+new Date().getHours()+':'+pad(new Date().getMinutes()),callDir==='out'?'발신':'수신']);if(isEnding)phoneDone=true;isEnding=false;setTimeout(()=>{callState='';closeCallUI();if(view==='phone')show('phone')},1100)}
/* 소희 전화를 거절/놓쳤을 때: 카톡으로 다시 걸어달라고 하고, 90초 뒤 다시 걸어옴 */
function afterDecline(){nextCallAt=elapsed()+90;if(declineSent)return;declineSent=true;CALL_DECLINED.forEach((m,k)=>setTimeout(()=>incomingMsg(m),3000+k*2600))}
/* 플레이어가 거는 전화 */
let callDir='in',curScript=null,isEnding=false;
let captionElapsed = 0;
let captionLastUpdate = 0;

function resetCaptionTimer() {
  captionElapsed = 0;
  captionLastUpdate = performance.now();
  capIdx = -1;
}

function getCaptionSeconds() {
  const now = performance.now();

  if (!document.hidden && callState === 'active') {
    // Prevent large jumps after Safari resumes.
    const delta = Math.min(
      (now - captionLastUpdate) / 1000,
      0.5
    );

    captionElapsed += Math.max(0, delta);
  }

  captionLastUpdate = now;
  return Math.floor(captionElapsed);
}
function clearCallTimers(){callTimers.forEach(clearTimeout);callTimers=[]}
function startRingback(){const r=()=>{tone(440,0,1,.05);tone(480,0,1,.05)};r();clearInterval(rbIv);rbIv=setInterval(r,3000)}
function stopRingback(){clearInterval(rbIv);rbIv=null}
function dial(name){if(callState)return;callName=name;callDir='out';callPrev=view;callState='dialing';if(nowSong>=0||PLAYER.dataset.voice)PLAYER.pause();renderCall();startRingback();vib(10);
 const ready=askedCall||elapsed()>=CALL_ASK_AT;const pick=(sc,ms,end)=>{callTimers.push(setTimeout(()=>{if(callState!=='dialing')return;curScript=sc;isEnding=!!end;answerCall()},ms))};
 if(name==='Kyungsoo my love 💞'&&!phoneDone&&ready)pick(speech,4200,true);
 else if(name==='Kyungsoo my love 💞'&&phoneDone)pick(KYUNGSOO_AFTER,6000);
 else if(name==='Kyungsoo my love 💞'){callTimers.push(setTimeout(()=>{if(callState!=='dialing')return;rejectOut(t('callEnded'));if(!busySent){busySent=true;CALL_BUSY.forEach((m,k)=>setTimeout(()=>incomingMsg(m),2500+k*2600))}},3500))}
 else if(OTHER_CALLS[name])pick(OTHER_CALLS[name],/^0/.test(name)?1800:3000+Math.random()*3000);
 else{callTimers.push(setTimeout(()=>{if(callState==='dialing')rejectOut(t('noAnswer'))},9000))}}
function rejectOut(msg){stopRingback();clearCallTimers();const t=$('#ctime');if(t)t.textContent=msg;tone(480,0,.25,.05);tone(480,.35,.25,.05);tone(480,.7,.25,.05);extraCalls.unshift([callName,'오늘 '+new Date().getHours()+':'+pad(new Date().getMinutes()),'발신']);callState='ended';
 const c=OV.querySelector('.call');c&&c.querySelectorAll('.cb').forEach(b=>b.style.opacity=.4);setTimeout(()=>{callState='';closeCallUI();if(view==='phone')show('phone')},1300)}
function closeCallUI(){const c=OV.querySelector('.call');if(!c){OV.style.pointerEvents='';return;}c.animate([{opacity:1},{opacity:0,transform:'scale(1.04)'}],{duration:320,fill:'forwards'}).onfinish=()=>{c.remove();OV.style.pointerEvents='';OV.style.zIndex='';OV.style.visibility='';setStatus(viewDark());updateIsland();if(view==='home')renderHome()}}

/* ============================================================
   LOOP/START
   ============================================================ */

let lastMin = -1;

function tick() {
  const e = elapsed();
  if (typeof updateCrumb === 'function') updateCrumb();

  const now = new Date();
 

  $('#sbt').textContent = clock12();

  const lk = $('#lkt');
  if (lk) lk.textContent = clock12();

  // First incoming message
  if (e >= 40 && incoming === 0) {
    incoming = 1;

    incomingMsg(INCOMING[0], () => {
      introDelivered++;
    });
  }

  // Second incoming message
  if (e >= 43.5 && incoming === 1) {
    incoming = 2;

    incomingMsg(INCOMING[1], () => {
      introDelivered++;

      setTimeout(() => {
        if (introDelivered >= 2) {
          introReady = true;
        }
      }, 700);
    });
  }

  // Kyungsoo asks to call
  if (
    e >= CALL_ASK_AT &&
    incoming >= 2 &&
    !askedCall &&
    !replyBusy &&
    !typing
  ) {
    askedCall = true;
    replyStage = liveReplies.length;
    lineIdx = 0;
    pendingText = '';

    setTimeout(() => {
      liveReplies.push({
        mine: CALL_ASK_REPLY,
        them: []
      });

      replyStage = liveReplies.length - 1;
      lineIdx = 0;
    }, CALL_ASK.length * 2600 + 1700);

    nextCallAt = e + CALL_ASK.length * 2.6 + 8;

    CALL_ASK.forEach((m, k) => {
      setTimeout(() => incomingMsg(m), k * 2600);
    });
  }

  // Trigger the scheduled incoming call
  if (
    askedCall &&
    e >= nextCallAt &&
    !phoneDone &&
    !callState
  ) {
    incomingCall();
  }

  // Update active call duration and captions
  
if (callState === 'active') {
  const sec = getCaptionSeconds();

  const tm = $('#ctime');
  if (tm) {
    tm.textContent =
      pad(Math.floor(sec / 60)) + ':' + pad(sec % 60);
  }

  const S = curScript || speech;

  if (Array.isArray(S) && S.length > 0) {
    const idx = Math.min(
      S.length - 1,
      Math.floor(sec / 3)
    );

    let c = OV.querySelector('.call #cap');
    if (!c) {
      const callScreen = OV.querySelector('.call');
      if (callScreen) {
        c = document.createElement('div');
        c.className = 'cap';
        c.id = 'cap';
        const controls = callScreen.querySelector('.cgrid');
        if (controls) callScreen.insertBefore(c, controls);
        else callScreen.appendChild(c);
        capIdx = -1;
      }
    }
    if (c) {
      c.style.visibility = 'visible';
      c.style.opacity = '1';
    }

    // Update if the caption changed or its DOM element
    // was recreated while the call was active.
    if (c && (
      idx !== capIdx ||
      c.dataset.captionIndex !== String(idx)
    )) {
      capIdx = idx;
      c.dataset.captionIndex = String(idx);

      c.innerHTML =
        `<small>${esc(dn(S[idx][0]))}</small>` +
        esc(S[idx][1]);

      c.animate(
        [
          { opacity: 0.2, transform: 'translateY(6px)' },
          { opacity: 1, transform: 'none' }
        ],
        {
          duration: 280,
          easing: 'ease-out'
        }
      );
    }

    if (sec > S.length * 3 + 2) {
      endCall();
    }
  }
}
}

//function fit(){const ph=$('#phone');const mob=innerWidth<=540;ph.classList.toggle('mob',mob);ph.classList.toggle('short',mob&&innerHeight<740);if(mob){ph.style.width=innerWidth+'px';ph.style.height=innerHeight+'px';ph.style.transform='';SC=1}else{ph.style.width='393px';ph.style.height='852px';SC=Math.min((innerHeight-40)/852,(innerWidth-40)/393,1.1);ph.style.transform=`scale(${SC})`}}
/* Keep the original iPhone shape on desktop and mobile */
function fit() {
  const ph = document.getElementById('phone');
  const W = 393;
  const H = 852;
  const padding = 32;

  // Disable the full-screen mobile layout
  ph.classList.remove('mob', 'short');

  const viewportWidth = window.innerWidth;
  const viewportHeight =
    window.visualViewport?.height || window.innerHeight;

  // Scale uniformly without stretching
  SC = Math.min(
    (viewportWidth - padding) / W,
    (viewportHeight - padding) / H,
    1
  );

  ph.style.width = W + 'px';
  ph.style.height = H + 'px';
  ph.style.transformOrigin = 'center center';
  ph.style.transform = `scale(${SC})`;
}
addEventListener('resize',fit);fit();renderLock();renderHome();setStatus(true);setInterval(tick,250);tick();
/* Smooth iPhone lock animation */
function lockIphoneAnimated() {
  // Never lock or obscure an incoming/active call.
  if (callState === 'ring' || callState === 'active' || callState === 'dialing' || callState === 'ended') return;
  const fade = document.getElementById('iphoneLockFade');

  if (!fade) {
    lockIphone();
    return;
  }

  // Prevent repeated clicks during the transition
  if (fade.classList.contains('active')) return;

  // Fade to black
  fade.classList.remove('reveal');
  fade.classList.add('active');

  setTimeout(() => {
    // Run the existing lock function
    lockIphone();

    // Reveal the lock screen
    fade.classList.remove('active');
    fade.classList.add('reveal');

    setTimeout(() => {
      fade.classList.remove('reveal');
    }, 460);
  }, 300);
}

// Recover the call UI and captions after Safari suspends/repaints the page.
function resumeCallUI() {
  captionLastUpdate = performance.now();
  if (document.hidden) return;
  if (callState === 'active' || callState === 'ring' || callState === 'dialing') {
    const fade = document.getElementById('iphoneLockFade');
    if (fade) fade.classList.remove('active', 'reveal');
    if (!OV.querySelector('.call')) renderCall();
    OV.style.visibility = 'visible';
    OV.style.pointerEvents = 'auto';
    OV.style.zIndex = '9999';
    capIdx = -1;
  }
  tick();
}
document.addEventListener('visibilitychange', resumeCallUI);
window.addEventListener('pageshow', resumeCallUI);
window.addEventListener('focus', resumeCallUI);


/* ===== Kyungsoo AU — interactive, read-only X ===== */
const XPEOPLE = typeof STORY_XPEOPLE !== 'undefined' ? structuredClone(STORY_XPEOPLE) : {};
const XPOSTS = typeof STORY_XPOSTS !== 'undefined' ? structuredClone(STORY_XPOSTS) : [];
let xTab='for-you',xQuery='',xSelected=1,xPerson='sooberry',xProfileTab='Posts';
function xWho(handle){return XPEOPLE[handle]||{name:handle,avatar:'👤',bio:'',following:'0',followers:'0',joined:'Joined 2022',banner:'sky',photo:'',coverUrl:''}}
function xAvatar(handle,large=false){const u=xWho(handle);return `<span class="x-avatar${large?' big':''}" onclick="event.stopPropagation();xOpenProfile('${esc(handle)}')">${u.photo?`<img src="${esc(u.photo)}" alt="${esc(u.name)} profile photo" loading="lazy">`:esc(u.avatar)}</span>`}
function xUser(handle,when=''){const u=xWho(handle);return `<span class="x-userlink" onclick="event.stopPropagation();xOpenProfile('${esc(handle)}')"><b>${esc(u.name)}</b> <span>@${esc(handle)}</span></span>${when?`<span class="x-when"> · ${esc(when)}</span>`:''}`}
function xI(name){const paths={"house":'<path d="m3 10 9-7 9 7v11h-7v-7h-4v7H3z"/>',"search":'<circle cx="10.5" cy="10.5" r="7.5"/><path d="m16 16 5 5"/>',"mic":'<rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4m-4 0h8"/>',"bell":'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',"mail":'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 6 10 8 10-8"/>',"message-circle":'<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.9-5.5A9 9 0 1 1 21 11.5Z"/>',"repeat-2":'<path d="m17 2 4 4-4 4M3 11V8a2 2 0 0 1 2-2h16M7 22l-4-4 4-4m14-1v3a2 2 0 0 1-2 2H3"/>',"heart":'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',"chart-no-axes-column":'<path d="M4 20V11m5 9V5m5 15v-8m5 8V8"/>',"share":'<path d="M12 16V2m-5 5 5-5 5 5M5 12H3v9h18v-9h-2"/>'};return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||''}</svg>`}
function xStats(p){return `<div class="x-stats"><span>${xI('message-circle')} <small>${p.replies||0}</small></span><span>${xI('repeat-2')} <small>${p.reposts||0}</small></span><span>${xI('heart')} <small>${p.likes||0}</small></span><span>${xI('chart-no-axes-column')} <small>${esc(p.views||'')}</small></span><span>${xI('share')}</span></div>`}

function xCard(p,open=true){return `<article class="x-post" ${open?`onclick="xOpenPost(${p.id})"`:''}>${xAvatar(p.handle)}<div class="x-post-main"><div class="x-user">${xUser(p.handle,p.when)}<span class="x-more">•••</span></div><div class="x-body">${esc(p.body)}</div>${p.image?`<img class="x-post-photo" src="${esc(p.image)}" alt="Post attachment">`:''}${xStats(p)}</div></article>`}

function xHeader(title,back=false){return `<div class="x-header"><button onclick="${back?'xBackHome()':'closeApp()'}" aria-label="Back">${back?'‹':'‹'}</button><b>${esc(title)}</b><span>𝕏</span></div>`}
function xBottom(){return `<div class="x-bottom"><button class="${xTab==='for-you'||xTab==='following'?'sel':''}" onclick="xSwitch('for-you')" aria-label="Home">${xI('house')}</button><button class="${xTab==='explore'?'sel':''}" onclick="xSwitch('explore')" aria-label="Search">${xI('search')}</button><button disabled aria-label="Spaces unavailable">${xI('mic')}</button><button disabled aria-label="Notifications unavailable">${xI('bell')}</button><button disabled aria-label="Direct messages unavailable">${xI('mail')}</button></div>`}

function xSwitch(tab){xTab=tab;show('twitter','swap')}
function xOpenPost(id){xSelected=id;push('xpost')}
function xBackHome(){xTab='for-you';show('twitter','pop')}
function xOpenProfile(handle){xPerson=handle;xProfileTab='Posts';push('xprofile')}
function xSetProfileTab(tab){xProfileTab=tab;show('xprofile','swap')}
function xProfileHtml(handle){const u=xWho(handle);const posts=XPOSTS.filter(p=>p.handle===handle);return `<div class="x-cover ${esc(u.banner)}"${u.coverUrl?` style="background-image:url('${esc(u.coverUrl)}')"`:""}><button class="x-cover-back" onclick="event.stopPropagation();back()">‹</button><span class="x-cover-search">⌕</span></div><div class="x-profile-head"><div class="x-profile-top">${xAvatar(handle,true)}<span class="x-viewonly">${handle==='sooberry'?'Edit profile':'View profile'}</span></div><h2>${esc(u.name)}</h2><div class="x-handle">@${esc(handle)}</div><p>${esc(u.bio)}</p><div class="x-meta">⌖ ${esc(u.location||'')}</div><div class="x-meta">▦ ${esc(u.joined)}</div><div class="x-counts"><span><b>${esc(u.following)}</b> Following</span><span><b>${esc(u.followers)}</b> Followers</span></div></div><div class="x-profile-tabs">${['Posts','Replies','Media','Likes'].map(t=>`<button class="${xProfileTab===t?'on':''}" onclick="xSetProfileTab('${t}')">${t}</button>`).join('')}</div>${xProfileTab==='Posts'?posts.map(p=>xCard(p)).join('')||'<p class="x-empty">No posts yet.</p>':xProfileTab==='Replies'?XPOSTS.flatMap(p=>p.thread.filter(r=>r.handle===handle).map(r=>`<article class="x-post">${xAvatar(handle)}<div class="x-post-main"><div class="x-user">${xUser(handle,'1d')}</div><div class="x-replyto">Replying to @${esc(p.handle)}</div><div class="x-body">${esc(r.body)}</div></div></article>`)).join('')||'<p class="x-empty">No replies yet.</p>':'<p class="x-empty">Nothing to show here yet.</p>'}`}
function xOpenPeople(kind,handle){xPeopleKind=kind;xPerson=handle;push('xpeople')}
let xPeopleKind='followers';
VIEWS.xpeople=()=>({cls:'x-sim',html:`${xHeader(xPeopleKind==='followers'?'Followers':'Following',true)}<div class="scroll x-scroll"><div class="x-people-note">${esc(xWho(xPerson).name)} · ${xPeopleKind}</div>${Object.keys(XPEOPLE).filter(h=>h!==xPerson).map(h=>`<div class="x-person-row" onclick="xOpenProfile('${h}')">${xAvatar(h)}<div><b>${esc(xWho(h).name)}</b><small>@${h}</small><p>${esc(xWho(h).bio)}</p></div><span>›</span></div>`).join('')}<p class="x-empty">Sample AU accounts shown. Counts are fictional.</p></div>`});
PARENT.xpeople='xprofile';
VIEWS.xprofile=()=>({cls:'x-sim',html:`<div class="scroll x-scroll">${xProfileHtml(xPerson)}</div>${xBottom()}`});
PARENT.xprofile='twitter';
function xResults(){const q=xQuery.toLowerCase().trim();const people=Object.keys(XPEOPLE).filter(h=>!q||[h,XPEOPLE[h].name,XPEOPLE[h].bio].some(v=>v.toLowerCase().includes(q)));const posts=XPOSTS.filter(p=>!q||[p.body,p.handle,xWho(p.handle).name].some(v=>v.toLowerCase().includes(q)));return `<div class="x-result-label">People</div>${people.map(h=>`<div class="x-person-row" onclick="xOpenProfile('${h}')">${xAvatar(h)}<div><b>${esc(xWho(h).name)}</b><small>@${h}</small></div><span>›</span></div>`).join('')||'<p class="x-empty">No people found</p>'}<div class="x-result-label">Posts</div>${posts.map(p=>xCard(p)).join('')||'<p class="x-empty">No posts found</p>'}`}
function xSearch(v){xQuery=v;const el=document.getElementById('x-results');if(el)el.innerHTML=xResults()}
VIEWS.twitter=()=>({cls:'x-sim',html:`${xTab==='profile'?'':xTab==='explore'?xHeader('Explore'): '<div class="x-homehead"><button class="x-me" onclick="xOpenProfile(\'sooberry\')" aria-label="My profile">☁️</button><b>𝕏</b><span class="x-home-spacer"></span></div>'}<div class="scroll x-scroll">${xTab==='profile'?xProfileHtml('sooberry'):xTab==='explore'?`<div class="x-explore"><label>⌕ <input placeholder="Search X" value="${esc(xQuery)}" oninput="xSearch(this.value)"></label><h3>Explore</h3><div class="x-trend"><small>Trending in your circle</small><b>Kinder A Family Day</b><small>School community</small></div><div class="x-trend"><small>Trending · Weather</small><b>Rainy afternoon ☔</b><small>Local conversation</small></div></div><div id="x-results">${xResults()}</div>`:`<div class="x-tabs"><button class="${xTab==='for-you'?'on':''}" onclick="xSwitch('for-you')">For you</button><button class="${xTab==='following'?'on':''}" onclick="xSwitch('following')">Following</button></div>${(xTab==='following'?XPOSTS.filter(p=>p.handle!=='sooberry'):XPOSTS).map(p=>xCard(p)).join('')}`}</div>${xBottom()}`});
VIEWS.xpost=()=>{const p=XPOSTS.find(v=>v.id===xSelected)||XPOSTS[0];return {cls:'x-sim',html:`${xHeader('Post',true)}<div class="scroll x-scroll">${xCard(p,false)}<div class="x-post-detail">${esc(p.views||'0')} Views · ${p.likes} Likes · ${p.reposts} Reposts</div><div class="x-thread-title">Replies</div>${p.thread.map(r=>`<article class="x-post">${xAvatar(r.handle)}<div class="x-post-main"><div class="x-user">${xUser(r.handle,'1h')}</div><div class="x-replyto">Replying to @${esc(p.handle)}</div><div class="x-body">${esc(r.body)}</div></div></article>`).join('')||'<p class="x-empty">No replies yet</p>'}</div>${xBottom()}`}};
PARENT.xpost='twitter';
