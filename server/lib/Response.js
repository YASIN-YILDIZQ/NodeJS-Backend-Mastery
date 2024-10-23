const Enum = require("../config/Enum");
const ErrorCostumer = require("./ErrorCostumer");

class Response {
    constructor() {}
    static successRespose(data, code = 200) {
        return { code, data };
    }

    static errorRespose(error) {
        // error.message'in var olup olmadığını kontrol et
        const errorMessage = error?.message || error;

        if (error instanceof ErrorCostumer) {
            return {
                code: error.code,
                error: { message: errorMessage }
            };
        }

        return {
            code: Enum.HTTP_CODES.INTERNAL_SERVER_ERROR,
            error: { message: errorMessage }
        };
    }
}

module.exports = Response;
