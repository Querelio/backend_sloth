import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';

export function ownedBy(userId: number): { teacherId: number } {
  return { teacherId: userId };
}

export function assertOwner(ownerId: number, userId: number): void {
  if (ownerId !== userId) {
    throw new ForbiddenException('You do not own this resource');
  }
}

export async function assertRecordExists<T>(
  load: () => Promise<T | null>,
  field: string,
): Promise<T> {
  let record: T | null;

  try {
    record = await load();
  } catch (error) {
    throw new InternalServerErrorException(`Failed to verify ${field}`, {
      cause: error,
    });
  }

  if (!record) {
    throw new BadRequestException(`Invalid ${field}`);
  }

  return record;
}
