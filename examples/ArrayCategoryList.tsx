import React, { useEffect, useState } from 'react'
import {
  useField,
  observer,
  useFieldSchema,
  RecursionField,
  useForm,
  Schema,
} from '@formily/react'
import { ArrayField } from '@formily/core'
import { ISchema } from '@formily/json-schema'
import { ArrayBase, ArrayBaseMixins, IArrayBaseProps  } from '@formily/antd'
import { isValid, clone, isUndef } from '@formily/shared'
import { Empty, Button } from 'antd'

type ArrayCategoryListProps = {
  title: string
}

const isAdditionComponent = (schema: ISchema) => {
  return schema['x-component']?.indexOf('Addition') > -1
}

const isIndexComponent = (schema: ISchema) => {
  return schema['x-component']?.indexOf?.('Index') > -1
}

const isRemoveComponent = (schema: ISchema) => {
  return schema['x-component']?.indexOf?.('Remove') > -1
}

const isCopyComponent = (schema: ISchema) => {
  return schema['x-component']?.indexOf?.('Copy') > -1
}

const isMoveUpComponent = (schema: ISchema) => {
  return schema['x-component']?.indexOf?.('MoveUp') > -1
}

const isMoveDownComponent = (schema: ISchema) => {
  return schema['x-component']?.indexOf?.('MoveDown') > -1
}

const isOperationComponent = (schema: ISchema) => {
  return (
    isAdditionComponent(schema) ||
    isRemoveComponent(schema) ||
    isCopyComponent(schema) ||
    isMoveDownComponent(schema) ||
    isMoveUpComponent(schema)
  )
}

type ComposedArrayCategoryList = React.FC<
  React.PropsWithChildren<ArrayCategoryListProps & IArrayBaseProps>
> &
  ArrayBaseMixins

export const ArrayCategoryList: ComposedArrayCategoryList = observer((props) => {
  const field = useField<ArrayField>()
  const schema = useFieldSchema()
  const dataSource = Array.isArray(field.value) ? field.value : []
  const { onAdd, onCopy, onRemove, onMoveDown, onMoveUp } = props

  if (!schema) throw new Error('can not found schema object')

  const renderAddition = () => {
    return schema.reduceProperties((addition, schema, key) => {
      if (isAdditionComponent(schema)) {
        return <RecursionField schema={schema} name={key} />
      }
      return addition
    }, null)
  }

  const renderItems = () => {
    return dataSource?.map((item, index) => {
      const items = Array.isArray(schema.items)
        ? schema.items[index] || schema.items[0]
        : schema.items
      if (!items) return null
      const title = (
        <span>
          <RecursionField
            schema={items}
            name={index}
            filterProperties={(schema) => {
              if (!isIndexComponent(schema)) return false
              return true
            }}
            onlyRenderProperties
          />
          {props.title || field.title}
        </span>
      )
      const extra = (
        <span>
          <RecursionField
            schema={items}
            name={index}
            filterProperties={(schema) => {
              if (!isOperationComponent(schema)) return false
              return true
            }}
            onlyRenderProperties
          />
        </span>
      )
      
      const content = (
        <RecursionField
          schema={items}
          name={index}
          filterProperties={(schema) => {
            if (isIndexComponent(schema)) return false
            if (isOperationComponent(schema)) return false
            return true
          }}
        />
      )

      return (
        <ArrayBase.Item
          key={index}
          index={index}
          record={() => field.value?.[index]}
        >
          <div style={{ padding: '10px', backgroundColor: '#e5e5e5', marginBottom: '10px' }}>
            <div style={{ display: 'flex' }}>
              <h2>#{index+1}</h2>
              {index === 0 ? (<div style={{ marginLeft: 10 }}>{renderAddition()}</div>) : <div  style={{ marginLeft: 10 }}>{extra}</div>}
            </div>
              
              <div>{content}</div>
          </div>
        </ArrayBase.Item>
      )
    })
  }

  const renderEmpty = () => {
    if (dataSource?.length) return null
    if (dataSource?.length) {
      return (
        <div>
          <Empty />
        </div>
      ) 
    }
  }

  return (
    <ArrayBase
      onAdd={onAdd}
      onCopy={onCopy}
      onRemove={onRemove}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
    >
      {renderEmpty()}
      {renderItems()}
    </ArrayBase>
  )
}, {
  displayName: 'ArrayCategoryList'
})

