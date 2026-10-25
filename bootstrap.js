/* Language: ?lang= in the URL → Previous selection → Browser language, in that order. Change it using the 🌐 button on the lock screen */
(function(){
 window.LANGS=[['en','English'],['ko','한국어'],['zh','简体中文'],['th','ภาษาไทย']];
 //['ja','日本語'],
 const ok=l=>LANGS.some(x=>x[0]===l);let sel=null;
 try{sel=new URLSearchParams(location.search).get('lang')}catch(e){}
 if(!ok(sel)){try{sel=localStorage.getItem('wb_lang')}catch(e){}}
 if(!ok(sel)){sel=(navigator.language||'ko').slice(0,2).toLowerCase();if(sel==='in')sel='id';if(!ok(sel))sel='en'}
 window.LANG=sel;
 function load(src){return new Promise((res,rej)=>{const s=document.createElement('script');s.src=src+(src.includes('?')?'&':'?')+'v=20261023-verified-2';s.onload=res;s.onerror=rej;document.body.appendChild(s)})}
 (async()=>{try{await load('chat_times.js');await load('data.'+sel+'.js');await load('i18n.js');await load('app.js')}catch(e){alert('load error: '+e)}})();
})();
function setLang(l){try{localStorage.setItem('wb_lang',l)}catch(e){}const u=new URL(location.href);u.searchParams.set('lang',l);location.replace(u.toString())}