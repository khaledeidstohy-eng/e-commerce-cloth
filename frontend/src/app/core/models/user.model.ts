export interface IAddress {
  _id?: string;
  label: string;
  street: string;
  city: string;
  governorate: string;
  isDefault: boolean;
}

export interface IUser {
  _id: string;
  name: string;
  role: string;
  email: string;
  gender?: string;
  dob?: string;
  mobilePhone?: string;
  nationalId?: string;
  addresses?: IAddress[];
  isBlocked?: boolean;
}

export interface IUsersRes {
  message: string;
  data: IUser[];
}

export interface IUserRes {
  message: string;
  data: IUser;
}
