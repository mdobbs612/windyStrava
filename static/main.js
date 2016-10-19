$(function() {
  drawGraph("2294005");
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

function mousemove() {
    var rank = Math.round(x.invert(d3.mouse(this)[0]) - 1.75);

    circle = d3.selectAll('circle')
      .attr("r" , function(d, i) {
        if (i == rank) return 18;
        else return 18;
      })
      .attr("stroke" , function(d, i) {
        if (i == rank) return "black";
        else return "orange";
      });
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

  var margin = {top: 20, right: 20, bottom: 30, left: 50},
      width = 900 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;

  var y = d3.scale.linear()
    .range([0, height]);

  var yhr = d3.scale.linear()
    .range([0, height]);

  var x = d3.scale.linear()
    .range([0, width]);

  var xAxis = d3.svg.axis()
    .scale(x)
    .innerTickSize(-height)
    .orient("bottom")
    .tickValues([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

  var yAxis = d3.svg.axis()
    .ticks(10)
    .innerTickSize(-width)
    .scale(y)
    .orient("left")
    .tickFormat(function (d) { return d.toString().toHHMMSS(); });

function drawGraph(id) {
  var svg = d3.select("svg");

  var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .on("mousemove", mousemove)
    .append("g")
      .attr("transform", "translate(" + margin.left + ',' + margin.top + ")");

  var defs = svg.append("defs").attr("id", "imgdefs")

  d3.json("/segment/" + id, function(error, data) {
    startLat = data.start_latitude;
    startLong = data.start_longitude;
    endLat = data.end_latitude;
    endLong = data.end_longitude;

    var bear = bearing(startLat, startLong, endLat, endLong);
    var dist = distance(startLat, startLong, endLat, endLong)
  });

  d3.json("/leaderboard/" + id, function(error, data) {
    console.log(data);

    var minTime = data.entries[0].elapsed_time;
    var maxTime = data.entries[9].elapsed_time;

    var hrs = data.entries.map(function (d) {
      return d.average_hr;
    })

    var timeMargin = (maxTime - minTime) / 10
    var hrMargin = d3.min(hrs)

    x.domain([0, 11]);
    y.domain([maxTime + timeMargin, minTime - timeMargin]);
    yhr.domain([d3.min(hrs) - 20, d3.max(hrs) + 20])

    data.entries.forEach( function(d, i) {
      defs.append("pattern")
        .attr("id", "prof_pic_" + i)
        .attr("height", 1)
        .attr("width", 1)
        .attr("x", "0")
        .attr("y", "0")
        .append("image")
        .attr("width", 36)
        .attr("height", 36)
        .attr("xlink:href", function() {
          console.log(d);
          if (d.athlete_profile != "avatar/athlete/large.png") {
            return d.athlete_profile ;
          } else return "static/avatar.png";
        });
    });

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);

    circles = svg.selectAll("circle")
      .data(data.entries.slice(0, 10))
      .enter()
      .append("circle")
      .attr("cx", function(d, i) {
        return x(i + 1);
      })
      .attr("cy", function(d) {
        return y(d.moving_time);
      })
      .attr("r", 18)
      .attr("fill", function (d, i) {
        return "url(#prof_pic_" + i + ")";
      })
      .attr("stroke-width", 3)
        .attr("stroke", "orange")
        .attr("stroke-opacity", .4);

    hr = svg.selectAll("image")
      .data(data.entries.slice(0, 10))
      .enter()
      .append("image")
        .attr("xlink:href", "http://iconmonstr.com/wp-content/g/gd/makefg.php?i=../assets/preview/2012/png/iconmonstr-favorite-7.png&r=255&g=46&b=46")
        .attr("x", function(d, i) {
          return x(i + 1) - 16;
        })
        .attr("y", function(d) {
          return yhr(d.average_hr) + 16;
        })
        .attr("width", 32)
        .attr("height", 32);

  });
}

function updateGraph() {

  var id ="4302773"
  
  var svg = d3.select("body").select("svg").select("g");

  /*d3.json("/segment/" + id, function(error, data) {
    console.log("Segment call");
    startLat = data.start_latitude;
    startLong = data.start_longitude;
    endLat = data.end_latitude;
    endLong = data.end_longitude;

    var bear = bearing(startLat, startLong, endLat, endLong);
    var dist = distance(startLat, startLong, endLat, endLong)
  });*/

  d3.json("/leaderboard/" + id, function(error, data) {
    console.log("leaderboard call");
    console.log(data);
    var minTime = data.entries[0].moving_time;
    var maxTime = data.entries[9].moving_time;

    var timeMargin = (maxTime - minTime) / 8

    y.domain([maxTime + timeMargin, minTime - timeMargin]);

    svg.select(".y.axis")
      .call(yAxis);

    data.entries.forEach( function(d, i) {
      d3.select("#prof_pic_" + i + " image")
        .attr("xlink:href", function() {
          console.log(d);
          if (d.athlete_profile != "avatar/athlete/large.png") {
            return d.athlete_profile ;
          } else return "static/avatar.png";
        });
    });

    svg.selectAll("circle")
      .data(data.entries.slice(0, 10))
      .transition()
        .duration(1000)
        .ease("elastic")
      .attr("cx", function(d, i) {
        return x(i + 1);
      })
      .attr("cy", function(d) {
        return y(d.moving_time);
      })
      .attr("r", 18)
      .attr("fill", function (d, i) {
        return "url(#prof_pic_" + i + ")"});

  });

  
}