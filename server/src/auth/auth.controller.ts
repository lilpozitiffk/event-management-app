import { Controller, Post, Body, UseGuards, Request, Get, UsePipes } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { YupValidationPipe } from '../common/pipes/yup-validation.pipe';
import { loginSchema, registerSchema } from './schemas/auth.schema';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @UsePipes(new YupValidationPipe(registerSchema))
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @UsePipes(new YupValidationPipe(loginSchema))
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req: { user: { id: number; email: string; name: string } }) {
    return req.user;
  }
}
