export interface User{
    id : number;
    username : string;
    email  : string;
    role : 'donor' | 'receiver';
}

export interface Donation{
    id : number;
    donor : number;
    title : string;
    description : string;
    quantity : number;
    location : string;
    is_claimed : boolean;
    claimed_by : number | null;
    created_at : string;
}