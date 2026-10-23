
/*
  ADS HOLIDAYS
  IMPORTANT: Replace the number below with your WhatsApp number.
  India example: 919876543210
  Include country code; do not include + or spaces.
*/

const WHATSAPP_NUMBER = "919345587325";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const guestList = $("#guestList");
const tripForm = $("#tripForm");
const toast = $("#toast");

let guests = [
  { name: "", age: "" }
];

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}

function updateGuestList() {
  guestList.innerHTML = "";

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
      removeButton.setAttribute("aria-label", `Remove guest ${index + 1}`);

      removeButton.addEventListener("click", () => {
        guests.splice(index, 1);
        updateGuestList();
        updateGuestSummary();
      });

      row.appendChild(removeButton);
    } else {
      const placeholder = document.createElement("span");
      row.appendChild(placeholder);
    }

    guestList.appendChild(row);
  });

  updateGuestSummary();
}

function updateGuestSummary() {
  let adults = 0;
  let children = 0;

  guests.forEach((guest) => {
    if (guest.age === "" || guest.age === null) return;

    const age = Number(guest.age);

    if (!Number.isInteger(age) || age < 0 || age > 120) return;

    if (age >= 12) adults++;
    else children++;
  });

  $("#adultCount").textContent = adults;
  $("#childCount").textContent = children;
  $("#guestCount").textContent = guests.length;

  updateFoodEstimate();
}

function updateFoodEstimate() {
  const perGuest = Math.max(0, Number($("#foodBudget").value) || 0);
  const estimate = perGuest * guests.length;

  $("#foodEstimate").textContent = formatCurrency(estimate);
}

function formatCurrency(amount) {
  return "₹" + Math.round(amount).toLocaleString("en-IN");
}

$("#addGuest").addEventListener("click", () => {
  if (guests.length >= 30) {
    showToast("You can add up to 30 guests.");
    return;
  }

  guests.push({ name: "", age: "" });
  updateGuestList();
});

$("#foodBudget").addEventListener("input", updateFoodEstimate);

function setMinimumDates() {
  const today = new Date();
  const localToday = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
  ].join("-");

  $("#startDate").min = localToday;
  $("#endDate").min = localToday;
}

$("#startDate").addEventListener("change", () => {
  const start = $("#startDate").value;
  $("#endDate").min = start || $("#startDate").min;

  if ($("#endDate").value && start && $("#endDate").value < start) {
    $("#endDate").value = "";
    showToast("Choose a return date on or after your start date.");
  }
});

function selectDestination(destination) {
  $("#destination").value = destination;
  $("#planner").scrollIntoView({ behavior: "smooth" });
}

$$(".choose-destination").forEach((button) => {
  button.addEventListener("click", () => {
    selectDestination(button.dataset.destination);
  });
});

$$(".package-select").forEach((button) => {
  button.addEventListener("click", () => {
    $("#tripPackage").value = button.dataset.package;
    $("#planner").scrollIntoView({ behavior: "smooth" });
  });
});

$$(".room-select").forEach((button) => {
  button.addEventListener("click", () => {
    const room = button.dataset.room;
    $("#destination").value = "Yercaud";

    const staySelect = $("#stay");
    const option = [...staySelect.options].find((item) =>
      item.text.toLowerCase().includes(room.toLowerCase())
    );

    if (option) {
      staySelect.value = option.value;
    } else {
      staySelect.value = "Need recommendations";
    }

    $("#planner").scrollIntoView({ behavior: "smooth" });
    showToast(`${room} selected. Add your trip details below.`);
  });
});

