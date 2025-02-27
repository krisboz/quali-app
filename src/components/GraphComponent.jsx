import { BarChart } from "@mui/x-charts"

const GraphComponent = ({results}) => {
    console.log(results)

    return(<div>Graphs

<div>
  <p>Adoma - February</p>
<BarChart
  xAxis={[{ scaleType: 'band', data: [`Geliefert`, "Defektiv"] }]}
  series={[{ data: [results.auswertungen.length, results.qualityReports.length] }]}
  width={500}
  height={300}
/>
</div>

    </div>)
}

export default GraphComponent