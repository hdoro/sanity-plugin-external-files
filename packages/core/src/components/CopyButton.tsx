import { ClipboardIcon, CopyIcon } from '@sanity/icons'
import { Box, Button, Popover, Text, Tooltip } from '@sanity/ui'
import ClipboardJS from 'clipboard'
import { useEffect, useRef, useState } from 'react'

export default function CopyButton(props: {
  textToCopy: string
  label: string
}) {
  const [hasCopied, setHasCopied] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!btnRef.current) return

    new ClipboardJS(btnRef.current as HTMLButtonElement)
  }, [])

  useEffect(() => {
    if (!hasCopied) return

    const timeout = setTimeout(() => {
      setHasCopied(false)
    }, 2000)

    return () => {
      clearTimeout(timeout)
    }
  }, [hasCopied])

  return (
    <Popover
      content={
        <Box padding={2}>
          <Text>Copied to clipboard</Text>
        </Box>
      }
      open={hasCopied}
    >
      <Button
        icon={ClipboardIcon}
        text={props.label}
        ref={btnRef}
        data-clipboard-text={props.textToCopy}
        onClick={() => {
          setHasCopied(true)
        }}
        mode="ghost"
      />
    </Popover>
  )
}
