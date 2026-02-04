import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto';
import { JwtAuthGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get('profile')
  async getProfile(@CurrentUser('id') userId: string) {
    return this.userService.findById(userId);
  }

  @Patch('profile')
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(userId, updateUserDto);
  }

  @Get('credits')
  async getCredits(@CurrentUser('id') userId: string) {
    return this.userService.getCredits(userId);
  }

  @Get('subscription')
  async getSubscription(@CurrentUser('id') userId: string) {
    return this.userService.getSubscription(userId);
  }
}
