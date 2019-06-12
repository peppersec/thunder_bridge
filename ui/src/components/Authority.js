import React from 'react'

export const Authority = ({ address, number, logoIndex }) => (
  <div className="authority">
    <span className="authority-number">{number}</span>
    <div className="separator" />
    <span className="authority-address">{address}</span>
  </div>
)
