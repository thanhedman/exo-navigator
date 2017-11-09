/**
* Represents state of user interaction via front-end and
* listens for and delegates user actions. Holds current applicatin state.
*/
class ViewModel {
  constructor(canvas) {
    this.setResizeListener();
    this.current_star;
    this.selected_planet;
    this.canvas = canvas;
    this.planet_results = [];
    this.$input_elements;
    this.search_fields;
    this.$information_element;
    this.$results_element;
  }

  /**
  * Intitialize DOM objects and submit default search
  * @return {Void}
  */
  init() {
    this.$input_elements = this.getInputElements();
    this.search_fields = this.getSearchFields();
    this.$information_element = this.getInformationElement();
    this.$results_element = this.getResultsElement();
    this.submit();
  }

  /**
  * Build input elements and return references to them
  * @return {Array<jQuery>}
  */
  getInputElements() {
    var $form = $('#search_filters_form'),
    elements = [];

    elements.push(this.setSlider("planet_temperature", 150, 1500, [225, 285]));
    elements.push(this.setSlider("planet_radius", 0.1, 100, [0.7, 2]));
    elements.push(this.setSlider("orbit_period", 1, 600, [1, 600]));
    elements.push(this.setSlider("orbit_axis", 0.1, 10, [0.1, 10]));

    return elements;
  }

  /**
  * Build object of search parameters {field_name: value}
  * @return {Object}
  */
  getSearchFields() {
    var fields = {}
    for (var input of this.$input_elements) {
      fields[this.getFieldName(input)] = this.getValue(input);
    }
    return fields;
  }

  /**
  * Update search field with new value and submit, based on jquery UI object.
  * @param {jQueryUI} ui_object
  * @return {Void}
  */
  updateSearchField(ui_object) {
    this.search_fields[this.getFieldName(ui_object)] = this.getValue(ui_object);
    this.submit();
  }

  /**
  * Build a slider on DOM object with ID id, setting min, max, and starting
  * values.
  * @param {String} id
  * @param {Number} minimum
  * @param {Number} maximum
  * @param {Array<Number>} starting_values
  * @return {jQuery}
  */
  setSlider(id, minimum, maximum, starting_values) {
    var slider = $("#"+id).slider({
      range: true,
      min: minimum,
      max: maximum,
      values: starting_values,
      slide: (event, ui) => {
        this.updateSearchField($("#"+id));
        this.displaySliderValues(id, ui.values);
      }
    });
    this.displaySliderValues(id, starting_values);
    return slider;
  }

  /**
  * Update display of current slider values
  * @param {String} id
  * @param {Array<Number>} values
  * @return {Void}
  */
  displaySliderValues(id, values) {
    $("#"+id+"_value").val(values[0] + " - " + values[1]);
  }

  /**
  * Submit search based on current parameters
  * @return {Promise<ViewModel>}
  */
  submit() {
    var search = this.buildSearch();
    return this.search(search);
  }

  /**
  * Submit search based on provided search object.
  * If no planet is selected, select the first one.
  * @param {Search} search
  * @return {Promise<ViewModel>}
  */
  search(search) {
    return search.execute()
    .then((response) => {
      return Promise.resolve(response.map(Planet.fromApiResponse));
    })
    .then((results) => {
      this.planet_results = results;
      this.updateSearchResults();
      return Promise.resolve(this);
    })
    .then((_) => {
      if (typeof this.current_star === 'undefined') {
        return this.select(this.planet_results[0]);
      }
      return Promise.resolve(this);
    });
  }

  /**
  * Select a planet, displaying it as focused and providing contextual
  * information.
  * @param {Planet}
  * @return {Promise<ViewModel>}
  */
  select(planet) {
    return planet.showSolarSystem(this.canvas)
    .then((star) => {
      this.selected_planet = planet;
      this.current_star = star;
      this.displayInformation();
      this.focusSearchResult();
      return Promise.resolve(this);
    })
  }

  /**
  * Build a search based on current values of this object.
  * @return {Search}
  */
  buildSearch() {
    return Search.fromFields(this.search_fields);
  }

  /**
  * Get a field's name from input id.
  * @param {jQuery} input
  * @return {String}
  */
  getFieldName(input) {
    return input.attr('id');
  }

