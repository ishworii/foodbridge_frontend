export interface User{
    id : number;
    username : string;
    email  : string;
    role : 'donor' | 'receiver';
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
    is_claimed : boolean;
    claimed_by : number | null;
    created_at : string;
}