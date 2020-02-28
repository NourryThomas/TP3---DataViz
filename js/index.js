var data = [];
var stations = [];
var stationsName = [];
const width = 750, height = 750;

const projection = d3.geoConicConformal()
  .center([2.454071, 46.279229])
  .scale(3800)
  .translate([width / 2, height / 2]);

function getDay(){
  var selectPays = document.getElementById('select_ville');
  var day = 1;
  var jsDate = $('#datepicker').datepicker('getDate');
  if (jsDate !== null) { // if any date selected in datepicker
      jsDate instanceof Date; // -> true
      day = jsDate.getDate();
      jsDate.getMonth();
      jsDate.getFullYear();
  }
  return day;
}

function createMap() {

  const path = d3.geoPath();

  path.projection(projection);

  const svg = d3.select('#map')
      .append("svg")
      .attr("id", "svg")
      .attr("viewBox", "0 0 " + width * 1.15 + " " + height);

  const deps = svg.append("g");

  d3.json('../json/departements.json').then(function(geojson) {
    deps.selectAll("path")
        .data(geojson.features)
        .enter()
        .append("path")
        .attr('class', 'department')
        .attr("d", path);
    });
}

var request = d3.json("../json/meteo.json")
    .then(loadJson).catch(console.error);

function loadJson(d){
	data = d;
  createStation();
  createMap();
  createVilles();
  createLineChart();
}

function createStation(){
  stations.push("FakeData");
  for(var i = 0; i < data.length; i++)
  {
    for(var j = 0; j < data[i]['station'].length; j++)
    {
      if(!stationsName.includes(data[i]['station'][j]['n']))
      {
        stationsName.push(data[i]['station'][j]['n']);
        var nom = data[i]['station'][j]['n'];
        var latitude = data[i]['station'][j]['lat'];
        var longitude = data[i]['station'][j]['lng'];

        var detailJour = [];
        for(var l = 0; l < data.length; l++)
        {
          for(var m = 0; m < data[l]['station'].length; m++)
          {
            if(data[l]['station'][m]['n'] == nom){

              var temp = data[l]['station'][m]['t'];
              var tempMoye = parseFloat(temp/100).toFixed(0);
              var preMoye = parseFloat(data[l]['station'][m]['p']).toFixed(2);
              var min = 0;
              var max = 0;

              for(var z = 0; z < data[l]['station'][m]['hours'].length; z++)
              {
                if(z == 0)
                {
                  max = data[l]['station'][m]['hours'][z]['t']/100;
                  min = data[l]['station'][m]['hours'][z]['t']/100;
                }
                if(data[l]['station'][m]['hours'][z]['t']/100 > max)
                {
                  max = data[l]['station'][m]['hours'][z]['t']/100;
                }
                if(data[l]['station'][m]['hours'][z]['t']/100 < min) {
                  min = data[l]['station'][m]['hours'][z]['t']/100;
                }
              }

              var infoMeteo = {
                tempMoye : tempMoye,
                preMoye : preMoye,
                min : min,
                max : max,
                detailHoraire : data[l]['station'][m]['hours']
              }
              detailJour.push(infoMeteo);
            }
          }
        }
        var infoStation = {
            nom: nom,
            latitude: latitude,
            longitude : longitude,
            detailJour : detailJour
          };

        stations.push(infoStation);
      }
    }
  }
}

function updateVilles()
{
  day = getDay();
  d3.selectAll("svg image")    .attr("xlink:href", function (d) {
    if(d.detailJour.length >= day){
      if(d.detailJour[day - 1]['tempMoye'] <= 1 && d.detailJour[day - 1]['preMoye'] >= 0.75 && d.detailJour[day - 1]['tempMoye'] >= -1)
        return "../img/neige.png";
       else if( d.detailJour[day - 1]['tempMoye'] >= 25 && d.detailJour[day - 1]['preMoye'] <= 0.15)
         return "../img/soleil.png";
       else if(d.detailJour[day - 1]['preMoye'] >= 1.00)
          return "../img/fortes_pluies.png";
       else if(d.detailJour[day - 1]['preMoye'] >= 0.50)
         return "../img/pluies.png";
       else if(d.detailJour[day - 1]['preMoye'] >= 0.25 )
         return "../img/averses.png";
       else if(d.detailJour[day - 1]['preMoye'] >= 0.15)
           return "../img/risque_averse.png";
       else if(d.detailJour[day - 1]['preMoye'] > 0.00 && d.detailJour[day - 1]['tempMoye'] <= 15)
           return "../img/éclaircits.png";
       else if(d.detailJour[day - 1]['preMoye'] == 0.00)
         return "../img/soleil.png";
     }
  })

  d3.selectAll("#map svg text").text(function(d){
    try {
      if(d.detailJour.length > day - 1)
      {
        return d.detailJour[day - 1]['tempMoye'] + "°C";
      }
    }
    catch(error) {
    }
  });
}

