import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // Check email trùng
    const emailExists = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (emailExists) throw new ConflictException('Email đã tồn tại');

    // Check username trùng
    const usernameExists = await this.userRepository.findOne({
      where: { username: dto.username },
    });
    if (usernameExists) throw new ConflictException('Tên đăng nhập đã tồn tại');

    const hashed = await bcrypt.hash(dto.password, 10);

    const user = this.userRepository.create({
      username: dto.username,
      email: dto.email,
      password: hashed,
      fullName: dto.fullName || dto.username,
    });

    await this.userRepository.save(user);
    return { message: 'Đăng ký thành công' };
  }

  async login(dto: LoginDto) {
    // Hỗ trợ đăng nhập bằng username hoặc email
    const usernameOrEmail = dto.username;
    const isEmail = usernameOrEmail.includes('@');

    let user: User | null = null;

    if (isEmail) {
      user = await this.userRepository.findOne({
        where: { email: usernameOrEmail },
      });
    } else {
      user = await this.userRepository.findOne({
        where: { username: usernameOrEmail },
      });
    }

    if (!user) {
      throw new UnauthorizedException('Tên đăng nhập hoặc mật khẩu không đúng');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Tên đăng nhập hoặc mật khẩu không đúng');
    }

    const payload = { sub: user.id, email: user.email, username: user.username };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
      },
    };
  }
}
