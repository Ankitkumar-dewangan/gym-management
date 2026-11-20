import { Navigate, Route, Routes } from 'react-router-dom';
import { ROLES } from '../constants/roles';
import AdminLayout from '../layouts/AdminLayout';
import GymOwnerLayout from '../layouts/GymOwnerLayout';
import MemberLayout from '../layouts/MemberLayout';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import LoginPage from '../pages/auth/LoginPage';
import GymDashboard from '../pages/gym/GymDashboard';
import GymModulePlaceholder from '../pages/gym/GymModulePlaceholder';
import AddBranchPage from '../pages/gym/branches/AddBranchPage';
import BranchComparisonPage from '../pages/gym/branches/BranchComparisonPage';
import BranchDetailsPage from '../pages/gym/branches/BranchDetailsPage';
import BranchManagerPage from '../pages/gym/branches/BranchManagerPage';
import BranchPerformancePage from '../pages/gym/branches/BranchPerformancePage';
import BranchStaffPage from '../pages/gym/branches/BranchStaffPage';
import BranchesHubPage from '../pages/gym/branches/BranchesHubPage';
import EditBranchPage from '../pages/gym/branches/EditBranchPage';
import AddMemberPage from '../pages/gym/members/AddMemberPage';
import EditMemberPage from '../pages/gym/members/EditMemberPage';
import FilteredMembersPage from '../pages/gym/members/FilteredMembersPage';
import MemberDocumentsPage from '../pages/gym/members/MemberDocumentsPage';
import MemberHistoryPage from '../pages/gym/members/MemberHistoryPage';
import MemberProfilePage from '../pages/gym/members/MemberProfilePage';
import MemberProgressPage from '../pages/gym/members/MemberProgressPage';
import MembersHubPage from '../pages/gym/members/MembersHubPage';
import ActiveMembershipsPage from '../pages/gym/membership/ActiveMembershipsPage';
import AssignMembershipPage from '../pages/gym/membership/AssignMembershipPage';
import CancelledMembershipsPage from '../pages/gym/membership/CancelledMembershipsPage';
import CreateMembershipPlanPage from '../pages/gym/membership/CreateMembershipPlanPage';
import DiscountsOffersPage from '../pages/gym/membership/DiscountsOffersPage';
import EditMembershipPlanPage from '../pages/gym/membership/EditMembershipPlanPage';
import ExpiredMembershipsPage from '../pages/gym/membership/ExpiredMembershipsPage';
import FreezeResumePage from '../pages/gym/membership/FreezeResumePage';
import MembershipDashboardPage from '../pages/gym/membership/MembershipDashboardPage';
import MembershipDetailsPage from '../pages/gym/membership/MembershipDetailsPage';
import MembershipHistoryPage from '../pages/gym/membership/MembershipHistoryPage';
import MembershipPlansPage from '../pages/gym/membership/MembershipPlansPage';
import RenewalManagementPage from '../pages/gym/membership/RenewalManagementPage';
import GymUpcomingExpiriesPage from '../pages/gym/membership/UpcomingExpiriesPage';
import UpgradeDowngradePage from '../pages/gym/membership/UpgradeDowngradePage';
import AttendanceCorrectionsPage from '../pages/gym/attendance/AttendanceCorrectionsPage';
import AttendanceDashboardPage from '../pages/gym/attendance/AttendanceDashboardPage';
import AttendanceHistoryPage from '../pages/gym/attendance/AttendanceHistoryPage';
import AttendanceReportsPage from '../pages/gym/attendance/AttendanceReportsPage';
import AttendanceSettingsPage from '../pages/gym/attendance/AttendanceSettingsPage';
import BranchAttendancePage from '../pages/gym/attendance/BranchAttendancePage';
import CheckInManagementPage from '../pages/gym/attendance/CheckInManagementPage';
import CheckOutManagementPage from '../pages/gym/attendance/CheckOutManagementPage';
import LiveOccupancyPage from '../pages/gym/attendance/LiveOccupancyPage';
import ManualAttendancePage from '../pages/gym/attendance/ManualAttendancePage';
import MemberAttendancePage from '../pages/gym/attendance/MemberAttendancePage';
import QrScannerPage from '../pages/gym/attendance/QrScannerPage';
import AddTrainerPage from '../pages/gym/trainers/AddTrainerPage';
import EditTrainerPage from '../pages/gym/trainers/EditTrainerPage';
import TrainerAssignmentsPage from '../pages/gym/trainers/TrainerAssignmentsPage';
import TrainerPerformancePage from '../pages/gym/trainers/TrainerPerformancePage';
import TrainerProfilePage from '../pages/gym/trainers/TrainerProfilePage';
import TrainerSchedulesPage from '../pages/gym/trainers/TrainerSchedulesPage';
import TrainersHubPage from '../pages/gym/trainers/TrainersHubPage';
import TrainingSessionsPage from '../pages/gym/trainers/TrainingSessionsPage';
import AddStaffPage from '../pages/gym/staff/AddStaffPage';
import EditStaffPage from '../pages/gym/staff/EditStaffPage';
import StaffAttendancePage from '../pages/gym/staff/StaffAttendancePage';
import StaffHubPage from '../pages/gym/staff/StaffHubPage';
import StaffProfilePage from '../pages/gym/staff/StaffProfilePage';
import GeneratePayrollPage from '../pages/gym/payroll/GeneratePayrollPage';
import PayrollDashboardPage from '../pages/gym/payroll/PayrollDashboardPage';
import PayrollDetailsPage from '../pages/gym/payroll/PayrollDetailsPage';
import PayrollHistoryPage from '../pages/gym/payroll/PayrollHistoryPage';
import MemberDashboard from '../pages/member/MemberDashboard';
import MemberModulePlaceholder from '../pages/member/MemberModulePlaceholder';
import MemberWorkoutPage from '../pages/member/MemberWorkoutPage';
import MemberWorkoutsPage from '../pages/member/MemberWorkoutsPage';
import MemberDietPage from '../pages/member/MemberDietPage';
import MemberPortalProfilePage from '../pages/member/MemberProfilePage';
import MemberPortalAttendancePage from '../pages/member/MemberAttendancePage';
import MemberPortalMembershipPage from '../pages/member/MemberMembershipPage';
import MemberPaymentsPage from '../pages/member/MemberPaymentsPage';
import MemberPortalFitnessProgressPage from '../pages/member/MemberFitnessProgressPage';
import MemberNotificationsPage from '../pages/member/MemberNotificationsPage';
import MemberAnnouncementsPage from '../pages/member/MemberAnnouncementsPage';
import MemberSettingsPage from '../pages/member/MemberSettingsPage';
import WorkoutDashboardPage from '../pages/gym/workouts/WorkoutDashboardPage';
import WorkoutPlansPage from '../pages/gym/workouts/WorkoutPlansPage';
import WorkoutPlanFormPage from '../pages/gym/workouts/WorkoutPlanFormPage';
import WorkoutPlanDetailsPage from '../pages/gym/workouts/WorkoutPlanDetailsPage';
import ExerciseLibraryPage from '../pages/gym/workouts/ExerciseLibraryPage';
import AssignWorkoutPage from '../pages/gym/workouts/AssignWorkoutPage';
import WorkoutSchedulePage from '../pages/gym/workouts/WorkoutSchedulePage';
import WorkoutProgressPage from '../pages/gym/workouts/WorkoutProgressPage';
import MemberFitnessProgressPage from '../pages/gym/workouts/MemberFitnessProgressPage';
import DietDashboardPage from '../pages/gym/diet/DietDashboardPage';
import DietPlansPage from '../pages/gym/diet/DietPlansPage';
import DietPlanFormPage from '../pages/gym/diet/DietPlanFormPage';
import DietPlanDetailsPage from '../pages/gym/diet/DietPlanDetailsPage';
import FoodLibraryPage from '../pages/gym/diet/FoodLibraryPage';
import AssignDietPage from '../pages/gym/diet/AssignDietPage';
import OwnerProfilePage from '../pages/gym/settings/OwnerProfilePage';
import GymBusinessProfilePage from '../pages/gym/settings/GymBusinessProfilePage';
import GymSettingsPage from '../pages/gym/settings/GymSettingsPage';
import GymNotificationsPage from '../pages/gym/settings/GymNotificationsPage';

