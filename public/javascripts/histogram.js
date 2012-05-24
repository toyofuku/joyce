
function histogram(json){

var n = json.length,
  data = json,
  w = 18* 30,
  h = 18* 20,
  max_price = d3.max(data),
  min_price = d3.min(data),
  bins = Math.floor(Math.sqrt(data.length)),
  c = Math.floor((max_price - min_price) / bins);
  var histogram = d3.layout.histogram().bins(bins)(data),
  x = d3.scale.ordinal()
      .domain(histogram.map(function(d) { return d.x; }))
      .rangeRoundBands([0, w]),
  max_y = d3.max(histogram, function(d) { return d.y; }),
  y = d3.scale.linear()
      .domain([0, max_y])
      .range([0, h]),
  vis = d3.select("div.chart").append("svg")
        .attr("width", w*1.1)
        .attr("height", h*1.1)
        .append("g")
        .attr("transform", "translate(.5)");

var x_width = Math.floor(bins/10);
if(x_width == 0){ x_width = 1; }
for(var i = 0; i < bins; i += x_width){
  vis.append("line")
  .attr("x1", x(histogram[i].x))
  .attr("x2", x(histogram[i].x))
  .attr("y1", 0)
  .attr("y2", h);

  vis.append("text")
  .attr("x", x(histogram[i].x))
  .attr("y", h)
  .attr("dx", "0.0")
  .attr("dy", 10)
  .attr("text-anchor", "start")
//  .attr("transform","rotate(30,"+x(histogram[i].x)+","+(h*1.01)+")")
  .text( Math.round((i * c)/1000) );
}

var y_width = Math.floor(max_y/10);
if(y_width == 0){ y_width = 1; }
for(var i = y_width;  i <= max_y; i += y_width){
  var h1 = h - y(i) ;
  vis.append("line")
  .attr("x1", 0)
  .attr("x2", w)
  .attr("y1", h1)
  .attr("y2", h1);

  vis.append("text")
  .attr("x", w)
  .attr("y", h1)
  .attr("dx", "+0.1em")
  .attr("dy", "+1.0em")
  .attr("text-anchor", "start")
  .text( i );
}

vis.selectAll("rect")
    .data(histogram)
  .enter().append("rect")
    .attr("transform", function(d) { return "translate(" + x(d.x) + "," + (h - y(d.y)) + ")"; })
    .attr("width", x.rangeBand())
    .attr("y", function(d) { return y(d.y); })
    .attr("height", 0)
  .transition()
    .duration(750)
    .attr("y", 0)
    .attr("height", function(d) { return y(d.y); });

vis.append("line").attr("x1", 0).attr("x2", w).attr("y1", 0).attr("y2", 0);
vis.append("line").attr("x1", 0).attr("x2", w).attr("y1", h).attr("y2", h);
vis.append("line").attr("x1", w).attr("x2", w).attr("y1", 0).attr("y2", h);

}
