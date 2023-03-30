// Declare consts
const options = getAllOptions();
const btn = document.getElementById("request");
const icon = document.getElementById("icon");
const temperature = document.getElementById("temperature");
const tempUnit = document.getElementById("unit");
const testStorage = document.getElementById("test");

// Do logic
if (btn) btn.addEventListener("click", fetchIt);
if (testStorage) testStorage.addEventListener("click", outputAllOptions);

// Define functions
function outputAllOptions() {
	const opts = getAllOptions();
	console.log(opts);
}

function getAllOptions() {
	let opts = {
		"autoUpdate": false,
		"hourly": false
	};
	
	chrome.storage.local.get(["autoUpdate"]).then((value) => {opts.autoUpdate = value.autoUpdate; console.log(value)});
	chrome.storage.local.get(["hourly"]).then((value) => {opts.hourly = value.hourly; console.log(value)});
	
	return opts;
}

async function fetchIt() {
	const url = "https://api.weather.gov/gridpoints/LOT/73,73/forecast";
	
	const response = await sendRequest(url);
	
	changeForecastDetails(response?.properties.periods[0].icon, response?.properties.periods[0].temperature, response?.properties.periods[0].temperatureUnit);
}

async function sendRequest(url) {
	const response = await fetch(url);
	if (response.ok) {
		const jsonValue = response.json();
		return Promise.resolve(jsonValue);
	} else {
		return {};
	}
}

function changeForecastDetails(iconUrl, temperatureValue, temperatureUnit) {
	icon.src = iconUrl;
	temperature.textContent = temperatureValue;
	temperatureUnit.textContent = `º${temperatureUnit}`;
}