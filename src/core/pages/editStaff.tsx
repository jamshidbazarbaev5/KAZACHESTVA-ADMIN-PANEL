import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ResourceForm } from "../helpers/ResourceForm";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  type UpdateStaffPayload,
  useGetStaffMember,
  useUpdateStaffCustom,
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

export default function EditStaffPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const staffId = parseInt(id || "0", 10);

  const { data: staffMember, isLoading: isLoadingStaff } = useGetStaffMember(staffId);
  const { mutate: updateStaff, isPending: isUpdating } = useUpdateStaffCustom();

  const fields = staffFields(t);

  const handleSubmit = (data: UpdateStaffPayload) => {
    if (!staffId) return;

    updateStaff(
      { id: staffId, ...data },
      {
        onSuccess: () => {
          toast.success(
            t("messages.success.updated", {
              item: t("navigation.staff"),
            }),
          );
          navigate("/staff");
        },
        onError: () => {
          toast.error(
            t("messages.error.update", {
              item: t("navigation.staff"),
            }),
          );
        },
      },
    );
  };

  if (isLoadingStaff) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!staffMember) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center">
          <p>Staff member not found</p>
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
          onClick={() => navigate("/staff")}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          {t("common.back")}
        </Button>
        <h1 className="text-2xl font-bold">
          {t("common.edit")} {t("navigation.staff")}
        </h1>
      </div>

      <div>
        <div className="bg-white p-6 rounded-lg shadow">
          <ResourceForm
            fields={fields}
            onSubmit={handleSubmit}
            defaultValues={{
              full_name: staffMember.full_name,
              phone: staffMember.phone,
              email: staffMember.email,
            }}
            isSubmitting={isUpdating}
          />
        </div>
      </div>
    </div>
  );
}
