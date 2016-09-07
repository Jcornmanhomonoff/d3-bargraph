'use strict';

let margin = {
    top: 30,
    right: 50,
    bottom: 100,
    left: 75
  },
  width = 1500 - margin.left - margin.right,
  height = 700 - margin.top - margin.bottom;

//create svg
let svg = d3.select("#graph").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g") //used to group SVG shapes together
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// svg.call(tip);
d3.json('http://api.population.io/1.0/population/1950/United%20States/', function (data){
  let headers = ["Female"];

  //explicit return of object with x & y
  //d3 requires x, y, & y0
  //each block takes 2 y values to map blocks on top of one another
  //d3.layout.stack returns y0
  let layers = d3.layout.stack()(headers.map(function(total) {
    return data.map(function(d) {
      return {
        x: d.age,
        y: +d.total
      };
    });
  }));
  console.log(layers);

  //calculate max in layers variables
  let yStackMax = d3.max(layers, function(layer) {
    return d3.max(layer, function(d) {
      return d.y0 + d.y;
    });
  });

  //determining scale
  let xScale = d3.scale.ordinal()
    .domain(layers[0].map(function(d) {
      return d.x;
    }))
    .rangeRoundBands([20, width], .1); //padding away from y axis & width of bars

  let y = d3.scale.linear()
    .domain([0, yStackMax])
    .range([height, 0]);

  //set color range
  let color = d3.scale.ordinal()
    .domain(headers)
    .range(["rgb(0, 255, 224)"]);


  //creating axis & making chart
  let xAxis = d3.svg.axis()
    .scale(xScale)
    .tickSize(0)
    .tickPadding(20) //move labels away from axis
    .orient("bottom");

  let yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(d3.format(".2s")); //numbers positions

  //creating x axis
  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .selectAll("text").style("text-anchor", "end")
    .attr("dx", "-.8em") //move labels down from line
    .attr("dy", "-1em")
    .attr("transform", function(d) {
      return "rotate(-90)"; //flip labels
    });

  //creating y axis
  svg.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(20,0)") //move y axis away from bars
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr({
      "x": -250, //move Percentage away from x axis
      "y": -65
    })
    .attr("dy", ".75em")
    .style("text-anchor", "end")
    .text("Total");



  let layer = svg.selectAll(".layer")
    .data(layers)
    .enter() //creates new placeholder element
    .append("g")
    .attr("class", "layer")
    .style("fill", function(d, i) { //fill blocks with associated color
      return color(i);
    });

  let rect = layer.selectAll("rect")
    .data(function(d) {
      return d;
    })
    .enter()
    .append("rect")
    .attr("x", function(d) {
      return xScale(d.x);
    })
    .attr("y", height)
    .attr("width", xScale.rangeBand()) //without padding
    .attr("height", 0);

  rect.transition()
    .delay(function(d, i) {
      return i * 100; //speed of transition
    })
    .attr("y", function(d) {
      return y(d.y0 + d.y);
    })
    .attr("height", function(d) {
      return y(d.y0) - y(d.y0 + d.y);
    });


  //creating legend
  let legend = svg.selectAll(".legend")
    .data(headers)
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) {
      return "translate(-20," + i * 20 + ")"; //placement of legend & keeping boxes together
    });

  legend.append("rect")
    .attr("x", width - 18)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", color);

  legend.append("text")
    .attr("x", width - 24) //aligns text with blocks
    .attr("y", 9) //aligns text with blocks
    .attr("dy", ".35em")
    .style("text-anchor", "end") //moves text to side of blocks
    .text(function(d) {
      return d;
    });
});
