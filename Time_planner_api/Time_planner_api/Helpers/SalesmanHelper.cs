using System;
using System.Collections.Generic;
using System.Linq;
using Time_planner_api.Models;

namespace Time_planner_api.Helpers
{
    public class SalesmanHelper
    {
        public static List<Task> FindShortestRoute(List<Task> tasks)
        {
            int taskCount = Math.Min(30, tasks.Count);
            var taskArray = new Task[taskCount];
            tasks.CopyTo(0, taskArray, 0, taskCount);
            var oldList = taskArray;
            var newList = (Task[])taskArray.Clone();
            var size = oldList.Length;
            var noImprovementCount = 0;

            while (noImprovementCount < 500)
            {
                var bestDistance = CalculateDistance(oldList);

                for (int i = 1; i < size - 1; i++)
                {
                    for (int j = i + 1; j < size; j++)
                    {
                        for (int k = 0; k < i; k++)
                        {
                            newList[k] = oldList[k];
                        }

                        for (int k = i; k <= j; k++)
                        {
                            newList[k] = oldList[i + j - k];
                        }

                        for (int k = j + 1; k < size; k++)
                        {
                            newList[k] = oldList[k];
                        }

                        var newDistance = CalculateDistance(newList);

                        if (newDistance >= bestDistance)
                        {
                            continue;
                        }

                        noImprovementCount = 0;

                        for (int k = 0; k < size; k++)
                        {
                            oldList[k] = newList[k];
                        }

                        bestDistance = newDistance;
                    }
                }

                noImprovementCount++;
            }
            return newList.ToList();
        }

        private static double CalculateDistance(Task[] tasks)
        {
            double distance = 0;
            var size = tasks.Length;

            for (int i = 0; i < size; i++)
            {
                distance += Math.Sqrt(Math.Pow((tasks[i].Latitude.Value - tasks[(i + 1) % size].Latitude.Value), 2) +
                    Math.Pow((tasks[i].Longitude.Value - tasks[(i + 1) % size].Longitude.Value), 2));
            }

            return distance;
        }
    }
}
