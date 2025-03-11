import { PieChart, Pie, Cell, Tooltip } from "recharts"

const PieChartComponent = ({data}) => {
    /**
     * width
     * height
     * fill
     */
    const COLORS = ["#6699CC", "#CD5C5C"];

    const pieChartToRender =      <PieChart width={200} height={200}>
    <Pie 
        data={data} 
        cx="50%" 
        cy="50%" 
        innerRadius={50} 
        outerRadius={80} 
        fill="#8884d8" 
        paddingAngle={5} 
        dataKey="value"
    >
        {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index]} />
        ))}
    </Pie>
    <Tooltip />
</PieChart>

    return(
        <div>
            {pieChartToRender}
        </div>
    )
}

export default PieChartComponent