function apiDayData(imei, date) {
  return axios.get(`http://139.59.14.38:5000/day?imei=${imei}&date=${date}`);
}

function initBarData() {
  var arr = [];
  for (var i = 0; i < 24; i++) {
    arr[i] = {
      x: i,
      y: 0
    };
  }

  return arr;
}

function sortData(data) {
  var state = {
    'date': data[data.length - 1].timestamp,
    'solarPower': 0,
    'gridPower': 0,
    'inverterPower': 0,
    'powerSaved': 0,
    'solarBarData': initBarData(),
    'gridBarData': initBarData(),
    'areaData': []
  };


  _.each(data, function (d) {

    var index = moment(d.timestamp, 'YY/MM/DD,hh:mm:ss').format('H');

    if (!isNaN(parseInt(d.IV)) && !isNaN(parseInt(d.IR)) && !isNaN(parseInt(d.IY)) && !isNaN(parseInt(d.IB))) {
      state.powerSaved += ((d.IV * (parseInt(d.IR) + parseInt(d.IY) + parseInt(d.IB))) / 1000);
    }

    if (!isNaN(parseInt(d.PV)) && !isNaN(parseInt(d.PC))) {
      state.solarBarData[index] = {
        x: state.solarBarData[index].x,
        y: parseInt(state.solarBarData[index].y) + (d.PV * d.PC / 1000)
      };
    }

    if (!isNaN(parseInt(d.GV)) && !isNaN(parseInt(d.GC))) {
      state.gridBarData[index] = {
        x: state.gridBarData[index].x,
        y: state.gridBarData[index].y + (d.GV * d.GC / 1000)
      };
    }
  });

  if (!isNaN(parseInt(data[data.length - 1].PV)) && !isNaN(parseInt(data[data.length - 1].PC))) {
    state.solarPower = (data[data.length - 1].PV * data[data.length - 1].PC) / 1000;
  }

  if (!isNaN(parseInt(data[data.length - 1].GV)) && !isNaN(parseInt(data[data.length - 1].GC))) {
    state.gridPower = (data[data.length - 1].GV * data[data.length - 1].GC) / 1000;
  }

  if (!isNaN(parseInt(data[data.length - 1].IV)) && !isNaN(parseInt(data[data.length - 1].IR)) && !isNaN(parseInt(data[data.length - 1].IY)) && !isNaN(parseInt(data[data.length - 1].IB))) {
    state.inverterPower += ((data[data.length - 1].IV * (parseInt(data[data.length - 1].IR) + parseInt(data[data.length - 1].IY) + parseInt(data[data.length - 1].IB))) / 1000);
  }

  // state.solarPower = state.solarPower / 60;
  // state.gridPower = state.gridPower / 60;
  state.powerSaved = state.powerSaved / 60;


  console.log(state.solarBarData);
  return state;
}


function fetchData(dispatch, type, date) {
  switch (type) {
    case 'DAY':
        apiDayData('357804045965278', date)
        .then(function(response) {
          dispatch({type: type, payload: sortData(response.data)});
        })
        .catch(function(error) {
          console.log('Error in server', error);
        });
      break;
    case 'TODAY':
        apiDayData('357804045965278', date)
        .then(function(response) {
          dispatch({type: type, payload: sortData(response.data)});
        })
        .catch(function(error) {
          console.log('Error in server', error);
        });
      break;
    case 'YESTERDAY':
        apiDayData('357804045965278', date)
        .then(function(response) {
          dispatch({type: type, payload: sortData(response.data)});
        })
        .catch(function(error) {
          console.log('Error in server', error);
        });
      break;
    default:
      break;
  }
}


function constructStacked(svg, height, width, callback, data) {
  var n = 2, // number of layers
      m = 24, // number of samples per layers
      stack = d3.layout.stack(),
      margin = { top: 16, bottom: 16},
      // layers = stack(d3.range(n). map(function() { return bumpLayer(m, .1); } )),
      layers = stack(data),
      yStackMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); });

      height = height - margin.top - margin.bottom;


