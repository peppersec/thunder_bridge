import React from 'react'
import { Link } from 'react-router-dom'
import { SocialIcons } from './SocialIcons'

export const Footer = () => (
  <footer className="footer">
    <div className="container">
      <Link to="/" className="footer-logo" />
      <p>Thunder bridge v1.01</p>
      <SocialIcons />
    </div>
  </footer>
)
