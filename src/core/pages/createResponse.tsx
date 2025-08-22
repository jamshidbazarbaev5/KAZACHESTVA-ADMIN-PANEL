import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ResourceForm } from "../helpers/ResourceForm";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  type CreateResponsePayload,
  useCreateResponseCustom,
} from "../api/responses";
import { useGetAppeals } from "../api/appeals";

interface TranslationFunction {
  (key: string, options?: Record<string, unknown>): string;
}

const responseFields = (t: TranslationFunction, appeals: any[] = []) => [
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

export default function CreateResponsePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { mutate: createResponse, isPending: isCreating } =
    useCreateResponseCustom();

  // Fetch appeals for the dropdown
  const { data: appealsData } = useGetAppeals();
  const appeals = appealsData?.results || [];

  const fields = responseFields(t, appeals);

  const handleSubmit = (data: CreateResponsePayload) => {
    createResponse(data, {
      onSuccess: () => {
        toast.success(
          t("messages.success.created", {
            item: t("navigation.responses"),
          }),
        );
        navigate("/responses");
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
          {t("common.create")} {t("navigation.responses")}
        </h1>
      </div>

      <div>
        <div className="bg-white p-6 rounded-lg shadow">
          <ResourceForm
            fields={fields}
            onSubmit={handleSubmit}
            defaultValues={{}}
            isSubmitting={isCreating}
          />
        </div>
      </div>
    </div>
  );
}
