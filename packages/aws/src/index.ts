import { ToolIcon } from 'sanity-plugin-external-dam'
import config from '../lib/config'
import Tool from './components/Tool'

export default {
  name: 's3-dam',
  title: config.toolTitle,
  component: Tool,
  icon: ToolIcon,
}
