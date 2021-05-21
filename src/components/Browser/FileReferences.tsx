import type { SanityDocument } from '@sanity/client'
import { Box, Card, Text } from '@sanity/ui'
import { IntentLink } from 'part:@sanity/base/router'
import Preview from 'part:@sanity/base/preview'
import schema from 'part:@sanity/base/schema'
import { WithReferringDocuments } from 'part:@sanity/base/with-referring-documents'
import React from 'react'
import styled from 'styled-components'

const Container = styled(Box)`
  * {
    color: ${(props: any) => props.theme.sanity.color.base.fg};
  }
  a {
    text-decoration: none;
  }
  h2 {
    font-size: ${(props: any) => props.theme.sanity.fonts.text.sizes[1]};
  }
`

// Code adapted from Robin Pyon's sanity-plugin-media
// https://github.com/robinpyon/sanity-plugin-media/blob/master/src/components/DocumentList/index.tsx
// Thanks for paving the way, Robin!
const FileReferences: React.FC<{
  fileId: string
}> = (props) => {
  return (
    <Container>
      <WithReferringDocuments id={props.fileId}>
        {({
          isLoading,
          referringDocuments,
        }: {
          isLoading: boolean
          referringDocuments: SanityDocument
        }) => {
          const draftIds = referringDocuments.reduce(
            (acc: string[], doc: SanityDocument) =>
              doc._id.startsWith('drafts.')
                ? acc.concat(doc._id.slice(7))
                : acc,
            [],
          )

          const filteredDocuments: SanityDocument[] = referringDocuments.filter(
            (doc: SanityDocument) => !draftIds.includes(doc._id),
          )

          if (isLoading) {
            return <Text size={1}>Loading...</Text>
          }

          if (filteredDocuments.length === 0) {
            return <Text size={1}>No documents are referencing this asset</Text>
          }

          return filteredDocuments?.map((doc) => {
            const schemaType = schema.get(doc._type)

            return (
              <Card
                key={doc._id}
                marginBottom={2}
                padding={2}
                radius={2}
                shadow={1}
                style={{ overflow: 'hidden' }}
              >
                <Box>
                  {schemaType ? (
                    <IntentLink
                      intent="edit"
                      params={{ id: doc._id }}
                      key={doc._id}
                    >
                      <Preview layout="default" value={doc} type={schemaType} />
                    </IntentLink>
                  ) : (
                    <Box padding={2}>
                      <Text size={1}>
                        A document of the unknown type <em>{doc._type}</em>
                      </Text>
                    </Box>
                  )}
                </Box>
              </Card>
            )
          })
        }}
      </WithReferringDocuments>
    </Container>
  )
}

export default FileReferences
