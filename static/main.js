$(document).ready( function() {

  var rand = document.getElementById('random');
  rand.onclick = function () { 
    var gender = d3.select("input[name='gender']:checked")[0][0].value;
    updateGraph(true, gender); }

  var go = document.getElementById('go-button');
  go.onclick = function () {
    var gender = d3.select("input[name='gender']:checked")[0][0].value;
    updateGraph(false, gender);
  }

  function distance(lat1, lon1, lat2, lon2) {
    var rl1 = Math.PI * lat1/180;
    var rl2 = Math.PI * lat2/180;
    var theta = (lon1-lon2) / 180 * Math.PI;
    var dist = Math.acos( Math.sin(rl1) * Math.sin(rl2) + Math.cos(rl1) * Math.cos(rl2) * Math.cos(theta));
    dist = dist * 180/Math.PI * 60 * 1.1515 * 1.609344;
    return dist;
  }

  function windDirection(b) {
    b = b % 360;
    if (b) {
      if (b > 67.5 && b <= 112.5) return "W";
      else if (b > 112.5 && b <= 157.5) return "NW";
      else if (b > 157.5 && b <= 202.5) return "N";
      else if (b > 202.5 && b <= 247.5) return "NE";
      else if (b > 247.5 && b <= 292.5) return "E";
      else if (b > 292.5 && b <= 337.5) return "SE";
      else if (b > 337.5 || b <= 22.5) return "S";
      else if (b > 22.5 && b <= 67.5) return "SW";
      else return "?"
    } else {
      return "--"
    }
  }

  function toMPH(mps) {
    return mps + "mi/h";
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

      infos = d3.selectAll('.effort-info')
        .transition()
          .duration(500)
        .attr("display" , function(d, i) {
          if (i == rank) {
            return "block";
          }
          else return "none";
        });
      wind_display = d3.selectAll('.effort-info')
        .filter( function(d, i) {
          return (i == rank)
        });
  }

  function showError() {
    console.log("showing error");
  }

  function getRandomSegment() {
    randomIds = ["5438696", "101", "170", "983", "1270807", "287" ]
    return randomIds[Math.floor(Math.random()*randomIds.length)];
    //820797
  }


  String.prototype.toHHMMSS = function () {
      var sec_num = parseInt(this, 10); 
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
  d3.selection.prototype.moveToFront = function() {  
      return this.each(function(){
        this.parentNode.appendChild(this);
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

  function drawEffortInfo(data, svg) {
    svg.selectAll(".effort-info").remove()

    effortInfo = svg.selectAll(".effort-info")
      .data(data.entries.slice(0, 10))
      .enter()
      .append("g")
        .attr("display", "none")
        .attr("transform", function(d, i) {
          if (i < 5) {
            return "translate(" + (x(i + 1) + 15) + ',' + (y(d.elapsed_time) - 10) + ")"
          } else {
            return "translate(" + (x(i + 1) - 165) + ',' + (y(d.elapsed_time) - 10) + ")"
          }
        })
      .attr("class", "effort-info");

    effortInfo.append("rect")
        .attr("width", 150)
        .attr("height", 20)
        .attr("fill", "#FC4C02");
    effortInfo.append("circle")
        .attr("cx", function(d, i) {
          if (i < 5) return -15
          else return 165
        })
        .attr("cy", 10)
        .attr("r", 16)
        .attr("stroke-width", 3)
        .attr("stroke", "#FC4C02")
        .attr("fill", "none");
    effortInfo.append("rect")
        .attr("width", 135)
        .attr("height", 36)
        .attr("transform", function(d, i) {
          if (i < 5) return "translate(15, 20)"
          else return "translate(0, 20)"
        })
        .attr("fill", "white")
        .attr("stroke", "#fedccd")
        .attr("stroke-width", 1);
    effortInfo.append("image")
      .attr("class", "effort-wind-icon")
      .attr("xlink:href", "/static/wind.png")
      .attr("height", "15")
      .attr("width", "15")
      .attr("x", function(d, i) {
          if (i < 5) return 20
          else return 5 })
      .attr("y", 40);
    effortInfo.append("text")
        .attr("class", "effort-wind")
        .text( function (d) {
          return windDirection(d.wind_bearing)
        })
        .attr("fill", "black")
        .attr("x", function(d, i) {
          if (i < 5) return 40
          else return 25 })
        .attr("y", 51);
    effortInfo.append("text")
        .text( function (d) {
          return d.athlete_name.slice(0, 15);
        })
        .attr("fill", "white")
        .attr("text-anchor", function(d, i) {
          if (i < 5) return "end"
          else return "begin"
        })
        .attr("y", 15)
        .attr("x", function(d, i) {
          if (i < 5) return 145
          else return 5
        });
    effortInfo.append("image")
        .attr("class", "effort-wind-icon")
        .attr("xlink:href", "/static/timer.png")
        .attr("height", "15")
        .attr("width", "15")
        .attr("x", function(d, i) {
          if (i < 5) return 20
          else return 5 })
        .attr("y", 22);
    effortInfo.append("text")
        .text( function (d) {
          return d.elapsed_time.toString().toHHMMSS();
        })
        .attr("fill", "black")
        .attr("y", 33)
        .attr("x", function(d, i) {
          if (i < 5) return 40
          else return 25 });
  }


  function drawMap(lat1, lon1, lat2, lon2, polyline) {
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

    d3.json("/segment/" + id, function(error, segment_data) {
      console.log("SEGMENT DATA", segment_data);
      lat1 = segment_data.start_latitude
      lat2 = segment_data.end_latitude
      lon1 = segment_data.start_longitude
      lon2 = segment_data.end_longitude
      var bear = bearing(lat1, lon1, lat2, lon2);
      var dist = distance(lat1, lon1, lat2, lon2);

      d3.select("#segment-name")
          .text(segment_data.name)
          .attr("href", "https://www.strava.com/segments/" + id)

      drawMap(lat1, lon1, lat2, lon2, segment_data.map.polyline);

      d3.json("/leaderboard/" + id + "/" + "F", function(error, data) {
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
          .attr("class", "prof-circ")
          .attr("r", 16)
          .attr("cx", function(d, i) {
            return x(i + 1);
          })
          .attr("cy", function(d) {
            return y(d.elapsed_time);
          })
          .attr("fill", function (d, i) {
            return "url(#prof_pic_" + i + " )"
          })
          .attr("stroke-width",  "3px")
          .attr("stroke", function() {
            if (wind) return "#98AFC7";
            else return "orange";
          });

        drawEffortInfo(ldr_data, svg);

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
                        "y" : y(d.elapsed_time) - 18 * Math.sin((br + 90) * .0174544) }, 
                      { "x" : x(i + 1) + 18 * Math.cos((br + 90) * .0174544),
                        "y" : y(d.elapsed_time) + 18 * Math.sin((br + 90) * .0174544) },
                      { "x" : x(i + 1) + (d.wind_speed * -5 - 18) * Math.cos(d.wind_bearing * .0174533),
                        "y" : y(d.elapsed_time) + (d.wind_speed * -5 - 18) * Math.sin(d.wind_bearing * .0174533) }
                      ];

                    svg.append("circle")
                      .attr("cx", x(i + 1))
                      .attr("cy", y(d.elapsed_time))
                      .attr("r", 16)
                      .attr("fill", "white")
                      .attr("class", "white-circ")
                      .moveToBack();

                    svg.append("path")
                      .attr("d", lineFunction(triData))
                      .attr("class", "wind-triangle")
                      .attr("stroke", "98AFC7")
                      .attr("stroke-width", 2)
                      .attr("fill", "#98AFC7")
                      .moveToBack();

                    svg.selectAll(".axis").moveToBack();

                    svg.selectAll(".effort-wind")
                      .filter( function(d, i) {
                        return i == tempi
                      })
                      .text( function(d) {
                        return toMPH(d.wind_speed) + " " + windDirection(d.wind_bearing + 90);
                      });

                  })
              }
          })
      }
    });

  });
  };

  function updateGraph(random, gender) {

    if (random) {
      id = getRandomSegment();
    } else {
      var id = d3.select("#segment-id")[0][0].value;
      var gender = d3.select("input[name='gender']:checked")[0][0].value;
      if (id === "") {
        showError();
      }
    }

    
    console.log(gender);
    var wind = true //d3.select("#wind-select")[0][0].checked;
    var heart_rate = false //d3.select("#hr-select")[0][0].checked;
    var svg = d3.select("body").select("svg").select("g");

    var lat1, lat2, lon1, lon2;

    d3.json("/segment/" + id, function(error, segment_data) {
      console.log("SEGMENT DATA", segment_data);

      lat1 = segment_data.start_latitude;
      lon1 = segment_data.start_longitude;
      lat2 = segment_data.end_latitude;
      lon2 = segment_data.end_longitude;

      var bear = bearing(lat1, lon1, lat2, lon2);
      var dist = distance(lat1, lon1, lat2, lon2);

      d3.select("#segment-name").text(segment_data.name);

      drawMap(lat1, lon1, lat2, lon2, segment_data.map.polyline);
      var g = d3.select("input[name='gender']:checked")[0][0].value;
      console.log("second", gender);
      d3.json("/leaderboard/" + id + "/" + "F", function(error, data) {
        console.log(data, gender);
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

        drawEffortInfo(data, svg);

        svg.selectAll(".hr")
          .data(data.entries.slice(0, 10))
          .transition()
            .duration(1000)
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
          .attr("cx", function(d, i) {
            return x(i + 1);
          })
          .attr("cy", function(d) {
            return y(d.elapsed_time);
          })
          .attr("r", 16)
          .attr("stroke", function() {
            if (wind) return "#98AFC7";
            else return "orange";
          })
          .attr("fill", function (d, i) {
            return "url(#prof_pic_" + i + ")"})

        if (wind) {
          data.entries.slice(0, 10).forEach( function(d, i) {
            date = d.start_date_local;
            hour = parseInt(date.substring(11, 13)).toString();

            if (i < 3) {
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
                        "y" : y(d.elapsed_time) - 18 * Math.sin((br + 90) * .0174544) }, 
                      { "x" : x(i + 1) + 18 * Math.cos((br + 90) * .0174544),
                        "y" : y(d.elapsed_time) + 18 * Math.sin((br + 90) * .0174544) },
                      { "x" : x(i + 1) + (d.wind_speed * -5 - 18) * Math.cos(d.wind_bearing * .0174533),
                        "y" : y(d.elapsed_time) + (d.wind_speed * -5 - 18) * Math.sin(d.wind_bearing * .0174533) }
                      ];

                    svg.append("circle")
                      .attr("cx", x(i + 1))
                      .attr("cy", y(d.elapsed_time))
                      .attr("r", 16)
                      .attr("fill", "white")
                      .attr("class", "white-circ")
                      .moveToBack();

                    svg.append("path")
                      .attr("d", lineFunction(triData))
                      .attr("class", "wind-triangle")
                      //.attr("stroke", "98AFC7")
                      //.attr("stroke-width", 2)
                      .attr("fill", "#fffffe")
                      .moveToBack()
                      .transition().duration(600)
                        .attr("fill", "white")
                      .transition().duration(1000)
                        .attr("fill", "#98AFC7");

                    svg.selectAll(".axis").moveToBack();

                    svg.selectAll(".effort-wind")
                      .filter( function(d, i) {
                        return i == tempi
                      })
                      .text( function(d) {
                        return toMPH(d.wind_speed) + " " + windDirection(d.wind_bearing + 90);
                      });
                  })
              }
          });
        };
      });
});
  }

  drawGraph("820797", "M", false, true);
});