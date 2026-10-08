// Zema Hospitality app shell: always tries the newest version first, falls back to the last copy when offline.
// It also shows notifications sent to this phone, and opens the right screen when one is tapped.
const CACHE='zh-shell-v2';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==self.location.origin)return;
  e.respondWith(fetch(e.request).then(r=>{if(r.ok){const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c))}return r})
    .catch(()=>caches.match(e.request).then(r=>r||caches.match(self.registration.scope))))});

self.addEventListener('push',e=>{let d={};try{d=e.data?e.data.json():{}}catch(_){d={body:e.data?e.data.text():''}}
  e.waitUntil(self.registration.showNotification(d.title||'Zema Hospitality',{body:d.body||'',icon:'icon-192.png?v=18',badge:'icon-192.png?v=18',tag:d.tag||undefined,renotify:!!d.tag,data:{url:d.url||self.registration.scope}}))});

self.addEventListener('notificationclick',e=>{e.notification.close();const url=(e.notification.data&&e.notification.data.url)||self.registration.scope;
  e.waitUntil((async()=>{const all=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    for(const c of all){if('navigate' in c){try{const w=await c.navigate(url);return(w||c).focus()}catch(_){}}}
    return self.clients.openWindow(url)})())});
