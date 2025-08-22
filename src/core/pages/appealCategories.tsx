import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ResourceTable } from "../helpers/ResourseTable";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ResourceForm } from "../helpers/ResourceForm";
import { toast } from "sonner";
import {
  type AppealCategory,
  useGetAppealCategories,
  useUpdateAppealCategory,
  useDeleteAppealCategory,
} from "../api/appealCategories";

const appealCategoryFields = (t: (key: string) => string) => [
  {
    name: "name",
    label: t("forms.category_name"),
    type: "text",
    placeholder: t("placeholders.enter_name"),
    required: true,
  },
];

const columns = (t: (key: string) => string) => [
  {
    header: t("forms.category_name"),
    accessorKey: "name",
  },
  {
    header: t("forms.created_at"),
    accessorKey: "created_at",
  },
];

export default function AppealCategoriesPage() {
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AppealCategory | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const { t } = useTranslation();
  const { data: categoriesData, isLoading } = useGetAppealCategories({
    params: {
      name: searchTerm,
    },
  });

  const fields = appealCategoryFields(t);

  // Get the categories array from the direct response
  const categories = categoriesData || [];

  // Enhance categories with display ID
  const enhancedCategories = categories.map(
    (category: AppealCategory, index: number) => ({
      ...category,
      displayId: index + 1,
    }),
  );

  const { mutate: updateCategory, isPending: isUpdating } =
    useUpdateAppealCategory();
  const { mutate: deleteCategory } = useDeleteAppealCategory();

  const handleEdit = (category: AppealCategory) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleUpdateSubmit = (data: Partial<AppealCategory>) => {
    if (!editingCategory?.id) return;

    updateCategory({ ...data, id: editingCategory.id } as AppealCategory, {
      onSuccess: () => {
        toast.success(
          t("messages.success.updated", {
            item: t("navigation.appeal_categories"),
          }),
        );
        setIsFormOpen(false);
        setEditingCategory(null);
      },
      onError: () =>
        toast.error(
          t("messages.error.update", {
            item: t("navigation.appeal_categories"),
          }),
        ),
    });
  };

  const handleDelete = (id: number) => {
    deleteCategory(id, {
      onSuccess: () =>
        toast.success(
          t("messages.success.deleted", {
            item: t("navigation.appeal_categories"),
          }),
        ),
      onError: () =>
        toast.error(
          t("messages.error.delete", {
            item: t("navigation.appeal_categories"),
          }),
        ),
    });
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {t("navigation.appeal_categories")}
        </h1>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder={t("placeholders.search_appeal_category")}
          className="w-full p-2 border rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <ResourceTable
        data={enhancedCategories}
        columns={columns(t)}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={() => navigate("/create-appeal-category")}
        totalCount={enhancedCategories.length}
        pageSize={30}
        currentPage={1}
        onPageChange={() => {}}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <ResourceForm
            fields={fields}
            onSubmit={handleUpdateSubmit}
            defaultValues={editingCategory || {}}
            isSubmitting={isUpdating}
            title={t("messages.edit")}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
