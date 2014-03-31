instantdc = function(data, rootElement) {
    var chartsCreated = 0;
    var chartMap = {};
    var mapUtils = {
         yearMonth: {
            value: d3.time.month,
            units: d3.time.months,
            round: d3.time.month.round,
            scale: d3.time.scale,
            mappedFieldName: function(field) {
                return field + "idcYearMonth";
            }
        },
        month: {
            value: function(d){return d.getMonth()+1;},
            units: d3.time.months,
            round: d3.time.month.round,
            scale: d3.time.scale,
            mappedFieldName: function(field) {
                return field + "idcMonth";
            }
        },
        year: {
            value: d3.time.year,
            units: d3.time.years,
            round: d3.time.year.round,
            scale: d3.time.scale,
            mappedFieldName: function(field) {
                return field + "idcYear";
            }
        },
        ident: {
            value: d3.scale.identity(),
            scale: d3.scale.linear,
            mappedFieldName: function(field) {
                return field + "idcIdent";
            }
        }
    };
    var rootNode = d3.select(rootElement);
    rootNode.append("div").html("<h5 class='dc-data-count' style='clear:both;'>" + "<span class='filter-count'></span> selected out of <span class='total-count'>" + "</span> records | <a href='javascript:dc.filterAll(); dc.renderAll();'>Reset All</a></h5>");
    var createChartTemplate = function(name) {
        if (!name) {
            chartsCreated++;
            name = "instdchart" + chartsCreated;
        }

        var newNode = rootNode.append("div").attr("id", name).html("<strong>Chart</strong>" + "<a class='reset' href='#' style='display: none;'>reset</a>" + "<div class='clearfix'></div>");
        newNode.select(".reset").on("click", (function(chartSelector) {
            return function() {
                if (chartMap[chartSelector]) {
                    chartMap[chartSelector].filterAll();
                }
                else {
                    dc.filterAll();
                }
                dc.redrawAll();
            };
        })("#" + name));

        return name;
    };
    var filterdata = crossfilter(data);
    var allEntries = filterdata.groupAll();
    dc.dataCount(".dc-data-count").dimension(filterdata).group(allEntries);
    var chartFactory = function(options, chartInitializer) {
        var selector = options.selector;
        if (!selector) {
            selector = "#" + createChartTemplate();
        }
        if (!options.mapper) {
            options.mapper = mapUtils.ident;
        }
        if (!options.mapper.value && typeof options.mapper == 'string') {
            options.mapper = mapUtils[options.mapper];
        }
        var field = options.mapper.mappedFieldName(options.field);
        var valMapFunc = options.mapper.value;
        data.forEach(function(d) {
            d[field] = valMapFunc(d[options.field]);
        });

        if (!options.scale) {
            options.scale = options.mapper.scale().domain(d3.extent(data, function(d) {
                return d[field];
            }));
        }
        var chart = chartInitializer(selector);
        chartMap[selector] = chart;

        var dim = filterdata.dimension(function(d) {
            return d[field];
        });
        var group = dim.group();
        chart.group(group).dimension(dim).valueAccessor(function(p) {
            return p.value;
        }).label(function(d) {
            return d.key;
        }).turnOnControls(true).title(function(d) {
            return d.key + ' ' + d.value;
        });

        chart.asSum = function(sumField) {
            chart.group(group.reduceSum(function(d) {
                return d[sumField];
            }));
        };
        return chart;
    };

    chartFactory.row = function(options) {
        return chartFactory(options, function(selector) {
            var chart = dc.rowChart(selector);
            chart.width(180).height(500).margins({
                top: 20,
                left: 10,
                right: 10,
                bottom: 20
            }).elasticX(true).xAxis().ticks(4);
            return chart;
        });
    };

    chartFactory.bar = function(options) {
        return chartFactory(options, function(selector) {
            var chart = dc.barChart(selector);
            chart.width(500).height(400).margins({
                top: 0,
                right: 50,
                bottom: 20,
                left: 40
            }).centerBar(true).gap(1);
            var xAxis = chart.x(options.scale);
            if (options.mapper.round) {
                xAxis.round(options.mapper.round);
                //.alwaysUseRounding(true);
            }
            if (options.mapper.units) {
                xAxis.xUnits(options.mapper.units);
            }

            return chart;
        });
    };

    chartFactory.pie = function(selector, field) {
        var chart = dc.pieChart(selector);
        if (chart) {
            chart.width(180).height(180).radius(80).innerRadius(30);
            return chartFactory(chart, field);
        }
        return null;
    };

    return chartFactory;
};
