var CACHE_NAME = "__mychat";
var urlsToCache = [
    "/",
    "https://cdnjs.cloudflare.com/ajax/libs/mdui/1.0.0/css/mdui.min.css",
    "/srv/res/?type=script&name=frontend.autorem",
    "https://cdnjs.cloudflare.com/ajax/libs/mdui/1.0.0/js/mdui.min.js",
];

self.addEventListener("install", function(event) {
    // 在install阶段里可以预缓存一些资源
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            console.log("Cache Resources...");
            return cache.addAll(urlsToCache);
        })
    );
});