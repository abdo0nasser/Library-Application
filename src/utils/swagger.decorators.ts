import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiProperty,
  getSchemaPath,
} from '@nestjs/swagger';

export class PaginatedMetadataDto {
  @ApiProperty()
  totalItems: number;
  @ApiProperty()
  itemCount: number;
  @ApiProperty()
  itemsPerPage: number;
  @ApiProperty()
  totalPages: number;
  @ApiProperty()
  currentPage: number;
  @ApiProperty()
  hasNextPage: boolean;
  @ApiProperty()
  hasPreviousPage: boolean;
}

export const ApiPaginatedResponse = <TModel extends Type<any>>(
  model: TModel,
) => {
  return applyDecorators(
    ApiExtraModels(PaginatedMetadataDto, model),
    ApiOkResponse({
      schema: {
        properties: {
          data: {
            type: 'array',
            items: { $ref: getSchemaPath(model) },
          },
          metadata: {
            $ref: getSchemaPath(PaginatedMetadataDto),
          },
        },
      },
    }),
  );
};

export const ApiDataResponse = <TModel extends Type<any>>(
  model: TModel,
  isArray: boolean = false,
) => {
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      schema: {
        properties: {
          data: isArray
            ? {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              }
            : {
                $ref: getSchemaPath(model),
              },
        },
      },
    }),
  );
};
