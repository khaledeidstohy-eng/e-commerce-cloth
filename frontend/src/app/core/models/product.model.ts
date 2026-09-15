export interface ICategoryRef {
  _id: string;
  name: string;
  slug: string;
  parent?: string | null;
}

export interface IProduct {
  _id: string;
  name: string;
  desc: string;
  price: number;
  stock: number;
  slug: string;
  imgURL: string;
  season?: 'summer' | 'winter' | 'all-season';
  category?: ICategoryRef;
  subCategory?: ICategoryRef | null;
  subSubCategory?: ICategoryRef | null;
  isActive?: boolean;
  createdAt?: string;
  salesCount?: number;
}

export interface IPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface IProductsRes {
  message: string;
  pagination?: IPagination;
  data: IProduct[];
}

export interface IProductRes {
  message: string;
  data: IProduct;
}
