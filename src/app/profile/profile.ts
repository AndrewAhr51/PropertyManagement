import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit { // ✅ Implementing OnInit for better lifecycle control
  profileForm!: FormGroup; // ✅ Ensuring initialization

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initializeForm();
  }

  private initializeForm() {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      confirmEmail: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      phone: ['', Validators.required],
      phoneType: ['', Validators.required],
      address: ['', Validators.required],
      address1: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipcode: ['', Validators.required],
      contactMethod: ['', Validators.required],
    }, { validator: this.matchFields('email', 'confirmEmail') });

  }
  matchFields(field1: string, field2: string) {
    return (form: FormGroup) => {
      const val1 = form.controls[field1].value;
      const val2 = form.controls[field2].value;

      if (val1 !== val2) {
        form.controls[field2].setErrors({ mismatch: true });
      } else {
        form.controls[field2].setErrors(null);
      }
    };
  }

  onSubmit() {
    if (this.profileForm.valid) {
      console.log('Profile Saved:', this.profileForm.value);
    } else {
      console.warn('Form is invalid. Please check required fields.');
    }
  }
}
