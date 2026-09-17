import { BadRequestException } from '@nestjs/common';

const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;
const timeOnlyPattern = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

export function toPrismaDate(date: string): Date {
  if (!dateOnlyPattern.test(date)) {
    throw new BadRequestException('Date must use YYYY-MM-DD format');
  }

  const parsedDate = new Date(`${date}T00:00:00.000Z`);

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== date
  ) {
    throw new BadRequestException('Date must be a valid calendar date');
  }

  return parsedDate;
}

export function toPrismaTime(time: string): Date {
  if (!timeOnlyPattern.test(time)) {
    throw new BadRequestException('Time must use HH:mm or HH:mm:ss format');
  }

  const normalizedTime = time.length === 5 ? `${time}:00` : time;
  return new Date(`1970-01-01T${normalizedTime}.000Z`);
}

export function formatDateOnly(value: Date | string): string;
export function formatDateOnly(value: null): null;
export function formatDateOnly(value: Date | string | null): string | null;
export function formatDateOnly(value: Date | string | null): string | null {
  if (value === null) {
    return null;
  }

  if (typeof value === 'string' && dateOnlyPattern.test(value)) {
    return value;
  }

  const date = typeof value === 'string' ? new Date(value) : value;
  return date.toISOString().slice(0, 10);
}

export function formatTimeOnly(value: Date | string): string;
export function formatTimeOnly(value: null): null;
export function formatTimeOnly(value: Date | string | null): string | null;
export function formatTimeOnly(value: Date | string | null): string | null {
  if (value === null) {
    return null;
  }

  if (typeof value === 'string' && timeOnlyPattern.test(value)) {
    return value.slice(0, 5);
  }

  const date = typeof value === 'string' ? new Date(value) : value;
  return date.toISOString().slice(11, 16);
}
