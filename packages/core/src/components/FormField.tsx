import { Flex, Stack, Text } from '@sanity/ui'
import { PropsWithChildren } from 'react'
import { FormFieldValidationStatus, ValidationMarker } from 'sanity'

export default function FormField(
  props: PropsWithChildren<{
    label: string
    description?: string
    markers?: ValidationMarker[]
  }>,
) {
  return (
    <Stack space={2}>
      <Text weight="semibold" size={1}>
        <Flex gap={2} align="center">
          {props.label}
          <FormFieldValidationStatus
            validation={props.markers?.map((m) => ({
              level: m.level,
              message: m.message || m.item?.message || '',
              path: m.path,
            }))}
          />
        </Flex>
      </Text>
      {props.description && (
        <Text size={1} muted>
          {props.description}
        </Text>
      )}
      {props.children}
    </Stack>
  )
}
