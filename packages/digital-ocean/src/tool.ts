import { ToolIcon } from 'sanity-plugin-external-dam'
import config from './config'
import Tool from './components/Tool'

const DigitalOceanFilesTool = {
  name: 'digital-ocean-files',
  title: config.toolTitle,
  component: Tool,
  icon: ToolIcon,
}

export default DigitalOceanFilesTool