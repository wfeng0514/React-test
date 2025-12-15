// 更准确的类型定义
export interface I18nContent {
  fallback: string;
  key?: string;
}

export interface TitleContent {
  type: string;
  content: I18nContent;
}

export interface FieldProps {
  label: string;
  name: string;
  fieldStatus: string;
  elementType: string;
  defaultValue?: any;
  id?: string;
  visibleColumns?: any[];
  title?: TitleContent;
  children?: FormField[];
  groupProps?: {
    title: string;
    usePlainTitle?: boolean;
  };
}

export interface FormFieldContent {
  props: FieldProps;
  elementType: string;
  directives?: any;
}

export interface FormField {
  type: string;
  content: FormFieldContent;
}

export interface FileItem {
  url: string;
  uid: string;
  size: string;
  name: string;
}

export interface LinkValue {
  url: string;
  text: string;
}

export interface TableRow {
  [key: string]: any;
  key: string;
}

export interface FormValuesData {
  [key: string]: any;
  sqsj: string;
  sqrxm: string[];
  xmyskz: string;
  requestname: string;
  sfwsncc: string;
  fygsms: string;
  cbzxkz: string;
  fj: FileItem[];
  gsdm: string;
  lrzxdm: string;
  pjzs: string;
  nbdd: string;
  sqrzg: string[];
  nbddlx: string;
  dmdppt: LinkValue;
  bm: string;
  jzgsdm: string;
  sqbh: string;
  zxmhwbsh: string;
  sqrbm: string;
  bz: string;
  sm: string;
  formtable_main_950_dt1: TableRow[];
  sqlx: string;
  lrzxms: string;
  fycdbmdm: string;
  gsms: string;
  sfglxm: string;
  fylrzxms: string;
  bgsybg: string;
  fqrxm: string[];
  gw: string;
  sqrgzdd: string;
  clsqdcs: string;
  bgsm: string;
  sfwprymxggncc: string;
  sqrqy: string;
  sfwkcsxxmpx: string;
  lrzxkz: string;
  fqrgh: string;
  sqrgh: string;
  ccsysq: string;
  cbzxmc: string;
  sqrgj: string;
}

export interface DocInfo {
  definitionName: string;
  sourceName: string;
  initiators: any[];
  startTime: number;
  showPrint: boolean;
  supportPrint: boolean;
  headerColor: string;
  layout: string;
  belongingSystem: string;
  sharedFor: string;
}

export interface FormValues {
  formValues: FormValuesData;
  doc: DocInfo;
}

export interface I18nStore {
  [language: string]: {
    [key: string]: string;
  };
}

export interface I18nData {
  store: I18nStore;
}

export interface MetaData {
  atSchemaVersion: string;
}

export interface RootNode {
  type: string;
  content: {
    props: {
      type: string;
      content: {
        referenceType: string;
        id: string;
      };
      layout: string;
    };
    children: FormField[];
    elementType: string;
  };
}

export interface RootData {
  node: RootNode;
  name: string;
}

export interface FormUI {
  i18n: I18nData;
  meta: MetaData;
  root: RootData;
  name: string;
}

export interface SchemaData {
  code: number;
  msg: string;
  form_ui: FormUI;
  form_values: FormValues;
}