function createVilles() {

    day = getDay();

    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("left", "-500px")
        .style("top", "-500px");

    var svg = d3.select("#map").select("svg");

    var elem = svg.selectAll("g")
           .data(stations);

    var elemEnter = elem.enter()
           .append("g");

   var circle = elemEnter.append("image")
       .attr("xlink:href", function (d) {
          if(d.detailJour.length >= day){
            if(d.detailJour[day - 1]['tempMoye'] <= 1 && d.detailJour[day - 1]['preMoye'] >= 0.75 && d.detailJour[day - 1]['tempMoye'] >= -1)
              return "../img/neige.png";
             else if( d.detailJour[day - 1]['tempMoye'] >= 25 && d.detailJour[day - 1]['preMoye'] <= 0.15)
               return "../img/soleil.png";
             else if(d.detailJour[day - 1]['preMoye'] >= 1.00)
                return "../img/fortes_pluies.png";
             else if(d.detailJour[day - 1]['preMoye'] >= 0.50)
               return "../img/pluies.png";
             else if(d.detailJour[day - 1]['preMoye'] >= 0.25 )
               return "../img/averses.png";
             else if(d.detailJour[day - 1]['preMoye'] >= 0.15)
                 return "../img/risque_averse.png";
             else if(d.detailJour[day - 1]['preMoye'] > 0.00 && d.detailJour[day - 1]['tempMoye'] <= 15)
                 return "../img/éclaircits.png";
             else if(d.detailJour[day - 1]['preMoye'] == 0.00)
               return "../img/soleil.png";
           }
       })
       .attr("x", function (d) { return projection([d.longitude, d.latitude])[0] - 15; })
       .attr("y", function (d) { return projection([d.longitude, d.latitude])[1] - 15; })
       .attr("width", "40px")
       .on("mouseover", function(d) {
           div.transition()
               .duration(200)
               .style("opacity", .9);
           div.html("<div class='nomVille'>" + d.nom+" </div>"
           + "Précipitations : " + d.detailJour[day - 1]['preMoye'] + " mm</br>"
           + "Minimum : " + d.detailJour[day - 1]['min'] + " °C</br>"
           + "Maximum : " + d.detailJour[day - 1]['max'] + " °C</br>")
               .style("left", (d3.event.pageX - 10) + "px")
               .style("top", (d3.event.pageY - 10) + "px");
       })
       .on("mouseout", function(d) {
           div.style("opacity", 0);
           div.html("")
               .style("left", "-500px")
               .style("top", "-500px");
       })
       .on("click", function(d) {
         $('#day_line_chart').empty();
         createDayLineChart(d.detailJour[day].detailHoraire, d.nom, day);
       });

   /* Create the text for each block */
   elemEnter.append("text")
       .attr("x", function (d) { return projection([d.longitude, d.latitude])[0] + 5; })
       .attr("y", function (d) { return projection([d.longitude, d.latitude])[1] - 15; })
       .attr("text-anchor", "middle")
       .attr("font-size", "13px")
       .attr("font-weight", "bold")
       .text(function(d){
           if(d.detailJour.length > day - 1)
           {
             return d.detailJour[day - 1]['tempMoye'] + "°C";
           }
       });
}

