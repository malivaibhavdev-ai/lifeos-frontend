import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RootLayout } from './RootLayout';
import { RouteErrorBoundary } from './RouteErrorBoundary';
import { RequireAuth, RedirectIfAuthed } from './guards';
import { AppShellLayout } from './AppShellLayout';
import { AuthLayout } from './AuthLayout';
import { PlaceholderScreen } from '../components/ui/PlaceholderScreen';
import { MODULES } from '../constants/modules';

// Every route-level screen is code-split via React.lazy — each module only
// downloads when a user actually navigates into it, instead of the whole
// app shipping as one bundle. AppShellLayout/AuthLayout wrap their <Outlet/>
// in a single <Suspense>, so there's one shared loading fallback rather than
// one per route.
const DashboardScreen = lazy(() => import('../modules/Dashboard/screens/DashboardScreen').then((m) => ({ default: m.DashboardScreen })));
const TaskWorkspaceScreen = lazy(() => import('../modules/Tasks/screens/TaskWorkspaceScreen').then((m) => ({ default: m.TaskWorkspaceScreen })));
const TaskDetailScreen = lazy(() => import('../modules/Tasks/screens/TaskDetailScreen').then((m) => ({ default: m.TaskDetailScreen })));
const CalendarWorkspaceScreen = lazy(() => import('../modules/Calendar/screens/CalendarWorkspaceScreen').then((m) => ({ default: m.CalendarWorkspaceScreen })));
const HabitsWorkspaceScreen = lazy(() => import('../modules/Habits/screens/HabitsWorkspaceScreen').then((m) => ({ default: m.HabitsWorkspaceScreen })));
const HabitDetailScreen = lazy(() => import('../modules/Habits/screens/HabitDetailScreen').then((m) => ({ default: m.HabitDetailScreen })));
const RoutineDetailScreen = lazy(() => import('../modules/Habits/screens/RoutineDetailScreen').then((m) => ({ default: m.RoutineDetailScreen })));
const GoalsWorkspaceScreen = lazy(() => import('../modules/Goals/screens/GoalsWorkspaceScreen').then((m) => ({ default: m.GoalsWorkspaceScreen })));
const GoalDetailScreen = lazy(() => import('../modules/Goals/screens/GoalDetailScreen').then((m) => ({ default: m.GoalDetailScreen })));
const ProjectDetailScreen = lazy(() => import('../modules/Goals/screens/ProjectDetailScreen').then((m) => ({ default: m.ProjectDetailScreen })));
const RoadmapScreen = lazy(() => import('../modules/Goals/screens/RoadmapScreen').then((m) => ({ default: m.RoadmapScreen })));
const NotesWorkspaceScreen = lazy(() => import('../modules/Notes/screens/NotesWorkspaceScreen').then((m) => ({ default: m.NotesWorkspaceScreen })));
const NoteEditorScreen = lazy(() => import('../modules/Notes/screens/NoteEditorScreen').then((m) => ({ default: m.NoteEditorScreen })));
const DailyNoteScreen = lazy(() => import('../modules/Notes/screens/DailyNoteScreen').then((m) => ({ default: m.DailyNoteScreen })));
const SearchScreen = lazy(() => import('../modules/Notes/screens/SearchScreen').then((m) => ({ default: m.SearchScreen })));
const LoginScreen = lazy(() => import('../modules/Auth/screens/LoginScreen').then((m) => ({ default: m.LoginScreen })));
const RegisterScreen = lazy(() => import('../modules/Auth/screens/RegisterScreen').then((m) => ({ default: m.RegisterScreen })));
const ForgotPasswordScreen = lazy(() => import('../modules/Auth/screens/ForgotPasswordScreen').then((m) => ({ default: m.ForgotPasswordScreen })));
const ResetPasswordScreen = lazy(() => import('../modules/Auth/screens/ResetPasswordScreen').then((m) => ({ default: m.ResetPasswordScreen })));
const HealthHubScreen = lazy(() => import('../modules/Health/screens/HealthHubScreen').then((m) => ({ default: m.HealthHubScreen })));
const WaterScreen = lazy(() => import('../modules/Health/screens/WaterScreen').then((m) => ({ default: m.WaterScreen })));
const WeightScreen = lazy(() => import('../modules/Health/screens/WeightScreen').then((m) => ({ default: m.WeightScreen })));
const MoodScreen = lazy(() => import('../modules/Health/screens/MoodScreen').then((m) => ({ default: m.MoodScreen })));
const VitalsScreen = lazy(() => import('../modules/Health/screens/VitalsScreen').then((m) => ({ default: m.VitalsScreen })));
const BodyMeasurementsScreen = lazy(() => import('../modules/Health/screens/BodyMeasurementsScreen').then((m) => ({ default: m.BodyMeasurementsScreen })));
const NutritionScreen = lazy(() => import('../modules/Health/screens/NutritionScreen').then((m) => ({ default: m.NutritionScreen })));
const MeditationScreen = lazy(() => import('../modules/Health/screens/MeditationScreen').then((m) => ({ default: m.MeditationScreen })));
const MedicineScreen = lazy(() => import('../modules/Health/screens/MedicineScreen').then((m) => ({ default: m.MedicineScreen })));
const SleepLogScreen = lazy(() => import('../modules/Sleep/screens/SleepLogScreen').then((m) => ({ default: m.SleepLogScreen })));
const SleepScheduleScreen = lazy(() => import('../modules/Sleep/screens/SleepScheduleScreen').then((m) => ({ default: m.SleepScheduleScreen })));
const WorkoutLogScreen = lazy(() => import('../modules/Workout/screens/WorkoutLogScreen').then((m) => ({ default: m.WorkoutLogScreen })));
const WorkoutTemplatesScreen = lazy(() => import('../modules/Workout/screens/WorkoutTemplatesScreen').then((m) => ({ default: m.WorkoutTemplatesScreen })));
const FinanceHubScreen = lazy(() => import('../modules/Finance/screens/FinanceHubScreen').then((m) => ({ default: m.FinanceHubScreen })));
const AccountsScreen = lazy(() => import('../modules/Finance/screens/AccountsScreen').then((m) => ({ default: m.AccountsScreen })));
const TransactionsScreen = lazy(() => import('../modules/Finance/screens/TransactionsScreen').then((m) => ({ default: m.TransactionsScreen })));
const CategoriesScreen = lazy(() => import('../modules/Finance/screens/CategoriesScreen').then((m) => ({ default: m.CategoriesScreen })));
const BudgetsScreen = lazy(() => import('../modules/Finance/screens/BudgetsScreen').then((m) => ({ default: m.BudgetsScreen })));
const BillsScreen = lazy(() => import('../modules/Finance/screens/BillsScreen').then((m) => ({ default: m.BillsScreen })));
const DebtsScreen = lazy(() => import('../modules/Finance/screens/DebtsScreen').then((m) => ({ default: m.DebtsScreen })));
const DebtDetailScreen = lazy(() => import('../modules/Finance/screens/DebtDetailScreen').then((m) => ({ default: m.DebtDetailScreen })));
const NetWorthScreen = lazy(() => import('../modules/Finance/screens/NetWorthScreen').then((m) => ({ default: m.NetWorthScreen })));
const FinanceSettingsScreen = lazy(() => import('../modules/Finance/screens/FinanceSettingsScreen').then((m) => ({ default: m.FinanceSettingsScreen })));
const PortfoliosScreen = lazy(() => import('../modules/Investments/screens/PortfoliosScreen').then((m) => ({ default: m.PortfoliosScreen })));
const PortfolioDetailScreen = lazy(() => import('../modules/Investments/screens/PortfolioDetailScreen').then((m) => ({ default: m.PortfolioDetailScreen })));
const AssetsScreen = lazy(() => import('../modules/Investments/screens/AssetsScreen').then((m) => ({ default: m.AssetsScreen })));
const InvestmentTransactionsScreen = lazy(() => import('../modules/Investments/screens/InvestmentTransactionsScreen').then((m) => ({ default: m.InvestmentTransactionsScreen })));
const AllocationScreen = lazy(() => import('../modules/Investments/screens/AllocationScreen').then((m) => ({ default: m.AllocationScreen })));
const SipPlansScreen = lazy(() => import('../modules/Investments/screens/SipPlansScreen').then((m) => ({ default: m.SipPlansScreen })));
const CareerHubScreen = lazy(() => import('../modules/Career/screens/CareerHubScreen').then((m) => ({ default: m.CareerHubScreen })));
const CareerProfileScreen = lazy(() => import('../modules/Career/screens/CareerProfileScreen').then((m) => ({ default: m.CareerProfileScreen })));
const WorkHistoryScreen = lazy(() => import('../modules/Career/screens/WorkHistoryScreen').then((m) => ({ default: m.WorkHistoryScreen })));
const EducationScreen = lazy(() => import('../modules/Career/screens/EducationScreen').then((m) => ({ default: m.EducationScreen })));
const SkillsScreen = lazy(() => import('../modules/Career/screens/SkillsScreen').then((m) => ({ default: m.SkillsScreen })));
const LearningScreen = lazy(() => import('../modules/Career/screens/LearningScreen').then((m) => ({ default: m.LearningScreen })));
const CertificationsScreen = lazy(() => import('../modules/Career/screens/CertificationsScreen').then((m) => ({ default: m.CertificationsScreen })));
const JobApplicationsScreen = lazy(() => import('../modules/Career/screens/JobApplicationsScreen').then((m) => ({ default: m.JobApplicationsScreen })));
const InterviewsScreen = lazy(() => import('../modules/Career/screens/InterviewsScreen').then((m) => ({ default: m.InterviewsScreen })));
const ResumesScreen = lazy(() => import('../modules/Career/screens/ResumesScreen').then((m) => ({ default: m.ResumesScreen })));
const PortfolioScreen = lazy(() => import('../modules/Career/screens/PortfolioScreen').then((m) => ({ default: m.PortfolioScreen })));
const PerformanceReviewsScreen = lazy(() => import('../modules/Career/screens/PerformanceReviewsScreen').then((m) => ({ default: m.PerformanceReviewsScreen })));
const SalaryScreen = lazy(() => import('../modules/Career/screens/SalaryScreen').then((m) => ({ default: m.SalaryScreen })));
const ContactsScreen = lazy(() => import('../modules/Career/screens/ContactsScreen').then((m) => ({ default: m.ContactsScreen })));
const CareerDocumentsScreen = lazy(() => import('../modules/Career/screens/CareerDocumentsScreen').then((m) => ({ default: m.CareerDocumentsScreen })));
const CareerTimelineScreen = lazy(() => import('../modules/Career/screens/CareerTimelineScreen').then((m) => ({ default: m.CareerTimelineScreen })));
const FocusScreen = lazy(() => import('../modules/Focus/screens/FocusScreen').then((m) => ({ default: m.FocusScreen })));
const FocusHistoryScreen = lazy(() => import('../modules/Focus/screens/FocusHistoryScreen').then((m) => ({ default: m.FocusHistoryScreen })));
const DreamsWorkspaceScreen = lazy(() => import('../modules/Dreams/screens/DreamsWorkspaceScreen').then((m) => ({ default: m.DreamsWorkspaceScreen })));
const DreamDetailScreen = lazy(() => import('../modules/Dreams/screens/DreamDetailScreen').then((m) => ({ default: m.DreamDetailScreen })));
const DreamEntryFormScreen = lazy(() => import('../modules/Dreams/screens/DreamEntryFormScreen').then((m) => ({ default: m.DreamEntryFormScreen })));
const DreamCalendarScreen = lazy(() => import('../modules/Dreams/screens/DreamCalendarScreen').then((m) => ({ default: m.DreamCalendarScreen })));
const DreamAnalyticsScreen = lazy(() => import('../modules/Dreams/screens/DreamAnalyticsScreen').then((m) => ({ default: m.DreamAnalyticsScreen })));
const DreamSettingsScreen = lazy(() => import('../modules/Dreams/screens/DreamSettingsScreen').then((m) => ({ default: m.DreamSettingsScreen })));
const DreamRegistryScreen = lazy(() => import('../modules/Dreams/screens/DreamRegistryScreen').then((m) => ({ default: m.DreamRegistryScreen })));
const FamilyHubScreen = lazy(() => import('../modules/Family/screens/FamilyHubScreen').then((m) => ({ default: m.FamilyHubScreen })));
const HouseholdSettingsScreen = lazy(() => import('../modules/Family/screens/HouseholdSettingsScreen').then((m) => ({ default: m.HouseholdSettingsScreen })));
const FamilyMembersScreen = lazy(() => import('../modules/Family/screens/FamilyMembersScreen').then((m) => ({ default: m.FamilyMembersScreen })));
const FamilyMemberDetailScreen = lazy(() => import('../modules/Family/screens/FamilyMemberDetailScreen').then((m) => ({ default: m.FamilyMemberDetailScreen })));
const FamilyMemberFormScreen = lazy(() => import('../modules/Family/screens/FamilyMemberFormScreen').then((m) => ({ default: m.FamilyMemberFormScreen })));
const FamilyTreeScreen = lazy(() => import('../modules/Family/screens/FamilyTreeScreen').then((m) => ({ default: m.FamilyTreeScreen })));
const ChoresScreen = lazy(() => import('../modules/Family/screens/ChoresScreen').then((m) => ({ default: m.ChoresScreen })));
const ShoppingListsScreen = lazy(() => import('../modules/Family/screens/ShoppingListsScreen').then((m) => ({ default: m.ShoppingListsScreen })));
const ShoppingListDetailScreen = lazy(() => import('../modules/Family/screens/ShoppingListDetailScreen').then((m) => ({ default: m.ShoppingListDetailScreen })));
const FamilyGoalsScreen = lazy(() => import('../modules/Family/screens/FamilyGoalsScreen').then((m) => ({ default: m.FamilyGoalsScreen })));
const FamilyGoalDetailScreen = lazy(() => import('../modules/Family/screens/FamilyGoalDetailScreen').then((m) => ({ default: m.FamilyGoalDetailScreen })));
const FamilyEventsScreen = lazy(() => import('../modules/Family/screens/FamilyEventsScreen').then((m) => ({ default: m.FamilyEventsScreen })));
const FamilyJournalScreen = lazy(() => import('../modules/Family/screens/FamilyJournalScreen').then((m) => ({ default: m.FamilyJournalScreen })));
const FamilyMemoriesScreen = lazy(() => import('../modules/Family/screens/FamilyMemoriesScreen').then((m) => ({ default: m.FamilyMemoriesScreen })));
const FamilyMedicalScreen = lazy(() => import('../modules/Family/screens/FamilyMedicalScreen').then((m) => ({ default: m.FamilyMedicalScreen })));
const EmergencyCenterScreen = lazy(() => import('../modules/Family/screens/EmergencyCenterScreen').then((m) => ({ default: m.EmergencyCenterScreen })));
const FamilyDocumentsScreen = lazy(() => import('../modules/Family/screens/FamilyDocumentsScreen').then((m) => ({ default: m.FamilyDocumentsScreen })));
const FamilyNotesScreen = lazy(() => import('../modules/Family/screens/FamilyNotesScreen').then((m) => ({ default: m.FamilyNotesScreen })));
const FamilyAnalyticsScreen = lazy(() => import('../modules/Family/screens/FamilyAnalyticsScreen').then((m) => ({ default: m.FamilyAnalyticsScreen })));
const DocumentsHubScreen = lazy(() => import('../modules/Documents/screens/DocumentsHubScreen').then((m) => ({ default: m.DocumentsHubScreen })));
const DocumentFoldersScreen = lazy(() => import('../modules/Documents/screens/DocumentFoldersScreen').then((m) => ({ default: m.DocumentFoldersScreen })));
const DocumentUploadScreen = lazy(() => import('../modules/Documents/screens/DocumentUploadScreen').then((m) => ({ default: m.DocumentUploadScreen })));
const DocumentListScreen = lazy(() => import('../modules/Documents/screens/DocumentListScreen').then((m) => ({ default: m.DocumentListScreen })));
const DocumentDetailScreen = lazy(() => import('../modules/Documents/screens/DocumentDetailScreen').then((m) => ({ default: m.DocumentDetailScreen })));
const DocumentEditScreen = lazy(() => import('../modules/Documents/screens/DocumentEditScreen').then((m) => ({ default: m.DocumentEditScreen })));
const DocumentVersionsScreen = lazy(() => import('../modules/Documents/screens/DocumentVersionsScreen').then((m) => ({ default: m.DocumentVersionsScreen })));
const DocumentSharesScreen = lazy(() => import('../modules/Documents/screens/DocumentSharesScreen').then((m) => ({ default: m.DocumentSharesScreen })));
const SharedWithMeScreen = lazy(() => import('../modules/Documents/screens/SharedWithMeScreen').then((m) => ({ default: m.SharedWithMeScreen })));
const DocumentSearchScreen = lazy(() => import('../modules/Documents/screens/DocumentSearchScreen').then((m) => ({ default: m.DocumentSearchScreen })));
const DocumentTrashScreen = lazy(() => import('../modules/Documents/screens/DocumentTrashScreen').then((m) => ({ default: m.DocumentTrashScreen })));
const DocumentDuplicatesScreen = lazy(() => import('../modules/Documents/screens/DocumentDuplicatesScreen').then((m) => ({ default: m.DocumentDuplicatesScreen })));
const AutomationRulesScreen = lazy(() => import('../modules/Documents/screens/AutomationRulesScreen').then((m) => ({ default: m.AutomationRulesScreen })));
const AutomationRuleFormScreen = lazy(() => import('../modules/Documents/screens/AutomationRuleFormScreen').then((m) => ({ default: m.AutomationRuleFormScreen })));
const DocumentAnalyticsScreen = lazy(() => import('../modules/Documents/screens/DocumentAnalyticsScreen').then((m) => ({ default: m.DocumentAnalyticsScreen })));
const DocumentActivityLogScreen = lazy(() => import('../modules/Documents/screens/DocumentActivityLogScreen').then((m) => ({ default: m.DocumentActivityLogScreen })));
const AnalyticsHubScreen = lazy(() => import('../modules/Analytics/screens/AnalyticsHubScreen').then((m) => ({ default: m.AnalyticsHubScreen })));
const DashboardListScreen = lazy(() => import('../modules/Analytics/screens/DashboardListScreen').then((m) => ({ default: m.DashboardListScreen })));
const AnalyticsDashboardScreen = lazy(() => import('../modules/Analytics/screens/DashboardScreen').then((m) => ({ default: m.DashboardScreen })));
const WidgetFormScreen = lazy(() => import('../modules/Analytics/screens/WidgetFormScreen').then((m) => ({ default: m.WidgetFormScreen })));
const AnalyticsLifeScoreScreen = lazy(() => import('../modules/Analytics/screens/LifeScoreScreen').then((m) => ({ default: m.LifeScoreScreen })));
const MetricCatalogScreen = lazy(() => import('../modules/Analytics/screens/MetricCatalogScreen').then((m) => ({ default: m.MetricCatalogScreen })));
const MetricDetailScreen = lazy(() => import('../modules/Analytics/screens/MetricDetailScreen').then((m) => ({ default: m.MetricDetailScreen })));
const CorrelationsScreen = lazy(() => import('../modules/Analytics/screens/CorrelationsScreen').then((m) => ({ default: m.CorrelationsScreen })));
const InsightsScreen = lazy(() => import('../modules/Analytics/screens/InsightsScreen').then((m) => ({ default: m.InsightsScreen })));
const CustomMetricsScreen = lazy(() => import('../modules/Analytics/screens/CustomMetricsScreen').then((m) => ({ default: m.CustomMetricsScreen })));
const CustomMetricDetailScreen = lazy(() => import('../modules/Analytics/screens/CustomMetricDetailScreen').then((m) => ({ default: m.CustomMetricDetailScreen })));
const CustomMetricFormScreen = lazy(() => import('../modules/Analytics/screens/CustomMetricFormScreen').then((m) => ({ default: m.CustomMetricFormScreen })));
const AnalyticsReportsScreen = lazy(() => import('../modules/Analytics/screens/ReportsScreen').then((m) => ({ default: m.ReportsScreen })));
const ReportDetailScreen = lazy(() => import('../modules/Analytics/screens/ReportDetailScreen').then((m) => ({ default: m.ReportDetailScreen })));
const AlertRulesScreen = lazy(() => import('../modules/Analytics/screens/AlertRulesScreen').then((m) => ({ default: m.AlertRulesScreen })));
const AlertRuleFormScreen = lazy(() => import('../modules/Analytics/screens/AlertRuleFormScreen').then((m) => ({ default: m.AlertRuleFormScreen })));
const AnalyticsAlertsScreen = lazy(() => import('../modules/Analytics/screens/AlertsScreen').then((m) => ({ default: m.AlertsScreen })));
const AnalyticsTimelineScreen = lazy(() => import('../modules/Analytics/screens/TimelineScreen').then((m) => ({ default: m.TimelineScreen })));
const KnowledgeGraphScreen = lazy(() => import('../modules/Analytics/screens/KnowledgeGraphScreen').then((m) => ({ default: m.KnowledgeGraphScreen })));
const AnalyticsSearchScreen = lazy(() => import('../modules/Analytics/screens/AnalyticsSearchScreen').then((m) => ({ default: m.AnalyticsSearchScreen })));
const NotificationsScreen = lazy(() => import('../modules/Notifications/screens/NotificationsScreen').then((m) => ({ default: m.NotificationsScreen })));
const SettingsScreen = lazy(() => import('../modules/Settings/screens/SettingsScreen').then((m) => ({ default: m.SettingsScreen })));
const ProfileScreen = lazy(() => import('../modules/Profile/screens/ProfileScreen').then((m) => ({ default: m.ProfileScreen })));