// Step 13: Fees, Payments & Expenses Management Imports
import FinanceDashboardPage from '../pages/gym/finance/FinanceDashboardPage';
import MemberFeesPage from '../pages/gym/finance/MemberFeesPage';
import MemberFeeDetailsPage from '../pages/gym/finance/MemberFeeDetailsPage';
import CollectPaymentPage from '../pages/gym/finance/CollectPaymentPage';
import FinanceTransactionsPage from '../pages/gym/finance/FinanceTransactionsPage';
import PendingPaymentsPage from '../pages/gym/finance/PendingPaymentsPage';
import BillingRenewalsPage from '../pages/gym/finance/BillingRenewalsPage';
import InvoicesPage from '../pages/gym/finance/InvoicesPage';
import CreateInvoicePage from '../pages/gym/finance/CreateInvoicePage';
import ReceiptsPage from '../pages/gym/finance/ReceiptsPage';
import RefundsPage from '../pages/gym/finance/RefundsPage';
import ExpensesPage from '../pages/gym/finance/ExpensesPage';
import AddExpensePage from '../pages/gym/finance/AddExpensePage';
import ExpenseApprovalsPage from '../pages/gym/finance/ExpenseApprovalsPage';
import FinancePayrollPage from '../pages/gym/finance/FinancePayrollPage';
import FinancePayrollDetailsPage from '../pages/gym/finance/FinancePayrollDetailsPage';
import FinancialReportsDashboardPage from '../pages/gym/finance/FinancialReportsDashboardPage';
import FinancialSettingsPage from '../pages/gym/finance/FinancialSettingsPage';

