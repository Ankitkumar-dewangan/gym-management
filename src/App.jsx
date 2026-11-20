import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter } from 'react-router-dom';
import { AttendanceManagementProvider } from './contexts/AttendanceManagementContext';
import { AuthProvider } from './contexts/AuthContext';
import { BranchManagementProvider } from './contexts/BranchManagementContext';
import { GymManagementProvider } from './contexts/GymManagementContext';
import { MemberManagementProvider } from './contexts/MemberManagementContext';
import { MembershipManagementProvider } from './contexts/MembershipManagementContext';
import { PlatformManagementProvider } from './contexts/PlatformManagementContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { TenantProvider } from './contexts/TenantContext';
import { TrainerStaffProvider } from './contexts/TrainerStaffContext';
import { WorkoutDietProvider } from './contexts/WorkoutDietContext';
import { GymFinanceProvider } from './contexts/GymFinanceContext';
import { GymAnalyticsNotificationsProvider } from './contexts/GymAnalyticsNotificationsContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  useEffect(() => {
    try {
      if (!localStorage.getItem('GymPilot_data_clean_v2')) {
        const legacyKeys = [
          'GymPilot_members_v1',
          'GymPilot_branches_v1',
          'GymPilot_branch_managers_v1',
          'GymPilot_branch_staff_v1',
          'GymPilot_branch_logs_v1',
          'GymPilot_membership_plans_v1',
          'GymPilot_memberships_v1',
          'GymPilot_membership_offers_v1',
          'GymPilot_attendance_records_v1',
          'GymPilot_attendance_corrections_v1',
          'GymPilot_attendance_settings_v1',
          'GymPilot_trainers_v1',
          'GymPilot_trainer_assignments_v1',
          'GymPilot_training_sessions_v1',
          'GymPilot_staff_v1',
          'GymPilot_staff_attendance_v1',
          'GymPilot_payroll_v1',
          'GymPilot_super_admin_gyms_v1',
          'GymPilot_super_admin_subscriptions_v1',
          'GymPilot_platform_management_v1',
          'GymPilot_preview_user',
          'GymPilot_active_tenant_id',
          'GymPilot_active_branch_id',
        ];
        legacyKeys.forEach((key) => localStorage.removeItem(key));
        localStorage.setItem('GymPilot_data_clean_v2', 'true');
      }
    } catch {
      // Ignore storage errors
    }
  }, []);
  return (
    <BrowserRouter>
      <AuthProvider>
        <TenantProvider>
          <BranchManagementProvider>
            <MemberManagementProvider>
              <MembershipManagementProvider>
                <AttendanceManagementProvider>
                  <TrainerStaffProvider>
                    <GymManagementProvider>
                      <SubscriptionProvider>
                        <PlatformManagementProvider>
                          <WorkoutDietProvider>
                            <GymFinanceProvider>
                              <GymAnalyticsNotificationsProvider>
                                <AppRoutes />
                              </GymAnalyticsNotificationsProvider>
                            </GymFinanceProvider>
                          </WorkoutDietProvider>
                          <Toaster
                            position="top-right"
                            toastOptions={{
                              duration: 3000,
                              style: {
                                background: '#0F1E36',
                                color: '#FFFFFF',
                                fontSize: '13px',
                                borderRadius: '0.625rem',
                                padding: '10px 14px',
                              },
                            }}
                          />
                        </PlatformManagementProvider>
                      </SubscriptionProvider>
                    </GymManagementProvider>
                  </TrainerStaffProvider>
                </AttendanceManagementProvider>
              </MembershipManagementProvider>
            </MemberManagementProvider>
          </BranchManagementProvider>
        </TenantProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
