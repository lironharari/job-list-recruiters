import { Request, Response, NextFunction } from 'express';

interface HttpError extends Error {
	status?: number;
	code?: number;
	errors?: any;
}

export default function errorHandler(err: HttpError | any, _req: Request, res: Response, _next: NextFunction) {
	// ensure we have an object
	const error = err || {};

	// default
	let status = error.status || 500;
	let message = error.message || 'Internal Server Error';

	// Mongoose validation error
	if (error.name === 'ValidationError') {
		status = 400;
		// collect messages
		const details = Object.values(error.errors || {}).map((e: any) => e.message).join('; ');
		message = details || message;
	}

	// Duplicate key (mongo)
	if (error.code && error.code === 11000) {
		status = 409;
		const keys = Object.keys(error.keyValue || {}).join(', ');
		message = `Duplicate value for: ${keys}`;
	}

	// Multer file upload errors (if present)
	if (error.name === 'MulterError' || error.code === 'LIMIT_FILE_SIZE') {
		status = 400;
		message = error.message || 'File upload error';
	}

	// log server-side
	// keep console.error for now — could be replaced with structured logger
	console.error('[errorHandler]', { status, message, stack: error.stack });

	const payload: any = { message };
	if (process.env.NODE_ENV !== 'production') payload.stack = error.stack;

	res.status(status).json(payload);
}

