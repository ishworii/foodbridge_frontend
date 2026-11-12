export interface User{
    id : number;
    username : string;
    email  : string;
    role : 'donor' | 'receiver';
    is_superuser: boolean;
    date_joined: string;
    last_login?: string;
    avatar_url?: string;
}

export interface Donation{
    id : number;
    donor : number;
    donor_id?: number; // For compatibility
    user_id?: number; // For compatibility
    donor_name?: string;
    title : string;
    description : string;
    quantity : number;
    location : string;
    latitude?: number;
    longitude?: number;
    food_type?: string;
    expiry_date?: string;
    image_url?: string;
    is_claimed : boolean;
    claimed_by : number | null;
    created_at : string;
}