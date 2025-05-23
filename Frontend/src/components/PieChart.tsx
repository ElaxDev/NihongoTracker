import {
  ArcElement,
  Chart as ChartJS,
  ChartData,
  Legend,
  Tooltip,
} from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

function PieChart({ data }: { data: ChartData<"pie", number[]> }) {
  return (
    <Pie
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "right" } },
      }}
      data={data}
    />
  );
}

export default PieChart;
