# EliteDevs Financial Analysis AI

## Proje Açıklaması

EliteDevs Financial Analysis AI, BTK Hackathon 2026 için geliştirilmiş, çoklu ajan tabanlı bir finansal analiz platformudur. Bu sistem, gelişmiş yapay zeka ajanları kullanarak hisse senedi piyasalarını kapsamlı bir şekilde analiz eder, risk değerlendirmesi yapar ve yatırım önerileri sunar. Teknik göstergeler, temel analiz ve piyasa duyarlılığı gibi birden fazla boyutu birleştirerek veri odaklı, tarafsız finansal analiz sağlar.

## Çözülen Problemler

Finansal piyasalar karmaşık ve çok boyutlu analiz gerektirir. Bireysel yatırımcılar ve finans profesyonelleri aşağıdaki zorluklarla karşılaşır:

- **Bilgi Aşırı Yükü**: Fiyatlar, haberler, finansal raporlar ve ekonomik göstergelerden gelen büyük veri miktarı
- **Çok Boyutlu Analiz**: Etkili yatırım kararları için teknik analiz, temel analiz, duygu analizi ve risk değerlendirmesinin birleştirilmesi
- **Zaman Kısıtlaması**: Birden fazla hisse senedinin farklı zaman dilimlerinde manuel analizi zaman alıcıdır
- **Duygusal Önyargı**: İnsan karar verme süreci duygular ve bilişsel önyargılarla etkilenebilir
- **Risk Yönetimi**: Uygun portföy risk değerlendirmesi karmaşık matematiksel hesaplamalar ve tarihsel analiz gerektirir

EliteDevs Financial Analysis AI, uzmanlaşmış yapay zeka ajanlarının işbirliğiyle bu zorlukları aşarak kapsamlı, tarafsız ve veri odaklı finansal analiz ve yatırım önerileri sağlar.

## Proje Yapısı

```
ai-worker/
├── agents/                     # Yapay Zeka Ajan Uygulamaları
│   ├── analysis_agent.py          # Teknik ve temel analiz
│   ├── data_agent.py              # Veri toplama ve işleme
│   └── risk_agent.py              # Risk değerlendirmesi ve öneriler
│
├── core/                       # Temel Sistem Bileşenleri
│   ├── __init__.py
│   ├── config.py                  # Yapılandırma yönetimi
│   ├── gemini.py                  # Google Gemini entegrasyonu
│   └── orchestrator.py            # Ana orkestrasyon mantığı
│
├── tools/                      # Analiz Araçları ve Yardımcı Programlar
│   ├── __init__.py
│   ├── financial_data.py          # Hisse veri çekme
│   ├── news_sentiment.py          # Haber duygu analizi
│   └── technical_analysis.py      # Teknik göstergeler
│
├── app.py                        # Uygulama giriş noktası
├── requirements.txt               # Python bağımlılıkları
├── pyproject.toml                 # UV proje yapılandırması
└── README.md                      # Bu dosya
```

## Ajan Etkileşimleri ve İş Akışı

EliteDevs Financial Analysis AI, uzmanlaşmış yapay zeka ajanlarının işbirliği yaptığı çoklu ajan mimarisi kullanır.

### Ajan İşbirliği Akışı

```
DataAgent → AnalysisAgent → RiskAgent → Nihai Rapor
```

### 1. **DataAgent** (Veri Toplama ve İşleme)

- **Birincil Rol**: Finansal verileri toplar ve ön işler
- **Veri Kaynakları**: Hisse fiyatları, finansal tablolar, piyasa endeksleri, haber akışları
- **Çıktı**: Temiz, yapılandırılmış finansal veri setleri
- **Aktarım**: AnalysisAgent'a standartlaştırılmış veri sağlar

### 2. **AnalysisAgent** (Teknik ve Temel Analiz)

- **Giriş**: DataAgent'tan işlenmiş verileri alır
- **Teknik Analiz**: RSI, MACD, Bollinger Bantları, hareketli ortalamalar, destek/direnç hesaplar
- **Temel Analiz**: Finansal oranlar, değerleme metrikleri, büyüme oranları hesaplar
- **Duygu Analizi**: Haber duygu ve piyasa göstergelerini işler
- **Çıktı**: Teknik sinyaller, temel puanlar ve piyasa duyarlılığı
- **Aktarım**: RiskAgent'a analiz sonuçlarını sağlar

### 3. **RiskAgent** (Risk Değerlendirmesi ve Öneriler)

- **Giriş**: AnalysisAgent'tan analiz sonuçlarını alır
- **Risk Hesaplamaları**: VaR, Sharpe oranı, beta, volatilite, maksimum düşüş
- **Portföy Analizi**: Pozisyon boyutlandırma, tahsis önerileri, korelasyon analizi
- **Nihai Puanlama**: Teknik, temel ve risk metriklerini eyleme dönüştürülebilir önerilere birleştirir

## Özellikler

### Temel Yetenekler

