import { v4 as uuidv4 } from 'uuid';

class ApiError extends Error {
    statusCode: number;
    isOperational: boolean;

    constructor(
        statusCode: number,
        message: string | undefined,
        isOperational = true,
        stack = ''
    ) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

const generateAddress = (): string => uuidv4().replace(/-/g, '');

export { ApiError, generateAddress };
