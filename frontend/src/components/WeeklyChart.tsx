import Chart from "react-apexcharts";
import { useNavigate } from "react-router-dom";
import { Theme, WeeklyReportResponse } from "../types";

interface WeeklyChartProps {
	graphData: WeeklyReportResponse;
	theme: Theme;
}

const WeeklyChart = ({ graphData, theme }: WeeklyChartProps) => {
	const data = graphData?.graphData || [];

	const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

	const isDark = theme === "dark";

	const navigate = useNavigate();

	const dateRange = `${new Date(graphData?.range?.fromDate).toLocaleDateString("en-GB", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	})} -         ${new Date(graphData?.range?.toDate).toLocaleDateString("en-GB", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	})}`;

	if (!sortedData.length) {
		return <p className="text-center text-red-500 font-[Roboto_Condensed] uppercase">No data found</p>;
	}

	const categories = sortedData.map((d) =>
		new Date(d.date).toLocaleDateString("en-IN", {
			month: "short",
			day: "numeric",
		})
	);

	const series = [
		{
			name: "Total Calls",
			data: sortedData.map((d) => d.total_calls),
		},
	];

	const options = {
		chart: {
			type: "bar" as const,
			toolbar: { show: true },
			export: {
				csv: {
					filename: "weekly-calls",
					headerCategory: "Date",
					headerValue: "Calls",
				},
			},

			background: "transparent",

			redrawOnWindowResize: true,
			redrawOnParentResize: true,
		},

		title: {
			text: "Weekly Call Summary",
			align: "center" as const,
			margin: 20,
			style: {
				fontSize: "18px",
				fontWeight: 600,
			},
		},

		subtitle: {
			text: dateRange,
			align: "center" as const,
			offsetY: 35,
			margin: 10,
			style: {
				fontSize: "15px",
				color: "#888",
			},
		},
		theme: {
			mode: isDark ? ("dark" as const) : ("light" as const),
		},
		colors: ["#25a0fc", "#f59e0b", "#10b981", "#ef4444", "#6D214F", "#8b5cf6", "#ec4899"],

		plotOptions: {
			bar: {
				borderRadius: 6,
				borderRadiusApplication: "end" as const,
				columnWidth: "50px",
				distributed: true,
			},
		},

		dataLabels: { enabled: false },

		xaxis: {
			categories,
		},

		yaxis: {
			min: 0,
		},

		legend: {
			show: false,
			position: "bottom" as const,
		},

		tooltip: {
			shared: true,
			intersect: false,
			followCursor: true,

			marker: {
				show: false,
			},

			custom: function ({ dataPointIndex }: { dataPointIndex: number }) {
				const d = sortedData[dataPointIndex];

				return `
<div className="font-[Helvetica,Arial,sans-serif]!">
  <div class="apexcharts-tooltip-title font-[Helvetica,Arial,sans-serif]!">
 ${new Date(d.date).toLocaleDateString("en-IN", {
		month: "short",
		day: "numeric",
		weekday: "short",
 })}
  </div>

  <div class="p-2 space-y-3 text-sm font-[Helvetica,Arial,sans-serif]!">

  <div class="flex justify-between items-center">
    <span class="flex items-center gap-3">
      <span class="w-2 h-2 rounded-full bg-green-500"></span>
      Total Calls :
    </span>
    <span class="font-semibold pl-2"> ${d.total_calls}</span>
  </div>

  <div class="flex justify-between items-center">
    <span class="flex items-center gap-3">
      <span class="w-2 h-2 rounded-full bg-pink-500"></span>
      Bed Count :
    </span>
    <span class="font-semibold pl-2"> ${d.bed_count}</span>
  </div>

  <div class="flex justify-between items-center">
    <span class="flex items-center gap-3">
      <span class="w-2 h-2 rounded-full bg-yellow-500"></span>
      Toilet Count : 
    </span>
    <span class="font-semibold pl-2"> ${d.toilet_count} </span>
  </div>

</div>

  </div>
</div>


  `;
			},
		},

		responsive: [
			{
				breakpoint: 1536,
				options: {
					plotOptions: { bar: { columnWidth: "50px" } },
				},
			},
			{
				breakpoint: 1024,
				options: {
					plotOptions: { bar: { columnWidth: "50px" } },
				},
			},
			{
				breakpoint: 768,
				options: {
					plotOptions: { bar: { columnWidth: "40px" } },
				},
			},
			{
				breakpoint: 480,
				options: {
					plotOptions: { bar: { columnWidth: "38px" } },
				},
			},
		],
	};

	return (
		<div className="flex mb-2  items-center justify-around flex-wrap w-full flex-1 mt-7  font-[Helvetica,Arial,sans-serif]!">
			<div
				className={`p-2 max-h-80 max-w-180 h-full w-full  rounded-md ${theme === "dark" ? "border border-(--count-border)" : "border border-(--count-border) shadow-md"}`}>
				{<Chart options={options} key={theme} series={series} type="bar" height="100%" width={"100%"} />}
			</div>

			<div>
				<h3 className="text-[clamp(1.5rem,2vw,2rem)] mb-3 font-medium mt-10 flex flex-col gap-0 tracking-widest uppercase text-(--accent) text-center  font-[Roboto_Condensed]">
					Date-wise Reports Overview
				</h3>
				<p className="text-[clamp(0.90rem,2.5vw,1rem)] text-center uppercase  mt-1 my-4 font-[Roboto_Condensed] tracking-wide text-(--text-muted) italic">
					Generate detailed reports by selecting a <br /> custom date range
				</p>

				<div className="flex justify-center items-center mb-10 ">
					<button
						onClick={() => navigate("/form")}
						className="  bg-(--accent-bg,transparent)   hover:[background:var(--accent)] font-medium cursor-pointer hover:text-white hover:[box-shadow:0_0_10px_var(--accent)] [border:1px_solid_var(--accent)] text-(--accent) tracking-[0.08em] uppercase  text-[clamp(0.8rem,1.1vw,5rem)] p-[15px_30px] rounded-sm  ">
						Select Date Range
					</button>
				</div>
			</div>
		</div>
	);
};

export default WeeklyChart;
