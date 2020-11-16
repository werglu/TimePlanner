import { Component, OnInit } from '@angular/core';
import { ListCategoriesService } from './listCategories.service';
import { ListCategory } from './listCategory';
import { TasksService } from './tasks.service';
import { Task } from './task';
import { Observable, Subject } from 'rxjs';
import { GridDataResult, DataStateChangeEvent, GridComponent, DataBindingDirective } from '@progress/kendo-angular-grid';
import { SortDescriptor } from '@progress/kendo-data-query';
import { TaskAssignmentProposition } from './taskAssignmentProposition';

@Component({
  selector: 'to-do-list-component',
  templateUrl: './to-do-list.component.html',
  styleUrls: ['./to-do-list.component.css']
})

export class ToDoListComponent implements OnInit {

  public listCategories: Array<ListCategory> = [];
  public priorities: Array<string> = ['High priority', 'Medium priority', 'Low priority'];
  public columns: any[] = [{ name: "Done" }, { name: "Title" }];
  public tasks: Array<Task> = [];
  public view: Observable<GridDataResult>;
  public gridData: any[] = [];
  public mySelection: number[] = [];
  defaultItem: string;
  refresh: Subject<any> = new Subject();
  addNewCategoryModalVisible = false;
  addNewTaskModalVisible = false;
  findDatesModalVisible = false;
  currentCategory = 1;
  foundDates: Array<TaskAssignmentProposition> = [];
  public sort: SortDescriptor[] = [{
    field: 'isDone',
    dir: 'asc'
  }, {
      field: 'priority',
      dir: 'asc'
    }];

  constructor(private listCategoriesService: ListCategoriesService,
    private tasksService: TasksService) {
  }

  ngOnInit() {
    this.getCategories();
    this.getTasks(this.currentCategory);
  }

  getCategories() {
    this.listCategoriesService.getAllListCategories().subscribe(lc => {
      lc.forEach(c => this.listCategories.push(c));
    });
  }

  getTasks(categoryId: number) {
    this.currentCategory = categoryId;
    this.tasksService.getTasks().subscribe(tasks => {
      this.gridData = [];
      tasks.forEach(task => {
        if (categoryId == 1 || categoryId == task.categoryId) {
          this.gridData.push(task);
        }
      });
    });
  }

  checked(dataItem: any) {
    dataItem.isDone = !dataItem.isDone;
    this.tasksService.editTask(dataItem.id, dataItem).subscribe(() => this.getTasks(this.currentCategory));
  }

  saveChanges() {
  }

  onCategoryChange(value: any) {
    this.getTasks(value.id);
  }

  closeAddNewCategoryModal() {
    this.addNewCategoryModalVisible = false;
  }

  closeAddNewTaskModal() {
    this.addNewTaskModalVisible = false;
  }

  openAddNewCategoryModal() {
    this.addNewCategoryModalVisible = true;
  }

  openAddNewTaskModal() {
    this.addNewTaskModalVisible = true;
  }

  closeFindDatesModal() {
    this.findDatesModalVisible = false;
  }

  addTask(task: any) {
    this.closeAddNewTaskModal();
    this.getTasks(this.currentCategory);
    this.refresh.next();
  }

  removeTask(task: any) {
    this.tasksService.deleteTask(task.id).subscribe(() => this.getTasks(this.currentCategory));
  }

  addCategory(category: any) {
    this.closeAddNewCategoryModal();
    this.listCategories = [];
    this.getCategories();
    this.refresh.next();
  }

  findDates() {
    this.tasksService.findDates(this.mySelection).subscribe(taskAssignmentPropositions => {
      this.foundDates = taskAssignmentPropositions;
      this.findDatesModalVisible = true;
    });
  }

  saveDates(taskAssignmentPropositions: any) {
    this.closeFindDatesModal();
  }
}
