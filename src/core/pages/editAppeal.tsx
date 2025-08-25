import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, FileText, User, Phone, Mail, MapPin } from "lucide-react";
import {
  type Appeal,
  useGetAppeal,
} from "../api/appeals";
import { useEffect, useState } from "react";



export default function EditAppealPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [_defaultValues, setDefaultValues] = useState<Partial<Appeal>>({});

  const appealId = id ? parseInt(id, 10) : 0;

  const { data: appeal, isLoading: isLoadingAppeal, error } = useGetAppeal(appealId);

  // const _fields = appealEditFields(t);

  // Set default values when appeal data is loaded
  useEffect(() => {
    if (appeal) {
      const newDefaultValues: Partial<Appeal> = {
        status: appeal.status,
        region: appeal.region || "",
      };
      setDefaultValues(newDefaultValues);
    }
  }, [appeal]);

  

  const getStatusColor = (status: string) => {
    const statusColors = {
      Рассматривается: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Принято: "bg-green-100 text-green-800 border-green-200",
      Отправлено: "bg-blue-100 text-blue-800 border-blue-200",
      Отказано: "bg-red-100 text-red-800 border-red-200",
    };
    return statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const handleFileDownload = (fileUrl: string) => {
    // Create full URL if it's a relative path
    const fullUrl = fileUrl.startsWith('http') ? fileUrl : `https://eappeal.uz${fileUrl}`;
    window.open(fullUrl, '_blank');
  };

  if (isLoadingAppeal) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !appeal) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-500">Appeal not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/appeals")}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          {t("common.back")}
        </Button>
        <h1 className="text-2xl font-bold">
          {t("messages.edit")} {t("navigation.appeals")}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appeal Details - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText size={20} />
                {t('forms.appeal_information')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("forms.reference_number")}
                </label>
                <p className="text-gray-900 font-mono bg-gray-50 p-2 rounded">
                  {appeal.reference_number}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("forms.created_at")}
                </label>
                <p className="text-gray-900">{appeal.created_at}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("forms.category")}
                </label>
                <p className="text-gray-900">{appeal.category.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('forms.sender_quantity')}
                </label>
                <p className="text-gray-900">{appeal.sender_quantity}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
               {t('forms.status')}
                </label>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(appeal.status)}`}
                >
                  {appeal.status}
                </span>
              </div>
            </div>
          </div>

          {/* Appeal Text */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">{t('forms.appeal_text')}</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-900 whitespace-pre-wrap">{appeal.text}</p>
            </div>
          </div>

          {/* Appeal Files */}
          {appeal.appeal_files && appeal.appeal_files.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">{t('forms.files')}</h2>
              <div className="space-y-2">
                {appeal.appeal_files.map((file, index) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText size={20} className="text-gray-500" />
                      <span className="text-gray-900">
                        File {index + 1} - {file.file.split('/').pop()}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFileDownload(file.file)}
                      className="flex items-center gap-2"
                    >
                      <Download size={16} />
                      {t('forms.download')}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Appeal Response */}
          {appeal.appeal_response && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Response</h2>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="mb-2">
                  <span className="text-sm font-medium text-blue-800">
                    {t('forms.status')}: {appeal.appeal_response.status}
                  </span>
                </div>
                <div className="mb-2">
                  <span className="text-sm text-blue-600">
                    {t('forms.created_at')}: {appeal.appeal_response.created_at}
                  </span>
                </div>
                <p className="text-blue-900">{appeal.appeal_response.text}</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Sender Info and Edit Form */}
        <div className="space-y-6">
          {/* Sender Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User size={20} />
             {t('forms.sender')}
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User size={16} className="text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">{appeal.sender.full_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-gray-500" />
                <div>
                  <p className="text-gray-900">{appeal.sender.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-gray-500" />
                <div>
                  <p className="text-gray-900">{appeal.sender.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Адрес:</p>
                  <p className="text-gray-900">{appeal.sender.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Район:</p>
                  <p className="text-gray-900">{appeal.sender.region}</p>
                </div>
              </div>
            </div>
          </div>

       
        </div>
      </div>
    </div>
  );
}
