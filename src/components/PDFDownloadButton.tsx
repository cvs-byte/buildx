import React from 'react';
import { ResultPDFButton, type ResultPDFButtonProps } from './pdf/ResultPDFButton';

/**
 * Modular PDFDownloadButton component
 * Standard export for Student results PDF downloads.
 */
export const PDFDownloadButton: React.FC<ResultPDFButtonProps> = (props) => {
  return <ResultPDFButton {...props} />;
};

export default PDFDownloadButton;
