import { ToolIcon } from 'sanity-plugin-external-dam'
import config from './config'
import Tool from './components/Tool'

export default {
  name: 'digital-ocean-files',
  title: config.toolTitle,
  component: Tool,
  icon: ToolIcon,
}
