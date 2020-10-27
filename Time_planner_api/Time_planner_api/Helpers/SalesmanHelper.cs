using System;
using System.Collections.Generic;
using System.Linq;
using Time_planner_api.Models;

namespace Time_planner_api.Helpers
{
    public class SalesmanHelper
    {
        public static List<Event> FindShortestRoute(List<Event> events)
        {
            var oldList = events.ToArray();
            var newList = events.ToArray();
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

        private static double CalculateDistance(Event[] events)
        {
            double distance = 0;
            var size = events.Length;

            for (int i = 0; i < size; i++)
            {
                distance += Math.Sqrt(Math.Pow((events[i].Latitude - events[(i + 1) % size].Latitude), 2) +
                    Math.Pow((events[i].Longitude - events[(i + 1) % size].Longitude), 2));
            }

            return distance;
        }
    }
}
