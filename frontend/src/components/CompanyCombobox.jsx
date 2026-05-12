import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiChevronDown } from 'react-icons/fi';

export const TOP_50_COMPANIES = [
  { name: 'Apple Inc.', ticker: 'AAPL' },
  { name: 'Microsoft Corp.', ticker: 'MSFT' },
  { name: 'Amazon.com Inc.', ticker: 'AMZN' },
  { name: 'NVIDIA Corp.', ticker: 'NVDA' },
  { name: 'Alphabet Inc. Class A', ticker: 'GOOGL' },
  { name: 'Meta Platforms Inc.', ticker: 'META' },
  { name: 'Alphabet Inc. Class C', ticker: 'GOOG' },
  { name: 'Tesla Inc.', ticker: 'TSLA' },
  { name: 'Ford Motor Co.', ticker: 'F' },
  { name: 'Berkshire Hathaway Inc.', ticker: 'BRK.B' },
  { name: 'UnitedHealth Group Inc.', ticker: 'UNH' },
  { name: 'Eli Lilly & Co.', ticker: 'LLY' },
  { name: 'JPMorgan Chase & Co.', ticker: 'JPM' },
  { name: 'Johnson & Johnson', ticker: 'JNJ' },
  { name: 'Visa Inc.', ticker: 'V' },
  { name: 'Procter & Gamble Co.', ticker: 'PG' },
  { name: 'Mastercard Inc.', ticker: 'MA' },
  { name: 'Broadcom Inc.', ticker: 'AVGO' },
  { name: 'Home Depot Inc.', ticker: 'HD' },
  { name: 'Chevron Corp.', ticker: 'CVX' },
  { name: 'AbbVie Inc.', ticker: 'ABBV' },
  { name: 'Merck & Co. Inc.', ticker: 'MRK' },
  { name: 'Costco Wholesale Corp.', ticker: 'COST' },
  { name: 'PepsiCo Inc.', ticker: 'PEP' },
  { name: 'Adobe Inc.', ticker: 'ADBE' },
  { name: 'Walmart Inc.', ticker: 'WMT' },
  { name: 'Coca-Cola Co.', ticker: 'KO' },
  { name: 'Cisco Systems Inc.', ticker: 'CSCO' },
  { name: 'Bank of America Corp.', ticker: 'BAC' },
  { name: 'Thermo Fisher Scientific Inc.', ticker: 'TMO' },
  { name: 'McDonald\'s Corp.', ticker: 'MCD' },
  { name: 'Salesforce Inc.', ticker: 'CRM' },
  { name: 'Abbott Laboratories', ticker: 'ABT' },
  { name: 'Comcast Corp.', ticker: 'CMCSA' },
  { name: 'Oracle Corp.', ticker: 'ORCL' },
  { name: 'Advanced Micro Devices Inc.', ticker: 'AMD' },
  { name: 'Intel Corp.', ticker: 'INTC' },
  { name: 'Walt Disney Co.', ticker: 'DIS' },
  { name: 'Wells Fargo & Co.', ticker: 'WFC' },
  { name: 'Danaher Corp.', ticker: 'DHR' },
  { name: 'Verizon Communications Inc.', ticker: 'VZ' },
  { name: 'NextEra Energy Inc.', ticker: 'NEE' },
  { name: 'Pfizer Inc.', ticker: 'PFE' },
  { name: 'Intuit Inc.', ticker: 'INTU' },
  { name: 'IBM Corp.', ticker: 'IBM' },
  { name: 'Qualcomm Inc.', ticker: 'QCOM' },
  { name: 'Philip Morris International', ticker: 'PM' },
  { name: 'S&P Global Inc.', ticker: 'SPGI' },
  { name: 'Caterpillar Inc.', ticker: 'CAT' },
  { name: 'Union Pacific Corp.', ticker: 'UNP' },
  { name: 'Lowe\'s Companies Inc.', ticker: 'LOW' },
];

export default function CompanyCombobox({ onSymbolChange, disabled }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTicker, setSelectedTicker] = useState('');
  const wrapperRef = useRef(null);

  const normalizeCompanyName = (value) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

  // Inform parent of current query/ticker
  useEffect(() => {
    const selectedCompany = TOP_50_COMPANIES.find(c => c.ticker === selectedTicker);
    if (selectedCompany && normalizeCompanyName(selectedCompany.name) === normalizeCompanyName(query)) {
      onSymbolChange(selectedTicker);
      return;
    }

    const matched = TOP_50_COMPANIES.find(c => normalizeCompanyName(c.name) === normalizeCompanyName(query));
    if (matched) {
      onSymbolChange(matched.ticker);
    } else {
      // If it doesn't match exactly, we assume user is typing a custom ticker directly
      onSymbolChange(query);
    }
  }, [query, selectedTicker, onSymbolChange]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const filteredCompanies = query === '' 
    ? TOP_50_COMPANIES 
    : TOP_50_COMPANIES.filter((company) => {
        return company.name.toLowerCase().includes(query.toLowerCase()) || 
               company.ticker.toLowerCase().includes(query.toLowerCase());
      });

  const handleSelect = (company) => {
    setSelectedTicker(company.ticker);
    setQuery(company.name); // show name in input visually
    setIsOpen(false);
    onSymbolChange(company.ticker); // pass ticker to parent
  };

  return (
    <div className="relative w-full md:w-auto" ref={wrapperRef}>
      <div className="relative group flex items-center">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
          <FiSearch className="text-emerald-500/50 group-focus-within:text-emerald-400 transition-colors" />
        </div>
        <input
          type="text"
          className="block w-full md:w-[28rem] pl-10 pr-24 py-2.5 bg-[#0b0f19] border border-emerald-500/30 rounded-lg text-emerald-50 font-mono focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:text-slate-600 focus:outline-none focus:cyber-glow"
          placeholder="SEARCH COMPANY OR ENTER CORPORATE TICKER"
          value={query}
          onChange={(e) => {
            setSelectedTicker('');
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onClick={() => setIsOpen(true)}
          disabled={disabled}
          autoComplete="off"
        />
        <div className="absolute inset-y-0 right-24 flex items-center pr-2 pointer-events-none z-10">
          <FiChevronDown className="text-emerald-500/50" />
        </div>
        <button
          type="submit"
          disabled={disabled || !query.trim()}
          className="absolute inset-y-1 right-1 px-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-md text-xs font-mono font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
        >
          ANALYZE
        </button>
      </div>

      {isOpen && (
        <ul className="absolute z-50 mt-2 w-full max-h-72 overflow-auto bg-[#0b0f19]/95 backdrop-blur-md border border-emerald-500/30 rounded-lg shadow-xl shadow-emerald-900/20 py-1 font-mono text-sm scrollbar-thin scrollbar-thumb-emerald-500/30 scrollbar-track-transparent">
          {filteredCompanies.length === 0 ? (
            <li className="px-4 py-3 text-slate-500 flex items-center justify-between">
              <span>Use custom ticker:</span>
              <span className="text-emerald-500/80 font-bold">{query.toUpperCase()}</span>
            </li>
          ) : (
            filteredCompanies.map((company) => (
              <li
                key={company.ticker}
                className="px-4 py-3 hover:bg-emerald-500/15 cursor-pointer flex justify-between items-center text-emerald-50/80 hover:text-emerald-50 transition-colors border-b border-emerald-500/10 last:border-0"
                onClick={() => handleSelect(company)}
              >
                <span>{company.name}</span>
                <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{company.ticker}</span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
