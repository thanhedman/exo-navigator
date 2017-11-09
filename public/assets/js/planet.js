/** Represents an individual kepler planet.
* Can be held by Star class, but also unit of search results
* and interaction
*/
class Planet {
  constructor(earth_radii, temperature, axis, period_days, kepler_id) {
      this.planet_id = kepler_id;
      this.star_id = kepler_id.toString().split('.')[0];
      this.earth_radii = earth_radii;
      this.temperature = temperature;
      this.period_days = period_days;
      this.axis = axis;
      this.MERCURY = [177,173,173];
      this.EARTH = [6,79,64];
      this.NEPTUNE = [68,102,127];
      this.JUPITER = [209,167,127];
      this.SCALING_FACTOR = 10;
      this.SUN_EARTH_RATIO = 109;
  }

  /**
   * Static factory method generating an instance
   * from an API response
   * @static
   * @param {Object} response
   * @return {Planet}
   */
  static fromApiResponse(response) {
    return new Planet(
      response.RPLANET,
      response.TPLANET,
      response.A,
      response.PER,
      response.KOI
    )
  }

  /**
   * Get a color for this planet based on temperature and radius
   * @getter
   * @return {Array} color triplet
   */
  get color() {
      return this.getColor(this.temperature, this.earth_radii);
  }

  /**
   * Get display radius in pixels
   * @getter
   * @return {Integer} radius in pixels
   */
  get radius() {
    return this.getRadiusPixels(this.earth_radii);
  }

  /**
   * Get display orbit period in seconds
   * @getter
   * @return {Integer} period in seconds
   */
  get period() {
    return this.getOrbitPeriodSeconds(this.period_days);
  }

  /**
   * Get display orbit radius in pixels
   * @getter
   * @return {Integer} radius in pixels
   */
  get orbit() {
    return this.getOrbitPixels(this.axis);
  }

  /**
   * Get best guess planet type string
   * @getter
   * @return {String} Sub-Earth|Terran|Super-Earth|Ice Giant|Gas Giant
   */
  get type() {
    return this.getProbablePlanetType(this.earth_radii);
  }

  /**
   * Find all planets associated with this one's star and render the
   * solar system. Designate this planet as selected on the canvas.
   * @param {Canvas} canvas
   * @return {Promise<Star>}
   */
  showSolarSystem(canvas) {
    canvas.setFocus(this.planet_id);
    return this.findStar()
    .then((response) => {
      return Promise.resolve(Star.fromApiResponse(response))
    })
    .then((star) => {
      star.draw(canvas, this.planet_id);
      return Promise.resolve(star);
    })
  }

  /**
   * Search for all planets associated with this one's star
   * @return {Promise<Array<Object>>}
   */
  findStar() {
    return Search.byStar(this.star_id)
    .execute();
  }

  /**
   * Calculate radius pixels for a planet-based on earth_radii
   * 109 is the ratio of earth to sun radius, so SCALING_FACTOR
   * is a positive integer to allow small planets to be visible
   * @param {Double} earth_radii
   * @return {Integer}
   */
  getRadiusPixels(earth_radii) {
    // Planets are scaled up to 10x their effective scale to be shown alongside stars
    return Math.round(
      earth_radii/(this.SUN_EARTH_RATIO/this.SCALING_FACTOR)*Utilities.getRadiusScale()
    );
  }

  /**
   * Calculate orbit radius pixels for a planet-based on axis_au
   * Sets a standard pixel radius for Earth's orbit
   * @param {Double} axis_au
   * @return {Integer}
   */
  getOrbitPixels(axis_au) {
    return Math.round(axis_au * Utilities.getOrbitScale());
  }

  /**
   * Get best guess planet type string based on radius.
   * In reality, mass would improve the guess, but is not apparent
   * in Kepler data.
   * @param {Double} earth_radii
   * @return {String} Sub-Earth|Terran|Super-Earth|Ice Giant|Gas Giant
   */
  getProbablePlanetType(earth_radii) {
    if (earth_radii < 0.75) {
        return "Sub-Earth";
    } else if (earth_radii < 1.5) {
        return "Terrestrial";
    } else if (earth_radii < 2.5) {
        return "Super-Earth";
    } else if (earth_radii < 8) {
        return "Ice Giant";
    }
    return "Gas Giant";
  }

  /**
   * Get a color for this planet based on temperature and radius.
   * If the planet is hot enough to glow red, just use the blackbody-color
   * (like a star), otherwise use planet type analogies to our solar system.
   * @param {Integer} temperature Equilibrium temperature in Kelvin
   * @param {Double} earth_radii Planet radius relative to earth
   * @return {Array} color triplet
   */
  getColor(temperature, earth_radii) {
    // If temperature is reasonably high, color will be governed by blackbody emissions
    if (temperature > 1000) return Utilities.getColor(temperature);

    // Otherwise, color according to planetary radius: grey for sub-earth, blue-green for earth-like, blue-grey
    // for ice-giants, orange-brown for gas-giants
    var color_map = {
      "Sub-Earth": this.MERCURY,
      "Terrestrial": this.EARTH,
      "Super-Earth": this.EARTH,
      "Ice Giant": this.NEPTUNE,
      "Gas Giant": this.JUPITER
    };
    return color_map[this.type];
  }

  /**
   * Get display orbit period in seconds from period in days.
   * Right now calculated as 1:1, which works well for this data.
   * @param {Double} period_days
   * @return {Integer} period in seconds
   */
  getOrbitPeriodSeconds(period_days) {
    return this.period_days;
  }
}