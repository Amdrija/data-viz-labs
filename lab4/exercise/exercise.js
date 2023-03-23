


/*
	Run the action when we are sure the DOM has been loaded
	https://developer.mozilla.org/en-US/docs/Web/Events/DOMContentLoaded
	Example:
	whenDocumentLoaded(() => {
		console.log('loaded!');
		document.getElementById('some-element');
	});
*/
function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else {
		// `DOMContentLoaded` already fired
		action();
	}
}

const TEST_TEMPERATURES = [13, 18, 21, 19, 26, 25, 16];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

//const MARGIN = { top: 10, right: 10, bottom: 10, left: 10 };


class ScatterPlot {
	/* your code here */
	constructor(containerId, data) {
		this.container = d3.selectAll(`#${containerId}`);
		this.data = data;
		this.scale = {};
		this.scale.x = d3.scalePoint()
			.domain(DAYS)
			.range([0, 200]);
		this.scale.y = d3.scaleLinear()
			.domain([0, d3.max(TEST_TEMPERATURES)])
			.range([90, 0]);
	}

	show() {
		const xAxis = d3.axisBottom().scale(this.scale.x)
		const yAxis = d3.axisLeft().scale(this.scale.y).ticks(6)
		this.container
			.selectAll("circle")
			.data(this.data)
			.enter()
			.append("circle")
			.attr("cx", (d) => this.scale.x(d.name))
			.attr("cy", (d) => this.scale.y(d.y))
			.classed("cold", (d) => d.y <= 17)
			.classed("warm", (d) => d.y >= 23)
			.attr("r", 2.5);
		this.container.append("g")
			.call(yAxis);
		this.container.append("g")
			.style("transform", "translate(0,90px)")
			.call(xAxis);
	}
}

class BarPlot {
	/* your code here */
	constructor(containerId, data) {
		this.container = d3.select(`#${containerId}`);
		this.data = data;
		this.scale = {};
		this.scale.x = d3.scaleBand()
			.padding(0.4)
			.domain(DAYS)
			.range([0, 200]);
		this.scale.y = d3.scaleLinear()
			.domain([0, d3.max(TEST_TEMPERATURES)])
			.range([90, 0]);
	}

	show() {
		const xAxis = d3.axisBottom().scale(this.scale.x)
		const yAxis = d3.axisLeft().scale(this.scale.y).ticks(6)
		this.container
			.selectAll("bar")
			.data(this.data)
			.enter()
			.append("rect")
			.attr("x", (d) => this.scale.x(d.name))
			.attr("y", (d) => this.scale.y(d.y))
			.attr("width", "15")
			.attr("height", (d) => 90 - this.scale.y(d.y))
			.classed("cold", (d) => d.y <= 17)
			.classed("warm", (d) => d.y >= 23)
			.attr("r", 2.5);
		this.container.append("g")
			.call(yAxis);
		this.container.append("g")
			.style("transform", "translate(0,90px)")
			.call(xAxis);
	}
}

whenDocumentLoaded(() => {
	// prepare the data here
	const data = TEST_TEMPERATURES.map((t, index) => { return { x: index, y: t, name: DAYS[index] } });

	const scatterPlot = new ScatterPlot('scatter-plot', data);
	scatterPlot.show();

	const barPlot = new BarPlot('bar-plot', data);
	barPlot.show();
});

