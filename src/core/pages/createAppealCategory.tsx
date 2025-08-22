import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ResourceForm } from "../helpers/ResourceForm";
import { toast } from "sonner";
import {
  type AppealCategory,
  useCreateAppealCategory,
} from "../api/appealCategories";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const appealCategoryFields = (t: (key: string) => string) => [
  {
    name: "name",
    label: t("forms.category_name"),
    type: "text",
    placeholder: t("placeholders.enter_name"),
    required: true,
  },
];

export default function CreateAppealCategoryPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { mutate: createCategory, isPending: isCreating } =
    useCreateAppealCategory();

  const fields = appealCategoryFields(t);

  const handleSubmit = (data: Partial<AppealCategory>) => {
    createCategory(
      { name: data.name! },
      {
        onSuccess: () => {
          toast.success(
            t("messages.success.created", {
              item: t("navigation.appeal_categories"),
            }),
          );
          navigate("/appeal-categories");
        },
        onError: () => {
          toast.error(
            t("messages.error.create", {
              item: t("navigation.appeal_categories"),
            }),
          );
        },
      },
    );
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/appeal-categories")}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          {t("common.back")}
        </Button>
        <h1 className="text-2xl font-bold">
          {t("common.create")} {t("navigation.appeal_categories")}
        </h1>
      </div>

      <div>
        <div className="bg-white p-6 rounded-lg shadow">
          <ResourceForm
            fields={fields}
            onSubmit={handleSubmit}
            defaultValues={{}}
            isSubmitting={isCreating}
            title={t("common.create")}
          />
        </div>
      </div>
    </div>
  );
}
