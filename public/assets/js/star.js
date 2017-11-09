/**
* Represents an individual Kepler star
* contains stellar attributes and Planet objects
*/
class Star {
  constructor(sol_radii, temperature, kepler_id) {
    this.star_id = kepler_id;
    this.sol_radii = sol_radii;
    this.temperature = temperature;
    this.planets = {};
  }

  /**
   * Get display radius in pixels
   * @getter
   * @return {Integer} radius in pixels
   */
  get radius() {
    return this.getRadiusPixels(this.sol_radii);
  }

  /**
   * Get a color for this star based on temperature
   * @getter
   * @return {Array} color triplet
   */
  get color () {
    return this.getColor(this.temperature);
  }

  /**
   * Static factory method: get a star instance from an API response, including
   * associated planets.
   * @static
   * @param {Array<Object>} response
   * @return {Star}
   */
  static fromApiResponse(response) {
    var first_planet = response[0],
    star = new Star(
      first_planet.RSTAR,
      first_planet.TSTAR,
      // Integer part of a KOI represents the star
      first_planet.KOI.toString().split(".")[0]
    );
    // Build planets
    for (var planet_response of response) {
      star.planets[planet_response.KOI] = Planet.fromApiResponse(planet_response);
    }

    return star;
  }

  /**
   * Draw this star on a canvas instance.
   * @return {Void}
   */
  draw(canvas) {
    canvas.setBodies(this, this.planets);
    canvas.drawSolarSystem();
  }

  /**
   * Calculate radius pixels for a star-based on sol_radii
   * @param {Double} earth_radii
   * @return {Integer}
   */
  getRadiusPixels(sol_radii) {
    return sol_radii*Utilities.getRadiusScale();
  }

  /**
   * Get a color for this planet based on temperature.
   * A star's color can reasonably be approximated as a blackbody.
   * @param {Integer} temperature Stellar temperature in Kelvin
   * @return {Array} color triplet
   */
  getColor(temperature) {
    return Utilities.getColor(temperature);
  }
}