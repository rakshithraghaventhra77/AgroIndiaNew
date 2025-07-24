import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  Users, 
  Activity, 
  TrendingUp,
  Eye,
  Lock,
  LogOut
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { storage } from '../utils/storage';
import { AdminCase } from '../types';

const AdminPage: React.FC = () => {
  const { t } = useLanguage();
  const [adminCases, setAdminCases] = useState<AdminCase[]>([]);
  const [stats, setStats] = useState({
    totalScans: 0,
    uniqueDiseases: 0,
    activeUsers: 0,
    avgAccuracy: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    const cases = storage.getAdminCases();
    setAdminCases(cases);

    // Calculate statistics
    const totalScans = cases.length;
    const uniqueDiseases = new Set(cases.map(c => c.disease)).size;
    const activeUsers = Math.floor(totalScans * 0.3); // Mock calculation
    const avgAccuracy = cases.length > 0 
      ? Math.round(cases.reduce((sum, c) => sum + c.confidence, 0) / cases.length)
      : 0;

    setStats({
      totalScans,
      uniqueDiseases,
      activeUsers,
      avgAccuracy
    });
  };

  const handleExportCSV = () => {
    const csvContent = storage.exportAdminCasesToCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agroguardian-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-green-800">
            {t('admin.title')}
          </h1>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">{t('admin.total.scans')}</p>
                <p className="text-3xl font-bold text-green-800">{stats.totalScans}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">{t('admin.diseases.detected')}</p>
                <p className="text-3xl font-bold text-green-800">{stats.uniqueDiseases}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Eye className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">{t('admin.users.active')}</p>
                <p className="text-3xl font-bold text-green-800">{stats.activeUsers}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">{t('admin.accuracy')}</p>
                <p className="text-3xl font-bold text-green-800">{stats.avgAccuracy}%</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Cases */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-green-800">
            {t('admin.recent.cases')}
          </h2>
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>{t('admin.export')}</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-green-200">
                <th className="text-left py-3 px-4 font-semibold text-green-800">ID</th>
                <th className="text-left py-3 px-4 font-semibold text-green-800">{t('admin.crop')}</th>
                <th className="text-left py-3 px-4 font-semibold text-green-800">{t('admin.disease')}</th>
                <th className="text-left py-3 px-4 font-semibold text-green-800">{t('admin.date')}</th>
                <th className="text-left py-3 px-4 font-semibold text-green-800">{t('admin.language')}</th>
                <th className="text-left py-3 px-4 font-semibold text-green-800">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {adminCases.slice(0, 20).map((case_, index) => (
                <tr key={case_.id} className={index % 2 === 0 ? 'bg-green-25' : ''}>
                  <td className="py-3 px-4 text-sm text-green-700">{case_.id.slice(-8)}</td>
                  <td className="py-3 px-4 text-sm text-green-700 capitalize">{case_.crop}</td>
                  <td className="py-3 px-4 text-sm text-green-700">{case_.disease}</td>
                  <td className="py-3 px-4 text-sm text-green-700">
                    {new Date(case_.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-green-700 uppercase">{case_.language}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      case_.confidence >= 80 
                        ? 'bg-green-100 text-green-800'
                        : case_.confidence >= 60
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {case_.confidence}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {adminCases.length === 0 && (
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 text-green-300 mx-auto mb-4" />
            <p className="text-green-600">No data available yet. Start by uploading some crop images!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;