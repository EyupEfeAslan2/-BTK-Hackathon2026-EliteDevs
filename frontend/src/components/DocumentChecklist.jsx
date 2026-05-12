import React, { useState } from 'react';
import { FiCheck, FiX, FiUpload, FiDownload } from 'react-icons/fi';

const DocumentChecklist = ({ requiredDocuments = [] }) => {
  const [documents, setDocuments] = useState(
    requiredDocuments.length > 0
      ? requiredDocuments
      : [
          { id: 1, name: 'Kimlik Fotokopisi', status: 'pending', priority: 'high' },
          { id: 2, name: 'Son 3 Aylık Banka Ekstreleri', status: 'pending', priority: 'high' },
          { id: 3, name: 'Vergi Müdürlüğü Belgesi', status: 'pending', priority: 'high' },
          { id: 4, name: 'İşveren Referans Belgesi', status: 'pending', priority: 'medium' },
          { id: 5, name: 'Son 2 Yıl Vergi Beyannamesi', status: 'pending', priority: 'medium' },
          { id: 6, name: 'Gayrimenkul Deeds (varsa)', status: 'pending', priority: 'low' },
        ]
  );

  const handleFileUpload = (id) => {
    setDocuments(
      documents.map((doc) => (doc.id === id ? { ...doc, status: 'approved' } : doc))
    );
  };

  const handleDelete = (id) => {
    setDocuments(
      documents.map((doc) => (doc.id === id ? { ...doc, status: 'pending' } : doc))
    );
  };

  const completedCount = documents.filter((doc) => doc.status === 'approved').length;
  const totalCount = documents.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);

  const priorityColor = {
    high: 'text-banking-red',
    medium: 'text-banking-amber',
    low: 'text-banking-slate',
  };

  const priorityBg = {
    high: 'bg-banking-red/10',
    medium: 'bg-banking-amber/10',
    low: 'bg-banking-slate/10',
  };

  const priorityLabel = {
    high: 'Acil',
    medium: 'Normal',
    low: 'İsteğe Bağlı',
  };

  return (
    <div className="bg-white rounded-lg shadow-banking-md p-8">
      <h2 className="text-2xl font-bold text-banking-navy mb-2">Gerekli Belgeler</h2>
      <p className="text-banking-slate text-sm mb-8">Lütfen aşağıdaki belgeleri yükleyerek başvurunuzu tamamlayın</p>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-banking-navy">
            İlerleme: {completedCount}/{totalCount}
          </span>
          <span className="text-sm font-bold text-banking-teal">{completionPercentage}%</span>
        </div>
        <div className="w-full bg-banking-border rounded-full h-3">
          <div
            className="bg-banking-teal h-3 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Document List */}
      <div className="space-y-3 mb-8">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className={`flex items-center gap-4 p-4 border rounded-lg transition-colors ${
              doc.status === 'approved'
                ? 'bg-banking-green/5 border-banking-green/20'
                : 'bg-banking-light border-banking-border'
            }`}
          >
            {/* Status Icon */}
            <div className="flex-shrink-0">
              {doc.status === 'approved' ? (
                <div className="w-8 h-8 bg-banking-green rounded-full flex items-center justify-center">
                  <FiCheck className="text-white" size={18} />
                </div>
              ) : (
                <div className="w-8 h-8 bg-banking-border rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-banking-slate rounded-full"></div>
                </div>
              )}
            </div>

            {/* Document Info */}
            <div className="flex-1">
              <p className="font-semibold text-banking-navy">{doc.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs font-bold px-2 py-1 rounded ${priorityBg[doc.priority]}`}>
                  <span className={priorityColor[doc.priority]}>{priorityLabel[doc.priority]}</span>
                </span>
                {doc.status === 'approved' && <span className="text-xs text-banking-green">✓ Yüklendi</span>}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {doc.status === 'pending' ? (
                <>
                  <button
                    onClick={() => handleFileUpload(doc.id)}
                    className="flex items-center gap-2 px-3 py-1 bg-banking-teal text-white rounded text-sm hover:bg-teal-700 transition-colors"
                  >
                    <FiUpload size={16} />
                    Yükle
                  </button>
                </>
              ) : (
                <>
                  <button className="flex items-center gap-2 px-3 py-1 bg-banking-light text-banking-navy border border-banking-border rounded text-sm hover:bg-banking-border transition-colors">
                    <FiDownload size={16} />
                    İndir
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="flex items-center gap-2 px-3 py-1 bg-banking-red/10 text-banking-red rounded text-sm hover:bg-banking-red/20 transition-colors"
                  >
                    <FiX size={16} />
                    Sil
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="p-4 bg-banking-amber/5 border border-banking-amber/20 rounded-lg">
        <p className="text-sm text-banking-slate">
          📄 <strong>Not:</strong> Tüm belgeler PDF, JPG veya PNG formatında olmalıdır. Her belge 5MB'dan küçük
          olmalıdır.
        </p>
      </div>

      {/* Submit Button */}
      <div className="mt-8">
        <button
          disabled={completionPercentage < 100}
          className={`w-full px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
            completionPercentage === 100
              ? 'bg-banking-green text-white hover:bg-green-700'
              : 'bg-banking-border text-banking-slate cursor-not-allowed'
          }`}
        >
          <FiCheck size={20} />
          {completionPercentage === 100 ? 'Belgeleri Onayla ve İleri Geç' : 'Tüm Belgeleri Yükle'}
        </button>
      </div>
    </div>
  );
};

export default DocumentChecklist;
