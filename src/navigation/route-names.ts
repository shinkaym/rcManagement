export const ROOT_ROUTES = {
  LOGIN: 'Login',
  APP_DRAWER: 'AppDrawer',
  SCAN_STACK: 'ScanStack',
} as const;

export const DRAWER_ROUTES = {
  MAIN_TABS: 'MainTabs',
  CATEGORY_STACK: 'CategoryStack',
} as const;

export const TAB_ROUTES = {
  HOME_STACK: 'HomeStack',
  REPORT_STACK: 'ReportStack',
  EMPLOYEE_STACK: 'EmployeeStack',
  SETTING_STACK: 'SettingStack',
} as const;

export const HOME_ROUTES = {
  HOME: 'Home',
} as const;

export const REPORT_ROUTES = {
  REPORT: 'Report',
} as const;

export const CATEGORY_ROUTES = {
  CATEGORY: 'Category',
} as const;

export const EMPLOYEE_ROUTES = {
  EMPLOYEE: 'Employee',
  EMPLOYEE_DETAIL: 'EmployeeDetail',
} as const;

export const SETTING_ROUTES = {
  SETTING: 'Setting',
  MY_ACCOUNT: 'MyAccount',
  MAP: 'Map',
  HELP: 'Help',
  ABOUT_US: 'AboutUs',
} as const;

export const SCAN_ROUTES = {
  SCAN: 'Scan',
  PREVIEW_SCAN: 'PreviewScan',
} as const;
