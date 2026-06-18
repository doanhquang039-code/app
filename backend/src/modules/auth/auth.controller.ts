import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('social/providers')
  socialProviders() {
    return this.authService.getSocialProviders();
  }

  @Get('social/:provider')
  socialLogin(
    @Param('provider') provider: string,
    @Query('target') target: string,
    @Res() res: any,
  ) {
    try {
      return res.redirect(this.authService.getSocialAuthUrl(provider, target));
    } catch (authError: any) {
      return res.redirect(
        this.authService.getSocialErrorRedirect(authError?.message || 'Social login failed', target),
      );
    }
  }

  @Get('social/:provider/callback')
  async socialCallback(
    @Param('provider') provider: string,
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Res() res: any,
  ) {
    try {
      if (error) throw new Error(error);
      const redirectUrl = await this.authService.handleSocialCallback(provider, code, state);
      return res.redirect(redirectUrl);
    } catch (callbackError: any) {
      return res.redirect(
        this.authService.getSocialErrorRedirect(callbackError?.message || 'Social login failed', state),
      );
    }
  }
}
