// --- Sub-Schemas Types ---

export interface ICategoryFilterOption {
  label: string;
  label_en?: string;
  value: string;
  metadata?: Record<string, unknown>;
}

export type CategoryFilterType = 'select' | 'radio' | 'boolean' | 'text' | 'range';

export interface ICategoryFilterRangeConfig {
  min?: number;
  max?: number;
  step?: number;
  currency?: string;
}

export interface ICategoryFilter {
  name: string;
  name_en?: string;
  slug: string;
  type: CategoryFilterType;
  isRadio?: boolean;
  options?: ICategoryFilterOption[];
  config?: ICategoryFilterRangeConfig;
  required?: boolean;
}

export interface ICategoryIcon {
  svgCode?: string;
}

// --- Main Category Interface ---

export interface ICategory {
  _id: string;
  id?: string;
  title: string;
  slug: string;
  parent?: string | ICategory | null;
  description?: string;
  icon?: ICategoryIcon;
  filters: ICategoryFilter[];
  isActive: boolean;
  metadata?: Record<string, unknown>;
  subCategories?: ICategory[];
  createdAt?: string;
  updatedAt?: string;
}

export type AdminCategory = ICategory;

export interface CategoriesTypeResponse {
  success?: boolean;
  data: ICategory[];
}

export interface ICategoryResponse {
  success: boolean;
  data: ICategory;
}