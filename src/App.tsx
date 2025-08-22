import "./App.css";
import "./index.css";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LoginPage } from "./core/pages/login";
import { AuthProvider } from "./core/context/AuthContext";
import Layout from "./core/layout/layout";
import AppealsPage from "./core/pages/appeals";
import AppealCategoriesPage from "./core/pages/appealCategories";
import CreateAppealCategoryPage from "./core/pages/createAppealCategory";
import ResponsesPage from "./core/pages/responses";
import CreateResponsePage from "./core/pages/createResponse";
import EditResponsePage from "./core/pages/editResponse";
import { LanguageProvider } from "./core/context/LanguageContext";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
  <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes wrapped in Layout */}
          <Route
            element={
              <Layout>
                <Outlet />
              </Layout>
            }
          >
            {/* Routes accessible only by Администратор */}
            <Route path="/appeals" element={<AppealsPage />} />
            <Route
              path="/appeal-categories"
              element={<AppealCategoriesPage />}
            />
            <Route
              path="/create-appeal-category"
              element={<CreateAppealCategoryPage />}
            />
            <Route path="/responses" element={<ResponsesPage />} />
            <Route path="/create-response" element={<CreateResponsePage />} />
            <Route path="/edit-response/:id" element={<EditResponsePage />} />

            <Route path="/" element={<Navigate to="/appeals" />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
      </LanguageProvider>
    
    </QueryClientProvider>
  );
}

export default App;
