import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ResourceTable } from "../helpers/ResourseTable";
import { Button } from "@/components/ui/button";
import { Plus  } from "lucide-react";
import { type Response, useGetResponses } from "../api/responses";

interface TranslationFunction {
  (key: string, options?: Record<string, unknown>): string;
}

const columns = (t: TranslationFunction) => [
  {
    header: t("forms.reference_number"),
    accessorKey: "reference_number",
  },
  {
    header: t("forms.appeal_reference"),
    accessorKey: "appeal",
    cell: (row: Response) => row.appeal.reference_number,
  },
  {
    header: t("forms.response_text"),
    accessorKey: "text",
    cell: (row: Response) => (
      <div className="max-w-xs truncate" title={row.text}>
        {row.text}
      </div>
    ),
  },
  
];

export default function ResponsesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { t } = useTranslation();
  const navigate = useNavigate();

  // Fetch responses
  const { data: responsesData, isLoading } = useGetResponses({
    params: {},
  });

  // Get the responses array from the paginated response
  const responses = responsesData?.results || [];
  const totalCount = responsesData?.count || 0;

  // Enhance responses with display ID
  const enhancedResponses = responses.map(
    (response: Response, index: number) => ({
      ...response,
      displayId: (currentPage - 1) * pageSize + index + 1,
    }),
  );

  const handleAdd = () => {
    navigate("/create-response");
  };

  const handleEdit = (response: Response) => {
    navigate(`/edit-response/${response.id}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("navigation.responses")}</h1>
        <Button onClick={handleAdd} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {t("buttons.add_response")}
        </Button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder={t("placeholders.search_responses")}
          className="flex-1 max-w-md p-2 border rounded"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      <ResourceTable
        data={enhancedResponses}
        columns={columns(t)}
        isLoading={isLoading}
        onEdit={handleEdit}
        totalCount={totalCount}
        pageSize={pageSize}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
