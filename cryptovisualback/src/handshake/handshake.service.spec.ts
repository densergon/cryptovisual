import { Test, TestingModule } from '@nestjs/testing';
import { HandshakeService } from './handshake.service';
import { DatabaseService } from '../database/database.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateHandshakeDto, HandshakeResponseDto } from './dto/handshake.dto';

describe('HandshakeService', () => {
	let service: HandshakeService;
	let prisma: DatabaseService;

	const mockHandshake = {
		id: 'handshake-1',
		initiatorId: 'user-1',
		responderId: 'user-2',
		sessionId: 'session-1',
		status: 'pending',
		metadata: {},
		createdAt: new Date(),
		completedAt: null,
	};

	const mockPrismaService = {
		handshake: {
			create: jest.fn(),
			findUnique: jest.fn(),
			findFirst: jest.fn(),
			findMany: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
		},
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				HandshakeService,
				{ provide: DatabaseService, useValue: mockPrismaService },
			],
		}).compile();

		service = module.get<HandshakeService>(HandshakeService);
		prisma = module.get<DatabaseService>(DatabaseService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('createHandshake', () => {
		it('should create a new handshake successfully', async () => {
			const dto: CreateHandshakeDto = {
				initiatorId: 'user-1',
				responderId: 'user-2',
				sessionId: 'session-1',
			};

			mockPrismaService.handshake.create.mockResolvedValue(mockHandshake);

			const result = await service.createHandshake(dto);

			expect(prisma.handshake.create).toHaveBeenCalledWith({
				data: {
					initiatorId: 'user-1',
					responderId: 'user-2',
					sessionId: 'session-1',
					status: 'pending',
					metadata: {},
				},
			});
			expect(result).toEqual({
				id: 'handshake-1',
				initiatorId: 'user-1',
				responderId: 'user-2',
				sessionId: 'session-1',
				status: 'pending',
				metadata: {},
				createdAt: mockHandshake.createdAt,
				completedAt: undefined,
			});
		});

		it('should create handshake with metadata', async () => {
			const dto: CreateHandshakeDto = {
				initiatorId: 'user-1',
				responderId: 'user-2',
				sessionId: 'session-1',
				metadata: { publicKey: 'abc123' },
			};

			const handshakeWithMetadata = {
				...mockHandshake,
				metadata: { publicKey: 'abc123' },
			};

			mockPrismaService.handshake.create.mockResolvedValue(handshakeWithMetadata);

			const result = await service.createHandshake(dto);

			expect(prisma.handshake.create).toHaveBeenCalledWith({
				data: {
					initiatorId: 'user-1',
					responderId: 'user-2',
					sessionId: 'session-1',
					status: 'pending',
					metadata: { publicKey: 'abc123' },
				},
			});
			expect(result.metadata).toEqual({ publicKey: 'abc123' });
		});
	});

	describe('getHandshake', () => {
		it('should return handshake by id', async () => {
			mockPrismaService.handshake.findUnique.mockResolvedValue(mockHandshake);

			const result = await service.getHandshake('handshake-1');

			expect(prisma.handshake.findUnique).toHaveBeenCalledWith({
				where: { id: 'handshake-1' },
			});
			expect(result.id).toBe('handshake-1');
		});

		it('should throw NotFoundException when handshake not found', async () => {
			mockPrismaService.handshake.findUnique.mockResolvedValue(null);

			await expect(service.getHandshake('nonexistent')).rejects.toThrow(
				NotFoundException,
			);
			await expect(service.getHandshake('nonexistent')).rejects.toThrow(
				'Handshake nonexistent not found',
			);
		});
	});

	describe('getHandshakeBySession', () => {
		it('should return handshake by session id', async () => {
			mockPrismaService.handshake.findFirst.mockResolvedValue(mockHandshake);

			const result = await service.getHandshakeBySession('session-1');

			expect(prisma.handshake.findFirst).toHaveBeenCalledWith({
				where: { sessionId: 'session-1' },
			});
			expect(result.sessionId).toBe('session-1');
		});

		it('should throw NotFoundException when handshake not found for session', async () => {
			mockPrismaService.handshake.findFirst.mockResolvedValue(null);

			await expect(service.getHandshakeBySession('nonexistent-session')).rejects.toThrow(
				NotFoundException,
			);
		});
	});

	describe('updateHandshake', () => {
		it('should update handshake status', async () => {
			const updatedHandshake = {
				...mockHandshake,
				status: 'completed',
				completedAt: new Date(),
			};

			mockPrismaService.handshake.update.mockResolvedValue(updatedHandshake);

			const result = await service.updateHandshake('handshake-1', {
				status: 'completed',
				completedAt: updatedHandshake.completedAt.toISOString(),
			});

			expect(prisma.handshake.update).toHaveBeenCalledWith({
				where: { id: 'handshake-1' },
				data: {
					status: 'completed',
					completedAt: updatedHandshake.completedAt,
				},
			});
			expect(result.status).toBe('completed');
		});

		it('should update handshake metadata', async () => {
			const updatedHandshake = {
				...mockHandshake,
				metadata: { keyExchange: 'done' },
			};

			mockPrismaService.handshake.update.mockResolvedValue(updatedHandshake);

			const result = await service.updateHandshake('handshake-1', {
				metadata: { keyExchange: 'done' },
			});

			expect(prisma.handshake.update).toHaveBeenCalledWith({
				where: { id: 'handshake-1' },
				data: {
					metadata: { keyExchange: 'done' },
				},
			});
			expect(result.metadata).toEqual({ keyExchange: 'done' });
		});
	});

	describe('addMetadata', () => {
		it('should add metadata to handshake', async () => {
			const existingHandshake = {
				...mockHandshake,
				metadata: {},
			};

			const updatedHandshake = {
				...mockHandshake,
				metadata: { 'user-1': { publicKey: 'abc123' } },
			};

			mockPrismaService.handshake.findUnique.mockResolvedValue(existingHandshake);
			mockPrismaService.handshake.update.mockResolvedValue(updatedHandshake);

			const result = await service.addMetadata({
				handshakeId: 'handshake-1',
				actorId: 'user-1',
				metadata: { publicKey: 'abc123' },
			});

			expect(prisma.handshake.update).toHaveBeenCalledWith({
				where: { id: 'handshake-1' },
				data: {
					metadata: { 'user-1': { publicKey: 'abc123' } },
				},
			});
			expect(result.metadata).toEqual({ 'user-1': { publicKey: 'abc123' } });
		});

		it('should merge metadata for existing actor', async () => {
			const existingHandshake = {
				...mockHandshake,
				metadata: { 'user-1': { publicKey: 'abc123' } },
			};

			const updatedHandshake = {
				...mockHandshake,
				metadata: { 'user-1': { publicKey: 'abc123', signature: 'xyz789' } },
			};

			mockPrismaService.handshake.findUnique.mockResolvedValue(existingHandshake);
			mockPrismaService.handshake.update.mockResolvedValue(updatedHandshake);

			const result = await service.addMetadata({
				handshakeId: 'handshake-1',
				actorId: 'user-1',
				metadata: { signature: 'xyz789' },
			});

			expect(result.metadata).toEqual({
				'user-1': { publicKey: 'abc123', signature: 'xyz789' },
			});
		});

		it('should throw NotFoundException when handshake not found', async () => {
			mockPrismaService.handshake.findUnique.mockResolvedValue(null);

			await expect(
				service.addMetadata({
					handshakeId: 'nonexistent',
					actorId: 'user-1',
					metadata: {},
				}),
			).rejects.toThrow(NotFoundException);
		});
	});

	describe('getHandshakesByUser', () => {
		it('should return handshakes where user is initiator or responder', async () => {
			const handshakes = [
				{ ...mockHandshake, id: 'handshake-1' },
				{ ...mockHandshake, id: 'handshake-2', initiatorId: 'user-2', responderId: 'user-1' },
			];

			mockPrismaService.handshake.findMany.mockResolvedValue(handshakes);

			const result = await service.getHandshakesByUser('user-1');

			expect(prisma.handshake.findMany).toHaveBeenCalledWith({
				where: {
					OR: [{ initiatorId: 'user-1' }, { responderId: 'user-1' }],
				},
				orderBy: { createdAt: 'desc' },
			});
			expect(result).toHaveLength(2);
		});

		it('should return empty array when no handshakes found', async () => {
			mockPrismaService.handshake.findMany.mockResolvedValue([]);

			const result = await service.getHandshakesByUser('user-1');

			expect(result).toEqual([]);
		});
	});

	describe('deleteHandshake', () => {
		it('should delete handshake successfully', async () => {
			mockPrismaService.handshake.delete.mockResolvedValue(mockHandshake);

			await service.deleteHandshake('handshake-1');

			expect(prisma.handshake.delete).toHaveBeenCalledWith({
				where: { id: 'handshake-1' },
			});
		});
	});
});