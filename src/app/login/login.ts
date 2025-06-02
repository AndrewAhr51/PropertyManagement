import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../AuthService/AuthService';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-login',
  standalone: true, // ✅ Declare it as standalone
  imports: [CommonModule, ReactiveFormsModule], // ✅ Import modules directly
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})

export class LoginComponent implements OnInit, CommonModule {
  loginForm!: FormGroup;
  showPassword: boolean = false; // ✅ Fix signal usage

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.invalid) return; // ✅ Prevents unnecessary execution

    const { email, password } = this.loginForm.value;

    // Simulated authentication logic (replace with actual API call)
    const fakeToken = 'user123token';
    const userData = { email };

    this.authService.login(fakeToken, userData);

    // Navigate only after authentication update
    this.authService.isLoggedIn$.pipe().subscribe((isLoggedIn) => {
      if (isLoggedIn) {
        this.router.navigate(['/home']);
      }
    });
  }
}
