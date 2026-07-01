import {
	Controller,
	Get,
	Post,
	Patch,
	Delete,
	Body,
	Param,
	Query,
	HttpCode,
	HttpStatus,
	UseGuards,
} from '@nestjs/common';
import { HandshakeService } from './handshake.service';
import { CreateHandshakeDto, HandshakeResponseDto, UpdateHandshakeDto, HandshakeMetadataDto } from './dto/handshake.dto';
import { ApiKeyGuard } from '../common/guards/api-key.guard';

@Controller('handshake')
export class HandshakeController {
	constructor(private handshakeService: HandshakeService) {}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	async create(@Body() dto: CreateHandshakeDto): Promise<HandshakeResponseDto> {
		return this.handshakeService.createHandshake(dto);
	}

	@Get(':id')
	async findOne(@Param('id') id: string): Promise<HandshakeResponseDto> {
		return this.handshakeService.getHandshake(id);
	}

	@Get('session/:sessionId')
	async findBySession(@Param('sessionId') sessionId: string): Promise<HandshakeResponseDto> {
		return this.handshakeService.getHandshakeBySession(sessionId);
	}

	@Get('user/:userId')
	async findByUser(@Param('userId') userId: string): Promise<HandshakeResponseDto[]> {
		return this.handshakeService.getHandshakesByUser(userId);
	}

	@Patch(':id')
	@UseGuards(ApiKeyGuard)
	async update(
		@Param('id') id: string,
		@Body() dto: UpdateHandshakeDto,
	): Promise<HandshakeResponseDto> {
		return this.handshakeService.updateHandshake(id, dto);
	}

	@Post(':id/metadata')
	@UseGuards(ApiKeyGuard)
	async addMetadata(
		@Param('id') id: string,
		@Body() dto: HandshakeMetadataDto,
	): Promise<HandshakeResponseDto> {
		return this.handshakeService.addMetadata({ ...dto, handshakeId: id });
	}

	@Delete(':id')
	@UseGuards(ApiKeyGuard)
	@HttpCode(HttpStatus.NO_CONTENT)
	async delete(@Param('id') id: string): Promise<void> {
		return this.handshakeService.deleteHandshake(id);
	}
}
