import { Module } from '@nestjs/common';
import { PublicKeyDirectoryController } from './public-key-directory.controller';
import { PublicKeyDirectoryService } from './public-key-directory.service';

@Module({
  controllers: [PublicKeyDirectoryController],
  providers: [PublicKeyDirectoryService],
  exports: [PublicKeyDirectoryService],
})
export class PublicKeyDirectoryModule {}