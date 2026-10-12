/* =====================================================================
   FILE: pages/students-page/students-page.ts
   WHAT: The landing page: title, filters and the grid of student cards.
   FIGMA: Frame "Class of 2028 · Student directory".

   WHAT STUDENTS PRACTISE HERE
   1. Fetching data from a service (the fake API)
   2. Loading / error / empty states
   3. Filtering + sorting with signals and `computed`
   ===================================================================== */
import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { Student } from '../../models/student.model';
import { StudentService } from '../../services/student.service';
import { StudentCard } from '../../components/student-card/student-card';

// A type for the sort dropdown. Only these two values are allowed.
type SortMode = 'featured' | 'name';

  @Component({
  selector: 'app-student-page',
  imports: [StudentCard],
  templateUrl: './students-page.html',
  styleUrl: './students-page.css',
})
export class StudentsPage implements OnInit {
  // Ask Angular for the service. This component never touches
  // JSON files or URLs. That is the service's job.
  private readonly studentService = inject(StudentService);

  // STATE = data that can change while the page is open.
  // Each piece lives in a signal. When a signal changes, every place in
  // the template that reads it updates automatically.
  protected readonly students = signal<Student[]>([]); // all students from the "API"
  protected readonly loading = signal(true); // true until data arrives
  protected readonly errorMessage = signal(''); // empty = no error
  protected readonly searchText = signal(''); // what the user typed
  protected readonly selectedFaculty = signal('all'); // dropdown 1
  protected readonly sortBy = signal<SortMode>('featured'); // dropdown 2

  //DERIVED STATE with `computed`.
  // The list of faculties for the dropdown comes from the data itself.
  // If a new faculty appears in the JSON, the dropdown updates by itself.
  protected readonly faculties = computed(() =>
    [...new Set(this.students().map((s) => s.faculty))].sort(),
  );

  // The list the page actually shows = all students, minus the
  // ones filtered out, in the chosen order.
  // WHY computed and not a normal method? It only recalculates when one
  // of the signals it reads changes, so it is efficient.
  protected readonly visibleStudents = computed(() => {
    const text = this.searchText().trim().toLowerCase();
    const faculty = this.selectedFaculty();

    //  Filter: keep a student only if BOTH conditions pass.
    const filtered = this.students().filter(
      (s) => s.name.toLowerCase().includes(text) && (faculty === 'all' || s.faculty === faculty),
    );

    //  Sort. COMMON MISTAKE: .sort() changes the array it is called on.
    // Our `filtered` array is a fresh copy (filter made it), so it is safe.
    return this.sortBy() === 'name'
      ? filtered.sort((a, b) => a.name.localeCompare(b.name))
      : filtered.sort((a, b) => Number(b.featured) - Number(a.featured) || a.id - b.id);
  });

  // "08" style counter used by the tab label in the design.
  protected readonly totalLabel = computed(() => String(this.students().length).padStart(2, '0'));

  // ngOnInit runs ONCE, right after Angular creates the component.
  // It is the standard place to start loading data.
  ngOnInit(): void {
    // .subscribe() actually sends the request. We pass two handlers:
    // `next` runs when data arrives, `error` runs if the request fails.
    this.studentService.getStudents().subscribe({
      next: (data) => {
        this.students.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('We could not load the students. Please try again.');
        this.loading.set(false);
      },
    });
  }

  // Event handlers. Each reads what the user did and updates a signal.
  // `event.target` is typed as the generic EventTarget, so we tell
  // TypeScript which element it really is with `as`.
  protected onSearch(event: Event): void {
    this.searchText.set((event.target as HTMLInputElement).value);
  }

  protected onFacultyChange(event: Event): void {
    this.selectedFaculty.set((event.target as HTMLSelectElement).value);
  }

  protected onSortChange(event: Event): void {
    this.sortBy.set((event.target as HTMLSelectElement).value as SortMode);
  }

  protected scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
