/* ==========================================================================
   AGÊNCIA TOOC - SCRIPTS
   Módulo Principal (Vanilla JS)
   - Controle de Menu Responsivo
   - Controle de Header
   - Smooth Scroll
   - Reveal Animations (IntersectionObserver)
   - Hero Image Sequence com HTML Canvas
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  /* ----------------------------------------------------------------------
       1. CONTROLE DO MENU MOBILE E HEADER
       ---------------------------------------------------------------------- */
  const header = document.getElementById("headerRef");
  const hamburger = document.querySelector(".hamburger-menu");
  const desktopNav = document.querySelector(".desktop-nav");
  const navLinks = document.querySelectorAll(".nav-links a");

  if (hamburger && desktopNav) {
    const closeMenu = () => {
      hamburger.classList.remove("active");
      desktopNav.classList.remove("active");
      hamburger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    };

    hamburger.addEventListener("click", () => {
      const isActive = hamburger.classList.toggle("active");
      desktopNav.classList.toggle("active");
      hamburger.setAttribute("aria-expanded", isActive ? "true" : "false");

      if (isActive) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    // Check if there's a CTA inside the menu to also trigger close
    const mobileCTAs = desktopNav.querySelectorAll(".cta-modal-trigger");
    mobileCTAs.forEach((btn) => {
      btn.addEventListener("click", closeMenu);
    });
  }

  window.addEventListener(
    "scroll",
    () => {
      if (window.scrollY > 50) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    },
    { passive: true },
  );

  /* ----------------------------------------------------------------------
       2. SMOOTH SCROLL (Ancoragem Suave)
       ---------------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    });
  });

  /* ----------------------------------------------------------------------
       3. REVEAL ANIMATIONS (Animação de elementos ao aparecer na tela)
       ---------------------------------------------------------------------- */
  const styleBlock = document.createElement("style");
  styleBlock.textContent = `
        .reveal-element {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease, transform 0.6s ease;
            will-change: opacity, transform;
            pointer-events: auto !important;
        }
        .reveal-element.revealed {
            opacity: 1;
            transform: translateY(0);
        }
    `;
  document.head.appendChild(styleBlock);

  // Seleciona as classes que devem receber o efeito ao rolar (including Manifesto e Pillars)
  const elementsToReveal = document.querySelectorAll(
    ".section-title, .section-text, .metric-card, .method-card, .project-card, .authority-text-col, .pillar-premium-card, .timeline-item, .process-line, .cta-box",
  );

  elementsToReveal.forEach((el) => {
    el.classList.add("reveal-element");
  });

  const revealOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        observer.unobserve(entry.target);
      }
    });
  }, revealOptions);

  elementsToReveal.forEach((el) => revealObserver.observe(el));

  /* ----------------------------------------------------------------------
       4. HERO CANVANS IMAGE SEQUENCE (Comportamento Apple-style)
       ---------------------------------------------------------------------- */
  const canvas = document.getElementById("heroCanvas");
  if (canvas) {
    const context = canvas.getContext("2d");
    const heroSection = document.querySelector(".hero-section");

    const frameCount = 77;
    const images = [];
    let currentFrameIndex = 0;

    const getFramePath = (index) =>
      `./assets/frames/frame_${index.toString().padStart(3, "0")}.jpg`;

    const loadFrame = (index) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = getFramePath(index);

        img.onload = () => resolve(img);

        img.onerror = () => {
          resolve(img);
        };
      });
    };

    const initCanvasSequence = async () => {
      for (let i = 0; i < Math.min(5, frameCount); i++) {
        images[i] = await loadFrame(i);
      }

      resizeCanvas();

      for (let i = 5; i < frameCount; i++) {
        loadFrame(i).then((img) => {
          images[i] = img;
        });
      }
    };

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      renderFrame(currentFrameIndex);
    };

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resizeCanvas, 50);
    });

    const drawImageCover = (ctx, img, w, h) => {
      if (!img || img.naturalWidth === 0) return;

      const imgRatio = img.width / img.height;
      const canvasRatio = w / h;
      let renderW, renderH, x, y;

      if (imgRatio > canvasRatio) {
        renderH = h;
        renderW = h * imgRatio;
        x = (w - renderW) / 2;
        y = 0;
      } else {
        renderW = w;
        renderH = w / imgRatio;
        y = (h - renderH) / 2;
        x = 0;
      }

      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, x, y, renderW, renderH);
    };

    const renderFrame = (index) => {
      if (images[index]) {
        drawImageCover(context, images[index], canvas.width, canvas.height);
      }
    };

    initCanvasSequence();

    let ticking = false;

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            const scrollTop = window.scrollY;
            const heroTop = heroSection ? heroSection.offsetTop : 0;
            const heroHeight = heroSection
              ? heroSection.clientHeight
              : window.innerHeight;

            const scrollableDistance = heroHeight - window.innerHeight;
            const scrollPosRel = scrollTop - heroTop;

            let scrollFraction = scrollPosRel / scrollableDistance;
            if (scrollFraction < 0) scrollFraction = 0;
            if (scrollFraction > 1) scrollFraction = 1;

            const frameIndex = Math.min(
              frameCount - 1,
              Math.floor(scrollFraction * frameCount),
            );

            if (currentFrameIndex !== frameIndex) {
              currentFrameIndex = frameIndex;
              renderFrame(currentFrameIndex);
            }

            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true },
    );
  }

  /* ----------------------------------------------------------------------
       5. FAQ ACCORDION
       ---------------------------------------------------------------------- */
  const faqQuestions = document.querySelectorAll(".faq-question");

  faqQuestions.forEach((question) => {
    question.addEventListener("click", (e) => {
      e.preventDefault();
      const faqItem = question.closest(".faq-item");
      const faqAnswer = faqItem.querySelector(".faq-answer");
      const isActive = faqItem.classList.contains("active");

      // Close all other items
      document.querySelectorAll(".faq-item.active").forEach((otherItem) => {
        if (otherItem !== faqItem) {
          otherItem.classList.remove("active");
          const otherQuestion = otherItem.querySelector(".faq-question");
          if (otherQuestion)
            otherQuestion.setAttribute("aria-expanded", "false");
          const otherAnswer = otherItem.querySelector(".faq-answer");
          if (otherAnswer) {
            otherAnswer.style.maxHeight = null;
          }
        }
      });

      // Toggle clicked item
      if (isActive) {
        faqItem.classList.remove("active");
        question.setAttribute("aria-expanded", "false");
        if (faqAnswer) {
          faqAnswer.style.maxHeight = null;
        }
      } else {
        faqItem.classList.add("active");
        question.setAttribute("aria-expanded", "true");
        if (faqAnswer) {
          faqAnswer.style.maxHeight = faqAnswer.scrollHeight + "px";
        }
      }
    });
  });

  // Initialize open height for the active element
  setTimeout(() => {
    const initialActive = document.querySelector(".faq-item.active");
    if (initialActive) {
      const answer = initialActive.querySelector(".faq-answer");
      if (answer) answer.style.maxHeight = answer.scrollHeight + "px";
    }
  }, 100);

  // Window size canvas initialization removed

  /* ----------------------------------------------------------------------
       6. CONTACT FORM HANDLING
       ---------------------------------------------------------------------- */
  const contactForm = document.getElementById("project-contact-form");
  if (contactForm) {
    const fileInput = document.getElementById("contact-files");
    const fileDropArea = document.querySelector(".file-drop-area");
    const fileListPreview = document.getElementById("file-list-preview");
    const submitBtn = contactForm.querySelector(".btn-submit");
    const btnText = submitBtn.querySelector(".btn-text");
    const btnLoader = submitBtn.querySelector(".btn-loader");
    const formStatus = document.getElementById("form-status");

    let selectedFiles = [];

    // File Selection Handlers
    if (fileInput && fileDropArea && fileListPreview) {
      // Drag & Drop
      ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
        fileDropArea.addEventListener(eventName, preventDefaults, false);
      });

      function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
      }

      ["dragenter", "dragover"].forEach((eventName) => {
        fileDropArea.addEventListener(
          eventName,
          () => {
            fileDropArea.classList.add("drag-over");
          },
          false,
        );
      });

      ["dragleave", "drop"].forEach((eventName) => {
        fileDropArea.addEventListener(
          eventName,
          () => {
            fileDropArea.classList.remove("drag-over");
          },
          false,
        );
      });

      fileDropArea.addEventListener(
        "drop",
        (e) => {
          let dt = e.dataTransfer;
          let files = dt.files;
          handleFiles(files);
        },
        false,
      );

      // Click to select
      fileInput.addEventListener("change", function () {
        handleFiles(this.files);
      });

      function handleFiles(files) {
        Array.from(files).forEach((file) => {
          // Quick validation for expected size/type could go here
          if (
            !selectedFiles.some(
              (f) => f.name === file.name && f.size === file.size,
            )
          ) {
            selectedFiles.push(file);
            renderFileList();
          }
        });

        // Clear the actual input so selecting the same file again triggers 'change'
        fileInput.value = "";
      }

      function renderFileList() {
        fileListPreview.innerHTML = "";
        selectedFiles.forEach((file, index) => {
          const item = document.createElement("div");
          item.className = "file-item";

          const nameSpan = document.createElement("span");
          nameSpan.className = "file-item-name";
          // Truncate name if too long
          let dName = file.name;
          if (dName.length > 25) {
            dName =
              dName.substring(0, 12) +
              "..." +
              dName.substring(dName.length - 10);
          }
          const sizeStr = (file.size / 1024 / 1024).toFixed(2) + " MB";
          nameSpan.textContent = `${dName} (${sizeStr})`;

          const rmBtn = document.createElement("button");
          rmBtn.className = "file-item-remove";
          rmBtn.type = "button";
          rmBtn.innerHTML = "×";
          rmBtn.setAttribute("aria-label", `Remover arquivo ${file.name}`);
          rmBtn.onclick = () => {
            selectedFiles.splice(index, 1);
            renderFileList();
          };

          item.appendChild(nameSpan);
          item.appendChild(rmBtn);
          fileListPreview.appendChild(item);
        });
      }
    }

    // Form Submit
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // UI State loading
      btnText.style.display = "none";
      btnLoader.style.display = "inline-block";
      submitBtn.disabled = true;
      submitBtn.style.opacity = "0.7";

      formStatus.style.display = "none";
      formStatus.className = "form-status";

      const formData = new FormData(contactForm);
      // Append files from our selectedFiles array
      selectedFiles.forEach((file) => {
        formData.append("files[]", file);
      });

      try {
        // Determine target endpoint
        const targetEndpoint =
          contactForm.getAttribute("action") || "/api/send-email";

        // Send Request
        const response = await fetch(targetEndpoint, {
          method: "POST",
          body: formData,
        });

        // Usually an actual endpoint answers 2xx.
        if (response.ok) {
          formStatus.classList.add("success");
          formStatus.innerHTML = `
                        <div class="form-status-title">Mensagem enviada com sucesso.</div>
                        <div class="form-status-text">Recebemos as informações do seu projeto. Em breve, nossa equipe entrará em contato para dar continuidade ao diagnóstico estratégico.</div>
                    `;
          contactForm.reset();
          selectedFiles = [];
          if (typeof renderFileList === "function") renderFileList();
        } else {
          throw new Error("Fallback para frontend");
        }
      } catch (error) {
        // Without a real backend, this fetch will fail or return 404, we'll gracefully show the requirement message instead of just a raw error.
        formStatus.classList.add("error");
        formStatus.innerHTML = `
                    <div class="form-status-title">Não foi possível enviar agora.</div>
                    <div class="form-status-text">Formulário pronto para integração. Configure o endpoint <strong>/api/send-email</strong> para envio real com anexos. <br><br>Tente novamente em alguns instantes ou entre em contato pelo <a href="https://wa.me/5563992986300" target="_blank">WhatsApp</a>.</div>
                `;
      } finally {
        // UI State restore
        btnText.style.display = "inline-block";
        btnLoader.style.display = "none";
        submitBtn.disabled = false;
        submitBtn.style.opacity = "1";

        formStatus.style.display = "block";
      }
    });
  }

  /* ----------------------------------------------------------------------
       7. CONVERSION MODAL HANDLING
       ---------------------------------------------------------------------- */
  const modalTriggers = document.querySelectorAll(".cta-modal-trigger");
  const modalOverlay = document.getElementById("conversionModal");
  const modalCloseBtn = document.getElementById("closeModalBtn");
  const modalBtnEmail = document.getElementById("modalBtnEmail");
  let lastFocusedElement = null;

  if (modalOverlay) {
    // Open modal
    modalTriggers.forEach((trigger) => {
      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        openModal();
      });
    });

    // Close modal methods
    if (modalCloseBtn) {
      modalCloseBtn.addEventListener("click", closeModal);
    }

    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modalOverlay.classList.contains("active")) {
        closeModal();
      }
    });

    // Email Option - Scroll to form
    if (modalBtnEmail) {
      modalBtnEmail.addEventListener("click", () => {
        closeModal();
        const contactSection = document.getElementById("contato-projeto");
        if (contactSection) {
          // Smooth scroll to the form section
          contactSection.scrollIntoView({ behavior: "smooth" });
          // Provide focus slightly after scroll
          setTimeout(() => {
            const firstInput = document.getElementById("contact-name");
            if (firstInput) firstInput.focus();
          }, 800);
        }
      });
    }

    function openModal() {
      lastFocusedElement = document.activeElement;
      modalOverlay.classList.add("active");
      document.body.style.overflow = "hidden"; // Prevent background scrolling

      // Trap focus roughly
      setTimeout(() => {
        const focusableElements = modalOverlay.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusableElements.length) {
          focusableElements[0].focus();
        }
      }, 100);
    }

    function closeModal() {
      modalOverlay.classList.remove("active");
      document.body.style.overflow = "";

      if (lastFocusedElement) {
        lastFocusedElement.focus();
      }
    }
  }

  /* ----------------------------------------------------------------------
       8. PROJECT EXPERIENCE MODAL (CASES)
       ---------------------------------------------------------------------- */
  const caseModal = document.getElementById("caseModal");
  const closeCaseModalBtn = document.getElementById("closeCaseModalBtn");
  const caseNavPrev = document.getElementById("caseNavPrev");
  const caseNavNext = document.getElementById("caseNavNext");
  const caseCurrentSlideLabel = document.getElementById("caseCurrentSlide");
  const caseTotalSlidesLabel = document.getElementById("caseTotalSlides");

  // For now we just get the static placeholder slides created in HTML
  let currentCaseSlideIdx = 0;

  const casesData = {
    "super-humus": {
      title: "Super Húmus",
      label: "CASE / PROJETO",
      desc: "Packaging • Branding • Product Design",
      slides: [
        {
          src: "https://res.cloudinary.com/dud7265zq/image/upload/v1780225366/sh-01_ko6fyu.webp",
        },
        {
          src: "https://res.cloudinary.com/dud7265zq/image/upload/v1780225366/sh-02_tarryh.webp",
        },
        {
          src: "https://res.cloudinary.com/dud7265zq/image/upload/v1780225367/sh-03_kuj5qd.webp",
        },
        {
          src: "https://res.cloudinary.com/dud7265zq/image/upload/v1780225367/sh-04_ivcv2c.webp",
        },
      ],
    },
    puresolo: {
      title: "PURESOLO",
      label: "Packaging • Branding • Product Design",
      desc: "Sistema de embalagens desenvolvido para fortalecer percepção de valor, organizar a linha de produtos e comunicar naturalidade premium no ponto de venda.",
      slides: [
        {
          src: "https://res.cloudinary.com/dud7265zq/image/upload/v1780269595/puresolo_-_packing_1_tsyb6r.webp",
        },
        {
          src: "https://res.cloudinary.com/dud7265zq/image/upload/v1780269596/puresolo_-_packing_2_eka6ou.webp",
        },
        {
          src: "https://res.cloudinary.com/dud7265zq/image/upload/v1780269595/puresolo_-_packing_-_Agency_studio_monitor_design_rnia8q.webp",
        },
      ],
    },
    "gg-racoes": {
      title: "GG RAÇÕES",
      label: "Packaging • Branding • Agro Performance",
      desc: "Arquitetura visual para nutrição animal por fase de produção, com foco em clareza comercial, diferenciação por categoria e reconhecimento imediato no ponto de venda.",
      slides: [
        {
          src: "https://res.cloudinary.com/dud7265zq/image/upload/v1780269956/gg-racoes-packing1_lfdro8.webp",
        },
        {
          src: "https://res.cloudinary.com/dud7265zq/image/upload/v1780269955/gg-racoes-Monitor_displaying_packaging_tooc_v7o3rg.webp",
        },
      ],
    },
  };

  if (caseModal) {
    // Open modal function
    window.openProjectExperience = function (caseId) {
      const caseData = casesData[caseId];
      if (!caseData) return;

      // Load textual data
      const titleEl = document.getElementById("caseModalTitle");
      const descEl = document.getElementById("caseModalDesc");
      const labelEl = document.getElementById("caseModalLabel");

      if (titleEl) titleEl.textContent = caseData.title;
      if (descEl) descEl.textContent = caseData.desc;
      if (labelEl) labelEl.textContent = caseData.label;

      // Load slide images
      const track = document.getElementById("caseModalTrack");
      if (track) {
        track.innerHTML = "";
        caseData.slides.forEach((slide, idx) => {
          const el = document.createElement("div");
          el.className = "case-slide";
          // We remove captions and only display the large image as requested
          el.innerHTML = `
                        <div class="case-slide-img-wrapper" style="padding: 0;">
                            <img src="${slide.src}" alt="${caseData.title} Slide ${idx + 1}" style="width:100%; height:100%; object-fit:contain; border-radius:12px;">
                        </div>
                    `;
          track.appendChild(el);
        });
      }

      currentCaseSlideIdx = 0;
      updateCaseSlides();

      caseModal.classList.add("active");
      document.body.style.overflow = "hidden";
    };

    // Close modal
    function closeCaseModal() {
      caseModal.classList.remove("active");
      document.body.style.overflow = "";
    }

    if (closeCaseModalBtn) {
      closeCaseModalBtn.addEventListener("click", closeCaseModal);
    }

    caseModal.addEventListener("click", (e) => {
      if (e.target === caseModal) {
        closeCaseModal();
      }
    });

    const caseModalCta = caseModal.querySelector(".case-modal-cta-btn");
    if (caseModalCta) {
      caseModalCta.addEventListener("click", (e) => {
        // Prevent generic cta trigger from handling it normally
        e.preventDefault();
        e.stopPropagation();
        closeCaseModal();
        setTimeout(() => {
          openModal();
        }, 120);
      });
    }

    // Navigation
    function updateCaseSlides() {
      const slides = caseModal.querySelectorAll(".case-slide");
      if (!slides || slides.length === 0) return;

      // Loop safe guards
      if (currentCaseSlideIdx < 0) currentCaseSlideIdx = slides.length - 1;
      if (currentCaseSlideIdx >= slides.length) currentCaseSlideIdx = 0;

      slides.forEach((slide, idx) => {
        if (idx === currentCaseSlideIdx) {
          slide.classList.add("active");
        } else {
          slide.classList.remove("active");
        }
      });

      if (caseCurrentSlideLabel) {
        caseCurrentSlideLabel.textContent = String(
          currentCaseSlideIdx + 1,
        ).padStart(2, "0");
      }
      if (caseTotalSlidesLabel) {
        caseTotalSlidesLabel.textContent = String(slides.length).padStart(
          2,
          "0",
        );
      }
    }

    if (caseNavPrev) {
      caseNavPrev.addEventListener("click", () => {
        currentCaseSlideIdx--;
        updateCaseSlides();
      });
    }

    if (caseNavNext) {
      caseNavNext.addEventListener("click", () => {
        currentCaseSlideIdx++;
        updateCaseSlides();
      });
    }

    // Keyboard navigation for Case Modal
    document.addEventListener("keydown", (e) => {
      if (caseModal.classList.contains("active")) {
        if (e.key === "Escape") {
          closeCaseModal();
        } else if (e.key === "ArrowRight") {
          currentCaseSlideIdx++;
          updateCaseSlides();
        } else if (e.key === "ArrowLeft") {
          currentCaseSlideIdx--;
          updateCaseSlides();
        }
      }
    });

    // Initial setup
    updateCaseSlides();
  }
});
