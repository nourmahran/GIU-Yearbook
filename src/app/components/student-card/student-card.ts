import { Component, input } from '@angular/core';
import { Student } from '../../models/student.model';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-student-card',
  styleUrl: './student-card.css',
  templateUrl: './student-card.html',
})
export class StudentCard {
  readonly student = input.required<Student>();
  protected useFallback(event: Event): void {
  const img = event.target as HTMLImageElement;
  img.src = 'images/portrait-placeholder.svg';
}
}