function createLineChart() {

    // set the dimensions and margins of the graph
  var margin = {top: 20, right: 20, bottom: 30, left: 50},
      width = 720 - margin.left - margin.right,
      height = 375 - margin.top - margin.bottom,
      tooltip = { width: 100, height: 100, x: 10, y: -30 },
      options = {weekday: "long", month: "long", day: "2-digit"};

  // parse the date / time
  var parseTime = d3.timeParse("%d-%b-%y");
      bisectDate = d3.bisector(function(d) { return d.d; }).left;

  // set the ranges
  var x = d3.scaleTime().range([0, width]);
  var y = d3.scaleLinear().range([height, 0]);
  var y1 = d3.scaleLinear().range([height, 0]);

  var xAxis = d3.axisBottom(x).ticks(5);

  var yAxisLeft = d3.axisLeft(y).ticks(5);

  var yAxisRight = d3.axisRight(y1).ticks(5);

  // define the line
  var valueline = d3.line().curve(d3.curveCardinal)
      .x(function(d) { return x(d.d); })
      .y(function(d) { return y(d.p); });
  // define the line
  var valueline2 = d3.line().curve(d3.curveCardinal)
      .x(function(d) { return x(d.d); })
      .y(function(d) { return y1(d.t); });

  // append the svg obgect to the body of the page
  // appends a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  var svg = d3.select("#line_chart").append("svg")
      .attr("viewBox", "0 0 " + width * 1.15 + " " + height  * 1.15)
      .append("g")
      .attr("transform","translate(" + margin.left + "," + margin.top + ")");

  data.forEach(function(d) {
    d.d = parseTime(d.d + "-Feb-99");
    d.t = +(d.t / 100);
    d.p = +(Math.round( d.p * 10 / (stations.length - 1)) / 10);
  });

  // Scale the range of the data
  x.domain(d3.extent(data, function(d) { return d.d; }));
  y.domain([0, d3.max(data, function(d) {
    return Math.max(d.p); })]);
  y1.domain([0, d3.max(data, function(d) {
    return Math.max(d.t); })]);

  const transitionPath = d3
    .transition()
    .ease(d3.easeSin)
    .duration(2500);

  var path_pluvio = svg.append("path")
        .attr("d", valueline(data));

  var path_length = path_pluvio.node().getTotalLength();

  d3.select("#line_chart > svg > g > path:first-child")
      .attr("stroke-dasharray", path_length)
      .attr("stroke-dashoffset", path_length)
      .transition(transitionPath)
      .attr("stroke-dashoffset", 0);

  var path_temp = svg.append("path")        // Add the valueline2 path.
      .style("stroke", "red")
      .attr("d", valueline2(data));

  path_length = path_temp.node().getTotalLength();

  d3.select("#line_chart > svg > g > path:last-child")
      .attr("stroke-dasharray", path_length)
      .attr("stroke-dashoffset", path_length)
      .transition(transitionPath)
      .attr("stroke-dashoffset", 0);

  svg.append("g")            // Add the X Axis
      .attr("class", "x axis")
      .attr("id", "x_axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .attr("id", "y_axis")
      .style("fill", "steelblue")
      .call(yAxisLeft);

  var focus_temp =  svg.append("g")
            .attr("class", "focus")
            .style("display", "none");

  focus_temp.append("circle")
            .attr("class", "circle_temp")
            .attr("r", 5);

  var focus_pluvio = svg.append("g")
            .attr("class", "focus")
            .style("display", "none");

      focus_pluvio.append("circle")
                .attr("class", "circle_pluvio")
                .attr("r", 5);

      focus_pluvio.append("rect")
          .attr("class", "tooltip_graph")
          .attr("width", 162)
          .attr("height", 68)
          .attr("x", 10)
          .attr("y", -22)
          .attr("rx", 4)
          .attr("ry", 4);

      focus_pluvio.append("text")
          .attr("class", "tooltip-date")
          .attr("x", 18)
          .attr("y", -2);

      focus_pluvio.append("text")
          .attr("x", 18)
          .attr("y", 18)
          .text("Pluviométrie :");

      focus_pluvio.append("text")
          .attr("class", "tooltip-pluvio")
          .attr("x", 106)
          .attr("y", 18);

      focus_pluvio.append("text")
          .attr("x", 18)
          .attr("y", 35)
          .text("Température :");

      focus_pluvio.append("text")
          .attr("class", "tooltip-temp")
          .attr("x", 106)
          .attr("y", 35);

      svg.append("rect")
          .attr("class", "overlay")
          .attr("width", width)
          .attr("height", height)
          .on("mouseover", function() { focus_pluvio.style("display", null); focus_temp.style("display", null);  })
          .on("mouseout", function() { focus_pluvio.style("display", "none"); focus_temp.style("display", "none"); })
          .on("mousemove",function () {
            var x0 = x.invert(d3.mouse(this)[0]),
                i = bisectDate(data, x0, 1),
                d0 = data[i - 1],
                d1 = data[i],
                d = x0 - d0.d > d1.d - x0 ? d1 : d0;
            focus_pluvio.attr("transform", "translate(" + x(d.d) + "," + y(d.p) + ")");
            focus_temp.attr("transform", "translate(" + x(d.d) + "," + y1(d.t) + ")");
            focus_pluvio.select(".tooltip-date").text(Date.parse(d.d)
                                                   .toLocaleDateString("fr-FR",options)
                                                   .toLowerCase()
                                                   .split(' ')
                                                   .map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' '));
            focus_pluvio.select(".tooltip-pluvio").text(d.p + " mm");
            focus_pluvio.select(".tooltip-temp").text(d.t + " °C");
          });

    // text label for the y axis
  svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style('fill', 'steelblue')
      .text("Pluviométrie (mm)");

  svg.append("g")
      .attr("class", "y axis")
      .attr("id", "y1_axis")
      .attr("transform", "translate(" + width + " ,0)")
      .style("fill", "red")
      .call(yAxisRight);

    // text label for the y1 axis
  svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 + width + margin.right)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style('fill', 'red')
      .text("Température (°C)");

  svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 2 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text("Evolution des températures et de la pluviométrie moyenne sur février");

  var tab_date = [];
  $('#x_axis > g > text').each(function(occ) {
    var x_axis_label = $(this).text();
    var jour = x_axis_label.substring(4);
    var mois = x_axis_label.substring(0, 3);
    mois = mois.replace('Feb', 'Fev');
    tab_date.push(jour + " " + mois);
    $(this).text(tab_date[occ]);
  });
}

