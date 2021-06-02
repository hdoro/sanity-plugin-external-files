import { ToolIcon } from 'sanity-plugin-external-dam'

import Tool from './components/Tool'
import config from './config'

export default {
  name: config.name,
  title: 'Videos & audio',
  component: Tool,
  icon: ToolIcon,
}
