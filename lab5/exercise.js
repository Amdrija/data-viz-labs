


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

async function getData(currency, startDate, endDate) {
	const URLsearchParams = new URLSearchParams({
		from: startDate,
		to: endDate,
		vs_currency: "usd"
	});
	const URL = `https://api.coingecko.com/api/v3/coins/${currency}/market_chart/range?${URLsearchParams.toString()}`

	const result = await fetch(URL);

	if (!result.ok) {
		return {};
	}

	return await result.json()
}

function convertPricingDataToXY(pricingData) {
	return pricingData.map(([x, y]) => { return { x, y } });
}

class LinePlot {
	constructor(containerId, data, brush) {
		this.container = d3.select(`#${containerId}`);
		this.scale = {};
		this.axis = {};
		this.data = data;
		//Add x axis
		this.scale.x = d3.scaleTime()
			.domain([data[0].x, data[data.length - 1].x])
			.range([0, 200]);
		this.axis.x = this.container.append("g")
			.style("transform", "translate(0,90px)")
			.call(d3.axisBottom(this.scale.x));

		//Add y axis
		this.scale.y = d3.scaleLinear()
			.domain([0, data.reduce((max, { x, y }) => max < y ? y : max, 0)])
			.range([90, 0]);
		this.axis.y = this.container.append("g")
			.call(d3.axisLeft(this.scale.y));

		let clip = this.container.append("defs").append("svg:clipPath")
			.attr("id", "clip")
			.append("svg:rect")
			.attr("width", 200)
			.attr("height", 90)
			.attr("x", 0)
			.attr("y", 0);

		this.brush = brush;

		this.line = this.container.append('g')
			.attr("clip-path", "url(#clip)");

		this.data = data;

		const line = d3.line()
			.x((d) => this.scale.x(d.x))
			.y((d) => this.scale.y(d.y))

		this.line
			.append("path")
			.datum(this.data)
			.attr("class", "line")
			.attr('d', line(this.data))
			.attr('stroke', 'white')
			.attr('fill', 'none');
		this.line
			.append("g")
			.attr("class", "brush")
			.call(this.brush);
		this.idleTimeout = null;
	}

	reset() {
		this.scale.x = d3.scaleTime()
			.domain([this.data[0].x, this.data[this.data.length - 1].x])
			.range([0, 200]);
		this.axis.x.transition().call(d3.axisBottom(this.scale.x))
		this.line
			.select('.line')
			.transition()
			.duration(1000)
			.attr("d", d3.line()
				.x((d) => this.scale.x(d.x))
				.y((d) => this.scale.y(d.y))
			)
	}

	idled() {
		this.idleTimeout = null;
	}

	updateChart(extent) {
		// If no selection, back to initial coordinate. Otherwise, update X axis domain
		if (!extent) {
			if (!this.idleTimeout) return this.idleTimeout = setTimeout(() => this.idled(), 350); // This allows to wait a little bit
			this.scale.x.domain([this.data[0].x, this.data[this.data.length - 1].x])
		} else {
			this.scale.x.domain([this.scale.x.invert(extent[0]), this.scale.x.invert(extent[1])])
		}

		// Update axis and line position
		this.axis.x.transition().duration(1000).call(d3.axisBottom(this.scale.x))
		this.line.select('.line')
			.transition()
			.duration(1000)
			.attr("d", d3.line()
				.x((d) => this.scale.x(d.x))
				.y((d) => this.scale.y(d.y))
			)
	}
}

whenDocumentLoaded(() => {
	// prepare the data here
	const now = new Date();
	const year_ago = new Date(new Date().setFullYear(now.getFullYear() - 1));
	let extent;
	const brush = d3.brushX()                   // Add the brush feature using the d3.brush function
		.extent([[0, 0], [200, 90]]);
	let linePlot1, linePlot2;
	let bitcoin = getData("bitcoin", Math.floor(year_ago / 1000), Math.floor(now / 1000)).then((data) => {
		const xyData = convertPricingDataToXY(data.prices);
		linePlot1 = new LinePlot("first-plot", xyData, brush);
	});

	let ethereum = getData("ethereum", Math.floor(year_ago / 1000), Math.floor(now / 1000)).then((data) => {
		const xyData = convertPricingDataToXY(data.prices);
		linePlot2 = new LinePlot("second-plot", xyData, brush);
	});

	Promise.all([bitcoin, ethereum]).then(() => {
		brush.on("end", function () {
			extent = d3.event.selection;
			linePlot1.updateChart(extent);
			linePlot2.updateChart(extent);


			// This remove the grey brush area as soon as the selection has been done
			d3.select(".container").on("dblclick", () => {
				linePlot1.reset();
				linePlot2.reset();
			})
		})
	})
});

