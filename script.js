// HillTrip website settings
// Replace this with your business WhatsApp number.
// Example: 919876543210 (country code + phone number, no + sign)
const WHATSAPP_NUMBER = "919345587325";

const guestList = document.getElementById("guestList");
const addGuestButton = document.getElementById("addGuest");
const foodToggle = document.getElementById("foodToggle");
const foodOptions = document.getElementById("foodOptions");
const bookingForm = document.getElementById("bookingForm");

let guestCounter = 0;

// Set today's date as the earliest selectable date.
const today = new Date();
const localToday = [
  today.getFullYear(),
  String(today.getMonth() + 1).padStart(2, "0"),
  String(today.getDate()).padStart(2, "0")
].join("-");

const checkIn = document.getElementById("checkIn");
const checkOut = document.getElementById("checkOut");

checkIn.min = localToday;
checkOut.min = localToday;

checkIn.addEventListener("change", () => {
  checkOut.min = checkIn.value || localToday;

  if (checkOut.value && checkOut.value <= checkIn.value) {
    checkOut.value = "";
  }
});

// Create a guest entry.
function addGuest(name = "", age = "") {
  if (guestList.children.length >= 30) {
    alert("Maximum 30 guests can be added.");
    return;
  }

  guestCounter++;

  const row = document.createElement("div");
  row.className = "guest-row";

  const nameLabel = document.createElement("label");
  nameLabel.textContent = `Guest ${guestCounter} name`;

  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.placeholder = "Full name";
  nameInput.required = true;
  nameInput.maxLength = 80;
  nameInput.value = name;
  nameInput.className = "guest-name";
  nameLabel.appendChild(nameInput);

  const ageLabel = document.createElement("label");
  ageLabel.textContent = "Age";

  const ageInput = document.createElement("input");
  ageInput.type = "number";
  ageInput.placeholder = "Age";
  ageInput.min = "0";
  ageInput.max = "120";
  ageInput.required = true;
  ageInput.value = age;
  ageInput.className = "guest-age";
  ageLabel.appendChild(ageInput);

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "remove-guest";
  removeButton.textContent = "×";
  removeButton.setAttribute("aria-label", "Remove guest");

  removeButton.addEventListener("click", () => {
    if (guestList.children.length <= 1) {
      alert("At least one guest is required.");
      return;
    }

    row.remove();
    refreshGuests();
  });

  row.append(nameLabel, ageLabel, removeButton);
  guestList.appendChild(row);

  refreshGuests();
}

function refreshGuests() {
  const rows = [...guestList.querySelectorAll(".guest-row")];

  rows.forEach((row, index) => {
    row.querySelector("label").firstChild.textContent =
      `Guest ${index + 1} name`;
  });

  const adultCount = rows.filter(row => {
    const age = Number(row.querySelector(".guest-age").value);
    return row.querySelector(".guest-age").value !== "" && age >= 12;
  }).length;

  const childCount = rows.filter(row => {
    const input = row.querySelector(".guest-age");
    return input.value !== "" && Number(input.value) < 12;
  }).length;

  const unknownCount = rows.length - adultCount - childCount;

  document.getElementById("guestSummary").textContent =
    `${rows.length} guest${rows.length === 1 ? "" : "s"} ` +
    `(${adultCount} adult${adultCount === 1 ? "" : "s"}, ` +
    `${childCount} child${childCount === 1 ? "" : "ren"}` +
    (unknownCount ? `, ${unknownCount} age pending` : "") + ")";

  updateFoodEstimate();
}

addGuestButton.addEventListener("click", () => addGuest());

guestList.addEventListener("input", refreshGuests);

// Food selection
foodToggle.addEventListener("change", () => {
  foodOptions.classList.toggle("hidden", !foodToggle.checked);
  updateFoodEstimate();
});

document.getElementById("foodPrice").addEventListener("input", updateFoodEstimate);

function updateFoodEstimate() {
  const result = document.getElementById("foodEstimate");
  const priceInput = document.getElementById("foodPrice");

  if (!foodToggle.checked) {
    result.textContent = "Not selected";
    return;
  }

  if (priceInput.value === "" || Number(priceInput.value) < 0) {
    result.textContent = "Price not entered";
    return;
  }

  const price = Number(priceInput.value);
  const guests = guestList.querySelectorAll(".guest-row").length;
  const total = price * guests;

  result.textContent = `₹${total.toLocaleString("en-IN")}`;
}