  /**
  * Get a field's value from a DOM handle or UI event object.
  * @param {jQuery|jQueryUI} ui_object
  * @return {Array<Number>}
  */
  getValue(ui_object) {
    if (typeof ui_object.values !== 'undefined') {
      return ui_object.values;
    } else {
      return ui_object.slider("values");
    }
  }

  /**
  * Get the search results DOM element as jquery;
  * @return {jQuery}
  */
  getResultsElement() {
    return $('#search_results_list');
  }

  /**
  * Get the system information DOM element as jquery;
  * @return {jQuery}
  */
  getInformationElement() {
    return $('#system_information');
  }

  /**
  * Update search results for reflect this instance's planet results.
  * Render results list and update result_count to match.
  * @return {Void}
  */
  updateSearchResults() {
    var result_count = this.planet_results.length;
    this.$results_element.html('');
    this.$results_element.siblings('h3').text("Top "+result_count+" Matches")
    for (var planet of this.planet_results) {
      this.$results_element.append(
        this.buildResult(planet)
      );
    }
  }

  /**
  * Build search result DOM object representing a planet.
  * Leverages bootstrap tooltip and on click select action
  * @param {Planet} planet
  * @return {jQuery}
  */
  buildResult(planet) {
    return $('<li>')
    .addClass("planet_result")
    .data("planet_id", planet.planet_id)
    .attr("id", this.planetIdToHtmlId(planet.planet_id))
    .attr("title", planet.type+": "+planet.temperature+"K, "+Utilities.round(planet.axis, 2)+" AU, "+planet.earth_radii+" R⊕")
    .text("Kepler Planet "+planet.planet_id)
    .on('click', (e) => {
      this.select(planet);
    })
    .tooltip()
  }

  /**
  * Display all information for currently selected planet, including star
  * information and planet siblings. Set select action for planets.
  * @return {Void}
  */
  displayInformation() {
    this.$information_element
    .html('')
    .append(
      $('<h2>').text("Information")
    )
    .append(
      $('<h3>').text("Star")
    )
    .append(
      $('<div>')
      .addClass('panel')
      .addClass('panel-info')
      .append(
        $('<h4>').text("Kepler Star "+this.current_star.star_id)
      )
      .append(
        $('<p>').text("Temperature: "+this.current_star.temperature+"K")
      )
      .append(
        $('<p>').text("Radius: "+this.current_star.sol_radii+" Solar Radii")
      )
    )
    .append(
      $('<h3>').text("Planets")
    );

    for (var planet_id in this.current_star.planets) {
      var planet = this.current_star.planets[planet_id];
      this.$information_element.append(
        $('<div>')
        .addClass('panel')
        .addClass('panel-info')
        .addClass('planet_info')
        .toggleClass('selected_planet', this.selected_planet.planet_id == planet_id)
        .data('planet_id', planet_id)
        .append($('<p>').text("Kepler ID: "+planet.planet_id))
        .append($('<p>').text("Equilibrium Temperature: "+planet.temperature+"K"))
        .append($('<p>').text("Radius: "+planet.earth_radii+" Earth Radii"))
        .append($('<p>').text("Period: "+planet.period_days+" Days"))
        .append($('<p>').text("Distance: "+planet.axis+" AU"))
        .on('click', (e) => {
          var target = $(e.target).hasClass("panel") ? $(e.target) : $(e.target).parent();
          planet_id = target.data('planet_id'),
          planet = this.current_star.planets[planet_id];
          this.select(planet);
        })
      )
    }
  }

  /**
  * Set focus on only selected planet search result
  * @return {Void}
  */
  focusSearchResult() {
    var html_id = this.planetIdToHtmlId(this.selected_planet.planet_id);

    this.$results_element
    .find('.planet_result')
    .removeClass('selected_planet');

    this.$results_element
    .find("#"+html_id)
    .addClass('selected_planet');
  }

  /**
  * Ugly kludge to make kepler decimal id HTML friendly
  * @param {Double} planet_id Kepler ID
  * @return {String} underscore-delimited kepler ID string
  */
  planetIdToHtmlId(planet_id) {
    return "planet_"+
    planet_id
    .toString()
    .replace(".", "_");
  }

  /**
  * Set listener to dynamically resize the canvas on window change.
  * @return {Void}
  */
  setResizeListener() {
    $(window).resize(() => {
      this.canvas.determineSize();
    });
  }

}