import { Module } from '@nestjs/common';
import { HandshakeService } from './handshake.service';
import { HandshakeController } from './handshake.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
	imports: [DatabaseModule],
	providers: [HandshakeService],
	controllers: [HandshakeController],
	exports: [HandshakeService],
})
export class HandshakeModule {}