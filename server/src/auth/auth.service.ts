import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { AuthResponseDto, AuthUserDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<AuthUserDto | null> {
    const user = await this.usersService.findOne(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result as AuthUserDto;
    }
    return null;
  }

  async login(loginDto: any): Promise<AuthResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: user,
    };
  }

  async register(createUserDto: any): Promise<AuthResponseDto> {
    const existingUser = await this.usersService.findOne(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const newUser = await this.usersService.create(createUserDto);
    const { password, ...result } = newUser;
    const payload = { email: newUser.email, sub: newUser.id };

    return {
      access_token: this.jwtService.sign(payload),
      user: result as AuthUserDto,
    };
  }
}
