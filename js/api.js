/* Trex API client — same-origin /api when served, silent local fallback otherwise. */
var API = (function () {
  var on = location.protocol.indexOf("http") === 0;
  function req(method, path, body, key) {
    if (!on) return Promise.reject(new Error("local mode"));
    var h = { "Content-Type": "application/json" };
    if (key) h["X-Idempotency-Key"] = key;
    return fetch("/api" + path, {
      method: method, headers: h,
      body: body ? JSON.stringify(body) : undefined
    }).then(function (r) { return r.json(); });
  }
  return {
    on: on,
    get: function (p) { return req("GET", p); },
    post: function (p, b, k) { return req("POST", p, b, k); },
    key: function () { return "k-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  };
})();
