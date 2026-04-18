import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from '../../entities/user-profile.entity';

@Injectable()
export class UserProfilesService {
  constructor(
    @InjectRepository(UserProfile)
    private profileRepo: Repository<UserProfile>,
  ) {}

  async getProfile(userId: number): Promise<UserProfile> {
    let profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) {
      profile = this.profileRepo.create({ userId });
      await this.profileRepo.save(profile);
    }
    return profile;
  }

  async updateProfile(userId: number, data: Partial<UserProfile>): Promise<UserProfile> {
    let profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) {
      profile = this.profileRepo.create({ userId, ...data });
    } else {
      Object.assign(profile, data);
    }
    return this.profileRepo.save(profile);
  }

  async updateSettings(userId: number, settings: any): Promise<UserProfile> {
    return this.updateProfile(userId, settings);
  }
}
