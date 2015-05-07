# workshopper-wat

> workshopper web application tester

# Screenshots

![assertions.png][8]

![results.png][9]

# Inspiration

I needed a wrapper for [workshopper-exercise][1] that provided a simple interface to verify exercises where the user would build a web application that responded in a certain way to a request. Lin Clark's [demo-workshopper][2] gave me [a great starting point][3], but I needed it to be more flexible than just comparing response bodies byte per byte when I was building my [**perfschool**][6] workshopper.

# Install

```shell
npm install workshopper-wat --save
```

# Setup

Please add these resource localization strings to your `i18n` manifest.

```json
{
  "common": {
    "exercise": {
      "fail": {
        "connection": "Error connecting to {{{url}}} ({{{code}}})",
        "unverified": "The exercise doesn't seem to have a verified solution!"
      }
    }
  }
}
```

# Usage

To get started, create a [workshopper][4] exercise file like the one below.

```js
var wat = require('workshopper-wat');
var exercise = wat(options);

module.exports = exercise;
```

Your exercise wants the human to create a `solution.js` file that listens on a port that will be provided to them. Suppose they come up with the solution found below.

```js
var http = require('http');
var port = process.argv[2] || 7777;

http.createServer(requestHandler).listen(port, '127.0.0.1');

function requestHandler (req, res) {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('E_WELCOME_MAT\n');
}
```

During verification, `workshopper-wat` will make a request against their server, using the port that was passed as `process.argv[2]`, and let you verify the output.

When the exercise is solved, rather than display the reference `solution.js` file like [workshopper-exercise][1] does, `workshopper-wat` renders `solution.md` following the same rules that are commonly used for `problem.md`. That means there's support for `solution.en.md`, `solution.en.txt`, and all that stuff.

# Options

You could ask the human to come up with many different types of responses, maybe even give them a special payload every time that they have to react to. That's where the `options` come in.

## `options.verify`

You must pass a `verify(t, req, res)` callback that asserts whether the solution completes the exercise successfully or not. The `verify` callback is pretty interesting if I may say so myself. It takes three arguments:

### `t`

This is inspired by [tape][7] and allows you to run assertions on the response. It has a few convenient methods.

- `t.pass(message, passed?)` if `passed` is unset or `true`, the assertion will pass
- `t.fail(message, failed?)` if `failed` is unset or `true`, the assertion will fail
- `t.fpass(id, formats?, passed?)` same as `t.pass`, except `exercise.__(id, formats)` will be used
- `t.ffail(id, formats?, failed?)` same as `t.fail`, except `exercise.__(id, formats)` will be used
- `t.group(name)` finds or creates a group of assertions. Useful to categorize and group together a series of assertions.
- `t.groupend()` leaves the `t.group`. Note that groups can be _"nested"_, so make sure to close groups if that's not what you want
- `t.fgroup(id, formats?)` same as `t.group`, except `exercise.__(id, formats)` will be used
- `t.end(err?)` the exercise will end, if an error was passed it'll be thrown
- `t.error(err?)` an alias for `t.end`

### `req`

A few data points about the request that was made.

- `req.url` is the fully qualified URL. Typically something like `http://localhost:1396/foo`
- `req.port` is the requested port, e.g `1396`

### `res`

The response object as returned by [request][5].

## `options.endpoint`

By default, `/` is requested, but you could set this to `/test`, or anything else.

## `options.requestOptions`

You can set `requestOptions` to an object with any options you may want to pass to [request][5]. You shouldn't set the URL here so that the `port` is handled for you. If you want to query something other than `/`, just change `options.endpoint` instead.

## `options.piped`

When `true`, the output of their solution will be piped to standard output.

## `options.wait`

By default we wait `500ms` for their server to start handling requests, you can provide your own mechanism.

# License

MIT

[1]: https://github.com/workshopper/workshopper-exercise
[2]: https://github.com/linclark/demo-workshopper
[3]: https://github.com/linclark/demo-workshopper/blob/master/exercises/test_exercise/exercise.js
[4]: https://github.com/workshopper/workshopper
[5]: https://github.com/request/request
[6]: https://github.com/bevacqua/perfschool
[7]: https://github.com/substack/tape
[8]: https://github.com/bevacqua/workshopper-wat/blob/master/resources/assertions.png
[9]: https://github.com/bevacqua/workshopper-wat/blob/master/resources/results.png
