import * as Icons from 'lucide-react'

/**
 * ServiceCard displays a single service as a styled card,
 * with an icon, name, and description.
 *
 * Props:
 * - name: the service name (e.g. "Lathe Machining")
 * - description: short description of the service
 * - iconName: the name of the Lucide icon to display (e.g. "Cog")
 */
function ServiceCard({ name, description, iconName }) {
  // Look up the actual icon component by its name.
  // Falls back to a generic "Wrench" icon if the name doesn't match anything.
  const IconComponent = Icons[iconName] || Icons.Wrench

  return (
    <div className="service-card">
      <div className="service-card-icon">
        <IconComponent size={36} strokeWidth={1.5} />
      </div>
      <h3 className="service-card-title">{name}</h3>
      <p className="service-card-description">{description}</p>
    </div>
  )
}

export default ServiceCard