import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ResourceTable } from "../helpers/ResourseTable";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ResourceForm } from "../helpers/ResourceForm";
import { toast } from "sonner";
import {
  type Appeal,
  useGetAppeals,
  useUpdateAppeal,
  useGetAppealsDashboard,
} from "../api/appeals";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Edit,
  Download,
  MessageSquare,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
} from "lucide-react";
import api from "../api/api";

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

// Helper function to build API params, only including values that are truthy
const buildApiParams = (filters: {
  status?: string;
  referenceNumber?: string;
  createdAtFrom?: string;
  createdAtTo?: string;
  limit: number;
  offset: number;
}) => {
  const params: any = {
    limit: filters.limit,
    offset: filters.offset,
  };

  if (filters.status) {
    params.status = filters.status;
  }

  if (filters.referenceNumber) {
    params.reference_number = filters.referenceNumber;
  }

  if (filters.createdAtFrom) {
    params.created_at_from = filters.createdAtFrom;
  }

  if (filters.createdAtTo) {
    params.created_at_to = filters.createdAtTo;
  }

  return params;
};

export default function AppealsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAppeal, setEditingAppeal] = useState<Appeal | null>(null);
  const [_searchTerm, _setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [referenceFilter, setReferenceFilter] = useState("");
  const [createdAtFromFilter, setCreatedAtFromFilter] = useState("");
  const [createdAtToFilter, setCreatedAtToFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: dashboardData, isLoading: isDashboardLoading } =
    useGetAppealsDashboard();
  const { data: appealsData, isLoading } = useGetAppeals({
    params: buildApiParams({
      status: statusFilter,
      referenceNumber: referenceFilter,
      createdAtFrom: createdAtFromFilter,
      createdAtTo: createdAtToFilter,
      limit: pageSize,
      offset: (currentPage - 1) * pageSize,
    }),
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

  const handleEdit = (appeal: Appeal) => {
    navigate(`/edit-appeal/${appeal.id}`);
  };

  const handleAnswer = (appeal: Appeal) => {
    navigate(`/answer-appeal/${appeal.id}`);
  };

  const handleDownloadPdf = async (appeal: Appeal) => {
    try {
      const response = await api.get(`appeals/${appeal.id}/pdf`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `appeal-${appeal.reference_number || appeal.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(
        t("messages.success.downloaded", { item: "PDF" }) ||
          "PDF downloaded successfully",
      );
    } catch (error) {
      console.error("Download failed:", error);
      toast.error(
        t("messages.error.download", { item: "PDF" }) ||
          "Failed to download PDF",
      );
    }
  };

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

  // Custom dropdown component for actions
  const ActionsDropdown = ({ row }: { row: Appeal }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState<{
      top: number;
      left: number;
      position: "bottom" | "top";
    }>({
      top: 0,
      left: 0,
      position: "bottom",
    });
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const calculatePosition = () => {
      if (!buttonRef.current) return;

      const rect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      const dropdownHeight = 120; // Approximate height for our dropdown
      const spaceBelow = viewportHeight - rect.bottom - 10;
      const spaceAbove = rect.top - 10;

      const position =
        spaceBelow < dropdownHeight && spaceAbove > dropdownHeight
          ? "top"
          : "bottom";

      const dropdownWidth = 192;
      let left = rect.left;

      if (left + dropdownWidth > viewportWidth) {
        left = rect.right - dropdownWidth;
      }

      if (left < 10) {
        left = 10;
      }

      let top;
      if (position === "top") {
        top = rect.top - dropdownHeight;
      } else {
        top = rect.bottom + 4;
      }

      if (top < 10) {
        top = 10;
      }

      if (top + dropdownHeight > viewportHeight - 10) {
        top = viewportHeight - dropdownHeight - 10;
      }

      setDropdownPosition({ top, left, position });
    };

    const handleToggle = (event: React.MouseEvent) => {
      event.stopPropagation();
      if (!isOpen) {
        calculatePosition();
      }
      setIsOpen(!isOpen);
    };

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current &&
          !buttonRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
          document.removeEventListener("mousedown", handleClickOutside);
      }
    }, [isOpen]);

    return (
      <div className="relative">
        <Button
          ref={buttonRef}
          variant="ghost"
          size="sm"
          onClick={handleToggle}
          className="h-8 w-8 p-0"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>

        {isOpen &&
          createPortal(
            <div
              ref={dropdownRef}
              className="fixed z-[9999] w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1"
              style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                maxHeight: "300px",
                overflowY: "auto",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col">
                {/* Edit Button */}
                <button
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(row);
                    setIsOpen(false);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  {t("actions.edit")}
                </button>

                {/* Answer Button */}
                <button
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAnswer(row);
                    setIsOpen(false);
                  }}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  {t("actions.answer")}
                </button>

                {/* Download PDF Button */}
                <button
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadPdf(row);
                    setIsOpen(false);
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {t("actions.download")}
                </button>
              </div>
            </div>,
            document.body,
          )}
      </div>
    );
  };

  // Dashboard component for statistics
  const DashboardStats = () => {
    if (isDashboardLoading) {
      return (
        <div className="space-y-6 mb-6">
          {/* Total Appeals Card Skeleton */}
          <div className="bg-white p-6 rounded-lg shadow-lg border animate-pulse">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 bg-gray-200 rounded mb-2 w-24"></div>
                <div className="h-10 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
            </div>
          </div>

          {/* Status Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-lg shadow-sm border animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (!dashboardData?.appeal) return null;

    const getStatusIcon = (status: string) => {
      switch (status) {
        case "Отправлено":
          return <FileText className="h-6 w-6 text-blue-600" />;
        case "Принято":
          return <CheckCircle className="h-6 w-6 text-green-600" />;
        case "Отказано":
          return <XCircle className="h-6 w-6 text-red-600" />;
        case "Рассматривается":
          return <Clock className="h-6 w-6 text-yellow-600" />;
        default:
          return <FileText className="h-6 w-6 text-gray-600" />;
      }
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case "Отправлено":
          return "border-blue-200 bg-blue-50";
        case "Принято":
          return "border-green-200 bg-green-50";
        case "Отказано":
          return "border-red-200 bg-red-50";
        case "Рассматривается":
          return "border-yellow-200 bg-yellow-50";
        default:
          return "border-gray-200 bg-gray-50";
      }
    };

    return (
      <div className="space-y-6 mb-6">
        {/* Total Appeals Card */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-100">
                {t("common.total_appeals")}
              </p>
              <p className="text-4xl font-bold text-white">
                {dashboardData.total_appeal}
              </p>
            </div>
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-blue-200" />
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {dashboardData.appeal.map((stat) => (
            <div
              key={stat.status}
              className={`p-6 rounded-lg shadow-sm border-2 ${getStatusColor(stat.status)}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.status}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.total}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  {getStatusIcon(stat.status)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("navigation.appeals")}</h1>
      </div>

      {/* Dashboard Statistics */}
      <DashboardStats />

      <div className="mb-4 flex flex-col gap-4">
        <div className="flex gap-4">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
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
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Номер обращения"
            className="flex-1 p-2 border rounded"
            value={referenceFilter}
            onChange={(e) => {
              setReferenceFilter(e.target.value);
              setCurrentPage(1);
            }}
          />
          <input
            type="date"
            placeholder="Created At From"
            className="flex-1 p-2 border rounded"
            value={createdAtFromFilter}
            onChange={(e) => {
              setCreatedAtFromFilter(e.target.value);
              setCurrentPage(1);
            }}
          />
          <input
            type="date"
            placeholder="Created At To"
            className="flex-1 p-2 border rounded"
            value={createdAtToFilter}
            onChange={(e) => {
              setCreatedAtToFilter(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <ResourceTable
        data={enhancedAppeals}
        columns={columns(t)}
        isLoading={isLoading}
        actions={(appeal) => <ActionsDropdown row={appeal} />}
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
