function canvasData() {
    createSpinner('.live-reports')
    $('#chartContainer').hide()
    let toggledCoinsArray = Array.from(toggledCoins.keys());
    
    for (let i = 0; i < toggledCoinsArray.length; i++) {
      toggledCoinsArray[i] = toggledCoinsArray[i].toUpperCase();
    }
  
    var dataPoints1 = [];
    var dataPoints2 = [];
    var dataPoints3 = [];
    var dataPoints4 = [];
    var dataPoints5 = [];
    var dataPointsArray = [dataPoints1, dataPoints2, dataPoints3, dataPoints4, dataPoints5];
  
    var options = {
      title: {
        text: "Live reports",
        fontSize: 38
      },
      axisX: {
        title: "Updates every 2 sec",
      },
      axisY: {
        suffix: "$"
      },
      toolTip: {
        shared: true
      },
      legend: {
        cursor: "pointer",
        verticalAlign: "top",
        fontSize: 16,
        fontColor: "dimGrey",
        itemclick: toggleDataSeries
      },
      data: [{
        type: "line",
        xValueType: "dateTime",
        yValueFormatString: "###.00$",
        xValueFormatString: "hh:mm:ss TT",
        showInLegend: true,
        name: toggledCoinsArray[0],
        dataPoints: dataPoints1
      },
      {
        type: "line",
        xValueType: "dateTime",
        yValueFormatString: "###.00$",
        showInLegend: true,
        name: toggledCoinsArray[1],
        dataPoints: dataPoints2
      }, {
        type: "line",
        xValueType: "dateTime",
        yValueFormatString: "###.00$",
        showInLegend: true,
        name: toggledCoinsArray[2],
        dataPoints: dataPoints3
      }, {
        type: "line",
        xValueType: "dateTime",
        yValueFormatString: "###.00$",
        showInLegend: true,
        name: toggledCoinsArray[3],
        dataPoints: dataPoints4
      }, {
        type: "line",
        xValueType: "dateTime",
        yValueFormatString: "###.00$",
        showInLegend: true,
        name: toggledCoinsArray[4],
        dataPoints: dataPoints5
      }]
    };
  
    var chart = $("#chartContainer").CanvasJSChart(options);
  
    function toggleDataSeries(e) {
      if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
        e.dataSeries.visible = false;
      }
      else {
        e.dataSeries.visible = true;
      }
      e.chart.render();
    }
  
    var updateInterval = 2000;
  
    var time = new Date;
  
    function updateChart() {
      if (toggledCoinsArray[0]) {
        let coinsToUrl = toggledCoinsArray.join();
  
        $.ajax({
          url: `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${coinsToUrl}&tsyms=USD`,
          type: 'GET',
          success: function (data) {
            $('.live-reports').find('.spinner').remove();
            $('#chartContainer').show()
            
            let coinsPriceArray = [];
            for (let i = 0; i < Object.keys(data).length; i++) {
              coinsPriceArray.push(data[Object.keys(data)[i]].USD);
            }

            for (var i = 0; i < 1; i++) {
              time.setTime(time.getTime() + updateInterval);
              for (let i = 0; i < coinsPriceArray.length; i++) {
                // Pushing the new values
                if (coinsPriceArray[i]) {
                  dataPointsArray[i].push({
                    x: time.getTime(),
                    y: coinsPriceArray[i]
                  });
                }
                options.data[i].legendText = toggledCoinsArray[i] + ": " + coinsPriceArray[i] + "$";
              }
            }
  
            $("#chartContainer").CanvasJSChart().render();
          },
          error: function (request, message, error) {
            console.log('Failure');
          }
        });
      }
    }
  
    updateChart(); // Adds first set of dataPoints 
    canvasInterval = setInterval(function () { updateChart() }, updateInterval);
  }