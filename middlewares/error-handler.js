const errorHandler = (error, request, response, next) => {
    // Check the error is a validation error
    if (error instanceof ValidationError) {
        // Handle the error
        response.status(400).send(error.validationErrors)
        next()
    } else {
        // Pass error on if not a validation error
        next(error)
    }
}

module.exports = errorHandler