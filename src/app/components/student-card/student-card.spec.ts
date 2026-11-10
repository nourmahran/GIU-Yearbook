import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudentCard } from './student-card';

describe('StudentCard', () => {
  let component: StudentCard;
  let fixture: ComponentFixture<StudentCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter([])],
      imports: [StudentCard],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentCard);
    fixture.componentRef.setInput('student', { id: 1, name: 'Maya Hassan', faculty: 'Engineering', classYear: 2028, quote: 'Test quote', photo: 'images/portrait-placeholder.svg' });
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
