import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateHandshakeDto, HandshakeResponseDto, UpdateHandshakeDto, HandshakeMetadataDto } from './dto/handshake.dto';

@Injectable()
export class HandshakeService {
	constructor(private prisma: DatabaseService) {}

	async createHandshake(dto: CreateHandshakeDto): Promise<HandshakeResponseDto> {
		const handshake = await this.prisma.handshake.create({
			data: {
				initiatorId: dto.initiatorId,
				responderId: dto.responderId,
				sessionId: dto.sessionId,
				status: 'pending',
				metadata: dto.metadata ? (dto.metadata as any) : {},
			},
		});

		return this.mapToResponse(handshake);
	}

	async getHandshake(handshakeId: string): Promise<HandshakeResponseDto> {
		const handshake = await this.prisma.handshake.findUnique({
			where: { id: handshakeId },
		});

		if (!handshake) {
			throw new NotFoundException(`Handshake ${handshakeId} not found`);
		}

		return this.mapToResponse(handshake);
	}

	async getHandshakeBySession(sessionId: string): Promise<HandshakeResponseDto> {
		const handshake = await this.prisma.handshake.findFirst({
			where: { sessionId },
		});

		if (!handshake) {
			throw new NotFoundException(`Handshake for session ${sessionId} not found`);
		}

		return this.mapToResponse(handshake);
	}

	async updateHandshake(handshakeId: string, dto: UpdateHandshakeDto): Promise<HandshakeResponseDto> {
		const updateData: any = {};

		if (dto.status) {
			updateData.status = dto.status;
		}

		if (dto.metadata) {
			updateData.metadata = dto.metadata;
		}

		if (dto.completedAt) {
			updateData.completedAt = new Date(dto.completedAt);
		}

		const handshake = await this.prisma.handshake.update({
			where: { id: handshakeId },
			data: updateData,
		});

		return this.mapToResponse(handshake);
	}

	async addMetadata(dto: HandshakeMetadataDto): Promise<HandshakeResponseDto> {
		const handshake = await this.prisma.handshake.findUnique({
			where: { id: dto.handshakeId },
		});

		if (!handshake) {
			throw new NotFoundException(`Handshake ${dto.handshakeId} not found`);
		}

		const currentMetadata = (handshake.metadata as any) || {};
		const updatedMetadata = {
			...currentMetadata,
			[dto.actorId]: {
				...((currentMetadata as any)[dto.actorId] || {}),
				...dto.metadata,
			},
		};

		const updated = await this.prisma.handshake.update({
			where: { id: dto.handshakeId },
			data: { metadata: updatedMetadata },
		});

		return this.mapToResponse(updated);
	}

	async getHandshakesByUser(userId: string): Promise<HandshakeResponseDto[]> {
		const handshakes = await this.prisma.handshake.findMany({
			where: {
				OR: [{ initiatorId: userId }, { responderId: userId }],
			},
			orderBy: { createdAt: 'desc' },
		});

		return handshakes.map((h) => this.mapToResponse(h));
	}

	async deleteHandshake(handshakeId: string): Promise<void> {
		await this.prisma.handshake.delete({
			where: { id: handshakeId },
		});
	}

	private mapToResponse(handshake: any): HandshakeResponseDto {
		return {
			id: handshake.id,
			initiatorId: handshake.initiatorId,
			responderId: handshake.responderId,
			sessionId: handshake.sessionId,
			status: handshake.status,
			metadata: handshake.metadata as any ?? undefined,
			createdAt: handshake.createdAt,
			completedAt: handshake.completedAt ?? undefined,
		};
	}
}