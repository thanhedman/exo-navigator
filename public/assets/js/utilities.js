/**
* Static utility methods
*/

class Utilities {
  /**
  * Adapted from https://github.com/neilbartlett/color-temperature
  * Magic numbers from original source.
  * Map from a blackbody temperature (of e.g. a planet or star) to an RGB triplet
  * @static
  * @param {Integer} temperature Blackbody temperature in Kelvin
  * @return {Array<Integer>} RGB triplet bounded 0, 255
  */
  static getColor(temperature) {
      var adjusted_temperature = temperature / 100,
      red,
      green,
      blue,
      rgb_array = [];

      if (adjusted_temperature < 66.0) {
        red = 255;
      } else {
        red = adjusted_temperature - 55.0;
        red = 351.97690566805693+ 0.114206453784165 * red - 40.25366309332127 * Math.log(red);
      }

      rgb_array.push(red);

      /* Calculate green */

      if (adjusted_temperature < 66.0) {
        green = adjusted_temperature - 2;
        green = -155.25485562709179 - 0.44596950469579133 * green + 104.49216199393888 * Math.log(green);
      } else {
        green = adjusted_temperature - 50.0;
        green = 325.4494125711974 + 0.07943456536662342 * green - 28.0852963507957 * Math.log(green);
      }

      rgb_array.push(green);

      /* Calculate blue */

      if (adjusted_temperature >= 66.0) {
        blue = 255;
      } else {
        if (adjusted_temperature <= 20.0) {
          blue = 0;
        } else {
          blue = adjusted_temperature - 10;
          blue = -254.76935184120902 + 0.8274096064007395 * blue + 115.67994401066147 * Math.log(blue);
        }
      }
      rgb_array.push(blue);

      // Normalize values to fall in RGB range
      return rgb_array.map((value) => {
          var integer_value = Math.round(value);
          if (integer_value > 255) return 255;
          if (integer_value < 0) return 0;
          return integer_value;
      });
  }

  /**
  * Two parameter round in the style of PHP
  * @static
  * @param Number number
  * @param Integer precision number of decimal places
  * @return Number rounded number
  */
  static round(number, precision) {
    var factor = Math.pow(10, precision),
    temp_number = number * factor,
    rounded_temp_number = Math.round(temp_number);
    return rounded_temp_number / factor;
  }

  /**
  * Get the application's scale for celestial radii
  * @static
  * @return Number
  */
  static getRadiusScale() {
    return 36;
  }

  /**
  * Get the application's scale for celestial orbits
  * @static
  * @return Number
  */
  static getOrbitScale() {
    return 600;
  }
}