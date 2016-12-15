Bodewell Resource Metric
========================

```js
const Metric = require("bodewell-metric");

var metric = new Metric();

assert(metric.valueOf() === undefined);

metric.record(42);
assert(metric.valueOf() === 42);

metric.record(13);
assert(metric.valueOf() === 42);

metric.recorded().forEach(when => {
    console.log(sample.when, sample.value);
});
```
