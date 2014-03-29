instantdc = function(data,rootElement) {
  var chartsCreated = 0;
  var chartMap = {};
  var rootNode = d3.select(rootElement);
  rootNode.append("div").html("<h5 class='dc-data-count' style='clear:both;'>"+
                              "<span class='filter-count'></span> selected out of <span class='total-count'>"+
                              "</span> records | <a href='javascript:dc.filterAll(); dc.renderAll();'>Reset All</a></h5>");
  var createChartTemplate = function(name){
  if (!name) {
    chartsCreated++;
    name = "instdchart"+chartsCreated;
  }
   
    var newNode = rootNode.append("div").attr("id",name).html(	"<strong>Chart</strong>"
      +"<a class='reset' href='#' style='display: none;'>reset</a>"
      +"<div class='clearfix'></div>");
    newNode.select(".reset").on("click",(function(chartSelector){
      return function(){
        if(chartMap[chartSelector]){chartMap[chartSelector].filterAll();}else{dc.filterAll();}
        dc.redrawAll();
      };
    })("#"+name));
      
    return name;
  };
 	var filterdata = crossfilter(data);
 	var allEntries = filterdata.groupAll();
    dc.dataCount(".dc-data-count")
		.dimension(filterdata)
		.group(allEntries);
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
                             .turnOnControls(true)
                       			.title(function(d) {
                                       			return d.key + ' ' + d.value;
                                      		});
          
        		chart.asSum = function(sumField) {
                       			chart.group(group.reduceSum(function(d) {
                                      				return d[sumField];
                                     			}));
                      		};
        		return chart;
       	};
  
 	chartFactory.row = function(field,selector) {
          if(!selector){
            selector = "#"+createChartTemplate();
          }
          
        		var chart = dc.rowChart(selector);
            chartMap[selector] = chart;
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