// Step 14: Reports, Analytics & Notifications Imports
import GymAnalyticsDashboardPage from '../pages/gym/analytics/GymAnalyticsDashboardPage';
import MemberAnalyticsPage from '../pages/gym/analytics/MemberAnalyticsPage';
import AttendanceAnalyticsPage from '../pages/gym/analytics/AttendanceAnalyticsPage';
import RevenueAnalyticsDashboardPage from '../pages/gym/analytics/RevenueAnalyticsDashboardPage';
import MembershipAnalyticsPage from '../pages/gym/analytics/MembershipAnalyticsPage';
import TrainerStaffAnalyticsPage from '../pages/gym/analytics/TrainerStaffAnalyticsPage';
import BranchPerformanceAnalyticsPage from '../pages/gym/analytics/BranchPerformanceAnalyticsPage';
import CustomReportBuilderPage from '../pages/gym/analytics/CustomReportBuilderPage';
import SavedReportsPage from '../pages/gym/analytics/SavedReportsPage';
import NotificationCenterPage from '../pages/gym/notifications/NotificationCenterPage';
import NotificationSettingsPage from '../pages/gym/notifications/NotificationSettingsPage';
import AnnouncementsPage from '../pages/gym/notifications/AnnouncementsPage';
import CreateAnnouncementPage from '../pages/gym/notifications/CreateAnnouncementPage';
import EnquiriesPage from '../pages/gym/enquiries/EnquiriesPage';
import FollowupsPage from '../pages/gym/enquiries/FollowupsPage';

