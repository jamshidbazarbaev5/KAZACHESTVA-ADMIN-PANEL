import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ResourceForm } from "../helpers/ResourceForm";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  type CreateStaffPayload,
  useCreateStaffCustom,
} from "../api/staff";

interface TranslationFunction {
  (key: string, options?: Record<string, unknown>): string;
}

const staffFields = (t: TranslationFunction) => [
  {
    name: "full_name",
    label: t("forms.full_name"),
    type: "text",
    placeholder: t("placeholders.enter_full_name"),
    required: true,
  },
  {
    name: "phone",
    label: t("forms.phone"),
    type: "text",
    placeholder: t("placeholders.enter_phone"),
    required: true,
  },
  {
    name: "email",
    label: t("forms.email"),
    type: "email",
    placeholder: t("placeholders.enter_email"),
    required: true,
  },
];

export default function CreateStaffPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { mutate: createStaff, isPending: isCreating } = useCreateStaffCustom();

  const fields = staffFields(t);

  const handleSubmit = (data: CreateStaffPayload) => {
    createStaff(data, {
      onSuccess: () => {
        toast.success(
          t("messages.success.created", {
            item: t("navigation.staff"),
          }),
        );
        navigate("/staff");
      },
      onError: () => {
        toast.error(
          t("messages.error.create", {
            item: t("navigation.staff"),
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
          onClick={() => navigate("/staff")}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          {t("common.back")}
        </Button>
        <h1 className="text-2xl font-bold">
          {t("common.create")} {t("navigation.staff")}
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
