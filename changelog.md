# 3.0.1 Wait For It

- The default `wait` implementation now tests a port to figure out whether something is listening
- Added `options.waitTTL` option that defaults to 10 seconds

# 3.0.0 Request Me Maybe

- `options.requestOptions` is now `options.request`
- If `options.request` is set to `false`, the default request won't be made

# 2.0.0 Portability Port

- The application listening port is now exposed as `process.env.PORT` rather than `process.argv[2]`

# 1.0.2 Time and Again

- Fixed bug related to recently introduced `url` module usage

# 1.0.1 Every. Single. Time.

- Added missing `assignment` dependency to `package.json`

# 1.0.0 IPO

- Initial Public Release
