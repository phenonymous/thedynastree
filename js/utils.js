function getWorldName () {
	let str = "World α"
	if (player.b.banking && player.b.unl) str += " + " + tmp.buyables.b[[11, 12, 13, 21, 22, 23, 31, 32].find(x => tmp.buyables.b[x].canAfford)].title
	if (player.bd.building) str += " + " +  tmp.buyables.bd[player.bd.building].title + " Building"
	if (player.t.active) str += " + " + tmp.challs.t[player.t.active].name
	return str
}

function isFunction (obj) {
	return obj && {}.toString.call(obj) === '[object Function]';
}

class SaveCorruptedError extends Error {
  constructor(message) {
    super(message)
    this.name = "SaveCorruptedError"
  }
}

var statsResources = [
	{
		layer: "·",
		name: "Points",
		unl: () => true,
		points: () => format(player.points, 2),
	},
	{
		layer: "c",
		name: "Coins",
		unl: () => player.c.unl,
		points: () => formatWhole(player.c.points),
		total: () => formatWhole(player.c.total),
		best: () => formatWhole(player.c.best),
	},
	{
		layer: "wf",
		name: "Workfinders",
		unl: () => player.wf.unl,
		points: () => formatWhole(player.wf.points),
		best: () => formatWhole(player.wf.best),
	},
	{
		layer: "wf",
		name: "├ Finished Work",
		unl: () => player.wf.unl,
		points: () => formatWhole(player.wf.workDone),
	},
	{
		layer: "wf",
		name: "└ Unfinished Work",
		unl: () => player.wf.unl,
		points: () => formatWhole(player.wf.workUndone),
	},
	{
		layer: "sp",
		name: "Spiritual Power",
		unl: () => player.sp.unl,
		points: () => formatWhole(player.sp.points),
		total: () => formatWhole(player.sp.total),
		best: () => formatWhole(player.sp.best),
	},
	{
		layer: "sp",
		name: "└ Magic",
		unl: () => player.sp.unl,
		points: () => formatWhole(player.sp.magic),
	},
	{
		layer: "b",
		name: "Banks",
		unl: () => player.b.unl,
		points: () => formatWhole(player.b.points),
		best: () => formatWhole(player.b.best),
	},
	{
		layer: "w",
		name: "Workers",
		unl: () => player.w.unl,
		points: () => formatWhole(player.w.points),
		best: () => formatWhole(player.w.best),
	},
	{
		layer: "bd",
		name: "Builders",
		unl: () => player.bd.unl,
		points: () => formatWhole(player.bd.points),
		best: () => formatWhole(player.bd.best),
	},
	{
		layer: "so",
		name: "Soldiers",
		unl: () => player.so.unl,
		points: () => formatWhole(player.so.points),
		best: () => formatWhole(player.so.best),
	},
	{
		layer: "m",
		name: "Managers",
		unl: () => player.m.unl,
		points: () => formatWhole(player.m.points),
		best: () => formatWhole(player.m.best),
	},
	{
		layer: "t",
		name: "Territories",
		unl: () => player.t.unl,
		points: () => formatWhole(player.t.points),
		best: () => formatWhole(player.t.best),
	},
	{
		layer: "t",
		name: "├ Conquered Land",
		unl: () => player.so.buyables[13].gte(1),
		points: () => formatWhole(player.t.lands),
	},
	{
		layer: "t",
		name: "└ Honor",
		unl: () => player.so.buyables[13].gte(1),
		points: () => formatWhole(player.t.elo),
	},
	{
		layer: "wi",
		name: "Wisdom",
		unl: () => player.wi.unl,
		points: () => formatWhole(player.wi.points),
		best: () => formatWhole(player.wi.best),
	},
	{
		layer: "wi",
		name: "└ Knowledge",
		unl: () => player.wi.unl,
		points: () => formatWhole(player.wi.knowledge),
	},
]

// ************ Number formatting ************

function exponentialFormat(num, precision) {
	let e = num.log10().floor()
	let m = num.div(Decimal.pow(10, e))
	return m.toStringWithDecimalPlaces(3) + "e" + e.toStringWithDecimalPlaces(0)
}

