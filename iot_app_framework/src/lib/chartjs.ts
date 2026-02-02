import "chartjs-adapter-date-fns";

import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    LinearScale,
    TimeScale,
    PointElement,
    LineElement,
    BarElement,
    Filler,
    Title,
    CategoryScale
  } from "chart.js";
  
ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    LinearScale,
    TimeScale,
    PointElement,
    LineElement,
    BarElement,
    Filler,
    Title,
    CategoryScale
);