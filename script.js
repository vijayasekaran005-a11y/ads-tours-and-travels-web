
/*
  ADS HOLIDAYS WEBSITE
  IMPORTANT:
  Replace the WhatsApp number below with your real number.
  Format: country code + phone number, without + or spaces.
  Example format for India: 919876543210
*/

const WHATSAPP_NUMBER = "919345587325";

const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");
const bookingForm = document.getElementById("bookingForm");
const guestList = document.getElementById("guestList");
const guestCount = document.getElementById("guestCount");
const foodBudgetInput = document.getElementById("foodBudget");
const foodEstimate = document.getElementById("foodEstimate");
const formMessage = document.getElementById("formMessage");

let nextGuestId = 1;

// Mobile navigation
menuToggle.addEventListener("click", () => {
  const isOpen = navMenu.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.textContent = isOpen ? "✕" : "☰";
});

navMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.textContent = "☰";
  });
});

// Set the footer year
document.getElementById("currentYear").textContent =
  new Date().getFullYear();

// Prevent selecting past travel dates
const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");

function localDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function setDateLimits() {
  const today = localDateString(new Date());
  startDateInput.min = today;
  endDateInput.min = startDateInput.value || today;

  if (startDateInput.value && endDateInput.value &&
      endDateInput.value < startDateInput.value) {
    endDateInput.value = "";
  }
}

startDateInput.addEventListener("change", () => {
  endDateInput.min = startDateInput.value || localDateString(new Date());

  if (endDateInput.value && endDateInput.value < startDateInput.value) {
    endDateInput.value = "";
  }
});

setDateLimits();

// Guest management
function addGuest(name = "", age = "") {
  const guestId = nextGuestId++;

  const row = document.createElement("div");
  row.className = "guest-row";
  row.dataset.guestId = String(guestId);

  const nameLabel = document.createElement("label");
  nameLabel.textContent = `Guest ${guestId} name`;

  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.className = "guest-name";
  nameInput.placeholder = "Guest name";
  nameInput.value = name;
  nameInput.required = true;
  nameInput.autocomplete = "off";

  nameLabel.appendChild(nameInput);

  const ageLabel = document.createElement("label");
  ageLabel.textContent = "Age";

  const ageInput = document.createElement("input");
  ageInput.type = "number";
  ageInput.className = "guest-age";
  ageInput.placeholder = "Age";
  ageInput.min = "0";
  ageInput.max = "120";
  ageInput.step = "1";
  ageInput.value = age;
  ageInput.required = true;

  ageLabel.appendChild(ageInput);

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "remove-guest";
  removeButton.textContent = "×";
  removeButton.setAttribute("aria-label", `Remove guest ${guestId}`);

  removeButton.addEventListener("click", () => {
    if (guestList.children.length <= 1) {
      formMessage.textContent = "At least one guest is required.";
      return;
    }

    row.remove();
    renumberGuests();
    updateGuestSummary();
  });

  nameInput.addEventListener("input", updateGuestSummary);
  ageInput.addEventListener("input", updateGuestSummary);

  row.append(nameLabel, ageLabel, removeButton);
  guestList.appendChild(row);

  updateGuestSummary();
}

function renumberGuests() {
  Array.from(guestList.children).forEach((row, index) => {
    const number = index + 1;
    const labels = row.querySelectorAll("label");
    const nameInput = row.querySelector(".guest-name");
    const ageInput = row.querySelector(".guest-age");
    const removeButton = row.querySelector(".remove-guest");

    labels[0].firstChild.textContent = `Guest ${number} name`;
    labels[1].firstChild.textContent = "Age";
    nameInput.id = `guestName${number}`;
    ageInput.id = `guestAge${number}`;
    removeButton.setAttribute("aria-label", `Remove guest ${number}`);
  });
}

function getGuests() {
  return Array.from(guestList.querySelectorAll(".guest-row")).map((row) => ({
    name: row.querySelector(".guest-name").value.trim(),
    age: row.querySelector(".guest-age").value
  }));
}

function updateGuestSummary() {
  const guests = getGuests();
  let adults = 0;
  let children = 0;

  guests.forEach((guest) => {
    if (guest.age !== "" && Number(guest.age) < 12) {
      children++;
    } else if (guest.age !== "") {
      adults++;
    }
  });

  guestCount.textContent =
    `Adults: ${adults} · Children: ${children} · Total guests: ${guests.length}`;

  updateFoodEstimate();
}

document.getElementById("addGuest").addEventListener("click", () => {
  if (guestList.children.length >= 30) {
    formMessage.textContent = "For groups above 30, please contact us directly.";
    return;
  }

  formMessage.textContent = "";
  addGuest();
});

addGuest();

// Food estimate
function updateFoodEstimate() {
  const budgetPerGuest = Math.max(0, Number(foodBudgetInput.value) || 0);
  const total = budgetPerGuest * guestList.children.length;

  foodEstimate.textContent = `₹${total.toLocaleString("en-IN")}`;
}

foodBudgetInput.addEventListener("input", updateFoodEstimate);

