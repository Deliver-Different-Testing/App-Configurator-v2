import React, { useMemo } from 'react';
import { AlertTriangle, CheckCircle, Download } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { schemaRegistry, getSchema, generateTemplate, downloadCSV } from '../../import-export';
import type { MissingLink } from '../types';

interface MissingLinksScannerProps {
  existingData: Record<string, Record<string, unknown>[]>;
}

export function MissingLinksScanner({ existingData }: MissingLinksScannerProps): React.ReactElement {
  // Scan for missing references
  const missingLinks = useMemo<MissingLink[]>(() => {
    const links: MissingLink[] = [];

    // Scan each schema for reference fields
    Object.entries(schemaRegistry).forEach(([schemaId, schema]) => {
      const data = existingData[schemaId] || [];

      schema.columns.forEach(column => {
        if (column.type === 'reference' && column.refTable) {
          // Count records missing this reference
          const missingCount = data.filter(row => {
            const value = row[column.key];
            return !value || value === '' || value === null;
          }).length;

          if (missingCount > 0) {
            links.push({
              tableName: schema.label,
              field: column.header,
              count: missingCount,
              description: `${missingCount} ${schema.label.toLowerCase()} missing ${column.header}`,
            });
          }
        }
      });
    });

    return links;
  }, [existingData]);

  const handleDownloadTemplate = (schemaId: string) => {
    const schema = getSchema(schemaId);
    if (schema) {
      const csv = generateTemplate(schema, { includeHintRow: true });
      downloadCSV(csv, `${schemaId}-template.csv`);
    }
  };

  if (missingLinks.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          All Good!
        </h3>
        <p className="text-text-secondary">
          No missing links found. Your data is well connected.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-text-secondary text-sm mb-4">
        The following data has missing references that you may want to fix:
      </p>

      {missingLinks.map((link, index) => (
        <div
          key={index}
          className="p-4 rounded-lg border border-orange-200 bg-orange-50"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-text-primary">
                {link.tableName}
              </h4>
              <p className="text-sm text-text-secondary">
                {link.description}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDownloadTemplate(link.tableName.toLowerCase().replace(/\s+/g, ''))}
            >
              <Download className="w-4 h-4 mr-1" />
              Template
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
