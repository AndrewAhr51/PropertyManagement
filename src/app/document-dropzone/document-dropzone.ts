import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentUploadDto } from '../documentuploader/documentuploader'; // adjust path if needed

@Component({
  selector: 'document-dropzone',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './document-dropzone.html',
  styleUrls: ['./document-dropzone.css']
})
export class DocumentDropzone {
  @Output() documentSelected = new EventEmitter<DocumentUploadDto>();

  selectedFile: File | null = null;
  fileName = '';
  documentType = 'General';
  status = 'Active';
  uploadedByUserId = 1;
  description = '';

  // Drag-and-drop support
  handleDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  handleDrop(event: DragEvent): void {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.setDroppedFile(files[0]);
    }
  }

  // Manual file input fallback
  handleFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.setDroppedFile(input.files[0]);
    }
  }

  // Internal file setter
  private setDroppedFile(file: File): void {
    this.selectedFile = file;
    this.fileName = file.name;
  }

  // Trigger upload confirmation
  confirmUpload(): void {
    if (!this.selectedFile) return;

    const dto: DocumentUploadDto = {
      file: this.selectedFile,
      fileName: this.fileName,
      uploadedByUserId: this.uploadedByUserId,
      status: this.status,
      documentType: this.documentType,
      description: this.description
    };

    this.documentSelected.emit(dto);

    // Reset for next upload
    this.selectedFile = null;
    this.fileName = '';
  }
}
