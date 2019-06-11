import React from 'react'

export const BridgeChoose = () => {
  const chooseItems = [
    {
      from: 'DAI',
      to: 'TT-DAI'
    },
    {
      from: 'TT-DAI',
      to: 'DAI'
    },
    {
      from: 'USDT',
      to: 'TT-USDT'
    },
    {
      from: 'TT-USDT',
      to: 'USDT'
    }
  ]

  const chooseLogoClass = (c) => {
    return 'bridge-choose-logo logo-' + c.toLowerCase()
  }

  return (
    <div className="bridge-choose">
      {chooseItems.map((item, index) => {
        return (
          <label key={index} className="bridge-choose-button">
            <input name="choose" type="radio" className="bridge-choose-radio" />
            <span className="bridge-choose-container">
              <span className="bridge-choose-logo-container">
                <span className={chooseLogoClass(item.from)} />
              </span>
              <span className="bridge-choose-text">
                {item.from} <i className="bridge-choose-arrow" /> {item.to}
              </span>
              <span className="bridge-choose-logo-container">
                <span className={chooseLogoClass(item.to)} />
              </span>
            </span>
          </label>
        )
      })}
    </div>
  )
}