const getSchemaDefaultValue = (schema: Schema) => {
  if (schema?.type === 'array') return []
  if (schema?.type === 'object') return {}
  if (schema?.type === 'void') {
    for (let key in schema.properties) {
      const value = getSchemaDefaultValue(schema.properties[key])
      if (isValid(value)) return value
    }
  }
}

const getDefaultValue = (defaultValue: any, schema: Schema) => {
  if (isValid(defaultValue)) return clone(defaultValue)
  if (Array.isArray(schema?.items))
    return getSchemaDefaultValue(schema?.items[0])
  return getSchemaDefaultValue(schema?.items)
}

const Addition: ArrayBaseMixins['Addition'] = (props) => {
  const self = useField()
  const array = ArrayBase.useArray!()
  if (!array) return null
  if (
    array.field?.pattern !== 'editable' &&
    array.field?.pattern !== 'disabled'
  )
    return null
  return (
    <Button
      {...props}
      type="text"
      disabled={self?.disabled}
      onClick={(e) => {
        if (array.props?.disabled) return
        const defaultValue = getDefaultValue(props.defaultValue, array.schema)
        if (props.method === 'unshift') {
          array.field?.unshift?.(defaultValue)
          array.props?.onAdd?.(0)
        } else {
          array.field?.push?.(defaultValue)
          array.props?.onAdd?.(array?.field?.value?.length - 1)
        }
        if (props.onClick) {
          props.onClick(e)
        }
      }}
    >
      {props.title || self.title}
    </Button>
  )
}

ArrayCategoryList.Addition = Addition
ArrayCategoryList.Copy = ArrayBase.Copy
ArrayCategoryList.Index = ArrayBase.Index
ArrayCategoryList.MoveDown = ArrayBase.MoveDown
ArrayCategoryList.MoveUp = ArrayBase.MoveUp
ArrayCategoryList.Remove = ArrayBase.Remove
ArrayCategoryList.SortHandle = ArrayBase.SortHandle

type DynamicSchemaComponentsProps = {
  categoryId: number | undefined
}

export const DynamicSchemaComponents: React.FC<React.PropsWithChildren<DynamicSchemaComponentsProps>> = (props) => {
  const [schema, setSchema] = useState<ISchema>(undefined as unknown as ISchema)
  const field = useField()
  const form = useForm()
  
  useEffect(() => {
    form.clearFormGraph(`${field.address}.*`)
    switch(props.categoryId) {
      case (1): {
        setSchema({
          type: 'object',
          properties: {
            key1: {
              type: 'string',
              title: '复选字段',
              "x-component": "Input",
              "x-decorator": "FormItem"
            },
            checkbox: {
              type: 'string',
              title: '图片',
              "x-component": "Checkbox.Group",
              "x-decorator": "FormItem",
              enum: [
                {
                  label: '选项1',
                  value: 1,
                },
                {
                  label: '选项2',
                  value: 2,
                },
              ]
            }
          }
        })
        break;
      }
      case (2): {
        setSchema({
          type: 'object',
          properties: {
            key2: {
              type: 'string',
              title: '字段2',
              "x-component": "Input",
              "x-decorator": "FormItem"
            },
            select1: {
              type: 'string',
              title: '选择器',
              required: true,
              "x-component": "Select",
              "x-decorator": "FormItem",
              enum: [{ value: 'aaa', label: 'aaa' }, { value: 'bbb', label: 'bbb' }]
            }
          }
        })
        break
      }
      default: {
        return
      }
    }
  }, [props.categoryId])

  if (!schema) return <div style={{ color: 'blue' }}>请先选择类目ID</div>
  console.log(field.parent.address.entire)
  return (
    <div>
      <RecursionField
        schema={schema}
        onlyRenderProperties
        basePath={field.address}
      />
    </div>
  )
}