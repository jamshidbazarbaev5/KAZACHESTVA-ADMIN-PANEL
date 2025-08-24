import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ResourceForm } from "../helpers/ResourceForm";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, FileText, User, Phone, Mail, MapPin } from "lucide-react";
import {
  type Appeal,
  useGetAppeal,
  useUpdateAppeal,
} from "../api/appeals";
import { useEffect, useState } from "react";

interface TranslationFunction {
  (key: string, options?: Record<string, unknown>): string;
}

const appealEditFields = (t: TranslationFunction) => [
  {
    name: "status",
    label: t("forms.status"),
    type: "select",
    options: [
      { value: "Рассматривается", label: "Рассматривается" },
      { value: "Принято", label: "Принято" },
      { value: "Отправлено", label: "Отправлено" },
      { value: "Отказано", label: "Отказано" },
    ],
    placeholder: t("placeholders.select_status"),
    required: true,
  },
  {
    name: "region",
    label: t("forms.region"),
    type: "text",
    placeholder: t("placeholders.enter_region"),
    required: false,
  },
];

export default function EditAppealPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [defaultValues, setDefaultValues] = useState<Partial<Appeal>>({});

  const appealId = id ? parseInt(id, 10) : 0;

  const { data: appeal, isLoading: isLoadingAppeal, error } = useGetAppeal(appealId);
  const { mutate: updateAppeal, isPending: isUpdating } = useUpdateAppeal();

  const fields = appealEditFields(t);

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

  const handleSubmit = (data: Partial<Appeal>) => {
    if (!appealId) return;

    const payload = {
      ...data,
      id: appealId,
    };

    updateAppeal(payload as Appeal, {
      onSuccess: () => {
        toast.success(
          t("messages.success.updated", {
            item: t("navigation.appeals"),
          }),
        );
        navigate("/appeals");
      },
      onError: () => {
        toast.error(
          t("messages.error.update", {
            item: t("navigation.appeals"),
          }),
        );
      },
    });
  };

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
              Appeal Information
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
                  Sender Quantity
                </label>
                <p className="text-gray-900">{appeal.sender_quantity}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Status
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
            <h2 className="text-lg font-semibold mb-4">Appeal Text</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-900 whitespace-pre-wrap">{appeal.text}</p>
            </div>
          </div>

          {/* Appeal Files */}
          {appeal.appeal_files && appeal.appeal_files.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Attached Files</h2>
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
                      View/Download
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
                    Status: {appeal.appeal_response.status}
                  </span>
                </div>
                <div className="mb-2">
                  <span className="text-sm text-blue-600">
                    Created: {appeal.appeal_response.created_at}
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
              Sender Information
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
                  <p className="text-sm text-gray-600">Address:</p>
                  <p className="text-gray-900">{appeal.sender.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Sender Region:</p>
                  <p className="text-gray-900">{appeal.sender.region}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Edit Appeal</h2>
            <ResourceForm
              fields={fields}
              onSubmit={handleSubmit}
              defaultValues={defaultValues}
              isSubmitting={isUpdating}
              key={JSON.stringify(defaultValues)} // Force re-render when defaultValues change
            />
          </div>
        </div>
      </div>
    </div>
  );
}
