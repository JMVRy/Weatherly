getAllOptions().then((options) => {
	if (options.autoUpdate)
		fetchIt();
	console.log(options);
	console.log(options.lastIcon, options.lastTemp, options.lastUnit);
	console.log(options.location, `${options.xLoc},${options.yLoc}`, options.forecastUrl);
	if (options.lastIcon && options.lastTemp && options.lastUnit)
		changeForecastDetails(options.lastIcon, options.lastTemp, options.lastUnit);
});

// Declare consts
const btn = document.getElementById("request");
const icon = document.getElementById("icon");
const temperature = document.getElementById("temperature");
const tempUnit = document.getElementById("unit");
const req = document.getElementById("req");

// Do logic
btn.addEventListener("click", () => { fetchIt(true); });

/*setTimeout(() => {
	getAllOptions().then((options) => {
		fetchIt();
	}*/

// Define functions
async function getAllOptions() {
	let opts = {
		"autoUpdate": false,
		"hourly": false,
		"lastIcon": "https://api.weather.gov/icons/land/day/sct?size=medium",
		"lastTemp": 72,
		"lastUnit": "F",
		"lastUpdate": "1900-00-00T00:00:00.000Z",
		"xLoc": -80,
		"yLoc": 40,
		"forecastUrl": "https://api.weather.gov/gridpoints/LOT/73,73/forecast",
		"lastRequest": "1900-00-00T00:00:00.000Z",
		"overrideRefreshTimer": false
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
	await new Promise((resolve, reject) => {
		chrome.storage.session.get(["xLoc"], (value) => {
			opts.xLoc = value.xLoc;
			console.log(value);
			resolve();
		});
	});
	await new Promise((resolve, reject) => {
		chrome.storage.session.get(["yLoc"], (value) => {
			opts.yLoc = value.yLoc;
			console.log(value);
			resolve();
		});
	});
	await new Promise((resolve, reject) => {
		chrome.storage.local.get(["forecastUrl"], (value) => {
			opts.forecastUrl = value.forecastUrl;
			console.log(value);
			resolve();
		});
	});
	await new Promise((resolve, reject) => {
		chrome.storage.local.get(["lastRequest"], (value) => {
			opts.lastRequest = value.lastRequest;
			console.log(value);
			resolve();
		});
	});
	await new Promise((resolve, reject) => {
		chrome.storage.session.get(["overrideRefreshTimer"], (value) => {
			opts.overrideRefreshTimer = value.overrideRefreshTimer;
			console.log(value);
			resolve();
		});
	});
	
	return opts;
}

async function fetchIt(clicked = false) {
	let opts = await getAllOptions();
	const now = new Date();
	
	if (opts?.lastRequest) {
		if ( now.getTime() - new Date(opts.lastRequest).getTime() < 10000 ) {
			console.error("Cannot request more than once per 10 seconds!");
		}
	}
	
	if (opts?.lastUpdate && !opts.overrideRefreshTimer) {
		const lastUpdate = new Date(opts.lastUpdate);
		
		// TODO: REPLACE WITH SETTIMEOUT FOR AUTOUPDATE
		if (now.getTime() - lastUpdate.getTime() < 3600000 /*1 hour*/ + 300000 /*5 mins*/) {
			if (clicked) {
				console.error("Cannot request before update time (+5 mins just in case)!");
				req.textContent = `Please wait ${Math.ceil(( 3900000 - ( now.getTime() - lastUpdate.getTime() ) ) / 60000 )} minutes until next refresh`;
			} else {
				req.textContent = `Refresh`;
			}
			return;
		}
	}
	chrome.storage.session.set({"overrideRefreshTimer": false});
	
	if (!opts?.xLoc && !opts?.forecastUrl) { // If no location and no URL stored
		alert("No (valid) location entered in Options, defaulting to Chicago forecast");
	}
	else if (!opts?.forecastUrl) {
		const gridpointRes = await sendRequest(`https://api.weather.gov/points/${opts.yLoc},${opts.xLoc}`);
		if (!gridpointRes) return;
		
		await chrome.storage.local.set({"forecastUrl": gridpointRes?.properties.forecast});
		
		opts = await getAllOptions();
	}
	
	chrome.storage.local.set({"lastRequest": now.toISOString()});
	const url = ( opts?.forecastUrl ?? "https://api.weather.gov/gridpoints/LOT/73,73/forecast" );
	
	const response = await sendRequest(url);
	
	if (!response?.properties) return;
	changeForecastDetails(response.properties.periods[0].icon, response.properties.periods[0].temperature, response.properties.periods[0].temperatureUnit);
	
	chrome.storage.local.set({"lastIcon": response?.properties.periods[0].icon});
	chrome.storage.local.set({"lastTemp": response?.properties.periods[0].temperature});
	chrome.storage.local.set({"lastUnit": response?.properties.periods[0].temperatureUnit});
	chrome.storage.local.set({"lastUpdate": response?.properties.updateTime});
	
	/*chrome.action.setBadgeText({ text: "1" });
	chrome.action.setBadgeBackgroundColor({ color: "#00FF00" });*/
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