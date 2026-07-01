import { applyDecorators, Type } from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiForbiddenResponse,
	ApiUnauthorizedResponse,
	ApiBadRequestResponse,
	ApiOperation,
	ApiResponse,
} from '@nestjs/swagger';

export function ApiStandardResponse(options: {
	summary?: string;
	description?: string;
	status?: number;
	type?: Type<unknown>;
	isArray?: boolean;
	requiresAuth?: boolean;
}) {
	const {
		summary = '',
		description = '',
		status = 200,
		type,
		isArray = false,
		requiresAuth = false,
	} = options;

	const decorators = [
		ApiOperation({ summary, description }),
		ApiResponse({
			status,
			description: 'Successful operation',
			type,
			isArray,
		}),
		ApiBadRequestResponse({
			description: 'Invalid input parameters',
			schema: {
				example: {
					statusCode: 400,
					message: ['Invalid input'],
					error: 'Bad Request',
				},
			},
		}),
	];

	if (requiresAuth) {
		decorators.push(
			ApiBearerAuth(),
			ApiUnauthorizedResponse({ description: 'Unauthorized' }),
			ApiForbiddenResponse({ description: 'Forbidden' }),
		);
	}

	return applyDecorators(...decorators);
}

export function ApiPaginatedResponse(options: {
	summary?: string;
	description?: string;
	type: Type<unknown>;
	requiresAuth?: boolean;
}) {
	const { summary = '', description = '', type, requiresAuth = false } = options;

	const decorators = [
		ApiOperation({ summary, description }),
		ApiResponse({
			status: 200,
			description: 'Successful operation',
			schema: {
				type: 'object',
				properties: {
					data: {
						type: 'array',
						items: { $ref: (type as any).name },
					},
					total: { type: 'number', example: 100 },
					page: { type: 'number', example: 1 },
					limit: { type: 'number', example: 10 },
				},
			},
		}),
	];

	if (requiresAuth) {
		decorators.push(
			ApiBearerAuth(),
			ApiUnauthorizedResponse({ description: 'Unauthorized' }),
			ApiForbiddenResponse({ description: 'Forbidden' }),

		);
	}

	return applyDecorators(...decorators);
}
