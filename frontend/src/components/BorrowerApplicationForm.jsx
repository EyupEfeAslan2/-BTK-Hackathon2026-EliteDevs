import React, { useState } from 'react';
import { FiChevronRight, FiChevronLeft, FiCheck } from 'react-icons/fi';

export default function BorrowerApplicationForm({ onSubmit, isLoading }) {
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    email: '',
    phone: '',
    employmentStatus: 'employed',
    monthlyIncome: '',
    employer: '',
    position: '',
    yearsEmployed: '',
    industry: '',
    creditScore: '',
    creditHistory: 'good',
    totalExistingDebts: '',
    debtAccounts: '',
    loanPurpose: 'personal',
    loanAmount: '',
    preferredTerm: '36',
    savingsAmount: '',
    propertyValue: '',
    otherAssets: '',
  });

  const [errors, setErrors] = useState({});

  const validateStep = (currentStep) => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'Ad gereklidir';
      if (!formData.lastName.trim()) newErrors.lastName = 'Soyadı gereklidir';
      if (!formData.age || formData.age < 18) newErrors.age = 'Geçerli yaş gereklidir';
      if (!formData.email) newErrors.email = 'E-posta gereklidir';
      if (!formData.phone) newErrors.phone = 'Telefon gereklidir';
    } else if (currentStep === 2) {
      if (!formData.monthlyIncome || formData.monthlyIncome <= 0)
        newErrors.monthlyIncome = 'Aylık gelir gereklidir';
      if (!formData.employer.trim()) newErrors.employer = 'İşveren adı gereklidir';
      if (!formData.yearsEmployed || formData.yearsEmployed < 0)
        newErrors.yearsEmployed = 'İstihdam süresi gereklidir';
      if (!formData.industry) newErrors.industry = 'Sektör gereklidir';
    } else if (currentStep === 3) {
      if (!formData.creditScore || formData.creditScore < 300 || formData.creditScore > 850)
        newErrors.creditScore = 'Geçerli kredi notu gereklidir (300-850)';
      if (!formData.totalExistingDebts) newErrors.totalExistingDebts = 'Mevcut borç gereklidir';
    } else if (currentStep === 4) {
      if (!formData.loanAmount || formData.loanAmount <= 0)
        newErrors.loanAmount = 'Kredi tutarı gereklidir';
    } else if (currentStep === 5) {
      if (!formData.savingsAmount) newErrors.savingsAmount = 'Tasarruf miktarı gereklidir';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (validateStep(step)) {
      await onSubmit(formData);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-banking-teal bg-clip-text text-transparent">
              Kişisel Bilgiler
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Ad</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-white/10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-banking-teal transition-all backdrop-blur-sm text-white placeholder-gray-400 ${
                    errors.firstName ? 'border-banking-red' : 'border-white/20'
                  }`}
                  placeholder="Adınız"
                />
                {errors.firstName && <p className="text-banking-red text-sm mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Soyadı</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-white/10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-banking-teal transition-all backdrop-blur-sm text-white placeholder-gray-400 ${
                    errors.lastName ? 'border-banking-red' : 'border-white/20'
                  }`}
                  placeholder="Soyadınız"
                />
                {errors.lastName && <p className="text-banking-red text-sm mt-1">{errors.lastName}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Yaş</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-white/10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-banking-teal transition-all backdrop-blur-sm text-white placeholder-gray-400 ${
                    errors.age ? 'border-banking-red' : 'border-white/20'
                  }`}
                  placeholder="18+"
                />
                {errors.age && <p className="text-banking-red text-sm mt-1">{errors.age}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">E-posta</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-white/10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-banking-teal transition-all backdrop-blur-sm text-white placeholder-gray-400 ${
                    errors.email ? 'border-banking-red' : 'border-white/20'
                  }`}
                  placeholder="email@example.com"
                />
                {errors.email && <p className="text-banking-red text-sm mt-1">{errors.email}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Telefon</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-white/10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-banking-teal transition-all backdrop-blur-sm text-white placeholder-gray-400 ${
                  errors.phone ? 'border-banking-red' : 'border-white/20'
                }`}
                placeholder="+90 5XX XXX XXXX"
              />
              {errors.phone && <p className="text-banking-red text-sm mt-1">{errors.phone}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-banking-teal bg-clip-text text-transparent">
              İstihdam & Sektör
            </h2>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">İstihdam Durumu</label>
              <select
                name="employmentStatus"
                value={formData.employmentStatus}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-banking-teal transition-all backdrop-blur-sm text-white"
              >
                <option value="employed">Çalışan</option>
                <option value="self-employed">Serbest Meslek</option>
                <option value="unemployed">İşsiz</option>
                <option value="retired">Emekli</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Aylık Gelir (₺)</label>
                <input
                  type="number"
                  name="monthlyIncome"
                  value={formData.monthlyIncome}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-white/10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-banking-teal transition-all backdrop-blur-sm text-white placeholder-gray-400 ${
                    errors.monthlyIncome ? 'border-banking-red' : 'border-white/20'
                  }`}
                  placeholder="0"
                />
                {errors.monthlyIncome && <p className="text-banking-red text-sm mt-1">{errors.monthlyIncome}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">İş Süresi (Yıl)</label>
                <input
                  type="number"
                  name="yearsEmployed"
                  value={formData.yearsEmployed}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-white/10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-banking-teal transition-all backdrop-blur-sm text-white placeholder-gray-400 ${
                    errors.yearsEmployed ? 'border-banking-red' : 'border-white/20'
                  }`}
                  placeholder="0"
                />
                {errors.yearsEmployed && <p className="text-banking-red text-sm mt-1">{errors.yearsEmployed}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">İşveren</label>
              <input
                type="text"
                name="employer"
                value={formData.employer}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-white/10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-banking-teal transition-all backdrop-blur-sm text-white placeholder-gray-400 ${
                  errors.employer ? 'border-banking-red' : 'border-white/20'
                }`}
                placeholder="Şirket adı"
              />
              {errors.employer && <p className="text-banking-red text-sm mt-1">{errors.employer}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Sektör</label>
              <select
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-white/10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-banking-teal transition-all backdrop-blur-sm text-white ${
                  errors.industry ? 'border-banking-red' : 'border-white/20'
                }`}
              >
                <option value="">Sektör seçin</option>
                <option value="technology">Teknoloji</option>
                <option value="finance">Finans</option>
                <option value="healthcare">Sağlık</option>
                <option value="retail">Perakende</option>
                <option value="manufacturing">İmalat</option>
                <option value="education">Eğitim</option>
              </select>
              {errors.industry && <p className="text-banking-red text-sm mt-1">{errors.industry}</p>}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-banking-teal bg-clip-text text-transparent">
              Kredi Profili
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Kredi Notu</label>
                <input
                  type="number"
                  name="creditScore"
                  value={formData.creditScore}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-white/10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-banking-teal transition-all backdrop-blur-sm text-white placeholder-gray-400 ${
                    errors.creditScore ? 'border-banking-red' : 'border-white/20'
                  }`}
                  placeholder="750"
                  min="300"
                  max="850"
                />
                {errors.creditScore && <p className="text-banking-red text-sm mt-1">{errors.creditScore}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Geçmiş</label>
                <select
                  name="creditHistory"
                  value={formData.creditHistory}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-banking-teal transition-all backdrop-blur-sm text-white"
                >
                  <option value="excellent">Mükemmel</option>
                  <option value="good">İyi</option>
                  <option value="fair">Orta</option>
                  <option value="poor">Zayıf</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Toplam Borçlar (₺)</label>
              <input
                type="number"
                name="totalExistingDebts"
                value={formData.totalExistingDebts}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-white/10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-banking-teal transition-all backdrop-blur-sm text-white placeholder-gray-400 ${
                  errors.totalExistingDebts ? 'border-banking-red' : 'border-white/20'
                }`}
                placeholder="0"
              />
              {errors.totalExistingDebts && <p className="text-banking-red text-sm mt-1">{errors.totalExistingDebts}</p>}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-banking-teal bg-clip-text text-transparent">
              Kredi Talebiniz
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Tutarı (₺)</label>
                <input
                  type="number"
                  name="loanAmount"
                  value={formData.loanAmount}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-white/10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-banking-teal transition-all backdrop-blur-sm text-white placeholder-gray-400 ${
                    errors.loanAmount ? 'border-banking-red' : 'border-white/20'
                  }`}
                  placeholder="50000"
                />
                {errors.loanAmount && <p className="text-banking-red text-sm mt-1">{errors.loanAmount}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Vade (Ay)</label>
                <select
                  name="preferredTerm"
                  value={formData.preferredTerm}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-banking-teal transition-all backdrop-blur-sm text-white"
                >
                  <option value="12">12</option>
                  <option value="24">24</option>
                  <option value="36">36</option>
                  <option value="48">48</option>
                  <option value="60">60</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-banking-teal bg-clip-text text-transparent">
              Varlıklar
            </h2>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Tasarruf (₺)</label>
              <input
                type="number"
                name="savingsAmount"
                value={formData.savingsAmount}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-white/10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-banking-teal transition-all backdrop-blur-sm text-white placeholder-gray-400 ${
                  errors.savingsAmount ? 'border-banking-red' : 'border-white/20'
                }`}
                placeholder="0"
              />
              {errors.savingsAmount && <p className="text-banking-red text-sm mt-1">{errors.savingsAmount}</p>}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl p-8 border border-white/20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-banking-teal/5 to-transparent pointer-events-none"></div>
      <div className="relative z-10">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-300">Adım {step} / {totalSteps}</h3>
            <span className="text-sm font-bold text-banking-teal">{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 border border-white/10">
            <div
              className="bg-gradient-to-r from-banking-teal to-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="mb-8">{renderStepContent()}</div>

        <div className="flex justify-between gap-4">
          <button
            onClick={handlePrevious}
            disabled={step === 1}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold disabled:opacity-30 disabled:cursor-not-allowed border border-white/20 hover:border-banking-teal/50 transition-all duration-300 backdrop-blur-sm"
          >
            <FiChevronLeft size={20} />
            Geri
          </button>

          {step === totalSteps ? (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-banking-teal to-banking-green text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-banking-teal/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-banking-teal/50"
            >
              <FiCheck size={20} />
              {isLoading ? 'İşleniyor...' : 'Gönder'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-banking-teal to-cyan-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-banking-teal/50 transition-all duration-300 border border-banking-teal/50"
            >
              İleri
              <FiChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
