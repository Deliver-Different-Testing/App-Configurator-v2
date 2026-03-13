import type { ReactNode } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  variant?: 'right-slide' | 'center';
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  variant = 'center',
  children,
  footer,
  size = 'md',
}: ModalProps) => {
  if (!isOpen) return null;

  // Responsive sizes - uses percentage-based widths for larger sizes
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
    full: 'max-w-[90vw] lg:max-w-[75vw]', // 90% on mobile, 75% on larger screens
  };

  const overlayClasses = 'fixed inset-0 bg-black/30 z-50';

  // Right-slide widths - responsive
  const slideWidthClasses = {
    sm: 'w-full sm:w-[400px]',
    md: 'w-full sm:w-[480px]',
    lg: 'w-full sm:w-[600px] lg:w-[700px]',
    xl: 'w-full sm:w-[700px] lg:w-[800px] xl:w-[900px]',
    '2xl': 'w-full sm:w-[800px] lg:w-[900px] xl:w-[1000px]',
    full: 'w-full sm:w-[90vw] lg:w-[75vw] xl:w-[60vw]',
  };

  if (variant === 'right-slide') {
    return (
      <>
        <div className={overlayClasses} onClick={onClose} />
        <div
          className={`fixed right-0 top-0 h-full ${slideWidthClasses[size]} bg-white z-50 transform transition-transform duration-300 ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            <div className="sticky top-0 border-b p-6 flex justify-between items-start bg-white">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
                {subtitle && <p className="text-sm text-text-muted mt-1">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className="text-text-muted hover:text-text-primary transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">{children}</div>

            {footer && (
              <div className="sticky bottom-0 border-t p-4 flex justify-between bg-white">
                {footer}
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className={overlayClasses} onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={`bg-white rounded-lg ${sizeClasses[size]} w-full max-h-[90vh] flex flex-col transition-opacity duration-200 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="sticky top-0 border-b p-6 flex justify-between items-start bg-white rounded-t-lg flex-shrink-0">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
              {subtitle && <p className="text-sm text-text-muted mt-1">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-primary transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1 modal-scroll-content">{children}</div>

          {footer && (
            <div className="sticky bottom-0 border-t p-4 flex justify-end gap-2 bg-white rounded-b-lg flex-shrink-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
