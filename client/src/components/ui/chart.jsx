"use client"
import * as React from "react"
import {
  Area,
  Bar,
  Line,
  Pie,
  AreaChart as AreaChartPrimitive,
  BarChart as BarChartPrimitive,
  LineChart as LineChartPrimitive,
  PieChart as PieChartPrimitive,
  ResponsiveContainer,
} from "recharts"

import { cn } from "@/lib/utils"

const ChartContainer = ({
  className,
  children,
  ...props
}) => (
  <div
    className={cn(
      "relative flex h-full min-h-[200px] w-full items-center justify-center",
      className
    )}
    {...props}
  >
    <ResponsiveContainer>
      {children}
    </ResponsiveContainer>
  </div>
)

const AreaChart = AreaChartPrimitive
const BarChart = BarChartPrimitive
const LineChart = LineChartPrimitive
const PieChart = PieChartPrimitive

export {
  ChartContainer,
  AreaChart,
  BarChart,
  LineChart,
  PieChart,
  Area,
  Bar,
  Line,
  Pie,
}

