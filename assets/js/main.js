/* ==========================================================================
   ARPAL — comportamento del sito
   ========================================================================== */
(function(){
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = () => window.innerWidth < 860;

  /* ---------------------------------------------------- date dinamiche -- */
  const currentYear = new Date().getFullYear();
  document.querySelectorAll("[data-years-since]").forEach(el=>{
    el.textContent = currentYear - parseInt(el.dataset.yearsSince, 10);
  });
  document.querySelectorAll("[data-current-year]").forEach(el=>{
    el.textContent = currentYear;
  });

  /* ---------------------------------------------------- Lenis + GSAP ---- */
  let lenis = null;
  if(window.gsap && window.ScrollTrigger){ gsap.registerPlugin(ScrollTrigger); }

  if(!reduceMotion && window.Lenis){
    lenis = new Lenis({
      duration:1.05,
      easing:(t)=> Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel:true,
    });
    lenis.on("scroll", ()=>{ if(window.ScrollTrigger) ScrollTrigger.update(); });
    if(window.gsap){
      gsap.ticker.add((time)=>{ lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      requestAnimationFrame(function raf(time){ lenis.raf(time); requestAnimationFrame(raf); });
    }
  }
  let lenisStopCount = 0;
  window.arpalFreezeScroll = ()=>{
    lenisStopCount++;
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  };
  window.arpalUnfreezeScroll = ()=>{
    lenisStopCount = Math.max(0, lenisStopCount - 1);
    if(lenisStopCount === 0){
      lenis?.start();
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
  };
  window.arpalScrollTo = (target)=>{
    if(lenis){ lenis.scrollTo(target, {offset:-70}); }
    else { document.querySelector(target)?.scrollIntoView({behavior:"smooth"}); }
  };

  /* ---------------------------------------------------- header ---------- */
  const header = document.querySelector(".site-header");
  const isHome = document.body.classList.contains("home");
  const onScrollHeader = ()=>{
    if(!header) return;
    if(!isHome){ header.classList.add("is-scrolled"); return; }
    header.classList.toggle("is-scrolled", window.scrollY > 40);
  };
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, {passive:true});
  if(lenis) lenis.on("scroll", onScrollHeader);

  /* ---------------------------------------------------- mobile nav ------ */
  const navToggle = document.querySelector(".nav-toggle");
  const mobileNav = document.querySelector(".mobile-nav");
  if(navToggle && mobileNav){
    const closeNav = ()=>{ mobileNav.classList.remove("is-open"); navToggle.setAttribute("aria-expanded","false"); window.arpalUnfreezeScroll(); };
    const openNav = ()=>{ mobileNav.classList.add("is-open"); navToggle.setAttribute("aria-expanded","true"); window.arpalFreezeScroll(); };
    navToggle.addEventListener("click", ()=>{
      mobileNav.classList.contains("is-open") ? closeNav() : openNav();
    });
    mobileNav.querySelectorAll("a").forEach(a=> a.addEventListener("click", closeNav));
    const serviziToggle = mobileNav.querySelector(".mobile-nav-servizi-toggle");
    const serviziWrap = mobileNav.querySelector(".mobile-nav-servizi");
    if(serviziToggle && serviziWrap){
      serviziToggle.addEventListener("click", ()=>{
        const isOpen = serviziWrap.classList.toggle("is-open");
        serviziToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
    }
  }

  /* ---------------------------------------------------- nav dropdown ---- */
  document.querySelectorAll(".nav-servizi").forEach(nav=>{
    const trigger = nav.querySelector(":scope > a");
    const menu = nav.querySelector(".nav-mega");
    let closeTimer;
    const open = ()=>{
      clearTimeout(closeTimer);
      nav.classList.add("is-open");
      if(trigger && menu){
        menu.style.left = trigger.getBoundingClientRect().left + "px";
      }
    };
    const scheduleClose = ()=>{ clearTimeout(closeTimer); closeTimer = setTimeout(()=> nav.classList.remove("is-open"), 300); };
    nav.addEventListener("mouseenter", open);
    nav.addEventListener("mouseleave", scheduleClose);
    if(menu){
      menu.addEventListener("mouseenter", open);
      menu.addEventListener("mouseleave", scheduleClose);
    }
  });

  /* ---------------------------------------------------- anteprima touch -- */
  if(window.matchMedia("(hover: none)").matches){
    const stripItems = document.querySelectorAll(".strip-item");
    stripItems.forEach(item=>{
      item.addEventListener("touchstart", ()=>{
        stripItems.forEach(other=> other.classList.toggle("is-touched", other === item));
      }, {passive:true});
    });
    document.addEventListener("touchstart", (e)=>{
      if(!e.target.closest(".strip-item")){
        stripItems.forEach(other=> other.classList.remove("is-touched"));
      }
    }, {passive:true});
  }

  /* ---------------------------------------------------- smooth anchors -- */
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener("click", (e)=>{
      const id = a.getAttribute("href");
      if(id.length < 2) return;
      const target = document.querySelector(id);
      if(!target) return;
      e.preventDefault();
      window.arpalScrollTo(target);
    });
  });

  /* ---------------------------------------------------- hero slideshow -- */
  const heroSlides = document.querySelectorAll(".hero-slide");
  if(heroSlides.length > 1){
    let idx = 0;
    setInterval(()=>{
      heroSlides[idx].classList.remove("is-active");
      idx = (idx + 1) % heroSlides.length;
      heroSlides[idx].classList.add("is-active");
    }, 5200);
  }

  /* ---------------------------------------------------- render galleries */
  function webpOf(src){
    return /\.jpe?g$/i.test(src) ? src.replace(/\.jpe?g$/i, ".webp") : null;
  }
  function pictureHTML(src, alt, extraAttrs){
    const webp = webpOf(src);
    if(!webp) return `<img src="${src}" alt="${alt}" ${extraAttrs}>`;
    return `<picture><source srcset="${webp}" type="image/webp"><img src="${src}" alt="${alt}" ${extraAttrs}></picture>`;
  }
  function galleryItemsFor(key){
    if(!key) return null;
    if(key.endsWith("_extra")) return window.ARPAL_GALLERIES_EXTRA?.[key.slice(0, -6)];
    return window.ARPAL_GALLERIES?.[key];
  }
  function renderGalleries(){
    document.querySelectorAll("[data-gallery]").forEach(container=>{
      const key = container.getAttribute("data-gallery");
      const items = galleryItemsFor(key);
      if(!items) return;
      container.innerHTML = items.map((it, i)=>{
        if(it.video){
          return `<button type="button" class="gallery-item" data-video="${it.src}" data-index="${i}" aria-label="Riproduci video">
            ${pictureHTML(it.poster, it.alt, 'loading="lazy" decoding="async"')}
            <span class="play"><span></span></span>
          </button>`;
        }
        return `<button type="button" class="gallery-item" data-index="${i}" aria-label="${it.alt}">
          ${pictureHTML(it.src, it.alt, 'loading="lazy" decoding="async"')}
        </button>`;
      }).join("");
    });
  }
  renderGalleries();

  /* ---------------------------------------------------- lightbox -------- */
  const lightbox = document.querySelector(".lightbox");
  let lbItems = [], lbIndex = 0;
  function openLightbox(items, index){
    lbItems = items; lbIndex = index;
    renderLightbox();
    lightbox.classList.add("is-open");
    window.arpalFreezeScroll();
  }
  function closeLightbox(){
    lightbox.classList.remove("is-open");
    lightbox.querySelector(".lightbox-media").innerHTML = "";
    window.arpalUnfreezeScroll();
  }
  function renderLightbox(){
    const it = lbItems[lbIndex];
    const media = lightbox.querySelector(".lightbox-media");
    if(it.video){
      media.innerHTML = `<video src="${it.src}" controls autoplay playsinline poster="${it.poster||""}"></video>`;
    } else {
      media.innerHTML = pictureHTML(it.src, it.alt, 'decoding="async"');
    }
  }
  if(lightbox){
    lightbox.querySelector(".lightbox-close")?.addEventListener("click", closeLightbox);
    lightbox.querySelector(".lightbox-backdrop")?.addEventListener("click", closeLightbox);
    lightbox.querySelector(".lightbox-prev")?.addEventListener("click", ()=>{
      lbIndex = (lbIndex - 1 + lbItems.length) % lbItems.length; renderLightbox();
    });
    lightbox.querySelector(".lightbox-next")?.addEventListener("click", ()=>{
      lbIndex = (lbIndex + 1) % lbItems.length; renderLightbox();
    });
    document.addEventListener("keydown", (e)=>{
      if(!lightbox.classList.contains("is-open")) return;
      if(e.key === "Escape") closeLightbox();
      if(e.key === "ArrowRight") lightbox.querySelector(".lightbox-next").click();
      if(e.key === "ArrowLeft") lightbox.querySelector(".lightbox-prev").click();
    });
  }
  document.addEventListener("click", (e)=>{
    const btn = e.target.closest(".gallery-item");
    if(btn){
      const container = btn.closest("[data-gallery]");
      const key = container?.getAttribute("data-gallery");
      const items = galleryItemsFor(key);
      if(!items) return;
      openLightbox(items, Number(btn.getAttribute("data-index")));
      return;
    }
    const allBtn = e.target.closest("[data-gallery-all]");
    if(allBtn){
      const key = allBtn.getAttribute("data-gallery-all");
      const main = window.ARPAL_GALLERIES?.[key] || [];
      const extra = window.ARPAL_GALLERIES_EXTRA?.[key] || [];
      const combined = main.concat(extra);
      if(!combined.length) return;
      openLightbox(combined, 0);
    }
  });

  /* ---------------------------------------------------- timeline render - */
  const timelineEl = document.querySelector("[data-timeline]");
  if(timelineEl && window.ARPAL_TIMELINE){
    timelineEl.innerHTML = window.ARPAL_TIMELINE.map(t=>`
      <div class="timeline-item">
        <span class="timeline-dot"></span>
        <div class="timeline-year">${t.year === "current" ? currentYear : t.year}</div>
        <h3>${t.title}</h3>
        <p>${t.text}</p>
      </div>`).join("");
  }

  /* ---------------------------------------------------- materiali render  */
  const materialGrid = document.querySelector("[data-material-grid]");
  const materialModal = document.querySelector(".modal[data-modal='material']");
  if(materialGrid && window.ARPAL_MATERIALS){
    const cards = window.ARPAL_MATERIALS.map(m=>`
      <button type="button" class="material-card" data-material="${m.id}" style="--mat-bg:url('/assets/img/materiali/${m.id}.jpg')">
        <span class="mat-tag">${m.tag}</span>
        <h3>${m.name}</h3>
        <span class="mat-more">Scopri di più <span aria-hidden="true">&rarr;</span></span>
      </button>`);
    // se l'ultima riga della griglia a 3 colonne ha un solo elemento, lo centra
    // affiancandolo a due celle "vuote" (stesso sfondo delle card, non la linea grigia)
    if(cards.length % 3 === 1){
      const spacer = '<div class="material-spacer" aria-hidden="true"></div>';
      cards.splice(cards.length - 1, 0, spacer);
      cards.push(spacer);
    }
    materialGrid.innerHTML = cards.join("");
  }
  function openMaterial(id){
    const m = window.ARPAL_MATERIALS.find(x=>x.id === id);
    if(!m || !materialModal) return false;
    materialModal.querySelector(".mat-tag-modal").textContent = m.tag;
    materialModal.querySelector(".modal-title").textContent = m.name;
    materialModal.querySelector(".modal-lede").textContent = m.lede;
    materialModal.querySelector(".modal-text").innerHTML = m.text.map(p=>`<p>${p}</p>`).join("");
    materialModal.querySelector(".modal-benefits").innerHTML = m.benefits.map(b=>`<li>${b}</li>`).join("");
    materialModal.classList.add("is-open");
    window.arpalFreezeScroll();
    return true;
  }
  function closeMaterial(){
    materialModal.classList.remove("is-open");
    window.arpalUnfreezeScroll();
  }
  document.addEventListener("click", (e)=>{
    const card = e.target.closest("[data-material]");
    if(card){
      const id = card.getAttribute("data-material");
      if(window.ARPAL_MATERIALS?.some(m=>m.id === id) && materialModal){
        e.preventDefault();
        openMaterial(id);
      }
      return;
    }
    if(e.target.closest("[data-modal-close]")){ closeMaterial(); return; }
    if(e.target === materialModal){ closeMaterial(); }
  });
  document.addEventListener("keydown", (e)=>{
    if(e.key === "Escape" && materialModal?.classList.contains("is-open")) closeMaterial();
  });

  const wantedMaterial = new URLSearchParams(location.search).get("material");
  if(wantedMaterial && window.ARPAL_MATERIALS?.some(m=>m.id === wantedMaterial)){
    openMaterial(wantedMaterial);
    history.replaceState(null, "", location.pathname + location.hash);
  }

  /* ---------------------------------------------------- GSAP animations - */
  if(window.gsap && window.ScrollTrigger && !reduceMotion){

    gsap.utils.toArray(".reveal, .reveal-fast").forEach(el=>{
      gsap.to(el, {
        opacity:1, y:0,
        duration:1,
        ease:"power3.out",
        scrollTrigger:{ trigger:el, start:"top 88%" }
      });
    });

    gsap.utils.toArray("[data-stagger]").forEach(group=>{
      const items = group.children;
      gsap.to(items, {
        opacity:1, y:0,
        duration:.9, ease:"power3.out",
        stagger:0.08,
        scrollTrigger:{ trigger:group, start:"top 85%" }
      });
    });

    // timeline progress + active dot
    const track = document.querySelector(".timeline");
    if(track){
      gsap.to(".timeline-progress", {
        height:"100%",
        ease:"none",
        scrollTrigger:{ trigger:track, start:"top 60%", end:"bottom 80%", scrub:0.4 }
      });
      gsap.utils.toArray(".timeline-item").forEach(item=>{
        ScrollTrigger.create({
          trigger:item, start:"top 65%", end:"bottom 40%",
          onEnter:()=> item.classList.add("is-active"),
          onEnterBack:()=> item.classList.add("is-active"),
        });
      });
    }

    // parallax — desktop/tablet only
    ScrollTrigger.matchMedia({
      "(min-width: 860px)":function(){
        gsap.utils.toArray(".js-parallax").forEach(img=>{
          gsap.to(img, {
            yPercent:12,
            ease:"none",
            scrollTrigger:{ trigger:img.closest(".js-parallax-wrap") || img, start:"top bottom", end:"bottom top", scrub:true }
          });
        });
        gsap.to(".hero-slide.is-active img, .hero-slide img", {
          scale:1,
          scrollTrigger:{ trigger:".hero", start:"top top", end:"bottom top", scrub:true }
        });
      }
    });
  } else {
    document.querySelectorAll(".reveal, .reveal-fast").forEach(el=>{
      el.style.opacity = 1; el.style.transform = "none";
    });
  }

  window.addEventListener("load", ()=>{
    if(window.ScrollTrigger) setTimeout(()=>ScrollTrigger.refresh(), 200);
  });

})();
