using Microsoft.EntityFrameworkCore.Internal;
using System;
using System.Collections.Generic;
using System.Linq;
using Time_planner_api.Models;

namespace Time_planner_api.Helpers
{
    public class WeekPlanHelper
    {
        private class TaskHelper
        {
            private Task task;
            private int[] dayTimes;

            public TaskHelper(Task task)
            {
                this.task = task;
                Cleanup();
            }

            public TaskHelper(TaskHelper taskHelper)
            {
                task = taskHelper.GetTask();
                dayTimes = taskHelper.GetDayTimes();
            }

            public void AddAssignedTask(List<(Task, int[])> list)
            {
                if (dayTimes.All(x => x < 0))
                {
                    return;
                }
                list.Add((task, dayTimes));
            }

            public void FindPlaceIfAny(List<double>[] freeTimes)
            {
                // todo: optimize
                int count = 0;
                for (int i = 0; i < freeTimes.Length && count < task.Split; i++)
                {
                    int ind = freeTimes[i].FindIndex(x => x >= task.Time / task.Split);
                    if (ind >= 0)
                    {
                        freeTimes[i][ind] -= task.Time / task.Split;
                        dayTimes[i] = ind;
                        count++;
                    }
                }
            }

            public void UpdateFreeTimes(List<double>[] freeTimes)
            {
                for (int i = 0; i < freeTimes.Length; i++)
                {
                    if (dayTimes[i] >= 0)
                    {
                        freeTimes[i][dayTimes[i]] -= task.Time / task.Split;
                    }
                }
            }

            public double GetAssignedTime()
            {
                return dayTimes.Count(x => x >= 0) * (task.Time / task.Split);
            }

            public int GetTaskPriority()
            {
                return task.Priority;
            }

            public Task GetTask()
            {
                return task;
            }

            public int[] GetDayTimes()
            {
                var result = new int[dayTimes.Length];
                for (int i = 0; i < result.Length; i++)
                {
                    result[i] = dayTimes[i];
                }
                return result;
            }

            public void Cleanup()
            {
                dayTimes = new int[7];
                for (int i = 0; i < dayTimes.Length; i++)
                {
                    dayTimes[i] = -1;
                }
            }
        }

        public static List<(Task, int[])> FindBestWeekPlan(List<Task> tasks, List<double>[] freeTimes, int iterationCount = 30, int populationCount = 20, double worstChromosoms = 0.75)
        {
            var population = CreatePopulation(tasks, freeTimes, populationCount);

            while (iterationCount-- > 0)
            {
                RemoveWorstChromosoms(population, worstChromosoms);
                AddMutations(population, freeTimes, populationCount - population.Count);
            }

            var bestChromosom = GetBestChromosom(population);
            var assignedTasks = new List<(Task, int[])>();

            foreach (var taskHelper in bestChromosom)
            {
                taskHelper.AddAssignedTask(assignedTasks);
            }

            return assignedTasks;
        }

        private static List<List<TaskHelper>> CreatePopulation(List<Task> tasks, List<double>[] freeTimes, int populationCount)
        {
            var population = new List<List<TaskHelper>>();
            var rnd = new Random();

            while (populationCount-- > 0)
            {
                var chromosom = tasks.Select(task => new TaskHelper(task)).OrderBy(task => rnd.Next()).ToList();
                var freeTimesClone = (List<double>[])freeTimes.Clone();

                foreach (var taskHelper in chromosom)
                {
                    taskHelper.FindPlaceIfAny(freeTimesClone);
                }

                population.Add(chromosom);
            }

            return population;
        }

        private static void RemoveWorstChromosoms(List<List<TaskHelper>> population, double worstChromosoms)
        {
            population.Sort((x, y) => GetChromosomGoodness(y).CompareTo(GetChromosomGoodness(x)));
            var chromosomsToBeRemoved = (int)(worstChromosoms * (double)population.Count);
            var removeIndex = Math.Max(population.Count - (int)(worstChromosoms * (double)population.Count - 1), 0);
            population.RemoveRange(removeIndex, population.Count - removeIndex);
        }

        private static void AddMutations(List<List<TaskHelper>> population, List<double>[] freeTimes, int mutationCount, double change = 0.3)
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

                var freeTimesClone = (List<double>[])freeTimes.Clone();

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

        private static List<TaskHelper> GetBestChromosom(List<List<TaskHelper>> population)
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

        private static int GetChromosomGoodness(List<TaskHelper> chromosom)
        {
            // todo: do it better
            return (int)(chromosom.Sum(taskHelper => taskHelper.GetTaskPriority() * taskHelper.GetAssignedTime()));
        }
    }
}
