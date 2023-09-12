import { UserProfile } from "./user-profile.model";

export interface LoginResponse {
    token: string;
    profile: UserProfile;
}