import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { isUniqueConstraintError } from '../common/prisma-errors';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { RegisterDto } from './dto/register.dto';
import { RegisterResponseDto } from './dto/register-response.dto';

const INTERVENANT_ROLE = 'Intervenant';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<RegisterResponseDto> {
    const email = dto.email.trim();
    const firstName = dto.firstName.trim();
    const lastName = dto.lastName.trim();
    const roleId = await this.getIntervenantRoleId();

    try {
      const hashedPassword = await argon2.hash(dto.password);

      await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          roleId,
        },
      });

      return { status: 'created' };
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictException('Email already registered');
      }
      throw new InternalServerErrorException('Failed to register user', {
        cause: error,
      });
    }
  }

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const email = dto.email.trim();

    let user;
    try {
      user = await this.prisma.user.findUnique({
        where: { email },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to authenticate user', {
        cause: error,
      });
    }

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await argon2.verify(user.password, dto.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({ sub: user.id });

    return {
      userId: user.id,
      fullName: `${user.firstName} ${user.lastName}`.trim(),
      token,
    };
  }

  private async getIntervenantRoleId(): Promise<number> {
    let role;

    try {
      role = await this.prisma.role.findFirst({
        where: { name: INTERVENANT_ROLE },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to resolve Intervenant role',
        { cause: error },
      );
    }

    if (!role) {
      throw new InternalServerErrorException(
        'Intervenant role is not configured',
      );
    }

    return role.id;
  }
}
