import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentDropzone } from '../document-dropzone/document-dropzone';
import { DocumentService } from '../services/document.service';
import { DocumentDto, DocumentReferenceDto, PagedResult } from '../models/document-dto.model';
import { ChangeDetectorRef } from '@angular/core';
export interface DocumentMeta {
  id: number;
  name: string;
  mimeType: string;
  uploadedAt: string;
  downloadUrl: string;
  size?: number;
  isEncrypted?: boolean;
  checksum?: string;
  correlationId?: string;
  referenceSummary?: string;
}

export interface DocumentUploadDto {
  file: File;
  fileName: string;
  uploadedByUserId: number;
  status?: string;
  documentType?: string;
  description?: string;
}

@Component({
  selector: 'app-documentuploader',
  standalone: true,
  imports: [CommonModule, FormsModule, DocumentDropzone],
  templateUrl: './documentuploader.html',
  styleUrls: ['./documentuploader.css']
})
export class DocumentUploader implements OnInit {
  documents: DocumentMeta[] = [];
  uploadedDocument: DocumentDto | null = null;

  loading = true;
  loadingDocuments = false;
  isUploading = false;
  error = '';

  fileName = '';
  selectedFile: File | null = null;
  uploadedByUserId = 1;
  status = 'Active';
  documentType = 'General';
  description = '';

  pageIndex = 0;
  pageSize = 5;
  totalDocuments = 0;

  constructor(private http: HttpClient, private documentService: DocumentService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadDocuments();
  }

  totalPages(): number {
    return Math.ceil(this.totalDocuments / this.pageSize);
  }

  referenceSummary(doc: DocumentDto): string {
    const refs: DocumentReferenceDto[] =
      Array.isArray(doc.references)
        ? doc.references
        : Array.isArray((doc.references as any)?.$values)
        ? (doc.references as any).$values
        : [];

    return refs.length
      ? refs
          .map(ref => `${ref.relatedEntityType} [${ref.relatedEntityId}] (${ref.accessRole})`)
          .join(', ')
      : 'No references';
  }

  buildFormData(dto: DocumentUploadDto): FormData {
    const formData = new FormData();
    formData.append('file', dto.file);
    formData.append('fileName', dto.fileName);
    formData.append('uploadedByUserId', dto.uploadedByUserId.toString());
    if (dto.status) formData.append('status', dto.status);
    if (dto.documentType) formData.append('documentType', dto.documentType);
    if (dto.description) formData.append('description', dto.description);
    return formData;
  }

  loadDocuments(): void {
  this.loadingDocuments = true;

  const params = { pageIndex: this.pageIndex, pageSize: this.pageSize };
  const url = 'https://localhost:7144/api/v1/documents/get-paged-documents';

  this.http.get<PagedResult<DocumentDto>>(url, { params }).subscribe({
    next: res => {
      this.totalDocuments = res.totalCount;

      // ✅ Step 1: Map paged documents
      const pagedDocs: DocumentMeta[] = res.data
      .filter(doc => !this.uploadedDocument || doc.id !== this.uploadedDocument.id)
      .map(doc => ({
        id: doc.id,
        name: doc.name,
        mimeType: doc.mimeType,
        uploadedAt: new Date(doc.createDate).toLocaleString(),
        downloadUrl: `https://localhost:7144/api/v1/documents/${doc.id}`,
        size: doc.sizeInBytes,
        isEncrypted: doc.isEncrypted,
        checksum: doc.checksum,
        correlationId: doc.correlationId,
        referenceSummary: this.referenceSummary(doc)
      }));

      // ✅ Step 2: Build pinned document from uploadedDocument
      const pinnedDoc: DocumentMeta | null = this.uploadedDocument
        ? {
            id: this.uploadedDocument.id,
            name: this.uploadedDocument.name,
            mimeType: this.uploadedDocument.mimeType,
            uploadedAt: new Date(this.uploadedDocument.createDate).toLocaleString(),
            downloadUrl: `https://localhost:7144/api/v1/documents/${this.uploadedDocument.id}`,
            size: this.uploadedDocument.sizeInBytes,
            isEncrypted: this.uploadedDocument.isEncrypted,
            checksum: this.uploadedDocument.checksum,
            correlationId: this.uploadedDocument.correlationId,
            referenceSummary: this.referenceSummary(this.uploadedDocument)
          }
        : null;

        // ✅ Step 3: Assemble final document list
        this.documents = pinnedDoc ? [pinnedDoc, ...pagedDocs] : pagedDocs;
        this.loadingDocuments = false;
        this.cdr.detectChanges();
        },
          error: err => {
          console.error('Error loading paged documents:', err);
          this.error = 'Failed to load documents.';
          this.loadingDocuments = false;
        }
      });

  }

  upload(): void {
    if (!this.selectedFile || !this.fileName || this.uploadedByUserId <= 0) return;

    this.isUploading = true;

    const dto: DocumentUploadDto = {
      file: this.selectedFile,
      fileName: this.fileName,
      uploadedByUserId: this.uploadedByUserId,
      status: this.status,
      documentType: this.documentType,
      description: this.description
    };

    const formData = this.buildFormData(dto);

    this.http.post<DocumentDto>(
      'https://localhost:7144/api/v1/documents/upload-document',
      formData,
      { observe: 'response' }
    ).subscribe({
      next: res => {
        if ((res.status === 200 || res.status === 201) && res.body) {
          this.uploadedDocument = res.body;
          this.selectedFile = null;
          this.fileName = '';
          this.isUploading = false;
          this.loadDocuments();
        } else {
          console.warn('Unexpected response:', res.status);
          alert('Unexpected response from server.');
          this.isUploading = false;
        }
      },
      error: err => {
        console.error('Upload failed:', err);
        alert('Upload failed. See console for details.');
        this.isUploading = false;
      }
    });
  }

 uploadFromDropzone(dto: DocumentUploadDto): void {
  this.loadingDocuments = true;
  const formData = this.buildFormData(dto);

  this.http.post<DocumentDto>(
    'https://localhost:7144/api/v1/documents/upload-document',
    formData
  ).subscribe({
    next: uploaded => {
      this.uploadedDocument = uploaded;

      // Let Angular paint the preview before fetching new list
      setTimeout(() => {
        // Reset pageIndex to make sure newest doc appears at the top
        this.pageIndex = 0;
        this.loadDocuments();

        // Optional scroll to list area
        const listSection = document.querySelector('.document-list');
        if (listSection) {
          listSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 250);
    },
    error: err => {
      console.error('Dropzone upload failed:', err);
      this.error = 'Upload failed.';
      this.loadingDocuments = false;
    }
  });
}

  download(doc: DocumentMeta): void {
    window.open(doc.downloadUrl, '_blank');
  }

  changePage(index: number): void {
    if (index < 0 || index >= this.totalPages()) return;

    this.pageIndex = index;
    this.loadDocuments();

    const listSection = document.querySelector('.document-list');
    if (listSection) {
      listSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
