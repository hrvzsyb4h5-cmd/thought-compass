/* 思想罗盘 Service Worker：二次访问秒开，弱网/离线可用 */
var CACHE='thought-compass-v20261107a';
var CORE=['./','./index.html','./hero.jpg'];
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(CORE)}).then(function(){return self.skipWaiting()}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){return k!==CACHE}).map(function(k){return caches.delete(k)}));
  }).then(function(){return self.clients.claim()}));
});
self.addEventListener('fetch',function(e){
  var req=e.request;
  if(req.method!=='GET'||req.url.indexOf(self.location.origin)!==0)return;
  if(req.mode==='navigate'){
    e.respondWith(fetch(req).then(function(res){
      var cp=res.clone();
      caches.open(CACHE).then(function(c){c.put('./index.html',cp);c.put('./',cp)});
      return res;
    }).catch(function(){
      return caches.match('./index.html').then(function(r){return r||caches.match('./')});
    }));
    return;
  }
  e.respondWith(caches.match(req).then(function(hit){
    var net=fetch(req).then(function(res){
      if(res&&res.status===200){var cp=res.clone();caches.open(CACHE).then(function(c){c.put(req,cp)})}
      return res;
    }).catch(function(){return hit});
    return hit||net;
  }));
});
