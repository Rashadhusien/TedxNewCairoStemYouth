export interface UploadWidgetValue {
  url: string;
  publicId: string;
  sizeBytes?: number;
  mimeType?: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  status: "all" | "active" | "inactive";
  search: string;
}

export interface SearchParams {
  page?: string;
  pageSize?: string;
  status?: string;
  search?: string;
  type?: string;
  tagIds?: string;
  category?: string;
  from?: string;
  to?: string;
}
