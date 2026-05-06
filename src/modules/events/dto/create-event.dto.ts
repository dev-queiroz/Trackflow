import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  IsObject,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventDto {
  /* istanbul ignore next */
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'button_clicked' })
  @IsString()
  @IsNotEmpty()
  eventName: string;

  @ApiProperty({
    example: { page: 'checkout', button: 'pay_now' },
    required: false,
  })
  /* istanbul ignore next */
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