// Modules not yet ported render this instead of crashing the route tree —
// swapped for the real screen module-by-module as later phases land.
function Placeholder(moduleKey) {
  const mod = MODULES[moduleKey];
  return <PlaceholderScreen icon={mod.icon} title={mod.title} description={mod.description} />;
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        element: <RedirectIfAuthed />,
        children: [
          {
            element: <AuthLayout />,
            children: [
              { path: '/login', element: <LoginScreen /> },
              { path: '/register', element: <RegisterScreen /> },
              { path: '/forgot-password', element: <ForgotPasswordScreen /> },
              { path: '/reset-password', element: <ResetPasswordScreen /> },
            ],
          },
        ],
      },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <AppShellLayout />,
            children: [
              { index: true, element: <DashboardScreen /> },
              { path: 'tasks', element: <TaskWorkspaceScreen /> },
              { path: 'tasks/:taskId', element: <TaskDetailScreen /> },
              { path: 'calendar', element: <CalendarWorkspaceScreen /> },

              { path: 'finance', element: <FinanceHubScreen /> },
              { path: 'finance/accounts', element: <AccountsScreen /> },
              { path: 'finance/transactions', element: <TransactionsScreen /> },
              { path: 'finance/categories', element: <CategoriesScreen /> },
              { path: 'finance/budgets', element: <BudgetsScreen /> },
              { path: 'finance/bills', element: <BillsScreen /> },
              { path: 'finance/debts', element: <DebtsScreen /> },
              { path: 'finance/debts/:debtId', element: <DebtDetailScreen /> },
              { path: 'finance/net-worth', element: <NetWorthScreen /> },
              { path: 'finance/settings', element: <FinanceSettingsScreen /> },
              { path: 'finance/investments/portfolios', element: <PortfoliosScreen /> },
              { path: 'finance/investments/portfolios/:portfolioId', element: <PortfolioDetailScreen /> },
              { path: 'finance/investments/assets', element: <AssetsScreen /> },
              { path: 'finance/investments/transactions', element: <InvestmentTransactionsScreen /> },
              { path: 'finance/investments/allocation', element: <AllocationScreen /> },
              { path: 'finance/investments/sip-plans', element: <SipPlansScreen /> },

              { path: 'focus', element: <FocusScreen /> },
              { path: 'focus/history', element: <FocusHistoryScreen /> },
              { path: 'sleep', element: <Navigate to="/health/sleep-log" replace /> },
              { path: 'workout', element: <Navigate to="/health/workout-log" replace /> },
              { path: 'journal', element: <Navigate to="/notes/daily" replace /> },
              { path: 'dreams', element: <DreamsWorkspaceScreen /> },
              { path: 'dreams/new', element: <DreamEntryFormScreen /> },
              { path: 'dreams/calendar', element: <DreamCalendarScreen /> },
              { path: 'dreams/analytics', element: <DreamAnalyticsScreen /> },
              { path: 'dreams/settings', element: <DreamSettingsScreen /> },
              { path: 'dreams/registry/:kind', element: <DreamRegistryScreen /> },
              { path: 'dreams/:dreamId', element: <DreamDetailScreen /> },
              { path: 'dreams/:dreamId/edit', element: <DreamEntryFormScreen /> },
              { path: 'family', element: <FamilyHubScreen /> },
              { path: 'family/settings', element: <HouseholdSettingsScreen /> },
              { path: 'family/members', element: <FamilyMembersScreen /> },
              { path: 'family/members/new', element: <FamilyMemberFormScreen /> },
              { path: 'family/members/:memberId', element: <FamilyMemberDetailScreen /> },
              { path: 'family/members/:memberId/edit', element: <FamilyMemberFormScreen /> },
              { path: 'family/tree', element: <FamilyTreeScreen /> },
              { path: 'family/chores', element: <ChoresScreen /> },
              { path: 'family/shopping-lists', element: <ShoppingListsScreen /> },
              { path: 'family/shopping-lists/:listId', element: <ShoppingListDetailScreen /> },
              { path: 'family/goals', element: <FamilyGoalsScreen /> },
              { path: 'family/goals/:goalId', element: <FamilyGoalDetailScreen /> },
              { path: 'family/events', element: <FamilyEventsScreen /> },
              { path: 'family/journal', element: <FamilyJournalScreen /> },
              { path: 'family/memories', element: <FamilyMemoriesScreen /> },
              { path: 'family/medical', element: <FamilyMedicalScreen /> },
              { path: 'family/emergency', element: <EmergencyCenterScreen /> },
              { path: 'family/documents', element: <FamilyDocumentsScreen /> },
              { path: 'family/notes', element: <FamilyNotesScreen /> },
              { path: 'family/analytics', element: <FamilyAnalyticsScreen /> },
              { path: 'documents', element: <DocumentsHubScreen /> },
              { path: 'documents/folders', element: <DocumentFoldersScreen /> },
              { path: 'documents/folders/:parentId', element: <DocumentFoldersScreen /> },
              { path: 'documents/upload', element: <DocumentUploadScreen /> },
              { path: 'documents/list', element: <DocumentListScreen /> },
              { path: 'documents/search', element: <DocumentSearchScreen /> },
              { path: 'documents/trash', element: <DocumentTrashScreen /> },
              { path: 'documents/duplicates', element: <DocumentDuplicatesScreen /> },
              { path: 'documents/analytics', element: <DocumentAnalyticsScreen /> },
              { path: 'documents/activity-log', element: <DocumentActivityLogScreen /> },
              { path: 'documents/shared-with-me', element: <SharedWithMeScreen /> },
              { path: 'documents/automation-rules', element: <AutomationRulesScreen /> },
              { path: 'documents/automation-rules/new', element: <AutomationRuleFormScreen /> },
              { path: 'documents/automation-rules/:ruleId', element: <AutomationRuleFormScreen /> },
              { path: 'documents/:documentId', element: <DocumentDetailScreen /> },
              { path: 'documents/:documentId/edit', element: <DocumentEditScreen /> },
              { path: 'documents/:documentId/versions', element: <DocumentVersionsScreen /> },
              { path: 'documents/:documentId/shares', element: <DocumentSharesScreen /> },
              { path: 'analytics', element: <AnalyticsHubScreen /> },
              { path: 'analytics/dashboards', element: <DashboardListScreen /> },
              { path: 'analytics/dashboards/:dashboardId', element: <AnalyticsDashboardScreen /> },
              { path: 'analytics/dashboards/:dashboardId/widgets/new', element: <WidgetFormScreen /> },
              { path: 'analytics/life-score', element: <AnalyticsLifeScoreScreen /> },
              { path: 'analytics/metric-catalog', element: <MetricCatalogScreen /> },
              { path: 'analytics/metrics/:metricKey', element: <MetricDetailScreen /> },
              { path: 'analytics/correlations', element: <CorrelationsScreen /> },
              { path: 'analytics/insights', element: <InsightsScreen /> },
              { path: 'analytics/custom-metrics', element: <CustomMetricsScreen /> },
              { path: 'analytics/custom-metrics/new', element: <CustomMetricFormScreen /> },
              { path: 'analytics/custom-metrics/:metricId', element: <CustomMetricDetailScreen /> },
              { path: 'analytics/reports', element: <AnalyticsReportsScreen /> },
              { path: 'analytics/reports/:reportId', element: <ReportDetailScreen /> },
              { path: 'analytics/alert-rules', element: <AlertRulesScreen /> },
              { path: 'analytics/alert-rules/new', element: <AlertRuleFormScreen /> },
              { path: 'analytics/alerts', element: <AnalyticsAlertsScreen /> },
              { path: 'analytics/timeline', element: <AnalyticsTimelineScreen /> },
              { path: 'analytics/graph', element: <KnowledgeGraphScreen /> },
              { path: 'analytics/search', element: <AnalyticsSearchScreen /> },
              { path: 'notifications', element: <NotificationsScreen /> },
              { path: 'settings', element: <SettingsScreen /> },
              { path: 'profile', element: <ProfileScreen /> },

              { path: 'habits', element: <HabitsWorkspaceScreen /> },
              { path: 'habits/routines/:routineId', element: <RoutineDetailScreen /> },
              { path: 'habits/:habitId', element: <HabitDetailScreen /> },

              { path: 'goals', element: <GoalsWorkspaceScreen /> },
              { path: 'goals/roadmap', element: <RoadmapScreen /> },
              { path: 'goals/projects/:projectId', element: <ProjectDetailScreen /> },
              { path: 'goals/:goalId', element: <GoalDetailScreen /> },

              { path: 'notes', element: <NotesWorkspaceScreen /> },
              { path: 'notes/new', element: <NoteEditorScreen /> },
              { path: 'notes/:noteId', element: <NoteEditorScreen /> },
              { path: 'notes/daily', element: <DailyNoteScreen /> },
              { path: 'notes/search', element: <SearchScreen /> },

              { path: 'health', element: <HealthHubScreen /> },
              { path: 'health/water', element: <WaterScreen /> },
              { path: 'health/weight', element: <WeightScreen /> },
              { path: 'health/mood', element: <MoodScreen /> },
              { path: 'health/vitals', element: <VitalsScreen /> },
              { path: 'health/body-measurements', element: <BodyMeasurementsScreen /> },
              { path: 'health/nutrition', element: <NutritionScreen /> },
              { path: 'health/meditation', element: <MeditationScreen /> },
              { path: 'health/medicine', element: <MedicineScreen /> },
              { path: 'health/sleep-log', element: <SleepLogScreen /> },
              { path: 'health/sleep-schedule', element: <SleepScheduleScreen /> },
              { path: 'health/workout-log', element: <WorkoutLogScreen /> },
              { path: 'health/workout-templates', element: <WorkoutTemplatesScreen /> },

              { path: 'career', element: <CareerHubScreen /> },
              { path: 'career/profile', element: <CareerProfileScreen /> },
              { path: 'career/work-history', element: <WorkHistoryScreen /> },
              { path: 'career/education', element: <EducationScreen /> },
              { path: 'career/skills', element: <SkillsScreen /> },
              { path: 'career/learning', element: <LearningScreen /> },
              { path: 'career/certifications', element: <CertificationsScreen /> },
              { path: 'career/job-applications', element: <JobApplicationsScreen /> },
              { path: 'career/interviews', element: <InterviewsScreen /> },
              { path: 'career/resumes', element: <ResumesScreen /> },
              { path: 'career/portfolio', element: <PortfolioScreen /> },
              { path: 'career/performance-reviews', element: <PerformanceReviewsScreen /> },
              { path: 'career/salary', element: <SalaryScreen /> },
              { path: 'career/contacts', element: <ContactsScreen /> },
              { path: 'career/documents', element: <CareerDocumentsScreen /> },
              { path: 'career/timeline', element: <CareerTimelineScreen /> },
            ],
          },
        ],
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
