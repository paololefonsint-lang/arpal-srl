/* ==========================================================================
   ARPAL — consenso cookie (banner + gating embed di terze parti)
   ========================================================================== */
(function(){
  "use strict";
  var STORAGE_KEY = "arpal-cookie-consent";

  function getConsent(){
    try { return window.localStorage.getItem(STORAGE_KEY); }
    catch(e){ return null; }
  }
  function setConsent(value){
    try { window.localStorage.setItem(STORAGE_KEY, value); }
    catch(e){ /* localStorage non disponibile: il banner ricomparirà ad ogni visita */ }
  }

  function applyEmbeds(choice){
    document.querySelectorAll("[data-consent-src]").forEach(function(iframe){
      var wrap = iframe.closest("[data-consent-embed]");
      var fallback = wrap ? wrap.querySelector("[data-consent-fallback]") : null;
      if(choice === "accepted"){
        if(!iframe.src) iframe.src = iframe.getAttribute("data-consent-src");
        iframe.hidden = false;
        if(fallback) fallback.hidden = true;
      } else {
        iframe.hidden = true;
        if(fallback) fallback.hidden = false;
      }
    });
  }

  function showBanner(){
    var banner = document.querySelector("[data-cookie-banner]");
    if(banner) banner.classList.add("is-open");
  }
  function hideBanner(){
    var banner = document.querySelector("[data-cookie-banner]");
    if(banner) banner.classList.remove("is-open");
  }

  function init(){
    var stored = getConsent();
    applyEmbeds(stored === "accepted" ? "accepted" : "rejected");
    if(!stored){
      showBanner();
    }

    document.addEventListener("click", function(e){
      var acceptBtn = e.target.closest("[data-cookie-accept]");
      var rejectBtn = e.target.closest("[data-cookie-reject]");
      var prefsBtn = e.target.closest("[data-cookie-preferences]");
      var loadBtn = e.target.closest("[data-consent-load]");

      if(acceptBtn){
        setConsent("accepted");
        applyEmbeds("accepted");
        hideBanner();
      }
      if(rejectBtn){
        setConsent("rejected");
        applyEmbeds("rejected");
        hideBanner();
      }
      if(prefsBtn){
        e.preventDefault();
        showBanner();
      }
      if(loadBtn){
        var wrap = loadBtn.closest("[data-consent-embed]");
        var iframe = wrap ? wrap.querySelector("[data-consent-src]") : null;
        if(iframe){
          iframe.src = iframe.getAttribute("data-consent-src");
          iframe.hidden = false;
          loadBtn.closest("[data-consent-fallback]").hidden = true;
        }
      }
    });
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
