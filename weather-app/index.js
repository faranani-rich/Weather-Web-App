// index.js

// ==== Element references ====
const apiKey = import.meta.env.VITE_API_KEY;
const cityInput        = document.getElementById("cityInput");
const submitButton     = document.getElementById("submitButton");
const tempUnitSelect   = document.getElementById("tempUnit");

const loader           = document.getElementById("loader");
const weatherCard      = document.getElementById("weatherCard");
const cityDisplay      = document.getElementById("cityDisplay");
const tempDisplay      = document.getElementById("tempDisplay");
const humidityDisplay  = document.getElementById("humidityDisplay");
const descriptionDisplay = document.getElementById("descriptionDisplay");
const errorDisplay     = document.getElementById("errorDisplay");

// ==== Event listeners ====
submitButton.addEventListener("click", weatherStuff);

// ==== Main handler ====
async function weatherStuff() {
  const cityName = cityInput.value.trim();
  
  // Clear previous state
  clearError();
  hideElement(cityDisplay);
  hideElement(tempDisplay);
  hideElement(humidityDisplay);
  hideElement(descriptionDisplay);

  if (!cityName) {
    displayError("Please enter a city name.");
    return;
  }

  // Show loader
  showElement(loader);

  try {
    const data = await getWeatherData(cityName);
    hideElement(loader);
    displayWeatherInfo(data);
  } catch (err) {
    hideElement(loader);
    displayError(err.message || "Failed to fetch weather.");
    console.error(err);
  }
}

// ==== Fetch weather ====
async function getWeatherData(city) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather`
               + `?q=${encodeURIComponent(city)}&appid=${apiKey}`;
  const res = await fetch(apiUrl);
  if (!res.ok) {
    throw new Error("City not found. Try again.");
  }
  return res.json();
}

// ==== Display helpers ====
function displayWeatherInfo(data) {
  // Destructure the response
  const {
    name: city,
    main: { temp: kelvinTemp, humidity },
    weather: [ { description, id: weatherId } ]
  } = data;

  // Convert temperature
  const unit = tempUnitSelect.value;  // "c", "f", or "k"
  const convertedTemp = convertKelvin(kelvinTemp, unit);

  // Populate elements
  cityDisplay.textContent = city;
  tempDisplay.textContent = `${convertedTemp.toFixed(1)} °${unit.toUpperCase()}`;
  humidityDisplay.textContent = `Humidity: ${humidity}%`;
  descriptionDisplay.textContent = `${getWeatherEmoji(weatherId)}  ${description}`;

  // Show them
  showElement(cityDisplay);
  showElement(tempDisplay);
  showElement(humidityDisplay);
  showElement(descriptionDisplay);
}

// ==== Conversion ====
function convertKelvin(kelvin, unit) {
  switch (unit) {
    case "c":
      return kelvin - 273.15;
    case "f":
      return (kelvin - 273.15) * 9/5 + 32;
    case "k":
      return kelvin;
    default:
      return kelvin;
  }
}

// ==== Emoji mapper ====
function getWeatherEmoji(id) {
  if (id >= 200 && id < 300) return "⛈️";        // Thunderstorm
  if (id >= 300 && id < 500) return "🌦️";       // Drizzle
  if (id >= 500 && id < 600) return "🌧️";       // Rain
  if (id >= 600 && id < 700) return "❄️";       // Snow
  if (id >= 700 && id < 800) return "🌫️";       // Atmosphere (mist, smoke…)
  if (id === 800)            return "☀️";       // Clear
  if (id > 800 && id < 900)  return "☁️";       // Clouds
  return "🌈";                               // Fallback
}

// ==== UI utility functions ====
function displayError(msg) {
  errorDisplay.textContent = msg;
  showElement(errorDisplay);
}

function clearError() {
  errorDisplay.textContent = "";
  hideElement(errorDisplay);
}

function showElement(el) {
  el.hidden = false;
}

function hideElement(el) {
  el.hidden = true;
}
