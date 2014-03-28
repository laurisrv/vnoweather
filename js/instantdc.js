instantdc = function(data) {
	var filterdata = crossfilter(data);
	var allEntries = filterdata.groupAll();
	var chartFactory = function(chart, field) {
		var dim = filterdata.dimension(function(d) {
			return d[field];
		});
		var group = dim.group();
		chart
			.group(group)
			.dimension(dim)
			.valueAccessor(function(p) {
			return p.value;
		})
			.label(function(d) {
			return d.key;
		})
			.title(function(d) {
			return d.key + " " + d.value;
		});

		chart.asSum = function(sumField) {
			chart.group(group.reduceSum(function(d) {
				return d[sumField];
			}));
		};
		return chart;
	};

	chartFactory.row = function(selector, field) {
		var chart = dc.rowChart(selector);
		chart.width(180)
			.height(1000)
			.margins({
			top: 20,
			left: 10,
			right: 10,
			bottom: 20
		})
			.elasticX(true)
			.xAxis().ticks(4);
		return chartFactory(chart, field);
	};

	chartFactory.bar = function(selector, field) {
		var chart = dc.barChart(selector);
		chart.width(990)
			.height(40)
			.margins({
			top: 0,
			right: 50,
			bottom: 20,
			left: 40
		})
			.centerBar(true)
			.gap(1)
			//.x(d3.time.scale().domain([new Date(2012, 11, 1), new Date(2014, 03, 31)]))
			.round(d3.time.month.round)
			//.alwaysUseRounding(true)
			.xUnits(d3.time.months);
		;
		return chartFactory(chart, field);
	};

	chartFactory.pie = function(selector, field) {
		var chart = dc.pieChart(selector);
		if (chart) {
			chart.width(180)
				.height(180)
				.radius(80)
				.innerRadius(30);
			return chartFactory(chart, field);
		}
		return null;
	};

	return chartFactory;
};

