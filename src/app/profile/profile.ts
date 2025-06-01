import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true, // ✅ Marking it as standalone
  imports: [ReactiveFormsModule, CommonModule], // ✅ Ensuring proper imports
  templateUrl: './profile.html', // ✅ Correcting file name
  styleUrls: ['./profile.css'] // ✅ Correcting file name
})
export class ProfileComponent {
  profileForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      address1: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipcode: ['', Validators.required]
    });
  }

  onSubmit() {
    console.log('Profile Saved:', this.profileForm.value);
  }
}