- **Çoklu Ajan Mimarisi**: Veri toplama, teknik analiz, temel analiz ve risk değerlendirmesi için uzmanlaşmış yapay zeka ajanları
- **Gerçek Zamanlı Veri Entegrasyonu**: Yahoo Finance, Alpha Vantage, Finnhub ve RSS haber akışları
- **Temel Analiz**: Finansal oranlar, değerleme metrikleri, karlılık analizi
- **Risk Değerlendirmesi**: VaR, Sharpe oranı, beta hesaplama, portföy risk metrikleri
- **Haber Duygu Analizi**: Piyasa etkisi değerlendirmesi için gerçek zamanlı haber duygu analizi
- **Portföy Optimizasyonu**: Akıllı pozisyon boyutlandırma ve tahsis önerileri
- **Profesyonel Raporlama**: Zengin terminal çıktısı ve detaylı JSON raporları

### Desteklenen Analiz Türleri

- **Tek Hisse Analizi**: Tek hisse senetlerinin derinlemesine analizi
- **Çoklu Hisse Portföy Analizi**: Birden fazla menkul kıymetin karşılaştırmalı analizi
- **Risk Ayarlı Öneriler**: Güven puanlarıyla AL/SAT/TUT önerileri
- **Piyasa Trend Analizi**: Sektör performansı ve piyasa görünümü değerlendirmesi

## Ön Koşullar

### Paket Yöneticisi (Önerilen)

- **UV**: Hızlı Python paket yükleyici ve çözümleyici ([UV'yi Yükleyin](https://docs.astral.sh/uv/getting-started/installation/))

### API Anahtarları

- **Google Gemini API**: Yapay zeka destekli analiz için (gerekli)
- **Finnhub API**: Profesyonel piyasa verileri ve haberler

## Kurulum

### UV Kullanarak (Önerilen)

#### 1. UV'yi Yükleyin

```bash
# macOS ve Linux'ta
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows'ta
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# Alternatif: pip kullanarak
pip install uv
```

#### 2. Depoyu Klonlayın

```bash
git clone <depo-url>
cd ai-worker
```

#### 3. Projeyi Oluşturun ve Bağımlılıkları Yükleyin

```bash
uv sync
```

### Veya

#### Sanal Ortam Oluşturun

```bash
python -m venv venv
source venv/bin/activate  # Windows'ta: venv\Scripts\activate
```

#### Bağımlılıkları Yükleyin

```bash
pip install -r requirements.txt
```

#### 4. Ortam Yapılandırması

Proje kök dizininde bir `.env` dosyası oluşturun:

```env
GOOGLE_API_KEY=sizin_gemini_api_anahtarınız
FINNHUB_API_KEY=sizin_finnhub_anahtarınız
TIMEOUT_SECONDS=30
```

#### 5. Uygulamayı Çalıştırın

```bash
uv run python app.py --help
# veya
python app.py --help
```

## Hızlı Başlangıç

#### Temel Hisse Analizi

```bash
python app.py analyze AAPL --period 1y
```

#### Çoklu Hisse Portföy Analizi

```bash
python app.py analyze AAPL MSFT GOOGL NVDA --period 6mo
```

#### Gelişmiş Analiz Seçenekleri

```bash
# İşbirlikçi ajan analizi için CrewAI kullanın
python app.py analyze AAPL --period 1y --use-crew

# Kısa vadeli ticaret analizi
python app.py analyze AAPL NVDA --period 5d

# Uzun vadeli yatırım analizi
python app.py analyze BRK-B SPY --period 5y
```

## Analiz Bileşenleri

### 1. Teknik Analiz

**Gösterge:** RSI, MACD, Bollinger Bantları, Hareketli Ortalamalar (SMA/EMA), Destek/Direnç, Hacim

### 2. Temel Analiz

**Metrik:** F/K, F/B, ÖZS, ÖKA, Borç Oranları, Kar Marjları, Büyüme Oranları

### 3. Risk Değerlendirmesi

**Hesaplamalar:** Volatilite, VaR, Maksimum Düşüş, Sharpe Oranı, Beta

### 4. Yatırım Önerileri

**Ölçek:** GÜÇLÜ_AL (≥70) • AL (≥60) • TUT (≥40) • SAT (≥30) • GÜÇLÜ_SAT (<30)

## Çıktı Dosyaları

### JSON Analiz Raporları

Tüm analizler otomatik olarak detaylı JSON raporları oluşturur:

**Dosya Adı Formatı:**

```
financial_analysis_{SEMBOLLAR}_{ZAMAN_DAMGASI}.json
```

## Katkıda Bulunma

Bu proje BTK Hackathon 2026 için EliteDevs takımı tarafından geliştirilmiştir. Katkıda bulunmak için lütfen bir pull request gönderin veya issue açın.

## Lisans

Bu proje açık kaynak kodludur ve MIT lisansı altında lisanslanmıştır.
}
```

### Report Sections

1. **Data Collection**: Raw financial data, news, market indices
2. **Technical Analysis**: All technical indicators and signals
3. **Fundamental Analysis**: Financial ratios and scores
4. **Risk Assessment**: Risk metrics and portfolio analysis
5. **Executive Summary**: Key findings and recommendations

### Debug Mode

```bash
export LOG_LEVEL=DEBUG
python main.py analyze AAPL --period 1y
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
