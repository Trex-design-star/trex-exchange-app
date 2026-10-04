/* Trex API client — tries each backend base in order, so pages work whether
   served from :8000 (static), :8080 (API), or opened as files (CORS-open API). */
var API = (function () {
  var bases = [];
  if (location.protocol.indexOf("http") === 0) bases.push("/api");
  if (location.host !== "localhost:8080" && location.host !== "127.0.0.1:8080") bases.push("http://localhost:8080/api");
  var liveBase = null;
  // text/plain + key-in-body keeps every request CORS-simple (no preflight);
  // the server reads the idempotency key from the body.
  function pack(body, key) {
    var b = body ? JSON.parse(JSON.stringify(body)) : undefined;
    if (key && b) b.idempotency_key = key;
    return b;
  }
  function attempt(i, method, path, body, key) {
    if (i >= bases.length) return Promise.reject(new Error("no backend reachable"));
    return fetch(bases[i] + path, {
      method: method, headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body: pack(body, key) ? JSON.stringify(pack(body, key)) : undefined
    }).then(function (r) {
      if (!r.ok && r.status !== 422 && r.status !== 502) throw new Error("bad status " + r.status);
      liveBase = bases[i];
      return r.json();
    }).catch(function (e) { return attempt(i + 1, method, path, body, key); });
  }
  function req(method, path, body, key) {
    if (liveBase) {
      return fetch(liveBase + path, { method: method, headers: { "Content-Type": "text/plain;charset=UTF-8" }, body: pack(body, key) ? JSON.stringify(pack(body, key)) : undefined })
        .then(function (r) { return r.json(); })
        .catch(function () { liveBase = null; return attempt(0, method, path, body, key); });
    }
    return attempt(0, method, path, body, key);
  }
  return {
    get on() { return true; },
    get: function (p) { return req("GET", p); },
    post: function (p, b, k) { return req("POST", p, b, k); },
    key: function () { return "k-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  };
})();
