import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BatchResultsTable from '../components/BatchResultsTable';
import React from 'react';

vi.mock('../utils/creditMemoExport', () => ({
  exportBatchAnalysisPdf: vi.fn(() => Promise.resolve()),
  exportBatchAnalysisExcel: vi.fn(),
  sanitizeReportCopy: (s) => s ?? '',
}));

const sampleResults = [
  {
    ticker: 'AAPL',
    data: {
      committee_decision: 'APPROVED',
      default_risk_level: 'LOW',
      recommended_loan_terms: { max_amount: '$50M', tenor: '5 Years' },
      justification_summary: 'Strong cash flow.',
    },
  },
  {
    ticker: 'MSFT',
    data: {
      committee_decision: 'CONDITIONAL',
      default_risk_level: 'MEDIUM',
      recommended_loan_terms: { max_amount: '$30M', tenor: '3 Years' },
      justification_summary: 'Watch leverage.',
    },
  },
];

describe('BatchResultsTable', () => {
  it('renders each result row with committee and risk data', () => {
    render(<BatchResultsTable results={sampleResults} />);

    expect(screen.getByText('Batch Analysis Results')).toBeInTheDocument();
    expect(screen.getByText('2 credit memos evaluated')).toBeInTheDocument();

    expect(screen.getAllByText('AAPL').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('MSFT').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('APPROVED').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('CONDITIONAL').length).toBeGreaterThanOrEqual(1);
  });

  it('calls onSelectResult with the row item when a body row is clicked', async () => {
    const user = userEvent.setup();
    const onSelectResult = vi.fn();

    render(<BatchResultsTable results={sampleResults} onSelectResult={onSelectResult} />);

    const grid = screen.getByRole('table');
    const bodyRows = within(grid).getAllByRole('row').slice(1);
    expect(bodyRows).toHaveLength(2);

    await user.click(within(bodyRows[0]).getByText('AAPL'));
    expect(onSelectResult).toHaveBeenCalledTimes(1);
    expect(onSelectResult).toHaveBeenCalledWith(sampleResults[0]);
  });

  it('adds cursor-pointer to body rows when onSelectResult is provided', () => {
    render(<BatchResultsTable results={sampleResults} onSelectResult={() => {}} />);

    const grid = screen.getByRole('table');
    const bodyRows = within(grid).getAllByRole('row').slice(1);

    bodyRows.forEach((row) => {
      expect(row).toHaveClass('cursor-pointer');
    });
  });

  it('does not add cursor-pointer to body rows when onSelectResult is absent', () => {
    render(<BatchResultsTable results={sampleResults} />);

    const grid = screen.getByRole('table');
    const bodyRows = within(grid).getAllByRole('row').slice(1);

    bodyRows.forEach((row) => {
      expect(row).not.toHaveClass('cursor-pointer');
    });
  });
});
