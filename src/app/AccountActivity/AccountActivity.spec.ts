import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountActivity } from './AccountActivity';

describe('AccountActivity', () => {
  let component: AccountActivity;
  let fixture: ComponentFixture<AccountActivity>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountActivity]
    }).compileComponents();

    fixture = TestBed.createComponent(AccountActivity);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
