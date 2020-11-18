using Microsoft.EntityFrameworkCore;
using System;
using Time_planner_api.Controllers;
using Time_planner_api.Models;
using Xunit;
using System.Linq;
using Time_planner_api.Helpers;
using System.Collections.Generic;

namespace UnitTests
{
    public class WeekPlanHelperTests
    {
        [Fact]
        public void HasValidDayTimesAfterTaskHelperCreation()
        {
            var taskHelper = new WeekPlanHelper.TaskHelper(new Task());
            Assert.Equal(7, taskHelper.DayTimes.Length);
            Assert.All(taskHelper.DayTimes, x => Assert.True(x < 0));
        }

        [Fact]
        public void DeepCopiesDayTimesWhenCreatingNewTaskHelper()
        {
            var originalTaskHelper = new WeekPlanHelper.TaskHelper(new Task()) { DayTimes = new int[] { 1, 2, 3, 4, 5, 6, 7 } };
            var copiedTaskHelper = new WeekPlanHelper.TaskHelper(originalTaskHelper);
            originalTaskHelper.DayTimes[0] = 7;
            Assert.Equal(1, copiedTaskHelper.DayTimes[0]);
        }

        [Fact]
        public void DoesNotAddNotAssignedTask()
        {
            var taskHelper = new WeekPlanHelper.TaskHelper(new Task());
            var assignedTasks = new List<(Task, int[])>();
            taskHelper.AddAssignedTask(assignedTasks);
            Assert.Empty(assignedTasks);
        }

        [Fact]
        public void AddsAssignedTask()
        {
            var taskHelper = new WeekPlanHelper.TaskHelper(new Task()) { DayTimes = new int[] { 2, 1, 0, 0, 0, 0, 0 } };
            var assignedTasks = new List<(Task, int[])>();
            taskHelper.AddAssignedTask(assignedTasks);
            Assert.Single(assignedTasks);
        }

        [Fact]
        public void FindsOnlyMissingDates()
        {
            int shouldSplitInto = 4;
            var taskHelper = new WeekPlanHelper.TaskHelper(new Task() { Days = 255, Time = 4, Split = shouldSplitInto }) { DayTimes = new int[] { 0, -1, -1, -1, -1, -1, -1 } };
            var freeTimes = new List<int>[7]
            {
                new List<int>() { 2 },
                new List<int>() { 2 },
                new List<int>() { 2 },
                new List<int>() { 2 },
                new List<int>() { 2 },
                new List<int>() { 2 },
                new List<int>() { 2 }
            };
            taskHelper.FindPlaceIfAny(freeTimes);
            Assert.Equal(shouldSplitInto, taskHelper.DayTimes.Count(x => x >= 0));
        }

        [Fact]
        public void DoesNotThrowWhenRemovingWorstChromosomsOnEmptyList()
        {
            WeekPlanHelper.RemoveWorstChromosoms(new List<List<WeekPlanHelper.TaskHelper>>(), 0.5);
        }

        [Fact]
        public void DoesNotThrowWhenRemovingWorstChromosomsWithInvalidValue()
        {
            WeekPlanHelper.RemoveWorstChromosoms(new List<List<WeekPlanHelper.TaskHelper>>()
            {
                new List<WeekPlanHelper.TaskHelper>
                {
                    new WeekPlanHelper.TaskHelper(new Task()), new WeekPlanHelper.TaskHelper(new Task())
                }
            }, 2.0);
        }

        [Fact]
        public void ReturnsNullForBestChromosomOnEmptyList()
        {
            Assert.Null(WeekPlanHelper.GetBestChromosom(new List<List<WeekPlanHelper.TaskHelper>>()));
        }

        [Fact]
        public void PrioritizesTasksWithHigherPriority()
        {
            var highPriorityTask = new WeekPlanHelper.TaskHelper(new Task
            {
                Priority = 0, Time = 10, Split = 1
            })
            {
                DayTimes = new int[] { 1, 0, 0, 0, 0, 0, 0 }
            };
            var lowPriorityTask = new WeekPlanHelper.TaskHelper(new Task
            {
                Priority = 1, Time = 10, Split = 1
            })
            {
                DayTimes = new int[] { 1, 0, 0, 0, 0, 0, 0 }
            };
            var highPriorityGoodness = WeekPlanHelper.GetChromosomGoodness(new List<WeekPlanHelper.TaskHelper>() { highPriorityTask });
            var lowPriorityGoodness = WeekPlanHelper.GetChromosomGoodness(new List<WeekPlanHelper.TaskHelper>() { lowPriorityTask });
            Assert.True(highPriorityGoodness > lowPriorityGoodness);
        }
    }
}
