
/*
  ADS HOLIDAYS
  Keep this file in the same folder as index.html.
  WhatsApp number: country code + number, digits only.
*/

(() => {
  "use strict";

  const WHATSAPP_NUMBER = "919345587325";

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];

  function init() {
    const guestList = $("#guestList");
    const tripForm = $("#tripForm");
    const toast = $("#toast");

    if (!guestList || !tripForm || !toast) {
      console.error(
        "ADS Holidays: Required HTML elements not found. Check index.html and script.js."
      );
      return;
    }

    let guests = [{ name: "", age: "" }];
    let toastTimer;

    function showToast(message) {
      toast.textContent = message;
      toast.classList.add("show");

      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toast.classList.remove("show");
      }, 2800);
    }

    function formatCurrency(amount) {
      return "₹" + Math.round(amount).toLocaleString("en-IN");
    }

    function updateFoodEstimate() {
      const foodBudget = $("#foodBudget");
      const foodEstimate = $("#foodEstimate");

      if (!foodBudget || !foodEstimate) return;

      const perGuest = Math.max(0, Number(foodBudget.value) || 0);
      foodEstimate.textContent = formatCurrency(perGuest * guests.length);
    }

    function updateGuestSummary() {
      let adults = 0;
      let children = 0;

      guests.forEach((guest) => {
        if (guest.age === "") return;

        const age = Number(guest.age);

        if (!Number.isInteger(age) || age < 0 || age > 120) return;

        if (age >= 12) adults++;
        else children++;
      });

      if ($("#adultCount")) $("#adultCount").textContent = adults;
      if ($("#childCount")) $("#childCount").textContent = children;
      if ($("#guestCount")) $("#guestCount").textContent = guests.length;

      updateFoodEstimate();
    }

    function updateGuestList() {
      guestList.replaceChildren();

      guests.forEach((guest, index) => {
        const row = document.createElement("div");
        row.className = "guest-row";

        const nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.placeholder = `Guest ${index + 1} name`;
        nameInput.setAttribute("aria-label", `Guest ${index + 1} name`);
        nameInput.value = guest.name;
        nameInput.required = true;
        nameInput.maxLength = 80;

        nameInput.addEventListener("input", () => {
          guests[index].name = nameInput.value;
        });

        const ageInput = document.createElement("input");
        ageInput.type = "number";
        ageInput.placeholder = "Age";
        ageInput.setAttribute("aria-label", `Guest ${index + 1} age`);
        ageInput.min = "0";
        ageInput.max = "120";
        ageInput.step = "1";
        ageInput.required = true;
        ageInput.value = guest.age;

        ageInput.addEventListener("input", () => {
          guests[index].age = ageInput.value;
          updateGuestSummary();
        });

        row.append(nameInput, ageInput);

        if (guests.length > 1) {
          const removeButton = document.createElement("button");
          removeButton.type = "button";
          removeButton.className = "remove-guest";
          removeButton.textContent = "×";
          removeButton.setAttribute(
            "aria-label",
            `Remove guest ${index + 1}`
          );

          removeButton.addEventListener("click", () => {
            guests.splice(index, 1);
            updateGuestList();
          });

          row.appendChild(removeButton);
        } else {
          row.appendChild(document.createElement("span"));
        }

        guestList.appendChild(row);
      });

      updateGuestSummary();
    }

    function setMinimumDates() {
      const startDate = $("#startDate");
      const endDate = $("#endDate");

      if (!startDate || !endDate) return;

      const today = new Date();
      const localToday = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
      ].join("-");

      startDate.min = localToday;
      endDate.min = localToday;
    }

    function openWhatsApp(message) {
      if (!/^\d{10,15}$/.test(WHATSAPP_NUMBER)) {
        showToast("Please check the WhatsApp number in script.js.");
        return;
      }

      const url =
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

      window.open(url, "_blank", "noopener,noreferrer");
    }

    function selectDestination(destination) {
      const destinationSelect = $("#destination");

      if (destinationSelect) {
        destinationSelect.value = destination;
      }

      $("#planner")?.scrollIntoView({ behavior: "smooth" });
    }

    // Add guest
    $("#addGuest")?.addEventListener("click", () => {
      if (guests.length >= 30) {
        showToast("You can add up to 30 guests.");
        return;
      }

      guests.push({ name: "", age: "" });
      updateGuestList();
    });

    // Food budget estimate
    $("#foodBudget")?.addEventListener("input", updateFoodEstimate);

    // Date validation
    $("#startDate")?.addEventListener("change", () => {
      const startDate = $("#startDate");
      const endDate = $("#endDate");

      if (!startDate || !endDate) return;

      endDate.min = startDate.value || startDate.min;

      if (
        startDate.value &&
        endDate.value &&
        endDate.value < startDate.value
      ) {
        endDate.value = "";
        showToast("Choose a return date on or after your start date.");
      }
    });

    // Destination cards
    $$(".choose-destination").forEach((button) => {
      button.addEventListener("click", () => {
        selectDestination(button.dataset.destination);
      });
    });

    // Tour packages
    $$(".package-select").forEach((button) => {
      button.addEventListener("click", () => {
        const tripPackage = $("#tripPackage");

        if (tripPackage) {
          tripPackage.value =
            button.dataset.package || "Customized Trip";
        }

        $("#planner")?.scrollIntoView({ behavior: "smooth" });
      });
    });

    // Villa and room selection
    $$(".room-select").forEach((button) => {
      button.addEventListener("click", () => {
        const room = button.dataset.room || "";
        const destination = $("#destination");
        const staySelect = $("#stay");

        if (destination) destination.value = "Yercaud";

        if (staySelect) {
          const option = [...staySelect.options].find((item) =>
            item.text.toLowerCase().includes(room.toLowerCase())
          );

          staySelect.value = option
            ? option.value
            : "Need recommendations";
        }

        $("#planner")?.scrollIntoView({ behavior: "smooth" });
        showToast(`${room} selected. Add your trip details below.`);
      });
    });

    // General WhatsApp contact button
    $("#contactWhatsApp")?.addEventListener("click", () => {
      openWhatsApp(
        "Hi ADS Holidays! 👋\nI'd like to know more about your holiday packages and villa stays."
      );
    });

    // Trip enquiry form
    tripForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!tripForm.reportValidity()) return;

      const invalidGuest = guests.find((guest) => {
        const age = Number(guest.age);

        return (
          !guest.name.trim() ||
          guest.age === "" ||
          !Number.isInteger(age) ||
          age < 0 ||
          age > 120
        );
      });

      if (!guests.length || invalidGuest) {
        showToast("Enter each guest's name and a valid age.");
        return;
      }

      const startDate = $("#startDate").value;
      const endDate = $("#endDate").value;

      if (!startDate || !endDate || endDate < startDate) {
        showToast("Return date must be on or after your start date.");
        return;
      }

      const totalBudget = Number($("#totalBudget").value);

      if (!Number.isFinite(totalBudget) || totalBudget <= 0) {
        showToast("Enter a valid total trip budget.");
        return;
      }

      const adults = guests.filter(
        (guest) => Number(guest.age) >= 12
      ).length;

      const children = guests.length - adults;

      const foodPerGuest = Math.max(
        0,
        Number($("#foodBudget").value) || 0
      );

      const foodTotal = foodPerGuest * guests.length;
      const selectedServices = [];

      if ($("#pickupDrop")?.checked) selectedServices.push("Pickup & drop");
      if ($("#guide")?.checked) selectedServices.push("Local guide");
      if ($("#breakfast")?.checked) selectedServices.push("Breakfast");
      if ($("#lunch")?.checked) selectedServices.push("Lunch");
      if ($("#dinner")?.checked) selectedServices.push("Dinner");

      const guestDetails = guests.map((guest, index) => {
        const age = Number(guest.age);
        const category = age >= 12 ? "Adult" : "Child";

        return `${index + 1}. ${guest.name.trim()} — Age ${age} (${category})`;
      });

      const value = (selector) =>
        $(selector)?.value?.trim() || "";

      const message = [
        "🌿 *NEW TRIP ENQUIRY — ADS HOLIDAYS*",
        "",
        `👤 *Name:* ${value("#customerName")}`,
        `📱 *Contact:* ${value("#customerPhone")}`,
        `📍 *Destination:* ${value("#destination")}`,
        `🧳 *Trip type:* ${value("#tripPackage")}`,
        `📅 *Start date:* ${startDate}`,
        `📅 *Return date:* ${endDate}`,
        `🏡 *Stay preference:* ${value("#stay")}`,
        `🚘 *Pickup location:* ${value("#pickup") || "Not specified"}`,
        "",
        `👥 *Guests:* ${guests.length}`,
        `🧑 *Adults (12+):* ${adults}`,
        `🧒 *Children (under 12):* ${children}`,
        "",
        "*Guest details:*",
        ...guestDetails,
        "",
        "*Requested services:*",
        ...(selectedServices.length
          ? selectedServices.map((service) => `• ${service}`)
          : ["• No additional services selected"]),
        "",
        `🍽️ *Food budget per guest:* ${formatCurrency(foodPerGuest)}`,
        `🍽️ *Estimated food budget total:* ${formatCurrency(foodTotal)}`,
        `💰 *Total trip budget:* ${formatCurrency(totalBudget)}`,
        "",
        `📝 *Special requests:* ${value("#notes") || "None"}`,
        "",
        "Please share availability, package inclusions and the final price. Thank you!"
      ].join("\n");

      openWhatsApp(message);
    });

    // Mobile navigation
    const menuToggle = $("#menuToggle");
    const navMenu = $("#navMenu");

    menuToggle?.addEventListener("click", () => {
      if (!navMenu) return;

      const isOpen = navMenu.classList.toggle("open");

      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.textContent = isOpen ? "×" : "☰";
    });

    $$("#navMenu a").forEach((link) => {
      link.addEventListener("click", () => {
        navMenu?.classList.remove("open");

        if (menuToggle) {
          menuToggle.textContent = "☰";
          menuToggle.setAttribute("aria-expanded", "false");
        }
      });
    });

    const year = $("#year");
    if (year) year.textContent = new Date().getFullYear();

    setMinimumDates();
    updateGuestList();

    // Diagnostic: confirms that this file ran.
    window.updateGuestSummary = updateGuestSummary;
    console.info("ADS Holidays: script.js loaded successfully.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();

/* ==========================================
   ADS HOLIDAYS — DYNAMIC SCROLL ENGINE
========================================== */

(() => {
  "use strict";

  function initScrollEffects() {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // 1. Scroll reveal targets
    const selectors = [
      "main section h1",
      "main section h2",
      "main section h3",
      "main section p",
      "main section .btn",
      "main section .button",
      ".destination-card",
      ".package-card",
      ".villa-card",
      ".tour-card",
      ".feature-card",
      ".destination",
      ".package",
      ".villa",
      ".section-heading",
      ".section-title"
    ];

    const elements = document.querySelectorAll(
      selectors.join(", ")
    );

    if (reduceMotion || !("IntersectionObserver" in window)) {
      elements.forEach(element => {
        element.classList.add("visible");
      });
    } else {
      const revealObserver = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
            } else {
              // Reveal again when scrolling back up
              entry.target.classList.remove("visible");
            }
          });
        },
        {
          threshold: 0.12,
          rootMargin: "0px 0px -35px 0px"
        }
      );

      elements.forEach((element, index) => {
        if (element.dataset.revealReady) return;

        // Skip elements already animated by the hero
        if (element.closest(".hero")) return;

        element.dataset.revealReady = "true";

        // Avoid animating form controls and navigation
        if (
          element.closest("nav, header, footer, form")
        ) {
          return;
        }

        // Alternate directions for visual variety
        if (element.matches("h1, h2, h3, p")) {
          element.classList.add("reveal");
        } else if (element.matches("img")) {
          element.classList.add("reveal-scale");
        } else {
          element.classList.add("reveal");
        }

        element.style.transitionDelay =
          `${(index % 4) * 80}ms`;

        revealObserver.observe(element);
      });
    }

    // 2. Navbar shadow after scrolling
    const navElements = document.querySelectorAll(
      "nav, .navbar"
    );

    function updateNavbar() {
      const scrolled = window.scrollY > 25;

      navElements.forEach(nav => {
        nav.classList.toggle("nav-scrolled", scrolled);
      });
    }

    window.addEventListener("scroll", updateNavbar, {
      passive: true
    });

    updateNavbar();

    // 3. Smooth anchor navigation
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener("click", event => {
        const targetId = link.getAttribute("href");

        if (!targetId || targetId === "#") return;

        const target = document.querySelector(targetId);

        if (!target) return;

        event.preventDefault();

        target.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "start"
        });
      });
    });

    console.info(
      "ADS Holidays: scroll animations initialized."
    );
  }

  // Start after the HTML is ready
  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initScrollEffects,
      { once: true }
    );
  } else {
    initScrollEffects();
  }
})();