function createDayLineChart(detailHoraires, nomStation, day) {

  // set the dimensions and margins of the graph
var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 720 - margin.left - margin.right,
    height = 375 - margin.top - margin.bottom,
    tooltip = { width: 100, height: 100, x: 10, y: -30 },
    options = {hour:"2-digit", minute:"2-digit"};

// parse the date / time
var parseTime = d3.timeParse("%m/%d/%Y %H");
    bisectDate = d3.bisector(function(d) { return d.h; }).left;

// set the ranges
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);
var y1 = d3.scaleLinear().range([height, 0]);

var xAxis = d3.axisBottom(x).ticks(5);

var yAxisLeft = d3.axisLeft(y).ticks(5);

var yAxisRight = d3.axisRight(y1).ticks(5);

// define the line
var valueline = d3.line().curve(d3.curveCardinal)
    .x(function(d) { return x(d.h); })
    .y(function(d) { return y(d.p); });
// define the line
var valueline2 = d3.line().curve(d3.curveCardinal)
    .x(function(d) { return x(d.h); })
    .y(function(d) { return y1(d.t); });

// append the svg obgect to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select("#day_line_chart").append("svg")
    .attr("viewBox", "0 0 " + width * 1.15 + " " + height  * 1.15)
    .append("g")
    .attr("transform","translate(" + margin.left + "," + margin.top + ")");

detailHoraires.forEach(function(d) {
  d.h = parseTime("2/" + day + "/1999 " + d.h);
  d.t = +(d.t / 100);
  d.p = +(Math.round( d.p * 10 / (stations.length - 1)) / 10);
});

// Scale the range of the data
x.domain(d3.extent(detailHoraires, function(d) { return d.h; }));
y.domain([0, d3.max(detailHoraires, function(d) {
  return Math.max(d.p); })]);
y1.domain([0, d3.max(detailHoraires, function(d) {
  return Math.max(d.t); })]);

const transitionPath = d3
  .transition()
  .ease(d3.easeSin)
  .duration(2500);

var path_pluvio = svg.append("path")
      .attr("d", valueline(detailHoraires));

var path_length = path_pluvio.node().getTotalLength();

d3.select("#day_line_chart > svg > g > path:first-child")
    .attr("stroke-dasharray", path_length)
    .attr("stroke-dashoffset", path_length)
    .transition(transitionPath)
    .attr("stroke-dashoffset", 0);

var path_temp = svg.append("path")        // Add the valueline2 path.
    .style("stroke", "red")
    .attr("d", valueline2(detailHoraires));

