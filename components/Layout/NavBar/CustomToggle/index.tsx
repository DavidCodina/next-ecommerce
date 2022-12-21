import React from 'react'
// import styles from './CustomToggle.module.scss'

interface ICustomToggle {
  show: boolean
  toggleCollapse: () => void
}

/* =============================================================================
                                Customtoggle
============================================================================= */

export const CustomToggle = ({ show, toggleCollapse }: ICustomToggle) => {
  return (
    <button
      // For the moment I put these styles in the global stylesheet because it's annoying to deal with.
      className={`btn hamburger-container hamburger-squeeze align-self-center user-select-none${
        show ? ' active' : ''
      }`}
      onClick={toggleCollapse}
      // When the hamburger shows up, it ends up pushing the .container-fluid height out from
      // 24px to 30px. By taking it out of the normal document flow, this prevents that.
      style={{ position: 'absolute', top: 5, right: 5, border: 'none' }}
    >
      <div className='hamburger-inner'></div>
    </button>
  )
}
