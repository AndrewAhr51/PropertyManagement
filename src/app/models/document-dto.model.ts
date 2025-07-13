export interface DocumentReferenceDto {
  relatedEntityId: number;
  relatedEntityType: string;
  accessRole: string; // 👈 Add this line
  linkedDate: string;
  description?: string;
}

export interface DocumentDto {
  id: number;
  name: string;
  mimeType: string;
  documentType: string; // e.g., 'Application', 'Contract', 'Inspection Report'
  createDate: string; // ISO string — format with Angular date pipe
  sizeInBytes: number;
  status: string; // e.g., 'Uploaded', 'Validated', 'Archived'
  checksum: string; // for integrity verification
  correlationId: string; // for tracking across systems
  isEncrypted: boolean;
  references: DocumentReferenceDto[]; // normalized collection
}
export interface PagedResult<T> {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  data: T[];
}
