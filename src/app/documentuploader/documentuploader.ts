import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentDropzone } from '../document-dropzone/document-dropzone';
import { DocumentService } from '../services/document.service';
import { DocumentDto, DocumentReferenceDto } from '../models/document-dto.model';

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
  uploadedDocument?: DocumentDto | null = null;

  loading = true;
  loadingDocuments = false;
  loadingUpload = false;
  isUploading = false;
  error = '';

  fileName = '';
  selectedFile: File | null = null;
  uploadedByUserId = 1;
  status = 'Active';
  documentType = 'General';
  description = '';

  constructor(private http: HttpClient, private documentService: DocumentService) {}

  ngOnInit(): void {
    this.loadDocuments();
  }

  referenceSummary(doc: DocumentDto): string {
    let refs: DocumentReferenceDto[] = [];

    if (Array.isArray(doc.references)) {
      refs = doc.references;
    } else if (doc.references && Array.isArray((doc.references as any).$values)) {
      refs = (doc.references as any).$values;
    }

    return refs.length
      ? refs.map(ref =>
          `${ref.relatedEntityType} [${ref.relatedEntityId}] (${ref.accessRole})`
        ).join(', ')
      : 'No references';
  }

  loadDocuments(): void {
  this.http.get<DocumentDto[]>('https://localhost:7144/api/v1/documents/all').subscribe({
    next: docs => {
      const raw = docs as any;
      const values = Array.isArray(raw.$values) ? raw.$values : [];

      this.documents = values.map((doc: DocumentDto) => ({
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

      this.loading = false;
      this.loadingDocuments = false; // 👈 Fix added here
    },
    error: err => {
      console.error('Error loading documents:', err);
      this.error = 'Failed to load documents.';
      this.loading = false;
      this.loadingDocuments = false; // 👈 Fix added here too
    }
  });
}


  upload(): void {
    if (!this.selectedFile || !this.fileName || this.uploadedByUserId <= 0) return;

    this.isUploading = true;

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('fileName', this.fileName);
    formData.append('uploadedByUserId', this.uploadedByUserId.toString());
    formData.append('status', this.status);
    formData.append('documentType', this.documentType);
    formData.append('description', this.description);

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

          this.documents.unshift({
            id: res.body.id,
            name: res.body.name,
            mimeType: res.body.mimeType,
            uploadedAt: new Date(res.body.createDate).toLocaleString(),
            downloadUrl: `https://localhost:7144/api/v1/documents/${res.body.id}`,
            size: res.body.sizeInBytes,
            isEncrypted: res.body.isEncrypted,
            checksum: res.body.checksum,
            correlationId: res.body.correlationId,
            referenceSummary: this.referenceSummary(res.body)
          });

          this.loadDocuments();
        } else {
          console.warn('Unexpected response status:', res.status);
          alert('Unexpected response from server.');
          this.isUploading = false;
        }
      },
      error: err => {
        console.error('Upload failed:', err);
        alert('Upload failed. Check console for details.');
        this.isUploading = false;
      }
    });
  }

  uploadFromDropzone(dto: DocumentUploadDto): void {
    this.loadingDocuments = true;

    const formData = new FormData();
    formData.append('file', dto.file);
    formData.append('fileName', dto.fileName);
    formData.append('uploadedByUserId', dto.uploadedByUserId.toString());
    if (dto.status) formData.append('status', dto.status);
    if (dto.documentType) formData.append('documentType', dto.documentType);
    if (dto.description) formData.append('description', dto.description);

    this.http.post<DocumentDto>(
      'https://localhost:7144/api/v1/documents/upload-document',
      formData
    ).subscribe({
      next: uploaded => {
        this.uploadedDocument = uploaded;
        this.loadDocuments();
      },
      error: err => {
        console.error('Upload failed:', err);
        this.error = 'Upload failed.';
        this.loadingDocuments = false;
      }
    });
  }

  download(doc: DocumentMeta): void {
    window.open(doc.downloadUrl, '_blank');
  }
}
