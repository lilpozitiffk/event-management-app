import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user; 
      return result;
    }
    return null;
  }

  async login(user: User) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: user
    };
  }

  async register(createUserDto: CreateUserDto) {
      const newUser = await this.usersService.create(createUserDto);
      const { password, ...result } = newUser;
      const payload = { email: newUser.email, sub: newUser.id };
      return {
          access_token: this.jwtService.sign(payload),
          user: result
      }
  }
}
