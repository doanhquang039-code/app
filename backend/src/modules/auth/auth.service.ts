import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { User } from '../../entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

type SocialProvider = 'google' | 'facebook' | 'microsoft' | 'zalo' | 'tiktok' | 'instagram';
type SocialAuthTarget = 'web' | 'mobile';

interface SocialProfile {
  id: string;
  email?: string;
  name?: string;
  username?: string;
  avatarUrl?: string;
}

const SOCIAL_PROVIDERS: Record<
  SocialProvider,
  {
    authUrl: string;
    tokenUrl: string;
    userInfoUrl: string;
    clientIdEnv: string;
    clientSecretEnv: string;
    scope: string;
    clientIdParam?: string;
  }
> = {
  google: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://openidconnect.googleapis.com/v1/userinfo',
    clientIdEnv: 'GOOGLE_CLIENT_ID',
    clientSecretEnv: 'GOOGLE_CLIENT_SECRET',
    scope: 'openid email profile',
  },
  facebook: {
    authUrl: 'https://www.facebook.com/v20.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v20.0/oauth/access_token',
    userInfoUrl: 'https://graph.facebook.com/me?fields=id,name,email,picture',
    clientIdEnv: 'FACEBOOK_CLIENT_ID',
    clientSecretEnv: 'FACEBOOK_CLIENT_SECRET',
    scope: 'email,public_profile',
  },
  microsoft: {
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    userInfoUrl: 'https://graph.microsoft.com/oidc/userinfo',
    clientIdEnv: 'MICROSOFT_CLIENT_ID',
    clientSecretEnv: 'MICROSOFT_CLIENT_SECRET',
    scope: 'openid profile email',
  },
  zalo: {
    authUrl: 'https://oauth.zaloapp.com/v4/permission',
    tokenUrl: 'https://oauth.zaloapp.com/v4/access_token',
    userInfoUrl: 'https://graph.zalo.me/v2.0/me?fields=id,name,picture',
    clientIdEnv: 'ZALO_APP_ID',
    clientSecretEnv: 'ZALO_APP_SECRET',
    scope: '',
    clientIdParam: 'app_id',
  },
  tiktok: {
    authUrl: 'https://www.tiktok.com/v2/auth/authorize/',
    tokenUrl: 'https://open.tiktokapis.com/v2/oauth/token/',
    userInfoUrl:
      'https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name',
    clientIdEnv: 'TIKTOK_CLIENT_KEY',
    clientSecretEnv: 'TIKTOK_CLIENT_SECRET',
    scope: 'user.info.basic',
    clientIdParam: 'client_key',
  },
  instagram: {
    authUrl: 'https://api.instagram.com/oauth/authorize',
    tokenUrl: 'https://api.instagram.com/oauth/access_token',
    userInfoUrl: 'https://graph.instagram.com/me?fields=id,username',
    clientIdEnv: 'INSTAGRAM_CLIENT_ID',
    clientSecretEnv: 'INSTAGRAM_CLIENT_SECRET',
    scope: 'user_profile',
  },
};

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const emailExists = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (emailExists) throw new ConflictException('Email da ton tai');

    const usernameExists = await this.userRepository.findOne({
      where: { username: dto.username },
    });
    if (usernameExists) throw new ConflictException('Ten dang nhap da ton tai');

    const hashed = await bcrypt.hash(dto.password, 10);

    const user = this.userRepository.create({
      username: dto.username,
      email: dto.email,
      password: hashed,
      fullName: dto.fullName || dto.username,
      authProvider: 'local',
    });

    await this.userRepository.save(user);
    return { message: 'Dang ky thanh cong' };
  }

  async login(dto: LoginDto) {
    const usernameOrEmail = dto.username;
    const isEmail = usernameOrEmail.includes('@');

    const user = await this.userRepository.findOne({
      where: isEmail ? { email: usernameOrEmail } : { username: usernameOrEmail },
    });

    if (!user) {
      throw new UnauthorizedException('Ten dang nhap hoac mat khau khong dung');
    }

    if (!user.password) {
      throw new UnauthorizedException('Tai khoan nay dang dung dang nhap mang xa hoi');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Ten dang nhap hoac mat khau khong dung');
    }

    return {
      access_token: this.signToken(user),
      user: this.toAuthUser(user),
    };
  }

  getSocialAuthUrl(providerInput: string, targetInput?: string) {
    const provider = this.assertProvider(providerInput);
    const target = this.getSocialAuthTarget(targetInput);
    const config = SOCIAL_PROVIDERS[provider];
    const clientId = this.requiredEnv(config.clientIdEnv, provider);
    this.requiredEnv(config.clientSecretEnv, provider);

    const url = new URL(config.authUrl);
    url.searchParams.set(config.clientIdParam || 'client_id', clientId);
    url.searchParams.set('redirect_uri', this.getRedirectUri(provider));
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('state', this.createState(provider, target));

    if (config.scope) url.searchParams.set('scope', config.scope);
    if (provider === 'microsoft') url.searchParams.set('response_mode', 'query');
    this.applyFreshLoginParams(url, provider);

    return url.toString();
  }

  async handleSocialCallback(providerInput: string, code?: string, state?: string) {
    const provider = this.assertProvider(providerInput);
    if (!code) throw new BadRequestException('Missing authorization code');
    const target = this.verifyState(provider, state);

    const token = await this.exchangeCodeForToken(provider, code);
    const profile = await this.fetchSocialProfile(provider, token.access_token);
    const user = await this.findOrCreateSocialUser(provider, profile);
    const payload = Buffer.from(
      JSON.stringify({
        access_token: this.signToken(user),
        user: this.toAuthUser(user),
      }),
    ).toString('base64url');

    if (target === 'mobile') {
      return `${this.getMobileCallbackUrl()}?payload=${encodeURIComponent(payload)}`;
    }

    return `${this.getFrontendUrl()}/auth/social/callback?payload=${encodeURIComponent(payload)}`;
  }

  getSocialErrorRedirect(message: string, stateOrTarget?: string) {
    if (this.getTargetFromStateOrValue(stateOrTarget) === 'mobile') {
      return `${this.getMobileCallbackUrl()}?error=${encodeURIComponent(message)}`;
    }
    return `${this.getFrontendUrl()}/login?social_error=${encodeURIComponent(message)}`;
  }

  private signToken(user: User) {
    return this.jwtService.sign({ sub: user.id, email: user.email, username: user.username });
  }

  private toAuthUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      authProvider: user.authProvider || 'local',
      avatarUrl: user.avatarUrl,
    };
  }

  private async findOrCreateSocialUser(provider: SocialProvider, profile: SocialProfile) {
    let user = await this.userRepository.findOne({
      where: { authProvider: provider, socialProviderId: profile.id },
    });

    if (!user && profile.email) {
      user = await this.userRepository.findOne({ where: { email: profile.email } });
    }

    if (user) {
      user.authProvider = user.authProvider || provider;
      user.socialProviderId = user.socialProviderId || profile.id;
      user.avatarUrl = profile.avatarUrl || user.avatarUrl;
      user.lastLoginAt = new Date();
      return this.userRepository.save(user);
    }

    const email = profile.email || `${provider}_${profile.id}@social.local`;
    const username = await this.buildUniqueUsername(
      profile.username || profile.email || `${provider}_${profile.id}`,
    );

    user = this.userRepository.create({
      username,
      email,
      password: null,
      fullName: profile.name || username,
      authProvider: provider,
      socialProviderId: profile.id,
      avatarUrl: profile.avatarUrl,
      lastLoginAt: new Date(),
    });

    return this.userRepository.save(user);
  }

  private async buildUniqueUsername(value: string) {
    const base =
      value
        .split('@')[0]
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '') || 'user';

    let username = base.slice(0, 40);
    let index = 1;
    while (await this.userRepository.findOne({ where: { username } })) {
      username = `${base.slice(0, 34)}_${index++}`;
    }
    return username;
  }

  private async exchangeCodeForToken(provider: SocialProvider, code: string): Promise<any> {
    const config = SOCIAL_PROVIDERS[provider];
    const clientId = this.requiredEnv(config.clientIdEnv, provider);
    const clientSecret = this.requiredEnv(config.clientSecretEnv, provider);
    const redirectUri = this.getRedirectUri(provider);

    if (provider === 'facebook') {
      const url = new URL(config.tokenUrl);
      url.searchParams.set('client_id', clientId);
      url.searchParams.set('client_secret', clientSecret);
      url.searchParams.set('redirect_uri', redirectUri);
      url.searchParams.set('code', code);
      return this.fetchJson(url.toString());
    }

    const params = new URLSearchParams();
    params.set('code', code);
    params.set('grant_type', 'authorization_code');
    params.set('redirect_uri', redirectUri);

    if (provider === 'zalo') {
      params.set('app_id', clientId);
      return this.fetchJson(config.tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', secret_key: clientSecret },
        body: params,
      });
    }

    params.set(config.clientIdParam || 'client_id', clientId);
    params.set('client_secret', clientSecret);

    return this.fetchJson(config.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });
  }

  private async fetchSocialProfile(provider: SocialProvider, accessToken?: string): Promise<SocialProfile> {
    if (!accessToken) throw new BadRequestException('Provider did not return access token');

    const config = SOCIAL_PROVIDERS[provider];
    const headers: Record<string, string> = { Authorization: `Bearer ${accessToken}` };
    const url = new URL(config.userInfoUrl);

    if (provider === 'facebook' || provider === 'instagram' || provider === 'zalo') {
      url.searchParams.set('access_token', accessToken);
      delete headers.Authorization;
    }

    const data = await this.fetchJson(url.toString(), { headers });
    const profile = this.mapProfile(provider, data);
    if (!profile.id) throw new BadRequestException('Provider profile missing id');
    return profile;
  }

  private mapProfile(provider: SocialProvider, data: any): SocialProfile {
    if (provider === 'google' || provider === 'microsoft') {
      return {
        id: data.sub,
        email: data.email,
        name: data.name,
        username: data.email,
        avatarUrl: data.picture,
      };
    }

    if (provider === 'facebook') {
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        username: data.email || data.name,
        avatarUrl: data.picture?.data?.url,
      };
    }

    if (provider === 'zalo') {
      return {
        id: data.id,
        name: data.name,
        username: data.name,
        avatarUrl: data.picture?.data?.url || data.picture,
      };
    }

    if (provider === 'tiktok') {
      const user = data.data?.user || data.user || data;
      return {
        id: user.open_id || user.union_id,
        name: user.display_name,
        username: user.display_name,
        avatarUrl: user.avatar_url,
      };
    }

    return { id: data.id, name: data.username, username: data.username };
  }

  private async fetchJson(url: string, init?: RequestInit) {
    const response = await fetch(url, init);
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.error) {
      const message =
        data.error_description ||
        data.error?.message ||
        data.message ||
        'OAuth provider request failed';
      throw new BadRequestException(message);
    }
    return data;
  }

  private assertProvider(provider: string): SocialProvider {
    if (!Object.prototype.hasOwnProperty.call(SOCIAL_PROVIDERS, provider)) {
      throw new BadRequestException('Unsupported social provider');
    }
    return provider as SocialProvider;
  }

  private requiredEnv(name: string, provider: SocialProvider) {
    const value = process.env[name];
    if (!value) throw new BadRequestException(`Missing ${name} for ${provider} login`);
    return value;
  }

  private getRedirectUri(provider: SocialProvider) {
    const baseUrl = process.env.OAUTH_REDIRECT_BASE_URL || 'http://localhost:3000';
    return `${baseUrl.replace(/\/$/, '')}/auth/social/${provider}/callback`;
  }

  private getFrontendUrl() {
    return (process.env.FRONTEND_URL || 'http://localhost:3001').replace(/\/$/, '');
  }

  private getMobileCallbackUrl() {
    return (process.env.MOBILE_OAUTH_CALLBACK_URL || 'expensetracker://auth/callback').replace(
      /\/$/,
      '',
    );
  }

  private getSocialAuthTarget(target?: string): SocialAuthTarget {
    return target === 'mobile' ? 'mobile' : 'web';
  }

  private applyFreshLoginParams(url: URL, provider: SocialProvider) {
    if (provider === 'google') {
      url.searchParams.set('prompt', 'select_account');
      return;
    }

    if (provider === 'microsoft') {
      url.searchParams.set('prompt', 'select_account');
      return;
    }

    if (provider === 'facebook') {
      url.searchParams.set('auth_type', 'rerequest');
    }
  }

  private getTargetFromStateOrValue(value?: string): SocialAuthTarget {
    if (value === 'mobile') return 'mobile';
    const stateTarget = value?.split('.')?.[1];
    return stateTarget === 'mobile' ? 'mobile' : 'web';
  }

  private getStateSecret() {
    return process.env.OAUTH_STATE_SECRET || process.env.JWT_SECRET || 'expense_tracker_secret_key';
  }

  private createState(provider: SocialProvider, target: SocialAuthTarget) {
    const payload = `${provider}.${target}.${Date.now()}.${randomBytes(12).toString('hex')}`;
    const signature = createHmac('sha256', this.getStateSecret()).update(payload).digest('hex');
    return `${payload}.${signature}`;
  }

  private verifyState(provider: SocialProvider, state?: string): SocialAuthTarget {
    if (!state) throw new BadRequestException('Missing OAuth state');
    const parts = state.split('.');
    if (parts.length !== 5 || parts[0] !== provider) {
      throw new BadRequestException('Invalid OAuth state');
    }

    const target = this.getSocialAuthTarget(parts[1]);
    const payload = parts.slice(0, 4).join('.');
    const expected = createHmac('sha256', this.getStateSecret()).update(payload).digest('hex');
    const expectedBuffer = Buffer.from(expected);
    const actualBuffer = Buffer.from(parts[4]);

    if (expectedBuffer.length !== actualBuffer.length || !timingSafeEqual(expectedBuffer, actualBuffer)) {
      throw new BadRequestException('Invalid OAuth state');
    }

    return target;
  }
}
