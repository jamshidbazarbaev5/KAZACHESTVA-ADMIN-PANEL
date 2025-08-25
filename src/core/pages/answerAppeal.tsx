import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ResourceForm } from "../helpers/ResourceForm";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  type CreateResponsePayload,
  useCreateResponseWithFiles,
} from "../api/responses";
import { useGetAppeal } from "../api/appeals";
import { useGetStaff } from "../api/staff";
import { format, isValid, parseISO } from "date-fns";

const API_BASE_URL = "https://eappeal.uz";

interface TranslationFunction {
  (key: string, options?: Record<string, unknown>): string;
}

const getFullFileUrl = (relativePath: string): string => {
  if (relativePath.startsWith("http")) {
    return relativePath; // Already a full URL
  }
  return `${API_BASE_URL}${relativePath}`;
};

const formatSafeDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "N/A";

  // Check if it's already in DD/MM/YYYY HH:MM format
  const preFormattedRegex = /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/;
  if (preFormattedRegex.test(dateString)) {
    return dateString;
  }

  try {
    const date = new Date(dateString);
    if (isValid(date)) {
      return format(date, "dd/MM/yyyy HH:mm");
    }
    // Try parsing as ISO string if direct parsing fails
    const isoDate = parseISO(dateString);
    if (isValid(isoDate)) {
      return format(isoDate, "dd/MM/yyyy HH:mm");
    }
    return "Invalid Date";
  } catch {
    return "Invalid Date";
  }
};

const responseFields = (
  t: TranslationFunction,
  staffOptions: { value: number; label: string }[],
) => [
  {
    name: "text",
    label: t("forms.response_text"),
    type: "textarea",
    placeholder: t("placeholders.enter_response_text"),
    required: true,
  },
  {
    name: "status",
    label: t("forms.status"),
    type: "select",
    options: [
      { value: "Принято", label: "Принято" },
      { value: "Отказано", label: "Отказано" },
    ],
    placeholder: t("placeholders.select_status"),
    required: true,
  },
  {
    name: "answerer",
    label: t("forms.answerer"),
    type: "select",
    options: staffOptions,
    placeholder: t("placeholders.select_answerer"),
    required: true,
  },
  {
    name: "files",
    label: t("forms.attached_files"),
    type: "multiple-files",
    required: false,
  },
];

