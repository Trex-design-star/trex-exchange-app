/* TREX core — central currency, country, market, money and profile services.
   Single source of truth for every page. No page hard-codes currencies.
   Preview build: reference rates are illustrative; authoritative financial
   state must come from the backend in production. */
(function (global) {
  "use strict";

  /* ---------- Currency registry (ISO 4217 fiat subset) ---------- */
  var CURRENCIES = [
    {code:"USD",name:"US Dollar",symbol:"$",dec:2,flag:"🇺🇸",countries:["US"],pop:1},
    {code:"EUR",name:"Euro",symbol:"€",dec:2,flag:"🇪🇺",countries:["DE","FR","IE","NL","ES","IT"],pop:1},
    {code:"GBP",name:"British Pound",symbol:"£",dec:2,flag:"🇬🇧",countries:["GB"],pop:1},
    {code:"NGN",name:"Nigerian Naira",symbol:"₦",dec:2,flag:"🇳🇬",countries:["NG"],pop:1},
    {code:"CAD",name:"Canadian Dollar",symbol:"CA$",dec:2,flag:"🇨🇦",countries:["CA"],pop:1},
    {code:"AUD",name:"Australian Dollar",symbol:"A$",dec:2,flag:"🇦🇺",countries:["AU"]},
    {code:"NZD",name:"New Zealand Dollar",symbol:"NZ$",dec:2,flag:"🇳🇿",countries:["NZ"]},
    {code:"CHF",name:"Swiss Franc",symbol:"CHF ",dec:2,flag:"🇨🇭",countries:["CH"]},
    {code:"JPY",name:"Japanese Yen",symbol:"¥",dec:0,flag:"🇯🇵",countries:["JP"],pop:1},
    {code:"CNY",name:"Chinese Yuan",symbol:"¥",dec:2,flag:"🇨🇳",countries:["CN"]},
    {code:"HKD",name:"Hong Kong Dollar",symbol:"HK$",dec:2,flag:"🇭🇰",countries:["HK"]},
    {code:"SGD",name:"Singapore Dollar",symbol:"S$",dec:2,flag:"🇸🇬",countries:["SG"]},
    {code:"ZAR",name:"South African Rand",symbol:"R",dec:2,flag:"🇿🇦",countries:["ZA"]},
    {code:"KES",name:"Kenyan Shilling",symbol:"KSh ",dec:2,flag:"🇰🇪",countries:["KE"],pop:1},
    {code:"GHS",name:"Ghanaian Cedi",symbol:"₵",dec:2,flag:"🇬🇭",countries:["GH"]},
    {code:"UGX",name:"Ugandan Shilling",symbol:"USh ",dec:0,flag:"🇺🇬",countries:["UG"]},
    {code:"TZS",name:"Tanzanian Shilling",symbol:"TSh ",dec:0,flag:"🇹🇿",countries:["TZ"]},
    {code:"RWF",name:"Rwandan Franc",symbol:"RF ",dec:0,flag:"🇷🇼",countries:["RW"]},
    {code:"XOF",name:"West African CFA Franc",symbol:"CFA ",dec:0,flag:"🇸🇳",countries:["SN","CI","BJ"]},
    {code:"XAF",name:"Central African CFA Franc",symbol:"FCFA ",dec:0,flag:"🇨🇲",countries:["CM"]},
    {code:"AED",name:"UAE Dirham",symbol:"د.إ ",dec:2,flag:"🇦🇪",countries:["AE"]},
    {code:"SAR",name:"Saudi Riyal",symbol:"﷼ ",dec:2,flag:"🇸🇦",countries:["SA"]},
    {code:"QAR",name:"Qatari Riyal",symbol:"QR ",dec:2,flag:"🇶🇦",countries:["QA"]},
    {code:"KWD",name:"Kuwaiti Dinar",symbol:"KD ",dec:3,flag:"🇰🇼",countries:["KW"]},
    {code:"BHD",name:"Bahraini Dinar",symbol:"BD ",dec:3,flag:"🇧🇭",countries:["BH"]},
    {code:"INR",name:"Indian Rupee",symbol:"₹",dec:2,flag:"🇮🇳",countries:["IN"],pop:1},
    {code:"PKR",name:"Pakistani Rupee",symbol:"₨",dec:2,flag:"🇵🇰",countries:["PK"]},
    {code:"BDT",name:"Bangladeshi Taka",symbol:"৳",dec:2,flag:"🇧🇩",countries:["BD"]},
    {code:"BRL",name:"Brazilian Real",symbol:"R$",dec:2,flag:"🇧🇷",countries:["BR"]},
    {code:"MXN",name:"Mexican Peso",symbol:"MX$",dec:2,flag:"🇲🇽",countries:["MX"]},
    {code:"ARS",name:"Argentine Peso",symbol:"AR$",dec:2,flag:"🇦🇷",countries:["AR"]},
    {code:"CLP",name:"Chilean Peso",symbol:"CL$",dec:0,flag:"🇨🇱",countries:["CL"]},
    {code:"COP",name:"Colombian Peso",symbol:"CO$",dec:2,flag:"🇨🇴",countries:["CO"]},
    {code:"TRY",name:"Turkish Lira",symbol:"₺",dec:2,flag:"🇹🇷",countries:["TR"]},
    {code:"ILS",name:"Israeli New Shekel",symbol:"₪",dec:2,flag:"🇮🇱",countries:["IL"]},
    {code:"EGP",name:"Egyptian Pound",symbol:"E£",dec:2,flag:"🇪🇬",countries:["EG"]},
    {code:"MAD",name:"Moroccan Dirham",symbol:"DH ",dec:2,flag:"🇲🇦",countries:["MA"]},
    {code:"DZD",name:"Algerian Dinar",symbol:"DA ",dec:2,flag:"🇩🇿",countries:["DZ"]},
    {code:"ETB",name:"Ethiopian Birr",symbol:"Br ",dec:2,flag:"🇪🇹",countries:["ET"]},
    {code:"MUR",name:"Mauritian Rupee",symbol:"₨ ",dec:2,flag:"🇲🇺",countries:["MU"]}
  ];

  /* ---------- Country registry ---------- */
  var COUNTRIES = [
    {code:"NG",name:"Nigeria",flag:"🇳🇬",currency:"NGN",region:"Africa",status:"LIVE",prefix:"234",tz:"Africa/Lagos"},
    {code:"GB",name:"United Kingdom",flag:"🇬🇧",currency:"GBP",region:"Europe",status:"LIVE",prefix:"44",tz:"Europe/London"},
    {code:"US",name:"United States",flag:"🇺🇸",currency:"USD",region:"Americas",status:"LIVE",prefix:"1",tz:"America/New_York"},
    {code:"KE",name:"Kenya",flag:"🇰🇪",currency:"KES",region:"Africa",status:"LIVE",prefix:"254",tz:"Africa/Nairobi"},
    {code:"GH",name:"Ghana",flag:"🇬🇭",currency:"GHS",region:"Africa",status:"LIVE",prefix:"233",tz:"Africa/Accra"},
    {code:"ZA",name:"South Africa",flag:"🇿🇦",currency:"ZAR",region:"Africa",status:"LIVE",prefix:"27",tz:"Africa/Johannesburg"},
    {code:"JP",name:"Japan",flag:"🇯🇵",currency:"JPY",region:"Asia",status:"LIMITED",prefix:"81",tz:"Asia/Tokyo"},
    {code:"CA",name:"Canada",flag:"🇨🇦",currency:"CAD",region:"Americas",status:"LIMITED",prefix:"1",tz:"America/Toronto"},
    {code:"IN",name:"India",flag:"🇮🇳",currency:"INR",region:"Asia",status:"LIMITED",prefix:"91",tz:"Asia/Kolkata"},
    {code:"AE",name:"United Arab Emirates",flag:"🇦🇪",currency:"AED",region:"Middle East",status:"LIMITED",prefix:"971",tz:"Asia/Dubai"},
    {code:"DE",name:"Germany",flag:"🇩🇪",currency:"EUR",region:"Europe",status:"LIVE",prefix:"49",tz:"Europe/Berlin"},
    {code:"FR",name:"France",flag:"🇫🇷",currency:"EUR",region:"Europe",status:"LIVE",prefix:"33",tz:"Europe/Paris"},
    {code:"SG",name:"Singapore",flag:"🇸🇬",currency:"SGD",region:"Asia",status:"LIMITED",prefix:"65",tz:"Asia/Singapore"},
    {code:"BR",name:"Brazil",flag:"🇧🇷",currency:"BRL",region:"Americas",status:"COMING_SOON",prefix:"55",tz:"America/Sao_Paulo"},
    {code:"EG",name:"Egypt",flag:"🇪🇬",currency:"EGP",region:"Africa",status:"COMING_SOON",prefix:"20",tz:"Africa/Cairo"}
  ];

  /* Illustrative reference rates: USD per 1 unit of currency (preview only). */
  var RATES_USD = {USD:1, EUR:1.08, GBP:1.27, NGN:1/1520, CAD:0.73, AUD:0.66, NZD:0.61,
    CHF:1.12, JPY:0.0067, CNY:0.138, HKD:0.128, SGD:0.74, ZAR:0.055, KES:0.0077,
    GHS:0.066, UGX:0.00027, TZS:0.0004, RWF:0.00077, XOF:0.0018, XAF:0.0018,
    AED:0.272, SAR:0.266, QAR:0.275, KWD:3.25, BHD:2.65, INR:0.012, PKR:0.0036,
    BDT:0.0085, BRL:0.20, MXN:0.058, ARS:0.0011, CLP:0.00106, COP:0.00024,
    TRY:0.031, ILS:0.27, EGP:0.021, MAD:0.10, DZD:0.0075, ETB:0.008, MUR:0.022};

  var PAYMENTS = {
    NG:[{id:"ng_bank",name:"Bank transfer",eta:"Minutes"},{id:"ng_rail",name:"Instant rail transfer",eta:"Minutes"}],
    GB:[{id:"uk_bank",name:"Bank transfer",eta:"Minutes"},{id:"uk_fast",name:"Faster Payments",eta:"Minutes"}],
    US:[{id:"us_bank",name:"Bank transfer",eta:"1 business day"},{id:"us_ach",name:"ACH transfer",eta:"1–2 days"}],
    EU:[{id:"eu_sepa",name:"SEPA transfer",eta:"Same day"}],
    DEFAULT:[{id:"bank",name:"Bank transfer",eta:"Varies by country"}]
  };

  var LS_PROFILE = "trex_profile", LS_ADMIN = "trex_admin_config";

  function byCode(list, code){ for (var i=0;i<list.length;i++) if(list[i].code===code) return list[i]; return null; }
  function getCurrency(code){ return byCode(CURRENCIES, code); }
  function getCountry(code){ return byCode(COUNTRIES, code); }
  function store(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
  function load(k, d){ try{ var v=JSON.parse(localStorage.getItem(k)); return (v===null||v===undefined)?d:v; }catch(e){ return d; } }

  /* ---------- Money: minor-unit arithmetic + Intl formatting ---------- */
  function decimals(code){ var c=getCurrency(code); return c?c.dec:2; }
  function toMinor(amount, code){ var d=decimals(code); return Math.round(Number(amount)*Math.pow(10,d)); }
  function fromMinor(minor, code){ var d=decimals(code); return minor/Math.pow(10,d); }
  function fmt(amount, code){
    try{ return new Intl.NumberFormat("en-US",{style:"currency",currency:code}).format(Number(amount)); }
    catch(e){ var c=getCurrency(code); var s=c?c.symbol:""; return s+Number(amount).toLocaleString("en-US",{minimumFractionDigits:decimals(code),maximumFractionDigits:decimals(code)})+" "+code; }
  }
  function fmtMoney(amount, code){ return fmt(amount, code)+" "+code; }

  /* ---------- Reference rates (illustrative) ---------- */
  function refRate(from, to){
    if(from===to) return 1;
    var a=RATES_USD[from], b=RATES_USD[to];
    if(!a||!b) return null;
    return a/b;
  }
  function quote(o){
    // o: {send, recv, amount, feePct}
    var rate=refRate(o.send, o.recv);
    if(rate===null) return null;
    var now=Date.now();
    var grossMinor=toMinor(Number(o.amount)*rate, o.recv);
    var feeMinor=Math.round(grossMinor*(Number(o.feePct||1.5)/100));
    return { rate:rate, gross:fromMinor(grossMinor,o.recv), fee:fromMinor(feeMinor,o.recv),
      net:fromMinor(grossMinor-feeMinor,o.recv), send:o.send, recv:o.recv,
      amount:Number(o.amount), feePct:Number(o.feePct||1.5),
      asOf:now, expiresAt:now+30000, illustrative:true };
  }

  /* ---------- Country detection (phone prefix + locale + timezone) ---------- */
  function detectCountry(o){
    o=o||{};
    var reasons=[], cands={};
    function vote(code, why){ cands[code]=(cands[code]||0)+1; reasons.push(why); }
    var digits=String(o.phone||"").replace(/\D/g,"");
    if(digits){
      var best=null;
      COUNTRIES.forEach(function(c){ if(digits.indexOf(c.prefix)===0 && (!best||c.prefix.length>best.prefix.length)) best=c; });
      if(best) vote(best.code, "phone dialling code +"+best.prefix);
    }
    try{
      var lang=(o.locale||navigator.language||"").toUpperCase();
      var m=lang.match(/-([A-Z]{2})/);
      if(m && getCountry(m[1])) vote(m[1], "device language "+o.locale||navigator.language);
    }catch(e){}
    try{
      var tz=o.timezone||Intl.DateTimeFormat().resolvedOptions().timeZone||"";
      COUNTRIES.forEach(function(c){ if(c.tz===tz) vote(c.code, "device timezone "+tz); });
    }catch(e){}
    var top=null, topN=0, total=0;
    Object.keys(cands).forEach(function(k){ total+=cands[k]; if(cands[k]>topN){topN=cands[k];top=k;} });
    if(!top) return {country:null, confidence:"none", reasons:["no signal"]};
    return { country:top, currency:getCountry(top).currency,
      confidence: topN>=2?"high":(total>1?"medium":"low"), reasons:reasons };
  }
  function defaultSet(countryCode){
    var c=getCountry(countryCode);
    var local=c?c.currency:"USD";
    var set=[local,"USD","GBP","EUR"], out=[];
    set.forEach(function(x){ if(out.indexOf(x)<0 && getCurrency(x)) out.push(x); });
    return out;
  }

  /* ---------- Profile ---------- */
  function profile(){ return load(LS_PROFILE, null); }
  function saveProfile(p){ store(LS_PROFILE, p); return p; }
  function enabledCurrencies(){
    var p=profile();
    if(p&&p.enabled&&p.enabled.length) return p.enabled.filter(getCurrency);
    return defaultSet("NG");
  }

  /* ---------- Admin-controlled availability ---------- */
  function adminCfg(){ return load(LS_ADMIN, {disabled:[], pausedPairs:[], fees:{pct:1.5}}); }
  function currencyStatus(code){
    var cfg=adminCfg();
    if(cfg.disabled && cfg.disabled.indexOf(code)>=0) return "DISABLED";
    var c=getCurrency(code); if(!c) return "DISABLED";
    var ctr=byCode(COUNTRIES, (c.countries||[])[0]);
    return (ctr&&ctr.status!=="LIVE")?ctr.status:"LIVE";
  }
  function pairKey(a,b){ return a+"-"+b; }
  function pairStatus(a,b){
    var cfg=adminCfg();
    if(cfg.pausedPairs && (cfg.pausedPairs.indexOf(pairKey(a,b))>=0||cfg.pausedPairs.indexOf(pairKey(b,a))>=0)) return "PAUSED";
    var sa=currencyStatus(a), sb=currencyStatus(b);
    if(sa!=="LIVE"||sb!=="LIVE") return "LIMITED";
    if(!refRate(a,b)) return "COMING_SOON";
    return "LIVE";
  }
  function paymentsFor(countryCode, currencyCode){
    var list=PAYMENTS[countryCode]||PAYMENTS.DEFAULT;
    if(countryCode==="DE"||countryCode==="FR") list=PAYMENTS.EU;
    var ok=currencyStatus(currencyCode)==="LIVE"||currencyStatus(currencyCode)==="LIMITED";
    return { available:ok, methods: ok?list:[], note: ok?null:(currencyCode+" is listed on Trex, but no payment method is available in your country yet.") };
  }

  /* ---------- Search (code, name, symbol, flag, country) ---------- */
  function searchCurrencies(q){
    q=String(q||"").trim().toLowerCase();
    if(!q) return CURRENCIES.slice();
    return CURRENCIES.filter(function(c){
      var ctr=(c.countries||[]).map(function(cc){ var g=getCountry(cc); return g?g.name:""; }).join(" ");
      return (c.code+" "+c.name+" "+c.symbol+" "+c.flag+" "+ctr).toLowerCase().indexOf(q)>=0;
    });
  }

  /* ---------- Vendor label parsing, ledger, audit, time ---------- */
  function parseVendor(label){
    var m=String(label||"").match(/★\s?([\d.]+)/), t=String(label||"").match(/([\d,]+)\s*trades/);
    var name=String(label||"").split("•")[0].trim()||"Vendor";
    return { name:name, rating:m?Number(m[1]):null, trades:t?Number(t[1].replace(/,/g,"")):0 };
  }
  /* Migrate legacy NGN-era offers (pair + NGN min/max, no numeric rate). */
  function normalizeOffer(o){
    if(o.provide && o.rate) { if(o.capacity===undefined||o.capacity===null) o.capacity=5000; return o; }
    var legs=String(o.pair||"USD/NGN").split("/");
    o.provide=o.provide||legs[0]; o.want=o.want||legs[1];
    var r=refRate(o.provide,o.want);
    o.rate=(typeof o.rate==="number"&&o.rate>0)?o.rate:(r||1);
    if(o.capacity===undefined||o.capacity===null) o.capacity=4000;
    o.legacy=true; o.live=o.live!==false;
    o.methods=o.methods||["Bank transfer"];
    return o;
  }
  function ledger(tr){
    return { transaction_id:tr.id||("TXN-"+Date.now().toString(36).toUpperCase()),
      user_id:tr.user||"customer", vendor_id:tr.vendor||null, trade_id:tr.trade||null,
      currency:tr.sendCur, amount_minor:toMinor(tr.sendAmt,tr.sendCur), direction:"send",
      rate:tr.rate, counter_currency:tr.recvCur, counter_minor:toMinor(tr.recvAmt,tr.recvCur),
      fee_minor:toMinor(tr.fee,tr.recvCur), fee_currency:tr.recvCur,
      payment_method:tr.method||null, settlement:"pending",
      status:tr.status||"open", created_at:new Date().toISOString(), reference:tr.ref||null };
  }
  function audit(ev){ try{ var a=load("trex_audit",[]); a.push(new Date().toISOString()+" "+ev); store("trex_audit",a.slice(-100)); }catch(e){} }
  function localTime(iso){
    try{ var d=iso?new Date(iso):new Date();
      return d.toLocaleString("en-GB",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit",timeZoneName:"short"});
    }catch(e){ return String(iso||""); }
  }

  global.TREX = { CURRENCIES:CURRENCIES, COUNTRIES:COUNTRIES, RATES_USD:RATES_USD,
    getCurrency:getCurrency, getCountry:getCountry, searchCurrencies:searchCurrencies,
    decimals:decimals, toMinor:toMinor, fromMinor:fromMinor, fmt:fmt, fmtMoney:fmtMoney,
    refRate:refRate, quote:quote, detectCountry:detectCountry, defaultSet:defaultSet,
    profile:profile, saveProfile:saveProfile, enabledCurrencies:enabledCurrencies,
    adminCfg:adminCfg, currencyStatus:currencyStatus, pairStatus:pairStatus, pairKey:pairKey,
    paymentsFor:paymentsFor, parseVendor:parseVendor, normalizeOffer:normalizeOffer, ledger:ledger, audit:audit, localTime:localTime,
    store:store, load:load };
})(window);
