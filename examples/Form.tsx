
import React from 'react'
import {
  FormItem,
  Input,
  Select,
  Checkbox
} from '@formily/antd'
import { DataField, createForm, onFieldInit, onFieldReact, onFormValuesChange } from '@formily/core'
import { FormProvider, createSchemaField } from '@formily/react'
import { onFieldValueChange } from '@formily/core'
import { ArrayCategoryList, DynamicSchemaComponents } from './ArrayCategoryList'
import { toJS } from '@formily/reactive'

const SchemaField = createSchemaField({
  components: {
    FormItem,
    Input,
    Select,
    Checkbox,
    ArrayCategoryList,
    DynamicSchemaComponents,
  },
})

const form = createForm({
  initialValues: {
    test: [{
      categoryId: 1
    }]
  },
  effects: () => {
    onFieldReact('*(test.*.categoryId)', (field) => {
      const detailField = field.query('.detail').take()
      detailField?.setComponentProps({
        categoryId: (field as DataField).value
      })
    })
    onFormValuesChange(form => {
      console.log('formChange:', toJS(form.values))
    })
  },
})

export const Demo = () => {
  return (
    <FormProvider form={form}>
      <SchemaField>
        <SchemaField.Array
          name="test"
          x-decorator="FormItem"
          x-component="ArrayCategoryList"
        >
          <SchemaField.Object>
            <SchemaField.String
              name="categoryId"
              x-decorator="FormItem"
              title="{{$index === 0 ? '主营类目' : '辅营类目'}}"
              required
              enum={[
                { value: 1, label: '1' },
                { value: 2, label: '2' }
              ]}
              x-component="Select"
            />
            <SchemaField.String name="detail" x-component="DynamicSchemaComponents" />
            <SchemaField.Void x-component="ArrayCategoryList.Remove" />
            {/* <SchemaField.Void x-component="ArrayCategoryList.MoveUp" />
            <SchemaField.Void x-component="ArrayCategoryList.MoveDown" /> */}
          </SchemaField.Object>
          <SchemaField.Void
            x-component="ArrayCategoryList.Addition"
            title="添加条目"
            x-component-props={{
              title: '添加辅营类目'
            }}
          />
        </SchemaField.Array>
      </SchemaField>
    </FormProvider>
  )
}