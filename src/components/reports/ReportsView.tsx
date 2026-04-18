import React, { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Users,
  BarChart3,
  Plus,
  ClipboardList,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ReportCreator } from "./ReportCreator";

interface ReportData {
  id: string;
  title: string;
  type: "progress" | "assessment" | "compliance" | "performance";
  generatedAt: string;
  period: string;
  status: "ready" | "generating" | "scheduled";
  size: string;
}

const initialReports: ReportData[] = [
  {
    id: "1",
    title: "Monthly Progress Summary - February 2024",
    type: "progress",
    generatedAt: "2024-02-15T10:00:00Z",
    period: "February 2024",
    status: "ready",
    size: "2.4 MB",
  },
  {
    id: "2",
    title: "Therapist Performance Analysis - Q1 2024",
    type: "performance",
    generatedAt: "2024-02-14T15:30:00Z",
    period: "Q1 2024",
    status: "ready",
    size: "1.8 MB",
  },
];

export const ReportsView: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<ReportData[]>(initialReports);
  const [showReportCreator, setShowReportCreator] = useState(false);
  const [patientReports, setPatientReports] = useState<ReportData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filter reports based on user role
  useEffect(() => {
    if (user?.role === 'therapist') {
      // For therapists, we would typically filter to show only their patients' reports
      // In a real app, you would fetch this from your API
      setPatientReports(reports.filter(r => r.type === 'progress'));
    } else {
      setPatientReports(reports);
    }
  }, [reports, user]);

  // Auto-finish generating reports
  useEffect(() => {
    const timer = setInterval(() => {
      setReports((prev) =>
        prev.map((r) =>
          r.status === "generating"
            ? {
                ...r,
                status: "ready",
                size: "1.2 MB",
                generatedAt: new Date().toISOString(),
              }
            : r
        )
      );
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  // Handle report creation
  const handleReportCreated = (newReport: ReportData) => {
    setReports((prev) => [newReport, ...prev]);
  };

  // Generate quick report
  const handleGenerateQuickReport = () => {
    const newReport: ReportData = {
      id: Date.now().toString(),
      title: `New Report - ${new Date().toLocaleDateString()}`,
      type: "progress",
      generatedAt: new Date().toISOString(),
      period: "Current Period",
      status: "generating",
      size: "Calculating...",
    };

    setReports((prev) => [newReport, ...prev]);
  };

  const getReportIcon = (type: string) => {
    switch (type) {
      case "progress":
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case "assessment":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "compliance":
        return <Users className="h-5 w-5 text-purple-500" />;
      case "performance":
        return <BarChart3 className="h-5 w-5 text-orange-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      ready: "bg-green-100 text-green-800 border-green-200",
      generating: "bg-yellow-100 text-yellow-800 border-yellow-200",
      scheduled: "bg-blue-100 text-blue-800 border-blue-200",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Download handler
  const handleDownload = (report: ReportData) => {
    const blob = new Blob(
      [
        `Report Title: ${report.title}\nType: ${report.type}\nPeriod: ${report.period}\nGenerated: ${new Date(
          report.generatedAt
        ).toLocaleString()}`,
      ],
      { type: "text/plain" }
    );
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${report.title}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Reports & Analytics
          </h1>
          <p className="text-gray-600">
            Generate and manage comprehensive therapy reports
          </p>
        </div>
        <div className="flex gap-2">
          {user?.role === 'therapist' && (
            <button
              onClick={() => setShowReportCreator(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
            >
              <ClipboardList className="h-5 w-5 mr-2" />
              Create Patient Report
            </button>
          )}
          <button
            onClick={handleGenerateQuickReport}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Quick Report
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Generated Reports
          </h3>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading reports...</span>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {(user?.role === 'therapist' ? patientReports : reports).map((report) => (
              <div
                key={report.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getReportIcon(report.type)}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">
                        {report.title}
                      </h4>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                        <span>
                          Generated:{" "}
                          {new Date(report.generatedAt).toLocaleDateString()}
                        </span>
                        <span>Period: {report.period}</span>
                        <span>Size: {report.size}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {getStatusBadge(report.status)}
                    {report.status === "ready" && (
                      <button
                        onClick={() => handleDownload(report)}
                        className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {(user?.role === 'therapist' ? patientReports : reports).length === 0 && (
              <div className="py-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">No reports found</h3>
                <p className="mt-1 text-gray-500">
                  {user?.role === 'therapist' 
                    ? "Create a new report for your patients to get started." 
                    : "No reports available at this time."}
                </p>
                {user?.role === 'therapist' && (
                  <button
                    onClick={() => setShowReportCreator(true)}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <ClipboardList className="h-5 w-5 mr-2" />
                    Create First Report
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Report Creator Modal */}
      <ReportCreator
        isOpen={showReportCreator}
        onClose={() => setShowReportCreator(false)}
        onReportCreated={handleReportCreated}
      />
    </div>
  );
};
