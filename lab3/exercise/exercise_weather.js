
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

const TEST_TEMPERATURES = [13, 18, 21, 19, 26, 25,16];


// Part 1 - DOM

whenDocumentLoaded(() => {
	// Part 1.1: Find the button + on click event


	// Part 1.2: Write temperatures
});

// Part 2 - class

class Forecast {

}

// Part 3 - fetch

const QUERY_LAUSANNE = 'http://api.weatherbit.io/v2.0/forecast/daily?city=Lausanne&days=7&key=ed330abe3f5a4104afd9a6ef10b707ca';

function weatherbitToTemperatures(data) {
}

class ForecastOnline extends Forecast {
}

// Part 4 - interactive

