/**
* Represents an API search. Executes via jQuery, using promise
* proceeds via a local search proxy. (CORS, etc)
*/
class Search {
  constructor() {
    this.where = {};
    // No paging or unlimited available in this API, so only use 10 results
    this.limit = 10;
    this.BASE_URL = "http://www.asterank.com/api/kepler?";
  }

  /**
   * Static factory method: get a search instance for a given star ID
   * @static
   * @param {Integer} star_id Integer part of a Kepler ID
   * @return {Search}
   */
  static byStar(star_id) {
    var search = new Search();
    search.filterByStar(star_id);
    return search;
  }

  /**
   * Static factory method: get a search instance for a given set of fields
   * @static
   * @param {Object} fields Map<String,Array<Number>>
   * @return {Search}
   */
  static fromFields(fields) {
    var search = new Search();
    search.filterByPlanetTemperature(fields.planet_temperature[0], fields.planet_temperature[1]);
    search.filterByPlanetRadius(fields.planet_radius[0], fields.planet_radius[1]);
    search.filterByOrbitPeriod(fields.orbit_period[0], fields.orbit_period[1]);
    search.filterByOrbitAxis(fields.orbit_axis[0], fields.orbit_axis[1]);
    return search;
  }

  /**
   * Build API URL based on current where object
   * @return {String}
   */
  buildUrl() {
    return this.buildQuery(this.where);
  }

  /**
   * Build API URL based on where clause
   * @param {Object} where
   * @return {String}
   */
  buildQuery(where) {
    var query_param = "query="+JSON.stringify(this.where),
    limit_param = "limit="+this.limit;
    return this.BASE_URL+query_param+"&"+limit_param;
  }

  /**
   * Adjust where clause to filter by a single star ID. Leverages that star
   * integer part of Kepler ID, so star_id and star_id+1 as bounds, return
   * only planets associated with that star
   * @param {Integer} star_id
   * @return {Void}
   */
  filterByStar(star_id) {
    this.minMaxByField("KOI", parseInt(star_id), parseInt(star_id)+1)
  }

  /**
   * Adjust where clause to filter by planet radius between min and max
   * @param {Number} min
   * @param {Number} max
   * @return {Void}
   */
  filterByPlanetRadius(min, max) {
    this.minMaxByField("RPLANET", min, max);
  }

  /**
   * Adjust where clause to filter by planet temperature between min and max
   * @param {Number} min
   * @param {Number} max
   * @return {Void}
   */
  filterByPlanetTemperature(min, max) {
    this.minMaxByField("TPLANET", min, max);
  }

  /**
   * Adjust where clause to filter by orbit period between min and max
   * @param {Number} min
   * @param {Number} max
   * @return {Void}
   */
  filterByOrbitPeriod(min, max) {
    this.minMaxByField("PER", min, max);
  }

  /**
   * Adjust where clause to filter by orbit axis between min and max
   * @param {Number} min
   * @param {Number} max
   * @return {Void}
   */
  filterByOrbitAxis(min, max)  {
    this.minMaxByField("A", min, max);
  }

  /**
   * Adjust where clause to filter by {field} between min and max.
   * API uses limited MongoDB interface, making this the best way to interact.
   * @param {Number} min
   * @param {Number} max
   * @return {Void}
   */
  minMaxByField(field, min, max) {
    this.where[field] = {"$gt": min, "$lt": max};
  }

  /**
   * Execute a search via our Node API proxy
   * @return {Promise<Array<Object>>} API response, an array of planets
   */
  execute() {
    var reflector_url = "/search",
    data = {url: this.buildUrl()};

    return new Promise(function(resolve, reject) {
      $.post(reflector_url, data, function(response) {
          resolve(response);
      });
    });
  }
}