import React from 'react';
import { Card, Form, Input, Typography, Tooltip } from 'antd';
import { FileTextOutlined, LinkOutlined } from '@ant-design/icons';
import { SchemaData, FormField, FileItem } from './types';
import ApprovalChat from './ApprovalChat';
import styles from './approvalForm.module.scss';

const { Text } = Typography;

// 1. 提取工具函数
const Utils = {
  // 获取分组数据
  getGroups: (form_ui: SchemaData['form_ui']): FormField[][] => {
    try {
      const groups = form_ui.root.node.content.children;
      return groups.filter((child) => child?.content?.elementType === 'Group').map((child) => child.content.props?.children || []);
    } catch (error) {
      console.error('Error parsing group fields:', error);
      return [];
    }
  },

  // 分割字段为两列
  splitFieldsIntoColumns: (fields: FormField[]) => {
    const midIndex = Math.ceil(fields.length / 2);
    return {
      leftColumn: fields.slice(0, midIndex),
      rightColumn: fields.slice(midIndex),
    };
  },

  // 渲染标签（带省略和提示）
  renderLabel: (label: string) => (
    <Tooltip title={label} placement="topLeft">
      <span className="inline-block w-full whitespace-nowrap overflow-hidden text-ellipsis">{label}</span>
    </Tooltip>
  ),
};

// 2. 提取标签组件
const FormLabel: React.FC<{ text: string }> = ({ text }) => {
  if (text.length > 6) {
    return (
      <Tooltip title={text}>
        <span className="inline-block w-full truncate cursor-help">{text}</span>
      </Tooltip>
    );
  }
  return <span>{text}</span>;
};

// 3. 提取字段状态管理
const useFieldStyles = () => {
  const getFieldClasses = (fieldStatus: string) => {
    const baseClass = styles.formItem;
    const editableClass = fieldStatus !== 'READONLY' ? styles.editable : '';
    return `${baseClass} ${editableClass}`.trim();
  };

  const getInputClassName = (fieldStatus: string) => {
    return fieldStatus === 'READONLY' ? 'readonly-input' : 'editable-input';
  };

  return { getFieldClasses, getInputClassName };
};

// 4. 提取表单字段渲染器组件
const FormFieldRenderer: React.FC<{
  field: FormField;
  value: any;
  getFieldClasses: (status: string) => string;
}> = ({ field, value, getFieldClasses }) => {
  const { props, elementType } = field.content;
  const { label, name, fieldStatus } = props;

  const renderInputField = () => <Input value={value || ''} readOnly={fieldStatus === 'READONLY'} placeholder={label} />;

  const renderUserField = () => {
    const displayValue = Array.isArray(value) ? value.join(', ') : value;
    return <Input value={displayValue || ''} readOnly={fieldStatus === 'READONLY'} placeholder={label} />;
  };

  const renderFileListField = () => {
    if (!Array.isArray(value) || value.length === 0) {
      return <Text type="secondary">无附件</Text>;
    }

    return (
      <div className="space-y-2">
        {value.map((file: FileItem) => (
          <div key={file.uid} className="flex items-center py-1">
            <FileTextOutlined className="mr-2 text-gray-500" />
            <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">
              {file.name} {file.size}
            </a>
          </div>
        ))}
      </div>
    );
  };

  const renderLinkField = () => {
    if (!value) {
      return <Text type="secondary">无链接</Text>;
    }

    return (
      <a href={value.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline">
        <LinkOutlined className="mr-2" />
        {value.text || value.url}
      </a>
    );
  };

  const renderFieldContent = () => {
    switch (elementType) {
      case 'InputField':
        return renderInputField();
      case 'UserField':
        return renderUserField();
      case 'FileListField':
        return renderFileListField();
      case 'LinkField':
        return renderLinkField();
      default:
        return renderInputField();
    }
  };

  return (
    <Form.Item key={name} label={<FormLabel text={label} />} className={getFieldClasses(fieldStatus)}>
      {renderFieldContent()}
    </Form.Item>
  );
};

// 5. 提取卡片头组件
const CardHeader: React.FC<{ index: number }> = ({ index }) => {
  if (index !== 0) return null;

  return (
    <div className="flex items-center mb-8 gap-3">
      <h3 className="text-lg font-bold text-gray-900">FIN-09-供应商紧急付款审批表</h3>
      <div className="flex items-center gap-3">
        <span className="text-urgent bg-urgent-light px-4 py-1.5 rounded-full text-sm font-medium">紧急</span>
        <span className="text-business bg-business-light px-4 py-1.5 rounded-full text-sm font-medium">业务包</span>
        <span className="text-attention bg-attention-light border border-attention-border px-4 py-1.5 rounded-full text-sm font-medium">此申请金额较大，需重点关注！</span>
      </div>
    </div>
  );
};

// 6. 提取表单卡片组件
const FormCard: React.FC<{
  fields: FormField[];
  index: number;
  formValues: Record<string, any>;
}> = ({ fields, index, formValues }) => {
  const { getFieldClasses } = useFieldStyles();
  const { leftColumn, rightColumn } = Utils.splitFieldsIntoColumns(fields);

  return (
    <Card className="overflow-hidden border-0 shadow-sm mb-6 last:mb-0">
      <CardHeader index={index} />

      <Form layout="horizontal">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {leftColumn.map((field) => (
              <FormFieldRenderer key={field.content.props.name} field={field} value={formValues[field.content.props.name]} getFieldClasses={getFieldClasses} />
            ))}
          </div>
          <div className="space-y-6">
            {rightColumn.map((field) => (
              <FormFieldRenderer key={field.content.props.name} field={field} value={formValues[field.content.props.name]} getFieldClasses={getFieldClasses} />
            ))}
          </div>
        </div>
      </Form>
    </Card>
  );
};

// 7. 提取参照链接组件
const ReferenceLink: React.FC = () => (
  <div className="absolute top-5 right-10 z-10">
    <span className="text-sm cursor-pointer text-reference hover:text-reference/80 transition-colors">参照流程指导书：YFS-LSFI-WI-03-10</span>
  </div>
);

// 8. 主组件
const ApprovalForm: React.FC<{ schemaData: SchemaData }> = ({ schemaData }) => {
  const { form_ui, form_values } = schemaData;
  const groups = Utils.getGroups(form_ui);

  // 过滤掉 Table 类型的字段
  const filterNonTableFields = (fields: FormField[]) => fields.filter((field) => field.content.elementType !== 'Table');

  return (
    <div className="w-full min-h-screen px-12 bg-gray-50 flex">
      {/* 左侧表单区域 */}
      <div className="flex-1 mr-20 relative">
        <ReferenceLink />

        <div className="space-y-6">
          {groups.map((list, index) => {
            const fields = filterNonTableFields(list);
            if (fields.length === 0) return null;

            return <FormCard key={index} fields={fields} index={index} formValues={form_values.formValues} />;
          })}
        </div>
      </div>

      {/* 右侧聊天区域 */}
      <div className="w-[30rem]">
        <ApprovalChat />
      </div>
    </div>
  );
};

export default ApprovalForm;
