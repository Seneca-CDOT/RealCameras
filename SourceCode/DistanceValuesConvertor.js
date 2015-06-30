
var Application = Application || {};

Application.MeterDistanceValue = (function () {

	function MeterDistanceValue (value, units) {

		this.units = units;
		this.value = value;
	};
	
	MeterDistanceValue.prototype.getValue = function () {

		var meters = privateMethods[this.units].call(this);
		return meters;
	}

	var privateMethods = Object.create(MeterDistanceValue.prototype);
	privateMethods.m = function () {

		return this.value;
	}
	privateMethods.cm = function () {

		return 0.01 * this.value;
	}
	privateMethods.mm = function () {

		return 0.001 * this.value;
	}
	privateMethods.feet = function () {

		return 0.3048 * this.value;
	}
	privateMethods.inches = function () {

		return 0.0254 * this.value;
	}

	return MeterDistanceValue;
})();

Application.DistanceValuesConvertor = (function () {

	var instance = null;
	function createInstance () {

		// var one = 1; 'one' corresponds to 1 meter
		// var one = 0.3048; 'one' corresponds to 0.3048 meter (1 feet)
		// var one = 1;
		var one = 0.3048;
		var newInstance = function (value, units) {
			var meters = new Application.MeterDistanceValue(value, units);
			return meters.getValue() / one;
		};
		return newInstance;
	}

	return {
        getInstance: function () {
            if (!instance) {

                instance = createInstance();
            }
            return instance;
        }
    };
})();