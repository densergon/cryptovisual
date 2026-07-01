import { IsString, IsObject, IsOptional, IsDateString } from 'class-validator';

export class CreateHandshakeDto {
	@IsString()
	initiatorId: string;

	@IsString()
	responderId: string;

	@IsString()
	sessionId: string;

	@IsObject()
	@IsOptional()
	metadata?: Record<string, unknown>;
}

export class HandshakeResponseDto {
	id: string;
	initiatorId: string;
	responderId: string;
	sessionId: string;
	status: 'pending' | 'in_progress' | 'completed' | 'failed';
	metadata?: Record<string, unknown>;
	createdAt: Date;
	completedAt?: Date;
}

export class UpdateHandshakeDto {
	@IsString()
	@IsOptional()
	status?: 'pending' | 'in_progress' | 'completed' | 'failed';

	@IsObject()
	@IsOptional()
	metadata?: Record<string, unknown>;

	@IsDateString()
	@IsOptional()
	completedAt?: string;
}

export class HandshakeMetadataDto {
	@IsString()
	handshakeId: string;

	@IsObject()
	metadata: Record<string, unknown>;

	@IsString()
	actorId: string;
}