import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login/login';
import { Navigation } from "./navigation/navigation";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ReactiveFormsModule, Navigation],
  templateUrl: './app.html',
  styleUrls: ['./app.css'] // ✅ Fixed typo here
})
export class App implements OnInit {
  isDarkMode = signal(false);

@NgModule({
  declarations: [LoginComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
     // ✅ Add this to imports
  ],
  bootstrap: [LoginComponent]
})

ngOnInit() {
 const savedMode = localStorage.getItem('darkMode') === 'true';

 document.body.classList.remove('light', 'dark');
 document.body.classList.add(savedMode ? 'dark' : 'light');
}

toggleDarkMode(): void {
  const isDark = this.isDarkMode(); // however you're tracking it
  document.body.classList.remove(isDark ? 'light-mode' : 'dark-mode');
  document.body.classList.add(isDark ? 'dark-mode' : 'light-mode');
}

  protected title = 'PropertyManagement';
}
