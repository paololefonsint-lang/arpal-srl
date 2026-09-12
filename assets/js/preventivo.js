/* ==========================================================================
   Richiedi preventivo — form multi-step
   ========================================================================== */
(function(){
  "use strict";

  const form = document.getElementById("quoteForm");
  if(!form) return;

  const STEP_LABELS = {
    1:"Tipo di intervento",
    2:"Tipo di edificio",
    3:"Nuova costruzione o ristrutturazione",
    4:"Tempistica",
    5:"I tuoi dati",
    6:"Riepilogo"
  };
  const TOTAL_STEPS = 6;

  const bars = Array.from(document.querySelectorAll("[data-progress] .bar"));
  const stepCurrentEl = document.querySelector("[data-step-current]");
  const stepLabelEl = document.querySelector("[data-step-label]");
  const metaEl = document.querySelector(".quote-meta");
  const backBtn = document.querySelector("[data-step-back]");
  const nextBtn = document.querySelector("[data-step-next]");
  const submitBtn = document.querySelector("[data-step-submit]");
  const navEl = document.querySelector("[data-quote-nav]");
  const summaryEl = document.querySelector("[data-summary]");
  const progressEl = document.querySelector("[data-progress]");

  let current = 1;

  function getStepEl(step){ return form.querySelector(`.quote-step[data-step="${step}"]`); }

  function showStep(step){
    form.querySelectorAll(".quote-step").forEach(el=> el.classList.remove("is-active"));
    getStepEl(step)?.classList.add("is-active");

    if(step === "success"){
      navEl.style.display = "none";
      metaEl.style.display = "none";
      progressEl.style.display = "none";
      window.scrollTo({top: form.getBoundingClientRect().top + window.scrollY - 100, behavior:"smooth"});
      return;
    }

    navEl.style.display = "";
    metaEl.style.display = "";
    stepCurrentEl.textContent = step;
    stepLabelEl.textContent = STEP_LABELS[step] || "";

    bars.forEach((bar,i)=>{
      bar.classList.remove("is-done","is-current");
      if(i < step - 1) bar.classList.add("is-done");
      else if(i === step - 1) bar.classList.add("is-current");
    });

    backBtn.hidden = step === 1;
    nextBtn.hidden = step === TOTAL_STEPS;
    submitBtn.hidden = step !== TOTAL_STEPS;

    if(step === TOTAL_STEPS) buildSummary();

    const shell = document.querySelector(".quote-shell");
    if(shell) window.arpalScrollTo ? window.arpalScrollTo(".quote-shell") : shell.scrollIntoView({behavior:"smooth", block:"start"});
  }

  function validateStep(step){
    const el = getStepEl(step);
    if(!el) return true;
    let ok = true;
    let firstInvalid = null;

    el.querySelectorAll("[data-required]").forEach(group=>{
      const checked = group.querySelector("input:checked");
      group.classList.toggle("has-error", !checked);
      if(!checked){ ok = false; firstInvalid = firstInvalid || group; }
    });

    el.querySelectorAll("input[required], textarea[required]").forEach(inp=>{
      if(!inp.checkValidity()){ ok = false; firstInvalid = firstInvalid || inp; }
    });

    if(!ok && firstInvalid){
      firstInvalid.scrollIntoView({behavior:"smooth", block:"center"});
      if(firstInvalid.reportValidity) firstInvalid.reportValidity();
    }
    return ok;
  }

  function buildSummary(){
    const data = new FormData(form);
    const interventi = data.getAll("intervento").join(", ") || "—";
    const rows = [
      ["Tipo di intervento", interventi],
      ["Tipo di edificio", data.get("edificio") || "—"],
      ["Natura dell'intervento", data.get("natura_intervento") || "—"],
      ["Tempistica", data.get("tempistica") || "—"],
      ["Nome", data.get("nome") || "—"],
      ["Azienda", data.get("azienda") || "—"],
      ["E-mail", data.get("email") || "—"],
      ["Telefono", data.get("telefono") || "—"],
      ["Comune / provincia", data.get("comune") || "—"],
    ];
    summaryEl.innerHTML = rows.map(([k,v])=>`<div class="row"><span>${k}</span><span>${v}</span></div>`).join("");
  }

  nextBtn?.addEventListener("click", ()=>{
    if(!validateStep(current)) return;
    current = Math.min(current + 1, TOTAL_STEPS);
    showStep(current);
  });

  backBtn?.addEventListener("click", ()=>{
    current = Math.max(current - 1, 1);
    showStep(current);
  });

  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    if(!validateStep(TOTAL_STEPS) || !validateStep(5)) return;

    const body = new URLSearchParams(new FormData(form)).toString();
    fetch("/", { method:"POST", headers:{"Content-Type":"application/x-www-form-urlencoded"}, body })
      .then(()=> showStep("success"))
      .catch(()=> showStep("success"));
  });

  showStep(current);
})();
