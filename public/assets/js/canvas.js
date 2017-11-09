/**
* Represents application canvas element.
* Handles animation and rendering.
*/
class Canvas {
  constructor(canvas_element, container_element) {
    this.canvas_element = canvas_element;
    this.height;
    this.width;
    this.$container_element = container_element;
    this.determineSize();
    this.context = this.canvas_element.getContext('2d');
    this.planets = {};
    this.EARTH_ORBIT_PIXELS = Utilities.getOrbitScale();
    this.largest_orbit = this.EARTH_ORBIT_PIXELS;
    this.scale = 1;
    this.focus_planet_id;
    this.star;
  }

  /**
   * Static factory method: get the default canvas for exoplanet.html
   * @static
   * @return {Canvas}
   */
  static getDefault() {
    var canvas_element = document.getElementById("canvas"),
    container_element = $("#container"),
    canvas = new Canvas(canvas_element, container_element);
    return canvas;
  }

  /**
   * Calculate size parameters for this instance based on its container
   * and pass those values to the <canvas> element itself.
   * @return {Void}
   */
  determineSize() {
    this.height = this.$container_element.height();
    this.width = this.$container_element.width();
    this.canvas_element.height = this.height;
    this.canvas_element.width = this.width;
  }

  /**
   * Set the bodies which this canvas will render
   * @param {Star} star
   * @param {Array<planets>}
   * @return {Void}
   */
  setBodies(star, planets) {
    this.star = star;
    this.planets = planets;
  }

  /**
   * Set the planet which will receive focus
   * @param {Double} planet_id KOI
   * @return {Void}
   */
  setFocus(planet_id) {
    this.focus_planet_id = planet_id;
  }

  /**
   * Convert a three-member array of RGB values to an RGB string
   * @param {Array<Int>} rgb_array RGB triple
   * @return {String} #-prefixed hex RGB string
   */
  getHexColor(rgb_array) {
    var hex_color = "#";
    for (var component of rgb_array) {
      var hex_component = component.toString(16);
      hex_color += hex_component.length == 1 ? "0" + hex_component : hex_component;
    }
    return hex_color;
  }

  /**
   * Erase all pixels on the canvas
   * @return {Void}
   */
  clear() {
    this.context.clearRect(0, 0, this.width / this.scale, this.height / this.scale);
  }

  /**
   * Draw the black of space as a background over whole canvas
   * @return {Void}
   */
  drawSpace() {
    this.context.beginPath();
    this.context.rect(0, 0, this.width / this.scale, this.height / this.scale);
    this.context.fillStyle = "black";
    this.context.fill();
  }

  /**
   * Draw a centered star on the canvas
   * @param {Integer} radius Pixel radius
   * @param {Array<Int>} color RGB triple
   * @return {Void}
   */
  drawStar(radius, color) {
    var hex_color = this.getHexColor(color);
    this.context.beginPath();
    this.context.arc(this.getCenterX(), this.getCenterY(), radius, 0, 2*Math.PI);
    this.context.fillStyle = hex_color;
    this.context.fill();
  }

  /**
   * Draw a centered orbit on the canvas
   * @param {Array<Int>} color RGB triple
   * @param {Integer} radius Pixel radius
   * @return {Void}
   */
  drawOrbit(radius, color) {
    this.context.beginPath();
    this.context.arc(this.getCenterX(), this.getCenterY(), radius, 0, 2*Math.PI);
    this.context.strokeStyle = color;
    this.context.stroke();
  }

  /**
   * Draw and label earth's orbit for scale, in blue
   * @return {Void}
   */
  drawScaleOrbit() {
    this.drawOrbit(Utilities.getOrbitScale(), "blue");
    this.context.font = "24px Helvetica";
    this.context.fillStyle = "white";
    this.context.textAlign = "center";
    this.context.fillText("Earth's Orbit", this.getCenterX()+560, this.getCenterY());
  }

  /**
   * Draw the solar system for this instance
   * including delegating animation.
   * @return {Void}
   */
  drawSolarSystem() {
    this.setScale();
    this.clear();
    this.drawSpace();
    this.drawStar(this.star.radius, this.star.color);
    this.drawPlanets();
    this.drawScaleOrbit();
    window.requestAnimationFrame(() => {
      this.drawSolarSystem();
    });
  }

  /**
   * Draw the planets for this instance, including their orbits.
   * Draw a highlighted orbit for the focused planet.
   * @return {Void}
   */
  drawPlanets() {
    for (var planet_id in this.planets) {
      var planet = this.planets[planet_id],
      focus = planet_id == this.focus_planet_id;
      this.drawOrbit(planet.orbit, focus ? "#00c394" : "white");
      this.drawPlanet(planet.orbit, planet.radius, planet.color, planet.period, focus);
    }
  }

  /**
   * Draw an individual planet, highlighted if it's focused
   * @param {Integer} orbit_radius Pixel orbit radius
   * @param {Array<Int>} color RGB triple
   * @param {Integer} radius Pixel radius
   * @param {Integer} orbit_period Orbit period in seconds
   * @param {Boolean} focus Is the the focused planet
   * @return {Void}
   */
  drawPlanet(orbit_radius, planet_radius, color, orbit_period, focus) {
    var hex_color = this.getHexColor(color),
    time = new Date(),
    angle = ((2 * Math.PI) / (orbit_period*1000)) * time.getTime();
    this.context.beginPath();
    this.context.arc(this.getCenterX()+(Math.cos(angle)*orbit_radius), this.getCenterY()+(Math.sin(angle)*orbit_radius), planet_radius, 0, 2*Math.PI);
    this.context.fillStyle = hex_color;
    this.context.fill();
    // Draw a halo if focused
    if (focus) {
      this.context.lineWidth = 2;
      this.context.strokeStyle = "rgba(255, 240, 240, 0.7)";
      this.context.stroke();
      this.context.lineWidth = 1;
    }
  }

  /**
   * Set the scale for this canvas instance based on the orbits to be rendered.
   * Scale the context down if too large, or container too small, otherwise reset.
   * @return {Void}
   */
  setScale() {
    this.largest_orbit = this.EARTH_ORBIT_PIXELS;
    for (var planet_id in this.planets) {
      var planet = this.planets[planet_id];
      if (planet.orbit > this.largest_orbit) {
        this.largest_orbit = planet.orbit;
      }
    }
    if (this.largest_orbit > this.width * 0.95 * 0.5 / this.scale) {
      this.scale = this.width * 0.95 * 0.5 / this.largest_orbit;
      this.context.scale(this.scale, this.scale);
    } else if (this.scale < 1 && this.largest_orbit <= this.width * 0.95 * 0.5) {
      this.scale = 1;
      this.context.setTransform(1, 0, 0, 1, 0, 0);
    }

  }

  /**
   * Find the scaled center of this canvas on the x-axis
   * @return {Integer}
   */
  getCenterX() {
    return Math.round(this.canvas_element.width/2/this.scale);
  }

  /**
   * Find the scaled center of this cans on the y-axis
   * @return {Integer}
   */
  getCenterY() {
    return Math.round(this.canvas_element.height/2/this.scale);
  }

}