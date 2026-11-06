const C='dst-v4';
const FILES=['./','index.html','app.js','manifest.webmanifest','icon-192.png','icon-512.png','vendor/tailwind.js','vendor/react.production.min.js','vendor/react-dom.production.min.js','fonts/manrope-latin.woff2','fonts/manrope-latin-ext.woff2','fonts/manrope-cyrillic.woff2','fonts/manrope-cyrillic-ext.woff2'];
// Инсталиране: всички файлове се запазват в телефона, за да работи приложението и без интернет още от първото отваряне
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>Promise.all(FILES.map(f=>c.add(f).catch(()=>{})))))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
// Network-first: при връзка взема най-новата версия, а кешът е резерва без интернет
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;
e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));return r}).catch(()=>caches.match(e.request)))});
