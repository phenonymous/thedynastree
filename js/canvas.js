
var canvas;
var ctx;

window.addEventListener("resize", (_ => resizeCanvas()));
window.addEventListener("scroll", (_ => drawTree()));
window.addEventListener("orientationchange", (_ => {
	setTimeout(resizeCanvas, 100);
}));

// Add mutation observer to watch for changes in the tree structure
let treeObserver = null;

function initTreeObserver() {
	const treeTab = document.getElementById("treeTab");
	if (treeTab && !treeObserver) {
		treeObserver = new MutationObserver(() => {
			setTimeout(drawTree, 50); // Small delay to ensure DOM is updated
		});
		
		treeObserver.observe(treeTab, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: ['style', 'class']
		});
	}
}

// Initialize observer when the page loads
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initTreeObserver);
} else {
	initTreeObserver();
}

function retrieveCanvasData() {
	let treeCanv = document.getElementById("treeCanvas")
	let treeTab = document.getElementById("treeTab")
	if (treeCanv === undefined || treeCanv === null) return false;
	if (treeTab === undefined || treeTab === null) return false;
	canvas = treeCanv;
	ctx = canvas.getContext("2d");
	
	// Add scroll listener to treeTab for mobile
	if (!treeTab.hasScrollListener) {
		treeTab.addEventListener('scroll', drawTree);
		treeTab.hasScrollListener = true;
	}
	
	return true;
}

function resizeCanvas() {
	if (!retrieveCanvasData()) return
	canvas.width = 0;
	canvas.height = 0;
	
	const treeTab = document.getElementById("treeTab");
	
	// Set canvas size to match the treeTab container
	canvas.width = treeTab.scrollWidth;
	canvas.height = treeTab.scrollHeight;
	
	// Ensure minimum size for proper display
	if (canvas.width < window.innerWidth) {
		canvas.width = window.innerWidth;
	}
	if (canvas.height < window.innerHeight) {
		canvas.height = window.innerHeight;
	}
	
	drawTree();
}

var colors = {
	default: {
		1: "#ffffff",
		2: "#bfbfbf",
		3: "#7f7f7f",
	},
	aqua: {
		1: "#bfdfff",
		2: "#8fa7bf",
		3: "#5f6f7f",
	},
}
var colors_theme

function drawTree() {
	if (!retrieveCanvasData()) return;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	for (layer in layers) {
		if (layers[layer].layerShown() && layers[layer].branches) {
			for (branch in layers[layer].branches) {
				drawTreeBranch(layer, layers[layer].branches[branch])
			}
		}
	}
}

function drawTreeBranch(num1, data) { // taken from Antimatter Dimensions & adjusted for mobile
	let num2 = data[0]
	let color_id = data[1]

	if (document.getElementById(num1) == null || document.getElementById(num2) == null)
		return

	const startEl = document.getElementById(num1);
	const endEl = document.getElementById(num2);
	const treeTab = document.getElementById("treeTab");
	
	// Get element positions relative to the treeTab container
	const startRect = startEl.getBoundingClientRect();
	const endRect = endEl.getBoundingClientRect();
	const treeTabRect = treeTab.getBoundingClientRect();
	
	// Calculate positions relative to the treeTab container
	let x1 = startRect.left - treeTabRect.left + startRect.width / 2;
	let y1 = startRect.top - treeTabRect.top + startRect.height / 2;
	let x2 = endRect.left - treeTabRect.left + endRect.width / 2;
	let y2 = endRect.top - treeTabRect.top + endRect.height / 2;
	
	// Add scroll offset
	x1 += treeTab.scrollLeft;
	y1 += treeTab.scrollTop;
	x2 += treeTab.scrollLeft;
	y2 += treeTab.scrollTop;
	
	ctx.lineWidth = window.innerWidth <= 768 ? 8 : 15; // Thinner lines on mobile
	ctx.beginPath();
	ctx.strokeStyle = colors_theme[color_id];
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke();
}