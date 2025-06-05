import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // ✅ Ensure RouterModule is available

@Component({
  selector: 'app-properties',
  standalone: true, // ✅ If using standalone components
  imports: [CommonModule, RouterModule], // ✅ RouterModule for routerLink support
  templateUrl: './properties.html',
  styleUrls: ['./properties.css'] // ✅ Corrected `styleUrls` instead of `styleUrl`
})
export class Properties { // ✅ Best practice: Use 'Component' suffix
  public properties: Array<{
    property_id: number;
    name: string;
    address: string;
    address1?: string;
    city: string;
    state: string;
    zipcode: string;
    status: string;
  }> = [
    { property_id: 1, name: 'Sunset Villa', address: '123 Main St', city: 'Phoenix', state: 'AZ', zipcode: '85001', status: 'Available' },
    { property_id: 2, name: 'Downtown Loft', address: '456 Central Ave', address1: 'Suite 12', city: 'Phoenix', state: 'AZ', zipcode: '85002', status: 'Occupied' }
  ]; // ✅ Initialized sample data

  getFormattedAddress(property: any): string {
    return `${property.address}${property.address1?.trim() ? ', ' + property.address1 : ''}, ${property.city}, ${property.state} ${property.zipcode}`;
  }
}
