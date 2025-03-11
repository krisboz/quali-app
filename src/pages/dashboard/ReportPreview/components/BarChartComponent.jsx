import { BarChart, YAxis, XAxis, Bar, Tooltip } from "recharts"

const BarChartComponent = ({data}) => {

    /**
     * width
     * height
     * fill
     */

    const barChartToRender =   <BarChart
                                    width={900}
                                   height={400}
                                    data={data}
                                    layout="vertical"
                                    margin={{ left: 120, right: 20 }}
                                >
                                    <YAxis type="category" dataKey="name" />
                                    <XAxis type="number" />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#6699CC" />
                                </BarChart>


    return (
        <div>
            {barChartToRender} </div>
    )
}

export default BarChartComponent