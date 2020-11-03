using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using Time_planner_api.Models;

namespace Time_planner_api.Helpers
{
    public class WeekPlanHelper
    {
        private class TaskHelper
        {
            private Task task;
            private double[] dayTimes;

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

            public TaskAssignmentProposition GetAssignmentProposition()
            {
                if (dayTimes.All(x => x == 0))
                {
                    return null;
                }
                return new TaskAssignmentProposition { Task = task, DayTimes = dayTimes };
            }

            public void FindPlaceIfAny(double[] freeTimes)
            {
                // todo: optimize
                int count = 0;
                for (int i = 0; i < freeTimes.Length && count < task.Split; i++)
                {
                    if (task.Time / task.Split <= freeTimes[i])
                    {
                        dayTimes[i] += task.Time / task.Split;
                        freeTimes[i] -= task.Time / task.Split;
                        count++;
                    }
                }
            }

            public double GetAssignedTime()
            {
                return dayTimes.Sum();
            }

            public double GetAssignedTime(int i)
            {
                return dayTimes[i];
            }

            public int GetTaskPriority()
            {
                return task.Priority;
            }

            public Task GetTask()
            {
                return task;
            }

            public double[] GetDayTimes()
            {
                var result = new double[dayTimes.Length];
                for (int i = 0; i < result.Length; i++)
                {
                    result[i] = dayTimes[i];
                }
                return result;
            }

            public void Cleanup()
            {
                dayTimes = new double[7];
            }
        }

        public static List<TaskAssignmentProposition> FindBestWeekPlan(List<Task> tasks, double hoursPerDay = 8.0, int iterationCount = 30, int populationCount = 20, double worstChromosoms = 0.75)
        {
            var population = CreatePopulation(tasks, hoursPerDay, populationCount);

            while (iterationCount-- > 0)
            {
                RemoveWorstChromosoms(population, worstChromosoms);
                AddMutations(population, populationCount - population.Count, hoursPerDay);
            }

            var bestChromosom = GetBestChromosom(population);
            var assignedTasks = new List<TaskAssignmentProposition>();

            foreach (var taskHelper in bestChromosom)
            {
                var assignedTask = taskHelper.GetAssignmentProposition();
                if (assignedTask != null)
                {
                    assignedTasks.Add(assignedTask);
                }
            }

            return assignedTasks;
        }

        private static List<List<TaskHelper>> CreatePopulation(List<Task> tasks, double hoursPerDay, int populationCount)
        {
            var population = new List<List<TaskHelper>>();
            var rnd = new Random();

            while (populationCount-- > 0)
            {
                var chromosom = tasks.Select(task => new TaskHelper(task)).OrderBy(task => rnd.Next()).ToList();
                var freeTimes = new double[7] { hoursPerDay, hoursPerDay, hoursPerDay, hoursPerDay, hoursPerDay, hoursPerDay, hoursPerDay }; // todo: change to count events

                foreach (var taskHelper in chromosom)
                {
                    taskHelper.FindPlaceIfAny(freeTimes);
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
            population.RemoveRange(removeIndex, population.Count - removeIndex + 1);
        }

        private static void AddMutations(List<List<TaskHelper>> population, int mutationCount, double hoursPerDay, double change = 0.3)
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

                var freeTimes = new double[7];

                for (int i = 0; i < freeTimes.Length; i++)
                {
                    freeTimes[i] = hoursPerDay - mutatedChromosom.Sum(taskHelper => taskHelper.GetAssignedTime(i)); // todo: change to count events
                }

                foreach (var taskHelper in mutatedChromosom)
                {
                    taskHelper.FindPlaceIfAny(freeTimes);
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