// Destination and package quick selection
function scrollToBooking() {
  document.getElementById("booking").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

document.querySelectorAll(".choose-destination").forEach((button) => {
  button.addEventListener("click", () => {
    document.getElementById("destination").value =
      button.dataset.destination;

    scrollToBooking();
  });
});

document.querySelectorAll(".choose-package").forEach((button) => {
  button.addEventListener("click", () => {
    document.getElementById("packageType").value =
      button.dataset.package;

    scrollToBooking();
  });
});

// Select the matching Rain Rock Villa stay and destination
document.querySelectorAll(".room-btn").forEach((link) => {
  link.addEventListener("click", () => {
    const roomName = link.closest(".rainrock-card")
      .querySelector("h3").textContent.trim();

    const staySelect = document.getElementById("stayType");
    const stayOption = Array.from(staySelect.options).find((option) =>
      option.textContent.endsWith(roomName)
    );

    if (stayOption) {
      staySelect.value = stayOption.value;
    }

    document.getElementById("destination").value = "Yercaud";
  });
});

// Build WhatsApp enquiry
bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  formMessage.textContent = "";

  if (WHATSAPP_NUMBER.includes("X")) {
    formMessage.textContent =
      "Dude, first replace the WhatsApp placeholder number in script.js with your real number.";
    return;
  }

  const customerName =
    document.getElementById("customerName").value.trim();

  const customerPhone =
    document.getElementById("customerPhone").value.trim();

  const destination =
    document.getElementById("destination").value;

  const packageType =
    document.getElementById("packageType").value;

  const startDate = startDateInput.value;
  const endDate = endDateInput.value;

  if (new Date(`${endDate}T00:00:00`) <=
      new Date(`${startDate}T00:00:00`)) {
    formMessage.textContent =
      "End date must be after the start date.";
    endDateInput.focus();
    return;
  }

  const guests = getGuests();

  if (guests.length === 0 ||
      guests.some((guest) => !guest.name || guest.age === "" ||
        !Number.isInteger(Number(guest.age)) ||
        Number(guest.age) < 0 || Number(guest.age) > 120)) {
    formMessage.textContent =
      "Please enter every guest's name and a valid age.";
    return;
  }

  const adults = guests.filter((guest) => Number(guest.age) >= 12).length;
  const children = guests.filter((guest) => Number(guest.age) < 12).length;

  const selectedFoods = [
    ["foodVeg", "Vegetarian"],
    ["foodNonVeg", "Non-vegetarian"],
    ["foodBreakfast", "Breakfast"],
    ["foodLunch", "Lunch"],
    ["foodDinner", "Dinner"]
  ]
    .filter(([id]) => document.getElementById(id).checked)
    .map(([, label]) => label);

  const services = [
    ["pickupService", "Pickup"],
    ["dropService", "Drop"],
    ["guideService", "Local guide"]
  ]
    .filter(([id]) => document.getElementById(id).checked)
    .map(([, label]) => label);

  const stayType = document.getElementById("stayType").value;
  const pickupLocation =
    document.getElementById("pickupLocation").value.trim();

  const foodBudget = Math.max(
    0, Number(foodBudgetInput.value) || 0
  );

  const totalFoodBudget = foodBudget * guests.length;

  const totalBudgetInput =
    document.getElementById("totalBudget").value;

  const totalBudget = totalBudgetInput === ""
    ? "Not specified"
    : `₹${Number(totalBudgetInput).toLocaleString("en-IN")}`;

  const extraRequests =
    document.getElementById("extraRequests").value.trim();

  const guestLines = guests.map((guest, index) =>
    `${index + 1}. ${guest.name} — ${guest.age} years old (${Number(guest.age) < 12 ? "Child" : "Adult"})`
  );

  const message = [
    "🌿 *NEW ADS HOLIDAYS BOOKING ENQUIRY*",
    "",
    `👤 Name: ${customerName}`,
    `📞 Contact: ${customerPhone}`,
    `🏞️ Destination: ${destination}`,
    `🎒 Package: ${packageType}`,
    `📅 Start date: ${startDate}`,
    `📅 End date: ${endDate}`,
    `👥 Guests: ${guests.length} (Adults: ${adults}, Children: ${children})`,
    "",
    "*Guest Details:*",
    ...guestLines,
    "",
    `🏡 Stay preference: ${stayType}`,
    `📍 Pickup location: ${pickupLocation || "Not specified"}`,
    `🚗 Services: ${services.length ? services.join(", ") : "None selected"}`,
    `🍽️ Food preferences: ${selectedFoods.length ? selectedFoods.join(", ") : "Not selected"}`,
    `💵 Food budget per guest: ${foodBudget ? `₹${foodBudget.toLocaleString("en-IN")}` : "Not specified"}`,
    `🍴 Estimated total food budget: ₹${totalFoodBudget.toLocaleString("en-IN")}`,
    `💰 Overall trip budget: ${totalBudget}`,
    "",
    `📝 Additional requests: ${extraRequests || "None"}`,
    "",
    "Please share availability and the final quotation. Thank you!"
  ].join("\n");

  const whatsappURL =
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  window.open(whatsappURL, "_blank", "noopener,noreferrer");
});

// Initial calculations
updateGuestSummary();