function commaFormat(num, precision) {
	if (num === null || num === undefined) return "NaN"
	if (num.mag < 0.001) return (0).toFixed(precision)
	return num.toStringWithDecimalPlaces(precision).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

function fixValue(x, y = 0) {
	return x || new Decimal(y)
}

function sumValues(x) {
	x = Object.values(x)
	if (!x[0]) return new Decimal(0)
	return x.reduce((a, b) => Decimal.add(a, b))
}

function format(decimal, precision = 2) {
	decimal = new Decimal(decimal)
	if (isNaN(decimal.sign) || isNaN(decimal.layer) || isNaN(decimal.mag)) {
		player.hasNaN = true;
		NaNerror = new SaveCorruptedError("The game has detected NaN in your save. If you can see this please contact the mod developer.")
		return "NaN"
	}
	if (decimal.sign < 0) return "-" + format(decimal.neg(), precision)
	if (decimal.mag == Number.POSITIVE_INFINITY) return "Infinity"
	if (decimal.gte("eeee1000")) {
		var slog = decimal.slog()
		if (slog.gte(1e6)) return "F" + format(slog.floor())
		else return Decimal.pow(10, slog.sub(slog.floor())).toStringWithDecimalPlaces(3) + "F" + commaFormat(slog.floor(), 0)
	} else if (decimal.gte("1e1000")) return (Math.floor(decimal.mantissa + 0.01) + ("e" + formatWhole(decimal.log10().floor())))
	else if (decimal.gte(1e9)) return exponentialFormat(decimal, precision)
	else if (decimal.gte(1e3)) return commaFormat(decimal, 0)
	else return commaFormat(decimal, precision)
}

function formatWhole(decimal) {
	return format(decimal, 0)
}

function formatTimeLong(s) {
	let str = format(s % 60) + " seconds"; s /= 60
	if (s >= 1) str = formatWhole(Math.floor(s) % 60) + " minutes and " + str; s /= 60
	if (s >= 1) str = formatWhole(Math.floor(s) % 24) + " hours, " + str; s /= 24
	if (s >= 1) str = formatWhole(Math.floor(s) % 365) + " days, " + str; s /= 365
	if (s >= 1) str = formatWhole(Math.floor(s)) + " years, " + str
	return str
}

function formatTime(s) {
	if (Decimal.gte(s, 31557600e3)) return formatTimeAlt(s)
	let str = format(s % 60) + "s"; s /= 60
	if (s >= 1) str = formatWhole(Math.floor(s) % 60) + "m " + str; s /= 60
	if (s >= 1) str = formatWhole(Math.floor(s) % 24) + "h " + str; s /= 24
	if (s >= 1) str = formatWhole(Math.floor(s) % 365) + "d " + str; s /= 365
	if (s >= 1) str = formatWhole(Math.floor(s)) + "y " + str
	return str
}
function formatTimeAlt(s) {
	s = new Decimal(s)
	if (s.gte("31557600e1000")) return format(s.div("31557600e1000")) + " universe lifetimes"
	if (s.gte(31557600e100)) return format(s.div(31557600e100)) + " black hole eras"
	if (s.gte(31557600e40)) return format(s.div(31557600e40)) + " degenerate eras"
	if (s.gte(31557600e9)) return format(s.div(31557600e9)) + " aeons"
	if (s.gte(31557600e3)) return format(s.div(31557600e3)) + " millenials"
	if (s.gte(31557600)) return format(s.div(31557600)) + " years"
	if (s.gte(86400)) return format(s.div(86400)) + " days"
	if (s.gte(3600)) return format(s.div(3600)) + " hours"
	if (s.gte(60)) return format(s.div(60)) + " minutes"
	return format(s) + " seconds"
}

function toPlaces(x, precision, maxAccepted) {
	x = new Decimal(x)
	let result = x.toStringWithDecimalPlaces(precision)
	if (new Decimal(result).gte(maxAccepted)) {
		result = new Decimal(maxAccepted - Math.pow(0.1, precision)).toStringWithDecimalPlaces(precision)
	}
	return result
}
// ************ Save stuff ************

function save() {
	localStorage.setItem(modInfo.id, btoa(JSON.stringify(player)))
}

function startPlayerBase() {
	return {
		tab: "tree",
		time: Date.now(),
		autosave: true,
		notify: {},
		msDisplay: "always",
		offlineProd: true,
		versionType: modInfo.id,
		version: VERSION.num,
		beta: VERSION.beta,
		timePlayed: 0,
		keepGoing: false,
		hasNaN: false,
		hideChalls: false,
		optionFlavor: true,
		points: new Decimal(10),
		subtabs: {},
	}
}

function getStartPlayer() {
	playerdata = startPlayerBase()
	for (layer in layers) {
		playerdata[layer] = layers[layer].startData()
		playerdata[layer].buyables = getStartBuyables(layer)
		playerdata[layer].spentOnBuyables = new Decimal(0)
		playerdata[layer].upgrades = []
		playerdata[layer].milestones = []
		playerdata[layer].challs = []
		if (layers[layer].tabFormat && !Array.isArray(layers[layer].tabFormat)) {
			playerdata.subtabs[layer] = {}
			playerdata.subtabs[layer].mainTabs = Object.keys(layers[layer].tabFormat)[0]
		}
		if (layers[layer].microtabs) {
			if (playerdata.subtabs[layer] == undefined) playerdata.subtabs[layer] = {}
			for (item in layers[layer].microtabs)
				playerdata.subtabs[layer][item] = Object.keys(layers[layer].microtabs[item])[0]
		}
	}
	return playerdata
}

function fixSave() {
	defaultData = startPlayerBase()
	for (datum in defaultData) {
		if (player[datum] == undefined) {
			player[datum] = defaultData[datum]
		}
	}
	for (layer in layers) {
		defaultData = layers[layer].startData()
		if (player[layer].upgrades == undefined)
			player[layer].upgrades = []
		if (player[layer].milestones == undefined)
			player[layer].milestones = []
		if (player[layer].challs == undefined)
			player[layer].challs = []

		for (datum in defaultData) {
			if (player[layer][datum] == undefined) {
				player[layer][datum] = defaultData[datum]
			}
		}

		if (player[layer].spentOnBuyables == undefined)
			player[layer].spentOnBuyables = new Decimal(0)

		if (layers[layer].buyables) {
			if (player[layer].buyables == undefined) player[layer].buyables = {}

			for (id in layers[layer].buyables) {
				if (player[layer].buyables[id] == undefined && !isNaN(id))
					player[layer].buyables[id] = new Decimal(0)
			}
		}

		if (layers[layer].tabFormat && !Array.isArray(layers[layer].tabFormat)) {
			if (player.subtabs[layer] == undefined) player.subtabs[layer] = {}
			if (player.subtabs[layer].mainTabs == undefined) player.subtabs[layer].mainTabs = Object.keys(layers[layer].tabFormat)[0]
		}

		if (layers[layer].microtabs) {
			if (player.subtabs[layer] == undefined) player.subtabs[layer] = {}
			for (item in layers[layer].microtabs)
				if (player.subtabs[layer][item] == undefined) player.subtabs[layer][item] = Object.keys(layers[layer].microtabs[item])[0]
		}

	}
}

function load() {
	let get = localStorage.getItem(modInfo.id);
	if (get === null || get === undefined || get === "dW5kZWZpbmVk") player = getStartPlayer()
	else player = Object.assign(getStartPlayer(), JSON.parse(atob(get)))
	fixSave()

	player.tab = "tree"
	if (player.offlineProd) {
		if (player.offTime === undefined) player.offTime = { remain: 0 }
		player.offTime.remain += (Date.now() - player.time) / 1000
	}
	player.time = Date.now();
	convertToDecimal();
	versionCheck();
	changeTheme();
	changeTreeQuality();
	setupTemp();
	updateTemp();
	updateTemp();
	loadVue();
}

function exportSave() {
	let str = btoa(JSON.stringify(player))

	// Try modern Clipboard API first (better for mobile)
	if (navigator.clipboard && navigator.clipboard.writeText) {
		navigator.clipboard.writeText(str).then(function() {
			alert("Save exported to clipboard!")
		}).catch(function(err) {
			// Fallback to legacy method if modern API fails
			console.warn("Clipboard API failed:", err.message)
			exportSaveLegacy(str)
		})
	} else {
		// Fallback for browsers without Clipboard API
		exportSaveLegacy(str)
	}
}

function exportSaveLegacy(str) {
	try {
		const el = document.createElement("textarea");
		el.value = str;
		document.body.appendChild(el);
		el.select();
		el.setSelectionRange(0, 99999);
		document.execCommand("copy");
		document.body.removeChild(el);
		alert("Save exported to clipboard!")
	} catch (err) {
		// If clipboard fails entirely, suggest file export
		console.warn("Clipboard export failed:", err.message)
		if (confirm("Clipboard export failed. Would you like to download the save as a file instead?")) {
			exportSaveToFile()
		} else {
			alert("Export failed. Please try the 'Export to File' option.")
		}
	}
}

function importSave(imported = undefined, forced = false) {
	if (imported === undefined) imported = prompt("Paste your save here")
	try {
		tempPlr = Object.assign(getStartPlayer(), JSON.parse(atob(imported)))
		if (tempPlr.versionType != modInfo.id && !forced && !confirm("This save appears to be for a different mod! Are you sure you want to import?")) // Wrong save (use "Forced" to force it to accept.)
			return
		player = tempPlr;
		player.versionType = modInfo.id
		fixSave()
		save()
		window.location.reload()
	} catch (e) {
		return;
	}
}

function exportSaveToFile() {
	let str = btoa(JSON.stringify(player))
	
	// Create blob and download link
	const blob = new Blob([str], { type: 'text/plain' })
	const url = URL.createObjectURL(blob)
	
	// Create download link
	const downloadLink = document.createElement('a')
	downloadLink.href = url
	downloadLink.download = `dynastree-save-${Date.now()}.txt`
	downloadLink.style.display = 'none'
	
	// Trigger download
	document.body.appendChild(downloadLink)
	downloadLink.click()
	document.body.removeChild(downloadLink)
	
	// Clean up
	URL.revokeObjectURL(url)
	alert("Save downloaded as file!")
}

function importSaveFromClipboard() {
	if (!navigator.clipboard) {
		alert("Clipboard access is not supported in this browser. Please use the regular import option.")
		return
	}
	
	navigator.clipboard.readText().then(function(clipboardText) {
		if (!clipboardText) {
			alert("No text found in clipboard!")
			return
		}
		importSave(clipboardText)
	}).catch(function(err) {
		alert("Failed to read from clipboard: " + err.message)
	})
}

function importSaveFromFile() {
	const fileInput = document.createElement("input")
	fileInput.type = "file"
	fileInput.accept = ".txt,.save"
	fileInput.style.display = "none"
	
	fileInput.onchange = function(event) {
		const file = event.target.files[0]
		if (!file) return
		
		const reader = new FileReader()
		reader.onload = function(e) {
			const fileContent = e.target.result
			if (!fileContent) {
				alert("File appears to be empty!")
				return
			}
			importSave(fileContent)
		}
		reader.onerror = function() {
			alert("Failed to read file!")
		}
		reader.readAsText(file)
	}
	
	document.body.appendChild(fileInput)
	fileInput.click()
	document.body.removeChild(fileInput)
}

function versionCheck() {
	let setVersion = true

	if (player.versionType === undefined || player.version === undefined) {
		player.versionType = modInfo.id
		player.version = 0
	}

	if (setVersion) {
		if (player.versionType == modInfo.id && VERSION.num > player.version) player.keepGoing = false
		player.versionType = getStartPlayer().versionType
		player.version = VERSION.num
		player.beta = VERSION.beta
	}
}

var saveInterval = setInterval(function () {
	if (player === undefined) return;
	if (gameEnded && !player.keepGoing) return;
	if (player.autosave) save();
}, 5000)

// ************ Themes ************

const themes = {
	1: "aqua"
}
const theme_names = {
	aqua: "Aqua"
}

function changeTheme() {
	let aqua = player.theme == "aqua"
	colors_theme = colors[player.theme || "default"]
	document.body.style.setProperty('--background', aqua ? "#001f3f" : "#0f0f0f")
	document.body.style.setProperty('--background_tooltip', aqua ? "rgba(0, 15, 31, 0.75)" : "rgba(0, 0, 0, 0.75)")
	document.body.style.setProperty('--color', aqua ? "#bfdfff" : "#dfdfdf")
	document.body.style.setProperty('--points', aqua ? "#dfefff" : "#ffffff")
	document.body.style.setProperty("--locked", aqua ? "#c4a7b3" : "#bf8f8f")
}

function getThemeName() {
	return player.theme ? theme_names[player.theme] : "Default"
}

function switchTheme() {
	if (player.theme === undefined) player.theme = themes[1]
	else {
		player.theme = themes[Object.keys(themes)[player.theme] + 1]
		if (!player.theme) delete player.theme
	}
	changeTheme()
	resizeCanvas()
}

// ************ Options ************

function toggleOpt(name) {
	if (name == "oldStyle" && styleCooldown > 0) return;

	player[name] = !player[name]
	if (name == "hqTree") changeTreeQuality()
	if (name == "oldStyle") updateStyle()
}

var styleCooldown = 0;


function updateStyle() {
	styleCooldown = 1;
	let css = document.getElementById("styleStuff")
	css.href = player.oldStyle ? "oldStyle.css" : "style.css"
	needCanvasUpdate = true;
}

function changeTreeQuality() {
	var on = player.hqTree
	document.body.style.setProperty('--hqProperty1', on ? "2px solid" : "4px solid")
	document.body.style.setProperty('--hqProperty2a', on ? "-4px -4px 4px rgba(0, 0, 0, 0.25) inset" : "-4px -4px 4px rgba(0, 0, 0, 0) inset")
	document.body.style.setProperty('--hqProperty2b', on ? "0px 0px 20px var(--background)" : "")
	document.body.style.setProperty('--hqProperty3', on ? "2px 2px 4px rgba(0, 0, 0, 0.25)" : "none")
}

function toggleAuto(toggle) {
	player[toggle[0]][toggle[1]] = !player[toggle[0]][toggle[1]]
}

function adjustMSDisp() {
	let displays = ["always", "automation", "incomplete", "never"];
	player.msDisplay = displays[(displays.indexOf(player.msDisplay) + 1) % 4]
}

function milestoneShown(layer, id) {
	complete = player[layer].milestones.includes(id)
	auto = layers[layer].milestones[id].toggles

	switch (player.msDisplay) {
		case "always":
			return true;
			break;
		case "automation":
			return (auto) || !complete
			break;
		case "incomplete":
			return !complete
			break;
		case "never":
			return false;
			break;
	}
	return false;
}

// ************ Misc ************

var onTreeTab = true
function showTab(name) {
	if (LAYERS.includes(name) && !layerUnl(name)) return

	var toTreeTab = name == "tree"
	player.tab = name

	if (toTreeTab != onTreeTab) {
		document.getElementById("treeTab").className = toTreeTab ? "fullWidth" : "col left"
		onTreeTab = toTreeTab
		resizeCanvas()
	}
	delete player.notify[name]
}

function notifyLayer(name) {
	if (player.tab == name || !layerUnl(name)) return
	player.notify[name] = 1
}

function nodeShown(layer) {
	if (tmp.layerShown[layer]) return true
	switch (layer) {
		case "idk":
			return player.l.unl
			break;
	}
	return false
}

function layerUnl(layer) {
	return LAYERS.includes(layer) && (player[layer].unl || (tmp.layerAmt[layer].gte(tmp.layerReqs[layer]) && layers[layer].layerShown()))
}

function keepGoing() {
	player.keepGoing = true;
	showTab("tree")
}

function toNumber(x) {
	if (x.mag !== undefined) return x.toNumber()
	if (x + 0 !== x) return parseFloat(x)
	return x
}

function updateMilestones(layer) {
	for (id in layers[layer].milestones) {
		if (!(player[layer].milestones.includes(id)) && layers[layer].milestones[id].done())
			player[layer].milestones.push(id)
	}
}

function addTime(diff, layer) {
	let data = player
	let time = data.timePlayed
	if (layer) {
		data = data[layer]
		time = data.time
	}

	//I am not that good to perfectly fix that leak. ~ DB Aarex
	if (time + 0 !== time) {
		console.log("Memory leak detected. Trying to fix...")
		time = toNumber(time)
		if (isNaN(time) || time == 0) {
			console.log("Couldn't fix! Resetting...")
			time = layer ? player.timePlayed : 0
			if (!layer) player.timePlayedReset = true
		}
	}
	time += toNumber(diff)

	if (layer) data.time = time
	else data.timePlayed = time
}

document.onkeydown = function (e) {
	if (player === undefined) return;
	if (gameEnded && !player.keepGoing) return;
	let shiftDown = e.shiftKey
	let ctrlDown = e.ctrlKey
	let key = e.key
	if (ctrlDown) key = "ctrl+" + key
	if (onFocused) return
	if (ctrlDown && key != "-" && key != "_" && key != "+" && key != "=" && key != "r" && key != "R" && key != "F5") e.preventDefault()
	if (hotkeys[key]) {
		if (player[hotkeys[key].layer].unl)
			hotkeys[key].onPress()
	}
}

var onFocused = false
function focused(x) {
	onFocused = x
}

// Handle page visibility changes for mobile conquest preservation
var gameHidden = false
var conquestPausedTime = 0

// Store conquest state when page becomes hidden
function handleVisibilityChange() {
	if (typeof player === 'undefined') return;
	
	if (document.hidden || document.webkitHidden || document.msHidden) {
		// Page is now hidden - store conquest state
		gameHidden = true
		if (player.world && player.world.conquering) {
			conquestPausedTime = Date.now()
		}
	} else {
		// Page is now visible - restore conquest state
		if (gameHidden && player.world && player.world.conquering && conquestPausedTime > 0) {
			// Calculate time that passed while hidden
			var hiddenTime = (Date.now() - conquestPausedTime) / 1000
			
			// Apply the missed time to conquest progress if offline production is enabled
			if (player.offlineProd && hiddenTime > 0) {
				// Get soldier stats for conquest speed calculation
				var soldierStats = tmp.layerEffs && tmp.layerEffs.so ? tmp.layerEffs.so : { mhp: new Decimal(100), spd: new Decimal(1) }
				
				// Only continue conquest if we have health and no active encounter
				if (player.world.health && player.world.health.gt(0) && !player.world.encounter) {
					var delta = Decimal.div(player.world.health, soldierStats.mhp).mul(soldierStats.spd)
					var progressGain = Decimal.mul(delta, hiddenTime)
					
					player.world.conquerProgress = Decimal.add(player.world.conquerProgress, progressGain)
					
					// Check if conquest should complete
					if (player.world.conquerProgress.gte(player.world.conquerGoal)) {
						player.world.conquerProgress = new Decimal(0)
						// Import the doneConquering function from map.js
						if (typeof doneConquering === 'function') {
							doneConquering()
						}
					}
				}
			}
		}
		gameHidden = false
		conquestPausedTime = 0
	}
}

// Add event listeners for different browsers
if (typeof document !== 'undefined') {
	// Standard visibility API
	if (typeof document.addEventListener !== 'undefined') {
		document.addEventListener('visibilitychange', handleVisibilityChange, false)
	}
	
	// Webkit-based browsers (older Safari, Chrome)
	if (typeof document.webkitHidden !== 'undefined') {
		document.addEventListener('webkitvisibilitychange', handleVisibilityChange, false)
	}
	
	// Internet Explorer and older browsers
	if (typeof document.msHidden !== 'undefined') {
		document.addEventListener('msvisibilitychange', handleVisibilityChange, false)
	}
	
	// Fallback for older browsers using focus/blur events
	window.addEventListener('focus', function() {
		setTimeout(handleVisibilityChange, 100) // Small delay to ensure proper state
	}, false)
	
	window.addEventListener('blur', function() {
		handleVisibilityChange()
	}, false)
	
	// Mobile-specific events
	window.addEventListener('pageshow', function() {
		setTimeout(handleVisibilityChange, 100)
	}, false)
	
	window.addEventListener('pagehide', function() {
		handleVisibilityChange()
	}, false)
}