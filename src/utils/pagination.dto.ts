import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class PaginationDto {
  @ApiPropertyOptional({ example: 10, minimum: 1, maximum: 100, default: 10 })
  @Type(() => Number)
  @Min(1)
  @Max(100)
  @IsInt()
  items_per_page: number = 10;

  @ApiPropertyOptional({ example: 1, minimum: 1, default: 1 })
  @Type(() => Number)
  @Min(1)
  @Max(100000)
  @IsInt()
  page_number: number = 1;

  get skip(): number {
    return (this.page_number - 1) * this.items_per_page;
  }
  get take(): number {
    return this.items_per_page;
  }
}
