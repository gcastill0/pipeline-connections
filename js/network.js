let columns;
let rows = 5;
let cell_w, cell_h;

let gaps = 6;
let h_cell_gap;
let v_cell_gap;
let cell_height;
let cell_width;

let flows = [];
let conns = [];

let active;
let overlay_active;

let workflow = {
	"entities": [
		{ "id": 0, "label": "AZURE DEVOPS" },
		{ "id": 1, "label": "VAULT" },
		{ "id": 2, "label": "TERRAFORM" },
		{ "id": 3, "label": "AZURE CLOUD" },
		{ "id": 4, "label": "APPLICATION" }
	],
	"connections": [
		{
			"source": 0, "destination": 1,
			"description": "Acquire Pipeline Secrets",
			"template": "templates/network_01.html"
		},
		{
			"source": 1, "destination": 2,
			"description": "Generate Dynamic User Token",
			"template": "templates/network_02.html"
		},
		{
			"source": 1, "destination": 3,
			"description": "Generate Dynamic Credentials",
			"template": "templates/network_03.html"
		},
		{
			"source": 0, "destination": 2,
			"description": "Populate Workspace Variables",
			"template": "templates/network_04.html"
		},
		{
			"source": 0, "destination": 2,
			"description": "Upload IaC Artifact and Trigger Build ",
			"template": "templates/network_05.html"
		},
		{
			"source": 2, "destination": 3,
			"description": "Run Speculative Plan",
			"template": "templates/network_06.html"
		},
		{
			"source": 2, "destination": 3,
			"description": "Evaluate Policies",
			"template": "templates/network_07.html"
		},
		{
			"source": 2, "destination": 3,
			"description": "Build Infrastructure",
			"template": "templates/network_08.html"
		},
		{
			"source": 2, "destination": 1,
			"description": "Acquire Application Secrets",
			"template": "templates/network_09.html"
		},
		{
			"source": 1, "destination": 2,
			"description": "Confirm Identity and Grant Access",
			"template": "templates/network_10.html"
		},
		{
			"source": 2, "destination": 4,
			"description": "Provide Secrets",
			"template": "templates/network_11.html"
		}
	]
};

function preload() {
	fontBold = loadFont('css/fonts/KlavikaBasic-Bold.otf');
}

function setup() {

	let canvas = createCanvas(1600, 900);
	canvas.parent('sketch-div');
	textFont(fontBold);
	textSize(16);
	textAlign(CENTER, CENTER);
	// noLoop();

	active = -1;
	overlay_active = false;

	columns = workflow.entities.length;
	cell_w = width / columns;
	cell_h = height / (rows + 1);

	h_cell_gap = width / gaps;
	v_cell_gap = height / gaps;
	cell_width = h_cell_gap * 0.75;
	cell_h = cell_height = v_cell_gap * 0.75;

	workflow["entities"].forEach(function (entity, i) {
		let x = cell_w * i;
		let t = entity["label"];
		workflow.entities[i]["location"] = { "x": x, "y": 0 };
		flows.push(new Cell(x, t));
	});

	workflow["connections"].forEach(function (conn, i) {
		let src = createVector(workflow.entities[conn.source].location.x + cell_w / 2, workflow.entities[conn.source].location.y + cell_h * .75 + (i + 1) * cell_h / 1.7);
		let dst = createVector(workflow.entities[conn.destination].location.x + cell_w / 2, workflow.entities[conn.destination].location.y + cell_h * .75 + (i + 1) * cell_h / 1.7);
		let dsc = conn.description;
		let tmp = conn.template;
		conns.push(new Connection(src, dst, dsc, i, tmp));
	});
}

function draw() {
	background(55, 57, 66);
	flows.forEach(entity => entity.render());
	funky_grid();

	for (let i = 0; i <= active && i < conns.length; i++) {
		conns[i].render();
	}
}

function funky_grid() {
	noStroke();
	fill(210, 241, 255, 25);

	for (let i = 0; i < gaps; i += 0.5) {
		for (let ii = 0; ii < gaps; ii += 0.5) {
			let x = i * h_cell_gap;
			let y = ii * v_cell_gap;

			for (let dx = x; dx <= x + h_cell_gap; dx += h_cell_gap / 5 / 2) {
				for (let dy = y + v_cell_gap / 3 / 2; dy <= y + v_cell_gap; dy += v_cell_gap / 3 / 2) {
					ellipse(dx, dy, 1, 1);
				}
			}
			// if (i == 0 || ii == 0) continue;
			// ellipse(x, y, 5, 5);
		}
	}
}

