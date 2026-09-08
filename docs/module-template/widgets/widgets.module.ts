import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WidgetsController } from './widgets.controller';
import { WidgetsService } from './widgets.service';
import { Widget } from './entities/widget.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Widget])],
  controllers: [WidgetsController],
  providers: [WidgetsService],
  exports: [WidgetsService], // только если нужен другим модулям
})
export class WidgetsModule {}