// Super Admin Analytics Imports
import SuperAdminAnalyticsPage from '../pages/super-admin/analytics/SuperAdminAnalyticsPage';
import SuperAdminGymsAnalyticsPage from '../pages/super-admin/analytics/SuperAdminGymsAnalyticsPage';
import SuperAdminRevenueAnalyticsPage from '../pages/super-admin/analytics/SuperAdminRevenueAnalyticsPage';
import SuperAdminSubscriptionsAnalyticsPage from '../pages/super-admin/analytics/SuperAdminSubscriptionsAnalyticsPage';
import SuperAdminUsageAnalyticsPage from '../pages/super-admin/analytics/SuperAdminUsageAnalyticsPage';
import NotFoundPage from '../pages/NotFoundPage';
import SuperAdminDashboard from '../pages/super-admin/SuperAdminDashboard';
import SuperAdminPlaceholder from '../pages/super-admin/SuperAdminPlaceholder';
import AddGymPage from '../pages/super-admin/gyms/AddGymPage';
import AllGymsPage from '../pages/super-admin/gyms/AllGymsPage';
import BranchOverviewPage from '../pages/super-admin/gyms/BranchOverviewPage';
import EditGymPage from '../pages/super-admin/gyms/EditGymPage';
import GymApprovalsPage from '../pages/super-admin/gyms/GymApprovalsPage';
import GymDetailsPage from '../pages/super-admin/gyms/GymDetailsPage';
import FinancialDashboardPage from '../pages/super-admin/financial/FinancialDashboardPage';
import FinancialRefundsPage from '../pages/super-admin/financial/FinancialRefundsPage';
import FinancialReportsPage from '../pages/super-admin/financial/FinancialReportsPage';
import PaymentManagementPage from '../pages/super-admin/financial/PaymentManagementPage';
import RevenueAnalyticsPage from '../pages/super-admin/financial/RevenueAnalyticsPage';
import TransactionsPage from '../pages/super-admin/financial/TransactionsPage';
import AuditLogsPage from '../pages/super-admin/platform/AuditLogsPage';
import GeneralSettingsPage from '../pages/super-admin/platform/GeneralSettingsPage';
import NotificationsManagementPage from '../pages/super-admin/platform/NotificationsManagementPage';
import ProfileSettingsPage from '../pages/super-admin/platform/ProfileSettingsPage';
import RolesPermissionsPage from '../pages/super-admin/platform/RolesPermissionsPage';
import SupportTicketDetailsPage from '../pages/super-admin/platform/SupportTicketDetailsPage';
import SupportTicketsPage from '../pages/super-admin/platform/SupportTicketsPage';
import UserManagementPage from '../pages/super-admin/platform/UserManagementPage';
import ActiveSubscriptionsPage from '../pages/super-admin/subscriptions/ActiveSubscriptionsPage';
import CreatePlanPage from '../pages/super-admin/subscriptions/CreatePlanPage';
import EditPlanPage from '../pages/super-admin/subscriptions/EditPlanPage';
import ExpiredSubscriptionsPage from '../pages/super-admin/subscriptions/ExpiredSubscriptionsPage';
import FreeTrialsPage from '../pages/super-admin/subscriptions/FreeTrialsPage';
import PaymentsBillingPage from '../pages/super-admin/subscriptions/PaymentsBillingPage';
import RefundManagementPage from '../pages/super-admin/subscriptions/RefundManagementPage';
import SubscriptionDashboardPage from '../pages/super-admin/subscriptions/SubscriptionDashboardPage';
import SubscriptionDetailsPage from '../pages/super-admin/subscriptions/SubscriptionDetailsPage';
import SubscriptionPlansPage from '../pages/super-admin/subscriptions/SubscriptionPlansPage';
import TransactionHistoryPage from '../pages/super-admin/subscriptions/TransactionHistoryPage';
import UpcomingExpiriesPage from '../pages/super-admin/subscriptions/UpcomingExpiriesPage';
import ProtectedRoute from './ProtectedRoute';
import {
  GYM_MODULE_PLACEHOLDERS,
  MEMBER_MODULE_PLACEHOLDERS,
  ROUTE_PATHS,
  SUPER_ADMIN_PLACEHOLDERS,
} from './routeConfig';

