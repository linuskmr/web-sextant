// From https://gml.noaa.gov/grad/solcalc/solareqns.PDF

const pi = Math.PI;

// Calculates the days since the start of the year.
// From https://stackoverflow.com/a/8619946/14350146
function dayOfYear(date) {
	const now = new Date();
	const start = new Date(now.getFullYear(), 0, 0);
	const diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
	const oneDay = 1000 * 60 * 60 * 24;
	const day = Math.floor(diff / oneDay);
	return day
}

// Function to calculate fractional year (gamma) in radians
function calculateFractionalYear(dayOfYear, hour, leapYear = false) {
    const denominator = leapYear ? 366 : 365;
    return (2 * pi / denominator) * (dayOfYear - 1 + (hour - 12) / 24);
}

// Function to calculate equation of time (eqtime) in minutes
function calculateEquationOfTime(gamma) {
    return 229.18 * (
        0.000075 +
        0.001868 * Math.cos(gamma) -
        0.032077 * Math.sin(gamma) -
        0.014615 * Math.cos(2 * gamma) -
        0.040849 * Math.sin(2 * gamma)
    );
}

// Function to calculate solar declination angle (decl) in radians
function calculateSunDeclination(gamma) {
    return (
        0.006918 -
        0.399912 * Math.cos(gamma) +
        0.070257 * Math.sin(gamma) -
        0.006758 * Math.cos(2 * gamma) +
        0.000907 * Math.sin(2 * gamma) -
        0.002697 * Math.cos(3 * gamma) +
        0.00148 * Math.sin(3 * gamma)
    );
}

// Function to calculate time offset in minutes
function calculateTimeOffset(eqtime, longitude, timezone) {
    return eqtime + 4 * longitude - 60 * timezone;
}

// Function to calculate true solar time (tst) in minutes
function calculateTrueSolarTime(hour, minute, second, timeOffset) {
    return hour * 60 + minute + second / 60 + timeOffset;
}

// Function to calculate solar hour angle (ha) in degrees
function calculateHourAngle(tst) {
    return (tst / 4) - 180;
}

// Function to calculate solar zenith angle (phi) in radians
function calculateSolarZenithAngle(lat, decl, hourAngle) {
    const latRad = lat * (pi / 180);
    const hourAngleRad = hourAngle * (pi / 180);
    return Math.acos(
        Math.sin(latRad) * Math.sin(decl) +
        Math.cos(latRad) * Math.cos(decl) * Math.cos(hourAngleRad)
    );
}

// Function to calculate solar azimuth angle (theta) in degrees clockwise from north
function calculateSolarAzimuthAngle(lat, decl, solarZenithAngle, hourAngle) {
    const latRad = lat * (pi / 180);
    const hourAngleRad = hourAngle * (pi / 180);
    const thetaRad = Math.acos(
        (Math.sin(latRad) * Math.cos(solarZenithAngle) -
         Math.sin(decl)) /
        (Math.cos(latRad) * Math.sin(solarZenithAngle))
    );

    return hourAngle > 0 ? (360 - thetaRad * (180 / pi)) : (thetaRad * (180 / pi));
}


// Function to calculate hour angle (ha) for sunrise or sunset in degrees
function calculateHourAngleForSunriseOrSunset(lat, decl) {
	const zenith = 90.833; // Zenith angle for sunrise/sunset, in degrees

    const latRad = lat * (pi / 180);
    const declRad = decl; // decl is already in radians
    const zenithRad = zenith * (pi / 180);

    const cosHA = (Math.cos(zenithRad) / (Math.cos(latRad) * Math.cos(declRad))) - Math.tan(latRad) * Math.tan(declRad);

    // Return both positive and negative values for sunrise and sunset
    const hourAngleSunrise = Math.acos(cosHA) * (180 / pi); // Convert to degrees
    const hourAngleSunset = -hourAngleSunrise; // Sunset is the negative hour angle
    return { hourAngleSunrise, hourAngleSunset };
}

// Function to calculate sunrise or sunset time in UTC minutes
function calculateSunriseSunset(longitude, ha, eqtime) {
    return 720 - 4 * (longitude + ha) - eqtime;
}