path_length = path_temp.node().getTotalLength();

d3.select("#day_line_chart > svg > g > path:last-child")
    .attr("stroke-dasharray", path_length)
    .attr("stroke-dashoffset", path_length)
    .transition(transitionPath)
    .attr("stroke-dashoffset", 0);

svg.append("g")            // Add the X Axis
    .attr("class", "x axis")
    .attr("id", "day_x_axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

svg.append("g")
    .attr("class", "y axis")
    .attr("id", "day_y_axis")
    .style("fill", "steelblue")
    .call(yAxisLeft);

var focus_temp =  svg.append("g")
          .attr("class", "focus")
          .style("display", "none");

focus_temp.append("circle")
          .attr("class", "circle_temp")
          .attr("r", 5);

var focus_pluvio = svg.append("g")
          .attr("class", "focus")
          .style("display", "none");

    focus_pluvio.append("circle")
              .attr("class", "circle_pluvio")
              .attr("r", 5);

    focus_pluvio.append("rect")
        .attr("class", "tooltip_graph")
        .attr("width", 162)
        .attr("height", 68)
        .attr("x", 10)
        .attr("y", -22)
        .attr("rx", 4)
        .attr("ry", 4);

    focus_pluvio.append("text")
        .attr("class", "tooltip-date")
        .attr("x", 18)
        .attr("y", -2);

    focus_pluvio.append("text")
        .attr("x", 18)
        .attr("y", 18)
        .text("Pluviométrie :");

    focus_pluvio.append("text")
        .attr("class", "tooltip-pluvio")
        .attr("x", 106)
        .attr("y", 18);

    focus_pluvio.append("text")
        .attr("x", 18)
        .attr("y", 35)
        .text("Température :");

    focus_pluvio.append("text")
        .attr("class", "tooltip-temp")
        .attr("x", 106)
        .attr("y", 35);

    svg.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .on("mouseover", function() { focus_pluvio.style("display", null); focus_temp.style("display", null);  })
        .on("mouseout", function() { focus_pluvio.style("display", "none"); focus_temp.style("display", "none"); })
        .on("mousemove",function () {
          var x0 = x.invert(d3.mouse(this)[0]),
              i = bisectDate(detailHoraires, x0, 1),
              d0 = detailHoraires[i - 1],
              d1 = detailHoraires[i],
              d = x0 - d0.h > d1.h - x0 ? d1 : d0;
          focus_pluvio.attr("transform", "translate(" + x(d.h) + "," + y(d.p) + ")");
          focus_temp.attr("transform", "translate(" + x(d.h) + "," + y1(d.t) + ")");
          focus_pluvio.select(".tooltip-date").text(Date.parse(d.h)
                                                 .toLocaleDateString("fr-FR",options)
                                                 .toLowerCase()
                                                 .split(' ')
                                                 .map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ')
                                                 .substring(11));
          focus_pluvio.select(".tooltip-pluvio").text(d.p + " mm");
          focus_pluvio.select(".tooltip-temp").text(d.t + " °C");
        });

  // text label for the y axis
svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x",0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style('fill', 'steelblue')
    .text("Pluviométrie (mm)");

svg.append("g")
    .attr("class", "y axis")
    .attr("id", "day_y1_axis")
    .attr("transform", "translate(" + width + " ,0)")
    .style("fill", "red")
    .call(yAxisRight);

  // text label for the y1 axis
svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 + width + margin.right)
    .attr("x",0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style('fill', 'red')
    .text("Température (°C)");

  svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 2 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text("Evolution des températures et de la pluviométrie à " + nomStation + " le " + day + " février");

  $('#day_x_axis > g > text').each(function(occ) {
    var x_axis_label = $(this).text();
    if(occ == 0)
    {
      x_axis_label = "00:00";
    }
    else if(occ == 1){
      x_axis_label = "03:00";
    }
    else if(occ == 2){
      x_axis_label = "06:00";
    }
    else if(occ == 3){
      x_axis_label = "09:00";
    }
    else if(occ == 4){
      x_axis_label = "12:00";
    }
    else if(occ == 5){
      x_axis_label = "15:00";
    }
    else if (occ == 6) {
      x_axis_label = "18:00";
    }
    else if(occ == 7) {
      x_axis_label = "21:00";
    }
    $(this).text(x_axis_label);
  });
}
