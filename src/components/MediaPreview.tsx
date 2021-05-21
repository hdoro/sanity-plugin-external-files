import { Spinner, Card, Box } from '@sanity/ui'
import { PlayIcon } from '@sanity/icons'
import { blue } from '@sanity/color'
import React from 'react'

import sanityClient, { imageBuilder } from '../scripts/sanityClient'
import { MediaFile, SanityUpload } from '../types'
import VideoIcon from './VideoIcon'
import AudioIcon from './AudioIcon'

export interface MediaPreview {
  file: MediaFile
  context: 'browser' | 'input' | 'detailsDialog'
}

const Player: React.FC<SanityUpload> = (props) => {
  if (!props.firebase) {
    return null
  }
  if (props.firebase.contentType?.includes('audio')) {
    return (
      <audio src={props.firebase.downloadURL} controls={true} autoPlay={true} />
    )
  }
  return (
    <video
      style={{
        width: '100%',
        height: 'auto',
      }}
      src={props.firebase.downloadURL}
      controls={true}
      autoPlay={true}
    />
  )
}

const WrappingCard: React.FC<Pick<MediaPreview, 'context'>> = ({
  children,
  context,
}) => {
  return (
    <Card
      padding={context === 'input' ? 4 : 0}
      border={context === 'input'}
      display="flex"
      style={{
        textAlign: 'center',
        width: '100%',
        position: 'relative',
        // 16:9 aspect ratio
        paddingBottom: '56.25%',
      }}
      sizing="border"
    >
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%,-50%)',
          width: '100%',
          height: '100%',
        }}
      >
        {children}
      </div>
    </Card>
  )
}

const MediaPreview: React.FC<MediaPreview> = (props) => {
  const [playing, setPlaying] = React.useState(false)
  const [fullFile, setFullFile] = React.useState<SanityUpload>()

  const expandReference = React.useCallback(async (_ref) => {
    const doc = await sanityClient.fetch<SanityUpload>(`*[_id == $id][0]`, {
      id: _ref,
    })
    setFullFile(doc)
  }, [])

  React.useEffect(() => {
    if ((props.file as any)?.firebase?.downloadURL) {
      setFullFile(props.file as SanityUpload)
    } else if (props.file?.asset?._ref) {
      expandReference(props.file.asset._ref)
    }
  }, [props.file])

  if (!props.file) {
    return null
  }
  if (!fullFile) {
    return (
      <WrappingCard context={props.context}>
        <Spinner />
      </WrappingCard>
    )
  }

  const imgUrl =
    fullFile.screenshot &&
    imageBuilder.image(fullFile.screenshot).width(600).url()
  const mediaType = fullFile.firebase.contentType?.includes('audio')
    ? 'audio'
    : 'video'

  const allowPlayback = props.context !== 'browser'
  return (
    <WrappingCard context={props.context}>
      {playing ? (
        <Player {...fullFile} />
      ) : (
        <>
          {imgUrl ? (
            <img
              style={{ width: '100%', borderRadius: '.3rem' }}
              src={imgUrl}
              alt={`Video's thumbnail`}
            />
          ) : (
            <Card
              padding={0}
              sizing="border"
              style={{
                width: '100%',
                position: 'relative',
                // 16:9 aspect ratio
                paddingBottom: '56.25%',
              }}
              tone="primary"
            >
              <Box
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%,-50%)',
                  color: blue[800].hex,
                }}
              >
                {mediaType === 'audio' ? (
                  <AudioIcon style={{ width: '50%', maxHeight: '70%' }} />
                ) : (
                  <VideoIcon style={{ width: '50%', maxHeight: '70%' }} />
                )}
              </Box>
            </Card>
          )}
          {allowPlayback && (
            <button
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%,-50%)',
                fontSize: '3rem',
                width: '1.5em',
                height: '1.5em',
                display: 'flex',
                borderRadius: '50%',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'white',
                border: '1px solid #ced2d9',
                boxShadow: '1px 1px 6px rgba(134,144,160,0.2)',
                cursor: 'pointer',
              }}
              onClick={() => setPlaying(true)}
              aria-label={`Play ${mediaType}`}
            >
              <PlayIcon />
            </button>
          )}
        </>
      )}
    </WrappingCard>
  )
}

export default MediaPreview
