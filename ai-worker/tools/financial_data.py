import logging
import numpy as np
import pandas as pd
import yfinance as yf
import requests
from typing import Dict, List, Any
from core.config import settings

import time

# Note: We rely on yfinance's native curl_cffi session for TLS bypass.
# We no longer override the global session here.

def fetch_financial_data(ticker):
    if not ticker.endswith('.IS') and is_bist_stock(ticker): 
        ticker += '.IS'
        
    stock = yf.Ticker(ticker)
    hist = stock.history(period="1mo")
    
    if hist.empty:
        raise ValueError(f"404_ERROR: '{ticker}' adında bir şirket bulunamadı veya finansal verisi halka açık değil. Lütfen geçerli bir Kurumsal Kimlik (Ticker) giriniz.")
logger = logging.getLogger(__name__)

class FinancialDataTool:    
    def __init__(self):
        self.finnhub_key = settings.finnhub_api_key
    
    def convert_dataframe_to_dict(self, df: pd.DataFrame) -> Dict[str, Any]:
        if df.empty:
            return {}
        
        df_copy = df.copy()
        if isinstance(df_copy.index, pd.DatetimeIndex):
            df_copy.index = df_copy.index.strftime('%Y-%m-%d')
        
        result = df_copy.to_dict()
        
        def convert_value(obj):
            if obj is None or pd.isna(obj):
                return None
            if isinstance(obj, float) and (np.isinf(obj) or np.isnan(obj)):
                return None
            elif isinstance(obj, (pd.Timestamp, pd.Timedelta)):
                return str(obj)
            elif isinstance(obj, (np.integer, np.floating)):
                val = obj.item()
                if isinstance(val, float) and (np.isinf(val) or np.isnan(val)):
                    return None
                return val
            elif hasattr(obj, 'item') and callable(getattr(obj, 'item')):
                try:
                    return obj.item()
                except (ValueError, TypeError):
                    return str(obj)
            elif isinstance(obj, dict):
                new_dict = {}
                for k, v in obj.items():
                    if isinstance(k, (pd.Timestamp, pd.Timedelta)):
                        new_key = str(k)
                    elif hasattr(k, 'item') and callable(getattr(k, 'item')):
                        try:
                            new_key = k.item()
                        except (ValueError, TypeError):
                            new_key = str(k)
                    else:
                        new_key = k
                    new_dict[new_key] = convert_value(v)
                return new_dict
            elif isinstance(obj, (list, tuple)):
                return [convert_value(v) for v in obj]
            elif isinstance(obj, (np.ndarray,)):
                return obj.tolist()
            else:
                return obj
        
        return convert_value(result)
    
    def get_stock_data(self, 
                      symbol: str, 
                      period: str = "1y") -> Dict[str, Any]:
        max_retries = 3
        for attempt in range(max_retries):
            try:
                stock = yf.Ticker(symbol)
                hist = stock.history(period=period)
                
                # Verify we actually got data to catch silent rate limits
                if hist.empty and attempt < max_retries - 1:
                    raise ValueError(f"Empty history for {symbol}")
                    
                current_price = hist['Close'].iloc[-1] if not hist.empty else None
                price_change = hist['Close'].iloc[-1] - hist['Close'].iloc[-2] if len(hist) > 1 else 0
                price_change_pct = (price_change / hist['Close'].iloc[-2] * 100) if len(hist) > 1 else 0
                
                print("USING SIMPLIFIED DATA PIPELINE v2")
                # Removed all protected yfinance attributes (info, financials, balance_sheet, cashflow)
                
                # Lightweight derived metrics from history if possible
                derived_metrics = {}
                if not hist.empty and len(hist) > 10:
                    closes = hist['Close']
                    volumes = hist['Volume']
                    derived_metrics['moving_average_10d'] = float(closes.tail(10).mean())
                    derived_metrics['moving_average_20d'] = float(closes.tail(20).mean()) if len(closes) >= 20 else float(closes.mean())
                    derived_metrics['volatility_10d'] = float(closes.tail(10).pct_change().std() * (252**0.5) * 100)
                    derived_metrics['average_volume_10d'] = float(volumes.tail(10).mean())

                return {
                    "symbol": symbol,
                    "data_quality": "PARTIAL",
                    "missing_modules": ["info", "financials", "balance_sheet", "cashflow"],
                    "derived_metrics": derived_metrics,
                    "current_price": float(current_price) if current_price is not None else None,
                    "price_change": float(price_change) if price_change is not None else 0,
                    "price_change_percent": float(price_change_pct) if price_change_pct is not None else 0,
                    "historical_data": self.convert_dataframe_to_dict(hist),
                    "company_info": {},
                    "financials": {},
                    "balance_sheet": {},
                    "cashflow": {},
                    "volume": float(hist['Volume'].iloc[-1]) if not hist.empty else None,
                    "market_cap": None,
                    "pe_ratio": None,
                    "dividend_yield": None,
                    "52_week_high": None,
                    "52_week_low": None
                }
            
            except Exception as e:
                logger.error(f"Error fetching data for {symbol}: {str(e)}")
                if attempt == max_retries - 1:
                    return {
                        "error": True,
                        "message": f"Failed to fetch data for {symbol}: {str(e)}",
                        "data": {}
                    }
                time.sleep(2 ** attempt)
    
    def get_market_overview(self) -> Dict[str, Any]:
        indices = {
            "S&P 500": "^GSPC",
            "Dow Jones": "^DJI", 
            "NASDAQ": "^IXIC",
            "Russell 2000": "^RUT",
            "VIX": "^VIX"
        }
        
        market_data = {}
        
        for name, symbol in indices.items():
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    ticker = yf.Ticker(symbol)
                    hist = ticker.history(period="5d")
                    
                    if not hist.empty:
                        current = hist['Close'].iloc[-1]
                        previous = hist['Close'].iloc[-2] if len(hist) > 1 else current
                        change = current - previous
                        change_pct = (change / previous * 100) if previous != 0 else 0
                        
                        market_data[name] = {
                            "symbol": symbol,
                            "current": float(current),
                            "change": float(change),
                            "change_percent": float(change_pct)
                        }
                        break
                    elif attempt == max_retries - 1:
                        raise ValueError(f"Empty history for {symbol}")
                    else:
                        time.sleep(2 ** attempt)
                        
                except Exception as e:
                    logger.error(f"Error fetching {name} data: {str(e)}")
                    if attempt == max_retries - 1:
                        market_data[name] = {
                            "error": True,
                            "message": f"Failed to fetch data for {name}: {str(e)}",
                            "data": {}
                        }
                    else:
                        time.sleep(2 ** attempt)
        
        return market_data
    
    def get_sector_performance(self) -> Dict[str, Any]:
        sector_etfs = {
            "Technology": "XLK",
            "Healthcare": "XLV",
            "Financial": "XLF",
            "Energy": "XLE",
            "Consumer Discretionary": "XLY",
            "Consumer Staples": "XLP",
            "Industrial": "XLI",
            "Materials": "XLB",
            "Real Estate": "XLRE",
            "Utilities": "XLU",
            "Communication": "XLC"
        }
        
        sector_data = {}
        
        for sector, etf in sector_etfs.items():
            try:
                data = self.get_stock_data(etf, "1mo")
                if not data.get("error"):
                    sector_data[sector] = {
                        "etf_symbol": etf,
                        "current_price": data["current_price"],
                        "price_change_percent": data["price_change_percent"]
                    }
            except Exception as e:
                logger.error(f"Error fetching {sector} sector data: {str(e)}")
        
        return sector_data
    
    def search_stocks(self, query: str, limit: int = 10) -> List[Dict[str, str]]:
        try:
            return [{
                "symbol": query.upper(),
                "name": query.upper(),
                "sector": "Unknown",
                "industry": "Unknown"
            }]
                
        except Exception as e:
            logger.error(f"Error searching for stocks with query '{query}': {str(e)}")
            return []

financial_data_tool = FinancialDataTool()
