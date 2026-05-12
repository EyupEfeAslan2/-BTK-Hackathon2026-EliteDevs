# EliteDevs B2B Multi-Agent Credit Committee Engine

## Proje Açıklaması

EliteDevs B2B Multi-Agent Credit Committee Engine, BTK Hackathon 2026 için geliştirilmiş, çoklu ajan tabanlı bir kurumsal kredi risk platformudur. Bu sistem, gelişmiş yapay zeka ajanları kullanarak kurumsal firmaların kredibilitesini analiz eder, temerrüt riski değerlendirmesi yapar ve kredi komitesi kararları sunar. Finansal sağlık göstergeleri, temel analiz ve sektörel duyarlılığı birleştirerek veri odaklı, tarafsız kredi tahsis analizi sağlar.

## Çözülen Problemler

Finansal piyasalar karmaşık ve çok boyutlu analiz gerektirir. Bireysel yatırımcılar ve finans profesyonelleri aşağıdaki zorluklarla karşılaşır:

- **Bilgi Aşırı Yükü**: Fiyatlar, haberler, finansal raporlar ve ekonomik göstergelerden gelen büyük veri miktarı
- **Çok Boyutlu Analiz**: Etkili kredi kararları için finansal sağlık, temel analiz ve risk değerlendirmesinin birleştirilmesi
- **Zaman Kısıtlaması**: Birden fazla kurumsal müşterinin manuel kredi analizi zaman alıcıdır
- **Duygusal Önyargı**: İnsan karar verme süreci duygular ve bilişsel önyargılarla etkilenebilir
- **Risk Yönetimi**: Uygun temerrüt risk değerlendirmesi karmaşık hesaplamalar ve nakit akışı analizi gerektirir

EliteDevs Credit Committee Engine, uzmanlaşmış yapay zeka ajanlarının işbirliğiyle bu zorlukları aşarak kapsamlı, tarafsız kredi tahsis kararları sağlar.

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

EliteDevs Credit Committee Engine, uzmanlaşmış yapay zeka ajanlarının işbirliği yaptığı çoklu ajan mimarisi kullanır.

### Ajan İşbirliği Akışı

```
DataAgent → AnalysisAgent → RiskAgent → Nihai Rapor
```

### 1. **DataAgent** (Veri Toplama ve İşleme)

- **Birincil Rol**: Kurumsal finansal verileri toplar ve ön işler
- **Veri Kaynakları**: Kurumsal metrikler, finansal tablolar, piyasa endeksleri, haber akışları
- **Çıktı**: Temiz, yapılandırılmış kurumsal veri setleri
- **Aktarım**: AnalysisAgent'a standartlaştırılmış veri sağlar

### 2. **AnalysisAgent** (Kredi Değerlendiricisi)

- **Giriş**: DataAgent'tan işlenmiş verileri alır
- **Finansal Sağlık Analizi**: Borç/Özkaynak, Likidite, Serbest Nakit Akışı, DSCR hesaplar
- **Temel Analiz**: Finansal oranlar, borç çevirme metrikleri, büyüme oranları hesaplar
- **Duygu Analizi**: Haber duygu ve piyasa göstergelerini işler
- **Çıktı**: Finansal sağlık sinyalleri ve temerrüt ihtimali tahminleri
- **Aktarım**: RiskAgent'a analiz sonuçlarını sağlar

### 3. **RiskAgent** (Kredi Risk Subayı)

- **Giriş**: AnalysisAgent'tan analiz sonuçlarını alır
- **Risk Hesaplamaları**: Temerrüt olasılığı, kovenant ihlal riski
- **Portföy Analizi**: Sistemik risk değerlendirmesi
- **Nihai Puanlama**: Finansal metrikleri eyleme dönüştürülebilir kredi kararlarına birleştirir

## Özellikler

### Temel Yetenekler

- **Çoklu Ajan Mimarisi**: Veri toplama, finansal sağlık analizi ve kredi risk değerlendirmesi için uzmanlaşmış yapay zeka ajanları
- **Gerçek Zamanlı Veri Entegrasyonu**: API'lar ve RSS haber akışları
- **Temel Analiz**: Borç ödeme oranları, değerleme metrikleri, karlılık analizi
- **Risk Değerlendirmesi**: Temerrüt riski, kovenant riskleri
- **Haber Duygu Analizi**: Kurumsal itibar değerlendirmesi için gerçek zamanlı haber duygu analizi
- **Kredi Optimizasyonu**: Kredi limitleri ve vade/kovenant önerileri
- **Profesyonel Raporlama**: Detaylı JSON kredi komitesi raporları (Credit Committee Memo)

### Desteklenen Analiz Türleri

- **Tekil Kurum Analizi**: Kurumsal firmaların derinlemesine kredi incelemesi
- **Sektörel Kredi Analizi**: Sektördeki firmaların karşılaştırmalı analizi
- **Risk Ayarlı Kararlar**: Güven puanlarıyla ONAY/RED/ŞARTLI kredi kararları
- **Piyasa Trend Analizi**: Sektör performansı ve temerrüt trendleri değerlendirmesi

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

### 1. Finansal Sağlık Analizi

**Metrik:** Borç/Özkaynak, Likidite, Serbest Nakit Akışı, DSCR

### 2. Temel Analiz

**Metrik:** Borç Oranları, Kar Marjları, Büyüme Oranları, İşletme Değeri

### 3. Kredi Risk Değerlendirmesi

**Metrikler:** Temerrüt Olasılığı, Kovenant İhlal Riski

### 4. Kredi Komitesi Kararları

**Karar Tipi:** ONAY • ŞARTLI_ONAY • MANUEL_INCELEME • RED

## Çıktı Dosyaları

### JSON Analiz Raporları

Tüm analizler otomatik olarak detaylı JSON raporları oluşturur:

**Dosya Adı Formatı:**

```
credit_memo_{SEMBOLLAR}_{ZAMAN_DAMGASI}.json
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
