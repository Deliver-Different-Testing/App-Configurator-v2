import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, AlertTriangle, Download, Upload } from 'lucide-react';
import { schemaRegistry } from '../../import-export/schemas';
import { generateCSV, downloadCSV } from '../../import-export/engine/CSVGenerator';

export interface HealthCheckSectionProps {
  existingData: Record<string, Record<string, unknown>[]>;
  onUpload: (schemaId: string) => void;
}

interface ModuleHealth {
  schemaId: string;
  label: string;
  totalRecords: number;
  issues: {
    field: string;
    fieldKey: string;
    refTable: string;
    count: number;
  }[];
  isHealthy: boolean;
}

export function HealthCheckSection({
  existingData,
  onUpload,
}: HealthCheckSectionProps): React.ReactElement {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Scan all modules for health status
  const moduleHealth = useMemo<ModuleHealth[]>(() => {
    const health: ModuleHealth[] = [];

    Object.entries(schemaRegistry).forEach(([schemaId, schema]) => {
      const data = existingData[schemaId] || [];
      const issues: ModuleHealth['issues'] = [];

      // Check each reference field for missing values
      schema.columns.forEach(column => {
        if (column.type === 'reference' && column.refTable) {
          const missingCount = data.filter(row => {
            const value = row[column.key];
            return !value || value === '' || value === null;
          }).length;

          if (missingCount > 0) {
            issues.push({
              field: column.header,
              fieldKey: column.key,
              refTable: column.refTable,
              count: missingCount,
            });
          }
        }
      });

      health.push({
        schemaId,
        label: schema.label,
        totalRecords: data.length,
        issues,
        isHealthy: issues.length === 0,
      });
    });

    // Sort: unhealthy first, then by label
    return health.sort((a, b) => {
      if (a.isHealthy !== b.isHealthy) {
        return a.isHealthy ? 1 : -1;
      }
      return a.label.localeCompare(b.label);
    });
  }, [existingData]);

  // Calculate summary
  const summary = useMemo(() => {
    const healthy = moduleHealth.filter(m => m.isHealthy).length;
    const unhealthy = moduleHealth.filter(m => !m.isHealthy).length;
    const totalIssues = moduleHealth.reduce((sum, m) => sum + m.issues.length, 0);
    return { healthy, unhealthy, totalIssues };
  }, [moduleHealth]);

  // Download affected records only (those with missing reference)
  const handleDownloadAffected = (schemaId: string, fieldKey: string) => {
    const schema = schemaRegistry[schemaId];
    const data = existingData[schemaId] || [];

    // Filter to only records missing this field
    const affectedRecords = data.filter(row => {
      const value = row[fieldKey];
      return !value || value === '' || value === null;
    });

    if (schema && affectedRecords.length > 0) {
      const csv = generateCSV(affectedRecords, schema);
      downloadCSV(csv, `${schemaId}-missing-${fieldKey}.csv`);
    }
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Header - Collapsible */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between px-4 py-3 bg-surface-light hover:bg-surface-cream transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-text-primary">Health Check</span>
          {summary.totalIssues > 0 ? (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-700">
              {summary.totalIssues} {summary.totalIssues === 1 ? 'issue' : 'issues'}
            </span>
          ) : (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
              All healthy
            </span>
          )}
        </div>
        {isCollapsed ? (
          <ChevronDown className="w-5 h-5 text-text-secondary" />
        ) : (
          <ChevronUp className="w-5 h-5 text-text-secondary" />
        )}
      </button>

      {/* Content */}
      {!isCollapsed && (
        <div className="p-4 space-y-3">
          {moduleHealth.map((module) => (
            <div
              key={module.schemaId}
              className={`rounded-lg border ${
                module.isHealthy
                  ? 'border-green-200 bg-green-50'
                  : 'border-orange-200 bg-orange-50'
              }`}
            >
              {/* Module Header */}
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  {module.isHealthy ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                  )}
                  <div>
                    <span className="font-medium text-text-primary">{module.label}</span>
                    {module.totalRecords > 0 && (
                      <span className="ml-2 text-sm text-text-secondary">
                        {module.isHealthy
                          ? `${module.totalRecords} records`
                          : `${module.issues.reduce((sum, i) => sum + i.count, 0)} of ${module.totalRecords}`}
                      </span>
                    )}
                    {module.totalRecords === 0 && (
                      <span className="ml-2 text-sm text-text-muted">No records</span>
                    )}
                  </div>
                </div>
                {module.isHealthy && (
                  <span className="text-sm text-green-600 font-medium">Complete</span>
                )}
              </div>

              {/* Issues List */}
              {!module.isHealthy && module.issues.length > 0 && (
                <div className="border-t border-orange-200">
                  {module.issues.map((issue, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-4 py-2 hover:bg-orange-100/50"
                    >
                      <div className="flex items-center gap-2 pl-8">
                        <span className="text-sm text-text-secondary">
                          Missing {issue.field}
                        </span>
                        <span className="text-xs text-text-muted">
                          ({issue.count} {issue.count === 1 ? 'record' : 'records'})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDownloadAffected(module.schemaId, issue.fieldKey)}
                          className="inline-flex items-center gap-1 text-sm text-brand-cyan hover:underline"
                          title="Download only records with this issue"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </button>
                        <button
                          onClick={() => onUpload(module.schemaId)}
                          className="inline-flex items-center gap-1 text-sm text-brand-cyan hover:underline"
                          title="Upload fixed CSV"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Upload</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Summary Footer */}
          {moduleHealth.length > 0 && (
            <div className="pt-3 border-t border-border text-center text-sm text-text-secondary">
              {summary.healthy} of {moduleHealth.length} modules fully configured
            </div>
          )}
        </div>
      )}
    </div>
  );
}
