"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const crypto_1 = require("crypto");
const user_entity_1 = require("../../entities/user.entity");
const SOCIAL_PROVIDERS = {
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
        userInfoUrl: 'https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name',
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
let AuthService = class AuthService {
    userRepository;
    jwtService;
    constructor(userRepository, jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }
    async register(dto) {
        const emailExists = await this.userRepository.findOne({
            where: { email: dto.email },
        });
        if (emailExists)
            throw new common_1.ConflictException('Email da ton tai');
        const usernameExists = await this.userRepository.findOne({
            where: { username: dto.username },
        });
        if (usernameExists)
            throw new common_1.ConflictException('Ten dang nhap da ton tai');
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
    async login(dto) {
        const usernameOrEmail = dto.username;
        const isEmail = usernameOrEmail.includes('@');
        const user = await this.userRepository.findOne({
            where: isEmail ? { email: usernameOrEmail } : { username: usernameOrEmail },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Ten dang nhap hoac mat khau khong dung');
        }
        if (!user.password) {
            throw new common_1.UnauthorizedException('Tai khoan nay dang dung dang nhap mang xa hoi');
        }
        const isMatch = await bcrypt.compare(dto.password, user.password);
        if (!isMatch) {
            throw new common_1.UnauthorizedException('Ten dang nhap hoac mat khau khong dung');
        }
        return {
            access_token: this.signToken(user),
            user: this.toAuthUser(user),
        };
    }
    getSocialAuthUrl(providerInput, targetInput) {
        const provider = this.assertProvider(providerInput);
        const target = this.getSocialAuthTarget(targetInput);
        const config = SOCIAL_PROVIDERS[provider];
        const clientId = this.requiredEnv(config.clientIdEnv, provider);
        this.requiredEnv(config.clientSecretEnv, provider);
        const url = new URL(config.authUrl);
        url.searchParams.set(config.clientIdParam || 'client_id', clientId);
        url.searchParams.set('redirect_uri', this.getRedirectUri(provider, target));
        url.searchParams.set('response_type', 'code');
        url.searchParams.set('state', this.createState(provider, target));
        if (config.scope)
            url.searchParams.set('scope', config.scope);
        if (provider === 'microsoft')
            url.searchParams.set('response_mode', 'query');
        this.applyFreshLoginParams(url, provider);
        return url.toString();
    }
    async handleSocialCallback(providerInput, code, state) {
        const provider = this.assertProvider(providerInput);
        if (!code)
            throw new common_1.BadRequestException('Missing authorization code');
        const target = this.verifyState(provider, state);
        const token = await this.exchangeCodeForToken(provider, code, target);
        const profile = await this.fetchSocialProfile(provider, token.access_token);
        const user = await this.findOrCreateSocialUser(provider, profile);
        const payload = Buffer.from(JSON.stringify({
            access_token: this.signToken(user),
            user: this.toAuthUser(user),
        })).toString('base64url');
        if (target === 'mobile') {
            return `${this.getMobileCallbackUrl()}?payload=${encodeURIComponent(payload)}`;
        }
        return `${this.getFrontendUrl()}/auth/social/callback?payload=${encodeURIComponent(payload)}`;
    }
    getSocialErrorRedirect(message, stateOrTarget) {
        if (this.getTargetFromStateOrValue(stateOrTarget) === 'mobile') {
            return `${this.getMobileCallbackUrl()}?error=${encodeURIComponent(message)}`;
        }
        return `${this.getFrontendUrl()}/login?social_error=${encodeURIComponent(message)}`;
    }
    signToken(user) {
        return this.jwtService.sign({ sub: user.id, email: user.email, username: user.username });
    }
    toAuthUser(user) {
        return {
            id: user.id,
            email: user.email,
            username: user.username,
            fullName: user.fullName,
            authProvider: user.authProvider || 'local',
            avatarUrl: user.avatarUrl,
        };
    }
    async findOrCreateSocialUser(provider, profile) {
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
        const username = await this.buildUniqueUsername(profile.username || profile.email || `${provider}_${profile.id}`);
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
    async buildUniqueUsername(value) {
        const base = value
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
    async exchangeCodeForToken(provider, code, target) {
        const config = SOCIAL_PROVIDERS[provider];
        const clientId = this.requiredEnv(config.clientIdEnv, provider);
        const clientSecret = this.requiredEnv(config.clientSecretEnv, provider);
        const redirectUri = this.getRedirectUri(provider, target);
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
    async fetchSocialProfile(provider, accessToken) {
        if (!accessToken)
            throw new common_1.BadRequestException('Provider did not return access token');
        const config = SOCIAL_PROVIDERS[provider];
        const headers = { Authorization: `Bearer ${accessToken}` };
        const url = new URL(config.userInfoUrl);
        if (provider === 'facebook' || provider === 'instagram' || provider === 'zalo') {
            url.searchParams.set('access_token', accessToken);
            delete headers.Authorization;
        }
        const data = await this.fetchJson(url.toString(), { headers });
        const profile = this.mapProfile(provider, data);
        if (!profile.id)
            throw new common_1.BadRequestException('Provider profile missing id');
        return profile;
    }
    mapProfile(provider, data) {
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
    async fetchJson(url, init) {
        const response = await fetch(url, init);
        const data = await response.json().catch(() => ({}));
        if (!response.ok || data.error) {
            const message = data.error_description ||
                data.error?.message ||
                data.message ||
                'OAuth provider request failed';
            throw new common_1.BadRequestException(message);
        }
        return data;
    }
    assertProvider(provider) {
        if (!Object.prototype.hasOwnProperty.call(SOCIAL_PROVIDERS, provider)) {
            throw new common_1.BadRequestException('Unsupported social provider');
        }
        return provider;
    }
    requiredEnv(name, provider) {
        const value = process.env[name];
        if (!value)
            throw new common_1.BadRequestException(`Missing ${name} for ${provider} login`);
        return value;
    }
    getRedirectUri(provider, target = 'web') {
        const baseUrl = target === 'mobile'
            ? process.env.MOBILE_OAUTH_REDIRECT_BASE_URL ||
                process.env.OAUTH_REDIRECT_BASE_URL ||
                'http://localhost:3000'
            : process.env.OAUTH_REDIRECT_BASE_URL || 'http://localhost:3000';
        return `${baseUrl.replace(/\/$/, '')}/auth/social/${provider}/callback`;
    }
    getFrontendUrl() {
        return (process.env.FRONTEND_URL || 'http://localhost:3001').replace(/\/$/, '');
    }
    getMobileCallbackUrl() {
        return (process.env.MOBILE_OAUTH_CALLBACK_URL || 'expensetracker://auth/callback').replace(/\/$/, '');
    }
    getSocialAuthTarget(target) {
        return target === 'mobile' ? 'mobile' : 'web';
    }
    applyFreshLoginParams(url, provider) {
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
    getTargetFromStateOrValue(value) {
        if (value === 'mobile')
            return 'mobile';
        const stateTarget = value?.split('.')?.[1];
        return stateTarget === 'mobile' ? 'mobile' : 'web';
    }
    getStateSecret() {
        return process.env.OAUTH_STATE_SECRET || process.env.JWT_SECRET || 'expense_tracker_secret_key';
    }
    createState(provider, target) {
        const payload = `${provider}.${target}.${Date.now()}.${(0, crypto_1.randomBytes)(12).toString('hex')}`;
        const signature = (0, crypto_1.createHmac)('sha256', this.getStateSecret()).update(payload).digest('hex');
        return `${payload}.${signature}`;
    }
    verifyState(provider, state) {
        if (!state)
            throw new common_1.BadRequestException('Missing OAuth state');
        const parts = state.split('.');
        if (parts.length !== 5 || parts[0] !== provider) {
            throw new common_1.BadRequestException('Invalid OAuth state');
        }
        const target = this.getSocialAuthTarget(parts[1]);
        const payload = parts.slice(0, 4).join('.');
        const expected = (0, crypto_1.createHmac)('sha256', this.getStateSecret()).update(payload).digest('hex');
        const expectedBuffer = Buffer.from(expected);
        const actualBuffer = Buffer.from(parts[4]);
        if (expectedBuffer.length !== actualBuffer.length || !(0, crypto_1.timingSafeEqual)(expectedBuffer, actualBuffer)) {
            throw new common_1.BadRequestException('Invalid OAuth state');
        }
        return target;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map