import React from 'react';
import { Card, Form, Input, Table, Typography, Tooltip } from 'antd';
import { UserOutlined, FileTextOutlined, LinkOutlined } from '@ant-design/icons';
// 类型定义
import { SchemaData, FormField, FileItem, TableRow } from './types';
import styles from './approvalForm.module.scss';

const { Text } = Typography;

// 主组件
const ApprovalForm: React.FC<{ schemaData: SchemaData }> = ({ schemaData }) => {
  const { form_ui, form_values } = schemaData;
  const formValues = form_values.formValues;

  // 获取分组字段
  const getGroupFields = (): FormField[] => {
    try {
      const groupField = form_ui.root.node.content.children[0];
      if (groupField?.content?.elementType === 'Group' && groupField.content.props.children) {
        return groupField.content.props.children;
      }
      return [];
    } catch (error) {
      console.error('Error parsing group fields:', error);
      return [];
    }
  };

  const groupFields = getGroupFields();

  // 判断是否为长标签
  const isLongLabel = (label: string): boolean => {
    return label.length > 8; // 中文超过4个字符或英文超过8个字符视为长标签
  };

  // 处理标签显示 - 三点省略 + Tooltip
  const renderLabel = (label: string) => {
    if (isLongLabel(label)) {
      return (
        <Tooltip title={label} placement="topLeft">
          <span
            style={{
              display: 'inline-block',
              width: '100%',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {label}
          </span>
        </Tooltip>
      );
    }
    return label;
  };

  // 将字段分成两列
  const splitFieldsIntoColumns = (fields: FormField[]) => {
    const midIndex = Math.ceil(fields.length / 2);
    return {
      leftColumn: fields.slice(0, midIndex),
      rightColumn: fields.slice(midIndex),
    };
  };

  const { leftColumn, rightColumn } = splitFieldsIntoColumns(groupFields);

  // 表单布局配置
  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 8 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 16 },
    },
  };

  // 渲染不同类型的表单字段
  const renderFormField = (field: FormField) => {
    const { props, elementType } = field.content;
    const { label, name, fieldStatus } = props;
    const value = formValues[name];

    // 动态类名处理长标签
    let formItemClass = isLongLabel(label) ? `${styles.formItem} ${styles.longLabel}` : styles.formItem;
    if (fieldStatus !== 'READONLY') {
      formItemClass = `${formItemClass}  ${styles.editable}`;
    }

    if (elementType === 'InputField') {
      return (
        <Form.Item key={name} label={renderLabel(label)} {...formItemLayout} className={formItemClass}>
          <Input value={value || ''} readOnly={fieldStatus === 'READONLY'} placeholder={label} />
        </Form.Item>
      );
    }

    if (elementType === 'UserField') {
      const displayValue = Array.isArray(value) ? value.join(', ') : value;
      return (
        <Form.Item key={name} label={renderLabel(label)} {...formItemLayout} className={formItemClass}>
          <Input value={displayValue || ''} readOnly={fieldStatus === 'READONLY'} prefix={<UserOutlined />} placeholder={label} />
        </Form.Item>
      );
    }

    if (elementType === 'FileListField') {
      return (
        <Form.Item key={name} label={renderLabel(label)} {...formItemLayout} className={formItemClass}>
          {Array.isArray(value) && value.length > 0 ? (
            <div>
              {value.map((file: FileItem) => (
                <div key={file.uid} className={styles.fileItem}>
                  <FileTextOutlined className={styles.fileIcon} />
                  <a href={file.url} target="_blank" rel="noopener noreferrer">
                    {file.name} {file.size}
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <Text type="secondary">无附件</Text>
          )}
        </Form.Item>
      );
    }

    if (elementType === 'LinkField') {
      return (
        <Form.Item key={name} label={renderLabel(label)} {...formItemLayout} className={formItemClass}>
          {value ? (
            <a href={value.url} target="_blank" rel="noopener noreferrer" className={styles.linkItem}>
              <LinkOutlined className={styles.linkIcon} />
              {value.text || value.url}
            </a>
          ) : (
            <Text type="secondary">无链接</Text>
          )}
        </Form.Item>
      );
    }

    if (elementType === 'Table') {
      const tableData = formValues[props.id || name] || [];
      const columns =
        props.visibleColumns?.map((col: any) => ({
          title: col.title,
          dataIndex: col.id,
          key: col.id,
          render: (value: any, record: TableRow) => {
            const fieldValue = record[`field${col.id}_0`] || value;
            return <Text>{fieldValue}</Text>;
          },
        })) || [];

      return (
        <Form.Item key={name} label={renderLabel(props.label || '表格数据')} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} className={styles.fullWidthItem}>
          <Table dataSource={tableData} columns={columns} pagination={false} size="small" bordered rowKey="key" />
        </Form.Item>
      );
    }

    // 默认情况
    return (
      <Form.Item key={name} label={renderLabel(label)} {...formItemLayout} className={formItemClass}>
        <Input value={value || ''} readOnly={fieldStatus === 'READONLY'} placeholder={label} />
      </Form.Item>
    );
  };

  // 渲染分组
  const renderGroup = () => {
    const groupField = form_ui.root.node.content.children[0];

    if (groupField?.content?.elementType === 'Group') {
      const groupProps = groupField.content.props;
      const title = groupProps.title?.content?.fallback || '审批详情';

      // 分离表格字段和普通字段
      const tableFields = groupFields.filter((field) => field.content.elementType === 'Table');
      const normalFields = groupFields.filter((field) => field.content.elementType !== 'Table');

      // 将普通字段分成两列
      const { leftColumn, rightColumn } = splitFieldsIntoColumns(normalFields);

      return (
        <Card title={title} className={styles.card}>
          <div className={styles.formLayout}>
            {/* 左列 */}
            <div className={styles.column}>
              <Form layout="horizontal">{leftColumn.map(renderFormField)}</Form>
            </div>

            {/* 右列 */}
            <div className={styles.column}>
              <Form layout="horizontal">{rightColumn.map(renderFormField)}</Form>
            </div>
          </div>

          {/* 表格字段单独渲染，占满整行 */}
          {tableFields.map((field) => (
            <div key={field.content.props.name} className={styles.tableSection}>
              {renderFormField(field)}
            </div>
          ))}
        </Card>
      );
    }

    return null;
  };

  return <div className={styles.container}>{renderGroup()}</div>;
};

export default ApprovalForm;
