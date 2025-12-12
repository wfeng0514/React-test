import React from 'react';
import { Card, Form, Input, Typography, Tooltip } from 'antd';
import { FileTextOutlined, LinkOutlined } from '@ant-design/icons';
import { SchemaData, FormField, FileItem } from './types';
import ApprovalChat from './ApprovalChat';
import styles from './approvalForm.module.scss';

const { Text } = Typography;

// 主组件
const ApprovalForm: React.FC<{ schemaData: SchemaData }> = ({ schemaData }) => {
  const { form_ui, form_values } = schemaData;
  const formValues = form_values.formValues;

  // 获取分组
  const getGroup = (): Array<FormField[]> => {
    try {
      const groups = form_ui.root.node.content.children;
      let arr: Array<FormField[]> = [];

      // 遍历分组字段
      for (const child of groups) {
        if (child?.content?.elementType === 'Group') {
          arr.push(child.content.props?.children || []);
        }
      }

      return arr;
    } catch (error) {
      console.error('Error parsing group fields:', error);
      return [];
    }
  };

  const groups = getGroup();

  // 处理标签显示 - 三点省略 + Tooltip
  const renderLabel = (label: string) => {
    return (
      <Tooltip title={label} placement="topLeft">
        <span style={{ display: 'inline-block', width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
      </Tooltip>
    );
  };

  // 将字段分成两列
  const splitFieldsIntoColumns = (fields: FormField[]) => {
    const midIndex = Math.ceil(fields.length / 2);
    return { leftColumn: fields.slice(0, midIndex), rightColumn: fields.slice(midIndex) };
  };

  // 渲染不同类型的表单字段
  const renderFormField = (field: FormField) => {
    const { props, elementType } = field.content;
    const { label, name, fieldStatus } = props;
    const value = formValues[name];

    // 动态类名处理长标签
    let formItemClass = styles.formItem;
    if (fieldStatus !== 'READONLY') {
      formItemClass = `${formItemClass}  ${styles.editable}`;
    }

    if (elementType === 'InputField') {
      return (
        <Form.Item key={name} label={renderLabel(label)} className={formItemClass}>
          <Input value={value || ''} readOnly={fieldStatus === 'READONLY'} placeholder={label} />
        </Form.Item>
      );
    }

    if (elementType === 'UserField') {
      const displayValue = Array.isArray(value) ? value.join(', ') : value;
      return (
        <Form.Item key={name} label={renderLabel(label)} className={formItemClass}>
          <Input value={displayValue || ''} readOnly={fieldStatus === 'READONLY'} placeholder={label} />
        </Form.Item>
      );
    }

    if (elementType === 'FileListField') {
      return (
        <Form.Item key={name} label={renderLabel(label)} className={formItemClass}>
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
        <Form.Item key={name} label={renderLabel(label)} className={formItemClass}>
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

    // 默认情况
    return (
      <Form.Item key={name} label={renderLabel(label)} className={formItemClass}>
        <Input value={value || ''} readOnly={fieldStatus === 'READONLY'} placeholder={label} />
      </Form.Item>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        {groups.map((list: FormField[], index) => {
          /**
           * 将普通字段分成两列
           */
          const fields = list.filter((field) => field.content.elementType !== 'Table');
          const { leftColumn, rightColumn } = splitFieldsIntoColumns(fields);

          return (
            <Card className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>{'FIN-09-供应商紧急付款审批表'}</h3>
                {index === 0 ? (
                  <div className={styles.emergency}>
                    <div className={styles.urgent}>紧急</div>
                    <div className={styles.business}>业务包</div>
                    <div className={styles.attention}>此申请金额较大，需重点关注！</div>
                  </div>
                ) : null}
              </div>
              <div className={styles.formLayout}>
                <Form layout="horizontal" className={styles.form_ui}>
                  <div className={styles.column}>{leftColumn.map(renderFormField)}</div>
                  <div className={styles.column}>{rightColumn.map(renderFormField)}</div>
                </Form>
              </div>
            </Card>
          );
        })}
        <div className={styles.reference}>参照流程指导书：YFS-LSFI-WI-03-10</div>
      </div>

      <div className={styles.sidebar}>
        <ApprovalChat />
      </div>
    </div>
  );
};

export default ApprovalForm;
