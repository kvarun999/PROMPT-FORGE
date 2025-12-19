import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({
    schema: { example: { email: 'user@example.com', password: 'password123' } },
  })
  async login(@Body() req) {
    const validUser = await this.authService.validateUser(
      req.email,
      req.password,
    );
    if (!validUser) {
      throw new Error('Invalid credentials');
    }
    return this.authService.login(validUser);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiBody({
    schema: { example: { email: 'user@example.com', password: 'password123' } },
  })
  async register(@Body() req) {
    return this.authService.register(req);
  }
}
