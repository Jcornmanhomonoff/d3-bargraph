'use strict';

let margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 40
  },
  width = 960 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;


//define x & y scale
let x = d3.scale.linear()
  .rangeRound([0, width]);

let y = d3.scale.ordinal() //Ordinal scales have discrete domain, such as a set of names or categories.
  .rangeRoundBands([height, 0], .1); //rangeRoundBands adds padding between bars

//set color range
let color = d3.scale.ordinal()
  .range(["#003300", "#467f1a", "#568c27", "#669933", "#77aa41", "#89bb4b", "#a5d25f"]);

//set up x & y axis
let yAxis = d3.svg.axis()
  .scale(y)
  .orient("left");

let xAxis = d3.svg.axis()
  .scale(x)
  .orient("bottom");
  // .tickFormat(d3.format(".2s"));

//declare svg
let svg = d3.select("body").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//load in csv file & build chart
d3.csv("assets/data/usage.csv", function(data) {


  data = data.filter(function(d) {
    return d.label === 'Traveling'
  })
  console.log(data)

  //associating colors with sex
  color.domain(['Males', 'Females'])

  data.forEach(function(d) {
    let y0 = 0;
    d.places = color.domain().map(function(name) {
      return {
        name: name,
        y0: y0,
        y1: y0 += parseInt(d.percent, 10)
      };
    });
    d.total = d.places[d.places.length - 1].y1;
  });


  console.log(data)

  y.domain(data.map(function(d) {
    return d.technology;
  }));
  x.domain([0, d3.max(data, function(d) {
    return d.total;
  })]);

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Technology");

  let place = svg.selectAll(".place")
    .data(data)
    .enter().append("g")
    .attr("class", "g")
    .attr("transform", function(d) {
      return "translate(0," + y(d.technology) + ")";
    });

  place.selectAll("rect")
    .data(function(d) {
      return d.places;
    })
    .enter().append("rect")
    .attr("height", y.rangeBand())
    .attr("x", function(d) {
      return x(d.y0);
    })
    .attr("width", function(d) {
      return x(d.y1) - x(d.y0);
    })
    .style("fill", function(d) {
      return color(d.name);
    });

  let legend = svg.selectAll(".legend")
    .data(color.domain().slice().reverse())
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) {
      return "translate(0," + i * 20 + ")";
    });

  legend.append("rect")
    .attr("x", width - 18)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", color);

  legend.append("text")
    .attr("x", width - 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text(function(d) {
      return d;
    });

});