// Function to calculate solar noon in UTC minutes
function calculateSolarNoon(longitude, eqtime) {
    return 720 - 4 * longitude - eqtime;
}

function dateFromUtcMinutes(minutes) {
	const date = new Date()
	date.setUTCHours(Math.floor(minutes / 60))
	date.setUTCMinutes(minutes % 60)
	date.setUTCSeconds(0)
	return date
}


let latitude = NaN
let longitude = NaN
let date = NaN

function updateDomInputs() {
	document.getElementById("latitude").value = latitude
	document.getElementById("longitude").value = longitude
	document.getElementById("date").value = new Date().toISOString().slice(0, 10)
}

function updateVariablesInputs() {
	latitude = Number.parseFloat(document.getElementById("latitude").value)
	longitude = Number.parseFloat(document.getElementById("longitude").value)
	date = new Date(document.getElementById("date").value)
}

if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
        (position) => {
			latitude = position.coords.latitude
			longitude = position.coords.longitude
			date = new Date()

			updateDomInputs()
            calculateAndUpdateDOM()
        },
        (error) => {
            alert("Error obtaining geolocation:", error.message)
        }
    );
} else {
    alert("Geolocation is not supported by this browser.")
}

document.getElementById("latitude").addEventListener("keyup", () => {
	updateVariablesInputs()
	calculateAndUpdateDOM()
})
document.getElementById("longitude").addEventListener("keyup", () => {
	updateVariablesInputs()
	calculateAndUpdateDOM()
})
document.getElementById("date").addEventListener("keyup", () => {
	updateVariablesInputs()
	calculateAndUpdateDOM()
})

function calculateAndUpdateDOM() {
	const fractionalYear = calculateFractionalYear(dayOfYear(date), date.getUTCHours?.())
	const equationOfTime = calculateEquationOfTime(fractionalYear);
	const sunDeclinationRad = calculateSunDeclination(fractionalYear);
	const sunDeclinationDeg = sunDeclinationRad * (180/pi);
	const timeOffset = calculateTimeOffset(equationOfTime, longitude, date.getTimezoneOffset?.())
	const trueSolarTime = calculateTrueSolarTime(12, 0, 0, timeOffset)
	const hourAngle = calculateHourAngle(trueSolarTime)
	const solarZenithElevationAngleRad = calculateSolarZenithAngle(latitude, sunDeclinationRad, hourAngle)
	const solarZenithElevationAngleDeg = solarZenithElevationAngleRad * (180/pi)
	const solarZenithAzimuthAngleDeg = calculateSolarAzimuthAngle(latitude, sunDeclinationRad, solarZenithElevationAngleRad, hourAngle)

	// Sunrise/sunset
	const { hourAngleSunrise, hourAngleSunset } = calculateHourAngleForSunriseOrSunset(latitude, sunDeclinationRad);
	const sunrise = dateFromUtcMinutes(calculateSunriseSunset(longitude, hourAngleSunrise, equationOfTime));
	const sunset = dateFromUtcMinutes(calculateSunriseSunset(longitude, hourAngleSunset, equationOfTime));
	const solarNoon = dateFromUtcMinutes(calculateSolarNoon(longitude, equationOfTime));

	const dl = document.createElement("dl")
	for (const [key, value] of Object.entries({"Sunrise": sunrise, "Solar Noon / Zenith Time": solarNoon, "Sunset": sunset, "Zenith Elevation Angle": solarZenithElevationAngleDeg, "Zenith Azimuth Angle": solarZenithAzimuthAngleDeg, "Sun Declination": sunDeclinationDeg})) {
		const dt = document.createElement("dt")
		dt.innerText = key

		const dd = document.createElement("dd")
		if (value instanceof Date) {
			dd.innerText = value.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', timeZoneName: 'shortOffset' }).replace('GMT', 'UTC')
		} else {
			dd.innerText = value
		}

		dl.appendChild(dt)
		dl.appendChild(dd)
	}
	document.getElementById("results").innerHTML = "" // Remove all children
	document.getElementById("results").appendChild(dl)
}
calculateAndUpdateDOM()