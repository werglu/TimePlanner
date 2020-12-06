using Microsoft.EntityFrameworkCore.Internal;
using System;
using System.Collections.Generic;
using System.Linq;
using Time_planner_api.Models;

namespace Time_planner_api.Helpers
{
    public class WeekPlanHelper
    {
        public class TaskHelper
        {
            public Task Task { get; set; }
            public int[] DayTimes { get; set; }

            public TaskHelper(Task task)
            {
                this.Task = task;
                Cleanup();
            }

            public TaskHelper(TaskHelper taskHelper)
            {
                Task = taskHelper.GetTask();
                DayTimes = taskHelper.GetDayTimes();
            }

            public void AddAssignedTask(List<(Task, int[])> list)
            {
                if (DayTimes.All(x => x < 0))
                {
                    return;
                }
                list.Add((Task, DayTimes));
            }

            public void FindPlaceIfAny(List<int>[] freeTimes)
            {
                // todo: optimize
                int count = 0;
                for (int i = 0; i < freeTimes.Length && count < Task.Split; i++)
                {
                    if (((Task.Days >> i) & 1) == 0)
                    {
                        continue;
                    }
                    if (DayTimes[i] >= 0)
                    {
                        count++;
                        continue;
                    }
                    for (int j = 0; j < freeTimes[i].Count; j++)
                    {
                        if (freeTimes[i][j] >= Task.Time.Value / Task.Split.Value)
                        {
                            freeTimes[i][j] -= Task.Time.Value / Task.Split.Value;
                            DayTimes[i] = j;
                            count++;
                            break;
                        }
                    }
                }
            }

            public void UpdateFreeTimes(List<int>[] freeTimes)
            {
                for (int i = 0; i < freeTimes.Length; i++)
                {
                    if (DayTimes[i] >= 0)
                    {
                        freeTimes[i][DayTimes[i]] -= Task.Time.Value / Task.Split.Value;
                    }
                }
            }

            public int GetAssignedTime()
            {
                return DayTimes.Count(x => x >= 0) * (Task.Time.Value / Task.Split.Value);
            }

            public int GetTaskPriority()
            {
                return Task.Priority;
            }

            public Task GetTask()
            {
                return Task;
            }

            public int[] GetDayTimes()
            {
                var result = new int[DayTimes.Length];
                for (int i = 0; i < result.Length; i++)
                {
                    result[i] = DayTimes[i];
                }
                return result;
            }

            public void Cleanup()
            {
                DayTimes = new int[7];
                for (int i = 0; i < DayTimes.Length; i++)
                {
                    DayTimes[i] = -1;
                }
            }
        }

        public static List<(Task, int[])> FindBestWeekPlan(List<Task> tasks, List<int>[] freeTimes, int iterationCount = 1, int populationCount = 20, double worstChromosoms = 0.75)
        {
            var population = CreatePopulation(tasks.Where(task => task.Time != null && task.Split != null && task.Days != null).ToList(), freeTimes, populationCount);

            while (iterationCount-- > 0)
            {
                RemoveWorstChromosoms(population, worstChromosoms);
                AddMutations(population, freeTimes, populationCount - population.Count);
            }

            var bestChromosom = GetBestChromosom(population);
            var assignedTasks = GetTasksWithoutTime(tasks);

            foreach (var taskHelper in bestChromosom)
            {
                taskHelper.AddAssignedTask(assignedTasks);
            }

            return assignedTasks;
        }

        private static List<(Task, int[])> GetTasksWithoutTime(List<Task> tasks)
        {
            return tasks.Where(task => task.Time == null || task.Split == null || task.Days == null).Select(task2 => (task2, new int[] { -1, -1, -1, -1, -1, -1, -1 })).ToList();
        }

        private static List<List<TaskHelper>> CreatePopulation(List<Task> tasks, List<int>[] freeTimes, int populationCount)
        {
            var population = new List<List<TaskHelper>>();
            var rnd = new Random();

            while (populationCount-- > 0)
            {
                var chromosom = tasks.Select(task => new TaskHelper(task)).OrderBy(task => rnd.Next()).ToList();
                var freeTimesClone = (List<int>[])freeTimes.Clone();

                foreach (var taskHelper in chromosom)
                {
                    taskHelper.FindPlaceIfAny(freeTimesClone);
                }

                population.Add(chromosom);
            }

            return population;
        }

        public static void RemoveWorstChromosoms(List<List<TaskHelper>> population, double worstChromosoms)
        {
            if (population.Count == 0)
            {
                return;
            }
            population.Sort((x, y) => GetChromosomGoodness(y).CompareTo(GetChromosomGoodness(x)));
            var chromosomsToBeRemoved = (int)(worstChromosoms * (double)population.Count);
            var removeIndex = Math.Max(population.Count - (int)(worstChromosoms * (double)population.Count - 1), 0);
            population.RemoveRange(removeIndex, population.Count - removeIndex);
        }

        private static void AddMutations(List<List<TaskHelper>> population, List<int>[] freeTimes, int mutationCount, double change = 0.3)
        {
            // todo: add different mutations
            var rnd = new Random();
            var mutatedChromosoms = new List<List<TaskHelper>>();

            while (mutationCount-- > 0)
            {
                var chromosomToBeMutated = population[rnd.Next(population.Count)];
                var mutatedChromosom = new List<TaskHelper>();

                foreach (var taskHelper in chromosomToBeMutated)
                {
                    mutatedChromosom.Add(new TaskHelper(taskHelper));
                }

                mutatedChromosom.Sort((x, y) => rnd.Next());

                int changeTasks = (int)(change * (double)mutatedChromosom.Count);

                foreach (var taskHelper in mutatedChromosom)
                {
                    taskHelper.Cleanup();
                    if (--changeTasks <= 0)
                    {
                        break;
                    }
                }

                var freeTimesClone = (List<int>[])freeTimes.Clone();

                foreach(var taskHelper in mutatedChromosom)
                {
                    taskHelper.UpdateFreeTimes(freeTimesClone);
                }

                foreach (var taskHelper in mutatedChromosom)
                {
                    taskHelper.FindPlaceIfAny(freeTimesClone);
                }

                mutatedChromosoms.Add(mutatedChromosom);
            }

            population.AddRange(mutatedChromosoms);
        }

        public static List<TaskHelper> GetBestChromosom(List<List<TaskHelper>> population)
        {
            if (population.Count == 0)
            {
                return null;
            }

            var bestChromosom = population.First();
            var bestChromosomGoodness = GetChromosomGoodness(bestChromosom);

            foreach (var chromosom in population)
            {
                var chromosomGoodness = GetChromosomGoodness(chromosom);
                if (chromosomGoodness > bestChromosomGoodness)
                {
                    bestChromosom = chromosom;
                    bestChromosomGoodness = chromosomGoodness;
                }
            }

            return bestChromosom;
        }

        public static int GetChromosomGoodness(List<TaskHelper> chromosom)
        {
            // todo: do it better
            return (int)(chromosom.Sum(taskHelper => (3 - taskHelper.GetTaskPriority()) * taskHelper.GetAssignedTime()));
        }
    }
}
