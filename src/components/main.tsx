import React from 'react'

function Main({children, className}: {children: React.ReactNode, className?: string}) {
  return (
    <section className={`flex flex-col justify-start items-stretch gap-5 ${className || ''}`}>
        {children}
    </section>
  )
}

export default Main