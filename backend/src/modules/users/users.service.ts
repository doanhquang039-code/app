import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Transaction } from '../../entities/transaction.entity';
import { Category } from '../../entities/category.entity';
import { Budget } from '../../entities/budget.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
    @InjectRepository(Budget)
    private budgetRepo: Repository<Budget>,
  ) {}

  async getProfile(userId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('Không tìm thấy người dùng');

    // Đếm số liệu thống kê
    const [transactionCount, categoryCount, budgetCount] = await Promise.all([
      this.transactionRepo.count({ where: { userId } }),
      this.categoryRepo.count({ where: { userId } }),
      this.budgetRepo.count({ where: { userId } }),
    ]);

    const { password, ...profile } = user;
    return {
      ...profile,
      // Flutter dùng 'name' thay vì 'fullName'
      name: user.fullName,
      transactionCount,
      categoryCount,
      budgetCount,
    };
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('Không tìm thấy người dùng');

    // Kiểm tra email trùng nếu đổi email
    if (dto.email && dto.email !== user.email) {
      const emailExists = await this.userRepo.findOne({
        where: { email: dto.email },
      });
      if (emailExists) {
        throw new ConflictException('Email này đã được sử dụng');
      }
    }

    // Support both 'name' (Flutter) and 'fullName' (backend)
    if ((dto as any).name && !dto.fullName) {
      dto.fullName = (dto as any).name;
    }

    Object.assign(user, dto);
    await this.userRepo.save(user);

    const { password, ...profile } = user;
    return {
      message: 'Cập nhật thông tin thành công',
      user: { ...profile, name: user.fullName },
    };
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('Không tìm thấy người dùng');

    // Verify mật khẩu cũ
    const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Mật khẩu cũ không đúng');
    }

    // Hash mật khẩu mới
    user.password = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepo.save(user);

    return { message: 'Đổi mật khẩu thành công' };
  }

  async deleteAccount(userId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('Không tìm thấy người dùng');

    // Soft delete: đánh dấu vô hiệu hóa
    user.isActive = false;
    await this.userRepo.save(user);

    return { message: 'Tài khoản đã bị vô hiệu hóa' };
  }
}
