export function isUniqueConstraintError(error: unknown): boolean {
  return isPrismaErrorCode(error, 'P2002');
}

export function isForeignKeyConstraintError(error: unknown): boolean {
  return isPrismaErrorCode(error, 'P2003');
}

export function isPrismaNotFoundError(error: unknown): boolean {
  return isPrismaErrorCode(error, 'P2025');
}

function isPrismaErrorCode(error: unknown, code: string): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: string }).code === code
  );
}
