function SideBarTooltip({ label, children }) {
  return (
    <span className="sidebar-tooltip">
      {children}
      <span className="sidebar-tooltip-content" role="tooltip">
        {label}
      </span>
    </span>
  )
}

export default SideBarTooltip
