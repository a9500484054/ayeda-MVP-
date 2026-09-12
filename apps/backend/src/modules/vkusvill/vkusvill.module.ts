import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VkusvillController } from './vkusvill.controller';
import { VkusvillService } from './vkusvill.service';

@Module({
  imports: [ConfigModule],
  controllers: [VkusvillController],
  providers: [VkusvillService],
  exports: [VkusvillService],
})
export class VkusvillModule {}
