$(function() {
  graphSegment("2294005");
});

function distance(lat1, lon1, lat2, lon2) {
  var rl1 = Math.PI * lat1/180;
  var rl2 = Math.PI * lat2/180;
  var theta = (lon1-lon2) / 180 * Math.PI;
  var dist = Math.acos( Math.sin(rl1) * Math.sin(rl2) + Math.cos(rl1) * Math.cos(rl2) * Math.cos(theta));
  dist = dist * 180/Math.PI * 60 * 1.1515 * 1.609344;
  return dist;
}

function bearing(lat1, lon1, lat2, lon2) {
  var rlat1 = Math.PI * lat1/180;
  var rlat2 = Math.PI * lat2/180;
  var rlon1 = Math.PI * lon1/180;
  var rlon2 = Math.PI * lon2/180;
  var x = Math.cos(rlat2) * Math.sin(rlon2 - rlon1);
  var y = Math.cos(rlat1) * Math.sin(rlat2) - Math.sin(rlat1) * Math.cos(rlat2) * Math.cos(rlon2 - rlon1);
  var b = Math.atan2(x, y) / Math.PI * 180;
  return b;
}

String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    /*if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}*/
    if (seconds < 10) {seconds = "0"+seconds;}
    return minutes+':'+seconds;
}

function graphSegment(id) {
  var svg = d3.select("svg");

  var margin = {top: 20, right: 20, bottom: 30, left: 50},
      width = 700 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

  var y = d3.scale.linear()
    .range([0, height]);

  var x = d3.scale.linear()
    .range([0, width]);

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

  var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + ',' + margin.top + ")");


  d3.json("/segment/" + id, function(error, data) {
    startLat = data.start_latitude;
    startLong = data.start_longitude;
    endLat = data.end_latitude;
    endLong = data.end_longitude;

    var bear = bearing(startLat, startLong, endLat, endLong);
    var dist = distance(startLat, startLong, endLat, endLong)
  });

  d3.json("/leaderboard/" + id, function(error, data) {
    console.log(data.entries);
    var minTime = data.entries[0].moving_time;
    var maxTime = data.entries[14].moving_time;

    x.domain([0, 14]);
    y.domain([maxTime, minTime]);

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    svg.selectAll("circle")
      .data(data.entries)
      .enter()
      .append("circle")
      .attr("cx", function(d) {
        return x(d.rank - 1);
      })
      .attr("cy", function(d) {
        console.log(d.moving_time.toString().toHHMMSS())
        return y(d.moving_time.toString().toHHMMSS());
      })
      .attr("r", 3);

  });

}