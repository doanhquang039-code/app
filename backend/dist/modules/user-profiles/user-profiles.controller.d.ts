import { UserProfilesService } from './user-profiles.service';
export declare class UserProfilesController {
    private readonly service;
    constructor(service: UserProfilesService);
    getProfile(req: any): Promise<import("../../entities/user-profile.entity").UserProfile>;
    updateProfile(req: any, data: any): Promise<import("../../entities/user-profile.entity").UserProfile>;
    updateSettings(req: any, settings: any): Promise<import("../../entities/user-profile.entity").UserProfile>;
}