export function AppRoutes() {
  return (
    <Routes>
      {/* Default Entry */}
      <Route path={ROUTE_PATHS.ROOT} element={<Navigate to={ROUTE_PATHS.LOGIN} replace />} />

      {/* Auth Routes */}
      <Route path={ROUTE_PATHS.LOGIN} element={<LoginPage />} />
      <Route path={ROUTE_PATHS.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />

      {/* Super Admin Routes */}
      <Route
        path={ROUTE_PATHS.SUPER_ADMIN.BASE}
        element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to={ROUTE_PATHS.SUPER_ADMIN.DASHBOARD} replace />} />
        <Route path="dashboard" element={<SuperAdminDashboard />} />

        {/* Step 3: Gym Management Module */}
        <Route path="gyms" element={<AllGymsPage />} />
        <Route path="gyms/add" element={<AddGymPage />} />
        <Route path="gyms/new" element={<Navigate to="/super-admin/gyms/add" replace />} />
        <Route path="gyms/approvals" element={<Navigate to="/super-admin/gym-approvals" replace />} />
        <Route path="gyms/:id" element={<GymDetailsPage />} />
        <Route path="gyms/:id/edit" element={<EditGymPage />} />
        <Route path="gym-approvals" element={<GymApprovalsPage />} />
        <Route path="branches" element={<BranchOverviewPage />} />

        {/* Step 4: Subscription Management Module */}
        <Route path="subscriptions" element={<SubscriptionDashboardPage />} />
        <Route path="subscription-plans" element={<SubscriptionPlansPage />} />
        <Route path="subscription-plans/create" element={<CreatePlanPage />} />
        <Route path="subscription-plans/:id/edit" element={<EditPlanPage />} />
        <Route path="active-subscriptions" element={<ActiveSubscriptionsPage />} />
        <Route path="expired-subscriptions" element={<ExpiredSubscriptionsPage />} />
        <Route path="upcoming-expiries" element={<UpcomingExpiriesPage />} />
        <Route path="free-trials" element={<FreeTrialsPage />} />
        <Route path="subscriptions/:id" element={<SubscriptionDetailsPage />} />
        <Route path="billing" element={<PaymentsBillingPage />} />
        <Route path="transactions" element={<TransactionHistoryPage />} />
        <Route path="refunds" element={<RefundManagementPage />} />

        {/* Backwards-compatible Step 2 path redirects */}
        <Route path="subscriptions/plans" element={<Navigate to="/super-admin/subscription-plans" replace />} />
        <Route path="subscriptions/active" element={<Navigate to="/super-admin/active-subscriptions" replace />} />
        <Route path="subscriptions/expired" element={<Navigate to="/super-admin/expired-subscriptions" replace />} />
        <Route path="subscriptions/trials" element={<Navigate to="/super-admin/free-trials" replace />} />
        <Route path="subscriptions/billing" element={<Navigate to="/super-admin/billing" replace />} />
        <Route path="finance/transactions" element={<Navigate to="/super-admin/transactions" replace />} />
        <Route path="finance/refunds" element={<Navigate to="/super-admin/refunds" replace />} />

        {/* Step 5: Financial Management Module */}
        <Route path="financial" element={<FinancialDashboardPage />} />
        <Route path="financial/revenue" element={<RevenueAnalyticsPage />} />
        <Route path="financial/transactions" element={<TransactionsPage />} />
        <Route path="financial/payments" element={<PaymentManagementPage />} />
        <Route path="financial/refunds" element={<FinancialRefundsPage />} />
        <Route path="financial/reports" element={<FinancialReportsPage />} />

        {/* Step 5: Platform Management Module */}
        <Route path="users" element={<UserManagementPage />} />
        <Route path="roles-permissions" element={<RolesPermissionsPage />} />
        <Route path="support" element={<SupportTicketsPage />} />
        <Route path="support/:id" element={<SupportTicketDetailsPage />} />
        <Route path="notifications" element={<NotificationsManagementPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
        <Route path="settings" element={<GeneralSettingsPage />} />
        <Route path="profile" element={<ProfileSettingsPage />} />

        {/* Step 14: Super Admin Platform Analytics */}
        <Route path="analytics" element={<SuperAdminAnalyticsPage />} />
        <Route path="analytics/gyms" element={<SuperAdminGymsAnalyticsPage />} />
        <Route path="analytics/revenue" element={<SuperAdminRevenueAnalyticsPage />} />
        <Route path="analytics/subscriptions" element={<SuperAdminSubscriptionsAnalyticsPage />} />
        <Route path="analytics/usage" element={<SuperAdminUsageAnalyticsPage />} />

        {/* Backwards-compatible Step 2 path redirects for Financial/Platform */}
        <Route path="finance/revenue" element={<Navigate to="/super-admin/financial/revenue" replace />} />
        <Route path="platform/users" element={<Navigate to="/super-admin/users" replace />} />
        <Route path="platform/roles" element={<Navigate to="/super-admin/roles-permissions" replace />} />
        <Route path="platform/tickets" element={<Navigate to="/super-admin/support" replace />} />
        <Route path="platform/notifications" element={<Navigate to="/super-admin/notifications" replace />} />
        <Route path="platform/audit-logs" element={<Navigate to="/super-admin/audit-logs" replace />} />
        <Route path="settings/profile" element={<Navigate to="/super-admin/profile" replace />} />

        {SUPER_ADMIN_PLACEHOLDERS.map((item) => (
          <Route
            key={item.path}
            path={item.path}
            element={
              <SuperAdminPlaceholder
                title={item.title}
                description={item.description}
              />
            }
          />
        ))}
      </Route>

      {/* Gym Owner Routes */}
      <Route
        path={ROUTE_PATHS.GYM.BASE}
        element={
          <ProtectedRoute allowedRoles={[ROLES.GYM_OWNER]}>
            <GymOwnerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to={ROUTE_PATHS.GYM.DASHBOARD} replace />} />
        <Route path="dashboard" element={<GymDashboard />} />

        {/* Step 7: Branch Management Module */}
        <Route path="branches" element={<BranchesHubPage />} />
        <Route path="branches/add" element={<AddBranchPage />} />
        <Route path="branches/performance" element={<BranchPerformancePage />} />
        <Route path="branches/comparison" element={<BranchComparisonPage />} />
        <Route path="branches/:id" element={<BranchDetailsPage />} />
        <Route path="branches/:id/edit" element={<EditBranchPage />} />
        <Route path="branches/:id/manager" element={<BranchManagerPage />} />
        <Route path="branches/:id/staff" element={<BranchStaffPage />} />

        {/* Step 8: Member Management Module */}
        <Route path="members" element={<MembersHubPage />} />
        <Route path="members/add" element={<AddMemberPage />} />
        <Route path="members/active" element={<FilteredMembersPage presetStatus="active" />} />
        <Route path="members/inactive" element={<FilteredMembersPage presetStatus="inactive" />} />
        <Route path="members/expired" element={<FilteredMembersPage presetStatus="expired" />} />
        <Route path="members/:id" element={<MemberProfilePage />} />
        <Route path="members/:id/edit" element={<EditMemberPage />} />
        <Route path="members/:id/history" element={<MemberHistoryPage />} />
        <Route path="members/:id/documents" element={<MemberDocumentsPage />} />
        <Route path="members/:id/progress" element={<MemberProgressPage />} />

        {/* Step 9: Membership & Renewal Management Module (static routes before :id) */}
        <Route path="membership" element={<MembershipDashboardPage />} />
        <Route path="membership/plans" element={<MembershipPlansPage />} />
        <Route path="membership/plans/create" element={<CreateMembershipPlanPage />} />
        <Route path="membership/plans/:id/edit" element={<EditMembershipPlanPage />} />
        <Route path="membership/assign" element={<AssignMembershipPage />} />
        <Route path="membership/active" element={<ActiveMembershipsPage />} />
        <Route path="membership/upcoming-expiries" element={<GymUpcomingExpiriesPage />} />
        <Route path="membership/expired" element={<ExpiredMembershipsPage />} />
        <Route path="membership/renewals" element={<RenewalManagementPage />} />
        <Route path="membership/history" element={<MembershipHistoryPage />} />
        <Route path="membership/cancelled" element={<CancelledMembershipsPage />} />
        <Route path="membership/offers" element={<DiscountsOffersPage />} />
        <Route path="membership/:id" element={<MembershipDetailsPage />} />
        <Route path="membership/:id/upgrade" element={<UpgradeDowngradePage />} />
        <Route path="membership/:id/freeze" element={<FreezeResumePage />} />
        <Route path="renewals" element={<Navigate to="/gym/membership/renewals" replace />} />

        {/* Step 10: Attendance & QR Access Management Module */}
        <Route path="attendance" element={<AttendanceDashboardPage />} />
        <Route path="attendance/scanner" element={<QrScannerPage />} />
        <Route path="attendance/manual" element={<ManualAttendancePage />} />
        <Route path="attendance/check-ins" element={<CheckInManagementPage />} />
        <Route path="attendance/check-outs" element={<CheckOutManagementPage />} />
        <Route path="attendance/live" element={<LiveOccupancyPage />} />
        <Route path="attendance/history" element={<AttendanceHistoryPage />} />
        <Route path="attendance/branches" element={<BranchAttendancePage />} />
        <Route path="attendance/reports" element={<AttendanceReportsPage />} />
        <Route path="attendance/settings" element={<AttendanceSettingsPage />} />
        <Route path="attendance/corrections" element={<AttendanceCorrectionsPage />} />
        <Route path="attendance/member/:id" element={<MemberAttendancePage />} />

        {/* Step 11: Trainers, Staff & Payroll Management Module (static routes before :id) */}
        <Route path="trainers" element={<TrainersHubPage />} />
        <Route path="trainers/add" element={<AddTrainerPage />} />
        <Route path="trainers/assignments" element={<TrainerAssignmentsPage />} />
        <Route path="trainers/schedules" element={<TrainerSchedulesPage />} />
        <Route path="trainers/sessions" element={<TrainingSessionsPage />} />
        <Route path="trainers/performance" element={<TrainerPerformancePage />} />
        <Route path="trainers/:id" element={<TrainerProfilePage />} />
        <Route path="trainers/:id/edit" element={<EditTrainerPage />} />
        <Route path="trainer-assignments" element={<Navigate to="/gym/trainers/assignments" replace />} />

        <Route path="staff" element={<StaffHubPage />} />
        <Route path="staff/add" element={<AddStaffPage />} />
        <Route path="staff/attendance" element={<StaffAttendancePage />} />
        <Route path="staff/:id" element={<StaffProfilePage />} />
        <Route path="staff/:id/edit" element={<EditStaffPage />} />

        <Route path="payroll" element={<PayrollDashboardPage />} />
        <Route path="payroll/generate" element={<GeneratePayrollPage />} />
        <Route path="payroll/history" element={<PayrollHistoryPage />} />
        <Route path="payroll/:id" element={<PayrollDetailsPage />} />

        {/* Step 13: Fees, Payments & Expenses Management */}
        <Route path="finance" element={<FinanceDashboardPage />} />
        <Route path="finance/fees" element={<MemberFeesPage />} />
        <Route path="finance/fees/:id" element={<MemberFeeDetailsPage />} />
        <Route path="finance/collect" element={<CollectPaymentPage />} />
        <Route path="finance/collections" element={<Navigate to="/gym/finance/collect" replace />} />
        <Route path="finance/transactions" element={<FinanceTransactionsPage />} />
        <Route path="finance/pending" element={<PendingPaymentsPage />} />
        <Route path="finance/pending-payments" element={<Navigate to="/gym/finance/pending" replace />} />
        <Route path="finance/billing" element={<BillingRenewalsPage />} />
        <Route path="finance/invoices" element={<InvoicesPage />} />
        <Route path="finance/invoices/create" element={<CreateInvoicePage />} />
        <Route path="finance/receipts" element={<ReceiptsPage />} />
        <Route path="finance/refunds" element={<RefundsPage />} />
        <Route path="finance/expenses" element={<ExpensesPage />} />
        <Route path="finance/expenses/create" element={<AddExpensePage />} />
        <Route path="finance/expenses/approvals" element={<ExpenseApprovalsPage />} />
        <Route path="finance/payroll" element={<FinancePayrollPage />} />
        <Route path="finance/payroll/:id" element={<FinancePayrollDetailsPage />} />
        <Route path="finance/reports" element={<FinancialReportsDashboardPage />} />
        <Route path="finance/settings" element={<FinancialSettingsPage />} />

        <Route path="payments" element={<Navigate to="/gym/finance/collect" replace />} />
        <Route path="expenses" element={<Navigate to="/gym/finance/expenses" replace />} />

        {/* Workout Management Routes */}
        <Route path="workouts" element={<WorkoutDashboardPage />} />
        <Route path="workouts/plans" element={<WorkoutPlansPage />} />
        <Route path="workouts/create" element={<WorkoutPlanFormPage />} />
        <Route path="workouts/:id/edit" element={<WorkoutPlanFormPage />} />
        <Route path="workouts/:id" element={<WorkoutPlanDetailsPage />} />
        <Route path="workouts/exercises" element={<ExerciseLibraryPage />} />
        <Route path="workouts/assign" element={<AssignWorkoutPage />} />
        <Route path="workouts/schedule" element={<WorkoutSchedulePage />} />
        <Route path="workouts/progress" element={<WorkoutProgressPage />} />
        <Route path="progress" element={<MemberFitnessProgressPage />} />
        <Route path="workouts/member-progress" element={<MemberFitnessProgressPage />} />

        {/* Diet & Nutrition Management Routes */}
        <Route path="diet" element={<DietDashboardPage />} />
        <Route path="diet/plans" element={<DietPlansPage />} />
        <Route path="diet/create" element={<DietPlanFormPage />} />
        <Route path="diet/:id/edit" element={<DietPlanFormPage />} />
        <Route path="diet/:id" element={<DietPlanDetailsPage />} />
        <Route path="diet/foods" element={<FoodLibraryPage />} />
        <Route path="diet/assign" element={<AssignDietPage />} />

        {/* Gym Settings & Profile Routes */}
        <Route path="profile" element={<OwnerProfilePage />} />
        <Route path="settings" element={<GymSettingsPage />} />
        <Route path="gym-profile" element={<GymBusinessProfilePage />} />

        {/* Step 14: Reports, Analytics & Notifications Module */}
        <Route path="analytics" element={<GymAnalyticsDashboardPage />} />
        <Route path="analytics/members" element={<MemberAnalyticsPage />} />
        <Route path="analytics/attendance" element={<AttendanceAnalyticsPage />} />
        <Route path="analytics/revenue" element={<RevenueAnalyticsDashboardPage />} />
        <Route path="analytics/memberships" element={<MembershipAnalyticsPage />} />
        <Route path="analytics/trainers" element={<TrainerStaffAnalyticsPage />} />
        <Route path="analytics/branches" element={<BranchPerformanceAnalyticsPage />} />
        <Route path="analytics/custom-reports" element={<CustomReportBuilderPage />} />
        <Route path="analytics/saved-reports" element={<SavedReportsPage />} />

        {/* Reports redirects */}
        <Route path="reports" element={<Navigate to="/gym/analytics" replace />} />
        <Route path="reports/revenue" element={<Navigate to="/gym/analytics/revenue" replace />} />
        <Route path="reports/attendance" element={<Navigate to="/gym/analytics/attendance" replace />} />
        <Route path="reports/members" element={<Navigate to="/gym/analytics/members" replace />} />
        <Route path="reports/expenses" element={<Navigate to="/gym/finance/expenses" replace />} />

        {/* Notifications & Announcements */}
        <Route path="notifications" element={<NotificationCenterPage />} />
        <Route path="notifications/settings" element={<NotificationSettingsPage />} />
        <Route path="notifications/announcements" element={<AnnouncementsPage />} />
        <Route path="notifications/announcements/create" element={<CreateAnnouncementPage />} />

        {/* Enquiries & Follow-ups */}
        <Route path="enquiries" element={<EnquiriesPage />} />
        <Route path="followups" element={<FollowupsPage />} />

        {GYM_MODULE_PLACEHOLDERS.map((item) => (
          <Route
            key={item.path}
            path={item.path}
            element={
              <GymModulePlaceholder
                title={item.title}
                description={item.description}
              />
            }
          />
        ))}
      </Route>

      {/* Member Routes */}
      <Route
        path={ROUTE_PATHS.MEMBER.BASE}
        element={
          <ProtectedRoute allowedRoles={[ROLES.MEMBER]}>
            <MemberLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to={ROUTE_PATHS.MEMBER.DASHBOARD} replace />} />
        <Route path="dashboard" element={<MemberDashboard />} />
        <Route path="profile" element={<MemberPortalProfilePage />} />
        <Route path="membership" element={<MemberPortalMembershipPage />} />
        <Route path="payments" element={<MemberPaymentsPage />} />
        <Route path="attendance" element={<MemberPortalAttendancePage />} />
        <Route path="workouts" element={<MemberWorkoutsPage />} />
        <Route path="workout" element={<Navigate to="/member/workouts" replace />} />
        <Route path="diet" element={<MemberDietPage />} />
        <Route path="progress" element={<MemberPortalFitnessProgressPage />} />
        <Route path="notifications" element={<MemberNotificationsPage />} />
        <Route path="announcements" element={<MemberAnnouncementsPage />} />
        <Route path="settings" element={<MemberSettingsPage />} />
      </Route>

      {/* Admin aliases for Super Admin */}
      <Route path="/admin/analytics" element={<Navigate to="/super-admin/analytics" replace />} />
      <Route path="/admin/analytics/gyms" element={<Navigate to="/super-admin/analytics/gyms" replace />} />
      <Route path="/admin/analytics/revenue" element={<Navigate to="/super-admin/analytics/revenue" replace />} />
      <Route path="/admin/analytics/subscriptions" element={<Navigate to="/super-admin/analytics/subscriptions" replace />} />
      <Route path="/admin/analytics/usage" element={<Navigate to="/super-admin/analytics/usage" replace />} />

      {/* 404 Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