export default function AnswerAppealPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { mutate: createResponse, isPending: isCreating } =
    useCreateResponseWithFiles();

  // Fetch the specific appeal
  const { data: appeal, isLoading: isLoadingAppeal } = useGetAppeal(
    id ? parseInt(id) : 0,
  );

  // Fetch staff for the answerer select field
  const { data: staffResponse, isLoading: isLoadingStaff } = useGetStaff({
    params: {},
  });

  // Prepare staff options for the select field
  const staffOptions =
    staffResponse?.results?.map((staff) => ({
      value: staff.id,
      label: staff.full_name,
    })) || [];

  const fields = responseFields(t, staffOptions);

  const handleSubmit = (
    data: Omit<CreateResponsePayload, "appeal"> & { files?: File[] },
  ) => {
    if (!appeal?.id) return;

    const payload: CreateResponsePayload & { files?: File[] } = {
      appeal: appeal.id,
      text: data.text,
      status: data.status,
      answerer:
        typeof data.answerer === "string"
          ? parseInt(data.answerer)
          : data.answerer,
      files: data.files || [],
    };

    createResponse(payload, {
      onSuccess: () => {
        toast.success(
          t("messages.success.created", {
            item: t("navigation.responses"),
          }),
        );
        navigate("/appeals");
      },
      onError: () => {
        toast.error(
          t("messages.error.create", {
            item: t("navigation.responses"),
          }),
        );
      },
    });
  };

  if (isLoadingAppeal || isLoadingStaff) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">{t("common.loading")}...</div>
        </div>
      </div>
    );
  }

  if (!appeal) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">
            {t("messages.error.not_found", { item: t("navigation.appeals") })}
          </div>
        </div>
      </div>
    );
  }

  const statusColors = {
    Рассматривается: "bg-yellow-100 text-yellow-800",
    Принято: "bg-green-100 text-green-800",
    Отправлено: "bg-blue-100 text-blue-800",
    Отказано: "bg-red-100 text-red-800",
  };

  const statusColor =
    statusColors[appeal.status as keyof typeof statusColors] ||
    "bg-gray-100 text-gray-800";

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
          {t("common.answer")} {t("navigation.appeals")}
        </h1>
      </div>

      {/* Appeal Details Section */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">
          {t("forms.appeal")} {t("messages.details")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("forms.reference_number")}
            </label>
            <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
              {appeal.reference_number}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("forms.status")}
            </label>
            <span
              className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}
            >
              {appeal.status}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("forms.sender_name")}
            </label>
            <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
              {appeal.sender.full_name}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("forms.sender_email")}
            </label>
            <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
              {appeal.sender.email}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("forms.sender_phone")}
            </label>
            <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
              {appeal.sender.phone}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("forms.region")}
            </label>
            <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
              {appeal.region || appeal.sender.region || "N/A"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("forms.category")}
            </label>
            <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
              {appeal.category.name}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("forms.created_at")}
            </label>
            <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
              {formatSafeDate(appeal.created_at)}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("forms.appeal_text")}
          </label>
          <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded min-h-[100px] whitespace-pre-wrap">
            {appeal.text}
          </div>
        </div>

        {/* Appeal Files Section */}
        {appeal.appeal_files && appeal.appeal_files.length > 0 && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("forms.attached_files")} ({appeal.appeal_files.length})
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {appeal.appeal_files.map((file) => (
                <div key={file.id} className="bg-gray-50 p-3 rounded border">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="text-xs text-gray-600 truncate">
                      {file.file.split("/").pop()}
                    </span>
                  </div>
                  <a
                    href={getFullFileUrl(file.file)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    {t("forms.view_file")}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Show existing response if any */}
        {appeal.appeal_response && (
          <div className="mt-4 border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t("messages.existing_response")}
            </h3>
            <div className="bg-blue-50 p-3 rounded">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-blue-900">
                  Status: {appeal.appeal_response.status}
                </span>
                <span className="text-xs text-blue-700">
                  {formatSafeDate(appeal.appeal_response.created_at)}
                </span>
              </div>
              <p className="text-sm text-blue-800 whitespace-pre-wrap">
                {appeal.appeal_response.text}
              </p>
              {/* Response Files Section */}
              {appeal.appeal_response.response_files &&
                appeal.appeal_response.response_files.length > 0 && (
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-blue-700 mb-1">
                      {t("forms.attached_files")} (
                      {appeal.appeal_response.response_files.length})
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {appeal.appeal_response.response_files.map((file) => (
                        <div
                          key={file.id}
                          className="bg-blue-100 p-2 rounded border"
                        >
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-3 h-3 text-blue-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            <span className="text-xs text-blue-700 truncate">
                              {file.file.split("/").pop()}
                            </span>
                          </div>
                          <a
                            href={getFullFileUrl(file.file)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-block text-xs text-blue-700 hover:text-blue-900 underline"
                          >
                            {t("forms.view_file")}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        )}
      </div>

      {/* Response Form Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">
          {appeal.appeal_response ? t("common.update") : t("common.create")}{" "}
          {t("navigation.responses")}
        </h2>
        <ResourceForm
          fields={fields}
          onSubmit={handleSubmit}
          defaultValues={
            appeal.appeal_response
              ? {
                  text: appeal.appeal_response.text,
                  status: appeal.appeal_response.status,
                  answerer: appeal.appeal_response.answerer || undefined,
                  files: [],
                }
              : {
                  files: [],
                }
          }
          isSubmitting={isCreating}
        />
      </div>
    </div>
  );
}