// Select a destination from its card.
function chooseDestination(destinationName) {
  document.getElementById("destination").value = destinationName;
  document.getElementById("planner").scrollIntoView({
    behavior: "smooth"
  });
}

// Select a package from its card.
function choosePackage(packageName) {
  document.getElementById("packageType").value = packageName;
  document.getElementById("planner").scrollIntoView({
    behavior: "smooth"
  });
}

// Form submission: build an enquiry and open WhatsApp.
bookingForm.addEventListener("submit", event => {
  event.preventDefault();

  if (!bookingForm.reportValidity()) return;

  const customerName = document.getElementById("customerName").value.trim();
  const customerPhone = document.getElementById("customerPhone").value.trim();
  const destination = document.getElementById("destination").value;
  const packageType = document.getElementById("packageType").value;
  const startDate = checkIn.value;
  const endDate = checkOut.value;

  if (endDate <= startDate) {
    alert("Check-out date must be after check-in date.");
    checkOut.focus();
    return;
  }

  const rows = [...guestList.querySelectorAll(".guest-row")];
  const guests = [];

  for (const row of rows) {
    const name = row.querySelector(".guest-name").value.trim();
    const ageValue = row.querySelector(".guest-age").value;
    const age = Number(ageValue);

    if (!name || ageValue === "" || age < 0 || age > 120) {
      alert("Please enter a valid name and age for every guest.");
      row.querySelector(".guest-name").focus();
      return;
    }

    guests.push({
      name,
      age,
      type: age >= 12 ? "Adult" : "Child"
    });
  }

  const pickup = document.getElementById("pickup").checked;
  const drop = document.getElementById("drop").checked;
  const guide = document.getElementById("guide").checked;

  const includeFood = foodToggle.checked;
  const foodType = document.getElementById("foodType").value;
  const selectedMeals = [
    ...document.querySelectorAll('input[name="meal"]:checked')
  ].map(item => item.value);

  const foodPrice = document.getElementById("foodPrice").value;
  const foodNotes = document.getElementById("foodNotes").value.trim();
  const budget = document.getElementById("budget").value;
  const extraNotes = document.getElementById("extraNotes").value.trim();

  const formatDate = value => {
    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
  };

  const lines = [
    "🌿 *NEW HILLTRIP BOOKING ENQUIRY*",
    "",
    "*Customer Details*",
    `Name: ${customerName}`,
    `Phone: ${customerPhone}`,
    "",
    "*Trip Details*",
    `Destination: ${destination}`,
    `Package: ${packageType}`,
    `Check-in: ${formatDate(startDate)}`,
    `Check-out: ${formatDate(endDate)}`,
    "",
    `*Guests (${guests.length})*`,
    ...guests.map((guest, index) =>
      `${index + 1}. ${guest.name} — Age ${guest.age} (${guest.type})`
    ),
    "",
    "*Travel Options*",
    `Pickup: ${pickup ? "Yes" : "No"}`,
    `Drop: ${drop ? "Yes" : "No"}`,
    `Guide: ${guide ? "Yes" : "No"}`,
    "",
    "*Food Preferences*",
    `Food required: ${includeFood ? "Yes" : "No"}`
  ];

  if (includeFood) {
    lines.push(
      `Food type: ${foodType}`,
      `Meals/extras: ${selectedMeals.length ? selectedMeals.join(", ") : "Not selected"}`,
      `Food price per guest: ${foodPrice ? "₹" + Number(foodPrice).toLocaleString("en-IN") : "Not specified"}`,
      `Estimated food total: ${
        foodPrice
          ? "₹" + (Number(foodPrice) * guests.length).toLocaleString("en-IN")
          : "Not calculated"
      }`,
      `Special food requests: ${foodNotes || "None"}`
    );
  }

  lines.push(
    "",
    `Total trip budget: ${budget ? "₹" + Number(budget).toLocaleString("en-IN") : "Not specified"}`,
    `Additional requests: ${extraNotes || "None"}`,
    "",
    "Please share availability and the final quotation. Thank you!"
  );

  if (!/^91\d{10}$/.test(WHATSAPP_NUMBER)) {
    alert(
      "Dude, first replace the WhatsApp number in script.js with your real business number. Use country code + number, without the + sign."
    );
    return;
  }

  const whatsappURL =
    "https://wa.me/" + WHATSAPP_NUMBER +
    "?text=" + encodeURIComponent(lines.join("\n"));

  window.open(whatsappURL, "_blank", "noopener,noreferrer");
});

// Initialise the page.
addGuest();
document.getElementById("year").textContent = new Date().getFullYear();
