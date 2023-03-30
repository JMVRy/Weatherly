// Variables for each checkbox
const autoUpdate = document.getElementById("autoUpdate");
const hourly = document.getElementById("hourly");

// Make sure each option is correctly checked
chrome.storage.local.get(["autoUpdate"], (value) => autoUpdate.checked = ( value.autoUpdate ? true : false ));
chrome.storage.local.get(["hourly"], (value) => hourly.checked = ( value.hourly ? true : false ));

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