// Variables for each checkbox
const autoUpdate = document.getElementById("autoUpdate");
const hourly = document.getElementById("hourly");
const loc = document.getElementById("location");
const matchAddr = document.getElementById("matchAddr");

// Make sure each option is correctly checked
chrome.storage.local.get(["autoUpdate"], (value) => autoUpdate.checked = ( value.autoUpdate ? true : false ));
chrome.storage.local.get(["hourly"], (value) => hourly.checked = ( value.hourly ? true : false ));
chrome.storage.session.get(["location"], (val) => {
	if ( !val?.location ) {
		chrome.storage.local.get(["forecastUrl"], (valhalla) => {
			if ( !valhalla?.forecastUrl ) {
				loc.value = matchAddr.textContent = "No location given, defaulting to Chicago!";
			} else {
				loc.value = matchAddr.textContent = "Location not stored, but forecast is still available!";
			}
		});
	} else {
		loc.value = matchAddr.textContent = val.location;
	}
});

// Change options when checkboxes are checked
autoUpdate.addEventListener("change", (event) => {
	console.log(event);
	if (event.currentTarget != autoUpdate) return;
	if (event.currentTarget.checked) {
		console.log("Checked autoUpdate");
		chrome.storage.local.set({"autoUpdate": true});
	} else {
		console.log("Unchecked autoUpdate");
		chrome.storage.local.set({"autoUpdate": false});
	}
});

hourly.addEventListener("change", (event) => {
	console.log(event);
	if (event.currentTarget != hourly) return;
	if (event.currentTarget.checked) {
		console.log("Checked hourly");
		chrome.storage.local.set({"hourly": true});
	} else {
		console.log("Unchecked hourly");
		chrome.storage.local.set({"hourly": false});
	}
});

loc.addEventListener("change", (event) => {
	console.log(event);
	if (event.currentTarget != loc) return;
	
	console.log("Changed location value");
	chrome.storage.session.set({"location": event.currentTarget.value});
	
	getLocationMatch(event.currentTarget.value).then((matchedAddress) => {
		matchAddr.textContent = `Matched: ${matchedAddress}`;
	});
});

async function getLocationMatch(loc) {
	const geocodeUrl = `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=${encodeURIComponent(loc)}&benchmark=2020&format=json`;
	const response = await sendRequest(geocodeUrl);
	
	if (response?.result.addressMatches.length === 0) {
		return "No matching address was found!";
	} else {
		await chrome.storage.session.set({"xLoc": response.result.addressMatches[0].coordinates.x});
		await chrome.storage.session.set({"yLoc": response.result.addressMatches[0].coordinates.y});
		
		return response.result.addressMatches[0].matchedAddress;
	}
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