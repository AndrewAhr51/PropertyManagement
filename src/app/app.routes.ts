import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { Properties } from './properties/properties';
import { Contact } from './contact/contact';
import { Admin } from './admin/admin';
import { LoginComponent } from './login/login';
import { Register } from './register/register';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Redirect root to login
  { path: 'home', component: HomeComponent }, // Ensure Home is accessible via '/home'
  { path: 'properties', component: Properties },
  { path: 'contact', component: Contact },
  { path: 'admin', component: Admin },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: Register },
  { path: '**', redirectTo: '/login' } // Catch unknown paths & redirect to login
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
