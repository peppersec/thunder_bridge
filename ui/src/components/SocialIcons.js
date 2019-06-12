import React from 'react'
import { IconGithub, IconTelegram, IconTwitter, IconReddit, IconMedium, IconDiscord } from './social-icons'

export const SocialIcons = () => {
  const socialItems = [
    {
      icon: <IconTwitter />,
      link: '#'
    },
    {
      icon: <IconReddit />,
      link: '#'
    },
    {
      icon: <IconMedium />,
      link: '#'
    },
    {
      icon: <IconDiscord />,
      link: '#'
    },
    {
      icon: <IconTelegram />,
      link: '#'
    },
    {
      icon: <IconGithub />,
      link: '#'
    }
  ]

  return (
    <div className="social-icons">
      {socialItems.map((item, index) => {
        return (
          <a key={index} href={item.link} target="_blank" className="social-icons-item">
            {item.icon}
          </a>
        )
      })}
    </div>
  )
}
