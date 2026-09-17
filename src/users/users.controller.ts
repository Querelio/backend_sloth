import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/decorators/current-user.decorator';
import { UserWithRole, UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('users')
@ApiBearerAuth('JWT')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get own user profile' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'User with role' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ): Promise<UserWithRole> {
    return this.usersService.findOne(id, user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update own user profile' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Updated user with role' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<UserWithRole> {
    return this.usersService.update(id, updateUserDto, user.sub);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete own user profile' })
  @ApiParam({ name: 'id', type: Number })
  @ApiNoContentResponse({ description: 'User deleted' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    return this.usersService.remove(id, user.sub);
  }
}
