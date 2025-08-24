import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ResourceTable } from "../helpers/ResourseTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { type Staff, useGetStaff, useDeleteStaffCustom } from "../api/staff";
import { toast } from "sonner";

interface TranslationFunction {
  (key: string, options?: Record<string, unknown>): string;
}

const columns = (t: TranslationFunction) => [
  {
    header: t("forms.full_name"),
    accessorKey: "full_name",
  },
  {
    header: t("forms.phone"),
    accessorKey: "phone",
  },
  {
    header: t("forms.email"),
    accessorKey: "email",
    cell: (row: Staff) => (
      <div className="max-w-xs truncate" title={row.email}>
        {row.email}
      </div>
    ),
  },
];

export default function StaffPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { t } = useTranslation();
  const navigate = useNavigate();

  // Fetch staff
  const { data: staffData, isLoading } = useGetStaff({
    params: {},
  });

  // Delete staff
  const { mutate: deleteStaff } = useDeleteStaffCustom();

  // Get the staff array from the paginated response
  const staff = staffData?.results || [];
  const totalCount = staffData?.count || 0;

  // Enhance staff with display ID
  const enhancedStaff = staff.map((staffMember: Staff, index: number) => ({
    ...staffMember,
    displayId: (currentPage - 1) * pageSize + index + 1,
  }));

  const handleAdd = () => {
    navigate("/create-staff");
  };

  const handleEdit = (staffMember: Staff) => {
    navigate(`/edit-staff/${staffMember.id}`);
  };

  const handleDelete = (id: number) => {
    deleteStaff(id, {
      onSuccess: () => {
        toast.success(
          t("messages.success.deleted", {
            item: t("navigation.staff"),
          }),
        );
      },
      onError: () => {
        toast.error(
          t("messages.error.delete", {
            item: t("navigation.staff"),
          }),
        );
      },
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("navigation.staff")}</h1>
        <Button onClick={handleAdd} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {t("buttons.add_staff")}
        </Button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder={t("placeholders.search_staff")}
          className="flex-1 max-w-md p-2 border rounded"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      <ResourceTable
        data={enhancedStaff}
        columns={columns(t)}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        totalCount={totalCount}
        pageSize={pageSize}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
