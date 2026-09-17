import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { Prisma } from '../generated/prisma/client';
import {
  isForeignKeyConstraintError,
  isPrismaNotFoundError,
  isUniqueConstraintError,
} from '../common/prisma-errors';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

const userSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  roleId: true,
  role: {
    select: { id: true, name: true },
  },
} satisfies Prisma.UserSelect;

type UserWithRole = Prisma.UserGetPayload<{ select: typeof userSelect }>;

export type { UserWithRole };

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: number, userId: number): Promise<UserWithRole> {
    this.assertSelf(id, userId);

    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: userSelect,
      });

      if (!user) {
        throw new NotFoundException(`User #${id} not found`);
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch user', {
        cause: error,
      });
    }
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    userId: number,
  ): Promise<UserWithRole> {
    await this.findOne(id, userId);

    const data: Prisma.UserUpdateInput = {};

    if (updateUserDto.email !== undefined) {
      data.email = updateUserDto.email.trim();
    }
    if (updateUserDto.firstName !== undefined) {
      data.firstName = updateUserDto.firstName.trim();
    }
    if (updateUserDto.lastName !== undefined) {
      data.lastName = updateUserDto.lastName.trim();
    }
    if (updateUserDto.password !== undefined) {
      data.password = await argon2.hash(updateUserDto.password);
    }

    try {
      return await this.prisma.user.update({
        where: { id },
        data,
        select: userSelect,
      });
    } catch (error) {
      if (isPrismaNotFoundError(error)) {
        throw new NotFoundException(`User #${id} not found`);
      }
      if (isUniqueConstraintError(error)) {
        throw new ConflictException('Email already in use');
      }
      throw new InternalServerErrorException('Failed to update user', {
        cause: error,
      });
    }
  }

  async remove(id: number, userId: number): Promise<void> {
    await this.findOne(id, userId);

    try {
      await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      if (isPrismaNotFoundError(error)) {
        throw new NotFoundException(`User #${id} not found`);
      }
      if (isForeignKeyConstraintError(error)) {
        throw new ConflictException(
          'Cannot delete user with related contracts or sessions',
        );
      }
      throw new InternalServerErrorException('Failed to delete user', {
        cause: error,
      });
    }
  }

  private assertSelf(id: number, userId: number): void {
    if (id !== userId) {
      throw new NotFoundException(`User #${id} not found`);
    }
  }
}
