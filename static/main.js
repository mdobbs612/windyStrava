$(document).ready( function() {

  var rand = document.getElementById('random');
  rand.onclick = function () { updateGraph(true); }


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
          if (i == rank) return 22;
          else return 18;
        })
  }

  function showError() {
    console.log("showing error");
  }

  String.prototype.toHHMMSS = function () {
      var sec_num = parseInt(this, 10); // don't forget the second param
      var hours   = Math.floor(sec_num / 3600);
      var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
      var seconds = sec_num - (hours * 3600) - (minutes * 60);

      if (seconds < 10) {seconds = "0"+seconds;}
      return minutes+':'+seconds;
  }



  var margin = {top: 20, right: 20, bottom: 50, left: 50},
      graphw = d3.select('#graph').node().getBoundingClientRect().width - 10,
      graphh = d3.select('#graph').node().getBoundingClientRect().height - 45, 
      width = graphw - margin.right - margin.left,
      height = graphh - margin.top - margin.bottom;

  console.log(graphh);

  var y = d3.scale.linear()
    .range([0, height]);

  var yhr = d3.scale.linear()
    .range([height, 0]);

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

  var lineFunction = d3.svg.line()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; })
    .interpolate("linear");

  d3.selection.prototype.moveToBack = function() {  
        return this.each(function() { 
            var firstChild = this.parentNode.firstChild; 
            if (firstChild) { 
                this.parentNode.insertBefore(this, firstChild); 
            } 
        });
    };

  function zoomToObject(obj){
      var bounds = new google.maps.LatLngBounds();
      var points = obj.getPath().getArray();
      for (var n = 0; n < points.length ; n++){
          bounds.extend(points[n]);
      }
      map.fitBounds(bounds);
  }

  function drawMap(lat1, lon1, lat2, lon2, polyline) {
    console.log("calling initMap");
    var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 12,
            center: {lat: lat1, lng: lon1},
            mapTypeId: 'terrain'
      });

    var endMark = new google.maps.Marker({
      position: {lat: lat2, lng: lon2},
      icon: {
        url: "/static/polyline_end.png",
        size: new google.maps.Size(30, 30),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(7.5, 7.5),
        scaledSize: new google.maps.Size(15, 15)
      },
      map: map
    });

    var startMark = new google.maps.Marker({
      position: {lat: lat1, lng: lon1},
      icon: {
        url: "/static/polyline_start.png",
        size: new google.maps.Size(30, 30),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(5, 5),
        scaledSize: new google.maps.Size(10, 10)
      },
      map: map
    });

      var path = new google.maps.Polyline({
        path: google.maps.geometry.encoding.decodePath(polyline),
        geodesic: true,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 2
      });

      path.setMap(map);

      var bounds = new google.maps.LatLngBounds();
      var points = path.getPath().getArray();
      for (var n = 0; n < points.length ; n++){
          bounds.extend(points[n]);
      }
      map.fitBounds(bounds);
  }

  function drawGraph(id, gender, heart_rate, wind) {
    var svg = d3.select("svg");

    var svg = d3.select("#graph").append("svg")
        .attr("width", graphw)
        .attr("height", graphh)
        .on("mousemove", mousemove)
      .append("g")
        .attr("transform", "translate(" + margin.left + ',' + margin.top + ")");

    var defs = svg.append("defs").attr("id", "imgdefs")

    d3.json("/segment/" + id, function(error, data) {
      lat1 = data.start_latitude
      lat2 = data.end_latitude
      lon1 = data.start_longitude
      lon2 = data.end_longitude
      var bear = bearing(lat1, lon1, lat2, lon2);
      var dist = distance(lat1, lon1, lat2, lon2);

      d3.select("#segment-name").text(data.name);

      drawMap(lat1, lon1, lat2, lon2, data.map.polyline);
    });


    d3.json("/leaderboard/" + id + "/" + gender, function(error, data) {
      console.log(data);

      var ldr_data = data;

      var minTime = ldr_data.entries[0].elapsed_time;
      var maxTime = ldr_data.entries[9].elapsed_time;

      // get list of heart rates
      var hrs = ldr_data.entries.map(function (d) {
        return d.average_hr;
      })

      var timeMargin = (maxTime - minTime) / 10

      x.domain([0, 11]);
      y.domain([maxTime + timeMargin, minTime - timeMargin]);
      yhr.domain([d3.min(hrs) - 20, d3.max(hrs) + 20])

      // create pattern for each profile picure to be applied to svg circles
      ldr_data.entries.forEach( function(d, i) {
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
            if (d.athlete_profile != "avatar/athlete/large.png") {
              return d.athlete_profile ;
            } else return "static/avatar.png";
          });
      }); 

      // x axis
      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

      // y axis
      svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

      // draw prfile picture circles for time data points
      circles = svg.selectAll("circle")
        .data(ldr_data.entries.slice(0, 10))
        .enter()
        .append("circle")
        .attr("class", ".prof-circ")
        .attr("cx", function(d, i) {
          return x(i + 1);
        })
        .attr("cy", function(d) {
          return y(d.moving_time);
        })
        .attr("fill", function (d, i) {
          return "url(#prof_pic_" + i + " )"
        })
        .attr("stroke-width",  "3px")
        .attr("stroke", function() {
          if (wind) return "#66CCCC";
          else return "orange";
        });


      // add hearts for heart rate readings, only display if heart-rate
      svg.selectAll(".hr")
        .data(ldr_data.entries.slice(0, 10))
        .enter()
        .append("image")
        .attr("class", "hr")
        .attr("xlink:href", "/static/heart90.png")
        .attr("x", function(d, i) { return x(i + 1) - 14; })
        .attr("y", function(d) { return yhr(d.average_hr) + 14; })
        .attr("display", function() { if (heart_rate) return "block" 
                                      else return "none"});

      // add text labels for heart rates, only display if heart-rate
      svg.selectAll(".hr .txt")
        .data(ldr_data.entries.slice(0, 10))
        .enter()
        .append("text")
        .attr("class", "hr txt")
        .attr("x", function(d, i) { return x(i + 1) - 11; })
        .attr("y", function(d) { return yhr(d.average_hr) + 31; })
        .text(function(d, i) { return Math.round(d.average_hr) })
        .attr("display", function() { if (heart_rate) return "block" 
                                      else return "none"});

      svg.selectAll(".white-circ").remove();

      if (wind) {
        ldr_data.entries.slice(0, 10).forEach( function(d, i) {
          date = d.start_date_local;
          hour = parseInt(date.substring(11, 13)).toString();

          if (i < 3) {
              var tempi = i;
              d3.json("/weather/" + lat1 + "/" + lon2 + "/" + d.start_date_local, 
                function(error, data) {
                  hour_weather = data.hourly.data[hour]

                  br = (hour_weather.windBearing - 90) % 360;
                  ws = hour_weather.windSpeed;
                  d.wind_bearing = br
                  d.wind_speed = ws

                  var triData = [ 
                    { "x" : x(i + 1) - 18 * Math.cos((br + 90) * .0174544), 
                      "y" : y(d.moving_time) - 18 * Math.sin((br + 90) * .0174544) }, 
                    { "x" : x(i + 1) + 18 * Math.cos((br + 90) * .0174544),
                      "y" : y(d.moving_time) + 18 * Math.sin((br + 90) * .0174544) },
                    { "x" : x(i + 1) + d.wind_speed * -5 * Math.cos(d.wind_bearing * .0174533),
                      "y" : y(d.moving_time) + d.wind_speed * -5 * Math.sin(d.wind_bearing * .0174533) }
                    ];

                  svg.append("circle")
                    .attr("cx", x(i + 1))
                    .attr("cy", y(d.moving_time))
                    .attr("r", 16)
                    .attr("fill", "white")
                    .attr("class", "white-circ")
                    .moveToBack();

                  svg.append("path")
                    .attr("d", lineFunction(triData))
                    .attr("class", "wind-triangle")
                    .attr("stroke", "66CCCC")
                    .attr("stroke-width", 2)
                    .attr("fill", "#66CCCC")
                    .moveToBack();

                  svg.selectAll(".axis").moveToBack();
                })
            }
        })
      }
    });
  };

  function updateGraph(random) {

    if (random) {
      id = "4302773"
    } else {
      var id = d3.select("#segment-id")[0][0].value;
      if (id === "") {
        showError();
      }
    }

    var gender = d3.select("input[name='gender']:checked")[0][0].value;
    var wind = d3.select("#wind-select")[0][0].checked;
    var heart_rate = d3.select("#hr-select")[0][0].checked;
    var svg = d3.select("body").select("svg").select("g");

    var lat1, lat2, lon1, lon2;

    d3.json("/segment/" + id, function(error, data) {
      lat1 = data.start_latitude;
      lon1 = data.start_longitude;
      lat2 = data.end_latitude;
      lon2 = data.end_longitude;

      var bear = bearing(lat1, lon1, lat2, lon2);
      var dist = distance(lat1, lon1, lat2, lon2);

      d3.select("#segment-name").text(data.name);

      drawMap(lat1, lon1, lat2, lon2, data.map.polyline);

    });

    d3.json("/leaderboard/" + id + "/" + gender, function(error, data) {
      console.log(data);
      var minTime = data.entries[0].moving_time;
      var maxTime = data.entries[9].moving_time;

      var hrs = data.entries.map(function (d) {
        return d.average_hr;
      });

      var timeMargin = (maxTime - minTime) / 8;

      y.domain([maxTime + timeMargin, minTime - timeMargin]);
      yhr.domain([d3.min(hrs) - 20, d3.max(hrs) + 20]);

      svg.selectAll(".wind-triangle").remove();

      svg.select(".y.axis")
        .call(yAxis);

      data.entries.forEach( function(d, i) {
        d3.select("#prof_pic_" + i + " image")
          .attr("xlink:href", function() {
            if (d.athlete_profile != "avatar/athlete/large.png") {
              return d.athlete_profile ;
            } else return "static/avatar.png";
          });
      });

      svg.selectAll(".hr")
        .data(data.entries.slice(0, 10))
        .transition()
          .duration(1000)
          .ease("elastic")
        .attr("y", function(d,i) {
          return yhr(hrs[i]) + 16;
        })
        .attr("display", function() {
          if (heart_rate) return "block";
          else return "none"
        });

      svg.selectAll(".hr.txt")
        .data(data.entries.slice(0, 10))
        .transition()
          .duration(1000)
          .ease("elastic")
        .attr("y", function(d,i) {
            return yhr(d.average_hr) + 33;
          })
        .text(function(d, i) { return Math.round(hrs[i]) })
        .attr("display", function() {
          if (heart_rate) return "block";
          else return "none"
        });

      svg.selectAll(".white-circ").remove();

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
        .attr("r", 16)
        .attr("stroke", function() {
          if (wind) return "#66CCCC";
          else return "orange";
        })
        .attr("fill", function (d, i) {
          return "url(#prof_pic_" + i + ")"})


      if (wind) {
        data.entries.slice(0, 10).forEach( function(d, i) {
          date = d.start_date_local;
          hour = parseInt(date.substring(11, 13)).toString();

          if (i < 7) {
              var tempi = i;
              d3.json("/weather/" + lat1 + "/" + lon2 + "/" + d.start_date_local, 
                function(error, data) {
                  hour_weather = data.hourly.data[hour]
                  //should be the same
                  br = (hour_weather.windBearing - 90) % 360;
                  ws = hour_weather.windSpeed;
                  d.wind_bearing = br
                  d.wind_speed = ws

                  var triData = [ 
                    { "x" : x(i + 1) - 18 * Math.cos((br + 90) * .0174544), 
                      "y" : y(d.moving_time) - 18 * Math.sin((br + 90) * .0174544) }, 
                    { "x" : x(i + 1) + 18 * Math.cos((br + 90) * .0174544),
                      "y" : y(d.moving_time) + 18 * Math.sin((br + 90) * .0174544) },
                    { "x" : x(i + 1) + d.wind_speed * -5 * Math.cos(d.wind_bearing * .0174533),
                      "y" : y(d.moving_time) + d.wind_speed * -5 * Math.sin(d.wind_bearing * .0174533) }
                    ];

                  svg.append("circle")
                    .attr("cx", x(i + 1))
                    .attr("cy", y(d.moving_time))
                    .attr("r", 18)
                    .attr("fill", "white")
                    .attr("class", "white-circ")
                    .moveToBack();

                  svg.append("path")
                    .attr("d", lineFunction(triData))
                    .attr("class", "wind-triangle")
                    .attr("stroke", "66CCCC")
                    .attr("stroke-width", 2)
                    .attr("fill", "#66CCCC")
                    .moveToBack();

                  svg.selectAll(".axis").moveToBack();
                })
            }
        });
      };
    });
  }

  drawGraph("2622759", "M", true, true);
});