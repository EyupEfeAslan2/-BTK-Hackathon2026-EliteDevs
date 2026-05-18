import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import App from '../App.jsx';
import React from 'react';

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('../components/Dashboard.jsx', () => ({
  default: function DashboardMock({ ticker, data }) {
    if (!data && !ticker) return null;
    return (
      <div data-testid="dashboard-mock">
        <span data-testid="dashboard-ticker">{ticker}</span>
        <span data-testid="dashboard-decision">{data?.committee_decision ?? ''}</span>
      </div>
    );
  },
}));

vi.mock('../components/TerminalLoading.jsx', async () => {
  const { useEffect, useRef } = await import('react');

  return {
    default: function TerminalLoadingMock({ onComplete, apiDone }) {
      const fired = useRef(false);
      useEffect(() => {
        if (!apiDone || !onComplete || fired.current) return;
        fired.current = true;
        onComplete();
      }, [apiDone, onComplete]);
      return null;
    },
  };
});

vi.mock('../components/test/RateLimitTest', () => ({
  default: () => null,
}));

function mockAnalyzeResponse() {
  return {
    committee_decision: 'APPROVED',
    default_risk_level: 'LOW',
    recommended_loan_terms: {
      max_amount: '$50M',
      tenor: '5 Years',
      covenants: ['Covenant A'],
    },
    justification_summary: 'Batch memo summary',
    raw_telemetry: {
      AAPL: { market_cap: 1 },
      MSFT: { market_cap: 2 },
    },
    agent_votes: [],
  };
}

describe('App batch analyze', () => {
  beforeEach(() => {
    vi.mocked(axios.get).mockResolvedValue({ data: [] });
    vi.mocked(axios.post).mockResolvedValue({ data: mockAnalyzeResponse() });
  });

  it('sends a single analyze POST with the full symbols array (not one request per ticker)', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    await user.click(screen.getByRole('checkbox', { name: /batch mode/i }));

    const input = screen.getByPlaceholderText(/AAPL, MSFT, F/i);
    await user.type(input, 'AAPL, MSFT');

    const form = input.closest('form');
    const submitBtn = form.querySelector('button[type="submit"]');
    expect(submitBtn).toBeTruthy();
    await user.click(submitBtn);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });

    const analyzeCalls = vi
      .mocked(axios.post)
      .mock.calls.filter(([url]) => String(url).includes('/api/v1/analyze'));

    expect(analyzeCalls).toHaveLength(1);
    const [url, body] = analyzeCalls[0];
    expect(String(url)).toContain('/api/v1/analyze');
    expect(body).toMatchObject({
      symbols: ['AAPL', 'MSFT'],
      period: '1mo',
    });
  });

  it('updates the batch table after a successful batch response', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    await user.click(screen.getByRole('checkbox', { name: /batch mode/i }));

    const input = screen.getByPlaceholderText(/AAPL, MSFT, F/i);
    await user.type(input, 'AAPL, MSFT');

    const submitBtn = input.closest('form').querySelector('button[type="submit"]');
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Batch Analysis Results')).toBeInTheDocument();
    });

    const table = screen.getByRole('table');
    const dataRows = within(table).getAllByRole('row').slice(1);
    expect(dataRows).toHaveLength(2);
    expect(within(dataRows[0]).getByText('AAPL')).toBeInTheDocument();
    expect(within(dataRows[1]).getByText('MSFT')).toBeInTheDocument();
  });

  it('navigates to the detail dashboard when a batch row is selected', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    await user.click(screen.getByRole('checkbox', { name: /batch mode/i }));

    const input = screen.getByPlaceholderText(/AAPL, MSFT, F/i);
    await user.type(input, 'AAPL, MSFT');

    const submitBtn = input.closest('form').querySelector('button[type="submit"]');
    await user.click(submitBtn);

    await waitFor(() => screen.getByText('Batch Analysis Results'));

    const table = screen.getByRole('table');
    const firstDataRow = within(table).getAllByRole('row')[1];
    await user.click(within(firstDataRow).getByText('AAPL'));

    await waitFor(() => {
      expect(screen.queryByText('Batch Analysis Results')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('dashboard-mock')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-ticker')).toHaveTextContent('AAPL');
    expect(screen.getByTestId('dashboard-decision')).toHaveTextContent('APPROVED');
  });
});
