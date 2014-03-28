reducerlib = {
};
reducerlib.average = function(dimension, valueAccessor) {
	if (!valueAccessor) {
		valueAccessor = function(d) {
			return d;
		};
	}
	var add =
		function(p, v) {
			++p.count;
			p.sum += valueAccessor(v);
			//p.avg
			//p.avg = Math.round(p.sum / p.count);
			return p;
		},
		remove =
		function(p, v) {
			--p.count;
			p.sum -= valueAccessor(v);
			//p.avg = Math.round(p.sum / p.count);
			return p;
		},
		init =
		function() {
			return {
				sum: 0,
				//avg: undefined
				count: 0
			};
		};
	return dimension.group().reduce(add, remove, init);
};
reducerlib.average.averageValue = function(p) {
	return Math.round(p.sum / p.count);
};
reducerlib.average.count = function(p) {
	return p.count;
};

reducerlib.linearFit = function(dimension, x, y) {
	if (!x) {
		x = function(d) {
			return d.x;
		};
	}
	if (!y) {
		y = function(d) {
			return d.y;
		};
	}

	var add =
		function(p, v) {
			++p.count;
			var tx = x(v), ty = y(v);
			p.sumx += tx;
			p.sumy += ty;
			p.sumxx += tx * tx;
			p.sumxy += tx * ty;
			p.sumyy += ty * ty;
			return p;
		},
		remove =
		function(p, v) {
			--p.count;
			var tx = x(v), ty = y(v);
			p.sumx -= tx;
			p.sumy -= ty;
			p.sumxx -= tx * tx;
			p.sumxy -= tx * ty;
			p.sumyy -= ty * ty;
			return p;
		},
		init =
		function() {
			return {
				sumx: 0,
				sumy: 0,
				sumxx: 0,
				sumxy: 0,
				sumyy: 0,
				count: 0
			};
		};
	reducerlib.linearFit.slope = function(p) {
		p = p.value||p;
		var N = p.count;
		var w1 = (N * p.sumxy - p.sumx * p.sumy) / (N * p.sumxx - p.sumx * p.sumx);
		//var w0 = p.sumy / N - p.sumx * w1 / N;
		return w1;
	};
	reducerlib.linearFit.offset = function(p) {
		p = p.value||p;
		var N = p.count;
		var w1 = (N * p.sumxy - p.sumx * p.sumy) / (N * p.sumxx - p.sumx * p.sumx);
		var w0 = p.sumy / N - p.sumx * w1 / N;
		return w0;
	};
	reducerlib.linearFit.r2 = function(p) {
		p = p.value||p;
		var N = p.count;
		var r2 = (N * p.sumxy - p.sumx * p.sumy);
		r2 = r2*r2 / ((N * p.sumxx - p.sumx * p.sumx)*(N * p.sumyy - p.sumy * p.sumy));
		//var w0 = p.sumy / N - p.sumx * w1 / N;
		return r2;
	};

	reducerlib.linearFit.count = function(p) {
		p = p.value||p;
		return p.count;
	};
	var g =dimension.group().reduce(add, remove, init);
	/*
	g.reducerlibOriginalAll = g.all;
	g.all = (function(original){
		return function(){
			var res = original();
			res = res.filter(function(d){
				return d.value.count>100;
			});
			return res;
		};
	})(g.all);
	*/
	return g;
};

reducerlib.quantile = function(dimension, valueAccessor) {
	if (!valueAccessor) {
		valueAccessor = function(d) {
			return d;
		};
	}
	function initQuantileData(d) {
		if (!d.value.rawdata.quantiles) {
			d.value.rawdata.quantiles = {
			};
		}
		if (!d.value.rawdata.quantiles.sortedvalues) {
			var arr = [];
			for (var v in d.value.rawdata.valuemap) {
				var cnt = d.value.rawdata.valuemap[v], nval = + v;
				for (var i = 0; i < cnt; i++) {
					arr.push(nval);
				}
			}
			arr.sort(function(a, b) {
				return a - b;
			});
			d.value.rawdata.quantiles.sortedvalues = arr;
		}
	}
	reducerlib.quantile.median = function(d) {
		var res;
		if (d && d.value && d.value.rawdata && d.value.rawdata.valuemap) {
			initQuantileData(d);
			if (d.value.rawdata.quantiles.median === undefined) {
				d.value.rawdata.quantiles.median = d3.median(d.value.rawdata.quantiles.sortedvalues);
			}
			return d.value.rawdata.quantiles.median || 0;
		}
		return res;
	};
	reducerlib.quantile.lowQuantile = function(d) {
		var res;
		if (d && d.value && d.value.rawdata && d.value.rawdata.valuemap) {
			initQuantileData(d);
			if (d.value.rawdata.quantiles.q1 === undefined) {
				d.value.rawdata.quantiles.q1 = d3.quantile(d.value.rawdata.quantiles.sortedvalues, 0.1);
			}
			return d.value.rawdata.quantiles.q1 || 0;
		}
		return res;
	};
	reducerlib.quantile.highQuantile = function(d) {
		var res;
		if (d && d.value && d.value.rawdata && d.value.rawdata.valuemap) {
			initQuantileData(d);
			if (d.value.rawdata.quantiles.q9 === undefined) {
				d.value.rawdata.quantiles.q9 = d3.quantile(d.value.rawdata.quantiles.sortedvalues, 0.9);
			}
			return d.value.rawdata.quantiles.q9 || 0;
		}
		return res;
	};
	reducerlib.quantile.count = function(p) {
		return p.count;
	};
	var add =
		function(p, v) {
			++p.count;
			var rdhash = "" + valueAccessor(v);
			p.rawdata.valuemap[rdhash] = p.rawdata.valuemap[rdhash] ? p.rawdata.valuemap[rdhash] + 1 : 1;
			p.rawdata.quantiles = null;
			return p;
		},
		remove =
		function(p, v) {
			--p.count;
			var rdhash = "" + valueAccessor(v);
			if (p.rawdata.valuemap[rdhash]) {
				p.rawdata.valuemap[rdhash]--;
			}
			p.rawdata.quantiles = null;
			return p;
		},
		init =
		function() {
			return {
				rawdata: {
					valuemap: {
					}
				},
				count: 0
			};
		};
	return dimension.group().reduce(add, remove, init);
};

