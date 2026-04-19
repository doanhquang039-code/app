import { Repository } from 'typeorm';
import { UserProfile } from '../../entities/user-profile.entity';
export declare class UserProfilesService {
    private profileRepo;
    constructor(profileRepo: Repository<UserProfile>);
    getProfile(userId: number): Promise<UserProfile>;
    updateProfile(userId: number, data: Partial<UserProfile>): Promise<UserProfile>;
    updateSettings(userId: number, settings: any): Promise<UserProfile>;
}
