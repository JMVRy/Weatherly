getAllOptions().then((options) => {
	if (options.autoUpdate)
		fetchIt();
	console.log(options);
	console.log(options.lastIcon, options.lastTemp, options.lastUnit);
	changeForecastDetails(options.lastIcon, options.lastTemp, options.lastUnit);
});

// Declare consts
const btn = document.getElementById("request");
const icon = document.getElementById("icon");
const temperature = document.getElementById("temperature");
const tempUnit = document.getElementById("unit");

// Do logic
if (btn) btn.addEventListener("click", fetchIt);

// Define functions
async function getAllOptions() {
	let opts = {
		"autoUpdate": false,
		"hourly": false,
		"lastIcon": "https://api.weather.gov/icons/land/day/sct?size=medium",
		"lastTemp": 72,
		"lastUnit": "F",
		"lastUpdate": "1900-00-00T00:00:00.000Z"
	};
	
	await new Promise((resolve, reject) => {
		chrome.storage.local.get(["autoUpdate"], (value) => {
			opts.autoUpdate = value.autoUpdate;
			console.log(value);
			resolve();
		});
	});
	await new Promise((resolve, reject) => {
		chrome.storage.local.get(["hourly"], (value) => {
			opts.hourly = value.hourly;
			console.log(value);
			resolve();
		});
	});
	await new Promise((resolve, reject) => {
		chrome.storage.local.get(["lastIcon"], (value) => {
			opts.lastIcon = value.lastIcon;
			console.log(value);
			resolve();
		});
	});
	await new Promise((resolve, reject) => {
		chrome.storage.local.get(["lastTemp"], (value) => {
			opts.lastTemp = value.lastTemp;
			console.log(value);
			resolve();
		});
	});
	await new Promise((resolve, reject) => {
		chrome.storage.local.get(["lastUnit"], (value) => {
			opts.lastUnit = value.lastUnit;
			console.log(value);
			resolve();
		});
	});
	await new Promise((resolve, reject) => {
		chrome.storage.local.get(["lastUpdate"], (value) => {
			opts.lastUpdate = value.lastUpdate;
			console.log(value);
			resolve();
		});
	});
	
	return opts;
}

async function fetchIt() {
	let opts = await getAllOptions();
	
	if (new Date().getTime() - new Date(opts.lastUpdate).getTime() < 300000) {
		console.error("Cannot request before update time (+5 mins just in case)!");
		return;
	}
	
	const url = "https://api.weather.gov/gridpoints/LOT/73,73/forecast";
	
	const response = await sendRequest(url);
	
	if (!response.properties) return;
	changeForecastDetails(response?.properties.periods[0].icon, response?.properties.periods[0].temperature, response?.properties.periods[0].temperatureUnit);
	
	chrome.storage.local.set({"lastIcon": response?.properties.periods[0].icon});
	chrome.storage.local.set({"lastTemp": response?.properties.periods[0].temperature});
	chrome.storage.local.set({"lastUnit": response?.properties.periods[0].temperatureUnit});
	chrome.storage.local.set({"lastUpdate": response?.properties.updateTime});
}

async function sendRequest(url) {
	const response = await fetch(url, {"headers": {"User-Agent": "Weatherly 1.0 Beta (github.com/JMVRy/Weatherly)"}});
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
	if (temperatureUnit == "K") tempUnit.textContent = temperatureUnit;
	else tempUnit.textContent = `°${temperatureUnit}`;
}