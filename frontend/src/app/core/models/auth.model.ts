export interface ILoginData{
    email:string;
    password:string;
}

export interface ILoginRes{
    message:string;
    token:string;
}

export interface ITokenPayload{
    id:string;
    name:string;
    role:string;
    iat:number;
    exp:number;
}