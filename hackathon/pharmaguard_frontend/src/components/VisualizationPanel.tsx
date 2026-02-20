import React from "react";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from "recharts";
import { AnalysisResponse } from "../types";

interface VisualizationPanelProps {
  result: AnalysisResponse;
}

const severityScale = ["none", "low", "moderate", "high", "critical"] as const;

export const VisualizationPanel: React.FC<VisualizationPanelProps> = ({ result }) => {
  const confidenceValue = Math.round(result.risk_assessment.confidence_score * 100);
  const severityIndex = severityScale.indexOf(result.risk_assessment.severity);

  const gaugeData = [
    {
      name: "Confidence",
      value: confidenceValue,
      fill: "#0FB9B1"
    }
  ];

  const severityData = [
    {
      name: "Severity",
      level: severityIndex + 1
    }
  ];

  const variantCount = result.quality_metrics.variants_detected_count || 0;
  const variantData = [
    { name: "Detected variants", value: variantCount || 1 },
    { name: "Baseline", value: 1 }
  ];

  const metabolizerLabel = result.pharmacogenomic_profile.phenotype || "Unknown";

  return (
    <div className="card card-hover p-5 sm:p-6 lg:p-7 flex flex-col gap-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm sm:text-base font-semibold text-slate-50">
          Quantitative Visualization
        </h3>
        <span className="badge bg-slate-900 border-slate-700 text-[11px] text-slate-300">
          Clinical view
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Confidence Gauge */}
        <div className="flex flex-col items-center gap-3">
          <p className="text-xs text-slate-400">Confidence Score</p>
          <div className="w-full h-44">
            <ResponsiveContainer>
              <RadialBarChart
                innerRadius="60%"
                outerRadius="100%"
                data={gaugeData}
                startAngle={180}
                endAngle={0}
              >
                <RadialBar
                  minAngle={15}
                  background
                  clockWise
                  dataKey="value"
                  cornerRadius={5}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-lg font-semibold text-slate-50">
            {confidenceValue}%
          </p>
        </div>

        {/* Severity Bar */}
        <div className="flex flex-col items-center gap-3">
          <p className="text-xs text-slate-400">Risk Severity Level</p>
          <div className="w-full h-44">
            <ResponsiveContainer>
              <BarChart data={severityData}>
                <XAxis dataKey="name" hide />
                <YAxis domain={[0, severityScale.length]} hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    border: "1px solid #1e293b",
                    borderRadius: 12,
                    fontSize: 12
                  }}
                  cursor={{ fill: "rgba(15, 185, 177, 0.05)" }}
                />
                <Bar
                  dataKey="level"
                  radius={[12, 12, 0, 0]}
                  fill={
                    severityIndex >= 3
                      ? "#DC2626"
                      : severityIndex === 2
                      ? "#EAB308"
                      : "#16A34A"
                  }
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-300">
            Severity:{" "}
            <span className="font-semibold capitalize">
              {result.risk_assessment.severity}
            </span>
          </p>
        </div>

        {/* Variant Pie */}
        <div className="flex flex-col items-center gap-3">
          <p className="text-xs text-slate-400">Variant Burden</p>
          <div className="w-full h-44">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={variantData}
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {variantData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 0 ? "#3A86FF" : "#1e293b"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    border: "1px solid #1e293b",
                    borderRadius: 12,
                    fontSize: 12
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-300">
            Detected variants:{" "}
            <span className="font-semibold">{variantCount}</span>
          </p>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2 justify-between border-t border-slate-800 pt-3">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <span className="badge bg-slate-900 border-slate-700">
            Metabolizer:{" "}
            <span className="ml-1 font-semibold">{metabolizerLabel}</span>
          </span>
          <span className="text-slate-500">
            Interpreted according to gene-specific phenotype classifications.
          </span>
        </div>
      </div>
    </div>
  );
};

