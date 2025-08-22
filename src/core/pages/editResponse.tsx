import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ResourceForm } from "../helpers/ResourceForm";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  type CreateResponsePayload,
  useGetResponse,
  useUpdateResponseCustom,
} from "../api/responses";
import { useGetAppeals } from "../api/appeals";
import { useEffect, useState } from "react";

interface TranslationFunction {
  (key: string, options?: Record<string, unknown>): string;
}

const responseFields = (
  t: TranslationFunction,
  appeals: Array<{
    id: number;
    reference_number: string;
    sender?: { full_name: string };
  }> = [],
) => [
  {
    name: "appeal",
    label: t("forms.appeal"),
    type: "select",
    options: appeals.map((appeal) => ({
      value: appeal.id,
      label: `${appeal.reference_number} - ${appeal.sender?.full_name || "Unknown"}`,
    })),
    placeholder: t("placeholders.select_appeal"),
    required: true,
  },
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
      { value: "Рассматривается", label: "Рассматривается" },
      { value: "Принято", label: "Принято" },
      { value: "Отправлено", label: "Отправлено" },
      { value: "Отказано", label: "Отказано" },
    ],
    placeholder: t("placeholders.select_status"),
    required: true,
  },
];

export default function EditResponsePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [defaultValues, setDefaultValues] = useState<
    Partial<CreateResponsePayload>
  >({});

  const responseId = id ? parseInt(id, 10) : 0;

  const { data: response, isLoading: isLoadingResponse } =
    useGetResponse(responseId);
  const { mutate: updateResponse, isPending: isUpdating } =
    useUpdateResponseCustom();

  // Fetch appeals for the dropdown
  const { data: appealsData } = useGetAppeals();
  const appeals = appealsData?.results || [];

  const fields = responseFields(t, appeals);

  // Set default values when response data is loaded
  useEffect(() => {
    if (response) {
      console.log("Response data:", response); // Debug log
      const newDefaultValues: Partial<CreateResponsePayload> = {
        appeal: response.appeal?.id || 0,
        text: response.text || "",
        status: response.appeal?.status || "Рассматривается",
      };
      console.log("Setting defaultValues:", newDefaultValues); // Debug log
      setDefaultValues(newDefaultValues);
    }
  }, [response]);

  const handleSubmit = (data: CreateResponsePayload) => {
    if (!responseId) return;

    // Ensure status is always included, default to "Рассматривается" if not provided
    const payload = {
      ...data,
      status: data.status || "Рассматривается",
      id: responseId,
    };

    updateResponse(payload, {
      onSuccess: () => {
        toast.success(
          t("messages.success.updated", {
            item: t("navigation.responses"),
          }),
        );
        navigate("/responses");
      },
      onError: () => {
        toast.error(
          t("messages.error.update", {
            item: t("navigation.responses"),
          }),
        );
      },
    });
  };

  if (isLoadingResponse) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-500">Response not found</div>
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
          onClick={() => navigate("/responses")}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          {t("common.back")}
        </Button>
        <h1 className="text-2xl font-bold">
          {t("messages.edit")} {t("navigation.responses")}
        </h1>
      </div>

      <div>
        <div className="bg-white p-6 rounded-lg shadow">
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
  );
}
