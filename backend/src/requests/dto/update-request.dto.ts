import { IsIn, IsOptional, IsString, ValidateIf } from 'class-validator';

export const REQUEST_STATUSES = ['NEW', 'IN_PROGRESS', 'RESOLVED'] as const;

export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export function isRequestStatus(value: unknown): value is RequestStatus {
  return (
    typeof value === 'string' &&
    REQUEST_STATUSES.some((status) => status === value)
  );
}

export class UpdateRequestDto {
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsIn(REQUEST_STATUSES)
  status?: RequestStatus;

  @IsOptional()
  @IsString()
  owner?: string | null;
}
