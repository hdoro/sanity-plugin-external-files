import { ToolIcon } from 'sanity-plugin-external-files'
import config from './config'
import Tool from './components/Tool'

export default {
  name: 'firebase-files',
  title: config.toolTitle,
  component: Tool,
  icon: ToolIcon,
}
