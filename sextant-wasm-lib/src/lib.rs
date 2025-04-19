//! WebAssembly wrapper for the [sextant library](https://github.com/linuskmr/sextant-rs).

use angle::{Angle, Degrees};
use sextant::*;
use wasm_bindgen::prelude::wasm_bindgen;

/// The results of a sextant calculation.
#[wasm_bindgen]
#[derive(Debug)]
pub struct WasmSextantCalculationResults {
    /// Latitude in degrees
    pub latitude_angle: f64,
    /// `N` for North or `S` for South
    pub latitude_hemisphere: char,
    /// Longitude in degrees
    pub longitude_angle: f64,
    /// `E` for East or `W` for West
    pub longitude_hemisphere: char,
}

#[wasm_bindgen]
impl WasmSextantCalculationResults {
    /// Calculates the latitude and longitude of a sextant measurement.
    #[wasm_bindgen(constructor)]
    pub fn new(
        measurement_unix_timestamp: f64,
        elevation_degrees: f64,
        index_error_degrees: f64,
    ) -> Self {
        let sm = SextantMeasurement {
            culmination_time: chrono::DateTime::<chrono::Utc>::from_timestamp(
                (measurement_unix_timestamp / 1000.0) as i64,
                ((measurement_unix_timestamp % 1000.0) * 1_000_000.0) as u32,
            )
            .unwrap(),
            elevation: Angle::from(Degrees(elevation_degrees)),
            index_error: Angle::from(Degrees(index_error_degrees)),
        };

        let latitude = sm.calculate_latitude();
        let latitude_angle = Degrees::from(latitude.raw_angle).0.abs();
        let latitude_hemisphere = match latitude.hemisphere() {
            sextant::hemisphere::Latitude::North => 'N',
            sextant::hemisphere::Latitude::South => 'S',
        };

        let longitude = sm.calculate_longitude();
        let longitude_angle = Degrees::from(longitude.raw_angle).0.abs();
        let longitude_hemisphere = match longitude.hemisphere() {
            sextant::hemisphere::Longitude::East => 'E',
            sextant::hemisphere::Longitude::West => 'W',
        };

        WasmSextantCalculationResults {
            latitude_angle,
            latitude_hemisphere,
            longitude_angle,
            longitude_hemisphere,
        }
    }
}

// Conversion helpers

#[wasm_bindgen]
pub fn deg_to_rad(deg: f64) -> f64 {
    angle::Radians::from(Angle::from(angle::Degrees(deg))).0
}

#[wasm_bindgen]
pub fn rad_to_deg(rad: f64) -> f64 {
    angle::Degrees::from(Angle::from(angle::Radians(rad))).0
}

#[wasm_bindgen]
pub fn deg_to_degrees_fraction(deg: f64) -> i32 {
    angle::DegreeMinutesSeconds::from(Angle::from(Degrees(deg))).degrees
}

#[wasm_bindgen]
pub fn deg_to_minutes_fraction(deg: f64) -> i32 {
    angle::DegreeMinutesSeconds::from(Angle::from(Degrees(deg))).minutes
}

#[wasm_bindgen]
pub fn deg_to_seconds_fraction(deg: f64) -> f64 {
    angle::DegreeMinutesSeconds::from(Angle::from(Degrees(deg))).seconds
}

#[wasm_bindgen]
pub fn deg_to_deg_min_sec_string(deg: f64) -> String {
    let dms = angle::DegreeMinutesSeconds::from(Angle::from(Degrees(deg)));
    dms.to_string()
}

#[wasm_bindgen]
pub fn degree_minutes_seconds_to_deg_float(degrees: i32, minutes: i32, seconds: f64) -> f64 {
    let dms = angle::DegreeMinutesSeconds {
        degrees,
        minutes,
        seconds,
    };
    angle::Degrees::from(Angle::from(dms)).0
}

pub fn set_panic_hook() {
    // When the `console_error_panic_hook` feature is enabled, we can call the
    // `set_panic_hook` function at least once during initialization, and then
    // we will get better error messages if our code ever panics.
    //
    // For more details see
    // https://github.com/rustwasm/console_error_panic_hook#readme
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}
