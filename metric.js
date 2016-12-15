const assign = Object.assign;
const freeze = Object.freeze;

const Metric$internal = new WeakMap();

/**
 * Resource metric.
 * @constructor
 */
function Metric() {
    Metric.init(this);
}

/**
 * True if value is a Metric instance.
 * @param {*} value
 * @returns {boolean}
 */
Metric.isMetric = function(value) {
    return Metric$internal.has(value);
};

/**
 * Initialize metric internals.
 * @param {Metric} metric
 */
Metric.init = function(metric) {
    Metric$internal.set(metric, {
        data: new Set()
    });
};

/**
 * Mix Metric class into a constructor or object.
 * @param {function|object} mixed
 */
Metric.mix = function(mixed) {
    mixed = typeof mixed === "function" ? mixed.prototype : mixed;

    Object.keys(Metric.prototype).forEach(key => {
        mixed[key] = Metric.prototype[key];
    });
};

/**
 * Record metric data.  Object data must include a valueOf method which
 * evaluates to a number or boolean.
 * @param {object|number|boolean} data
 * @param {Date} [when]
 */
Metric.prototype.record = function(sample, when) {
    var type, value;

    if (!(when instanceof Date)) when = new Date();

    type = typeof sample;
    value = sample;

    if (type === "object") {
        if (typeof sample.valueOf !== "function") {
            throw new TypeError("invalid sample; object must have valueOf");
        }

        sample = freeze(assign({valueOf: sample.valueOf}, sample));
        value = sample.valueOf();
        type = typeof value;
    }

    switch (type) {
        case "number":
        case "boolean":
            // ok
            break;
        default:
            throw new TypeError(`unexpected ${type} value`);
    }

    Metric$internal.get(this).data.push([when, value, sample]);
};

/**
 * Return recorded data as objects with .value, .when, and .sample properties.
 * @returns {array}
 */
Metric.prototype.recorded = function() {
    return Array.from(Metric$internal.get(this).data).map(datum => ({
        when: datum[0],
        value: datum[1],
        sample: datum[2]
    }));
};

/**
 * Return most recent sample value.
 * @returns {number|boolean|undefined}
 */
Metric.prototype.valueOf = function() {
    var data = Metric$internal.get(this).data;
    return data.length ? data.slice(-1)[0][1] : undefined;
};

module.exports = Metric;
