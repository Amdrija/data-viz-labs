
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


// Part 1 - DOM

whenDocumentLoaded(() => {
	// Part 1.1: Find the button + on click event
	let button = document.getElementById("btn-part1");
	button.addEventListener('click', () => {
		// Part 1.2: Write temperatures
		let weatherContainer = document.getElementById("weather-part1");
		showTemperatures(weatherContainer, TEST_TEMPERATURES);
	})
});

function showTemperatures(containerElement, temperatureArray) {
	containerElement.innerHTML = "";
	temperatureArray.forEach((temperature) => {
		let p = document.createElement("p");
		p.innerText = temperature;
		if (temperature >= 23) {
			p.classList.add("warm");
		} else if (temperature <= 17) {
			p.classList.add("cold");
		}
		containerElement.appendChild(p);
	});
}

// Part 2 - class

class Forecast {
	constructor(container) {
		this.container = container;
		this.temperatures = [1, 2, 3, 4, 5, 6, 7];
	}

	toString() {
		return `${this.container.id} : ${this.temperatures.reduce((agg, temp) => `${agg}, ${temp}`), ""}`;
	}

	print() {
		console.log(this.toString);
	}

	show() {
		this.container.innerHTML = "";
		this.temperatures.forEach((temperature) => {
			let p = document.createElement("p");
			p.innerText = temperature;
			if (temperature >= 23) {
				p.classList.add("warm");
			} else if (temperature <= 17) {
				p.classList.add("cold");
			}
			this.container.appendChild(p);
		});
	}

	reload() {
		this.temperatures = TEST_TEMPERATURES;
		this.show();
	}
}

whenDocumentLoaded(() => {
	let button = document.getElementById("btn-part1");
	button.addEventListener('click', () => {
		let weatherContainer = document.getElementById("weather-part2");
		let forecast = new Forecast(weatherContainer);
		forecast.reload();
	})
});

// Part 3 - fetch

const LAUSANNE_LATITUDE = '46.52';
const LAUSANNE_LONGITUDE = '6.63'

function weatherbitToTemperatures(data) {
	return data.daily.temperature_2m_max;
}

function fetchWeather(lattitude, longitude) {
	return fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lattitude}&longitude=${longitude}&daily=temperature_2m_max&timezone=GMT`);
}

class ForecastOnline extends Forecast {
	reload() {
		fetchWeather(LAUSANNE_LATITUDE, LAUSANNE_LONGITUDE)
			.then((response) => response.json())
			.then((data) => {
				this.temperatures = weatherbitToTemperatures(data);
				this.show();
			});
	}
}

whenDocumentLoaded(() => {
	let button = document.getElementById("btn-part1");
	let weatherContainer = document.getElementById("weather-part3");
	let forecastOnline = new ForecastOnline(weatherContainer);
	button.addEventListener('click', () => {
		forecastOnline.reload();
	})
});

// Part 4 - interactive
class ForecastOnlineCity extends ForecastOnline {
	constructor(containerElement) {
		super(containerElement);
		this.city = "Lausanne";
	}

	setCity(city) {
		this.city = city;
	}

	reload() {
		fetch(`https://geocode.maps.co/search?q=${this.city}`)
			.then(response => response.json())
			.then(data => {
				if (data.length > 0) {
					let lattitude = data[0].lat;
					let longitude = data[0].lon;
					fetchWeather(lattitude, longitude)
						.then((response) => response.json())
						.then((data) => {
							this.temperatures = weatherbitToTemperatures(data);
							this.show();
						});
				}
			})

	}
}

whenDocumentLoaded(() => {
	let button = document.getElementById("btn-city");
	let weatherContainer = document.getElementById("weather-city");
	let forecastCity = new ForecastOnlineCity(weatherContainer);
	button.addEventListener('click', () => {
		let cityInput = document.getElementById("query-city");
		if (cityInput.value.length > 0) {
			forecastCity.setCity(cityInput.value);
			forecastCity.reload();
		}
	})
});