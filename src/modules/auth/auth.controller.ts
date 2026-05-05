import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
/* istanbul ignore next */
export class AuthController {
  constructor(private readonly authService: AuthService) {}

/* istanbul ignore next */
@Post('register')
@ApiOperation({ summary: 'Criar novo usuário' })
@ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

/* istanbul ignore next */
@Post('login')
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Fazer login' })
@ApiResponse({ status: 200, description: 'Login realizado com sucesso' })
async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
