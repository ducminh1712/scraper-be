const chalk = require('chalk')

const logger = (req, res, next) => {
    const current_datetime = new Date()
    const formatted_date =
        current_datetime.getFullYear() +
        "-" +
        (current_datetime.getMonth() + 1) +
        "-" +
        current_datetime.getDate() +
        " " +
        current_datetime.getHours() +
        ":" +
        current_datetime.getMinutes() +
        ":" +
        current_datetime.getSeconds();
    const method = req.method
    const url = req.url
    const status = res.statusCode
    const start = process.hrtime()
    const durationInMs = getRequestDuration(start)
    const log = `[${chalk.blue(formatted_date)}] ${method}:${url} ${status} ${chalk.red(durationInMs.toLocaleString() + "ms")}`
    console.log(log)
    next()
}

const getRequestDuration = start => {
    const NS_PER_SEC = 1e9
    const NS_TO_MS = 1e6
    const diff = process.hrtime(start)
    return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS
}

module.exports = logger