export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  parent: string | null;
  isActive: boolean;
  subCategories?: ICategory[];
}

export interface ICategoriesRes {
  message: string;
  data: ICategory[];
}
