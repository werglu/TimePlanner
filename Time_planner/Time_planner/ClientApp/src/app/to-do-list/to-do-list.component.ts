import { Component, OnInit } from '@angular/core';
import { ListCategoriesService } from './listCategories.service';
import { ListCategory } from './listCategory';
import { TasksService } from './tasks.service';
import { Task } from './task';
import { Observable, Subject } from 'rxjs';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { SortDescriptor } from '@progress/kendo-data-query';
import { TaskAssignmentProposition } from '../planning/taskAssignmentProposition';
import { PlanningService } from '../planning/planning.service';
import { isNullOrUndefined } from 'util';
import { FacebookService } from 'ngx-facebook';

@Component({
  selector: 'to-do-list-component',
  templateUrl: './to-do-list.component.html',
  styleUrls: ['./to-do-list.component.css']
})

export class ToDoListComponent implements OnInit {

  public listCategories: Array<ListCategory> = []; // list of categories for current user
  public priorities: Array<string> = ['High priority', 'Medium priority', 'Low priority'];
  public columns: any[] = [{ name: "Done" }, { name: "Title" }];
  public tasks: Array<Task> = [];
  public view: Observable<GridDataResult>;
  public gridData: any[] = [];
  openTask = false;
  userId: string;
  currentTask: Task;
  allCategoryId: number;
  public mySelection: number[] = [];
  refresh: Subject<any> = new Subject();
  addNewCategoryModalVisible = false;
  addNewTaskModalVisible = false;
  findDatesModalVisible = false;
  currentCategory = -1;
  foundDates: Array<TaskAssignmentProposition> = [];
  public sort: SortDescriptor[] = [{
    field: 'isDone',
    dir: 'asc'
  }, {
      field: 'priority',
      dir: 'asc'
    }];

  constructor(private listCategoriesService: ListCategoriesService,
              private tasksService: TasksService,
              private planningService: PlanningService,
              private fb: FacebookService) {
  }

  ngOnInit() {
    let authResp = this.fb.getAuthResponse();
    this.userId = authResp.userID;
    this.getCategories();
  }

  getCategories() {
    this.listCategoriesService.getAllListCategories().subscribe(lc => {
      var allCategory = lc.find(c => c.category == "All");
      if (isNullOrUndefined(allCategory)) {
        // add 'All' category if not exist for current user
        this.listCategoriesService.addCategory(this.getAllCategory()).subscribe(() => this.getAllCategoriesPerUser());
      }
      else {
        this.allCategoryId = allCategory.id;
        this.getAllCategoriesPerUser();
      }
    });
  }

  getAllCategoriesPerUser() {
    this.listCategoriesService.getAllListCategories().subscribe((c) => {
      c.forEach(cc => {
        if (cc.category == 'All') {
          this.allCategoryId = cc.id;
        }
        this.listCategories.push(cc);
      });
      this.getTasks(this.currentCategory < 0 ? this.allCategoryId : this.currentCategory); // get tasks for current selected category (default 'All')
    });
  }

  getAllCategory(): ListCategory {
    return {
      id: 1,
      category: 'All',
      ownerId: this.userId,
      tasks: null
    }
  }

  getTasks(categoryId: number) {
    this.currentCategory = categoryId;
    this.tasksService.getTasks().subscribe(tasks => {
      this.gridData = [];
      tasks.forEach(task => {
        if (categoryId == this.allCategoryId && !isNullOrUndefined(this.listCategories.map(lc => lc.id).find(c => c == task.categoryId))) {
          this.gridData.push(task);
        }
        else if (categoryId == task.categoryId) {
          this.gridData.push(task);
        }
      });
      this.refresh.next();
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

  closeOpenTaskModal() {
    this.openTask = false;
  }

  openEditTaskModal(task: Task) {
    this.openTask = true;
    this.currentTask = task;
  }

  editTask(task: Task) {
    this.closeOpenTaskModal();
    this.gridData = this.gridData.filter(t => t.id != task.id);
    if (this.currentCategory == this.allCategoryId || this.currentCategory == task.categoryId) { this.gridData.push(task); }
    this.refresh.next();
  }

  findDates() {
    this.planningService.findDates(this.mySelection, true).subscribe(taskAssignmentPropositions => {
      this.foundDates = taskAssignmentPropositions;
      this.findDatesModalVisible = true;
    });
  }

  findDatesRerun(currentWeek: boolean) {
    this.planningService.findDates(this.mySelection, currentWeek).subscribe(taskAssignmentPropositions => {
      this.foundDates = taskAssignmentPropositions;
    });
  }

  saveDates(taskAssignmentPropositions: any) {
    this.closeFindDatesModal();
  }

  selectAll() {
    this.mySelection = [];
    this.gridData.forEach(item => this.mySelection.push(item.id));
  }

  unselectAll() {
    this.mySelection = [];
  }
}
