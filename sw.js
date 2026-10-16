// 診療ツール ホーム — Service Worker（オフラインキャッシュ）
// バージョンを変えると古いキャッシュを破棄して更新します。
const CACHE = 'shinryo-tools-v202610082206';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './2026診療報酬改定 消化器内科 加算計算ツール.html',
  './catecholamine-calc.html',
  './抗血栓薬管理ガイド.html',
  './肝疾患フォローアプリ.html'
].map(p => encodeURI(p));

// インストール時に全ファイルをキャッシュ
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// 古いキャッシュを掃除
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// キャッシュ優先（オフラインでも動く）。無ければネットから取得しキャッシュに追加。
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(()=>{});
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
