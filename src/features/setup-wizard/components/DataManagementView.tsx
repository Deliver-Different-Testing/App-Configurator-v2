import React from 'react';
import { Download, Upload } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { getAllSchemas } from '../../import-export/schemas';
import { HealthCheckSection } from './HealthCheckSection';

export interface DataManagementViewProps {
  existingData: Record<string, Record<string, unknown>[]>;
  onUpload: (schemaId: string) => void;
  onDownloadData: (schemaId: string) => void;
  onDownloadTemplate: (schemaId: string) => void;
  onDone: () => void;
}

export function DataManagementView({
  existingData,
  onUpload,
  onDownloadData,
  onDownloadTemplate,
  onDone,
}: DataManagementViewProps): React.ReactElement {
  const schemas = getAllSchemas();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-text-primary mb-2">
          Upload, Download or Update
        </h2>
        <p className="text-sm text-text-secondary">
          Manage your data by downloading existing records, downloading templates for new imports, or uploading CSV files.
        </p>
      </div>

      {/* Content Area - Scrollable */}
      <div className="flex-1 overflow-auto">
        {/* Health Check Section - FIRST so it's visible immediately */}
        <HealthCheckSection
          existingData={existingData}
          onUpload={onUpload}
        />

        {/* Upload/Download Table */}
        <div className="border border-border rounded-lg overflow-hidden mt-6">
          <table className="w-full">
            <thead className="bg-surface-light border-b border-border">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                  Module
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary w-24">
                  Records
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-text-primary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {schemas.map((schema) => {
                const recordCount = existingData[schema.id]?.length || 0;
                const hasData = recordCount > 0;

                return (
                  <tr
                    key={schema.id}
                    className="border-b border-border last:border-b-0 hover:bg-surface-cream transition-colors"
                  >
                    {/* Module Name */}
                    <td className="py-4 px-4">
                      <div className="text-sm font-medium text-text-primary">
                        {schema.label || schema.id}
                      </div>
                      {schema.description && (
                        <div className="text-xs text-text-muted mt-0.5">
                          {schema.description}
                        </div>
                      )}
                    </td>

                    {/* Record Count */}
                    <td className="py-4 px-4">
                      <div className="text-sm text-text-secondary">
                        {recordCount}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-3">
                        {/* Download Data Button */}
                        <button
                          onClick={() => onDownloadData(schema.id)}
                          disabled={!hasData}
                          className={`
                            inline-flex items-center gap-1.5 text-sm transition-all
                            ${
                              hasData
                                ? 'text-brand-cyan hover:underline cursor-pointer'
                                : 'text-text-muted cursor-not-allowed opacity-50'
                            }
                          `}
                          title={hasData ? 'Download existing data as CSV' : 'No data available'}
                        >
                          <Download className="w-4 h-4" />
                          <span>Download Data</span>
                        </button>

                        {/* Download Template Button */}
                        <button
                          onClick={() => onDownloadTemplate(schema.id)}
                          className="inline-flex items-center gap-1.5 text-sm text-brand-cyan hover:underline cursor-pointer transition-all"
                          title="Download empty CSV template with headers"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download Template</span>
                        </button>

                        {/* Upload Button */}
                        <button
                          onClick={() => onUpload(schema.id)}
                          className="inline-flex items-center gap-1.5 text-sm text-brand-cyan hover:underline cursor-pointer transition-all"
                          title="Upload CSV file to import/update data"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Upload</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end pt-6 mt-6 border-t border-border">
        <Button variant="primary" onClick={onDone}>
          Done
        </Button>
      </div>
    </div>
  );
}
