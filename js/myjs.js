var customerName = '';  // customer name, chosen by the user
var customerDatapoint = '';  // the datapoint, chosen by the user

$(document).ready(function() {
	$.ajax('http://172.30.0.112:8421/api/customers')  // GET request that recieves the list of customers
	
	.then(function (resultCustomersData) {
		console.log(resultCustomersData);
		
		// inserting a select bar for choosing the customer's name
		var codeToInsert = 'Please select the name of the customer: <select id="selectCustomer"><option value="" selected></option>';
		for (var i=0; i<resultCustomersData.customers.length; i++) {
			codeToInsert += '<option value="'+resultCustomersData.customers[i]+'">'+resultCustomersData.customers[i]+'</option>';
		}
		codeToInsert += '</select>';		
		$('#selectArea').html(codeToInsert);
		
		// user chooses the value from the bar
		$('#selectCustomer').on('change', function() {
			customerName = $('#selectCustomer').val();
			$.ajax('http://172.30.0.112:8421/api/'+$('#selectCustomer').val()+'/datapoints')  // GET request that recieves the list of datapoints for chosen customer
			
			.then(function (resultDatapointsData) {
				console.log(resultDatapointsData);
				
				// showing customer's name and inserting a select bar for choosing the customer's name
				var codeToInsert = 'Customer\'s name: <b>'+customerName+'</b>. <p>Please select the datapoint for this customer: <select id="selectDatapoint"><option value="" selected></option>';
				for (var i=0; i<resultDatapointsData.datapoints.length; i++) {
					codeToInsert += '<option value="'+resultDatapointsData.datapoints[i]+'">'+resultDatapointsData.datapoints[i]+'</option>';
				}
				codeToInsert += '</select>';
				$('#selectArea').html(codeToInsert);
				
				// user chooses the value from the bar
				$('#selectDatapoint').on('change', function() {
					customerDatapoint = $('#selectDatapoint').val();
					$.ajax({
						url: 'http://172.30.0.112:8421/api/'+customerName+'/'+customerDatapoint,
						type:'POST',
						data: JSON.stringify({'endtime':'2015-01-01 09:30:00', 'starttime': '2015-01-01 09:00:00'}),
						contentType: 'application/json; charset=utf-8',
						dataType: 'json',
					})  // POST request that recieves the timeseries, for chosen customer and datapoint, sending the date
					
					.then(function (resultTimeSeries) {
						console.log(resultTimeSeries);						
						
						// showing customer's name and datapoint
						var codeToInsert = 'Customer\'s name: <b>'+customerName+'</b>. <p>Customer\'s datapoint: <b>'+customerDatapoint+'</b>.';
						$('#selectArea').html(codeToInsert);
						$('#downloadArea').html('<a href="data:;base64,77u/'+btoa(resultTimeSeries.timeseries)+'" download="time_series.json">download generated data</a>');
						
						// converting date to highcharts understable type
						for (var i=0; i<resultTimeSeries.timeseries.length; i++) {
							resultTimeSeries.timeseries[i][0] = parseInt(resultTimeSeries.timeseries[i][0]);
						}
						
						// sorting the data by date
						resultTimeSeries.timeseries.sort(function(a, b) {
    						return a[0] - b[0];
						});
						
						// visualizaing time series using Highcharts
						$('#chartArea').highcharts({
							chart: {
								zoomType: 'x'
							},
							title: {
								text: 'Customer data over time'
							},
							subtitle: {
								text: document.ontouchstart === undefined ?
										'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
							},
							xAxis: {
								type: 'datetime'
							},
							yAxis: {
								title: {
									text: 'Customer data'
								}
							},
							legend: {
								enabled: false
							},
							plotOptions: {
								area: {
									fillColor: {
										linearGradient: {
											x1: 0,
											y1: 0,
											x2: 0,
											y2: 1
										},
										stops: [
											[0, Highcharts.getOptions().colors[0]],
											[1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
										]
									},
									marker: {
										radius: 2
									},
									lineWidth: 1,
									states: {
										hover: {
											lineWidth: 1
										}
									},
									threshold: null
								}
							},

							series: [{
								type: 'area',
								name: 'Customer data',
								data: resultTimeSeries.timeseries
							}]
						});
					})
					.fail(function(xhr, status, error) {
        				console.log('Error while sending a POST request. Error: '+error+'. XHR: '+xhr+'. Status: '+status);  // handling request errors for getting timeseries
    				});
				});
			})
			.fail(function(xhr, status, error) {
        		console.log('Error while sending a GET request. Error: '+error+'. XHR: '+xhr+'. Status: '+status);  // handling request errors for getting customer's datapoint
    		});
		});
	})
	.fail(function(xhr, status, error) {
    	console.log('Error while sending a GET request. Error: '+error+'. XHR: '+xhr+'. Status: '+status);  // handling request errors for getting customer's name
    });
});