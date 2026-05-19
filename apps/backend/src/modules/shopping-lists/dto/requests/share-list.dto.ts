import { ApiProperty } from '@nestjs/swagger';

export class ShareListResponseDto {
  @ApiProperty()
  shareToken: string;
}