console.log(svg);

  var x = d3.scale.ordinal()
            .domain(d3.range(m))
            .rangeBands([0, width], .08);

  var y = d3.scale.linear()
            .domain([0, yStackMax])
            .range([height, 0]);



  var color = d3.scale.linear()
            .domain([0, n - 1])
            .range(["#C67B00", "#7ED321"]);


  var layer = svg.selectAll(".layer")
      .data(layers)
      .enter().append("g")
      .attr("class", "layer")
      .attr("opacity", "0.8")
      .style("fill", function(d, i) { return color(i); });



  var rect = layer.selectAll("rect")
      .data(function(d) { return d; })
      .enter().append("rect")
      .attr("x", function(d) { return x(d.x); })
      .attr("y", height)
      .attr("width", x.rangeBand())
      .attr("height", 0)
      .on("click", d => {
        callback(d.x);
      });

      rect.transition()
          .duration(500)
          .delay(function(d, i) { return i * 10; })
          .attr("y", function(d) { return y(d.y0 + d.y); })
          .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); })
        .transition()
          .attr("x", function(d) { return x(d.x); })
          .attr("width", x.rangeBand());

          var xScale = d3.scale.ordinal()
            .rangePoints([0, width]);

          var xAxis = d3.svg.axis()
            .scale(x)
            .tickValues(x.domain().filter(function(d, i) { return !(i % 2); }))
            .orient("bottom");


          svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);
  // function dummyData() {
  //   return [
  //     [
  //       {x: 0, y: 313},
  //       {x: 1, y: 368},
  //       {x: 2, y: 110},
  //       {x: 3, y: 223},
  //       {x: 4, y: 244},
  //       {x: 5, y: 213},
  //       {x: 6, y: 2},
  //       {x: 7, y: 10},
  //       {x: 8, y: 223},
  //       {x: 9, y: 213},
  //       {x: 10, y: 213},
  //       {x: 11, y: 200},
  //       {x: 12, y: 213},
  //       {x: 13, y: 202},
  //       {x: 14, y: 211},
  //       {x: 15, y: 280},
  //       {x: 16, y: 244},
  //       {x: 17, y: 242},
  //       {x: 18, y: 222},
  //       {x: 19, y: 229},
  //       {x: 20, y: 220},
  //       {x: 21, y: 4},
  //       {x: 22, y: 203},
  //       {x: 23, y: 299},
  //     ],
  //     [
  //       {x: 0, y: 100},
  //       {x: 1, y: 60},
  //       {x: 2, y: 418},
  //       {x: 3, y: 180},
  //       {x: 4, y: 244},
  //       {x: 5, y: 213},
  //       {x: 6, y: 2},
  //       {x: 7, y: 10},
  //       {x: 8, y: 223},
  //       {x: 9, y: 213},
  //       {x: 10, y: 213},
  //       {x: 11, y: 200},
  //       {x: 12, y: 213},
  //       {x: 13, y: 202},
  //       {x: 14, y: 211},
  //       {x: 15, y: 280},
  //       {x: 16, y: 244},
  //       {x: 17, y: 242},
  //       {x: 18, y: 222},
  //       {x: 19, y: 229},
  //       {x: 20, y: 220},
  //       {x: 21, y: 4},
  //       {x: 22, y: 203},
  //       {x: 23, y: 299},
  //     ]
  //   ];
  // }
}


function constructAreaChart(svg, height, width, callback) {
  var path = svg.append('g').append('path').on('click', callback);

  var data = [{"date":"20140101","count":18},{"date":"20140116","count":26},{"date":"20140201","count":27},{"date":"20140216","count":14},{"date":"20140301","count":23},{"date":"20140316","count":14},{"date":"20140401","count":26},{"date":"20140416","count":34},{"date":"20140501","count":27},{"date":"20140516","count":23},{"date":"20140601","count":14},{"date":"20140616","count":28},{"date":"20140701","count":33},{"date":"20140716","count":33},{"date":"20140801","count":17},{"date":"20140816","count":14},{"date":"20140901","count":29},{"date":"20140916","count":28},{"date":"20141001","count":13},{"date":"20141016","count":12},{"date":"20141101","count":30},{"date":"20141116","count":18},{"date":"20141201","count":31},{"date":"20141216","count":27}];

  data.forEach(function (d) {
    d.date = d3.time.format("%Y%m%d").parse(d.date);
  });

  var dates = _.pluck(data, 'date');
  var counts = _.pluck(data, 'count');

  var x = d3.time.scale()
            .domain(d3.extent(dates))
            .range([0, width]);
  var y = d3.scale.linear()
            .domain(d3.extent(counts))
            .range([height, 0]);

  var area = d3.svg.area()
            .interpolate('bundle')
            .x(function (d) {
              return x(d.date);
            })
            .y0(function (d) {
              return y(0);
            })
            .y1(function (d) {
              return y(d.count);
            });

  path
    .datum(data)
    .transition()
    .duration(450)
    .attr('d', area)
    .attr('fill', '#92B8E4');
}