function getWhatsAppUrl(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function openWhatsApp(message) {
  if (!/^\d{10,15}$/.test(WHATSAPP_NUMBER)) {
    showToast("Dude, first add your real WhatsApp number in script.js.");
    return;
  }

  const url = getWhatsAppUrl(message);
  window.open(url, "_blank", "noopener,noreferrer");
}

$("#contactWhatsApp").addEventListener("click", () => {
  openWhatsApp(
    "Hi ADS Holidays! 👋\nI'd like to know more about your holiday packages and villa stays."
  );
});

tripForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!tripForm.reportValidity()) return;

  if (guests.length === 0) {
    showToast("Please add at least one guest.");
    return;
  }

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

  if (invalidGuest) {
    showToast("Enter each guest's name and a valid age.");
    return;
  }

  const startDate = $("#startDate").value;
  const endDate = $("#endDate").value;

  if (endDate < startDate) {
    showToast("Return date must be on or after your start date.");
    return;
  }

  const totalBudget = Number($("#totalBudget").value);

  if (!Number.isFinite(totalBudget) || totalBudget <= 0) {
    showToast("Enter a valid total trip budget.");
    return;
  }

  const adults = guests.filter((guest) => Number(guest.age) >= 12).length;
  const children = guests.filter((guest) => Number(guest.age) < 12).length;
  const foodPerGuest = Math.max(0, Number($("#foodBudget").value) || 0);
  const foodTotal = foodPerGuest * guests.length;

  const selectedServices = [];

  if ($("#pickupDrop").checked) selectedServices.push("Pickup & drop");
  if ($("#guide").checked) selectedServices.push("Local guide");
  if ($("#breakfast").checked) selectedServices.push("Breakfast");
  if ($("#lunch").checked) selectedServices.push("Lunch");
  if ($("#dinner").checked) selectedServices.push("Dinner");

  const guestDetails = guests.map((guest, index) => {
    const age = Number(guest.age);
    const category = age >= 12 ? "Adult" : "Child";

    return `${index + 1}. ${guest.name.trim()} — Age ${age} (${category})`;
  });

  const notes = $("#notes").value.trim();

  const message = [
    "🌿 *NEW TRIP ENQUIRY — ADS HOLIDAYS*",
    "",
    `👤 *Name:* ${$("#customerName").value.trim()}`,
    `📱 *Contact:* ${$("#customerPhone").value.trim()}`,
    `📍 *Destination:* ${$("#destination").value}`,
    `🧳 *Trip type:* ${$("#tripPackage").value}`,
    `📅 *Start date:* ${startDate}`,
    `📅 *Return date:* ${endDate}`,
    `🏡 *Stay preference:* ${$("#stay").value}`,
    `🚘 *Pickup location:* ${$("#pickup").value.trim() || "Not specified"}`,
    "",
    `👥 *Guests:* ${guests.length}`,
    `🧑 *Adults (12+):* ${adults}`,
    `🧒 *Children (under 12):* ${children}`,
    "",
    "*Guest details:*",
    ...guestDetails,
    "",
    "*Requested services:*",
    ...(selectedServices.length ? selectedServices.map((item) => `• ${item}`) : ["• No additional services selected"]),
    "",
    `🍽️ *Food budget per guest:* ${formatCurrency(foodPerGuest)}`,
    `🍽️ *Estimated food budget total:* ${formatCurrency(foodTotal)}`,
    `💰 *Total trip budget:* ${formatCurrency(totalBudget)}`,
    "",
    `📝 *Special requests:* ${notes || "None"}`,
    "",
    "Please share availability, package inclusions and the final price. Thank you!"
  ].join("\n");

  openWhatsApp(message);
});

// Mobile navigation
$("#menuToggle").addEventListener("click", () => {
  const nav = $("#navMenu");
  const isOpen = nav.classList.toggle("open");

  $("#menuToggle").setAttribute("aria-expanded", String(isOpen));
  $("#menuToggle").textContent = isOpen ? "×" : "☰";
});

$$('#navMenu a').forEach((link) => {
  link.addEventListener("click", () => {
    $("#navMenu").classList.remove("open");
    $("#menuToggle").textContent = "☰";
    $("#menuToggle").setAttribute("aria-expanded", "false");
  });
});

$("#year").textContent = new Date().getFullYear();

setMinimumDates();
updateGuestList();
