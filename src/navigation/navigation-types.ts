import type { NavigatorScreenParams } from '@react-navigation/native';

import {
  CATEGORY_ROUTES,
  DRAWER_ROUTES,
  EMPLOYEE_ROUTES,
  HOME_ROUTES,
  REPORT_ROUTES,
  ROOT_ROUTES,
  SCAN_ROUTES,
  SETTING_ROUTES,
  TAB_ROUTES,
} from './route-names';

export type RootStackParamList = {
  [ROOT_ROUTES.LOGIN]: undefined;
  [ROOT_ROUTES.APP_DRAWER]: NavigatorScreenParams<AppDrawerParamList> | undefined;
  [ROOT_ROUTES.SCAN_STACK]: NavigatorScreenParams<ScanStackParamList> | undefined;
};

export type AppDrawerParamList = {
  [DRAWER_ROUTES.MAIN_TABS]: NavigatorScreenParams<MainTabParamList> | undefined;
  [DRAWER_ROUTES.CATEGORY_STACK]: NavigatorScreenParams<CategoryStackParamList> | undefined;
};

export type MainTabParamList = {
  [TAB_ROUTES.HOME_STACK]: NavigatorScreenParams<HomeStackParamList> | undefined;
  [TAB_ROUTES.REPORT_STACK]: NavigatorScreenParams<ReportStackParamList> | undefined;
  [TAB_ROUTES.EMPLOYEE_STACK]: NavigatorScreenParams<EmployeeStackParamList> | undefined;
  [TAB_ROUTES.SETTING_STACK]: NavigatorScreenParams<SettingStackParamList> | undefined;
};

export type HomeStackParamList = {
  [HOME_ROUTES.HOME]: undefined;
};

export type ReportStackParamList = {
  [REPORT_ROUTES.REPORT]: undefined;
};

export type CategoryStackParamList = {
  [CATEGORY_ROUTES.CATEGORY]: undefined;
};

export type EmployeeStackParamList = {
  [EMPLOYEE_ROUTES.EMPLOYEE]: undefined;
  [EMPLOYEE_ROUTES.EMPLOYEE_DETAIL]: {
    employeeId?: string;
    mode: 'create' | 'edit';
  };
};

export type SettingStackParamList = {
  [SETTING_ROUTES.SETTING]: undefined;
  [SETTING_ROUTES.MY_ACCOUNT]: undefined;
  [SETTING_ROUTES.MAP]: undefined;
  [SETTING_ROUTES.HELP]: undefined;
  [SETTING_ROUTES.ABOUT_US]: undefined;
};

export type ScanStackParamList = {
  [SCAN_ROUTES.SCAN]: undefined;
  [SCAN_ROUTES.PREVIEW_SCAN]: undefined;
};
