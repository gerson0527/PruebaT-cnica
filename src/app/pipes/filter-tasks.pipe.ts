import { Pipe, PipeTransform } from '@angular/core';
import { Task } from '../models/task.model';

@Pipe({
  name: 'filterTasks',
  standalone: true,
  pure: true
})
export class FilterTasksPipe implements PipeTransform {
  transform(tasks: Task[], categoryId: string | null, searchQuery: string): Task[] {
    let filtered = tasks;

    if (categoryId) {
      filtered = filtered.filter(t => t.categoryId === categoryId);
    }

    if (searchQuery && searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(t => t.title.toLowerCase().includes(query));
    }

    return filtered;
  }
}
