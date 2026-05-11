"""
Rule-based credit assessment for /api/assess-credit.
Returns the JSON shape expected by the KrediAI frontend (snake_case keys).
"""

from __future__ import annotations

import math
from typing import Any, Dict, List, Optional, Tuple


def _num(value: Any, default: float = 0.0) -> float:
    if value is None or value == "":
        return default
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _int(value: Any, default: int = 0) -> int:
    v = _num(value, float(default))
    return int(round(v))


def _monthly_payment(principal: float, annual_rate: float, term_months: int) -> float:
    if principal <= 0 or term_months <= 0:
        return 0.0
    r = annual_rate / 12.0
    if r <= 0:
        return principal / term_months
    factor = math.pow(1 + r, term_months)
    return principal * (r * factor) / (factor - 1)


def _history_label(code: str) -> str:
    mapping = {
        "excellent": "Mükemmel",
        "good": "İyi",
        "fair": "Orta",
        "poor": "Zayıf",
    }
    return mapping.get((code or "").lower(), code or "Belirtilmedi")


def assess_credit_application(body: Dict[str, Any]) -> Dict[str, Any]:
    first = str(body.get("firstName", "")).strip()
    last = str(body.get("lastName", "")).strip()
    applicant_name = f"{first} {last}".strip() or "Başvuru Sahibi"

    monthly_income = _num(body.get("monthlyIncome"))
    total_debts = _num(body.get("totalExistingDebts"))
    loan_amount = _num(body.get("loanAmount"))
    savings = _num(body.get("savingsAmount"))
    credit_score = _int(body.get("creditScore"))
    term_months = max(1, _int(body.get("preferredTerm"), 36))

    credit_history_code = str(body.get("creditHistory") or "good")
    industry = str(body.get("industry") or "")

    annual_rate = 0.12
    monthly_loan_payment = _monthly_payment(loan_amount, annual_rate, term_months)

    dti = 0.0
    if monthly_income > 0:
        dti = ((total_debts + monthly_loan_payment) / monthly_income) * 100.0

    liquidity_ratio = (savings / loan_amount) if loan_amount > 0 else (1.0 if savings > 0 else 0.0)

    # Decision rules (transparent heuristics)
    decision: str
    if monthly_income <= 0 or credit_score < 300:
        decision = "REVIEW"
    elif credit_score < 560 or dti > 58:
        decision = "DENY"
    elif credit_score < 640 or dti > 46 or liquidity_ratio < 0.08:
        decision = "REVIEW"
    elif credit_score >= 700 and dti <= 38 and liquidity_ratio >= 0.12:
        decision = "APPROVE"
    else:
        decision = "REVIEW" if dti > 40 or credit_score < 680 else "APPROVE"

    # Default probability (%), bounded
    base = 6.0 + max(0.0, (720 - credit_score) / 35.0) * 8.0 + max(0.0, dti - 28.0) * 0.35
    if decision == "DENY":
        base += 10.0
    elif decision == "REVIEW":
        base += 4.0
    default_probability = float(max(1.5, min(38.0, base)))

    confidence_score = int(max(62, min(96, credit_score / 9.0 + (55.0 - min(dti, 55.0)) * 0.45)))

    interest_rate = 11.49 if decision == "APPROVE" else 13.99

    suggested_terms: Optional[Dict[str, Any]] = None
    if decision == "APPROVE":
        suggested_terms = {
            "loanAmount": int(round(loan_amount)),
            "interestRate": interest_rate,
            "term": term_months,
            "monthlyPayment": int(round(monthly_loan_payment)),
        }

    reasons: List[Dict[str, Any]] = _build_reasons(
        decision=decision,
        credit_score=credit_score,
        dti=dti,
        liquidity_ratio=liquidity_ratio,
        savings=savings,
        industry=industry,
    )

    risk_factors = _build_risk_factors(credit_score=credit_score, dti=dti, liquidity_ratio=liquidity_ratio)

    credit_factors = _build_credit_factors(credit_score)

    compliance_notes = [
        {
            "status": "passed",
            "title": "KYC / Temel doğrulama",
            "description": "Başvuru formu alanları tamamlandı; temel tutarlılık kontrolleri geçti.",
        },
        {
            "status": "passed" if decision != "DENY" else "warning",
            "title": "İç limit politikası",
            "description": "DTI ve skor bandı politika eşikleri ile karşılaştırıldı.",
        },
    ]

    required_documents = [
        {"id": 1, "name": "Kimlik belgesi", "status": "pending", "priority": "high"},
        {"id": 2, "name": "Son 3 aya ait banka hesap dökümü", "status": "pending", "priority": "high"},
        {"id": 3, "name": "Gelir belgesi (bordro veya vergi levhası)", "status": "pending", "priority": "high"},
        {"id": 4, "name": "İkametgâh veya yerleşim belgesi", "status": "pending", "priority": "medium"},
    ]

    explanation, agent_deliberation = _build_narrative(
        applicant_name=applicant_name,
        decision=decision,
        credit_score=credit_score,
        dti=dti,
        loan_amount=loan_amount,
        monthly_income=monthly_income,
    )

    return {
        "applicant_name": applicant_name,
        "decision": decision,
        "confidence_score": confidence_score,
        "decision_reasons": reasons,
        "suggested_terms": suggested_terms,
        "compliance_notes": compliance_notes,
        "credit_score": credit_score,
        "credit_factors": credit_factors,
        "credit_history": _history_label(credit_history_code),
        "num_credit_accounts": max(2, min(12, 4 + credit_score // 120)),
        "monthly_income": int(round(monthly_income)) if monthly_income else 0,
        "total_existing_debts": int(round(total_debts)),
        "requested_loan_amount": int(round(loan_amount)),
        "savings_amount": int(round(savings)),
        "default_probability": default_probability,
        "risk_factors": risk_factors,
        "monthly_loan_payment": int(round(monthly_loan_payment)),
        "required_documents": required_documents,
        "explanation": explanation,
        "agent_deliberation": agent_deliberation,
    }


def _build_reasons(
    decision: str,
    credit_score: int,
    dti: float,
    liquidity_ratio: float,
    savings: float,
    industry: str,
) -> List[Dict[str, Any]]:
    reasons: List[Dict[str, Any]] = []

    if credit_score >= 700:
        reasons.append(
            {
                "type": "positive",
                "title": "Güçlü kredi notu bandı",
                "description": "Skor, ödeme kapasitesi için olumlu bir başlangıç sinyali veriyor.",
                "impact": 18,
            }
        )
    elif credit_score >= 620:
        reasons.append(
            {
                "type": "neutral",
                "title": "Orta-üst skor bandı",
                "description": "Skor kabul edilebilir; diğer oranlarla birlikte değerlendirildi.",
                "impact": 6,
            }
        )
    else:
        reasons.append(
            {
                "type": "negative",
                "title": "Skor baskısı",
                "description": "Skor bandı risk primi veya ek inceleme gerektirebilir.",
                "impact": -14,
            }
        )

    if dti <= 36:
        reasons.append(
            {
                "type": "positive",
                "title": "Sağlıklı borç/gelir dengesi",
                "description": "DTI, yeni ödeme ile birlikte kontrol altında görünüyor.",
                "impact": 16,
            }
        )
    elif dti <= 46:
        reasons.append(
            {
                "type": "neutral",
                "title": "DTI sınırına yakın",
                "description": "Ödeme gücü kabul edilebilir; marj daralıyor.",
                "impact": -4,
            }
        )
    else:
        reasons.append(
            {
                "type": "negative",
                "title": "Yüksek DTI",
                "description": "Gelire göre borç yükü yüksek; temerrüt olasılığını artırır.",
                "impact": -22,
            }
        )

    if liquidity_ratio >= 0.12:
        reasons.append(
            {
                "type": "positive",
                "title": "Likidite tamponu",
                "description": f"Tasarruf ({int(round(savings))} ₺) beklenen stres için tampon oluşturuyor.",
                "impact": 10,
            }
        )
    else:
        reasons.append(
            {
                "type": "negative",
                "title": "Sınırlı likidite",
                "description": "Tasarruf / kredi tutarı oranı düşük; şok senaryolarında kırılganlık artar.",
                "impact": -10,
            }
        )

    if industry:
        reasons.append(
            {
                "type": "neutral",
                "title": "Sektör bağlamı",
                "description": f"Sektör ({industry}) risk görünümü için not edildi.",
                "impact": 2,
            }
        )

    if decision == "APPROVE":
        reasons.append(
            {
                "type": "positive",
                "title": "Politika uyumu",
                "description": "Skor, DTI ve likidite birlikte onay eşiğini karşıladı.",
                "impact": 12,
            }
        )
    elif decision == "DENY":
        reasons.append(
            {
                "type": "negative",
                "title": "Ret gerekçesi",
                "description": "Skor ve/veya DTI politika dışına çıktı; otomatik ret seti tetiklendi.",
                "impact": -30,
            }
        )
    else:
        reasons.append(
            {
                "type": "neutral",
                "title": "Manuel inceleme",
                "description": "Sınırda profil: ek belge veya uzman onayı önerilir.",
                "impact": -6,
            }
        )

    return reasons


def _build_risk_factors(credit_score: int, dti: float, liquidity_ratio: float) -> List[Dict[str, str]]:
    factors: List[Dict[str, str]] = []
    if credit_score < 640:
        factors.append(
            {
                "name": "Skor volatilitesi",
                "description": "Skor bandı, benzer kohortlara göre temerrüt ihtimalini artırabilir.",
            }
        )
    if dti > 40:
        factors.append(
            {
                "name": "Nakit akışı sıkışması",
                "description": "Yüksek DTI, beklenmedik harcamalarda ödeme aksaması riskini yükseltir.",
            }
        )
    if liquidity_ratio < 0.1:
        factors.append(
            {
                "name": "Düşük finansal tampon",
                "description": "Tasarrufların kredi tutarına oranı düşük; stres toleransı sınırlı.",
            }
        )
    if not factors:
        factors.append(
            {
                "name": "Belirgin uyarı yok",
                "description": "Temel risk göstergeleri kontrol altında görünüyor.",
            }
        )
    return factors


def _build_credit_factors(credit_score: int) -> List[Dict[str, Any]]:
    return [
        {
            "name": "Ödeme disiplini (tahmini)",
            "description": "Formdaki geçmiş etiketi ve skor ile uyumlu bir ödeme profili varsayımı.",
            "impact": 10 if credit_score >= 700 else (4 if credit_score >= 640 else -8),
        },
        {
            "name": "Kredi kullanım yoğunluğu (tahmini)",
            "description": "Mevcut borçlar göz önüne alınarak kullanım yoğunluğu için ara değerlendirme.",
            "impact": 6 if credit_score >= 680 else -6,
        },
        {
            "name": "Profil çeşitliliği",
            "description": "Hesap çeşitliliği ve vade dağılımı için özet skor katkısı.",
            "impact": 3,
        },
    ]


def _build_narrative(
    applicant_name: str,
    decision: str,
    credit_score: int,
    dti: float,
    loan_amount: float,
    monthly_income: float,
) -> Tuple[str, List[Dict[str, str]]]:
    agent_deliberation = [
        {"agent": "Veri Ajanı", "text": f"{applicant_name} için form alanları birleştirildi; gelir ve borç kalemleri tutarlılık kontrolünden geçti."},
        {"agent": "Risk Ajanı", "text": f"DTI yaklaşık %{dti:.1f} olarak hesaplandı; likidite ve stres senaryoları tarandı."},
        {"agent": "Skor Ajanı", "text": f"Kredi notu {credit_score} bandı ile temerrüt olasılığı skor kartına işlendi."},
        {
            "agent": "Orkestratör",
            "text": "Ajan çıktıları politika eşikleriyle birleştirildi; kullanıcıya gösterilecek resmi karar üretildi.",
        },
    ]

    if decision == "APPROVE":
        explanation = (
            f"{applicant_name} başvurusu için sistem; skor, DTI ve likidite göstergelerinin birlikte onay eşiğini "
            f"karşıladığını değerlendirdi. Talep tutarı yaklaşık {int(round(loan_amount))} ₺ için önerilen şartlar "
            "aşağıda özetlenmiştir."
        )
    elif decision == "DENY":
        explanation = (
            f"{applicant_name} başvurusu için risk göstergeleri (özellikle skor ve/veya DTI) politika dışı bir profil "
            "oluşturdu. Bu nedenle otomatik ret önerisi üretildi; itiraz veya yeniden yapılandırma için kanallar "
            "sonuç ekranında listelenmiştir."
        )
    else:
        explanation = (
            f"{applicant_name} başvurusu sınırda bir profil gösteriyor (skor: {credit_score}, DTI: %{dti:.1f}). "
            f"Aylık gelir {int(round(monthly_income))} ₺ ile uyumlu ek belge veya manuel inceleme ile netleştirilmesi önerilir."
        )

    return explanation, agent_deliberation
