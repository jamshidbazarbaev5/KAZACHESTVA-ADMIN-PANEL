import { useState } from "react";

import { useTranslation } from "react-i18next";
import { ResourceTable } from "../helpers/ResourseTable";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ResourceForm } from "../helpers/ResourceForm";
import { toast } from "sonner";
import { type Appeal, useGetAppeals, useUpdateAppeal } from "../api/appeals";

interface TranslationFunction {
  (key: string, options?: Record<string, unknown>): string;
}

const appealFields = (t: TranslationFunction) => [
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

const columns = (t: TranslationFunction) => [
  {
    header: t("forms.reference_number"),
    accessorKey: "reference_number",
  },
  {
    header: t("forms.sender_name"),
    accessorKey: "sender",
    cell: (row: Appeal) => row.sender.full_name,
  },
  {
    header: t("forms.sender_email"),
    accessorKey: "sender",
    cell: (row: Appeal) => row.sender.email,
  },
  {
    header: t("forms.sender_phone"),
    accessorKey: "sender",
    cell: (row: Appeal) => row.sender.phone,
  },
  {
    header: t("forms.category"),
    accessorKey: "category",
    cell: (row: Appeal) => row.category.name,
  },
  {
    header: t("forms.region"),
    accessorKey: "region",
  },
  {
    header: t("forms.status"),
    accessorKey: "status",
    cell: (row: Appeal) => {
      const statusColors = {
        Рассматривается: "bg-yellow-100 text-yellow-800",
        Принято: "bg-green-100 text-green-800",
        Отправлено: "bg-blue-100 text-blue-800",
        Отказано: "bg-red-100 text-red-800",
      };
      const colorClass =
        statusColors[row.status as keyof typeof statusColors] ||
        "bg-gray-100 text-gray-800";
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}
        >
          {row.status}
        </span>
      );
    },
  },
  {
    header: t("forms.created_at"),
    accessorKey: "created_at",
  },
];

export default function AppealsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAppeal, setEditingAppeal] = useState<Appeal | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { t } = useTranslation();
  const { data: appealsData, isLoading } = useGetAppeals({
    params: {
      // search: searchTerm,
      // status: statusFilter,
      // limit: pageSize,
      // offset: (currentPage - 1) * pageSize,
    },
  });

  const fields = appealFields(t);

  // Get the appeals array from the paginated response
  const appeals = appealsData?.results || [];
  const totalCount = appealsData?.count || 0;

  // Enhance appeals with display ID
  const enhancedAppeals = appeals.map((appeal: Appeal, index: number) => ({
    ...appeal,
    displayId: (currentPage - 1) * pageSize + index + 1,
  }));

  const { mutate: updateAppeal, isPending: isUpdating } = useUpdateAppeal();

  // const handleEdit = (appeal: Appeal) => {
  //   setEditingAppeal(appeal);
  //   setIsFormOpen(true);
  // };

  const handleUpdateSubmit = (data: Partial<Appeal>) => {
    if (!editingAppeal?.id) return;

    updateAppeal({ ...data, id: editingAppeal.id } as Appeal, {
      onSuccess: () => {
        toast.success(
          t("messages.success.updated", { item: t("navigation.appeals") }),
        );
        setIsFormOpen(false);
        setEditingAppeal(null);
      },
      onError: () =>
        toast.error(
          t("messages.error.update", { item: t("navigation.appeals") }),
        ),
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("navigation.appeals")}</h1>
      </div>

      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder={t("placeholders.search_appeals")}
          className="flex-1 p-2 border rounded"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset to first page when searching
          }}
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1); // Reset to first page when filtering
          }}
          className="p-2 border rounded min-w-[200px]"
        >
          <option value="">{t("placeholders.all_statuses")}</option>
          <option value="Рассматривается">Рассматривается</option>
          <option value="Принято">Принято</option>
          <option value="Отправлено">Отправлено</option>
          <option value="Отказано">Отказано</option>
        </select>
      </div>

      <ResourceTable
        data={enhancedAppeals}
        columns={columns(t)}
        isLoading={isLoading}
        // onEdit={handleEdit}
        // onDelete={handleDelete} // Uncomment if delete functionality is needed
        // onAdd={() => navigate('/create-appeal')} // Uncomment if create functionality is needed
        totalCount={totalCount}
        pageSize={pageSize}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <ResourceForm
            fields={fields}
            onSubmit={handleUpdateSubmit}
            defaultValues={editingAppeal || {}}
            isSubmitting={isUpdating}
            title={t("messages.edit")}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
