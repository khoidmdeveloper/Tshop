"use client";
function SalesChart() {
  return <div className="bg-secondary border border-border rounded-lg p-6">
      <h3 className="text-lg font-bold text-foreground mb-6">Monthly Sales</h3>

      <div className="space-y-4">
        {[
    { month: "Jan", value: 85, percentage: 85 },
    { month: "Feb", value: 92, percentage: 92 },
    { month: "Mar", value: 78, percentage: 78 },
    { month: "Apr", value: 95, percentage: 95 },
    { month: "May", value: 88, percentage: 88 },
    { month: "Jun", value: 102, percentage: 100 }
  ].map((data) => <div key={data.month}>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-bold text-foreground">{data.month}</span>
              <span className="text-sm text-muted-foreground">${data.value}k</span>
            </div>
            <div className="h-2 bg-background rounded-full overflow-hidden">
              <div
    className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
    style={{ width: `${data.percentage}%` }}
  />
            </div>
          </div>)}
      </div>
    </div>;
}
export {
  SalesChart
};

