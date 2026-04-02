import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class PaginationDto {
  @ApiPropertyOptional({ example: 10, minimum: 1, maximum: 100, default: 10 })
  @Type(() => Number)
  @Min(1)
  @Max(100)
  @IsInt()
  limit: number = 10;

  @ApiPropertyOptional({ example: 1, minimum: 1, default: 1 })
  @Type(() => Number)
  @Min(1)
  @Max(100000)
  @IsInt()
  page: number = 1;

  get skip(): number {
    return (this.page - 1) * this.limit;
  }

  get take(): number {
    return this.limit;
  }

  getMeta(totalItems: number, itemCount: number) {
    const totalPages = Math.ceil(totalItems / this.limit);
    return {
      totalItems,
      itemCount,
      itemsPerPage: this.limit,
      totalPages,
      currentPage: this.page,
      hasNextPage: this.page < totalPages,
      hasPreviousPage: this.page > 1,
    };
  }
}