function mousePressed() {
	// if (active === -1) active++;
	// else if (conns[active].complete) active++;
	if (!overlay_active) {
		conns.forEach(function (conn) {
			if (conn.inBounds(mouseX, mouseY)) {
				conn.isSelected();
			} else {
				conn.isDeselected();
			}
		}
		)
	}
	draw();
}

function touchStarted() {
	if (active === -1) active++;
	else if (conns[active].complete) active++;
}

function keyPressed() {
	if (active === -1) active++;
	else if (keyCode === RIGHT_ARROW && conns[active].complete) active++;
}

function readTemplate(name) {
	let file = new XMLHttpRequest();
	file.open("GET", name, false);
	file.send();
	return file.responseText;
}

function closeOverlay() {
	if (overlay_active) {
		conns.forEach(function (conn) {
			if (conn.active) {
				document.getElementById('light').removeChild(conn.content);
				document.getElementById('light').style.display = 'none';
				document.getElementById('fade').style.display = 'none';
				overlay_active = false;
				conn.active = false;
			}
		})
	};
}


class Cell {
	constructor(x = 0, t = "") {
		this.x = x;
		this.y = 0;
		this.w = cell_w;
		this.h = cell_h;
		this.t = t;
	}

	render() {
		stroke(23, 24, 25, 20);
		strokeWeight(10);

		fill(23, 24, 25, 75);
		rect(this.x + 5, this.y + 5, this.w - 10, height - 10, 10);

		stroke(23, 24, 25, 100);
		rect(this.x + 10, this.y + 10, this.w - 20, this.h - 20, 10);

		noStroke();
		fill(221, 221, 223);
		rect(this.x + 12.5, this.y + 12.5, this.w - 25, this.h - 25, 10);

		fill(0);
		text(this.t, this.x + this.w / 2, this.y + this.h / 2);
	}
}

class Connection {
	constructor(source, destination, label = "", id = -1, template = nil) {
		this.source = source;
		this.dest = destination;
		this.label = label;
		this.connID = id + 1;
		this.current = createVector(this.source.x, this.source.y);
		this.complete = false;
		this.x_ready = (this.source.x + this.dest.x) / 2 - textWidth(this.label) / 2 - 5;
		this.active = false;
		this.template = template;
	}

	isSelected() {
		if (!this.complete) return;

		this.active = true;
		this.fill_col = color(162, 140, 232);
		document.getElementById('light').style.display = 'block';
		document.getElementById('fade').style.display = 'block';
		overlay_active = true;

		this.content = document.createElement('div');
		this.content.setAttribute('id', "conn-".concat(this.connID.toString()));
		this.content.innerHTML = readTemplate(this.template);
		document.getElementById('light').appendChild(this.content);
	}

	isDeselected() {
		this.active = false;
		this.fill_col = color(245, 243, 255);
	}

	inBounds(mx, my) {
		let d = dist(mx, my, this.source.x, this.source.y + (30 / 2))
		if (d < 30 / 2) {
			return true;
		}
		return false;
	}

	ease() {
		if (this.complete) return;
		let easing = 0.075;
		let dx = this.dest.x - this.current.x;
		if (abs(dx) >= 4.5) this.current.x += dx * easing;
		else {
			this.current.x = this.dest.x;
			this.complete = true;
		}
	}

	render() {
		stroke(221, 100, 100, 50);
		strokeWeight(5);
		fill(221, 100, 100);

		rect(this.source.x, this.source.y + (30 / 2 - 5 / 2), this.current.x - this.source.x, 5);
		ellipse(this.source.x, this.source.y + (30 / 2), 30, 30);
		this.ease();

		if (this.complete) {
			ellipse(this.current.x, this.dest.y + (30 / 2), 10, 10);
		}

		noStroke();
		fill(255, 175);
		text(this.label, (this.source.x + this.dest.x) / 2, this.source.y);
		text(this.connID.toString(), this.source.x, this.source.y + (30 / 2) - 5 / 2);
	}
}
